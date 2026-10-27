const getSeedData = () => {
  const now = new Date();

  // Helper date calculators
  const futureDays = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  const pastDays = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  const users = [
    {
      name: 'Alex Vance',
      email: 'organizer@eventhub.com',
      password: 'Password123!',
      role: 'organizer'
    },
    {
      name: 'Sarah Connor',
      email: 'sarah.organizer@eventhub.com',
      password: 'Password123!',
      role: 'organizer'
    },
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      role: 'participant'
    },
    {
      name: 'Emma Watson',
      email: 'emma@example.com',
      password: 'Password123!',
      role: 'participant'
    },
    {
      name: 'Michael Chang',
      email: 'michael@example.com',
      password: 'Password123!',
      role: 'participant'
    },
    {
      name: 'Sophia Rodriguez',
      email: 'sophia@example.com',
      password: 'Password123!',
      role: 'participant'
    }
  ];

  const events = [
    {
      title: 'Global AI & Machine Learning Summit 2026',
      description: 'Explore the newest breakthroughs in generative models, reinforcement learning, and autonomous systems with world-renowned AI researchers and enterprise leaders. Includes keynotes, technical panels, and hands-on demonstrations.',
      category: 'Technology',
      date: futureDays(14),
      startTime: '09:00 AM',
      endTime: '05:30 PM',
      location: 'Metropolitan Convention Center, Hall A, San Francisco, CA',
      eventType: 'offline',
      capacity: 50,
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      status: 'published'
    },
    {
      title: 'Full-Stack Web Development Masterclass',
      description: 'An intensive, hands-on workshop covering production MERN architecture, atomic database concurrency, scalable state management, and containerized deployment.',
      category: 'Workshop',
      date: futureDays(7),
      startTime: '10:00 AM',
      endTime: '02:00 PM',
      location: 'Online Live Stream',
      eventType: 'online',
      meetingUrl: 'https://meet.google.com/abc-efgh-ijk',
      capacity: 3, // Full event intentionally seeded
      coverImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
      status: 'published'
    },
    {
      title: 'Venture Capital & Startup Pitch Night',
      description: 'Connect with angel investors, seed funds, and visionary founders. Pitch your product or watch 12 pre-screened early-stage startups compete for capital and strategic mentorship.',
      category: 'Business',
      date: futureDays(21),
      startTime: '06:00 PM',
      endTime: '09:30 PM',
      location: 'Innovation Hub, 450 Silicon Ave, Austin, TX',
      eventType: 'offline',
      capacity: 25,
      coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      status: 'published'
    },
    {
      title: 'Modern UI/UX Design Systems Webinar',
      description: 'Deep dive into responsive layout mechanics, accessible color contrast systems, micro-interactions, and design token integration in React applications.',
      category: 'Webinar',
      date: futureDays(10),
      startTime: '03:00 PM',
      endTime: '05:00 PM',
      location: 'Interactive Webinar Stream',
      eventType: 'online',
      meetingUrl: 'https://zoom.us/j/987654321',
      capacity: 100,
      coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
      status: 'published'
    },
    {
      title: 'Blockchain & Decentralized Systems Colloquium',
      description: 'Notice: This session has been cancelled due to keynote schedule realignment. Registrations are frozen and retained for archival records.',
      category: 'Conference',
      date: futureDays(30),
      startTime: '09:30 AM',
      endTime: '04:00 PM',
      location: 'Grand Auditorium, Seattle, WA',
      eventType: 'offline',
      capacity: 40,
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      status: 'cancelled'
    },
    {
      title: 'Annual Higher Education Leadership Forum 2026',
      description: 'A retrospective academic symposium reviewing student lifecycle innovations, hybrid learning platforms, and digital assessment frameworks.',
      category: 'Education',
      date: pastDays(12),
      startTime: '09:00 AM',
      endTime: '04:30 PM',
      location: 'Academic Hall, Boston, MA',
      eventType: 'offline',
      capacity: 30,
      coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      status: 'completed'
    },
    {
      title: 'Creative Founders & Freelancers Networking Mixer',
      description: 'Casual evening networking for tech freelancers, agency owners, digital artists, and open-source contributors. Light refreshments provided.',
      category: 'Networking',
      date: futureDays(18),
      startTime: '07:00 PM',
      endTime: '10:00 PM',
      location: 'Skyline Lounge, New York, NY',
      eventType: 'offline',
      capacity: 20,
      coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
      status: 'published'
    }
  ];

  return { users, events };
};

module.exports = { getSeedData };
