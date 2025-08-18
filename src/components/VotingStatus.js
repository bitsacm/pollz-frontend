import React from 'react';
import { motion } from 'framer-motion';
import useVotingStatus from '../hooks/useVotingStatus';

const VotingStatus = ({ className = '' }) => {
  const {
    loading,
    error,
    getStatusMessage,
    isVotingAllowed,
    refreshStatus
  } = useVotingStatus();

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading voting status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <span className="text-red-800">Error loading voting status</span>
          </div>
          <button
            onClick={refreshStatus}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statusMessage = getStatusMessage();
  const votingAllowed = isVotingAllowed();

  if (!votingAllowed) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-sm text-gray-600">
          {statusMessage}
        </p>
      </div>
    );
  }

  return null; // Don't show anything when voting is allowed
};

export default VotingStatus;