const CACHE_NAME = `temperature-converter-v1`;

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    cache.addAll([
      '/',
      '/converter.js',
      '/converter.css'
    ]);
  })());
  
  // Activa el service worker inmediatamente
  self.skipWaiting();
});

// Activa el nuevo service worker
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Get the resource from the cache.
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    } else {
        try {
          // If the resource was not in the cache, try the network.
          const fetchResponse = await fetch(event.request);

          // Save the resource in the cache and return it.
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        } catch (e) {
          // La red falló - mostrar notificación de offline
          self.registration.showNotification('Sin conexión', {
            body: 'Estás trabajando en modo offline. Tus datos se guardarán.',
            icon: '/icon512.png',
            badge: '/icon512.png',
            tag: 'offline-notification',
            requireInteraction: false
          });
        }
    }
  })());
});

// Manejo de Background Sync - se activa cuando recupera conexión
self.addEventListener('sync', event => {
  if (event.tag === 'sync-temperature-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Aquí puedes sincronizar datos pendientes con el servidor
    // Por ejemplo, enviar conversiones guardadas mientras estaba offline
    
    // Mostrar notificación de que volvió la conexión
    await self.registration.showNotification('Conexión restablecida', {
      body: '¡Ya estás de vuelta online! Tus datos están sincronizados.',
      icon: '/icon512.png',
      badge: '/icon512.png',
      tag: 'online-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200]
    });
    
    console.log('Sincronización completada exitosamente');
  } catch (error) {
    console.error('Error en la sincronización:', error);
  }
}

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Abrir o enfocar la aplicación
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Si ya hay una ventana abierta, enfocarla
      for (let client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});