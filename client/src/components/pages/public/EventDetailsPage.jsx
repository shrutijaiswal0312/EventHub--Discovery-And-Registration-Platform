import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Share2,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { eventService } from '../../../services/eventService';
import { registrationService } from '../../../services/registrationService';
import Badge from '../../common/Badge';
import LoadingSpinner from '../../common/LoadingSpinner';
import ConfirmDialog from '../../common/ConfirmDialog';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isOrganizer, isParticipant } = useAuth();

  const [event, setEvent] = useState(null);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await eventService.getEventById(id);
      if (res.success) {
        setEvent(res.event);
        setIsUserRegistered(res.isUserRegistered || false);
        setIsOwner(res.isOwner || false);
      }
    } catch (err) {
      console.error('Failed to load event details:', err);
      toast.error('Event not found or failed to load.');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (isOrganizer) {
      toast.error('Organizers cannot register as participants for events.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await registrationService.registerForEvent(id);
      if (res.success) {
        toast.success(res.message || 'Seat reserved successfully!');
        setIsUserRegistered(true);
        // Refresh event data to update seat counts and get meeting URL if online
        await fetchEvent();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    setActionLoading(true);
    try {
      const res = await registrationService.cancelRegistration(id);
      if (res.success) {
        toast.success(res.message || 'Registration cancelled.');
        setIsUserRegistered(false);
        setConfirmCancelOpen(false);
        await fetchEvent();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel registration.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading event details..." />
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const registered = event.registeredCount || 0;
  const capacity = event.capacity || 1;
  const remaining = Math.max(0, capacity - registered);
  const percentage = Math.min(100, Math.round((registered / capacity) * 100));

  const isFull = registered >= capacity;
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Main Event Hero Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        {/* Cover Image */}
        <div className="relative aspect-[21/9] w-full bg-slate-900 overflow-hidden">
          <img
            src={event.coverImage || FALLBACK_IMAGE}
            alt={event.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2">
            <Badge variant="purple" size="lg" className="backdrop-blur-md bg-white/95 font-bold shadow-md">
              {event.category}
            </Badge>
            <Badge
              variant={isCancelled ? 'danger' : isCompleted ? 'default' : isFull ? 'warning' : 'success'}
              size="lg"
              className="backdrop-blur-md bg-white/95 font-bold shadow-md"
            >
              {isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : isFull ? 'Sold Out' : 'Open for Registration'}
            </Badge>
          </div>
        </div>

        {/* Hero Title & Primary Meta */}
        <div className="p-6 sm:p-8 md:p-10 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-600" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  {event.eventType === 'online' ? (
                    <>
                      <Video className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">Online Event</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>{event.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Organizer Card snippet */}
            {event.organizer && (
              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shrink-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                  {event.organizer.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Organized by</div>
                  <div className="text-sm font-bold text-slate-900">{event.organizer.name}</div>
                  <div className="text-xs text-slate-500">{event.organizer.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Event Body & Registration Action Sidebar */}
        <div className="p-6 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Description & Virtual Meeting Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">About this Event</h2>
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {event.description}
              </div>
            </div>

            {/* Private Virtual Meeting Link (Conditional per Security Rules) */}
            {event.eventType === 'online' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-brand-600" />
                  <span>Virtual Meeting Credentials</span>
                </h3>

                {isUserRegistered || isOwner ? (
                  event.meetingUrl ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500">
                        {isOwner
                          ? 'As the event host, this is your broadcast meeting URL:'
                          : 'As a confirmed participant, your private access link is unlocked:'}
                      </p>
                      <a
                        href={event.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                      >
                        <span>Join Live Video Meeting</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">
                      Meeting URL will be published shortly by the organizer.
                    </p>
                  )
                ) : (
                  <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Meeting link is private. Register for this event to access the live video stream.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Registration Card */}
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h3 className="text-base font-bold text-slate-900">Seat Reservation</h3>

              {/* Capacity Progress Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Confirmed Attendees</span>
                  <span className="text-slate-900">{registered} / {capacity}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCancelled
                        ? 'bg-slate-400'
                        : isFull
                        ? 'bg-amber-500'
                        : 'bg-brand-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>{percentage}% Occupied</span>
                  <span className={remaining === 0 ? 'text-rose-600 font-bold' : 'text-brand-600 font-bold'}>
                    {remaining} seat{remaining === 1 ? '' : 's'} remaining
                  </span>
                </div>
              </div>

              {/* Status Notifications */}
              {isCancelled && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>This event has been cancelled by the organizer.</span>
                </div>
              )}

              {isCompleted && (
                <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>This event has already concluded.</span>
                </div>
              )}

              {/* Action Buttons based on User Role & Status */}
              <div className="space-y-3">
                {isOwner ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-800 text-xs font-semibold">
                      You are the organizer of this event.
                    </div>
                    <Link
                      to={`/organizer/events/${event._id}/edit`}
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      Edit Event Details
                    </Link>
                    <Link
                      to={`/organizer/events/${event._id}/participants`}
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      Manage Attendees
                    </Link>
                  </div>
                ) : isUserRegistered ? (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>You have a confirmed reservation for this event.</span>
                    </div>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => setConfirmCancelOpen(true)}
                        disabled={actionLoading}
                        className="w-full px-4 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                ) : !isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => navigate('/login', { state: { from: location } })}
                    className="w-full px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                  >
                    Log In to Register
                  </button>
                ) : isOrganizer ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
                    You are logged in as an Organizer. Only participants can register for events.
                  </div>
                ) : isCancelled || isCompleted ? (
                  <button
                    type="button"
                    disabled
                    className="w-full px-4 py-3 bg-slate-200 text-slate-500 rounded-xl text-sm font-semibold cursor-not-allowed"
                  >
                    Registration Closed
                  </button>
                ) : isFull ? (
                  <button
                    type="button"
                    disabled
                    className="w-full px-4 py-3 bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-sm font-semibold cursor-not-allowed"
                  >
                    Event Sold Out (Full Capacity)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={actionLoading}
                    className="w-full px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-md disabled:opacity-50"
                  >
                    {actionLoading ? 'Reserving Seat...' : 'Register for Event (Free)'}
                  </button>
                )}
              </div>

              {/* Security & Concurrency Guarantee */}
              <div className="pt-4 border-t border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant atomic confirmation. Zero chance of overbooking.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Cancelling Registration */}
      <ConfirmDialog
        isOpen={confirmCancelOpen}
        title="Cancel Your Registration?"
        message={`Are you sure you want to cancel your seat for "${event.title}"? Your reserved seat will be immediately released for other attendees.`}
        confirmText="Yes, Cancel Seat"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleCancelRegistration}
        onCancel={() => setConfirmCancelOpen(false)}
      />
    </div>
  );
};

export default EventDetailsPage;
