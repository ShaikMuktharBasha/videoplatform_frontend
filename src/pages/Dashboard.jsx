import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { videoAPI } from '../services/api';
import { HandThumbUpIcon, HandThumbDownIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid, BookmarkIcon as BookmarkSolid, PlayCircleIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { isEditor, user } = useAuth();
  const navigate = useNavigate();
  // Get base URL for video preview
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    fetchVideos();
  }, [filter, user]); // Re-fetch/update if user changes

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? null : filter;
      const response = await videoAPI.getAll(statusParam);
      
      let fetchedVideos = response.data.videos;
      
      // Augment with isSaved status from user profile
      if (user && user.savedVideos) {
        fetchedVideos = fetchedVideos.map(v => ({
          ...v,
          isSaved: user.savedVideos.includes(v._id)
        }));
      }

      setVideos(fetchedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (e, videoId) => {
    e.stopPropagation();
    try {
      const response = await videoAPI.toggleLike(videoId);
      setVideos(videos.map(v => {
        if (v._id === videoId) {
             const isLiked = response.data.isLiked;
             let newLikes = v.likes ? [...v.likes] : [];
             let newDislikes = v.dislikes ? [...v.dislikes] : [];
             
             if (isLiked) {
                 if (user && !newLikes.includes(user._id)) newLikes.push(user._id);
                 if (user && newDislikes.includes(user._id)) newDislikes = newDislikes.filter(id => id !== user._id);
             } else {
                 if (user) newLikes = newLikes.filter(id => id !== user._id);
             }
             
             return { ...v, likes: newLikes, dislikes: newDislikes };
        }
        return v;
      }));
    } catch (error) {
        console.error('Like error', error);
    }
  };

  const handleDislike = async (e, videoId) => {
    e.stopPropagation();
    try {
      const response = await videoAPI.toggleDislike(videoId);
      setVideos(videos.map(v => {
        if (v._id === videoId) {
             const isDisliked = response.data.isDisliked;
             let newLikes = v.likes ? [...v.likes] : [];
             let newDislikes = v.dislikes ? [...v.dislikes] : [];
             
             if (isDisliked) {
                 if (user && !newDislikes.includes(user._id)) newDislikes.push(user._id);
                 if (user && newLikes.includes(user._id)) newLikes = newLikes.filter(id => id !== user._id);
             } else {
                 if (user) newDislikes = newDislikes.filter(id => id !== user._id);
             }
             
             return { ...v, likes: newLikes, dislikes: newDislikes };
        }
        return v;
      }));
    } catch (error) {
        console.error('Dislike error', error);
    }
  };

  const handleSave = async (e, videoId) => {
      e.stopPropagation();
      try {
          const response = await videoAPI.toggleSave(videoId);
          setVideos(videos.map(v => {
              if (v._id === videoId) {
                  return { ...v, isSaved: response.data.isSaved };
              }
              return v;
          }));
      } catch (error) {
          console.error('Save error', error);
      }
  };

  const handleDelete = async (videoId) => {
    // Only allow delete if confirmation passed
    // Note: wrapping in another function if needed for e.stopPropagation but button usually on top
  };

  const handleDeleteClick = async (e, videoId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await videoAPI.delete(videoId);
      setVideos(videos.filter(v => v._id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const getSensitivityBadge = (status) => {
    switch (status) {
      case 'safe':
        return <span className="badge-safe">✓ Safe</span>;
      case 'flagged':
        return <span className="badge-flagged">⚠ Flagged</span>;
      case 'pending':
        return <span className="badge-pending">⏳ Processing</span>;
      default:
        return <span className="badge-pending">Unknown</span>;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
         <div>
          <h1 className="text-3xl font-bold text-gray-900">My Videos</h1>
          <p className="text-gray-600 mt-1">Manage your uploaded videos</p>
        </div>
        
        {isEditor && (
          <Link to="/upload" className="btn-primary">
            + Upload Video
          </Link>
        )}
      </div>

      {/* Filter */}
        <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Videos
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'safe'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Safe
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'flagged'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Flagged
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Processing
          </button>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No videos found</p>
            {isEditor && (
              <Link to="/upload" className="btn-primary mt-4 inline-block">
                Upload your first video
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div 
                key={video._id} 
                className="card hover:shadow-lg transition-shadow group cursor-pointer border border-gray-200 dark:border-gray-700 flex flex-col" 
                onClick={() => navigate(`/video/${video._id}`)}
              >
                {/* Video Preview */}
                <div className="relative aspect-video mb-4 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                  {video.processingStatus === 'completed' ? (
                    <>
                      <video 
                        src={`${BASE_URL}/uploads/${video.filename}#t=0.5`}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        preload="metadata"
                      />
                       {/* Play Button Overlay */}
                       <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                          <PlayCircleIcon className="w-16 h-16 text-white opacity-90 group-hover:scale-110 transition-transform drop-shadow-lg" />
                       </div>
                    </>
                  ) : (
                    <div className="text-gray-500 flex flex-col items-center">
                      <span className="text-2xl mb-2">⏳</span>
                      <span className="text-xs">Processing...</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    {getSensitivityBadge(video.sensitivityStatus)}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                    <span className="text-gray-900 dark:text-gray-200">{formatDuration(video.duration)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                    <span className="text-gray-900 dark:text-gray-200">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-auto flex items-center justify-between border-t pt-3 border-gray-100 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                   <div className="flex space-x-1">
                      <button
                          onClick={(e) => handleLike(e, video._id)}
                          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              user && video.likes?.includes(user._id) ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
                          }`}
                          title="Like"
                      >
                          {user && video.likes?.includes(user._id) ? <HandThumbUpSolid className="w-5 h-5" /> : <HandThumbUpIcon className="w-5 h-5" />}
                      </button>
                      <button
                          onClick={(e) => handleDislike(e, video._id)}
                          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              user && video.dislikes?.includes(user._id) ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                          }`}
                          title="Dislike"
                      >
                          {user && video.dislikes?.includes(user._id) ? <HandThumbDownSolid className="w-5 h-5" /> : <HandThumbDownIcon className="w-5 h-5" />}
                      </button>
                   </div>

                   <div className="flex items-center space-x-2">
                      <button
                          onClick={(e) => handleSave(e, video._id)}
                          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              video.isSaved ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'
                          }`}
                          title="Save"
                      >
                          {video.isSaved ? <BookmarkSolid className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                      </button>
                      
                       {isEditor && (
                          <button
                            onClick={(e) => handleDeleteClick(e, video._id)}
                            className="ml-2 text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-md transition-colors"
                          >
                            Delete
                          </button>
                        )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default Dashboard;
