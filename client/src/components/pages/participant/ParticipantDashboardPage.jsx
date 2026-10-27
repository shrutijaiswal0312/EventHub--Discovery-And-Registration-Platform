import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { dashboardService } from '../../../services/dashboardService';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Video,
  ArrowRight,
  ExternalLink,
  CalendarCheck,
  CalendarX,
  History,
  Sparkles
} from 'lucide-react';
import StatCard from '../../dashboard/StatCard';
import Badge from '../../common/Badge';
import LoadingSpinner from '../../common/LoadingSpinner';

const ParticipantDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getParticipantDashboardStats();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load participant dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your dashboard analytics..." />
      </div>
    );
  }

  const stats = data?.stats || {
    totalRegistrations: 0,
    upcomingCount: 0,
    pastCount: 0,
    cancelledCount: 0
  };

  const nextEvent = data?.nextUpcomingEvent;
  const recentList = data?.recentRegistrations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Attendee Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Keep track of your registered conferences, access meeting links, and manage attendance seamlessly.
          </p>
        </div>

        <div className="relative z-10 shrink-0 flex items-center gap-3">
          <Link
            to="/events"
            className="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span>Discover Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/participant/registrations"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all"
          >
            My Registrations
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Registrations"
          value={stats.totalRegistrations}
          subtitle="All-time registrations"
          icon={Ticket}
          variant="brand"
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingCount}
          subtitle="Confirmed attendance"
          icon={CalendarCheck}
          variant="success"
        />
        <StatCard
          title="Completed / Past"
          value={stats.pastCount}
          subtitle="Historical attendances"
          icon={History}
          variant="brand"
        />
        <StatCard
          title="Cancelled Registrations"
          value={stats.cancelledCount}
          subtitle="Seats released"
          icon={CalendarX}
          variant="warning"
        />
      </div>

      {/* Next Upcoming Event Highlight Card */}
      {nextEvent && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Your Next Event
            </span>
            <Badge variant="purple" size="sm">
              {nextEvent.category}
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {nextEvent.title}
              </h2>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <span>
                    {new Date(nextEvent.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>{nextEvent.startTime} - {nextEvent.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  {nextEvent.eventType === 'online' ? (
                    <>
                      <Video className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Online Stream</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{nextEvent.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/events/${nextEvent._id}`}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
              >
                View Pass & Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Registrations</h3>
            <p className="text-xs text-slate-500">Your latest event enrollment activity</p>
          </div>
          <Link
            to="/participant/registrations"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentList.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            You have not registered for any events yet.{' '}
            <Link to="/events" className="text-brand-600 font-bold hover:underline">
              Explore events now!
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentList.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {reg.event?.title || 'Unknown Event'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="purple" size="sm">
                        {reg.event?.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      {reg.event?.date
                        ? new Date(reg.event.date).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={reg.status === 'registered' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {reg.status === 'registered' ? 'Confirmed' : 'Cancelled'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {reg.event && (
                        <Link
                          to={`/events/${reg.event._id}`}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700"
                        >
                          Details &rarr;
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDashboardPage;
