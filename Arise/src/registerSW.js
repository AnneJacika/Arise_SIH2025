import { registerSW } from 'virtual:pwa-register'

// This is the service worker registration function
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // Show a prompt to the user to refresh the app
        if (confirm('New content available. Reload?')) {
          updateSW(true)
        }
      },
      onOfflineReady() {
        console.log('App ready to work offline')
        // You can show a notification to the user that the app is ready for offline use
      },
    })
  }
}