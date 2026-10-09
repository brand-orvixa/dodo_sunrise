// Root entry point for hosting platforms that expect ./server.js (Hostinger/LiteSpeed
// loads it with require(), so this file must stay CommonJS — no import/export here).
// Mirrors `npm start`: defaults to production, then boots the ESM app in server/.
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
import('./server/index.js').catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
