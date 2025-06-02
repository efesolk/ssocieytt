import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              ssocieyt
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Connect with fellow gamers, share your gaming moments, and stay updated with the latest in gaming.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/messages" className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500">
                  Messages
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-700 mt-8 pt-8 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} ssocieyt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};