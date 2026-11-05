import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Users, Eye } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { jobsApi, JobItem } from '../api/jobs';

export const RecruiterDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.list({ limit: 50 })
      .then((data) => setJobs(data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      header: 'Job Title',
      render: (row: JobItem) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.title}</span>
          <span className="text-xs text-muted">{row.company} • {row.location}</span>
        </div>
      )
    },
    {
      header: 'Experience',
      render: (row: JobItem) => (
        <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {row.experienceLevel}
        </span>
      )
    },
    {
      header: 'Required Skills',
      render: (row: JobItem) => (
        <span className="text-xs text-slate-600">
          {row.requiredSkills.slice(0, 3).join(', ')}{row.requiredSkills.length > 3 ? '...' : ''}
        </span>
      )
    },
    {
      header: 'Candidates',
      render: (row: JobItem) => (
        <Link to={`/recruiter/jobs/${row._id}/candidates`}>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            <Users className="w-3.5 h-3.5" /> View Ranked Candidates
          </span>
        </Link>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner label="Loading recruiter portal..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recruiter Portal</h1>
          <p className="text-sm text-muted mt-0.5">Manage job requisitions and review AI-ranked candidate matches.</p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-1.5" /> Post New Job
          </Button>
        </Link>
      </div>

      <Card title="Active Job Requisitions">
        <Table
          columns={columns}
          data={jobs}
          keyExtractor={(j) => j._id}
          emptyMessage="No job listings found. Post your first job requisition above."
        />
      </Card>
    </div>
  );
};

