import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

export async function configureApp(appInstance: express.Express) {
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  const allowedOrigin = process.env.APP_URL || 'http://localhost:3000';

  appInstance.use(helmet({ crossOriginResourcePolicy: false }));
  appInstance.use(cors({ origin: [allowedOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
  appInstance.use(express.json({ limit: '1mb' }));
  appInstance.use(express.urlencoded({ extended: true }));
  appInstance.use('/api', apiRouter);
  appInstance.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('API error:', err);
    res.status(err.statusCode || 500).json({
      error: err.message || 'Internal server error',
      details: err.errors ?? undefined
    });
  });

  if (!isProduction && process.env.NODE_ENV !== 'test') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    appInstance.use(vite.middlewares);
  } else {
    appInstance.use(express.static(path.resolve(__dirname, 'dist')));
    appInstance.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }
}

configureApp(app).catch((err) => {
  console.error('Failed to configure server:', err);
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MSC-IU Full-Stack Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}
