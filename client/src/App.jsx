import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import HomePage from './components/pages/public/HomePage';
import EventsPage from './components/pages/public/EventsPage';
import EventDetailsPage from './components/pages/public/EventDetailsPage';

// Auth pages
import LoginPage from './components/pages/auth/LoginPage';
import RegisterPage from './components/pages/auth/RegisterPage';

// Participant pages
import ParticipantDashboardPage from './components/pages/participant/ParticipantDashboardPage';
import MyRegistrationsPage from './components/pages/participant/MyRegistrationsPage';

// Organizer pages
import OrganizerDashboardPage from './components/pages/organizer/OrganizerDashboardPage';
import OrganizerEventsPage from './components/pages/organizer/OrganizerEventsPage';
import CreateEditEventPage from './components/pages/organizer/CreateEditEventPage';
import EventParticipantsPage from './components/pages/organizer/EventParticipantsPage';

// Fallback
import NotFoundPage from './components/pages/NotFoundPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#ffffff'
            }
          }
        }}
      />

      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Participant Protected Routes */}
          <Route
            path="/participant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['participant']}>
                <ParticipantDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/participant/registrations"
            element={
              <ProtectedRoute allowedRoles={['participant']}>
                <MyRegistrationsPage />
              </ProtectedRoute>
            }
          />

          {/* Organizer Protected Routes */}
          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <CreateEditEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <CreateEditEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/participants"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <EventParticipantsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
