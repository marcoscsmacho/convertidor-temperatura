const inputField = document.getElementById('input-temp');
const fromUnitField = document.getElementById('input-unit');
const toUnitField = document.getElementById('output-unit');
const outputField = document.getElementById('output-temp');
const form = document.getElementById('converter');

function convertTemp(value, fromUnit, toUnit) {
  if (fromUnit === 'c') {
    if (toUnit === 'f') {
      return value * 9 / 5 + 32;
    } else if (toUnit === 'k') {
      return value + 273.15;
    }
    return value;
  }
  if (fromUnit === 'f') {
    if (toUnit === 'c') {
      return (value - 32) * 5 / 9;
    } else if (toUnit === 'k') {
      return (value + 459.67) * 5 / 9;
    }
    return value;
  }
  if (fromUnit === 'k') {
    if (toUnit === 'c') {
      return value - 273.15;
    } else if (toUnit === 'f') {
      return value * 9 / 5 - 459.67;
    }
    return value;
  }
  throw new Error('Invalid unit');
}

form.addEventListener('input', () => {
  const inputTemp = parseFloat(inputField.value);
  const fromUnit = fromUnitField.value;
  const toUnit = toUnitField.value;

  const outputTemp = convertTemp(inputTemp, fromUnit, toUnit);
  outputField.value = (Math.round(outputTemp * 100) / 100) + ' ' + toUnit.toUpperCase();
});

// ===== FUNCIONALIDAD DE NOTIFICACIONES Y SYNC =====

// Solicitar permiso para notificaciones
async function requestNotificationPermission() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Permisos de notificación concedidos');
    } else if (permission === 'denied') {
      console.log('Permisos de notificación denegados');
    }
  }
}

// Detectar cambios en el estado de conexión
window.addEventListener('online', async () => {
  console.log('Conexión restablecida');
  
  // Registrar sincronización en segundo plano
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-temperature-data');
      console.log('Sincronización registrada');
    } catch (error) {
      console.error('Error al registrar sincronización:', error);
    }
  }
});

window.addEventListener('offline', () => {
  console.log('Conexión perdida - trabajando en modo offline');
});

// Inicializar cuando carga la página
window.addEventListener('load', async () => {
  // Solicitar permisos de notificación después de 3 segundos
  setTimeout(() => {
    requestNotificationPermission();
  }, 3000);
  
  // Mostrar estado actual de conexión
  if (!navigator.onLine) {
    console.log('Iniciando en modo offline');
  }
});