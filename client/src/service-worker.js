self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing Service Worker ...", event);
  self.skipWaiting(); // Neuen sw benutzne
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating Service Worker ....", event);
  return self.clients.claim();
});

// Pause Timer
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data);

  if (event.data && event.data.type === "TIMER_STARTED") {
    const { remainingTime } = event.data;
    console.log(
      `[Service Worker] Timer started with ${remainingTime} seconds remaining.`
    );
  }
});
