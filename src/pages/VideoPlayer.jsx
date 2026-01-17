import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { videoAPI, photoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Comments from '../components/Comments';
import { HandThumbUpIcon, HandThumbDownIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';

const VideoPlayer = () => { // Renaming conceptually to ContentPlayer in comments but keeping component name
  const [content, setContent] = useState(null);
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
  const location = useLocation();
  const { user } = useAuth();
  
  const isPhoto = location.pathname.includes('/photo');
  const contentType = isPhoto ? 'photo' : 'video';

  // Get base URL for content preview
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    fetchContent();
  }, [id, contentType]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const api = isPhoto ? photoAPI : videoAPI;
      const response = await api.getById(id);
      const data = isPhoto ? response.data.photo : response.data.video;
      
      setContent(data);
      setLikes(data.likes?.length || 0);
      setDislikes(data.dislikes?.length || 0);
      setViews(data.views || 0);
      setIsLiked(data.likes?.includes(user?._id) || false);
      setIsDisliked(data.dislikes?.includes(user?._id) || false);
      setIsSaved(data.isSaved || false);

      // Increment view count
      try {
        const viewResponse = await api.addView(id);
        const viewData = isPhoto ? viewResponse.data.views : viewResponse.data.views;
        // View response structure might differ slightly or be just views count
        // Assuming consistent API response
        setViews(viewData);
      } catch (viewError) {
        // console.error('Error incrementing view:', viewError);
      }

    } catch (error) {
      console.error(`Error fetching ${contentType}:`, error);
      setError(error.response?.data?.message || `Failed to load ${contentType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const api = isPhoto ? photoAPI : videoAPI;
      const response = await api.toggleLike(content._id);
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
      const api = isPhoto ? photoAPI : videoAPI;
      const response = await api.toggleDislike(content._id);
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
      const api = isPhoto ? photoAPI : videoAPI;
      const response = await api.toggleSave(content._id);
      setIsSaved(response.data.isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const getSensitivityBadge = (status) => {
    switch (status) {
      case 'safe':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">✓ Safe Content</span>;
      case 'flagged':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">⚠ Flagged Content</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">⏳ Processing</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Content not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
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
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-gray-900">
               {isPhoto ? (
                  <img
                    src={content.filepath && content.filepath.startsWith('http') ? content.filepath : `${BASE_URL}/uploads/${content.filename}`}
                    alt={content.title}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
               ) : (
                <video
                    controls
                    autoPlay
                    className="w-full bg-black aspect-video object-contain"
                    style={{ maxHeight: '70vh' }}
                    src={content.filepath && content.filepath.startsWith('http') ? content.filepath : `${BASE_URL}/uploads/${content.filename}`}
                    poster={content.thumbnail ? `${BASE_URL}/uploads/${content.thumbnail}` : undefined}
                >
                    Your browser does not support the video tag.
                </video>
               )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {content.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                     <span>{views} views</span>
                     <span>•</span>
                     <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                  </div>
                  {getSensitivityBadge(content.sensitivityStatus)}
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
              </div>

              {content.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{content.description}</p>
                </div>
              )}
            </div>
            
            {/* Comments only for videos for now */}
            {!isPhoto && (
             <Comments videoId={content._id} contentType={contentType} />
            )}
            
            {isPhoto && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
                    <p className="text-gray-500 italic text-center">Comments are currently disabled for photos.</p>
                </div>
            )}
          </div>

          {/* Details Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isPhoto ? 'Photo Details' : 'Video Details'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium">{formatFileSize(content.filesize)}</p>
                </div>

                {!isPhoto && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium">{formatDuration(content.duration)}</p>
                </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Format</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium">{content.mimetype}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium">
                    {new Date(content.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Processing Status</p>
                  <p className="text-gray-900 dark:text-gray-200 font-medium capitalize">{content.processingStatus}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Content Analysis</p>
                  <div className="mt-1">
                    {getSensitivityBadge(content.sensitivityStatus)}
                  </div>
                </div>
              </div>
            </div>

            {content.sensitivityStatus === 'flagged' && (
              <div className="mt-4 bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">⚠ Content Warning</h3>
                <p className="text-sm text-red-700 dark:text-red-200">
                  This {contentType} has been flagged by our automated content analysis system. 
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