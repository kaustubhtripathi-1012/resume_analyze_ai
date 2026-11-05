import React, { useEffect, useState } from 'react';
import { Users, FileText, TrendingUp, Cpu, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { adminApi, AnalyticsData } from '../api/admin';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner label="Compiling system analytics & skill trends..." size="lg" />;
  }

  const chartData = data?.topSkills?.map((item) => ({
    name: item.skill,
    count: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">System Analytics & Insights</h1>
        <p className="text-sm text-muted mt-0.5">High-level aggregates on users, resumes, ATS averages, and industry skill frequencies.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-primary rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{data?.users || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted">Resumes Analyzed</p>
            <p className="text-2xl font-bold text-slate-900">{data?.resumes || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-accent rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase font-semibold text-muted">Average ATS Score</p>
            <p className="text-2xl font-bold text-slate-900">{data?.avgAtsScore || 0}%</p>
          </div>
        </Card>
      </div>

      {/* Top Skills Chart */}
      <Card title="Top Skills Extracted Across Resumes" subtitle="Most frequently detected skills across all uploaded candidate resumes.">
        {chartData.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">No skill frequency data accumulated yet.</p>
        ) : (
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: 8, fontSize: 12, border: 'none' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

