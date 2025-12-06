import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Departments from './pages/Departments';
import Statuses from './pages/Statuses';
import EscalationRules from './pages/EscalationRules';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import CustomDashboard from './pages/CustomDashboard';
import SavedReplies from './pages/SavedReplies';
import TicketTemplates from './pages/TicketTemplates';
import Surveys from './pages/Surveys';
import SurveySubmit from './pages/SurveySubmit';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/survey/:token" element={<SurveySubmit />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="tickets" element={<TicketList />} />
            <Route path="tickets/new" element={<CreateTicket />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            <Route path="departments" element={<Departments />} />
            <Route path="statuses" element={<Statuses />} />
            <Route path="escalations" element={<EscalationRules />} />
            <Route path="users" element={<Users />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="analytics/advanced" element={<AdvancedAnalytics />} />
            <Route path="dashboard/custom" element={<CustomDashboard />} />
            <Route path="saved-replies" element={<SavedReplies />} />
            <Route path="ticket-templates" element={<TicketTemplates />} />
            <Route path="surveys" element={<Surveys />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
