const CACHE_NAME = 'halalcentral-v1'
const urlsToCache = [
  '/',
  '/restaurants',
  '/mosques',
  '/shops',
  '/institutes',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineOrders())
  }
})

async function syncOfflineOrders() {
  const offlineOrders = await getOfflineOrders()
  
  for (const order of offlineOrders) {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(order),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Remove from offline storage after successful sync
      await removeOfflineOrder(order.id)
    } catch (error) {
      console.error('Failed to sync order:', error)
    }
  }
}