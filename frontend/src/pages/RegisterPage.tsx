import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [visibleToRecruiters, setVisibleToRecruiters] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register({
        name,
        email,
        password,
        role,
        visibleToRecruiters
      });

      setAuth(res.user, res.accessToken);
      navigate(res.user.role === 'recruiter' ? '/recruiter' : '/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-1">Create your Account</h2>
      <p className="text-sm text-muted mb-6">Start analyzing resumes and exploring matched jobs.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="John Doe"
          />
        </div>

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
          <label className="block text-sm font-medium text-slate-700 mb-1">Password (min. 8 characters)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">I am a</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`h-10 text-sm font-medium rounded-lg border text-center transition-colors ${
                role === 'candidate'
                  ? 'bg-blue-50 border-primary text-primary'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Job Seeker / Student
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`h-10 text-sm font-medium rounded-lg border text-center transition-colors ${
                role === 'recruiter'
                  ? 'bg-blue-50 border-primary text-primary'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Recruiter / Hiring
            </button>
          </div>
        </div>

        {role === 'candidate' && (
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="optInRecruiters"
              checked={visibleToRecruiters}
              onChange={(e) => setVisibleToRecruiters(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <label htmlFor="optInRecruiters" className="text-xs text-muted leading-snug">
              Allow verified recruiters to discover my profile and match me for relevant roles.
            </label>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full mt-2">
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

