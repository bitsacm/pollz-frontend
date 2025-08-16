import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiShield, FiGithub } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VotingSection from '../components/Election/VotingSection';
import LiveChat from '../components/Chat/LiveChat';
import api from '../services/api';

const SUElection = () => {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [electionStats, setElectionStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElectionStats();
  }, []);

  const fetchElectionStats = async () => {
    try {
      const response = await api.get(`/main/elections/live-stats/?t=${Date.now()}`);
      setElectionStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching election stats:', error);
      setLoading(false);
    }
  };

  const totalVotes = electionStats?.total_votes_cast || 0;

  return (
    <div className="h-screen bg-theme-light-gray flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold text-theme-black">
              Student Union Elections
            </h1>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-white border border-gray-300 rounded px-3 py-1 text-sm text-theme-black focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent"
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024 (Results)</option>
            </select>
            <span className="text-sm font-semibold text-theme-accent-yellow">
              Total Votes: {totalVotes}
            </span>
          </div>

          {selectedYear === 2025 && (
            <div className="bg-theme-pale-yellow border-l-4 border-theme-accent-yellow rounded-lg p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <FiShield className="mr-2 text-theme-accent-yellow" />
                <span className="text-sm font-medium text-theme-black">
                  Your vote is secure, anonymous & encrypted
                </span>
              </div>
              <a 
                href="https://github.com/your-repo/pollz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-theme-black hover:text-theme-accent-yellow font-medium underline inline-flex items-center"
              >
                <FiGithub className="mr-1" />
                View Source
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          {selectedYear === 2025 ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
                  {!user && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 m-4 mb-0 flex-shrink-0">
                      <p className="text-center text-gray-700 text-sm">
                        Please login to cast your vote
                      </p>
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto p-4 pb-6">
                    <VotingSection />
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <LiveChat />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-3xl font-bold text-center text-theme-black mb-8">
                🏆 Election Results 2024
              </h2>
              <div className="text-center text-gray-600">
                <p>Results for 2024 elections will be displayed here</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SUElection;