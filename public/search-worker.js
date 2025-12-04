// Search Worker - Handles search requests in a separate thread
// This prevents the main UI thread from blocking during search operations

let searchCache = new Map();
let currentSearchId = 0;

self.onmessage = async function(e) {
  const { type, payload, searchId } = e.data;
  
  try {
    switch (type) {
      case 'SEARCH_PRODUCTS':
        await handleProductSearch(payload, searchId);
        break;
      case 'CLEAR_CACHE':
        searchCache.clear();
        self.postMessage({ type: 'CACHE_CLEARED', searchId });
        break;
      default:
        self.postMessage({ 
          type: 'ERROR', 
          error: 'Unknown message type', 
          searchId 
        });
    }
  } catch (error) {
    self.postMessage({ 
      type: 'ERROR', 
      error: error.message, 
      searchId 
    });
  }
};

async function handleProductSearch(payload, searchId) {
  const { query, limit = 12 } = payload;
  
  // Check cache first
  const cacheKey = `${query}-${limit}`;
  if (searchCache.has(cacheKey)) {
    self.postMessage({
      type: 'SEARCH_SUCCESS',
      data: searchCache.get(cacheKey),
      fromCache: true,
      searchId
    });
    return;
  }
  
  // Send loading state
  self.postMessage({
    type: 'SEARCH_LOADING',
    searchId
  });
  
  try {
    // Construct the search URL
    const baseUrl = self.location.origin;
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (limit) params.append('limit', limit.toString());
    
    const url = `${baseUrl}/api/products/search?${params.toString()}`;
    
    // Perform the fetch in the worker thread
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result (with size limit)
    if (searchCache.size > 50) {
      // Remove oldest entries
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
    searchCache.set(cacheKey, data);
    
    // Send success response
    self.postMessage({
      type: 'SEARCH_SUCCESS',
      data: data,
      fromCache: false,
      searchId
    });
    
  } catch (error) {
    self.postMessage({
      type: 'SEARCH_ERROR',
      error: error.message,
      searchId
    });
  }
}

// Handle worker initialization
self.postMessage({ type: 'WORKER_READY' });
