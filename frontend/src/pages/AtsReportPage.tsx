import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ScoreGauge } from '../components/ScoreGauge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { resumesApi } from '../api/resumes';
import { analysesApi, AnalysisData } from '../api/analyses';

export const AtsReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const initAnalysis = async () => {
    if (!id) return;
    setLoading(true);
    setError('');

    try {
      // Trigger new analysis or check history
      const hist = await analysesApi.getHistoryByResume(id);
      if (hist.items && hist.items.length > 0) {
        setAnalysis(hist.items[0]);
        setLoading(false);
        return;
      }

      // Trigger new analysis
      const res = await resumesApi.analyze(id);
      pollAnalysis(res.analysisId);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to start analysis.');
      setLoading(false);
    }
  };

  const pollAnalysis = (analysisId: string, attempts = 0) => {
    if (attempts > 20) {
      setError('Analysis timed out. Please retry.');
      setLoading(false);
      return;
    }

    analysesApi.getOne(analysisId)
      .then((data) => {
        if (data.status === 'done') {
          setAnalysis(data);
          setLoading(false);
        } else if (data.status === 'failed') {
          setError('Resume analysis failed. Please ensure the file contains readable text.');
          setLoading(false);
        } else {
          // Poll after 1.5s
          setTimeout(() => pollAnalysis(analysisId, attempts + 1), 1500);
        }
      })
      .catch((err) => {
        setError('Error polling analysis report.');
        setLoading(false);
      });
  };

  useEffect(() => {
    initAnalysis();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!analysis) return;
    setDownloading(true);
    try {
      const blob = await analysesApi.downloadPdf(analysis.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ats-report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Computing ATS compatibility scores & breakdowns..." size="lg" />;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="p-3 bg-red-50 text-danger rounded-full w-fit mx-auto mb-3">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Analysis Error</h2>
        <p className="text-sm text-muted mb-6">{error}</p>
        <Button onClick={initAnalysis}>Retry Analysis</Button>
      </div>
    );
  }

  const breakdown = analysis?.breakdown || {
    keywords: 0,
    sections: 0,
    format: 0,
    readability: 0,
    length: 0,
    contactInfo: 0
  };

  const categories = [
    { label: 'Keywords Density', score: breakdown.keywords, desc: 'Technical & domain skill matches' },
    { label: 'Standard Sections', score: breakdown.sections, desc: 'Presence of required header blocks' },
    { label: 'Layout & Formatting', score: breakdown.format, desc: 'Clean bullet points, no invalid symbols' },
    { label: 'Readability', score: breakdown.readability, desc: 'Sentence length and bullet clarity' },
    { label: 'Length & Structure', score: breakdown.length, desc: 'Word count & page balance' },
    { label: 'Contact Verification', score: breakdown.contactInfo, desc: 'Name, email, and phone detection' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ATS Compatibility Report</h1>
          <p className="text-sm text-muted mt-0.5">Comprehensive audit of how Applicant Tracking Systems evaluate your resume.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleDownloadPdf} loading={downloading}>
            <Download className="w-4 h-4 mr-1.5" /> Download PDF Report
          </Button>
          <Link to={`/resumes/${id}/match`}>
            <Button>
              Match With a Job <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center text-center p-8 bg-surface">
          <ScoreGauge score={analysis?.atsScore || 0} size={150} strokeWidth={14} />
          <p className="text-xs text-muted mt-3">
            Calculated across 6 ATS parameters using weighted multi-metric rules.
          </p>
        </Card>

        {/* Category Breakdown Progress Bars */}
        <Card className="md:col-span-2" title="Score Category Breakdown">
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{cat.label}</span>
                  <span>{cat.score}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      cat.score >= 70
                        ? 'bg-accent'
                        : cat.score >= 45
                        ? 'bg-warning'
                        : 'bg-danger'
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted mt-0.5">{cat.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Actionable Suggestions */}
      <Card title="Actionable Fixes & Improvement Suggestions">
        <div className="space-y-3">
          {analysis?.suggestions?.map((sug, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-slate-800 leading-relaxed">{sug}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

