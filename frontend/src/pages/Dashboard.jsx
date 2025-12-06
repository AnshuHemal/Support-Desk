import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Ticket, Users, FolderOpen, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    myTickets: 0,
    escalatedTickets: 0,
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/tickets?limit=5');
      setRecentTickets(data.data);
      const total = data.pagination.total;
      const open = data.data.filter(t => t.status?.includeInActive).length;
      const mine = data.data.filter(t =>
        t.createdBy?._id === user._id || t.assignedTo?._id === user._id
      ).length;
      const escalated = data.data.filter(t => t.status?.title === 'Escalated').length;

      setStats({
        totalTickets: total,
        openTickets: open,
        myTickets: mine,
        escalatedTickets: escalated,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-lg text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  const getPriorityClasses = (priority) => {
    const classes = {
      low: 'bg-chart-1/20 text-chart-1',
      medium: 'bg-chart-3/20 text-chart-3',
      high: 'bg-destructive/20 text-destructive',
      critical: 'bg-destructive/30 text-destructive',
    };
    return classes[priority.toLowerCase()] || classes.medium;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <Link
          to="/tickets/new"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm"
        >
          Create Ticket
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg shadow-sm flex gap-4 border border-border">
          <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground shrink-0">
            <Ticket size={24} />
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-2">Total Tickets</h3>
            <p className="text-3xl font-bold text-foreground">{stats.totalTickets}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm flex gap-4 border border-border">
          <div className="w-12 h-12 bg-chart-2 rounded-md flex items-center justify-center text-primary-foreground shrink-0">
            <FolderOpen size={24} />
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-2">Open Tickets</h3>
            <p className="text-3xl font-bold text-foreground">{stats.openTickets}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm flex gap-4 border border-border">
          <div className="w-12 h-12 bg-chart-1 rounded-md flex items-center justify-center text-white shrink-0">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-2">My Tickets</h3>
            <p className="text-3xl font-bold text-foreground">{stats.myTickets}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm flex gap-4 border border-border">
          <div className="w-12 h-12 bg-chart-4 rounded-md flex items-center justify-center text-white shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-2">Escalated</h3>
            <p className="text-3xl font-bold text-foreground">{stats.escalatedTickets}</p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Tickets</h2>
        <div className="flex flex-col gap-4">
          {recentTickets.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/tickets/${ticket._id}`}
              className="p-4 border-2 border-border rounded-md hover:border-primary hover:shadow-md transition-all bg-card"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-primary">{ticket.ticketNumber}</span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: ticket.status?.color }}
                >
                  {ticket.status?.title}
                </span>
              </div>
              <h3 className="text-foreground font-medium mb-2">{ticket.title}</h3>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${getPriorityClasses(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span>{ticket.department?.name}</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
