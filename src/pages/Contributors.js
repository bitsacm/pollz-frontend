import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import pollzCreatorsImage from '../assets/pollzCreators.jpeg';

const Contributors = () => {
  const [projectInfo, setProjectInfo] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [creators, setCreators] = useState([]);
  const [regularContributors, setRegularContributors] = useState([]);
  const [allContributors, setAllContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsLoaded, setDetailsLoaded] = useState(new Set());
  const [contributorDetails, setContributorDetails] = useState({});
  const [loadingStats, setLoadingStats] = useState({
    commits: new Set(),
    lines: new Set()
  });
  const [statsLoaded, setStatsLoaded] = useState({
    commits: new Set(),
    lines: new Set()
  });
  const [error, setError] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState('all');
  const [expandedContributors, setExpandedContributors] = useState(new Set());

  useEffect(() => {
    fetchBasicContributorsData();
  }, []);

  useEffect(() => {
    // Load stats progressively for top 10 contributors after basic data loads
    if (allContributors.length > 0 && statsLoaded.commits.size === 0) {
      const topContributors = allContributors.slice(0, 10);
      const usernames = topContributors.map(c => c.username);
      
      // Load commits first (fastest)
      loadContributorStats('commits', usernames);
      
      // Then load lines after a short delay
      setTimeout(() => loadContributorStats('lines', usernames), 500);
    }
  }, [allContributors]);

  const fetchBasicContributorsData = async () => {
    try {
      setLoading(true);
      
      // Try new basic endpoint first, fallback to original if it fails
      let contributorsData = null;
      let projectData = null;
      
      try {
        // Fetch basic info - much faster!
        const [projectResponse, contributorsResponse] = await Promise.all([
          api.get('/main/contributions/project-info/'),
          api.get('/main/contributions/github-contributors-basic/')
        ]);
        
        projectData = projectResponse.data;
        contributorsData = contributorsResponse.data;
      } catch (basicErr) {
        console.warn('Basic endpoint failed, trying original endpoint:', basicErr);
        
        // Fallback to original endpoint
        try {
          const [projectResponse, contributorsResponse] = await Promise.all([
            api.get('/main/contributions/project-info/'),
            api.get('/main/contributions/github-contributors/')
          ]);
          
          projectData = projectResponse.data;
          contributorsData = contributorsResponse.data;
        } catch (fallbackErr) {
          throw new Error('Both endpoints failed');
        }
      }
      
      setProjectInfo(projectData);
      
      const basicContributors = contributorsData.contributors || [];
      const basicCreators = contributorsData.creators || [];
      const basicRegular = contributorsData.regular_contributors || [];
      
      // Initialize with basic data
      const contributorsWithDefaults = basicContributors.map(contributor => ({
        ...contributor,
        // Default values for details - will be updated when loaded
        total_commits: contributor.contributions_count || contributor.total_commits || 0,
        total_additions: contributor.total_additions || 0,
        total_deletions: contributor.total_deletions || 0,
        contributions: contributor.contributions || {
          backend: { commits: 0, additions: 0, deletions: 0 },
          frontend: { commits: 0, additions: 0, deletions: 0 },
          websocket: { commits: 0, additions: 0, deletions: 0 }
        },
        isProjectCreator: contributor.is_creator || contributor.isProjectCreator || false,
        detailsLoading: false,
        rank: contributor.rank || 0
      }));
      
      setContributors(contributorsWithDefaults);
      setCreators(basicCreators);
      setRegularContributors(basicRegular);
      setAllContributors(contributorsWithDefaults);
      
      // Initial ranking calculation
      setTimeout(() => recalculateRankings(), 100);
      
    } catch (err) {
      setError('Failed to fetch contributors data');
      console.error('Error fetching contributors:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadContributorStats = async (statType, usernames) => {
    if (!usernames || usernames.length === 0) return;
    
    try {
      // Mark these stats as loading for these users
      setLoadingStats(prev => ({
        ...prev,
        [statType]: new Set([...prev[statType], ...usernames])
      }));
      
      // Build query string
      const queryString = usernames.map(u => `username=${u}`).join('&');
      const endpoint = `/main/contributions/github-contributors-${statType}/?${queryString}`;
      
      try {
        const response = await api.get(endpoint);
        
        if (response.data && response.data.details) {
          const details = response.data.details;
          
          // Update allContributors with this specific stat type
          setAllContributors(prev => prev.map(contributor => {
            if (details[contributor.username]) {
              const statData = details[contributor.username];
              return {
                ...contributor,
                ...statData, // Merge the new stat data
                [`${statType}Loading`]: false
              };
            }
            return contributor;
          }));
          
          // Mark these stats as loaded
          setStatsLoaded(prev => ({
            ...prev,
            [statType]: new Set([...prev[statType], ...usernames])
          }));
          
          // Recalculate rankings after stats are updated
          setTimeout(() => recalculateRankings(), 100);
        }
      } catch (apiErr) {
        console.warn(`${statType} endpoint failed, skipping for now:`, apiErr);
        // Don't throw error, just mark as not loading so UI doesn't get stuck
      }
      
    } catch (err) {
      console.error(`Error loading ${statType} stats:`, err);
    } finally {
      // Remove from loading state
      setLoadingStats(prev => ({
        ...prev,
        [statType]: new Set([...prev[statType]].filter(u => !usernames.includes(u)))
      }));
    }
  };

  const loadContributorDetails = async (usernames) => {
    if (!usernames || usernames.length === 0) return;
    
    // Load each stat type separately for immediate feedback
    await loadContributorStats('commits', usernames);
    await loadContributorStats('lines', usernames);
  };

  const calculateScore = (contributor) => {
    const totalLines = (contributor.total_additions || 0) + (contributor.total_deletions || 0);
    const linesScore = totalLines * 0.1;
    const commitsScore = (contributor.total_commits || 0) * 1;
    const creatorBonus = contributor.isProjectCreator ? 100 : 0;
    
    return linesScore + commitsScore + creatorBonus;
  };

  const recalculateRankings = () => {
    setAllContributors(prev => {
      // Calculate scores for all contributors
      const contributorsWithScores = prev.map(contributor => ({
        ...contributor,
        score: calculateScore(contributor)
      }));
      
      // Sort by score
      contributorsWithScores.sort((a, b) => b.score - a.score);
      
      // Assign new ranks
      return contributorsWithScores.map((contributor, index) => ({
        ...contributor,
        rank: index + 1
      }));
    });
  };

  const handleExpandContributor = async (contributor) => {
    const username = contributor.username;
    
    // Toggle expansion
    const newExpanded = new Set(expandedContributors);
    if (newExpanded.has(username)) {
      newExpanded.delete(username);
    } else {
      newExpanded.add(username);
      
      // Load individual stats if not already loaded
      const statsToLoad = ['commits', 'lines'];
      for (const statType of statsToLoad) {
        if (!statsLoaded[statType].has(username)) {
          loadContributorStats(statType, [username]);
          // Small delay between requests to show progressive loading
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }
    setExpandedContributors(newExpanded);
  };

  const getRepoContributions = (contributor, repoType) => {
    if (repoType === 'all') {
      return {
        commits: contributor.total_commits,
        additions: contributor.total_additions,
        deletions: contributor.total_deletions
      };
    }
    const repoData = contributor.contributions[repoType];
    return {
      commits: repoData.commits,
      additions: repoData.additions,
      deletions: repoData.deletions
    };
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-yellow-900';
    if (rank === 2) return 'bg-gray-400 text-gray-900';
    if (rank === 3) return 'bg-amber-600 text-amber-900';
    return 'bg-blue-500 text-blue-900';
  };

  const toggleContributorExpansion = (contributorEmail) => {
    handleExpandContributor({ username: contributorEmail });
  };

  const isProjectCreator = (contributor) => {
    return creators.some(creator => creator.email === contributor.email || creator.username === contributor.username);
  };

  const SkeletonLoader = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );

  const StatDisplay = ({ value, label, isLoading, className = "" }) => (
    <div className="text-center">
      {isLoading ? (
        <div className="text-sm text-gray-400 animate-pulse">Loading...</div>
      ) : (
        <div className={`text-2xl font-bold mb-1 ${className}`}>
          {value !== undefined && value !== null ? value : "0"}
        </div>
      )}
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent-yellow mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contributors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl">{error}</p>
          <button 
            onClick={fetchBasicContributorsData}
            className="mt-4 px-4 py-2 bg-theme-accent-yellow text-theme-black rounded hover:bg-theme-warm-yellow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        
        {/* Project Info Section */}
        {projectInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8"
          >
            {/* Repository Links at the top */}
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4 justify-center">
                {projectInfo.repositories.map((repo, index) => (
                  <a 
                    key={index}
                    href={repo.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 sm:px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 hover:shadow-sm transition-all duration-200 group text-sm"
                  >
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      repo.type === 'backend' ? 'bg-green-500' :
                      repo.type === 'frontend' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></div>
                    <span className="font-medium text-gray-900 group-hover:text-gray-700">
                      {repo.name}
                    </span>
                    <svg className="w-4 h-4 ml-2 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Two Column Layout: Story + Top 10 Contributors */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
              
              {/* Left Column: Project Creators Story - Takes 2/3 on xl screens, full width on smaller */}
              <div className="xl:col-span-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">The Story Behind POLLZ X BITS ACM</h2>
                
                <div className="rounded-lg overflow-hidden shadow-lg relative">
                  {projectInfo.project_creators?.map((creator, index) => (
                    <div key={index}>
                      {/* Background Image with Text Overlay */}
                      <div className="relative min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]">
                        {/* Background Image */}
                        <img 
                          src={pollzCreatorsImage} 
                          alt="POLLZ Creators - The Original Team" 
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                        
                        {/* Dark Overlay for text readability */}
                        <div className="absolute inset-0 bg-black bg-opacity-65 rounded-lg"></div>
                        
                        {/* Text Content Overlay */}
                        <div className="relative z-10 p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-center">
                          <div className="rounded-lg p-3 sm:p-4 lg:p-6 backdrop-blur-[0.5px]">
                            {creator.story && creator.story.split('\n\n').map((paragraph, idx) => (
                              <p key={idx} className="text-white mb-2 leading-relaxed text-justify text-sm sm:text-base font-medium drop-shadow-lg">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right Column: Top 10 Contributors - Takes 1/3 on xl screens, full width on smaller */}
              <div className="xl:col-span-1 order-first xl:order-last">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">🏆 Top 10 Contributors</h2>
                
                <div className="space-y-3">
                  {allContributors.length > 0 ? 
                    allContributors.slice(0, 10).map((contributor, index) => {
                      const repoContribs = getRepoContributions(contributor, 'all');
                      const isCreator = contributor.isProjectCreator;
                      
                      return (
                        <motion.div
                          key={contributor.email}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`border rounded-lg p-2.5 sm:p-3 hover:shadow-md transition-shadow ${
                            isCreator 
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Rank Badge or Crown */}
                            {isCreator ? (
                              <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-500 text-yellow-900 text-xs">
                                👑
                              </div>
                            ) : (
                              <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-bold ${getRankBadgeColor(contributor.rank)}`}>
                                {contributor.rank}
                              </div>
                            )}
                            
                            {/* Avatar */}
                            <img
                              src={contributor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=f59e0b&color=1f2937`}
                              alt={contributor.name}
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex-shrink-0 ${
                                isCreator ? 'border-2 border-yellow-400' : ''
                              }`}
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=f59e0b&color=1f2937`;
                              }}
                            />
                            
                            {/* Contributor Info */}
                            <div className="flex-grow min-w-0">
                              <div className="flex flex-col space-y-0.5">
                                <h3 className="font-semibold text-xs sm:text-sm text-gray-900 truncate leading-tight">{contributor.name}</h3>
                                {isCreator && (
                                  <span className="text-xs font-medium text-yellow-700 bg-yellow-200 px-1 rounded self-start">
                                    Creator
                                  </span>
                                )}
                                <p className="text-xs text-gray-500 truncate">@{contributor.username}</p>
                              </div>
                            </div>

                            {/* Compact Stats */}
                            <div className="flex flex-col items-end flex-shrink-0">
                              {loadingStats.commits.has(contributor.username) ? (
                                <div className="text-xs text-gray-400 animate-pulse">Loading...</div>
                              ) : (
                                <div className="text-sm font-bold text-theme-accent-yellow">
                                  {repoContribs.commits || 0}
                                </div>
                              )}
                              <div className="text-xs text-gray-500">commits</div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }) :
                    (regularContributors.length > 0 ? regularContributors : contributors)
                      .slice(0, 10)
                      .map((contributor, index) => {
                        const repoContribs = getRepoContributions(contributor, 'all');
                        const isCreator = false; // In fallback, we don't have the flag, so default to false
                        
                        return (
                          <motion.div
                            key={contributor.email}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`border rounded-lg p-2.5 sm:p-3 hover:shadow-md transition-shadow ${
                              isCreator 
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              {/* Rank Badge or Crown */}
                              {isCreator ? (
                                <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-500 text-yellow-900 text-xs">
                                  👑
                                </div>
                              ) : (
                                <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs font-bold ${getRankBadgeColor(contributor.rank)}`}>
                                  {contributor.rank}
                                </div>
                              )}
                              
                              {/* Avatar */}
                              <img
                                src={contributor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=f59e0b&color=1f2937`}
                                alt={contributor.name}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 flex-shrink-0 ${
                                  isCreator ? 'border-2 border-yellow-400' : ''
                                }`}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=f59e0b&color=1f2937`;
                                }}
                              />
                              
                              {/* Contributor Info */}
                              <div className="flex-grow min-w-0">
                                <div className="flex flex-col space-y-0.5">
                                  <h3 className="font-semibold text-xs sm:text-sm text-gray-900 truncate leading-tight">{contributor.name}</h3>
                                  {isCreator && (
                                    <span className="text-xs font-medium text-yellow-700 bg-yellow-200 px-1 rounded self-start">
                                      Creator
                                    </span>
                                  )}
                                  <p className="text-xs text-gray-500 truncate">@{contributor.username}</p>
                                </div>
                              </div>

                              {/* Compact Stats */}
                              <div className="flex flex-col items-end flex-shrink-0">
                                {loadingStats.commits.has(contributor.username) ? (
                                  <div className="text-xs text-gray-400 animate-pulse">Loading...</div>
                                ) : (
                                  <div className="text-sm font-bold text-theme-accent-yellow">
                                    {repoContribs.commits || 0}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500">commits</div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                  }
                </div>

                {/* View All Contributors Link */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      document.querySelector('#all-contributors')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }}
                    className="px-4 py-2 bg-theme-accent-yellow text-theme-black rounded-lg hover:bg-theme-warm-yellow transition-colors text-sm font-medium"
                  >
                    View All Contributors →
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        )}


        {/* Contributors Section */}
        <motion.div
          id="all-contributors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                All Contributors
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                (Ranked by: Lines×0.1 + Commits×1 + Creator Bonus)
              </p>
              {(loadingStats.commits.size > 0 || loadingStats.lines.size > 0) && (
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Loading stats... 
                  {loadingStats.commits.size > 0 && ' commits'}
                  {loadingStats.lines.size > 0 && ' lines'}
                  {' '}for {Math.max(loadingStats.commits.size, loadingStats.lines.size)} contributors
                </p>
              )}
            </div>
            
            {/* Repository Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent"
              >
                <option value="all">All Repositories</option>
                <option value="backend">Backend</option>
                <option value="frontend">Frontend</option>
                <option value="websocket">WebSocket</option>
              </select>
            </div>
          </div>

          {allContributors.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No contributors found</p>
          ) : (
            <div className="space-y-4">
              {allContributors.map((contributor, index) => {
                const repoContribs = getRepoContributions(contributor, selectedRepo);
                const isCreator = contributor.isProjectCreator;
                
                return (
                  <motion.div
                    key={contributor.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow ${
                      isCreator 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        {/* Rank Badge or Crown */}
                        {isCreator ? (
                          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 text-yellow-900 text-sm flex-shrink-0">
                            👑
                          </div>
                        ) : (
                          <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-sm font-bold flex-shrink-0 ${getRankBadgeColor(contributor.rank)}`}>
                            {contributor.rank}
                          </div>
                        )}
                        
                        {/* Avatar */}
                        <img
                          src={contributor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=f59e0b&color=1f2937`}
                          alt={contributor.name}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex-shrink-0 ${
                            isCreator ? 'border-2 border-yellow-400' : ''
                          }`}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=f59e0b&color=1f2937`;
                          }}
                        />
                        
                        {/* Contributor Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-1 sm:gap-0">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{contributor.name}</h3>
                            {isCreator && (
                              <span className="text-xs sm:text-sm font-medium text-yellow-700 bg-yellow-200 px-2 py-0.5 sm:py-1 rounded self-start">
                                Creator
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">@{contributor.username}</p>
                          {contributor.github_url && (
                            <a 
                              href={contributor.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 block sm:inline"
                            >
                              View GitHub Profile
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Contribution Stats */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex justify-between sm:justify-start sm:space-x-4 lg:space-x-6">
                          <StatDisplay 
                            value={repoContribs.commits}
                            label="Commits"
                            isLoading={loadingStats.commits.has(contributor.username)}
                            className="text-theme-accent-yellow"
                          />
                          <StatDisplay 
                            value={repoContribs.additions ? `+${repoContribs.additions.toLocaleString()}` : '+0'}
                            label="Lines Added"
                            isLoading={loadingStats.lines.has(contributor.username)}
                            className="text-green-600 text-lg sm:text-xl"
                          />
                          <StatDisplay 
                            value={repoContribs.deletions ? `-${repoContribs.deletions.toLocaleString()}` : '-0'}
                            label="Lines Deleted"
                            isLoading={loadingStats.lines.has(contributor.username)}
                            className="text-red-600 text-lg sm:text-xl"
                          />
                        </div>
                        
                        {/* View More Toggle Button */}
                        {selectedRepo === 'all' && (
                          <button
                            onClick={() => toggleContributorExpansion(contributor.username)}
                            className="self-center sm:ml-4 px-3 py-1.5 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors flex items-center justify-center space-x-1"
                            disabled={loadingStats.commits.has(contributor.username) || 
                                     loadingStats.lines.has(contributor.username)}
                          >
                            <span>
                              {(loadingStats.commits.has(contributor.username) || 
                                loadingStats.lines.has(contributor.username)) ? 'Loading...' 
                               : expandedContributors.has(contributor.username) ? 'Hide' : 'View More'}
                            </span>
                            {!(loadingStats.commits.has(contributor.username) || 
                               loadingStats.lines.has(contributor.username)) && (
                              <svg 
                                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${expandedContributors.has(contributor.username) ? 'rotate-180' : ''}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Repository Breakdown (when showing all and expanded) */}
                    {selectedRepo === 'all' && expandedContributors.has(contributor.username) && (
                      <div className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 ${
                        isCreator ? 'bg-yellow-100 -mx-3 sm:-mx-4 lg:-mx-6 -mb-3 sm:-mb-4 lg:-mb-6 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6 rounded-b-lg' : ''
                      }`}>
                        <p className="text-sm text-gray-600 mb-3">Contributions by repository:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="font-semibold text-green-600 mb-1">Backend</div>
                            <div className="text-xs space-y-1">
                              <div>{contributor.contributions.backend.commits} commits</div>
                              <div className="text-green-600">+{contributor.contributions.backend.additions}</div>
                              <div className="text-red-600">-{contributor.contributions.backend.deletions}</div>
                            </div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="font-semibold text-blue-600 mb-1">Frontend</div>
                            <div className="text-xs space-y-1">
                              <div>{contributor.contributions.frontend.commits} commits</div>
                              <div className="text-green-600">+{contributor.contributions.frontend.additions}</div>
                              <div className="text-red-600">-{contributor.contributions.frontend.deletions}</div>
                            </div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded">
                            <div className="font-semibold text-purple-600 mb-1">WebSocket</div>
                            <div className="text-xs space-y-1">
                              <div>{contributor.contributions.websocket.commits} commits</div>
                              <div className="text-green-600">+{contributor.contributions.websocket.additions}</div>
                              <div className="text-red-600">-{contributor.contributions.websocket.deletions}</div>
                            </div>
                          </div>
                        </div>
                        
                        {isCreator && (
                          <div className="mt-4 p-3 bg-yellow-200 rounded-lg">
                            <p className="text-xs sm:text-sm font-semibold text-yellow-800 flex flex-col sm:flex-row sm:items-center">
                              <span className="flex items-center">
                                👑 <span className="ml-2">Project Creator</span>
                              </span>
                              <span className="sm:ml-2 mt-1 sm:mt-0">- Created: {contributor.created_repos?.join(', ')} repositories</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Contributors;