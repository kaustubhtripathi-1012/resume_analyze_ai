import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const dashboardLink = user?.role === 'recruiter' ? '/recruiter' : user?.role === 'admin' ? '/admin/analytics' : '/dashboard';

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Navigation */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-primary font-bold text-xl">
            <div className="p-2 bg-primary text-white rounded-xl shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <span>ResumeAI</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={dashboardLink}>
                <Button>Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation ATS Resume Optimization</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Optimize your resume for <span className="text-primary">ATS & recruiters</span> with instant AI feedback.
        </h1>
        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload your resume in PDF or DOCX. Extract structured skills, analyze ATS compliance scores, discover missing keywords, and get tailored job recommendations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-blue-500/20">
              Analyze My Resume Now <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
          <Link to="/jobs" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto h-12 px-8 text-base">
              Explore Active Jobs
            </Button>
          </Link>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 bg-surface border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why use ResumeAI?</h2>
            <p className="text-muted mt-2">Comprehensive resume analytics built with spaCy, scikit-learn, and ATS rules.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-bg/50">
              <div className="p-3 bg-blue-100 text-primary rounded-xl w-fit mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Skill Extraction</h3>
              <p className="text-sm text-muted leading-relaxed">
                Extract technical languages, frameworks, developer tools, and certifications mapped across our standardized taxonomy.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-bg/50">
              <div className="p-3 bg-emerald-100 text-accent rounded-xl w-fit mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Objective ATS Scoring</h3>
              <p className="text-sm text-muted leading-relaxed">
                Deterministic 0-100 score breaking down format, keywords density, section presence, sentence readability, and length.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-bg/50">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl w-fit mb-4">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Job Match & Recommendations</h3>
              <p className="text-sm text-muted leading-relaxed">
                Compare your profile with active job descriptions to view matched skills, missing criteria, and personalized role ranking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-surface border-t border-slate-200 text-center text-sm text-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ResumeAI. Built for TY B.Sc. Computer Science Final Year Project.</p>
          <div className="flex items-center gap-6">
            <Link to="/jobs" className="hover:text-primary transition-colors">Jobs</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-primary transition-colors">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

