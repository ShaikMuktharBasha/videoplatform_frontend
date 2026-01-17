import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isEditor } = useAuth();
  const navigate = useNavigate();

  // Get base URL for video preview
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    // Redirect Editors and Admins to Dashboard (My Videos) by default
    if (isEditor) {
      navigate('/dashboard');
      return;
    }
    fetchVideos();
  }, [user, isEditor, navigate]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getPublic();
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Error fetching public videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Feed</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/10 dark:border dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No public videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div 
              key={video._id} 
              className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/10 dark:border dark:border-gray-800 hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col"
            >
              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {video.processingStatus === 'completed' ? (
                  <video 
                    src={video.filepath && video.filepath.startsWith('http') ? video.filepath : `${BASE_URL}/uploads/${video.filename}`}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <div className="text-gray-500 flex flex-col items-center">
                    <span className="text-2xl mb-2">⏳</span>
                    <span className="text-xs">Processing...</span>
                  </div>
                )}
                {/* Duration Badge - Only show if not playing/controls? Or just keep it? Dashboard removes overlapping UI */}
                {/* <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div> */}
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <Link to={`/video/${video._id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 transition-colors" title={video.title}>
                    {video.title}
                    </h3>
                </Link>
                <div className="mt-1 flex justify-between items-center mb-2">
                   <p className="text-sm text-gray-600 dark:text-gray-400">
                      by <span className="font-semibold text-gray-900 dark:text-gray-200">{video.user?.name || 'Unknown'}</span>
                   </p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                      {video.views || 0} views
                   </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                  {video.description || 'No description'}
                </p>
                
                <div className="mt-auto flex justify-between items-center border-t pt-3 dark:border-gray-700">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  <Link 
                    to={`/video/${video._id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Watch Now →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
