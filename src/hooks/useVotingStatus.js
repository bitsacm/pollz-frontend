import { useState, useEffect } from 'react';
import api from '../services/api';

const useVotingStatus = () => {
  const [suElectionStatus, setSuElectionStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVotingStatus = async () => {
    try {
      setLoading(true);
      // Only fetch SU Election status
      const response = await api.get('/main/voting/status/su_election/');
      setSuElectionStatus(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching voting status:', error);
      setError(error.message);
      
      // Set default inactive status on error
      setSuElectionStatus({
        voting_type: 'su_election',
        status: 'inactive',
        message: 'Unable to load voting status. Please try again later.',
        is_voting_allowed: false,
        session_name: null,
        start_time: null,
        end_time: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotingStatus();
    
    // Refresh voting status every 60 seconds to catch time-based changes
    const interval = setInterval(fetchVotingStatus, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const isVotingAllowed = () => {
    return suElectionStatus.is_voting_allowed || false;
  };

  const getStatusMessage = () => {
    return suElectionStatus.message || 'Loading voting status...';
  };

  return {
    suElectionStatus,
    loading,
    error,
    refreshStatus: fetchVotingStatus,
    isVotingAllowed,
    getStatusMessage,
  };
};

export default useVotingStatus;