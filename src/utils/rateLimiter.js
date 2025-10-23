/**
 * Simple Rate Limiter for API calls
 * Prevents excessive API requests
 */

class RateLimiter {
  constructor(maxRequests = 60, timeWindow = 60000) {
    this.maxRequests = maxRequests; // Max requests
    this.timeWindow = timeWindow;   // Time window in ms (default: 1 minute)
    this.requests = new Map();      // Track requests by endpoint
  }

  /**
   * Check if request is allowed
   * @param {string} endpoint - API endpoint identifier
   * @returns {boolean} - True if allowed, false if rate limited
   */
  isAllowed(endpoint) {
    const now = Date.now();
    
    // Get or create request history for this endpoint
    if (!this.requests.has(endpoint)) {
      this.requests.set(endpoint, []);
    }
    
    const history = this.requests.get(endpoint);
    
    // Remove old requests outside time window
    const validRequests = history.filter(time => now - time < this.timeWindow);
    this.requests.set(endpoint, validRequests);
    
    // Check if limit exceeded
    if (validRequests.length >= this.maxRequests) {
      console.warn(`⚠️ Rate limit exceeded for ${endpoint}`);
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(endpoint, validRequests);
    
    return true;
  }

  /**
   * Get remaining requests for an endpoint
   * @param {string} endpoint - API endpoint identifier
   * @returns {number} - Number of remaining requests
   */
  getRemaining(endpoint) {
    const now = Date.now();
    const history = this.requests.get(endpoint) || [];
    const validRequests = history.filter(time => now - time < this.timeWindow);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Clear all rate limit data
   */
  clear() {
    this.requests.clear();
  }

  /**
   * Clear rate limit for specific endpoint
   * @param {string} endpoint - API endpoint identifier
   */
  clearEndpoint(endpoint) {
    this.requests.delete(endpoint);
  }
}

// Create singleton instance
// 60 requests per minute (1 per second average)
const rateLimiter = new RateLimiter(60, 60000);

/**
 * Wrapper for fetch with rate limiting
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function rateLimitedFetch(url, options = {}) {
  // Extract endpoint identifier (domain + pathname)
  const endpoint = new URL(url).origin;
  
  // Check rate limit
  if (!rateLimiter.isAllowed(endpoint)) {
    throw new Error(`Rate limit exceeded for ${endpoint}. Please try again later.`);
  }
  
  // Make the request
  return fetch(url, options);
}

export default rateLimiter;
