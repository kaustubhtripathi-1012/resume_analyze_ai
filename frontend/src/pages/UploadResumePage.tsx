import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { resumesApi } from '../api/resumes';

export const UploadResumePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).');
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB maximum limit.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose or drag a resume file first.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const res = await resumesApi.upload(file);
      // Navigate to parsed profile page
      navigate(`/resumes/${res.resumeId}/parsed`);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Upload failed. Ensure the file is not corrupted.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Your Resume</h1>
        <p className="text-sm text-muted mt-1">
          Upload your resume in PDF or DOCX format (max 5 MB). Our NLP engine will parse your skills, education, and experience.
        </p>
      </div>

      <Card>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-danger text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-primary bg-blue-50/50'
              : file
              ? 'border-emerald-300 bg-emerald-50/20'
              : 'border-slate-300 hover:border-primary hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center">
            {file ? (
              <>
                <div className="p-3 bg-emerald-100 text-accent rounded-full mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-slate-900">{file.name}</p>
                <p className="text-xs text-muted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p className="text-xs text-primary font-medium mt-3">Click or drop another file to replace</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-blue-50 text-primary rounded-full mb-3">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-base font-semibold text-slate-900">
                  Drag & drop your resume file here, or <span className="text-primary underline">browse</span>
                </p>
                <p className="text-xs text-muted mt-1.5">Supported formats: PDF, DOCX (up to 5 MB)</p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={handleUpload}
            disabled={!file}
            loading={uploading}
            className="w-full sm:w-auto px-8"
          >
            Start Analysis & Parsing
          </Button>
        </div>
      </Card>
    </div>
  );
};

