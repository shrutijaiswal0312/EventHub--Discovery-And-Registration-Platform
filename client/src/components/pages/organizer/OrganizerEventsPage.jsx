import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  PlusCircle,
  Search,
  Filter,
  Users,
  Edit,
  Ban,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Video
} from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../../services/eventService';
import Badge from '../../common/Badge';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import ConfirmDialog from '../../common/ConfirmDialog';
import Pagination from '../../common/Pagination';

const OrganizerEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [selectedEventForCancel, setSelectedEventForCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventService.getOrganizerEvents({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      if (res.success) {
        setEvents(res.events || []);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load organizer events:', err);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleCancelEvent = async () => {
    if (!selectedEventForCancel) return;
    setActionLoading(true);
    try {
      const res = await eventService.cancelEvent(selectedEventForCancel._id);
      if (res.success) {
        toast.success('Event has been cancelled. Existing registrations are preserved.');
        setSelectedEventForCancel(null);
        await fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel event.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Event Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, update, and monitor attendees across your hosted events.
          </p>
        </div>
        <Link
          to="/organizer/events/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search owned events..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Event Listing Table */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading your events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events found"
          description="You haven't created any events yet or no events match your current filter."
          actionText="Create an Event Now"
          actionLink="/organizer/events/new"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Event Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Occupancy</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((ev) => {
                  const regCount = ev.registeredCount || 0;
                  const capacity = ev.capacity || 1;
                  const percentage = Math.min(100, Math.round((regCount / capacity) * 100));

                  return (
                    <tr key={ev._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{ev.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          {ev.eventType === 'online' ? (
                            <>
                              <Video className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Virtual Stream</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              <span className="truncate max-w-[200px]">{ev.location}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant="purple" size="sm">
                          {ev.category}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <div className="font-medium text-slate-800">
                          {new Date(ev.date).toLocaleDateString()}
                        </div>
                        <div className="text-slate-400">{ev.startTime}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 mb-1 text-xs font-bold text-slate-700">
                          <span>{regCount} / {capacity}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                        </div>
                        <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${percentage >= 100 ? 'bg-amber-500' : 'bg-brand-600'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge
                          variant={ev.status === 'published' ? 'success' : ev.status === 'cancelled' ? 'danger' : 'default'}
                          size="sm"
                        >
                          {ev.status}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/events/${ev._id}`}
                            title="Public Preview"
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/organizer/events/${ev._id}/participants`}
                            title="Manage Attendees"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/organizer/events/${ev._id}/edit`}
                            title="Edit Event"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {ev.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => setSelectedEventForCancel(ev)}
                              title="Cancel Event"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Confirmation Dialog for Event Cancellation */}
      <ConfirmDialog
        isOpen={!!selectedEventForCancel}
        title="Cancel This Event?"
        message={`Are you sure you want to cancel "${selectedEventForCancel?.title}"? The event will stop accepting new registrations, but existing registration records will be preserved for attendee communication.`}
        confirmText="Confirm Event Cancellation"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleCancelEvent}
        onCancel={() => setSelectedEventForCancel(null)}
      />
    </div>
  );
};

export default OrganizerEventsPage;
