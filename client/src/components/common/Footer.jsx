import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Heart, Shield, Award } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Event<span className="text-brand-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Modern full-stack event discovery, registration, and attendance management platform. Built with MongoDB, Express, React, and Node.js.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs text-brand-300">
              <Award className="w-3.5 h-3.5 text-brand-400" />
              <span>Academic Engineering Capstone</span>
            </div>
          </div>

          {/* Event Categories */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Explore Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events?category=Technology" className="hover:text-white transition-colors">
                  Technology & AI
                </Link>
              </li>
              <li>
                <Link to="/events?category=Workshop" className="hover:text-white transition-colors">
                  Hands-on Workshops
                </Link>
              </li>
              <li>
                <Link to="/events?category=Business" className="hover:text-white transition-colors">
                  Business & Startups
                </Link>
              </li>
              <li>
                <Link to="/events?category=Webinar" className="hover:text-white transition-colors">
                  Online Webinars
                </Link>
              </li>
              <li>
                <Link to="/events?category=Networking" className="hover:text-white transition-colors">
                  Community Networking
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Platform Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Browse All Events
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/organizer/dashboard" className="hover:text-white transition-colors">
                  Organizer Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Reliability */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">
              Architecture & Security
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Atomic Capacity Locks</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>JWT & HttpOnly Session Cookies</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Zero Double-Booking Guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>OWASP Sanitization & Rate Limits</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} EventHub Platform. All rights reserved. Built for College Academic Project Submission.
          </div>
          <div className="flex items-center gap-1">
            <span>Engineered with precision for the MERN Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
