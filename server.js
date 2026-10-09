// Root entry point for hosting platforms that expect ./server.js.
// Mirrors `npm start`: defaults to production, then boots server/index.js.
process.env.NODE_ENV ||= 'production';
await import('./server/index.js');
