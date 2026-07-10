const POLL_INTERVAL = 60000;

console.log(`[Worker] VisionPAE Worker iniciado — polling cada ${POLL_INTERVAL}ms`);

setInterval(async () => {
  try {
    console.log(`[Worker] Heartbeat: ${new Date().toISOString()}`);
  } catch (err) {
    console.error('[Worker] Error:', err);
  }
}, POLL_INTERVAL);
