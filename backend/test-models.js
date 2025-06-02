require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const geminiApiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    console.log('API Key:', geminiApiKey ? 'Present' : 'Missing');
    
    if (!geminiApiKey) {
      console.error('No API key found in environment variables');
      return;
    }
    
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    console.log('Initialized GoogleGenerativeAI client');
    
    try {
      const models = await genAI.listModels();
      console.log('Available models:');
      models.forEach(model => {
        console.log(`- ${model.name}`);
      });
    } catch (error) {
      console.error('Error listing models:', error.message);
      
      // Try a simple generation with a known model as a test
      try {
        console.log('Testing with gemini-pro model...');
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent('Say hello world');
        console.log('Test result:', result.response.text());
      } catch (testError) {
        console.error('Test generation failed:', testError.message);
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

listModels();
