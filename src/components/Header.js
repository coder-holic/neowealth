import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiMenu, BiX, BiLogIn } from 'react-icons/bi';
import { Link } from 'react-router-dom';

// Extend Link with motion to support Framer Motion animations
const MotionLink = motion(Link);

const trackClick = (event) => console.log(`${event} clicked`);

const Header = ({ isScrolled }) => {
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);

  const navItemVariants = {
    hover: { scale: 1.1, color: '#e59d02', transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20, transition: { duration: 0.3 } },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, staggerChildren: 0.05 } },
  };

  const mobileNavItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const navLinks = [
    'home',
    'about',
    'features',
    'services',
    'testimonials',
    'pricing',
    'faq',
    'team',
    'contact',
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gradient-to-r from-[#1b1a1a]/95 to-[#2a2929]/95 backdrop-blur-lg shadow-xl'
          : 'bg-gradient-to-r from-[#040000]/80 to-[#1b1a1a]/80'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
        {/* Logo + Mobile Menu Toggle */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <MotionLink
            to="/"
            className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#e59d02] to-[#ffca5b]"
            onClick={() => trackClick('Logo')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            NEOWEALTH
          </MotionLink>
          <motion.button
            className="sm:hidden text-white text-3xl ml-4"
            onClick={() => setIsMobileNavActive(!isMobileNavActive)}
            aria-expanded={isMobileNavActive}
            aria-label="Toggle navigation menu"
            whileTap={{ scale: 0.9 }}
          >
            {isMobileNavActive ? <BiX /> : <BiMenu />}
          </motion.button>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex sm:items-center space-x-4">
          {navLinks.map((item) => (
            <motion.a
              key={item}
              href={`#${item}`}
              className="px-3 py-1 text-sm font-medium text-white hover:text-[#e59d02] transition-colors duration-200"
              onClick={() => trackClick(`Nav_${item}`)}
              variants={navItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </motion.a>
          ))}
          <MotionLink
            to="/login"
            className="px-4 py-1 bg-[#e59d02] text-white rounded-full font-semibold text-sm flex items-center justify-center hover:shadow-lg transition-all duration-200"
            onClick={() => trackClick('Login')}
            variants={navItemVariants}
            whileHover={{ scale: 1.05, backgroundColor: '#ffca5b' }}
            whileTap={{ scale: 0.95 }}
          >
            <BiLogIn className="mr-1" size={20} />
            Login
          </MotionLink>
        </nav>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileNavActive && (
            <motion.nav
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="sm:hidden flex flex-col w-full bg-[#1b1a1a]/95 mt-4 py-4 rounded-md shadow-lg"
            >
              {navLinks.map((item) => (
                <motion.a
                  key={item}
                  href={`#${item}`}
                  className="px-4 py-2 text-white hover:text-[#e59d02] text-center font-medium"
                  onClick={() => {
                    setIsMobileNavActive(false);
                    trackClick(`Nav_${item}`);
                  }}
                  variants={mobileNavItemVariants}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </motion.a>
              ))}
              <MotionLink
                to="/login"
                className="mx-4 mt-2 px-4 py-2 bg-[#e59d02] text-white rounded-full font-semibold flex items-center justify-center hover:shadow-lg transition-all duration-200"
                onClick={() => {
                  setIsMobileNavActive(false);
                  trackClick('Login');
                }}
                variants={mobileNavItemVariants}
                whileHover={{ scale: 1.05, backgroundColor: '#ffca5b' }}
                whileTap={{ scale: 0.95 }}
              >
                <BiLogIn className="mr-1" size={20} />
                Login
              </MotionLink>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;