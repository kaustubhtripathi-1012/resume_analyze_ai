import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, Sparkles, MapPin, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SkillBadge } from '../components/SkillBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { resumesApi } from '../api/resumes';

export const RecommendedJobsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    resumesApi.getRecommendations(id, 10)
      .then((data) => setRecommendations(data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingSpinner label="Generating personalized job recommendations..." size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Recommended Jobs For You
        </h1>
        <p className="text-sm text-muted mt-0.5">
          AI ranked job openings based on your skills, background, and experience.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job recommendations found"
          description="We could not find active job listings matching your skills right now. Try expanding your resume profile or check again later."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recommendations.map((item, idx) => {
            const job = item.job || {};
            const matchScore = item.matchPercent || 0;
            return (
              <Card key={idx} className="hover:border-primary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900">{job.title}</span>
                      <span className="text-xs uppercase px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                        {job.experienceLevel || 'fresher'}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-700">{job.company}</p>

                    <div className="flex items-center gap-4 text-xs text-muted pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location || 'Remote'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 pt-2">
                      {job.description}
                    </p>

                    {item.reason && (
                      <div className="p-2 rounded bg-blue-50/70 border border-blue-100 text-xs text-primary font-medium mt-3">
                        💡 {item.reason}
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-primary">{matchScore}%</span>
                      <span className="text-[10px] uppercase font-bold text-muted block">Match</span>
                    </div>
                    <Link to={`/jobs/${job._id || job.id}`}>
                      <Button className="h-9 px-4 text-xs">
                        View Role <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

