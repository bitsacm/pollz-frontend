import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import bitsImage from '../assets/bits-old-school.png';

const LandingPage = () => {
  const [selectedYear, setSelectedYear] = useState(2024);

  const electionData = {
    2024: {
      president: {
        winner: {
          name: 'Ahaan',
          image: '/images/ahaan.jpeg',
          percentage: 52.9,
        },
        runnerUp: {
          name: 'Khurana',
          image: '/images/khurana.jpeg',
          percentage: 65.84,
        },
      },
      status: 'completed',
    },
    2025: {
      status: 'upcoming',
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with BITS Pilani Image */}
      <div className="relative h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bitsImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-theme-black/70 via-theme-dark-gray/50 to-theme-black/80" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold text-theme-accent-yellow mb-4"
          >
            POLLZ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-center max-w-2xl text-theme-light-gray"
          >
            PILANI UNIFIED VOTING SYSTEM
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg mt-4 text-center max-w-3xl text-theme-light-gray"
          >
            Empowering democratic participation across campus elections, course feedback, and department activities
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <Link to="/elections" className="bg-theme-accent-yellow hover:bg-theme-warm-yellow text-theme-black font-bold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg">
              View Elections
            </Link>
            <Link to="/huels" className="bg-theme-light-gray hover:bg-gray-300 text-theme-black font-bold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg">
              Rate Courses
            </Link>
            <Link to="/departments" className="bg-theme-dark-gray hover:bg-gray-600 text-theme-pale-yellow font-bold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg">
              Club Voting
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;