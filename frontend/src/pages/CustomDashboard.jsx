import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Plus,
  X,
  Save,
  RotateCcw,
  Download,
  Mail,
  Sparkles,
  MessageSquare,
  GripVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomDashboard = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [mlPredictions, setMlPredictions] = useState(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [nlQuery, setNlQuery] = useState('');
  const [nlResults, setNlResults] = useState(null);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const availableWidgets = [
    { id: 'overview', name: 'Overview Stats', type: 'stats' },
    { id: 'priority-pie', name: 'Priority Distribution', type: 'chart' },
    { id: 'status-bar', name: 'Status Breakdown', type: 'chart' },
    { id: 'timeline', name: 'Tickets Timeline', type: 'chart' },
    { id: 'predictions', name: 'ML Predictions', type: 'chart' },
    { id: 'anomalies', name: 'Anomaly Detection', type: 'list' },
    { id: 'nl-search', name: 'Natural Language Search', type: 'search' },
    { id: 'scheduled-reports', name: 'Email Reports', type: 'settings' },
  ];

  useEffect(() => {
    loadDashboard();
    fetchAnalytics();
    fetchMLPredictions();
    fetchScheduledReports();
  }, []);

  const loadDashboard = () => {
    const saved = localStorage.getItem(`dashboard-${user._id}`);
    if (saved) {
      const savedWidgets = JSON.parse(saved);
      setWidgets(savedWidgets);
    } else {
      const defaultWidgets = ['overview', 'priority-pie', 'timeline'];
      setWidgets(defaultWidgets);
    }
  };

  const saveDashboard = () => {
    localStorage.setItem(
      `dashboard-${user._id}`,
      JSON.stringify(widgets)
    );
    toast.success('Dashboard saved!');
  };

  const resetDashboard = () => {
    localStorage.removeItem(`dashboard-${user._id}`);
    loadDashboard();
    toast.success('Dashboard reset to default');
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/dashboard');
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchMLPredictions = async () => {
    try {
      const { data } = await api.get('/analytics/ml-predictions');
      setMlPredictions(data.data);
    } catch (error) {
      console.error('Failed to fetch ML predictions:', error);
    }
  };

  const fetchScheduledReports = async () => {
    try {
      const { data } = await api.get('/analytics/scheduled-reports');
      setScheduledReports(data.data || []);
    } catch (error) {
      console.error('Failed to fetch scheduled reports:', error);
    }
  };

  const addWidget = (widgetId) => {
    if (widgets.includes(widgetId)) {
      toast.error('Widget already added');
      return;
    }

    setWidgets([...widgets, widgetId]);
    setShowAddWidget(false);
    toast.success('Widget added');
  };

  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter((w) => w !== widgetId));
    toast.success('Widget removed');
  };

  const moveWidget = (widgetId, direction) => {
    const index = widgets.indexOf(widgetId);
    if (direction === 'up' && index > 0) {
      const newWidgets = [...widgets];
      [newWidgets[index], newWidgets[index - 1]] = [newWidgets[index - 1], newWidgets[index]];
      setWidgets(newWidgets);
    } else if (direction === 'down' && index < widgets.length - 1) {
      const newWidgets = [...widgets];
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
      setWidgets(newWidgets);
    }
  };
  const handleDragStart = (e, widgetId, index) => {
    setDraggedWidget({ id: widgetId, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedWidget(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedWidget && draggedWidget.index !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedWidget || draggedWidget.index === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(draggedWidget.index, 1);
    newWidgets.splice(dropIndex, 0, removed);

    setWidgets(newWidgets);
    setDraggedWidget(null);
    setDragOverIndex(null);
    toast.success('Widget moved');
  };

  const handleNLQuery = async () => {
    if (!nlQuery.trim()) {
      toast.error('Please enter a query');
      return;
    }

    try {
      const { data } = await api.post('/analytics/nl-query', { query: nlQuery });
      setNlResults(data);
      toast.success(`Found ${data.totalResults} results`);
    } catch (error) {
      console.error('NL Query failed:', error);
      toast.error('Failed to process query');
    }
  };

  const scheduleReport = async (frequency) => {
    try {
      await api.post('/analytics/schedule-report', { frequency });
      toast.success(`${frequency} report scheduled`);
      fetchScheduledReports();
    } catch (error) {
      console.error('Failed to schedule report:', error);
      toast.error('Failed to schedule report');
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await api.get('/analytics/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded');
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error('Failed to download PDF');
    }
  };

  const renderWidget = (widgetId) => {
    if (!analytics) return <div className="p-4">Loading...</div>;

    switch (widgetId) {
      case 'overview':
        return (
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-lg">Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-3 rounded">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{analytics.overview.totalTickets}</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-xs text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-chart-3">{analytics.overview.openTickets}</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-xs text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold text-chart-1">{analytics.overview.closedTickets}</p>
              </div>
              <div className="bg-muted p-3 rounded">
                <p className="text-xs text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{analytics.overview.avgResponseTime}m</p>
              </div>
            </div>
          </div>
        );

      case 'priority-pie':
        const priorityData = Object.entries(analytics.priorityBreakdown).map(([name, value]) => ({
          name,
          value,
        }));
        return (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'status-bar':
        const statusData = Object.entries(analytics.statusBreakdown).map(([name, value]) => ({
          name,
          value,
        }));
        return (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'timeline':
        const timelineData = analytics.ticketsOverTime.map((item) => ({
          date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: item.count,
        }));
        return (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">Tickets Timeline</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'predictions':
        if (!mlPredictions) return <div className="p-4">Loading predictions...</div>;
        return (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Sparkles size={20} />
              ML Predictions
            </h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-semibold">Trend:</span> {mlPredictions.insights?.trend}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Avg Daily:</span> {mlPredictions.insights?.avgDaily} tickets
              </p>
              <p className="text-sm">
                <span className="font-semibold">Data Quality:</span> {mlPredictions.insights?.dataQuality}
              </p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Next 7 Days Forecast:</p>
                {mlPredictions.predictions?.slice(0, 3).map((pred) => (
                  <div key={pred.date} className="flex justify-between text-sm py-1">
                    <span>{new Date(pred.date).toLocaleDateString()}</span>
                    <span className="font-semibold">{pred.predictedCount} tickets</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'anomalies':
        if (!mlPredictions?.anomalies) return <div className="p-4">No anomalies detected</div>;
        return (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">Anomaly Detection</h3>
            {mlPredictions.anomalies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No anomalies detected</p>
            ) : (
              <div className="space-y-2">
                {mlPredictions.anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-sm ${
                      anomaly.severity === 'high'
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-chart-3/20 text-chart-3'
                    }`}
                  >
                    <p className="font-semibold">{new Date(anomaly.date).toLocaleDateString()}</p>
                    <p>{anomaly.value} tickets (Z-score: {anomaly.zScore})</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'nl-search':
        return (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <MessageSquare size={20} />
              Natural Language Search
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNLQuery()}
                placeholder="e.g., Show me high priority tickets from last week"
                className="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground text-sm"
              />
              <button
                onClick={handleNLQuery}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
              >
                Search
              </button>
              {nlResults && (
                <div className="mt-3 text-sm">
                  <p className="font-semibold">Found {nlResults.totalResults} results</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Filters: {JSON.stringify(nlResults.parsedFilters)}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'scheduled-reports':
        return (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Mail size={20} />
              Email Reports
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => scheduleReport('daily')}
                className="w-full px-3 py-2 bg-muted hover:bg-muted/80 rounded text-sm"
              >
                Schedule Daily Report
              </button>
              <button
                onClick={() => scheduleReport('weekly')}
                className="w-full px-3 py-2 bg-muted hover:bg-muted/80 rounded text-sm"
              >
                Schedule Weekly Report
              </button>
              <button
                onClick={() => scheduleReport('monthly')}
                className="w-full px-3 py-2 bg-muted hover:bg-muted/80 rounded text-sm"
              >
                Schedule Monthly Report
              </button>
              {scheduledReports.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Active Schedules:</p>
                  {scheduledReports.map((report, index) => (
                    <p key={index} className="text-sm">
                      {report.frequency}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div className="p-4">Unknown widget</div>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Custom Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md font-medium"
          >
            <Download size={16} />
            PDF
          </button>
          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
          >
            <Plus size={16} />
            Add Widget
          </button>
          <button
            onClick={saveDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-chart-1 text-white rounded-md font-medium hover:opacity-90"
          >
            <Save size={16} />
            Save
          </button>
          <button
            onClick={resetDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md font-medium"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.map((widgetId, index) => (
          <div
            key={widgetId}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, widgetId, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`bg-card rounded-lg shadow-sm border-2 overflow-hidden transition-all ${
              dragOverIndex === index
                ? 'border-primary scale-105 shadow-lg'
                : 'border-border'
            } ${draggedWidget?.index === index ? 'opacity-40' : 'opacity-100'}`}
            style={{ cursor: 'grab' }}
          >
            <div
              className="flex justify-between items-center p-3 bg-muted border-b border-border cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">
                  {availableWidgets.find((w) => w.id === widgetId)?.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveWidget(widgetId, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-accent rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  ↑
                </button>
                <button
                  onClick={() => moveWidget(widgetId, 'down')}
                  disabled={index === widgets.length - 1}
                  className="p-1 hover:bg-accent rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  ↓
                </button>
                <button
                  onClick={() => removeWidget(widgetId)}
                  className="p-1 hover:bg-destructive/20 rounded ml-2"
                  title="Remove"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[400px]" style={{ pointerEvents: draggedWidget ? 'none' : 'auto' }}>
              {renderWidget(widgetId)}
            </div>
          </div>
        ))}
      </div>

      {}
      {widgets.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed border-border rounded-lg">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No widgets added yet</p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90"
            >
              Add Your First Widget
            </button>
          </div>
        </div>
      )}

      {}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Add Widget</h2>
            <div className="space-y-2">
              {availableWidgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget.id)}
                  disabled={widgets.includes(widget.id)}
                  className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/80 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="font-medium">{widget.name}</p>
                  <p className="text-xs text-muted-foreground">{widget.type}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddWidget(false)}
              className="w-full mt-4 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDashboard;
