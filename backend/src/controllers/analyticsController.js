import Ticket from '../models/Ticket.js';
import Reply from '../models/Reply.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Status from '../models/Status.js';

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, department, agent } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    const query = { isMerged: false, ...dateFilter };
    if (department) query.department = department;
    if (agent) query.assignedTo = agent;
    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    }
    const tickets = await Ticket.find(query)
      .populate('status')
      .populate('department')
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status?.includeInActive).length;
    const closedTickets = tickets.filter(t => !t.status?.includeInActive).length;
    const closedWithTime = tickets.filter(t => t.closedAt);
    const avgResolutionTime = closedWithTime.length > 0
      ? closedWithTime.reduce((sum, t) => {
          const diff = new Date(t.closedAt) - new Date(t.createdAt);
          return sum + diff;
        }, 0) / closedWithTime.length
      : 0;
    const replies = await Reply.find({
      ticket: { $in: tickets.map(t => t._id) }
    }).sort({ createdAt: 1 });

    const firstReplies = new Map();
    replies.forEach(reply => {
      if (!firstReplies.has(reply.ticket.toString())) {
        firstReplies.set(reply.ticket.toString(), reply.createdAt);
      }
    });

    let totalResponseTime = 0;
    let responseCount = 0;
    tickets.forEach(ticket => {
      const firstReply = firstReplies.get(ticket._id.toString());
      if (firstReply) {
        totalResponseTime += new Date(firstReply) - new Date(ticket.createdAt);
        responseCount++;
      }
    });

    const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
    const priorityBreakdown = {
      Low: tickets.filter(t => t.priority === 'Low').length,
      Medium: tickets.filter(t => t.priority === 'Medium').length,
      High: tickets.filter(t => t.priority === 'High').length,
      Critical: tickets.filter(t => t.priority === 'Critical').length,
    };
    const statusBreakdown = {};
    tickets.forEach(ticket => {
      const statusTitle = ticket.status?.title || 'Unknown';
      statusBreakdown[statusTitle] = (statusBreakdown[statusTitle] || 0) + 1;
    });
    const departmentBreakdown = {};
    tickets.forEach(ticket => {
      const deptName = ticket.department?.name || 'Unknown';
      departmentBreakdown[deptName] = (departmentBreakdown[deptName] || 0) + 1;
    });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ticketsOverTime = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          isMerged: false,
          ...(req.user.role === 'user' ? { createdBy: req.user._id } : {}),
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    let agentPerformance = [];
    if (req.user.role !== 'user') {
      const agents = await User.find({ role: { $in: ['admin', 'agent'] } });

      agentPerformance = await Promise.all(
        agents.map(async (agent) => {
          const agentTickets = tickets.filter(
            t => t.assignedTo?._id?.toString() === agent._id.toString()
          );

          const resolved = agentTickets.filter(t => !t.status?.includeInActive).length;
          const avgTime = agentTickets.filter(t => t.closedAt).length > 0
            ? agentTickets
                .filter(t => t.closedAt)
                .reduce((sum, t) => sum + (new Date(t.closedAt) - new Date(t.createdAt)), 0) /
              agentTickets.filter(t => t.closedAt).length
            : 0;

          return {
            name: agent.name,
            totalAssigned: agentTickets.length,
            resolved,
            pending: agentTickets.length - resolved,
            avgResolutionTime: avgTime,
          };
        })
      );
    }
    const recentTickets = tickets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(t => ({
        id: t._id,
        ticketNumber: t.ticketNumber,
        title: t.title,
        status: t.status?.title,
        priority: t.priority,
        createdAt: t.createdAt,
        createdBy: t.createdBy?.name,
      }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalTickets,
          openTickets,
          closedTickets,
          avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60 * 60)), // hours
          avgResponseTime: Math.round(avgResponseTime / (1000 * 60)), // minutes
        },
        priorityBreakdown,
        statusBreakdown,
        departmentBreakdown,
        ticketsOverTime,
        agentPerformance,
        recentTickets,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    next(error);
  }
};

export const getTicketTrends = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {
      createdAt: { $gte: startDate },
      isMerged: false,
    };

    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    }

    const trends = await Ticket.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            priority: '$priority',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentStats = async (req, res, next) => {
  try {
    const departments = await Department.find();

    const stats = await Promise.all(
      departments.map(async (dept) => {
        const query = {
          department: dept._id,
          isMerged: false,
        };

        if (req.user.role === 'user') {
          query.createdBy = req.user._id;
        }

        const tickets = await Ticket.find(query).populate('status');
        const open = tickets.filter(t => t.status?.includeInActive).length;
        const closed = tickets.filter(t => !t.status?.includeInActive).length;

        return {
          department: dept.name,
          total: tickets.length,
          open,
          closed,
          avgResolutionTime: tickets.filter(t => t.closedAt).length > 0
            ? Math.round(
                tickets
                  .filter(t => t.closedAt)
                  .reduce((sum, t) => sum + (new Date(t.closedAt) - new Date(t.createdAt)), 0) /
                  tickets.filter(t => t.closedAt).length /
                  (1000 * 60 * 60)
              )
            : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentStats = async (req, res, next) => {
  try {
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const agents = await User.find({ role: { $in: ['admin', 'agent'] } });

    const stats = await Promise.all(
      agents.map(async (agent) => {
        const tickets = await Ticket.find({
          assignedTo: agent._id,
          isMerged: false,
        }).populate('status');

        const replies = await Reply.countDocuments({ user: agent._id });
        const resolved = tickets.filter(t => !t.status?.includeInActive).length;

        return {
          id: agent._id,
          name: agent.name,
          email: agent.email,
          role: agent.role,
          totalAssigned: tickets.length,
          resolved,
          pending: tickets.length - resolved,
          totalReplies: replies,
          avgResolutionTime: tickets.filter(t => t.closedAt).length > 0
            ? Math.round(
                tickets
                  .filter(t => t.closedAt)
                  .reduce((sum, t) => sum + (new Date(t.closedAt) - new Date(t.createdAt)), 0) /
                  tickets.filter(t => t.closedAt).length /
                  (1000 * 60 * 60)
              )
            : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const exportAnalytics = async (req, res, next) => {
  try {
    const { format = 'json', startDate, endDate, department } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const query = { isMerged: false, ...dateFilter };
    if (department) query.department = department;

    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    }

    const tickets = await Ticket.find(query)
      .populate('status', 'title')
      .populate('department', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csvHeader = 'Ticket Number,Title,Status,Priority,Department,Assigned To,Created By,Created At,Closed At\n';
      const csvRows = tickets.map(t =>
        `"${t.ticketNumber}","${t.title}","${t.status?.title || ''}","${t.priority}","${t.department?.name || ''}","${t.assignedTo?.name || 'Unassigned'}","${t.createdBy?.name || ''}","${new Date(t.createdAt).toISOString()}","${t.closedAt ? new Date(t.closedAt).toISOString() : ''}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.csv`);
      res.send(csvHeader + csvRows);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.json`);
      res.json({
        success: true,
        exportDate: new Date().toISOString(),
        filters: { startDate, endDate, department },
        totalRecords: tickets.length,
        data: tickets,
      });
    }
  } catch (error) {
    next(error);
  }
};

import { generatePDFReport } from '../services/pdfService.js';
import { scheduleReport, cancelScheduledReport, getScheduledReports } from '../services/emailScheduler.js';
import { advancedPredict, parseNaturalLanguage, buildQueryFromNL } from '../services/mlPredictions.js';

export const getPredictiveAnalytics = async (req, res, next) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const query = {
      createdAt: { $gte: ninetyDaysAgo },
      isMerged: false,
    };

    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    }
    const historicalData = await Ticket.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgPriority: {
            $avg: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'Low'] }, then: 1 },
                  { case: { $eq: ['$priority', 'Medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'High'] }, then: 3 },
                  { case: { $eq: ['$priority', 'Critical'] }, then: 4 },
                ],
                default: 2,
              },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const recentData = historicalData.slice(-7);
    const avgTicketsPerDay = recentData.reduce((sum, d) => sum + d.count, 0) / recentData.length;
    const predictions = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const dayOfWeek = futureDate.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;

      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        predictedCount: Math.round(avgTicketsPerDay * weekendFactor),
        confidence: 'medium',
      });
    }
    const firstWeek = historicalData.slice(0, 7);
    const lastWeek = historicalData.slice(-7);
    const firstWeekAvg = firstWeek.reduce((sum, d) => sum + d.count, 0) / firstWeek.length;
    const lastWeekAvg = lastWeek.reduce((sum, d) => sum + d.count, 0) / lastWeek.length;
    const trend = lastWeekAvg > firstWeekAvg ? 'increasing' : lastWeekAvg < firstWeekAvg ? 'decreasing' : 'stable';
    const trendPercentage = firstWeekAvg > 0 ? Math.round(((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        historical: historicalData,
        predictions,
        insights: {
          avgTicketsPerDay: Math.round(avgTicketsPerDay),
          trend,
          trendPercentage,
          totalLast90Days: historicalData.reduce((sum, d) => sum + d.count, 0),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generatePDF = async (req, res, next) => {
  try {
    const params = new URLSearchParams();
    if (req.query.department) params.append('department', req.query.department);
    if (req.query.startDate) params.append('startDate', req.query.startDate);
    if (req.query.endDate) params.append('endDate', req.query.endDate);
    const mockReq = { ...req, query: Object.fromEntries(params) };
    let analyticsData;

    await getDashboardAnalytics(mockReq, {
      status: () => ({ json: (data) => { analyticsData = data.data; } }),
      json: (data) => { analyticsData = data.data; },
    }, next);

    const pdfBuffer = await generatePDFReport(analyticsData, req.user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-report-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    next(error);
  }
};

export const scheduleEmailReport = async (req, res, next) => {
  try {
    const { frequency, email } = req.body;

    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency. Use: daily, weekly, or monthly' });
    }

    await scheduleReport(req.user._id, frequency, email);

    res.status(200).json({
      success: true,
      message: `${frequency} report scheduled successfully`,
      nextRun: new Date(), // Will be calculated by scheduler
    });
  } catch (error) {
    next(error);
  }
};

export const cancelEmailReport = async (req, res, next) => {
  try {
    const { frequency } = req.body;
    const cancelled = cancelScheduledReport(req.user._id, frequency);

    if (cancelled) {
      res.status(200).json({
        success: true,
        message: 'Scheduled report cancelled',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No scheduled report found',
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getScheduledEmailReports = async (req, res, next) => {
  try {
    const reports = getScheduledReports(req.user._id);

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdvancedMLPredictions = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const predictions = await advancedPredict(req.user._id, req.user.role, parseInt(days));

    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};

export const naturalLanguageQuery = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }
    const filters = parseNaturalLanguage(query);
    const mongoQuery = buildQueryFromNL(filters);
    if (req.user.role === 'user') {
      mongoQuery.createdBy = req.user._id;
    }
    const tickets = await Ticket.find(mongoQuery)
      .populate('status', 'title color')
      .populate('department', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      query: query,
      parsedFilters: filters,
      totalResults: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error('NL Query error:', error);
    next(error);
  }
};
