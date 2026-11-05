import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SkillBadge } from '../components/SkillBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { jobsApi, JobItem } from '../api/jobs';

export const BrowseJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const fetchJobs = () => {
    setLoading(true);
    jobsApi.list({ q: search, skill: skillFilter, limit: 50 })
      .then((data) => setJobs(data.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [skillFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Explore Active Jobs</h1>
        <p className="text-sm text-muted mt-0.5">Discover roles from top recruiters looking for talent with modern skillsets.</p>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or keyword..."
            className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <input
          type="text"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          placeholder="Filter by skill (e.g. React, Python)..."
          className="sm:w-60 h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <Button type="submit" className="h-10 px-6">
          Search
        </Button>
      </form>

      {/* Jobs Listing */}
      {loading ? (
        <LoadingSpinner label="Loading active jobs..." />
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12 text-muted">
          No job listings found matching your search. Try different keywords.
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job._id} className="hover:border-primary/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">{job.title}</span>
                    <span className="text-xs uppercase px-2 py-0.5 rounded font-semibold bg-blue-50 text-blue-700">
                      {job.experienceLevel}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-primary">{job.company}</p>
                  <div className="flex items-center gap-4 text-xs text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Link to={`/jobs/${job._id}`}>
                  <Button variant="secondary" className="h-9 px-4 text-xs w-full sm:w-auto">
                    View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                {job.requiredSkills.slice(0, 6).map((skill) => (
                  <SkillBadge key={skill} name={skill} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

