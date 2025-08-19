import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiMessageCircle, FiAward, FiUsers, FiHeart, FiFilter, FiTag } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { departmentClubAPI } from '../services/api';

const DepartmentClubs = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('departments');
  const [selectedSize, setSelectedSize] = useState('all'); // For departments: major/minor/all
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});

  // Load data on component mount and when filters change
  useEffect(() => {
    loadData();
  }, [activeTab, selectedSize, selectedCategory]);

  // Reload data when user changes (login/logout)
  useEffect(() => {
    // Clear previous user's voting status
    setUserVotes({});
    if (!loading) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = { type: activeTab === 'departments' ? 'department' : 'club' };
      
      if (activeTab === 'departments' && selectedSize !== 'all') {
        params.size = selectedSize;
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await departmentClubAPI.getItems(params);
      
      // Sort items by vote count (descending) and assign proper ranks
      const sortedItems = response.data.sort((a, b) => b.vote_count - a.vote_count);
      const rankedItems = sortedItems.map((item, index) => ({
        ...item,
        rank: index + 1
      }));
      
      setItems(rankedItems);
      
      // Extract unique categories for filter
      const uniqueCategories = [...new Set(response.data.map(item => item.category))];
      setCategories(['all', ...uniqueCategories]);
      
      // Extract user votes for UI updates
      const votes = {};
      response.data.forEach(item => {
        if (item.user_has_voted) {
          votes[item.id] = true;
        }
      });
      setUserVotes(votes);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (itemId) => {
    if (!user) {
      toast.warning('Please login to vote');
      return;
    }

    try {
      await departmentClubAPI.vote({ item_id: itemId });
      
      // Update UI immediately with proper ranking
      setItems(prevItems => {
        // First update the vote count
        const updatedItems = prevItems.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              vote_count: item.vote_count + 1,
              user_has_voted: true
            };
          }
          return item;
        });
        
        // Sort by vote count (descending) to get proper ranking
        const sortedItems = updatedItems.sort((a, b) => b.vote_count - a.vote_count);
        
        // Update ranks based on new sorting
        const rankedItems = sortedItems.map((item, index) => ({
          ...item,
          rank: index + 1
        }));
        
        return rankedItems;
      });
      
      // Update user votes tracking
      setUserVotes(prev => ({ ...prev, [itemId]: true }));
      
      toast.success('Vote cast successfully!');
    } catch (error) {
      console.error('Error voting:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit vote');
      }
    }
  };

  const handleComment = async (itemId) => {
    if (!user) {
      toast.warning('Please login to comment');
      return;
    }
    if (!newComment[itemId]?.trim()) {
      toast.warning('Please enter a comment');
      return;
    }
    
    try {
      const response = await departmentClubAPI.comment({
        item_id: itemId,
        text: newComment[itemId],
        is_anonymous: true
      });
      
      // Update comments in UI
      setItems(prevItems => 
        prevItems.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              comments: [...item.comments, response.data.comment]
            };
          }
          return item;
        })
      );
      
      toast.success('Comment added successfully!');
      setNewComment({ ...newComment, [itemId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to add comment');
      }
    }
  };

  const resetFilters = () => {
    setSelectedSize('all');
    setSelectedCategory('all');
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500'; // Gold
    if (rank === 2) return 'bg-gray-400';   // Silver
    if (rank === 3) return 'bg-yellow-600'; // Bronze
    return 'bg-gray-500';
  };

  const totalVotes = items.reduce((sum, item) => sum + item.vote_count, 0);
  const highestVotes = items.length > 0 ? Math.max(...items.map(item => item.vote_count)) : 0;

  return (
    <div className="min-h-screen bg-theme-light-gray py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-theme-black mb-4">
            OASIS Department & Club Rankings
          </h1>
          <p className="text-xl text-theme-dark-gray">
            Vote for your favorite OASIS departments and clubs to recognize excellence
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-md">
            <button
              onClick={() => {
                setActiveTab('departments');
                resetFilters();
              }}
              className={`px-8 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'departments'
                  ? 'bg-theme-accent-yellow text-theme-black'
                  : 'text-theme-dark-gray hover:bg-gray-200'
              }`}
            >
              <FiAward className="inline mr-2" />
              Departments
            </button>
            <button
              onClick={() => {
                setActiveTab('clubs');
                resetFilters();
              }}
              className={`px-8 py-3 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'clubs'
                  ? 'bg-theme-accent-yellow text-theme-black'
                  : 'text-theme-dark-gray hover:bg-gray-200'
              }`}
            >
              <FiUsers className="inline mr-2" />
              Clubs & Societies
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Size Filter (Only for departments) */}
            {activeTab === 'departments' && (
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent appearance-none"
                >
                  <option value="all">All Departments</option>
                  <option value="major">Major Departments</option>
                  <option value="minor">Minor Departments</option>
                </select>
              </div>
            )}

            {/* Category Filter */}
            <div className="relative">
              <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center text-gray-600">
              {items.length} {activeTab} found
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-theme-accent-yellow">
              {totalVotes.toLocaleString()}
            </div>
            <div className="text-gray-600">Total Votes</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-theme-dark-gray">
              {items.length}
            </div>
            <div className="text-gray-600">
              {activeTab === 'departments' ? 'Departments' : 'Clubs'}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-theme-warm-yellow">
              {highestVotes.toLocaleString()}
            </div>
            <div className="text-gray-600">Highest Votes</div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bits-blue mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading {activeTab}...</p>
          </div>
        )}

        {/* Items List */}
        {!loading && (
          <motion.div
            key={`${activeTab}-${selectedSize}-${selectedCategory}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Rank Badge */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${getRankBadgeColor(item.rank)}`}>
                        #{item.rank}
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-theme-black">
                          {item.name}
                        </h3>
                        <p className="text-gray-600">
                          {item.short_name}
                          {item.category && ` • ${item.category}`}
                          {item.size && ` • ${item.size_display}`}
                          {item.role && ` • ${item.role}`}
                        </p>
                      </div>
                    </div>

                    {/* Vote Count and Button */}
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-theme-accent-yellow">
                          {item.vote_count.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">votes</div>
                      </div>
                      
                      <button
                        onClick={() => handleVote(item.id)}
                        disabled={userVotes[item.id]}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                          userVotes[item.id]
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : 'bg-theme-accent-yellow hover:bg-theme-warm-yellow text-theme-black'
                        }`}
                      >
                        <FiHeart />
                        <span>
                          {userVotes[item.id] ? 'Voted ✓' : 'Vote'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4">{item.description}</p>

                  {/* Comments Section */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => setShowComments({
                        ...showComments,
                        [item.id]: !showComments[item.id]
                      })}
                      className="flex items-center space-x-2 text-theme-black hover:text-theme-dark-gray font-medium mb-4"
                    >
                      <FiMessageCircle />
                      <span>
                        {showComments[item.id] ? 'Hide' : 'Show'} Comments ({item.comments.length})
                      </span>
                    </button>

                    {showComments[item.id] && (
                      <div className="space-y-4">
                        {/* Existing Comments */}
                        {item.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-800">{comment.user_name}</span>
                              <span className="text-sm text-gray-500">{comment.time_ago}</span>
                            </div>
                            <p className="text-gray-700">{comment.text}</p>
                          </div>
                        ))}

                        {item.comments.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No comments yet. Be the first to comment!
                          </div>
                        )}

                        {/* Add Comment */}
                        {user && (
                          <div className="flex space-x-3">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={newComment[item.id] || ''}
                              onChange={(e) => setNewComment({
                                ...newComment,
                                [item.id]: e.target.value
                              })}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent"
                            />
                            <button
                              onClick={() => handleComment(item.id)}
                              className="bg-theme-accent-yellow hover:bg-theme-warm-yellow text-theme-black px-6 py-2 rounded-lg transition-colors"
                            >
                              Post
                            </button>
                          </div>
                        )}

                        {!user && (
                          <div className="text-center py-4 text-gray-500">
                            Please login to add comments
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-500 text-lg">No {activeTab} found. Try adjusting your filters.</p>
          </div>
        )}

        {/* Information */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Rankings are updated in real-time based on student votes.
          </p>
          <p className="mt-2">
            Help recognize excellence by voting for your favorite OASIS {activeTab}!
          </p>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default DepartmentClubs;