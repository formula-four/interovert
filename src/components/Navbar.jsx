import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, LayoutDashboard, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/session';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const [email, setEmail] = useState('');

  useEffect(() => {
    const updateProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    const currentUser = getCurrentUser();
    if (currentUser?.email) setEmail(currentUser.email);

    window.addEventListener('scroll', updateProgress);
    const onStorage = () => {
      const updated = getCurrentUser();
      setEmail(updated?.email || '');
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [userMenuOpen]);

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  const progressBarLeft = {
    width: `${scrollProgress / 2}%`,
    right: '50%'
  };

  const progressBarRight = {
    width: `${scrollProgress / 2}%`,
    left: '50%'
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const navOffset = 84;
    const y = section.getBoundingClientRect().top + window.pageYOffset - navOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const handleNavItemClick = (item) => {
    const sectionId = item.toLowerCase();
    setIsMenuOpen(false);

    if (location.pathname === '/') {
      scrollToSection(sectionId);
      return;
    }

    navigate(`/#${sectionId}`);
  };

  return (
    <>
      <div className="fixed top-0 z-50 w-full h-1">
        <div className="absolute h-full bg-indigo-600 transition-all duration-300" style={progressBarLeft} />
        <div className="absolute h-full bg-indigo-600 transition-all duration-300" style={progressBarRight} />
      </div>


      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-indigo-600"
              >
                Find My Buddy
              </motion.div>
            </Link>


            <div className="hidden md:flex items-center space-x-8">
              <Link to="/events">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  Events
                </motion.span>
              </Link>
              {['Features', 'Explore', 'Community', 'Blog'].map((item) => (
                <motion.button
                  key={item}
                  type="button"
                  onClick={() => handleNavItemClick(item)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  {item}
                </motion.button>
              ))}
              {email ? (
                <div ref={userMenuRef} className="group relative pl-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Account menu"
                    aria-label="Open account menu"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    {email.charAt(0).toUpperCase()}
                  </motion.button>
                  <div
                    role="menu"
                    aria-label="Account menu"
                    className={`absolute right-0 top-full z-50 mt-2 min-w-[13rem] rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 transition-all duration-150 ${
                      userMenuOpen
                        ? 'visible translate-y-0 opacity-100'
                        : 'invisible -translate-y-1 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100'
                    }`}
                  >
                    <Link
                      to="/dashboard"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <LayoutDashboard className="h-4 w-4 text-indigo-600" aria-hidden />
                      My dashboard
                    </Link>
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <User className="h-4 w-4 text-indigo-600" aria-hidden />
                      My profile
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-full transition-colors hover:bg-indigo-600 hover:text-white"
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-white bg-indigo-600 rounded-full transition-colors hover:bg-indigo-700"
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}

            </div>


            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>


        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 pt-2 pb-4 space-y-4">
              <Link
                to="/events"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Events
              </Link>
              {['Features', 'Explore', 'Community', 'Blog'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleNavItemClick(item)}
                  className="block text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  {item}
                </button>
              ))}
              {email ? (
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <p className="text-center text-xs font-medium text-gray-500">Account</p>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    My dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <User className="h-4 w-4" />
                    My profile
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <button className="flex w-full items-center justify-center gap-2 rounded-full border border-indigo-600 px-4 py-2 text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white">
                      Login
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </nav>

    </>
  )
}

export default Navbar
