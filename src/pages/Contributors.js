import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import pollzCreatorsImage from '../assets/pollzCreators.jpeg';

const Contributors = () => {
  const [projectInfo, setProjectInfo] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [creators, setCreators] = useState([]);
  const [regularContributors, setRegularContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState('all');

  useEffect(() => {
    fetchContributorsData();
  }, []);

  const fetchContributorsData = async () => {
    try {
      setLoading(true);
      
      const [projectResponse, contributorsResponse] = await Promise.all([
        api.get('/main/contributions/project-info/'),
        api.get('/main/contributions/github-contributors/')
      ]);
      
      setProjectInfo(projectResponse.data);
      setContributors(contributorsResponse.data.contributors || []);
      setCreators(contributorsResponse.data.creators || []);
      setRegularContributors(contributorsResponse.data.regular_contributors || []);
    } catch (err) {
      setError('Failed to fetch contributors data');
      console.error('Error fetching contributors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRepoContributions = (contributor, repoType) => {
    if (repoType === 'all') {
      return {
        commits: contributor.total_commits,
        additions: contributor.total_additions,
        deletions: contributor.total_deletions,
        merged_prs: contributor.total_merged_prs
      };
    }
    const repoData = contributor.contributions[repoType];
    return {
      commits: repoData.commits,
      additions: repoData.additions,
      deletions: repoData.deletions,
      merged_prs: repoData.merged_prs
    };
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-yellow-900';
    if (rank === 2) return 'bg-gray-400 text-gray-900';
    if (rank === 3) return 'bg-amber-600 text-amber-900';
    return 'bg-blue-500 text-blue-900';
  };

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
            onClick={fetchContributorsData}
            className="mt-4 px-4 py-2 bg-theme-accent-yellow text-theme-black rounded hover:bg-theme-warm-yellow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Project Info Section */}
        {projectInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{projectInfo.name}</h1>
            
            {/* Project Creators Story with integrated image */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🎉 The Story Behind POLLZ</h2>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg overflow-hidden shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  {/* Story Text - Takes 2/3 on large screens */}
                  <div className="lg:col-span-2 p-8">
                    {projectInfo.project_creators?.map((creator, index) => (
                      <div key={index}>
                        {creator.story && creator.story.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="text-gray-700 mb-4 leading-relaxed text-justify">
                            {paragraph}
                          </p>
                        ))}
                        
                        <div className="mt-6 pt-6 border-t border-yellow-200">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 mb-1">{creator.name}</h3>
                              <p className="text-sm text-gray-600">Driving OSS culture at BITS Pilani</p>
                            </div>
                            <a 
                              href={creator.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm flex items-center space-x-2"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                              </svg>
                              <span>Visit BITS ACM</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Creator Image - Takes 1/3 on large screens */}
                  <div className="lg:col-span-1 relative min-h-[300px] lg:min-h-full bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src={pollzCreatorsImage} 
                        alt="POLLZ Creators - The Original Team" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Repository Overview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Repository Structure</h2>
                <a 
                  href={projectInfo.github_org} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View Organization</span>
                  <span>↗</span>
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {projectInfo.repositories.map((repo, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          repo.type === 'backend' ? 'bg-green-500' :
                          repo.type === 'frontend' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}></div>
                        <h3 className="font-semibold">{repo.name}</h3>
                      </div>
                      <a 
                        href={repo.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">{repo.technology}</p>
                    <p className="text-xs text-gray-500 mb-3">{repo.description}</p>
                    <a 
                      href={repo.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {repo.repo_name} →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Repository Creators Section */}
        {creators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              👑 Repository Creators & Project Initiators
            </h2>
            
            {creators.map((creator, index) => {
              const repoContribs = getRepoContributions(creator, selectedRepo);
              
              return (
                <motion.div
                  key={creator.username}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Creator Crown */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-yellow-900 text-lg font-bold">
                        👑
                      </div>
                      
                      {/* Avatar */}
                      <img
                        src={creator.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=f59e0b&color=1f2937`}
                        alt={creator.name}
                        className="w-16 h-16 rounded-full bg-gray-200 border-4 border-yellow-400"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=f59e0b&color=1f2937`;
                        }}
                      />
                      
                      {/* Creator Info */}
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{creator.name}</h3>
                        <p className="text-sm text-gray-600">@{creator.username}</p>
                        <p className="text-sm font-semibold text-yellow-700">
                          🎯 Created: {creator.created_repos?.join(', ')} repositories
                        </p>
                        {creator.github_url && (
                          <a 
                            href={creator.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View GitHub Profile →
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Creator Stats */}
                    <div className="flex space-x-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{repoContribs.commits}</div>
                        <div className="text-xs text-gray-500">Commits</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-green-600">+{repoContribs.additions?.toLocaleString() || 0}</div>
                        <div className="text-xs text-gray-500">Lines Added</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-red-600">-{repoContribs.deletions?.toLocaleString() || 0}</div>
                        <div className="text-xs text-gray-500">Lines Deleted</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{repoContribs.merged_prs}</div>
                        <div className="text-xs text-gray-500">Merged PRs</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Contributors Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {regularContributors.length > 0 ? 'Other Contributors' : 'All Contributors'}
            </h2>
            
            {/* Repository Filter */}
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent"
            >
              <option value="all">All Repositories</option>
              <option value="backend">Backend</option>
              <option value="frontend">Frontend</option>
              <option value="websocket">WebSocket</option>
            </select>
          </div>

          {(regularContributors.length > 0 ? regularContributors : contributors).length === 0 ? (
            <p className="text-center text-gray-500 py-8">No contributors found</p>
          ) : (
            <div className="space-y-4">
              {(regularContributors.length > 0 ? regularContributors : contributors).map((contributor, index) => {
                const repoContribs = getRepoContributions(contributor, selectedRepo);
                
                return (
                  <motion.div
                    key={contributor.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank Badge */}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankBadgeColor(contributor.rank)}`}>
                          {contributor.rank}
                        </div>
                        
                        {/* Avatar */}
                        <img
                          src={contributor.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=f59e0b&color=1f2937`}
                          alt={contributor.name}
                          className="w-12 h-12 rounded-full bg-gray-200"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=f59e0b&color=1f2937`;
                          }}
                        />
                        
                        {/* Contributor Info */}
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{contributor.name}</h3>
                          <p className="text-sm text-gray-500">@{contributor.username}</p>
                          {contributor.github_url && (
                            <a 
                              href={contributor.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              View GitHub Profile
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Contribution Stats */}
                      <div className="flex space-x-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-theme-accent-yellow">{repoContribs.commits}</div>
                          <div className="text-xs text-gray-500">Commits</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">+{repoContribs.additions?.toLocaleString() || 0}</div>
                          <div className="text-xs text-gray-500">Lines Added</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-red-600">-{repoContribs.deletions?.toLocaleString() || 0}</div>
                          <div className="text-xs text-gray-500">Lines Deleted</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{repoContribs.merged_prs}</div>
                          <div className="text-xs text-gray-500">Merged PRs</div>
                        </div>
                      </div>
                    </div>

                    {/* Repository Breakdown (when showing all) */}
                    {selectedRepo === 'all' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-2">Contributions by repository:</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-3 bg-green-50 rounded">
                            <div className="font-semibold text-green-600 mb-1">Backend</div>
                            <div className="text-xs space-y-1">
                              <div>{contributor.contributions.backend.commits} commits</div>
                              <div className="text-green-600">+{contributor.contributions.backend.additions}</div>
                              <div className="text-red-600">-{contributor.contributions.backend.deletions}</div>
                              <div className="text-purple-600">{contributor.contributions.backend.merged_prs} merged PRs</div>
                            </div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded">
                            <div className="font-semibold text-blue-600 mb-1">Frontend</div>
                            <div className="text-xs space-y-1">
                              <div>{contributor.contributions.frontend.commits} commits</div>
                              <div className="text-green-600">+{contributor.contributions.frontend.additions}</div>
                              <div className="text-red-600">-{contributor.contributions.frontend.deletions}</div>
                              <div className="text-purple-600">{contributor.contributions.frontend.merged_prs} merged PRs</div>
                            </div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded">
                            <div className="font-semibold text-purple-600 mb-1">WebSocket</div>
                            <div className="text-xs space-y-1">
                              <div>{contributor.contributions.websocket.commits} commits</div>
                              <div className="text-green-600">+{contributor.contributions.websocket.additions}</div>
                              <div className="text-red-600">-{contributor.contributions.websocket.deletions}</div>
                              <div className="text-purple-600">{contributor.contributions.websocket.merged_prs} merged PRs</div>
                            </div>
                          </div>
                        </div>
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