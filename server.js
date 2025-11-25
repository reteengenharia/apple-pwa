import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ 
  logger: {
    level: 'info'
  }
});

await fastify.register(fastifyCors);

await fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'dist'),
  prefix: '/'
});

fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
}));

fastify.get('/manifest.json', async (request, reply) => {
  reply.header('Content-Type', 'application/manifest+json');
  return reply.sendFile('manifest.json');
});

fastify.get('/service-worker.js', async (request, reply) => {
  reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  reply.header('Content-Type', 'application/javascript');
  return reply.sendFile('service-worker.js');
});

fastify.setNotFoundHandler(async (request, reply) => {
  return reply.sendFile('index.html');
});

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '127.0.0.1';
    
    await fastify.listen({ port, host });
    
    console.log(`
╔════════════════════════════════════════╗
║  ✅ Servidor PWA Iniciado              ║
╠════════════════════════════════════════╣
║  🌐 URL: http://${host}:${port}
║  📊 Health: http://${host}:${port}/health
║  🛑 Pressione Ctrl+C para parar        ║
╚════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
