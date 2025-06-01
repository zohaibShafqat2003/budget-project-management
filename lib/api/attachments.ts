import { refreshAccessToken } from "../auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function for making API requests
const apiRequest = async (
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET', 
  body?: any,
  customHeaders: Record<string, string> = {}
) => {
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken') || '';
  }

  const headers: Record<string, string> = {
    ...customHeaders
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body) {
    if (body instanceof FormData) {
      // Don't set Content-Type for FormData, browser will set it with boundary
      config.body = body;
    } else if (method !== 'GET') {
      headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle authentication errors
    if (response.status === 401) {
      try {
        const newToken = await refreshAccessToken();
        if (typeof window !== 'undefined' && newToken?.accessToken) {
          localStorage.setItem('authToken', newToken.accessToken);
          // Retry the request with the new token
          headers['Authorization'] = `Bearer ${newToken.accessToken}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
          return parseResponse(retryResponse);
        }
      } catch (refreshError) {
        throw new Error('Authentication failed. Please log in again.');
      }
    }
    
    return parseResponse(response);
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
};

// Helper to parse API responses
const parseResponse = async (response: Response) => {
  try {
    // Try to parse as JSON first
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Error: ${response.status} ${response.statusText}`,
        status: response.status
      };
    }
    
    return data;
  } catch (error) {
    // If not JSON (like for blobs), handle accordingly
    if (!response.ok) {
      return {
        success: false,
        message: `Error: ${response.status} ${response.statusText}`,
        status: response.status
      };
    }
    
    // For successful non-JSON responses (like blobs)
    if (response.ok) {
      return {
        success: true,
        data: await response.blob(),
        headers: Object.fromEntries(response.headers.entries())
      };
    }
    
    return {
      success: false,
      message: 'Failed to process response',
    };
  }
};

/**
 * Upload a file attachment to a specific entity
 */
export async function uploadAttachment(
  entityType: 'projects' | 'epics' | 'stories' | 'tasks',
  entityId: string,
  file: File, 
  description?: string,
  isPublic: boolean = false
) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (description) {
      formData.append('description', description);
    }
    
    formData.append('isPublic', String(isPublic));
    
    return await apiRequest(
      `/${entityType}/${entityId}/attachments`,
      'POST',
      formData
    );
  } catch (error: any) {
    console.error('Error uploading attachment:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload file',
      error: error.message
    };
  }
}

/**
 * Get all attachments for an entity
 */
export async function getAttachments(
  entityType: 'projects' | 'epics' | 'stories' | 'tasks',
  entityId: string,
  page: number = 1,
  limit: number = 20,
  includeAllVersions: boolean = false
) {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (includeAllVersions) {
      params.append('includeAllVersions', 'true');
    }
    
    return await apiRequest(
      `/${entityType}/${entityId}/attachments?${params.toString()}`
    );
  } catch (error: any) {
    console.error('Error fetching attachments:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch attachments',
      error: error.message
    };
  }
}

/**
 * Get a specific attachment by ID
 */
export async function getAttachment(attachmentId: string) {
  try {
    return await apiRequest(`/attachments/${attachmentId}`);
  } catch (error: any) {
    console.error('Error fetching attachment:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch attachment',
      error: error.message
    };
  }
}

/**
 * Generate a secure download URL for an attachment
 */
export async function generateAttachmentDownloadUrl(attachmentId: string) {
  try {
    const response = await apiRequest(`/attachments/${attachmentId}/generate-url`);
    
    console.log('Generated URL response:', response);
    
    // Ensure we have a valid response with URL
    if (!response.success || !response.data || !response.data.url) {
      throw new Error(response.message || 'Failed to generate download URL - Invalid response');
    }
    
    return response;
  } catch (error: any) {
    console.error('Error generating download URL:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate download URL',
      error: error.message
    };
  }
}

/**
 * Download an attachment using a secure URL
 */
export async function downloadAttachment(attachmentId: string) {
  try {
    // First, get the secure download URL
    const urlResponse = await generateAttachmentDownloadUrl(attachmentId);
    
    if (!urlResponse.success) {
      throw new Error(urlResponse.message || 'Failed to generate download URL');
    }
    
    // Use the generated URL to download the file
    const downloadUrl = urlResponse.data.url;
    
    // Make sure we're using the full URL with the API base
    let fullUrl = downloadUrl;
    if (!downloadUrl.startsWith('http')) {
      fullUrl = `${API_BASE_URL}${downloadUrl}`;
    }
    
    console.log('Downloading from URL:', fullUrl);
    
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    });
    
    if (!response.ok) {
      console.error('Download failed with status:', response.status, response.statusText);
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    return {
      success: true,
      data: blob,
      fileName: urlResponse.data.fileName || 'download',
      fileType: urlResponse.data.fileType || 'application/octet-stream'
    };
  } catch (error: any) {
    console.error('Error downloading attachment:', error);
    return {
      success: false,
      message: error.message || 'Failed to download file',
      error: error.message
    };
  }
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(attachmentId: string) {
  try {
    return await apiRequest(`/attachments/${attachmentId}`, 'DELETE');
  } catch (error: any) {
    console.error('Error deleting attachment:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete attachment',
      error: error.message
    };
  }
}

/**
 * Update attachment details
 */
export async function updateAttachment(
  attachmentId: string,
  updates: {
    description?: string;
    isPublic?: boolean;
  }
) {
  try {
    return await apiRequest(`/attachments/${attachmentId}`, 'PUT', updates);
  } catch (error: any) {
    console.error('Error updating attachment:', error);
    return {
      success: false,
      message: error.message || 'Failed to update attachment',
      error: error.message
    };
  }
}

/**
 * Get all versions of an attachment
 */
export async function getAttachmentVersions(
  attachmentId: string,
  page: number = 1,
  limit: number = 10
) {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return await apiRequest(
      `/attachments/${attachmentId}/versions?${params.toString()}`
    );
  } catch (error: any) {
    console.error('Error fetching attachment versions:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch versions',
      error: error.message
    };
  }
}

/**
 * Upload a new version of an attachment
 */
export async function uploadNewVersion(
  attachmentId: string,
  file: File,
  versionComment?: string
) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (versionComment) {
      formData.append('versionComment', versionComment);
    }
    
    return await apiRequest(
      `/attachments/${attachmentId}/versions`,
      'POST',
      formData
    );
  } catch (error: any) {
    console.error('Error uploading new version:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload new version',
      error: error.message
    };
  }
}

/**
 * Get a preview URL for an attachment
 * This URL should only be used for previewing in the UI, not for downloads
 */
export function getAttachmentPreviewUrl(attachment: any) {
  if (!attachment || !attachment.id) return '';
  
  // Use the downloadUrl property if available (from backend)
  if (attachment.downloadUrl) {
    return `${API_BASE_URL}${attachment.downloadUrl}`;
  }
  
  // Fall back to the generate-url endpoint
  return `${API_BASE_URL}/attachments/${attachment.id}/generate-url`;
}

/**
 * Check if a file type is previewable in the browser
 */
export function isFilePreviewable(fileType: string): boolean {
  const previewableTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    
    // PDFs
    'application/pdf',
    
    // Text
    'text/plain',
    'text/csv',
    'text/html',
    
    // Office (some browsers can preview these)
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  return previewableTypes.includes(fileType);
}

/**
 * Format file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on MIME type
 */
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('audio/')) return 'audio';
  if (fileType.includes('pdf')) return 'file-text';
  if (fileType.includes('word') || fileType.includes('document')) return 'file-text';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'file-spreadsheet';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'file-presentation';
  if (fileType.includes('zip') || fileType.includes('compressed')) return 'archive';
  return 'file';
}

/**
 * Check if file is an image that can be previewed
 */
export function isPreviewableImage(fileType: string): boolean {
  return fileType.startsWith('image/');
}

/**
 * Check if file is a PDF that can be previewed
 */
export function isPreviewablePdf(fileType: string): boolean {
  return fileType === 'application/pdf';
} 