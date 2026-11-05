import React, { useState } from 'react';
import { User, Mail, Shield, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuthStore } from '../store/authStore';

export const ProfileSettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [visibleToRecruiters, setVisibleToRecruiters] = useState(user?.visibleToRecruiters ?? false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setUser({ ...user, visibleToRecruiters });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Profile & Account Settings</h1>
        <p className="text-sm text-muted mt-0.5">Manage your preferences and recruiter visibility options.</p>
      </div>

      <Card title="Account Overview">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-900">{user?.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900">{user?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assigned Role</label>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="capitalize font-semibold text-primary">{user?.role}</span>
            </div>
          </div>
        </div>
      </Card>

      {user?.role === 'candidate' && (
        <Card title="Recruiter Privacy & Match Settings">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-blue-50/50 border border-blue-100">
              <input
                type="checkbox"
                id="recruiterOptIn"
                checked={visibleToRecruiters}
                onChange={(e) => setVisibleToRecruiters(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="recruiterOptIn" className="text-xs text-slate-800 leading-relaxed cursor-pointer">
                <strong>Opt-in to Candidate Discovery:</strong> Allow recruiters with active job requisitions to view your profile in candidate rankings. Your contact details remain confidential until you apply or consent.
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saved ? (
                <span className="text-xs font-semibold text-accent flex items-center gap-1">
                  <Check className="w-4 h-4" /> Preferences saved!
                </span>
              ) : <div />}
              <Button type="submit">Save Preferences</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

