import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SkillBadge } from '../components/SkillBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { jobsApi, JobItem } from '../api/jobs';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    jobsApi.getOne(id)
      .then((data) => setJob(data.job))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingSpinner label="Loading job information..." size="lg" />;
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-900">Job Not Found</h2>
        <Link to="/jobs" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-text">
        <ArrowLeft className="w-4 h-4" /> Back to all jobs
      </Link>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-base font-semibold text-primary mt-1">{job.company}</p>
            <div className="flex items-center gap-4 text-xs text-muted mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {job.experienceLevel.toUpperCase()}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <Button onClick={() => alert('Application submitted! Recruiter has been notified.')}>
            Apply for this Role
          </Button>
        </div>

        <div className="py-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <SkillBadge key={skill} name={skill} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Job Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

