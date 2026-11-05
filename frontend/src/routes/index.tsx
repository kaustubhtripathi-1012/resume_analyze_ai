import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { CandidateDashboard } from '../pages/CandidateDashboard';
import { UploadResumePage } from '../pages/UploadResumePage';
import { ParsedProfilePage } from '../pages/ParsedProfilePage';
import { AtsReportPage } from '../pages/AtsReportPage';
import { JobMatchPage } from '../pages/JobMatchPage';
import { RecommendedJobsPage } from '../pages/RecommendedJobsPage';
import { BrowseJobsPage } from '../pages/BrowseJobsPage';
import { JobDetailPage } from '../pages/JobDetailPage';
import { RecruiterDashboard } from '../pages/RecruiterDashboard';
import { PostJobPage } from '../pages/PostJobPage';
import { CandidateRankingPage } from '../pages/CandidateRankingPage';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { AdminSkillsPage } from '../pages/AdminSkillsPage';
import { AdminAnalyticsPage } from '../pages/AdminAnalyticsPage';
import { ProfileSettingsPage } from '../pages/ProfileSettingsPage';

export const router = createBrowserRouter([
  // Public Landing & Jobs
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/jobs',
    element: (
      <DashboardLayout />
    ),
    children: [
      {
        index: true,
        element: <BrowseJobsPage />
      },
      {
        path: ':id',
        element: <JobDetailPage />
      }
    ]
  },

  // Auth pages
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/register',
        element: <RegisterPage />
      }
    ]
  },

  // Protected application routes
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <CandidateDashboard />
      },
      {
        path: '/upload',
        element: <UploadResumePage />
      },
      {
        path: '/resumes/:id/parsed',
        element: <ParsedProfilePage />
      },
      {
        path: '/resumes/:id/report',
        element: <AtsReportPage />
      },
      {
        path: '/resumes/:id/match',
        element: <JobMatchPage />
      },
      {
        path: '/resumes/:id/recommendations',
        element: <RecommendedJobsPage />
      },
      {
        path: '/settings',
        element: <ProfileSettingsPage />
      },

      // Recruiter routes
      {
        path: '/recruiter',
        element: (
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: '/recruiter/jobs/new',
        element: (
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <PostJobPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/recruiter/jobs/:id/candidates',
        element: (
          <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
            <CandidateRankingPage />
          </ProtectedRoute>
        )
      },

      // Admin routes
      {
        path: '/admin/analytics',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAnalyticsPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin/users',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin/skills',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSkillsPage />
          </ProtectedRoute>
        )
      }
    ]
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

