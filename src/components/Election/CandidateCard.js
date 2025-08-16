import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiCheckCircle } from 'react-icons/fi';

const CandidateCard = ({ candidate, onVote, hasVoted, totalVotes }) => {
  const votePercentage = totalVotes > 0 ? ((candidate.vote_count / totalVotes) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-3 hover:shadow-lg transition-shadow flex flex-col items-center"
    >
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mb-2">
        {candidate.image ? (
          <img
            src={candidate.image}
            alt={candidate.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div class="flex items-center justify-center h-full text-xl font-bold text-gray-500">${candidate.name.charAt(0)}</div>`;
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FiUser className="text-2xl text-gray-400" />
          </div>
        )}
      </div>
      
      <h3 className="text-sm font-semibold text-gray-800 text-center">{candidate.name}</h3>
      {candidate.party && (
        <p className="text-xs text-gray-600 text-center mb-2">{candidate.party}</p>
      )}
      
      <div className="w-full mb-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${votePercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-theme-accent-yellow h-1.5 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-500 text-center mt-1">{votePercentage}% ({candidate.vote_count} votes)</p>
      </div>
      
      {hasVoted ? (
        <button
          disabled
          className="w-full bg-gray-100 text-gray-400 py-1.5 px-3 rounded text-xs flex items-center justify-center cursor-not-allowed"
        >
          <FiCheckCircle className="mr-1" />
          Voted
        </button>
      ) : (
        <button
          onClick={() => onVote(candidate.id)}
          className="w-full bg-theme-accent-yellow hover:bg-yellow-500 text-theme-black font-semibold py-1.5 px-3 rounded text-xs transition-colors"
        >
          Vote
        </button>
      )}
    </motion.div>
  );
};

export default CandidateCard;