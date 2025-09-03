import { put, head, del } from '@vercel/blob'
import { retryWithBackoff, isRetryableError } from './retry'

/**
 * Create an upload URL for direct client uploads to Vercel Blob
 */
export async function createUploadUrl(filename: string): Promise<{ url: string; token: string }> {
  const response = await fetch('/api/blob/create-upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filename }),
  })

  if (!response.ok) {
    throw new Error(`Failed to create upload URL: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Upload a file buffer to Vercel Blob with retry logic
 */
export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  contentType?: string
): Promise<string> {
  return retryWithBackoff(async () => {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
    })
    return blob.url
  })
}

/**
 * Download a file from Vercel Blob with retry logic for eventual consistency
 */
export async function downloadBuffer(url: string): Promise<Buffer> {
  // Handle base64 data URLs
  if (url.startsWith('data:')) {
    const base64Data = url.split(',')[1]
    return Buffer.from(base64Data, 'base64')
  }
  
  return retryWithBackoff(async () => {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }, {
    maxAttempts: 5, // More attempts for downloads due to eventual consistency
    baseDelay: 500,
  })
}

/**
 * Check if a blob exists with retry logic
 */
export async function blobExists(url: string): Promise<boolean> {
  try {
    await retryWithBackoff(async () => {
      const response = await head(url)
      if (!response) {
        throw new Error('Blob not found')
      }
    })
    return true
  } catch (error) {
    if (isRetryableError(error)) {
      return false
    }
    throw error
  }
}

/**
 * Delete a blob from Vercel Blob storage
 */
export async function deleteBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    // Don't throw on delete errors - blob might already be deleted
    console.warn('Failed to delete blob:', url, error)
  }
}

/**
 * Get blob metadata
 */
export async function getBlobMetadata(url: string) {
  return retryWithBackoff(async () => {
    const response = await head(url)
    if (!response) {
      throw new Error('Blob not found')
    }
    return response
  })
}
