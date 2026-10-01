import { createApp } from './app.ts';
import { loadConfig } from './config.ts';
import { connect } from './db.ts';

async function main() {
  const config = loadConfig();
  const { client, collections } = await connect(config.mongoUri, config.mongoDb);
  const app = createApp(collections, config);

  const server = app.listen(config.port, () => {
    console.log(`[api] Business Tamil Nadu API listening on http://localhost:${config.port} (${config.env})`);
    if (config.serveStatic) console.log('[api] Serving the built frontend from dist/');
  });

  const shutdown = async (signal: string) => {
    console.log(`[api] ${signal} received, shutting down…`);
    server.close();
    await client.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error: unknown) => {
  console.error(`[api] Failed to start: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
