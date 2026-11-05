import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SkillBadge } from '../components/SkillBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { resumesApi, ParsedProfile } from '../api/resumes';

export const ParsedProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [profile, setProfile] = useState<ParsedProfile>({
    name: '',
    email: '',
    phone: '',
    links: [],
    skills: [],
    education: [],
    experience: []
  });
  const [resumeMeta, setResumeMeta] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    resumesApi.getOne(id)
      .then((data) => {
        setResumeMeta(data.resume);
        if (data.parsed) {
          setProfile({
            name: data.parsed.name || '',
            email: data.parsed.email || '',
            phone: data.parsed.phone || '',
            links: data.parsed.links || [],
            skills: data.parsed.skills || [],
            education: data.parsed.education || [],
            experience: data.parsed.experience || []
          });
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove)
    });
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await resumesApi.updateParsed(id, profile);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Extracting resume content & entities..." size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Extracted Resume Profile</h1>
          <p className="text-sm text-muted mt-0.5">
            File: <strong>{resumeMeta?.fileName}</strong> — Review and edit the parsed entities below.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-1" /> Save Edits
          </Button>
          <Link to={`/resumes/${id}/report`}>
            <Button>
              <Sparkles className="w-4 h-4 mr-1" /> View ATS Score <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Basic Contact Info */}
      <Card title="Contact & Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+91 9876543210"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Skills Section */}
      <Card title="Extracted Skills" subtitle="Recognized technical and domain skills mapped to the taxonomy.">
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills.length === 0 ? (
            <p className="text-sm text-muted">No skills detected. Add your skills manually below.</p>
          ) : (
            profile.skills.map((skill) => (
              <SkillBadge
                key={skill}
                name={skill}
                onRemove={() => handleRemoveSkill(skill)}
              />
            ))
          )}
        </div>

        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 h-9 px-3 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Add a new skill (e.g. Docker, Python)..."
          />
          <Button type="submit" variant="secondary" className="h-9 px-3">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </form>
      </Card>

      {/* Education Section */}
      <Card title="Education History">
        {profile.education.length === 0 ? (
          <p className="text-sm text-muted">No formal degrees detected.</p>
        ) : (
          <div className="space-y-3">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{edu.degree || 'Degree not specified'}</p>
                  <p className="text-xs text-muted">{edu.institution} {edu.year ? `• ${edu.year}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Experience Section */}
      <Card title="Work Experience">
        {profile.experience.length === 0 ? (
          <p className="text-sm text-muted">No formal professional experience detected.</p>
        ) : (
          <div className="space-y-4">
            {profile.experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-slate-900">{exp.role}</span>
                    <span className="text-xs text-muted">at {exp.company}</span>
                  </div>
                  {exp.duration && <span className="text-xs font-medium text-slate-500">{exp.duration}</span>}
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

