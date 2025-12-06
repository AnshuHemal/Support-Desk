import mongoose from 'mongoose';
import Survey from '../models/Survey.js';
import Ticket from '../models/Ticket.js';
import { logAudit } from '../utils/auditLogger.js';
import crypto from 'crypto';

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const createSurvey = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const userId = req.user.id;

    const ticket = await Ticket.findById(ticketId)
      .populate('createdBy')
      .populate('assignedTo')
      .populate('department');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const existingSurvey = await Survey.findOne({ ticket: ticketId });
    if (existingSurvey) {
      return res.status(400).json({ message: 'Survey already exists for this ticket' });
    }

    if (ticket.status?.name?.toLowerCase() !== 'closed' &&
        ticket.status?.name?.toLowerCase() !== 'resolved') {
      return res.status(400).json({ message: 'Survey can only be created for closed/resolved tickets' });
    }

    const survey = new Survey({
      ticket: ticketId,
      customer: ticket.createdBy._id,
      agent: ticket.assignedTo?._id || userId,
      department: ticket.department?._id,
      token: generateToken(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    await survey.save();

    await logAudit(userId, 'CREATE', 'Survey', survey._id, null, {
      ticket: ticketId,
    });

    res.status(201).json(survey);
  } catch (error) {
    console.error('Error creating survey:', error);
    res.status(500).json({ message: 'Error creating survey' });
  }
};

export const getSurveyByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const survey = await Survey.findOne({ token })
      .populate('ticket', 'ticketNumber title')
      .populate('agent', 'name')
      .populate('customer', 'name email');

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.isExpired() && survey.status === 'pending') {
      survey.status = 'expired';
      await survey.save();
    }

    if (survey.status === 'pending') {
      return res.json({
        _id: survey._id,
        ticket: survey.ticket,
        agent: survey.agent,
        status: survey.status,
        expiresAt: survey.expiresAt,
      });
    }

    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ message: 'Error fetching survey' });
  }
};

export const submitSurvey = async (req, res) => {
  try {
    const { token } = req.params;
    const { ratings, feedback, npsScore, ipAddress, userAgent } = req.body;

    const survey = await Survey.findOne({ token });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.status === 'completed') {
      return res.status(400).json({ message: 'Survey already completed' });
    }

    if (survey.isExpired()) {
      survey.status = 'expired';
      await survey.save();
      return res.status(400).json({ message: 'Survey has expired' });
    }

    if (!ratings?.overall || ratings.overall < 1 || ratings.overall > 5) {
      return res.status(400).json({ message: 'Overall rating is required (1-5)' });
    }

    survey.ratings = {
      overall: ratings.overall,
      responseTime: ratings.responseTime,
      professionalism: ratings.professionalism,
      knowledgeability: ratings.knowledgeability,
      problemResolution: ratings.problemResolution,
    };

    survey.feedback = {
      positive: feedback?.positive,
      improvement: feedback?.improvement,
      general: feedback?.general,
    };

    if (npsScore !== undefined) {
      survey.npsScore = npsScore;
      survey.calculateNPS();
    }

    survey.ipAddress = ipAddress;
    survey.userAgent = userAgent;

    await survey.complete();

    res.json({
      message: 'Thank you for your feedback!',
      survey: {
        _id: survey._id,
        status: survey.status,
        completedAt: survey.completedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting survey:', error);
    res.status(500).json({ message: 'Error submitting survey' });
  }
};

export const getSurveys = async (req, res) => {
  try {
    const { status, agent, department, startDate, endDate, minRating, maxRating, ticket } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {};

    if (ticket) {
      query.ticket = ticket;
    }

    if (status) {
      query.status = status;
    }

    if (agent) {
      query.agent = agent;
    } else if (userRole === 'agent') {

      query.agent = userId;
    }

    if (department) {
      query.department = department;
    }

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    if (minRating || maxRating) {
      query['ratings.overall'] = {};
      if (minRating) query['ratings.overall'].$gte = parseInt(minRating);
      if (maxRating) query['ratings.overall'].$lte = parseInt(maxRating);
    }

    const surveys = await Survey.find(query)
      .populate('ticket', 'ticketNumber title')
      .populate('customer', 'name email')
      .populate('agent', 'name email')
      .populate('department', 'name')
      .sort({ completedAt: -1 })
      .lean();

    res.json(surveys);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ message: 'Error fetching surveys' });
  }
};

export const getSurveyAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, agent, department } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let matchQuery = { status: 'completed' };

    if (startDate || endDate) {
      matchQuery.completedAt = {};
      if (startDate) matchQuery.completedAt.$gte = new Date(startDate);
      if (endDate) matchQuery.completedAt.$lte = new Date(endDate);
    }

    if (agent) {
      matchQuery.agent = mongoose.Types.ObjectId(agent);
    } else if (userRole === 'agent') {
      matchQuery.agent = mongoose.Types.ObjectId(userId);
    }

    if (department) {
      matchQuery.department = mongoose.Types.ObjectId(department);
    }

    const analytics = await Survey.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSurveys: { $sum: 1 },
          averageOverall: { $avg: '$ratings.overall' },
          averageResponseTime: { $avg: '$ratings.responseTime' },
          averageProfessionalism: { $avg: '$ratings.professionalism' },
          averageKnowledgeability: { $avg: '$ratings.knowledgeability' },
          averageProblemResolution: { $avg: '$ratings.problemResolution' },
          promoters: {
            $sum: { $cond: [{ $eq: ['$npsCategory', 'promoter'] }, 1, 0] },
          },
          passives: {
            $sum: { $cond: [{ $eq: ['$npsCategory', 'passive'] }, 1, 0] },
          },
          detractors: {
            $sum: { $cond: [{ $eq: ['$npsCategory', 'detractor'] }, 1, 0] },
          },
          rating5: {
            $sum: { $cond: [{ $eq: ['$ratings.overall', 5] }, 1, 0] },
          },
          rating4: {
            $sum: { $cond: [{ $eq: ['$ratings.overall', 4] }, 1, 0] },
          },
          rating3: {
            $sum: { $cond: [{ $eq: ['$ratings.overall', 3] }, 1, 0] },
          },
          rating2: {
            $sum: { $cond: [{ $eq: ['$ratings.overall', 2] }, 1, 0] },
          },
          rating1: {
            $sum: { $cond: [{ $eq: ['$ratings.overall', 1] }, 1, 0] },
          },
        },
      },
    ]);

    if (analytics.length === 0) {
      return res.json({
        totalSurveys: 0,
        averageRatings: {},
        nps: {},
        ratingDistribution: {},
      });
    }

    const data = analytics[0];

    const npsScore =
      data.totalSurveys > 0
        ? Math.round(
            ((data.promoters - data.detractors) / data.totalSurveys) * 100
          )
        : 0;

    const agentPerformance = await Survey.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$agent',
          totalSurveys: { $sum: 1 },
          averageRating: { $avg: '$ratings.overall' },
          promoters: {
            $sum: { $cond: [{ $eq: ['$npsCategory', 'promoter'] }, 1, 0] },
          },
          detractors: {
            $sum: { $cond: [{ $eq: ['$npsCategory', 'detractor'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent',
        },
      },
      { $unwind: '$agent' },
      {
        $project: {
          agentId: '$_id',
          agentName: '$agent.name',
          agentEmail: '$agent.email',
          totalSurveys: 1,
          averageRating: 1,
          nps: {
            $cond: [
              { $gt: ['$totalSurveys', 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $subtract: ['$promoters', '$detractors'] },
                      '$totalSurveys',
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { averageRating: -1 } },
    ]);

    res.json({
      totalSurveys: data.totalSurveys,
      averageRatings: {
        overall: parseFloat(data.averageOverall?.toFixed(2)) || 0,
        responseTime: parseFloat(data.averageResponseTime?.toFixed(2)) || 0,
        professionalism: parseFloat(data.averageProfessionalism?.toFixed(2)) || 0,
        knowledgeability: parseFloat(data.averageKnowledgeability?.toFixed(2)) || 0,
        problemResolution: parseFloat(data.averageProblemResolution?.toFixed(2)) || 0,
      },
      nps: {
        score: npsScore,
        promoters: data.promoters,
        passives: data.passives,
        detractors: data.detractors,
      },
      ratingDistribution: {
        5: data.rating5,
        4: data.rating4,
        3: data.rating3,
        2: data.rating2,
        1: data.rating1,
      },
      agentPerformance,
    });
  } catch (error) {
    console.error('Error fetching survey analytics:', error);
    res.status(500).json({ message: 'Error fetching survey analytics' });
  }
};

export const getSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const survey = await Survey.findById(id)
      .populate('ticket')
      .populate('customer', 'name email')
      .populate('agent', 'name email')
      .populate('department', 'name');

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (userRole === 'agent' && survey.agent._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this survey' });
    }

    res.json(survey);
  } catch (error) {
    console.error('Error fetching survey:', error);
    res.status(500).json({ message: 'Error fetching survey' });
  }
};

export const deleteSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const survey = await Survey.findByIdAndDelete(id);

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    await logAudit(userId, 'DELETE', 'Survey', survey._id, survey.toObject(), null);

    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ message: 'Error deleting survey' });
  }
};
