import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'SU Election', path: '/elections' },
    { name: 'Huel Voting', path: '/huels' },
    { name: 'Departments/Clubs', path: '/departments' },
    { name: 'Contributors', path: '/contributors' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-theme-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="text-theme-accent-yellow font-bold text-2xl">POLLZ</div>
              <div className="hidden sm:block text-theme-light-gray text-xs">
                PILANI UNIFIED VOTING SYSTEM
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  isActive(item.path)
                    ? 'text-theme-accent-yellow border-b-2 border-theme-accent-yellow'
                    : 'text-theme-light-gray hover:text-theme-warm-yellow'
                } px-3 py-2 text-sm font-medium transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="ml-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-theme-light-gray text-sm">{user.name}</span>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <GoogleAuthButton />
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-theme-light-gray hover:text-theme-warm-yellow focus:outline-none"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`${
                    isActive(item.path)
                      ? 'bg-theme-accent-yellow text-theme-black'
                      : 'text-theme-light-gray hover:bg-theme-dark-gray'
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-2">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 text-theme-light-gray px-3">
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded mx-3"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2">
                    <GoogleAuthButton />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;