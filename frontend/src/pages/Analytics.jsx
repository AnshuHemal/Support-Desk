import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Calendar,
  Sparkles,
} from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchDepartments();
  }, [dateRange, selectedDepartment]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('department', selectedDepartment);

      const { data } = await api.get(`/analytics/dashboard?${params}`);
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) return null;

  const { overview, priorityBreakdown, statusBreakdown, departmentBreakdown, ticketsOverTime, agentPerformance, recentTickets } = analytics;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <div className="flex gap-3">
          <Link
            to="/analytics/advanced"
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary to-chart-2 text-white rounded-md font-medium hover:opacity-90 transition-all shadow-sm"
          >
            <Sparkles size={16} />
            Advanced Analytics
          </Link>
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
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Tickets</span>
            <BarChart3 size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-bold text-foreground">{overview.totalTickets}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Open Tickets</span>
            <AlertCircle size={20} className="text-chart-3" />
          </div>
          <p className="text-3xl font-bold text-foreground">{overview.openTickets}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {overview.totalTickets > 0
              ? `${Math.round((overview.openTickets / overview.totalTickets) * 100)}% of total`
              : 'No tickets'}
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Closed Tickets</span>
            <CheckCircle size={20} className="text-chart-1" />
          </div>
          <p className="text-3xl font-bold text-foreground">{overview.closedTickets}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {overview.totalTickets > 0
              ? `${Math.round((overview.closedTickets / overview.totalTickets) * 100)}% resolved`
              : 'No tickets'}
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Response</span>
            <Clock size={20} className="text-chart-2" />
          </div>
          <p className="text-3xl font-bold text-foreground">{overview.avgResponseTime}</p>
          <p className="text-xs text-muted-foreground mt-1">minutes</p>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Resolution</span>
            <TrendingUp size={20} className="text-chart-4" />
          </div>
          <p className="text-3xl font-bold text-foreground">{overview.avgResolutionTime}</p>
          <p className="text-xs text-muted-foreground mt-1">hours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Tickets by Priority</h2>
          <div className="space-y-4">
            {Object.entries(priorityBreakdown).map(([priority, count]) => {
              const percentage = overview.totalTickets > 0 ? (count / overview.totalTickets) * 100 : 0;
              const colors = {
                Low: 'bg-chart-1',
                Medium: 'bg-chart-3',
                High: 'bg-destructive',
                Critical: 'bg-destructive',
              };
              return (
                <div key={priority}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{priority}</span>
                    <span className="text-sm text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`${colors[priority]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Tickets by Status</h2>
          <div className="space-y-4">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const percentage = overview.totalTickets > 0 ? (count / overview.totalTickets) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{status}</span>
                    <span className="text-sm text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {}
      {Object.keys(departmentBreakdown).length > 0 && (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Tickets by Department</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(departmentBreakdown).map(([dept, count]) => (
              <div key={dept} className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{dept}</p>
                <p className="text-2xl font-bold text-foreground">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {}
      {ticketsOverTime.length > 0 && (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Tickets Over Time (Last 30 Days)</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {ticketsOverTime.map((item) => {
              const maxCount = Math.max(...ticketsOverTime.map(t => t.count));
              const height = (item.count / maxCount) * 100;
              return (
                <div key={item._id} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary rounded-t-lg hover:bg-primary/80 transition-all cursor-pointer relative group"
                    style={{ height: `${height}%`, minHeight: '20px' }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.count} tickets
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-top-left">
                    {new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {}
      {user?.role !== 'user' && agentPerformance.length > 0 && (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users size={24} />
            Agent Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted border-b-2 border-border">
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Agent</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Assigned</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Resolved</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Pending</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Avg Resolution</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((agent) => {
                  const successRate = agent.totalAssigned > 0
                    ? Math.round((agent.resolved / agent.totalAssigned) * 100)
                    : 0;
                  return (
                    <tr key={agent.name} className="border-b border-border hover:bg-accent transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{agent.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{agent.totalAssigned}</td>
                      <td className="px-4 py-3 text-chart-1">{agent.resolved}</td>
                      <td className="px-4 py-3 text-chart-3">{agent.pending}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {Math.round(agent.avgResolutionTime / (1000 * 60 * 60))}h
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                            <div
                              className="bg-chart-1 h-2 rounded-full"
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{successRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {}
      <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Tickets</h2>
        <div className="space-y-3">
          {recentTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-primary">{ticket.ticketNumber}</span>
                  <span className="text-foreground">{ticket.title}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{ticket.createdBy}</span>
                  <span>•</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  ticket.priority === 'Critical' || ticket.priority === 'High'
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-chart-1/20 text-chart-1'
                }`}>
                  {ticket.priority}
                </span>
                <span className="px-3 py-1 rounded text-xs font-semibold bg-primary/20 text-primary">
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
