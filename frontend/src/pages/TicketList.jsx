import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search } from 'lucide-react';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: '',
  });
  const [departments, setDepartments] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchTickets();
    fetchDepartments();
    fetchStatuses();
  }, [search, filters]);

  const fetchTickets = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(search && { search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.department && { department: filters.department }),
      });

      const { data } = await api.get(`/tickets?${params}`);
      setTickets(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
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
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const fetchStatuses = async () => {
    try {

      const { data } = await api.get('/statuses');

      setStatuses(data.data || []);
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

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
        <h1 className="text-3xl font-bold text-foreground">Tickets</h1>
        <Link
          to="/tickets/new"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm"
        >
          Create Ticket
        </Link>
      </div>

      <div className="bg-card p-6 rounded-lg shadow-sm mb-6 border border-border">
        <div className="flex items-center gap-3 px-3 py-3 border-2 border-border rounded-md mb-4 bg-background">
          <Search size={20} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-none outline-none text-base bg-transparent text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="appearance-none px-4 py-2 pr-10 border-2 border-border rounded-md text-sm cursor-pointer bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status._id} value={status._id}>
                  {status.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="appearance-none px-4 py-2 pr-10 border-2 border-border rounded-md text-sm cursor-pointer bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="appearance-none px-4 py-2 pr-10 border-2 border-border rounded-md text-sm cursor-pointer bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px] text-lg text-muted-foreground">
          Loading tickets...
        </div>
      ) : (
        <>
          <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b-2 border-border">
                    <th className="px-4 py-4 text-left font-semibold text-foreground">Ticket #</th>
                    <th className="px-4 py-4 text-left font-semibold text-foreground">Title</th>
                    <th className="px-4 py-4 text-left font-semibold text-foreground">Status</th>
                    <th className="px-4 py-4 text-left font-semibold text-foreground">Priority</th>
                    <th className="px-4 py-4 text-left font-semibold text-foreground">Department</th>
                    <th className="px-4 py-4 text-left font-semibold text-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id} className="border-b border-border hover:bg-accent transition-colors">
                      <td className="px-4 py-4">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {ticket.ticketNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          to={`/tickets/${ticket._id}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white inline-block"
                          style={{ backgroundColor: ticket.status?.color }}
                        >
                          {ticket.status?.title}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-sm text-xs font-semibold ${getPriorityClasses(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{ticket.department?.name}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchTickets(page)}
                  className={`px-4 py-2 border rounded-md transition-all ${
                    page === pagination.page
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TicketList;
