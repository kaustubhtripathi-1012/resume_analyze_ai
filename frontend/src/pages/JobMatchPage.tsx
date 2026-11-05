import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SkillBadge } from '../components/SkillBadge';
import { ScoreGauge } from '../components/ScoreGauge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { jobsApi, JobItem } from '../api/jobs';
import { resumesApi } from '../api/resumes';
import { analysesApi, AnalysisData } from '../api/analyses';

export const JobMatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [customJobText, setCustomJobText] = useState('');
  const [matching, setMatching] = useState(false);
  const [result, setResult] = useState<AnalysisData | null>(null);

  useEffect(() => {
    jobsApi.list({ limit: 50 })
      .then((data) => setJobs(data.items || []))
      .catch(() => {});
  }, []);

  const handleRunMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!selectedJobId && !customJobText.trim()) {
      alert('Please select an existing job or paste a job description.');
      return;
    }

    setMatching(true);
    setResult(null);

    try {
      const payload: { jobId?: string; jobText?: string } = {};
      if (selectedJobId) {
        payload.jobId = selectedJobId;
      } else {
        payload.jobText = customJobText.trim();
      }

      const res = await resumesApi.analyze(id, payload);
      pollMatchResult(res.analysisId);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Match evaluation failed.');
      setMatching(false);
    }
  };

  const pollMatchResult = (analysisId: string, attempts = 0) => {
    if (attempts > 20) {
      setMatching(false);
      alert('Job match evaluation timed out.');
      return;
    }

    analysesApi.getOne(analysisId)
      .then((data) => {
        if (data.status === 'done') {
          setResult(data);
          setMatching(false);
        } else if (data.status === 'failed') {
          alert('Job matching failed.');
          setMatching(false);
        } else {
          setTimeout(() => pollMatchResult(analysisId, attempts + 1), 1500);
        }
      })
      .catch(() => setMatching(false));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Job Description Matcher</h1>
        <p className="text-sm text-muted mt-0.5">
          Evaluate how well your resume matches specific job descriptions and uncover missing skills.
        </p>
      </div>

      {/* Input Options Card */}
      <Card title="Select or Paste Job Description">
        <form onSubmit={handleRunMatch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Option 1: Choose from posted active jobs
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                if (e.target.value) setCustomJobText('');
              }}
              className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-white"
            >
              <option value="">-- Or select an active platform job --</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} ({j.company}) - {j.location}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs uppercase font-bold text-slate-400">OR</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Option 2: Paste custom Job Description (JD) text
            </label>
            <textarea
              rows={5}
              value={customJobText}
              disabled={!!selectedJobId}
              onChange={(e) => setCustomJobText(e.target.value)}
              className="w-full p-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50"
              placeholder="Paste job description requirements, responsibilities, and qualifications here..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" loading={matching}>
              <Sparkles className="w-4 h-4 mr-1.5" />
              Compute Match Score
            </Button>
          </div>
        </form>
      </Card>

      {/* Matching Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex flex-col items-center justify-center p-6 text-center">
              <ScoreGauge
                score={result.matchPercent || 0}
                size={140}
                title="Job Match Fit"
              />
              <p className="text-xs text-muted mt-2">
                60% Skill Overlap + 30% Semantic Relevance + 10% Experience Fit
              </p>
            </Card>

            <Card className="md:col-span-2" title="Matched vs Missing Skills">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase text-emerald-800 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matched Skills ({result.matchedSkills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedSkills?.length === 0 ? (
                      <span className="text-xs text-muted">No direct skill matches detected.</span>
                    ) : (
                      result.matchedSkills.map((s) => (
                        <SkillBadge key={s} name={s} variant="matched" />
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-red-800 flex items-center gap-1.5 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Missing Required Skills ({result.missingSkills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingSkills?.length === 0 ? (
                      <span className="text-xs text-accent">You meet all target skills for this job!</span>
                    ) : (
                      result.missingSkills.map((s) => (
                        <SkillBadge key={s} name={s} variant="missing" />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

