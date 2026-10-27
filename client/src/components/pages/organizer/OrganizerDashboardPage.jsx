import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { dashboardService } from '../../../services/dashboardService';
import {
  CalendarDays,
  PlusCircle,
  Users,
  Percent,
  CheckCircle,
  XCircle,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatCard from '../../dashboard/StatCard';
import Badge from '../../common/Badge';
import LoadingSpinner from '../../common/LoadingSpinner';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

const OrganizerDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getOrganizerDashboardStats();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load organizer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Computing organizer analytics from database..." />
      </div>
    );
  }

  const stats = data?.stats || {
    totalEvents: 0,
    publishedCount: 0,
    cancelledCount: 0,
    completedCount: 0,
    upcomingCount: 0,
    totalCapacity: 0,
    totalActiveRegistrations: 0,
    overallOccupancyRate: 0
  };

  const chartData = data?.chartData || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const recentRegistrations = data?.recentRegistrations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-brand-950 rounded-3xl p-8 sm:p-10 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block mb-2">
            Organizer Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-xl">
            Real-time analytics across your hosted conferences, occupancy health, and attendee roasters.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/organizer/events/new"
            className="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
          <Link
            to="/organizer/events"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all"
          >
            Manage Events
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Events Created"
          value={stats.totalEvents}
          subtitle={`${stats.publishedCount} published • ${stats.cancelledCount} cancelled`}
          icon={CalendarDays}
          variant="brand"
        />
        <StatCard
          title="Active Registrations"
          value={stats.totalActiveRegistrations}
          subtitle={`Across ${stats.totalCapacity} total seat capacity`}
          icon={Users}
          variant="success"
        />
        <StatCard
          title="Overall Occupancy Rate"
          value={`${stats.overallOccupancyRate}%`}
          subtitle="Capacity utilization"
          icon={Percent}
          variant="brand"
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingCount}
          subtitle={`${stats.completedCount} past events completed`}
          icon={CheckCircle}
          variant="warning"
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart: Registrations per Event */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Attendee Registrations vs Capacity
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Compare active registrations against total capacity per event
          </p>

          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400">
              No event registration data available yet.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="registered" name="Confirmed Attendees" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" name="Max Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Events by Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribution of your hosted events
            </p>

            {categoryDistribution.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-slate-400">
                No category data available.
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={4}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            {categoryDistribution.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-700">{cat.name}</span>
                </div>
                <span className="text-slate-500">{cat.count} event{cat.count === 1 ? '' : 's'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Attendees Roster */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Registrations</h3>
            <p className="text-xs text-slate-500">Latest participant sign-ups across your events</p>
          </div>
          <Link
            to="/organizer/events"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <span>View Events</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No registrations received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Attendee Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Target Event</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {reg.participant?.name || 'Attendee'}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">
                      {reg.participant?.email || '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-700 text-xs">
                      {reg.event?.title || 'Unknown Event'}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {new Date(reg.registeredAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={reg.status === 'registered' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {reg.status === 'registered' ? 'Confirmed' : 'Cancelled'}
                      </Badge>
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

export default OrganizerDashboardPage;
