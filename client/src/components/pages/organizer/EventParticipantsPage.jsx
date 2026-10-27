import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  XCircle,
  Mail,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../../services/eventService';
import Badge from '../../common/Badge';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';

const EventParticipantsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await eventService.getEventParticipants(id, {
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (res.success) {
        setEventData(res.event);
        setParticipants(res.participants || []);
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
      toast.error(err.response?.data?.message || 'Access denied or event not found.');
      navigate('/organizer/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [id, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchParticipants();
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      toast.error('No participant records to export.');
      return;
    }

    const headers = ['Name', 'Email', 'Status', 'Registered At', 'Cancelled At'];
    const rows = participants.map((p) => [
      `"${p.participant?.name || 'Attendee'}"`,
      `"${p.participant?.email || ''}"`,
      `"${p.status}"`,
      `"${new Date(p.registeredAt).toISOString()}"`,
      `"${p.cancelledAt ? new Date(p.cancelledAt).toISOString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${eventData?.title || 'event'}_participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendee roster exported as CSV.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/organizer/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizer Events</span>
        </Link>
      </div>

      {/* Header and Capacity summary */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block mb-1">
            Attendee Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {eventData?.title || 'Event Roster'}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span>Status: <strong className="text-slate-800 capitalize">{eventData?.status}</strong></span>
            <span>•</span>
            <span>Capacity: <strong className="text-slate-800">{eventData?.capacity}</strong></span>
            <span>•</span>
            <span>Active Registrations: <strong className="text-emerald-700">{eventData?.registeredCount}</strong></span>
            <span>•</span>
            <span>Seats Remaining: <strong className="text-brand-600">{eventData?.remainingSeats}</strong></span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={participants.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Roster</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search participant by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Registrations</option>
            <option value="registered">Active / Confirmed Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Participant List Table */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading participant roster..." />
      ) : participants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No participants found"
          description="There are no participants registered for this event yet, or none matching your search query."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Participant Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Registered On</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Cancellation Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {reg.participant?.name ? reg.participant.name.charAt(0) : 'U'}
                      </div>
                      <span>{reg.participant?.name || 'Anonymous Attendee'}</span>
                    </td>

                    <td className="py-4 px-4 font-mono text-xs text-slate-600">
                      {reg.participant?.email || '—'}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500">
                      {new Date(reg.registeredAt).toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <Badge
                        variant={reg.status === 'registered' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {reg.status === 'registered' ? 'Confirmed' : 'Cancelled'}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-400">
                      {reg.cancelledAt ? new Date(reg.cancelledAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventParticipantsPage;
