import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      setAuth(res.user, res.accessToken);

      const targetPath = res.user.role === 'recruiter'
        ? '/recruiter'
        : res.user.role === 'admin'
        ? '/admin/analytics'
        : from;

      navigate(targetPath, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Sign In to ResumeAI</h2>
      <p className="text-sm text-muted mb-6">Enter your email and password to access your account.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full mt-2">
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create one now
        </Link>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-200">
        <p className="text-xs font-semibold text-slate-700 mb-2 text-center uppercase tracking-wider">
          Quick Demo Login (Click to fill)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('admin@example.com', 'Admin@12345')}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('candidate@example.com', 'Candidate@12345')}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-blue-200 bg-blue-50 text-primary hover:bg-blue-100 transition-colors"
          >
            Candidate
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('recruiter@example.com', 'Recruiter@12345')}
            className="px-2 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-accent hover:bg-emerald-100 transition-colors"
          >
            Recruiter
          </button>
        </div>
      </div>
    </div>
  );
};
