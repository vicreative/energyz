import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';

import { openAPIRouter } from '@/api-docs/openAPIRouter';
import { applicationRouter } from '@/api/application/applicationRouter';
import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import errorHandler from '@/shared/middleware/errorHandler';
import rateLimiter from '@/shared/middleware/rateLimiter';
import requestLogger from '@/shared/middleware/requestLogger';
import { env } from '@/shared/utils/envConfig';
import { metricRouter } from './api/metrics/metricRouter';
import { Histogram, Registry } from 'prom-client';
import { collectDefaultMetrics } from 'prom-client';

const logger = pino({ name: 'server start' });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Prometheus metrics setup
const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

register.registerMetric(httpRequestDuration);

// Middleware to record request durations
app.use((req: Request, res: Response, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode.toString() });
  });
  next();
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use('/health-check', healthCheckRouter);
app.use('/applications', applicationRouter);
app.use('/metrics', metricRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger, register };
