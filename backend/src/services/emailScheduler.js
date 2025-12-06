import schedule from 'node-schedule';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { generatePDFReport } from './pdfService.js';
let transporter;

const initTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
};
const scheduledJobs = new Map();

export const scheduleReport = async (userId, frequency, email) => {
  const jobKey = `${userId}-${frequency}`;
  if (scheduledJobs.has(jobKey)) {
    scheduledJobs.get(jobKey).cancel();
  }

  let cronExpression;
  switch (frequency) {
    case 'daily':
      cronExpression = '0 9 * * *'; // 9 AM daily
      break;
    case 'weekly':
      cronExpression = '0 9 * * 1'; // 9 AM every Monday
      break;
    case 'monthly':
      cronExpression = '0 9 1 * *'; // 9 AM first day of month
      break;
    default:
      throw new Error('Invalid frequency');
  }

  const job = schedule.scheduleJob(cronExpression, async () => {
    try {
      const user = await User.findById(userId);
      if (!user) return;
      const mockReq = {
        user: { _id: userId, role: user.role },
        query: {},
      };

      const mockRes = {
        status: () => mockRes,
        json: (data) => data,
      };
      const analyticsData = await new Promise((resolve) => {
        getDashboardAnalytics(mockReq, mockRes, () => {});
        resolve(mockRes.json());
      });
      const pdfBuffer = await generatePDFReport(analyticsData.data, user);
      const emailTransporter = initTransporter();
      await emailTransporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email || user.email,
        subject: `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Analytics Report`,
        html: `
          <h2>Your ${frequency} Analytics Report</h2>
          <p>Hello ${user.name},</p>
          <p>Please find attached your ${frequency} analytics report.</p>
          <h3>Quick Summary:</h3>
          <ul>
            <li>Total Tickets: ${analyticsData.data.overview.totalTickets}</li>
            <li>Open Tickets: ${analyticsData.data.overview.openTickets}</li>
            <li>Closed Tickets: ${analyticsData.data.overview.closedTickets}</li>
            <li>Avg Response Time: ${analyticsData.data.overview.avgResponseTime} minutes</li>
          </ul>
          <p>Best regards,<br>Support Team</p>
        `,
        attachments: [
          {
            filename: `analytics-report-${Date.now()}.pdf`,
            content: pdfBuffer,
          },
        ],
      });

      console.log(`Sent ${frequency} report to ${email || user.email}`);
    } catch (error) {
      console.error('Failed to send scheduled report:', error);
    }
  });

  scheduledJobs.set(jobKey, job);
  return job;
};

export const cancelScheduledReport = (userId, frequency) => {
  const jobKey = `${userId}-${frequency}`;
  if (scheduledJobs.has(jobKey)) {
    scheduledJobs.get(jobKey).cancel();
    scheduledJobs.delete(jobKey);
    return true;
  }
  return false;
};

export const getScheduledReports = (userId) => {
  const userJobs = [];
  scheduledJobs.forEach((job, key) => {
    if (key.startsWith(userId)) {
      userJobs.push({
        frequency: key.split('-')[1],
        nextRun: job.nextInvocation(),
      });
    }
  });
  return userJobs;
};
