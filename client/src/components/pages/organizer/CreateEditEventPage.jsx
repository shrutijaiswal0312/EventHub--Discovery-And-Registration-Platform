import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Video,
  Users,
  Image,
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { eventService } from '../../../services/eventService';
import LoadingSpinner from '../../common/LoadingSpinner';

const CATEGORIES = [
  'Technology',
  'Business',
  'Education',
  'Workshop',
  'Conference',
  'Networking',
  'Webinar',
  'Other'
];

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const str = timeStr.trim().toLowerCase();
  const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3];
    if (hours === 12) hours = 0;
    if (meridiem === 'pm') hours += 12;
    return hours * 60 + minutes;
  }
  const match24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }
  return null;
};

const CreateEditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technology',
    date: '',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    location: '',
    eventType: 'offline',
    meetingUrl: '',
    coverImage: '',
    capacity: 50,
    status: 'published'
  });

  const [registeredCount, setRegisteredCount] = useState(0);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const loadEvent = async () => {
        try {
          const res = await eventService.getEventById(id);
          if (res.success && res.event) {
            const ev = res.event;
            // Format ISO date to YYYY-MM-DD for <input type="date" />
            const dateStr = ev.date ? new Date(ev.date).toISOString().split('T')[0] : '';
            setFormData({
              title: ev.title || '',
              description: ev.description || '',
              category: ev.category || 'Technology',
              date: dateStr,
              startTime: ev.startTime || '09:00 AM',
              endTime: ev.endTime || '05:00 PM',
              location: ev.location || '',
              eventType: ev.eventType || 'offline',
              meetingUrl: ev.meetingUrl || '',
              coverImage: ev.coverImage || '',
              capacity: ev.capacity || 50,
              status: ev.status || 'published'
            });
            setRegisteredCount(ev.registeredCount || 0);
          }
        } catch (err) {
          toast.error('Failed to load event data for editing.');
          navigate('/organizer/events');
        } finally {
          setLoading(false);
        }
      };

      loadEvent();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation 1: Required fields
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.date ||
      !formData.startTime.trim() ||
      !formData.endTime.trim() ||
      !formData.location.trim()
    ) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    // Validation 2: Time comparison
    const startMins = parseTimeToMinutes(formData.startTime);
    const endMins = parseTimeToMinutes(formData.endTime);
    if (startMins === null) {
      setErrorMessage('Invalid start time format (e.g. 09:00 AM or 09:00).');
      return;
    }
    if (endMins === null) {
      setErrorMessage('Invalid end time format (e.g. 05:00 PM or 17:00).');
      return;
    }
    if (endMins <= startMins) {
      setErrorMessage('End time must be later than start time.');
      return;
    }

    // Validation 3: Capacity
    const capacityNum = parseInt(formData.capacity, 10);
    if (isNaN(capacityNum) || capacityNum < 1) {
      setErrorMessage('Capacity must be a positive number of at least 1.');
      return;
    }

    if (isEditMode && capacityNum < registeredCount) {
      setErrorMessage(
        `Cannot reduce capacity to ${capacityNum}. Event already has ${registeredCount} confirmed active registrations.`
      );
      return;
    }

    // Validation 4: URLs
    if (formData.meetingUrl && !formData.meetingUrl.startsWith('http')) {
      setErrorMessage('Meeting URL must start with http:// or https://');
      return;
    }
    if (formData.coverImage && !formData.coverImage.startsWith('http')) {
      setErrorMessage('Cover image URL must start with http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode) {
        const res = await eventService.updateEvent(id, {
          ...formData,
          capacity: capacityNum
        });
        if (res.success) {
          toast.success('Event updated successfully!');
          navigate('/organizer/events');
        }
      } else {
        const res = await eventService.createEvent({
          ...formData,
          capacity: capacityNum
        });
        if (res.success) {
          toast.success('Event created and published successfully!');
          navigate('/organizer/events');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading event details..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Event Details' : 'Create New Event'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode
              ? 'Update event metadata, time, venue, and capacity limits.'
              : 'Fill in event specifications to publish to the community discovery directory.'}
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold leading-relaxed flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. AI & Cloud Computing Colloquium 2026"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a comprehensive summary of the schedule, keynotes, topics covered, and prerequisite knowledge..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900 resize-y"
            />
          </div>

          {/* Category & Event Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Event Format *
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
              >
                <option value="offline">In-Person (On-Site Venue)</option>
                <option value="online">Online (Virtual Stream / Meeting)</option>
              </select>
            </div>
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Event Date *
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <input
                type="text"
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                placeholder="e.g. 09:00 AM"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time *
              </label>
              <input
                type="text"
                name="endTime"
                required
                value={formData.endTime}
                onChange={handleChange}
                placeholder="e.g. 05:00 PM"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
              />
            </div>
          </div>

          {/* Venue Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Location / Venue *
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder={
                formData.eventType === 'online'
                  ? 'e.g. Google Meet Live Stream'
                  : 'e.g. Engineering Block 3, Auditorium A, Boston, MA'
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
            />
          </div>

          {/* Online Meeting URL (Optional or Online) */}
          {formData.eventType === 'online' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Private Online Meeting URL (Protected)
              </label>
              <input
                type="url"
                name="meetingUrl"
                value={formData.meetingUrl}
                onChange={handleChange}
                placeholder="https://meet.google.com/xyz or https://zoom.us/j/..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
              />
              <p className="text-xs text-slate-400 mt-1">
                🔒 Note: This URL will only be visible to registered attendees and yourself.
              </p>
            </div>
          )}

          {/* Capacity & Cover Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Maximum Capacity (Seats) *
              </label>
              <input
                type="number"
                name="capacity"
                required
                min={isEditMode ? registeredCount : 1}
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
              />
              {isEditMode && registeredCount > 0 && (
                <p className="text-xs text-brand-600 font-semibold mt-1">
                  Current active registrations: {registeredCount} (Minimum allowable capacity is {registeredCount})
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cover Image URL (Optional)
              </label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
              />
            </div>
          </div>

          {/* Status (Only in Edit mode) */}
          {isEditMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Event Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-brand-500 text-slate-900"
              >
                <option value="published">Published (Active)</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed (Past)</option>
              </select>
            </div>
          )}

          {/* Submit Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/organizer/events"
              className="px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Event...' : isEditMode ? 'Update Event' : 'Publish Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditEventPage;
