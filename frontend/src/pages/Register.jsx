import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, CheckCircle2, Eye, EyeOff, X, Check } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    let strength = 'weak';
    let color = 'bg-destructive';

    if (passedChecks >= 5) {
      strength = 'strong';
      color = 'bg-chart-1';
    } else if (passedChecks >= 3) {
      strength = 'medium';
      color = 'bg-chart-3';
    }

    return { checks, strength, color, passedChecks };
  };

  const passwordValidation = formData.password ? validatePassword(formData.password) : null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordValidation && passwordValidation.passedChecks < 4) {
      toast.error('Please create a stronger password');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-chart-2 p-12 flex-col justify-between relative overflow-hidden">
        {}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Support Desk</h1>
          <p className="text-primary-foreground/80 text-lg">Streamline your customer support</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">
              Join thousands of teams managing support efficiently
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-white mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="text-white font-semibold text-lg">Quick Setup</h3>
                  <p className="text-primary-foreground/80">Get started in minutes with our intuitive interface</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-white mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="text-white font-semibold text-lg">Powerful Features</h3>
                  <p className="text-primary-foreground/80">Everything you need to manage tickets effectively</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-white mt-1 shrink-0" size={24} />
                <div>
                  <h3 className="text-white font-semibold text-lg">Free to Start</h3>
                  <p className="text-primary-foreground/80">No credit card required, start managing tickets today</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-primary-foreground/60 text-sm">
          © 2025 Support Desk. All rights reserved.
        </div>
      </div>

      {}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Create your account</h2>
            <p className="text-muted-foreground">Start managing your support tickets today</p>
          </div>

          {}
          <button
            onClick={handleGoogleSignup}
            className="w-full py-3 px-4 border-2 border-border rounded-lg text-base font-medium text-foreground bg-background hover:bg-accent transition-all flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-lg text-base bg-background text-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-lg text-base bg-background text-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                  className="w-full pl-11 pr-12 py-3 border-2 border-border rounded-lg text-base bg-background text-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {}
              {formData.password && passwordValidation && (
                <div className="mt-3 space-y-3">
                  {}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-semibold capitalize ${
                        passwordValidation.strength === 'strong' ? 'text-chart-1' :
                        passwordValidation.strength === 'medium' ? 'text-chart-3' :
                        'text-destructive'
                      }`}>
                        {passwordValidation.strength}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordValidation.color}`}
                        style={{ width: `${(passwordValidation.passedChecks / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {}
                  <div className="space-y-2 text-sm">
                    <div className={`flex items-center gap-2 ${passwordValidation.checks.length ? 'text-chart-1' : 'text-muted-foreground'}`}>
                      {passwordValidation.checks.length ? (
                        <Check size={16} className="shrink-0" />
                      ) : (
                        <X size={16} className="shrink-0" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.checks.uppercase ? 'text-chart-1' : 'text-muted-foreground'}`}>
                      {passwordValidation.checks.uppercase ? (
                        <Check size={16} className="shrink-0" />
                      ) : (
                        <X size={16} className="shrink-0" />
                      )}
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.checks.lowercase ? 'text-chart-1' : 'text-muted-foreground'}`}>
                      {passwordValidation.checks.lowercase ? (
                        <Check size={16} className="shrink-0" />
                      ) : (
                        <X size={16} className="shrink-0" />
                      )}
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.checks.number ? 'text-chart-1' : 'text-muted-foreground'}`}>
                      {passwordValidation.checks.number ? (
                        <Check size={16} className="shrink-0" />
                      ) : (
                        <X size={16} className="shrink-0" />
                      )}
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.checks.special ? 'text-chart-1' : 'text-muted-foreground'}`}>
                      {passwordValidation.checks.special ? (
                        <Check size={16} className="shrink-0" />
                      ) : (
                        <X size={16} className="shrink-0" />
                      )}
                      <span>One special character (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || (passwordValidation && passwordValidation.passedChecks < 4)}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg text-base font-semibold transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center mt-8 text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
