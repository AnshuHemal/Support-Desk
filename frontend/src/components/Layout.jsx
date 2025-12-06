import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  FolderOpen,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  BarChart3,
  Grid3x3,
  MessageSquare,
  FileText,
  Star
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col fixed h-full overflow-y-auto border-r border-sidebar-border">
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="text-2xl font-bold mb-1 text-sidebar-foreground">Support Desk</h2>
          <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
        </div>

        <nav className="flex-1 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/tickets"
            className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          >
            <Ticket size={20} />
            <span>Tickets</span>
          </Link>

          <Link
            to="/analytics"
            className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </Link>

          <Link
            to="/dashboard/custom"
            className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          >
            <Grid3x3 size={20} />
            <span>Custom Dashboard</span>
          </Link>

          <Link
            to="/surveys"
            className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          >
            <Star size={20} />
            <span>Surveys</span>
          </Link>

          {(user?.role === 'admin' || user?.role === 'agent') && (
            <>
              <Link
                to="/saved-replies"
                className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
              >
                <MessageSquare size={20} />
                <span>Saved Replies</span>
              </Link>

              <Link
                to="/ticket-templates"
                className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
              >
                <FileText size={20} />
                <span>Ticket Templates</span>
              </Link>
            </>
          )}

          {(user?.role === 'admin' || user?.role === 'agent') && (
            <>
              <Link
                to="/departments"
                className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
              >
                <FolderOpen size={20} />
                <span>Departments</span>
              </Link>

              <Link
                to="/statuses"
                className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
              >
                <Settings size={20} />
                <span>Statuses</span>
              </Link>
            </>
          )}

          {(user?.role === 'admin' || user?.role === 'agent') && (
            <Link
              to="/users"
              className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            >
              <Users size={20} />
              <span>Users</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/escalations"
              className="flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            >
              <TrendingUp size={20} />
              <span>Escalation Rules</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="mb-4">
            <p className="font-semibold mb-1 text-sidebar-foreground">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-3 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 overflow-y-auto h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
