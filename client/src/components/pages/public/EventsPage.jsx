import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  Layers,
  ArrowUpDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { eventService } from '../../../services/eventService';
import EventCard from '../../common/EventCard';
import LoadingSpinner from '../../common/LoadingSpinner';
import EmptyState from '../../common/EmptyState';
import Pagination from '../../common/Pagination';

const CATEGORIES = [
  'All',
  'Technology',
  'Business',
  'Education',
  'Workshop',
  'Conference',
  'Networking',
  'Webinar',
  'Other'
];

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL params
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialDateFilter = searchParams.get('dateFilter') || 'all';
  const initialEventType = searchParams.get('eventType') || 'all';
  const initialSort = searchParams.get('sort') || 'date_asc';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [dateFilter, setDateFilter] = useState(initialDateFilter);
  const [eventType, setEventType] = useState(initialEventType);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);

  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state to URL params whenever filters change
  const updateQueryParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val && val !== 'all' && val !== 'All') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = {
        page,
        limit: 9,
        sort
      };

      if (search.trim()) query.search = search.trim();
      if (category !== 'All') query.category = category;
      if (dateFilter !== 'all') query.dateFilter = dateFilter;
      if (eventType !== 'all') query.eventType = eventType;

      const res = await eventService.getEvents(query);
      if (res.success) {
        setEvents(res.events || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Unable to load events. Please verify the backend is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, category, dateFilter, eventType, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateQueryParams({ search, page: '1' });
    fetchEvents();
  };

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setPage(1);
    updateQueryParams({ category: newCat, page: '1' });
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setDateFilter('all');
    setEventType('all');
    setSort('date_asc');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Discover Events
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore upcoming conferences, workshops, and meetups. Filter by format, date, and domain.
        </p>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        {/* Top Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title, location, or keywords..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-brand-500 transition-colors text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
                updateQueryParams({ dateFilter: e.target.value, page: '1' });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="all">Any Date</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
            </select>
          </div>

          {/* Event Type (Online / Offline) */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Format</label>
            <select
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(1);
                updateQueryParams({ eventType: e.target.value, page: '1' });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Formats</option>
              <option value="online">Online / Virtual</option>
              <option value="offline">In-Person / On-Site</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Sort By</label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
                updateQueryParams({ sort: e.target.value, page: '1' });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="date_asc">Date: Earliest First</option>
              <option value="date_desc">Date: Latest First</option>
              <option value="created_desc">Newly Created</option>
              <option value="capacity_desc">Capacity: Largest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(search || category !== 'All' || dateFilter !== 'all' || eventType !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Filters applied • <span className="font-bold text-slate-900">{total}</span> event{total === 1 ? '' : 's'} found
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Events Listing Content */}
      {loading ? (
        <LoadingSpinner size="lg" message="Loading matching events..." />
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold">
          {error}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events match your criteria"
          description="Try broadening your search keywords or resetting your category and date filters."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>

          {/* Scalable Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              setPage(newPage);
              updateQueryParams({ page: newPage.toString() });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
};

export default EventsPage;
