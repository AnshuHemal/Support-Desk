import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        const errorMessages = {
          no_code: 'Authorization code not received',
          token_failed: 'Failed to exchange authorization code',
          no_email: 'Email not provided by Google',
          auth_failed: 'Authentication failed. Please try again.',
        };
        toast.error(errorMessages[error] || 'Authentication failed');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          localStorage.setItem('token', token);
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('user', JSON.stringify(data.data));
            setUser(data.data);
            toast.success('Successfully signed in with Google!');
            navigate('/');
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          toast.error('Failed to complete authentication');
          navigate('/login');
        }
      } else {
        toast.error('No authentication token received');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-lg text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
