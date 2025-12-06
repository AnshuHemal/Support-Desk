import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  RefreshCw,
  Sparkles,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchDepartments();
    fetchPredictions();
  }, [dateRange, selectedDepartment]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchAnalytics();
        fetchPredictions();
      }, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh, dateRange, selectedDepartment]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const { data } = await api.get(`/analytics/dashboard?${params}`);
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const { data } = await api.get('/analytics/predictions');
      setPredictions(data.data);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    }
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      params.append('format', format);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);

      const response = await api.get(`/analytics/export?${params}`, {
        responseType: format === 'csv' ? 'blob' : 'json',
      });

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `analytics-${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast.success(`Exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) return null;

  const { overview, priorityBreakdown, statusBreakdown, ticketsOverTime } = analytics;
  const priorityData = Object.entries(priorityBreakdown).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = Object.entries(statusBreakdown).map(([name, value]) => ({
    name,
    value,
  }));
  const combinedTimeData = [
    ...ticketsOverTime.map(item => ({
      date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: item.count,
      predicted: null,
    })),
    ...(predictions?.predictions || []).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      actual: null,
      predicted: item.predictedCount,
    })),
  ];

  return (
    <div>
      {}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>

        <div className="flex flex-wrap gap-3">
          {}
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-muted-foreground" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-3 py-2 border-2 border-border rounded-md bg-background text-foreground text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-3 py-2 border-2 border-border rounded-md bg-background text-foreground text-sm"
            />
          </div>

          {}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border-2 border-border rounded-md bg-background text-foreground"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>

          {}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
              autoRefresh
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
            Auto Refresh
          </button>

          {}
          <div className="relative group">
            <button
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Download size={16} />
              Export
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-accent text-left transition-colors"
              >
                <FileSpreadsheet size={16} />
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-accent text-left transition-colors"
              >
                <FileText size={16} />
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      {predictions && (
        <div className="bg-linear-to-r from-primary/10 to-chart-2/10 p-6 rounded-lg border border-primary/20 mb-8">
          <div className="flex items-start gap-4">
            <Sparkles size={24} className="text-primary mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">Predictive Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Expected Daily Average</p>
                  <p className="text-2xl font-bold text-foreground">
                    {predictions.insights.avgTicketsPerDay} tickets
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <div className="flex items-center gap-2">
                    {predictions.insights.trend === 'increasing' ? (
                      <TrendingUp className="text-destructive" size={20} />
                    ) : predictions.insights.trend === 'decreasing' ? (
                      <TrendingDown className="text-chart-1" size={20} />
                    ) : null}
                    <p className="text-2xl font-bold text-foreground capitalize">
                      {predictions.insights.trend}
                    </p>
                    <span className={`text-sm ${
                      predictions.insights.trendPercentage > 0 ? 'text-destructive' : 'text-chart-1'
                    }`}>
                      {predictions.insights.trendPercentage > 0 ? '+' : ''}
                      {predictions.insights.trendPercentage}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last 90 Days Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    {predictions.insights.totalLast90Days} tickets
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {}
        <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Tickets Timeline & 7-Day Forecast
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={combinedTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.6}
                name="Actual Tickets"
              />
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="hsl(var(--chart-3))"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.3}
                strokeDasharray="5 5"
                name="Predicted Tickets"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Tickets</p>
          <p className="text-3xl font-bold text-foreground">{overview.totalTickets}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-sm text-muted-foreground mb-2">Open Tickets</p>
          <p className="text-3xl font-bold text-chart-3">{overview.openTickets}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-sm text-muted-foreground mb-2">Closed Tickets</p>
          <p className="text-3xl font-bold text-chart-1">{overview.closedTickets}</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-sm text-muted-foreground mb-2">Avg Response</p>
          <p className="text-3xl font-bold text-foreground">{overview.avgResponseTime}m</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-sm text-muted-foreground mb-2">Avg Resolution</p>
          <p className="text-3xl font-bold text-foreground">{overview.avgResolutionTime}h</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
