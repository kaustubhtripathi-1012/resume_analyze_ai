import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  BarChart2,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { resumesApi, ResumeItem } from '../api/resumes';
import { useAuthStore } from '../store/authStore';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumesApi.list()
      .then((data) => setResumes(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latestResume = resumes[0];

  const columns = [
    {
      header: 'Resume File',
      render: (row: ResumeItem) => (
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-medium text-slate-900">{row.fileName}</span>
        </div>
      )
    },
    {
      header: 'Type',
      render: (row: ResumeItem) => (
        <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {row.fileType}
        </span>
      )
    },
    {
      header: 'Parsing Status',
      render: (row: ResumeItem) => {
        let badge = 'bg-yellow-50 text-yellow-800 border-yellow-200';
        let icon = <Clock className="w-3 h-3 text-yellow-600 inline mr-1" />;
        if (row.status === 'parsed') {
          badge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-1" />;
        } else if (row.status === 'failed') {
          badge = 'bg-red-50 text-red-800 border-red-200';
          icon = <AlertCircle className="w-3 h-3 text-red-600 inline mr-1" />;
        }
        return (
          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${badge}`}>
            {icon}
            {row.status.toUpperCase()}
          </span>
        );
      }
    },
    {
      header: 'Uploaded Date',
      render: (row: ResumeItem) => (
        <span className="text-muted text-xs">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row: ResumeItem) => {
        const id = row.id || row._id;
        return (
          <div className="flex items-center gap-2">
            <Link to={`/resumes/${id}/parsed`}>
              <span className="text-xs font-semibold text-primary hover:underline">Profile</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link to={`/resumes/${id}/report`}>
              <span className="text-xs font-semibold text-primary hover:underline">ATS Report</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link to={`/resumes/${id}/match`}>
              <span className="text-xs font-semibold text-primary hover:underline">Job Match</span>
            </Link>
          </div>
        );
      }
    }
  ];

  if (loading) {
    return <LoadingSpinner label="Loading your dashboard..." size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-muted mt-1">Manage your resumes, track ATS compatibility scores, and match job roles.</p>
        </div>
        <Link to="/upload">
          <Button className="shadow-sm">
            <UploadCloud className="w-4 h-4 mr-1.5" />
            Upload New Resume
          </Button>
        </Link>
      </div>

      {resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resumes uploaded yet"
          description="Upload your resume in PDF or DOCX format to extract skills, view your ATS score, and receive targeted job recommendations."
          actionLabel="Upload Your First Resume"
          onAction={() => window.location.href = '/upload'}
        />
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-primary rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted">Uploaded Resumes</p>
                <p className="text-2xl font-bold text-slate-900">{resumes.length}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-accent rounded-xl">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted">Latest Status</p>
                <p className="text-lg font-bold text-slate-900 capitalize">{latestResume?.status || 'N/A'}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted">Quick Actions</p>
                {latestResume && (
                  <Link
                    to={`/resumes/${latestResume.id || latestResume._id}/recommendations`}
                    className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5"
                  >
                    View Recommendations <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </Card>
          </div>

          {/* Resumes List Table */}
          <Card title="My Uploaded Resumes" subtitle="Click on any resume to inspect extracted data, view ATS scores, or run matching.">
            <Table
              columns={columns}
              data={resumes}
              keyExtractor={(r) => r.id || r._id || Math.random().toString()}
            />
          </Card>
        </>
      )}
    </div>
  );
};

