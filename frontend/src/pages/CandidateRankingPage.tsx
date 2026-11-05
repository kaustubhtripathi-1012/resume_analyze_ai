import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Award, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { SkillBadge } from '../components/SkillBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { jobsApi, CandidateRankItem, JobItem } from '../api/jobs';

export const CandidateRankingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [candidates, setCandidates] = useState<CandidateRankItem[]>([]);
  const [job, setJob] = useState<JobItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      jobsApi.getOne(id),
      jobsApi.getCandidates(id)
    ])
      .then(([jobData, candData]) => {
        setJob(jobData.job);
        setCandidates(candData.items || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const columns = [
    {
      header: 'Rank & Candidate',
      render: (row: CandidateRankItem) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.candidateAlias}</span>
          <span className="text-xs text-muted">{row.education}</span>
        </div>
      )
    },
    {
      header: 'Match Compatibility',
      render: (row: CandidateRankItem) => (
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-primary">{row.matchPercent}%</span>
          <div className="w-16 bg-slate-100 rounded-full h-1.5 hidden sm:block">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${row.matchPercent}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: 'Matched Criteria',
      render: (row: CandidateRankItem) => (
        <div className="flex flex-wrap gap-1">
          {row.matchedSkills.map((s) => (
            <SkillBadge key={s} name={s} variant="matched" />
          ))}
        </div>
      )
    },
    {
      header: 'Top Skills',
      render: (row: CandidateRankItem) => (
        <span className="text-xs text-slate-600">
          {row.topSkills.join(', ')}
        </span>
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner label="Ranking candidates against job requirements..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      <Link to="/recruiter" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-text">
        <ArrowLeft className="w-4 h-4" /> Back to Recruiter Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Ranked Candidates for <span className="text-primary">{job?.title}</span>
        </h1>
        <p className="text-sm text-muted mt-0.5">
          Candidates who opted-in for recruiter visibility, sorted by semantic match & skill alignment.
        </p>
      </div>

      <Card>
        <Table
          columns={columns}
          data={candidates}
          keyExtractor={(c) => c.resumeId}
          emptyMessage="No matching candidates have opted-in for visibility yet."
        />
      </Card>
    </div>
  );
};

