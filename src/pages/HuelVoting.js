import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiSearch, FiFilter, FiStar } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { huelAPI } from '../services/api';

const HuelVoting = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('overall');
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [huels, setHuels] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedHuelForRating, setSelectedHuelForRating] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [huelsResponse, deptResponse] = await Promise.all([
        huelAPI.getHuels({ search: searchTerm, department: selectedDepartment !== 'all' ? selectedDepartment : undefined, sort_by: sortBy }),
        huelAPI.getDepartments()
      ]);
      setHuels(huelsResponse.data);
      setDepartments(['all', ...deptResponse.data.map(d => d.short_name)]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Reload when search/filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedDepartment, sortBy]);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, sortBy]);

  // Reload data when user changes (login/logout)
  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [user]);


  const handleComment = async (huelId) => {
    if (!user) {
      toast.warning('Please login to comment');
      return;
    }
    if (!newComment[huelId]?.trim()) {
      toast.warning('Please enter a comment');
      return;
    }
    
    try {
      const response = await huelAPI.commentHuel({
        huel_id: huelId,
        text: newComment[huelId],
        is_anonymous: true
      });
      
      // Update comments in UI
      setHuels(prevHuels => 
        prevHuels.map(huel => {
          if (huel.id === huelId) {
            return {
              ...huel,
              comments: [...huel.comments, response.data.comment]
            };
          }
          return huel;
        })
      );
      
      toast.success('Comment added successfully!');
      setNewComment({ ...newComment, [huelId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to add comment');
      }
    }
  };

  const handleRating = async (huelId, grading, toughness, overall) => {
    if (!user) {
      toast.warning('Please login to rate');
      return;
    }
    
    try {
      const response = await huelAPI.rateHuel({
        huel_id: huelId,
        grading: grading,
        toughness: toughness,
        overall: overall
      });
      
      toast.success(response.data.created ? 'Rating submitted!' : 'Rating updated!');
      
      // Reload data to get updated averages
      loadData();
      setShowRatingModal(false);
      setSelectedHuelForRating(null);
    } catch (error) {
      console.error('Error rating:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to submit rating');
      }
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.0) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (toughness) => {
    if (toughness >= 4.0) return 'text-red-600';
    if (toughness >= 3.5) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Data is already filtered from the backend
  const filteredHuels = huels;
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredHuels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHuels = filteredHuels.slice(startIndex, endIndex);

  // Rating Modal Component
  const RatingModal = () => {
    const [tempRatings, setTempRatings] = useState({
      grading: selectedHuelForRating?.user_rating?.grading || 0,
      toughness: selectedHuelForRating?.user_rating?.toughness || 0,
      overall: selectedHuelForRating?.user_rating?.overall || 0
    });

    const StarRating = ({ label, value, onChange, color = "yellow" }) => (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
              key={star}
              className={`w-6 h-6 cursor-pointer transition-colors ${
                star <= value
                  ? `text-${color}-400 fill-current`
                  : 'text-gray-300 hover:text-gray-400'
              }`}
              onClick={() => onChange(star)}
            />
          ))}
        </div>
        <span className="text-sm text-gray-500">{value}/5</span>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">
            Rate {selectedHuelForRating?.code} - {selectedHuelForRating?.name}
          </h3>
          
          <StarRating
            label="Grading (How easy to score well?)"
            value={tempRatings.grading}
            onChange={(rating) => setTempRatings(prev => ({ ...prev, grading: rating }))}
            color="green"
          />
          
          <StarRating
            label="Difficulty (How tough is the course?)"
            value={tempRatings.toughness}
            onChange={(rating) => setTempRatings(prev => ({ ...prev, toughness: rating }))}
            color="red"
          />
          
          <StarRating
            label="Overall (Would you recommend?)"
            value={tempRatings.overall}
            onChange={(rating) => setTempRatings(prev => ({ ...prev, overall: rating }))}
            color="yellow"
          />
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => {
                if (tempRatings.grading && tempRatings.toughness && tempRatings.overall) {
                  handleRating(
                    selectedHuelForRating.id,
                    tempRatings.grading,
                    tempRatings.toughness,
                    tempRatings.overall
                  );
                } else {
                  toast.warning('Please rate all three parameters');
                }
              }}
              className="flex-1 bg-theme-accent-yellow hover:bg-theme-warm-yellow text-theme-black font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Submit Rating
            </button>
            <button
              onClick={() => {
                setShowRatingModal(false);
                setSelectedHuelForRating(null);
              }}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-theme-light-gray py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-theme-black mb-4">
            Huel Voting System
          </h1>
          <p className="text-xl text-theme-dark-gray">
            Rate and review courses to help fellow students make informed decisions
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent appearance-none"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent"
              >
                <option value="overall">Sort by Overall</option>
                <option value="grading">Sort by Grading</option>
                <option value="toughness">Sort by Difficulty</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center text-gray-600 text-sm">
              {filteredHuels.length} courses found
              {totalPages > 1 && (
                <span className="ml-2 text-gray-500">
                  (Page {currentPage}/{totalPages})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredHuels.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center mb-6 px-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg'
                }`}
              >
                <span>← Previous</span>
              </button>
              
              <div className="flex flex-col items-center space-y-1">
                <span className="text-gray-600 text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <span className="text-gray-500 text-xs">
                  ({filteredHuels.length} courses total)
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-lg'
                }`}
              >
                <span>Next →</span>
              </button>
            </div>
          </div>
        )}

        {/* Course Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {currentHuels.map((huel) => (
            <motion.div
              key={huel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
            >
              <div className="p-4 flex flex-col h-full">
                {/* Course Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                  <div className="flex-1">
                    {loading && (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-theme-black mb-1">
                      {huel.code} - {huel.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {huel.department_name} • {huel.instructor}
                    </p>
                  </div>
                  
                  {/* Rate Button */}
                  <div className="flex items-center mt-2 md:mt-0 md:ml-4">
                    <button
                      onClick={() => {
                        if (!user) {
                          toast.warning('Please login to rate');
                          return;
                        }
                        setSelectedHuelForRating(huel);
                        setShowRatingModal(true);
                      }}
                      className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        huel.user_rating
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      }`}
                    >
                      <FiStar className="w-4 h-4" />
                      <span className="hidden sm:inline">{huel.user_rating ? 'Edit' : 'Rate'}</span>
                    </button>
                  </div>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold mb-0.5">
                      <span className={getRatingColor(huel.avg_grading)}>
                        {huel.avg_grading.toFixed(1)}
                      </span>
                      <span className="text-gray-400 text-sm">/5</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">Grading</div>
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(huel.avg_grading)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold mb-0.5">
                      <span className={getDifficultyColor(huel.avg_toughness)}>
                        {huel.avg_toughness.toFixed(1)}
                      </span>
                      <span className="text-gray-400 text-sm">/5</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">Difficulty</div>
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(huel.avg_toughness)
                              ? 'text-red-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold mb-0.5">
                      <span className={getRatingColor(huel.avg_overall)}>
                        {huel.avg_overall.toFixed(1)}
                      </span>
                      <span className="text-gray-400 text-sm">/5</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">Overall</div>
                    <div className="flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(huel.avg_overall)
                              ? 'text-theme-accent-yellow fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t pt-3 mt-auto">
                  <button
                    onClick={() => setShowComments({
                      ...showComments,
                      [huel.id]: !showComments[huel.id]
                    })}
                    className="flex items-center space-x-2 text-theme-black hover:text-theme-dark-gray font-medium mb-3 text-sm"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span>
                      {showComments[huel.id] ? 'Hide' : 'Show'} Comments ({huel.comments.length})
                    </span>
                  </button>

                  {showComments[huel.id] && (
                    <div className="space-y-3">
                      {/* Existing Comments */}
                      {huel.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-800 text-sm">{comment.user_name}</span>
                            <span className="text-xs text-gray-500">{comment.time_ago}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.text}</p>
                        </div>
                      ))}

                      {/* Add Comment */}
                      {user && (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment[huel.id] || ''}
                            onChange={(e) => setNewComment({
                              ...newComment,
                              [huel.id]: e.target.value
                            })}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-accent-yellow focus:border-transparent"
                          />
                          <button
                            onClick={() => handleComment(huel.id)}
                            className="bg-theme-accent-yellow hover:bg-theme-warm-yellow text-theme-black px-4 py-2 text-sm rounded-lg transition-colors"
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-accent-yellow mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading courses...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredHuels.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-500 text-lg">No courses found. Try adjusting your filters.</p>
          </div>
        )}
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
      
      {/* Rating Modal */}
      {showRatingModal && selectedHuelForRating && <RatingModal />}
    </div>
  );
};

export default HuelVoting;