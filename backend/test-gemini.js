require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key:', apiKey ? 'Present (length: ' + apiKey.length + ')' : 'Missing');
    
    if (!apiKey) {
      console.error('No API key found in environment variables');
      return;
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('Initialized GoogleGenerativeAI client');
    
    // Test with gemini-2.0-flash model
    try {
      console.log('Testing with gemini-2.0-flash model...');
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent('Explain how AI works in a few words');
      console.log('Success! Response:', result.response.text());
    } catch (testError) {
      console.error('Test with gemini-2.0-flash failed:', testError.message);
      
      // Try with gemini-pro as fallback
      try {
        console.log('Testing with gemini-pro model instead...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent('Explain how AI works in a few words');
        console.log('Success with gemini-pro! Response:', result.response.text());
      } catch (fallbackError) {
        console.error('Fallback test also failed:', fallbackError.message);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testGeminiAPI();
