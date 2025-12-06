import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import connectDB from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { processEscalations, processAutoClose } from './services/escalationService.js';
import { cleanupExpiredLocks } from './controllers/ticketLockController.js';

import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import escalationRoutes from './routes/escalationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import attachmentRoutes from './routes/attachmentRoutes.js';
import savedReplyRoutes from './routes/savedReplyRoutes.js';
import ticketTemplateRoutes from './routes/ticketTemplateRoutes.js';
import surveyRoutes from './routes/surveyRoutes.js';
import ticketLockRoutes from './routes/ticketLockRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

connectDB();

initializeSocket(httpServer);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/saved-replies', savedReplyRoutes);
app.use('/api/ticket-templates', ticketTemplateRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/ticket-locks', ticketLockRoutes);

app.use(notFound);
app.use(errorHandler);

const escalationInterval = process.env.ESCALATION_CHECK_INTERVAL || '*/5 * * * *';
cron.schedule(escalationInterval, () => {
  processEscalations();
  processAutoClose();
});

cron.schedule('*/2 * * * *', () => {
  cleanupExpiredLocks();
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`WebSocket server initialized for real-time notifications`);
  console.log(`Escalation checks scheduled: ${escalationInterval}`);
});

export default app;
