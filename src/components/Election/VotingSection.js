import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CandidateCard from './CandidateCard';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VotingSection = () => {
  const { user, login } = useAuth();
  const [candidates, setCandidates] = useState({
    president: [],
    gensec: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, [user]);

  const fetchCandidates = async () => {
    try {
      const response = await api.get('/main/elections/candidates-by-position/');
      setCandidates(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to load candidates');
      setLoading(false);
    }
  };

  const handleVote = async (candidateId, position) => {
    if (!user) {
      toast.warning('Please login to vote');
      return;
    }

    try {
      const response = await api.post('/main/elections/cast-anonymous-vote/', {
        candidate_id: candidateId
      });
      
      toast.success(response.data.success);
      
      // Refresh user data to get updated voting flags
      try {
        const userResponse = await api.get('/main/auth/profile/');
        login(userResponse.data);
      } catch (error) {
        console.error('Error refreshing user data:', error);
        // Fallback to page reload if API call fails
        window.location.reload();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to cast vote';
      toast.error(errorMessage);
    }
  };

  const getTotalVotes = (position) => {
    const positionCandidates = candidates[position] || [];
    return positionCandidates.reduce((total, candidate) => total + candidate.vote_count, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent-yellow"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <span className="bg-theme-accent-yellow text-theme-black px-2 py-1 rounded text-sm mr-2">
            President
          </span>
          {user?.voted_president && (
            <span className="text-xs text-green-600 font-normal">✓ You voted</span>
          )}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {candidates.president.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onVote={(id) => handleVote(id, 'President')}
              hasVoted={user?.voted_president}
              totalVotes={getTotalVotes('president')}
            />
          ))}
          {candidates.president.length === 0 && (
            <div className="col-span-full bg-gray-100 rounded-lg p-3 text-center text-gray-500 text-sm">
              No candidates available for President position yet
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <span className="bg-theme-accent-yellow text-theme-black px-2 py-1 rounded text-sm mr-2">
            General Secretary
          </span>
          {user?.voted_gen_sec && (
            <span className="text-xs text-green-600 font-normal">✓ You voted</span>
          )}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {candidates.gensec.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onVote={(id) => handleVote(id, 'General Secretary')}
              hasVoted={user?.voted_gen_sec}
              totalVotes={getTotalVotes('gensec')}
            />
          ))}
          {candidates.gensec.length === 0 && (
            <div className="col-span-full bg-gray-100 rounded-lg p-3 text-center text-gray-500 text-sm">
              No candidates available for General Secretary position yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VotingSection;