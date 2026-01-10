import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Comments from '../components/Comments';
import { HandThumbUpIcon, HandThumbDownIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';

const VideoPlayer = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [views, setViews] = useState(0);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get base URL for video preview
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getById(id);
      const videoData = response.data.video;
      setVideo(videoData);
      setLikes(videoData.likes?.length || 0);
      setDislikes(videoData.dislikes?.length || 0);
      setViews(videoData.views || 0);
      setIsLiked(videoData.likes?.includes(user?._id) || false);
      setIsDisliked(videoData.dislikes?.includes(user?._id) || false);
      setIsSaved(videoData.isSaved || false);

      // Increment view count
      try {
        const viewResponse = await videoAPI.addView(id);
        setViews(viewResponse.data.views);
      } catch (viewError) {
        console.error('Error incrementing view:', viewError);
      }

    } catch (error) {
      console.error('Error fetching video:', error);
      setError(error.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await videoAPI.toggleLike(video._id);
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
      setIsLiked(response.data.isLiked);
      setIsDisliked(response.data.isDisliked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await videoAPI.toggleDislike(video._id);
      setLikes(response.data.likes);
      setDislikes(response.data.dislikes);
      setIsLiked(response.data.isLiked);
      setIsDisliked(response.data.isDisliked);
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await videoAPI.toggleSave(video._id);
      setIsSaved(response.data.isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const getSensitivityBadge = (status) => {
    switch (status) {
      case 'safe':
        return <span className="badge-safe">✓ Safe Content</span>;
      case 'flagged':
        return <span className="badge-flagged">⚠ Flagged Content</span>;
      case 'pending':
        return <span className="badge-pending">⏳ Processing</span>;
      default:
        return null;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Video not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/dashboard')}
          className="mb-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center"
        >
          ← Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="card p-0 overflow-hidden">
              <video
                controls
                className="w-full bg-black"
                style={{ maxHeight: '600px' }}
                // Use standard static file serving if streaming endpoint fails or is complex
                src={`${BASE_URL}/uploads/${video.filename}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="card mt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {video.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                     <span>{views} views</span>
                     <span>•</span>
                     <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                  {getSensitivityBadge(video.sensitivityStatus)}
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-colors ${
                      isLiked 
                        ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    title="Like"
                  >
                    {isLiked ? <HandThumbUpSolid className="w-5 h-5" /> : <HandThumbUpIcon className="w-5 h-5" />}
                    <span className="font-medium">{likes}</span>
                  </button>

                  <button 
                    onClick={handleDislike}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-colors ${
                      isDisliked 
                        ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    title="Dislike"
                  >
                    {isDisliked ? <HandThumbDownSolid className="w-5 h-5" /> : <HandThumbDownIcon className="w-5 h-5" />}
                    {dislikes > 0 && <span className="font-medium">{dislikes}</span>}
                  </button>

                  <button 
                    onClick={handleSave}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-colors ${
                      isSaved 
                        ? 'bg-yellow-50 border-yellow-200 text-yellow-600 dark:bg-yellow-900/30 dark:border-yellow-800/50 dark:text-yellow-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    title="Save"
                  >
                    {isSaved ? <BookmarkSolid className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
                    <span className="font-medium hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              {video.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{video.description}</p>
                </div>
              )}
            </div>
            
            <Comments videoId={video._id} />
          </div>

          {/* Video Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Video Details</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium">{formatFileSize(video.filesize)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium">{formatDuration(video.duration)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Format</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium">{video.mimetype}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium">
                    {new Date(video.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Processing Status</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium capitalize">{video.processingStatus}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Content Analysis</p>
                  <div className="mt-1">
                    {getSensitivityBadge(video.sensitivityStatus)}
                  </div>
                </div>
              </div>
            </div>

            {video.sensitivityStatus === 'flagged' && (
              <div className="card mt-4 bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800/50">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">⚠ Content Warning</h3>
                <p className="text-sm text-red-700 dark:text-red-200">
                  This video has been flagged by our automated content analysis system. 
                  It may contain sensitive or inappropriate content.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
