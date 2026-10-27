import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventCard from '../components/common/EventCard';

describe('EventCard Component', () => {
  const mockEvent = {
    _id: '60d5ecb8b5c9c611f8b1e4a1',
    title: 'AI Robotics Workshop',
    description: 'Learn modern robotic vision and sensor fusion models.',
    category: 'Technology',
    date: new Date('2026-11-20T10:00:00Z'),
    startTime: '10:00 AM',
    endTime: '03:00 PM',
    location: 'Robotics Lab Room 4',
    eventType: 'offline',
    capacity: 20,
    registeredCount: 5,
    status: 'published'
  };

  it('renders event title, category, and seat statistics accurately', () => {
    render(
      <BrowserRouter>
        <EventCard event={mockEvent} />
      </BrowserRouter>
    );

    expect(screen.getByText('AI Robotics Workshop')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText(/5 \/ 20 Registered/i)).toBeInTheDocument();
    expect(screen.getByText(/15 seats left/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Details/i })).toHaveAttribute(
      'href',
      '/events/60d5ecb8b5c9c611f8b1e4a1'
    );
  });

  it('renders sold out status when event is full', () => {
    const fullEvent = {
      ...mockEvent,
      capacity: 10,
      registeredCount: 10
    };

    render(
      <BrowserRouter>
        <EventCard event={fullEvent} />
      </BrowserRouter>
    );

    expect(screen.getByText('Sold Out')).toBeInTheDocument();
    expect(screen.getByText(/0 seats left/i)).toBeInTheDocument();
  });
});
