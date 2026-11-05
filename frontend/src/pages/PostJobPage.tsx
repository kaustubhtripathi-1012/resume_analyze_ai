import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SkillBadge } from '../components/SkillBadge';
import { jobsApi } from '../api/jobs';

export const PostJobPage: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | 'junior' | 'mid' | 'senior'>('junior');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (!skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (skills.length === 0) {
      setError('Please add at least one required skill for matching.');
      return;
    }

    setSubmitting(true);
    try {
      await jobsApi.create({
        title,
        company,
        location,
        experienceLevel,
        description,
        requiredSkills: skills
      });
      navigate('/recruiter');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to post job.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
        <p className="text-sm text-muted mt-0.5">Define role details, requirements, and key skills to match candidates.</p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Remote, Bangalore, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="fresher">Fresher (0 - 1 years)</option>
              <option value="junior">Junior (1 - 3 years)</option>
              <option value="mid">Mid-level (3 - 5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills *</label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {skills.map((s) => (
                <SkillBadge key={s} name={s} onRemove={() => handleRemoveSkill(s)} />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Type a skill name and press Enter..."
                className="flex-1 h-9 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddSkill} className="h-9 px-3">
                Add Skill
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role Description *</label>
            <textarea
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Outline responsibilities, day-to-day work, and qualifications..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => navigate('/recruiter')}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Publish Job Listing
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

