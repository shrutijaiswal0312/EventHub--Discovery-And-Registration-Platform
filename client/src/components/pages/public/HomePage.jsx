import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Calendar,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Laptop,
  Briefcase,
  GraduationCap,
  Wrench,
  Users2,
  Video,
  Layers
} from 'lucide-react';
import { eventService } from '../../../services/eventService';
import EventCard from '../../common/EventCard';
import LoadingSpinner from '../../common/LoadingSpinner';

const CATEGORIES = [
  { name: 'Technology', icon: Laptop, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'Workshop', icon: Wrench, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { name: 'Business', icon: Briefcase, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { name: 'Webinar', icon: Video, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { name: 'Conference', icon: Users2, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { name: 'Education', icon: GraduationCap, color: 'text-teal-600 bg-teal-50 border-teal-200' }
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await eventService.getEvents({ limit: 6, dateFilter: 'upcoming', status: 'published' });
        if (res.success) {
          setFeaturedEvents(res.events || []);
        }
      } catch (err) {
        console.error('Failed to load featured events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-brand-50/60 via-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-800 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Next-Generation College Event Discovery Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
            Discover, Register & Experience{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              Unforgettable Events
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Browse verified workshops, tech colloquiums, hackathons, and networking meetups. Enjoy real-time seat reservation with zero overbooking.
          </p>

          {/* Interactive Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mb-10 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-3 w-full px-4 py-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event title, tech stack, or city..."
                className="w-full text-sm font-medium bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              Explore Now
            </button>
          </form>

          {/* Quick Stats / Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/70 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Live Events</div>
                <div className="text-xs text-slate-500 font-medium">Updated Real-Time</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/70 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Atomic Locks</div>
                <div className="text-xs text-slate-500 font-medium">Safe Concurrency</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/70 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Two Roles</div>
                <div className="text-xs text-slate-500 font-medium">Attendee & Host</div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/70 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Instant Pass</div>
                <div className="text-xs text-slate-500 font-medium">1-Click Booking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Browse by Category</h2>
            <p className="text-sm text-slate-500 mt-1">Discover activities tailored to your specialized interests.</p>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 group mt-2 sm:mt-0"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/events?category=${encodeURIComponent(cat.name)}`}
                className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-400 hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${cat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Featured Upcoming Events</h2>
            <p className="text-sm text-slate-500 mt-1">Popular seminars and workshops with open seats right now.</p>
          </div>
          <Link
            to="/events"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 group mt-2 sm:mt-0"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner size="lg" message="Loading live events from database..." />
        ) : featuredEvents.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No upcoming events found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        )}
      </section>

      {/* How EventHub Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-navy-900 via-navy-950 to-brand-950 text-white rounded-3xl p-8 sm:p-12 md:p-16 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block mb-2">
              Architecture & Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              How EventHub Powers Flawless Event Journeys
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Designed according to modern distributed software engineering principles, ensuring accurate registration state and seamless organizer oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Discover & Filter</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Search with instant multi-facet filters across categories, schedules, locations, and attendance types (virtual or on-site).
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Atomic Reservation</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Register in one click. Our MongoDB atomic locks decrement available seats safely, preventing overbooking even under high concurrency.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Manage & Attend</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Participants access private meeting URLs and ticket records. Organizers monitor occupancy rates, view attendee rosters, and view real-time metrics.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-300">
              Ready to host your own tech summit or college workshop?
            </div>
            <Link
              to="/register"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
            >
              Get Started as Organizer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
