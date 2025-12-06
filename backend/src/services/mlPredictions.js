import Ticket from '../models/Ticket.js';
const calculateSMA = (data, window = 7) => {
  const result = [];
  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / window);
  }
  return result;
};
const calculateEMA = (data, window = 7) => {
  const k = 2 / (window + 1);
  const ema = [data[0]];

  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }

  return ema;
};
const linearRegression = (data) => {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};
const detectAnomalies = (data, threshold = 2) => {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);

  return data.map((value, index) => {
    const zScore = (value - mean) / stdDev;
    return {
      index,
      value,
      zScore,
      isAnomaly: Math.abs(zScore) > threshold,
      severity: Math.abs(zScore) > 3 ? 'high' : Math.abs(zScore) > 2 ? 'medium' : 'low',
    };
  }).filter(item => item.isAnomaly);
};
export const advancedPredict = async (userId, userRole, days = 7) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const query = {
      createdAt: { $gte: ninetyDaysAgo },
      isMerged: false,
    };

    if (userRole === 'user') {
      query.createdBy = userId;
    }

    const historicalData = await Ticket.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    if (historicalData.length < 14) {
      return {
        error: 'Insufficient data for prediction (minimum 14 days required)',
        predictions: [],
      };
    }

    const counts = historicalData.map(d => d.count);
    const sma = calculateSMA(counts, 7);
    const ema = calculateEMA(counts, 7);
    const { slope, intercept } = linearRegression(counts);
    const anomalies = detectAnomalies(counts);
    const predictions = [];
    const today = new Date();
    const lastValue = counts[counts.length - 1];
    const lastSMA = sma[sma.length - 1];
    const lastEMA = ema[ema.length - 1];

    for (let i = 1; i <= days; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      const dayOfWeek = futureDate.getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;
      const linearPred = slope * (counts.length + i) + intercept;
      const smaPred = lastSMA;
      const emaPred = lastEMA;
      const combinedPred = (emaPred * 0.4 + linearPred * 0.3 + smaPred * 0.3) * weekendFactor;
      const variance = counts.reduce((sum, val) => sum + Math.pow(val - lastSMA, 2), 0) / counts.length;
      const confidence = variance < 10 ? 'high' : variance < 25 ? 'medium' : 'low';

      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        predictedCount: Math.max(0, Math.round(combinedPred)),
        confidence,
        methods: {
          sma: Math.round(smaPred * weekendFactor),
          ema: Math.round(emaPred * weekendFactor),
          linear: Math.round(linearPred * weekendFactor),
        },
      });
    }
    const recentTrend = slope > 0.5 ? 'increasing' : slope < -0.5 ? 'decreasing' : 'stable';
    const trendStrength = Math.abs(slope);

    return {
      predictions,
      anomalies: anomalies.map(a => ({
        date: historicalData[a.index]._id,
        value: a.value,
        severity: a.severity,
        zScore: a.zScore.toFixed(2),
      })),
      insights: {
        trend: recentTrend,
        trendStrength: trendStrength.toFixed(2),
        avgDaily: Math.round(counts.reduce((a, b) => a + b, 0) / counts.length),
        volatility: Math.sqrt(variance).toFixed(2),
        dataQuality: counts.length >= 60 ? 'excellent' : counts.length >= 30 ? 'good' : 'fair',
      },
      metadata: {
        historicalDays: counts.length,
        predictionDays: days,
        algorithm: 'Ensemble (SMA + EMA + Linear Regression)',
      },
    };
  } catch (error) {
    console.error('ML Prediction error:', error);
    throw error;
  }
};
export const parseNaturalLanguage = (query) => {
  const nlp = require('compromise');
  const doc = nlp(query.toLowerCase());

  const filters = {
    priority: null,
    status: null,
    timeRange: null,
    department: null,
  };
  if (doc.has('high priority') || doc.has('urgent')) {
    filters.priority = 'High';
  } else if (doc.has('critical')) {
    filters.priority = 'Critical';
  } else if (doc.has('low priority')) {
    filters.priority = 'Low';
  } else if (doc.has('medium priority')) {
    filters.priority = 'Medium';
  }
  if (doc.has('open') || doc.has('active')) {
    filters.status = 'open';
  } else if (doc.has('closed') || doc.has('resolved')) {
    filters.status = 'closed';
  } else if (doc.has('pending')) {
    filters.status = 'pending';
  }
  if (doc.has('today')) {
    filters.timeRange = 'today';
  } else if (doc.has('yesterday')) {
    filters.timeRange = 'yesterday';
  } else if (doc.has('this week') || doc.has('week')) {
    filters.timeRange = 'week';
  } else if (doc.has('last week')) {
    filters.timeRange = 'lastWeek';
  } else if (doc.has('this month') || doc.has('month')) {
    filters.timeRange = 'month';
  } else if (doc.has('last month')) {
    filters.timeRange = 'lastMonth';
  }

  return filters;
};
export const buildQueryFromNL = (filters) => {
  const query = { isMerged: false };
  const now = new Date();

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.timeRange) {
    const startDate = new Date();
    switch (filters.timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: startDate };
        break;
      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: startDate, $lte: endDate };
        break;
      case 'week':
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: startDate };
        break;
      case 'lastWeek':
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
        lastWeekStart.setHours(0, 0, 0, 0);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        lastWeekEnd.setHours(23, 59, 59, 999);
        query.createdAt = { $gte: lastWeekStart, $lte: lastWeekEnd };
        break;
      case 'month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        query.createdAt = { $gte: startDate };
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        query.createdAt = { $gte: lastMonthStart, $lte: lastMonthEnd };
        break;
    }
  }

  return query;
};
