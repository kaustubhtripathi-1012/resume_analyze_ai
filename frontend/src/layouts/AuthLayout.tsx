import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
          <div className="p-2 bg-primary text-white rounded-xl shadow-md">
            <FileText className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">ResumeAI</span>
        </Link>
        <p className="mt-2 text-sm text-muted">
          AI-Powered Resume Analyzer & Job Recommendation System
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

