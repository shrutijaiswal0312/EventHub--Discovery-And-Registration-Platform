import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Ticket,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { registrationService } from '../../../services/registrationService';
import Badge from '../../common/Badge';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import ConfirmDialog from '../../common/ConfirmDialog';

const MyRegistrationsPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'past' | 'cancelled'
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegForCancel, setSelectedRegForCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'upcoming' || activeTab === 'past') {
        params.timeline = activeTab;
      } else if (activeTab === 'cancelled') {
        params.status = 'cancelled';
      }

      const res = await registrationService.getMyRegistrations(params);
      if (res.success) {
        setRegistrations(res.registrations || []);
      }
    } catch (err) {
      console.error('Failed to load registrations:', err);
      toast.error('Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [activeTab]);

  const handleCancelRegistration = async () => {
    if (!selectedRegForCancel) return;
    setActionLoading(true);
    try {
      const res = await registrationService.cancelRegistration(selectedRegForCancel.event._id);
      if (res.success) {
        toast.success('Registration cancelled successfully. Your seat has been released.');
        setSelectedRegForCancel(null);
        await fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReRegister = async (eventId) => {
    setActionLoading(true);
    try {
      const res = await registrationService.registerForEvent(eventId);
      if (res.success) {
        toast.success('Seat reactivated successfully! Welcome back.');
        await fetchRegistrations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reactivate registration.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Registrations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review all confirmed passes, access virtual credentials, or release seats.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Registrations
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Upcoming Events
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'past'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Past / Completed
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'cancelled'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading your registrations..." />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No registrations found"
          description="You don't have any event registrations matching this category."
          actionText="Discover Events"
          actionLink="/events"
        />
      ) : (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const ev = reg.event;
            if (!ev) return null;

            const isPast = new Date(ev.date) < new Date();
            const isCancelled = reg.status === 'cancelled';
            const isEventCancelled = ev.status === 'cancelled';

            return (
              <div
                key={reg._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:border-brand-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Event Details */}
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="purple" size="sm">
                      {ev.category}
                    </Badge>
                    <Badge
                      variant={isCancelled ? 'danger' : isPast ? 'default' : 'success'}
                      size="sm"
                    >
                      {isCancelled ? 'Registration Cancelled' : isPast ? 'Event Concluded' : 'Seat Confirmed'}
                    </Badge>
                    {isEventCancelled && (
                      <Badge variant="danger" size="sm">
                        Event Cancelled by Host
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    <Link to={`/events/${ev._id}`} className="hover:text-brand-600 transition-colors">
                      {ev.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <span>{new Date(ev.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-600" />
                      <span>{ev.startTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {ev.eventType === 'online' ? (
                        <>
                          <Video className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Online Event</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span className="truncate">{ev.location}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Registered Timestamp */}
                  <div className="text-[11px] text-slate-400">
                    Registered on: {new Date(reg.registeredAt).toLocaleString()}
                    {reg.cancelledAt && (
                      <span className="text-rose-500 ml-2 font-medium">
                        • Cancelled on: {new Date(reg.cancelledAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2.5 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    to={`/events/${ev._id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                  >
                    View Details
                  </Link>

                  {/* Virtual link if active registration and online */}
                  {!isCancelled && ev.eventType === 'online' && ev.meetingUrl && (
                    <a
                      href={ev.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {/* Cancel Button if active and upcoming */}
                  {!isCancelled && !isPast && (
                    <button
                      type="button"
                      onClick={() => setSelectedRegForCancel(reg)}
                      className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Cancel Reservation
                    </button>
                  )}

                  {/* Re-register Button if previously cancelled */}
                  {isCancelled && !isPast && !isEventCancelled && !ev.isFull && (
                    <button
                      type="button"
                      onClick={() => handleReRegister(ev._id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-register Seat</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={!!selectedRegForCancel}
        title="Cancel Event Reservation?"
        message={`Are you sure you want to release your seat for "${selectedRegForCancel?.event?.title}"? You can re-register later if seats remain available.`}
        confirmText="Confirm Cancellation"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleCancelRegistration}
        onCancel={() => setSelectedRegForCancel(null)}
      />
    </div>
  );
};

export default MyRegistrationsPage;
