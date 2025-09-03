/**
 * Exponential backoff retry utility for handling Vercel Blob eventual consistency
 */

export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === opts.maxAttempts) {
        throw lastError
      }
      
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      )
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

/**
 * Check if an error is retryable (network, timeout, or blob consistency issues)
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false
  
  const message = error.message?.toLowerCase() || ''
  const code = error.code?.toLowerCase() || ''
  
  // Network errors
  if (code === 'network_error' || code === 'timeout') return true
  
  // Blob consistency issues
  if (message.includes('not found') || message.includes('404')) return true
  if (message.includes('eventual consistency')) return true
  
  // Rate limiting
  if (code === 'rate_limited' || message.includes('rate limit')) return true
  
  return false
}
