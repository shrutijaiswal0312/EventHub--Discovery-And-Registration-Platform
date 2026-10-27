import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Video, Users, ArrowRight } from 'lucide-react';
import Badge from './Badge';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

const EventCard = ({ event }) => {
  if (!event) return null;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
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

  // Determine status badge
  let statusBadgeVariant = 'success';
  let statusBadgeText = 'Open for Registration';

  if (isCancelled) {
    statusBadgeVariant = 'danger';
    statusBadgeText = 'Cancelled';
  } else if (isCompleted) {
    statusBadgeVariant = 'default';
    statusBadgeText = 'Completed';
  } else if (isFull) {
    statusBadgeVariant = 'warning';
    statusBadgeText = 'Sold Out';
  } else if (remaining <= 5) {
    statusBadgeVariant = 'warning';
    statusBadgeText = `Only ${remaining} left!`;
  }

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-300 flex flex-col">
      {/* Cover Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        <img
          src={event.coverImage || FALLBACK_IMAGE}
          alt={event.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Category Pill on top left */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="purple" size="sm" className="backdrop-blur-md bg-white/90 shadow-sm font-semibold">
            {event.category}
          </Badge>
        </div>

        {/* Status Pill on top right */}
        <div className="absolute top-3 right-3">
          <Badge variant={statusBadgeVariant} size="sm" className="backdrop-blur-md bg-white/90 shadow-sm font-semibold">
            {statusBadgeText}
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-2">
            {event.title}
          </h3>

          <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>

          {/* Meta Details */}
          <div className="space-y-2 text-xs font-medium text-slate-500 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{formattedDate}</span>
              <span className="text-slate-300">•</span>
              <Clock className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{event.startTime}</span>
            </div>

            <div className="flex items-center gap-2">
              {event.eventType === 'online' ? (
                <>
                  <Video className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate text-emerald-700 font-semibold">Online Event</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </>
              )}
            </div>

            {event.organizer && (
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span>By {event.organizer.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Seat Availability & Action */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-500">
              {registered} / {capacity} Registered
            </span>
            <span className={remaining === 0 ? 'text-rose-600' : 'text-brand-600'}>
              {remaining} seat{remaining === 1 ? '' : 's'} left
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCancelled
                  ? 'bg-slate-300'
                  : isFull
                  ? 'bg-amber-500'
                  : 'bg-brand-600'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <Link
            to={`/events/${event._id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-600 hover:text-white rounded-xl transition-all duration-200"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
