import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isEditor } = useAuth();
  const navigate = useNavigate();

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
            <Link 
              key={video._id} 
              to={`/video/${video._id}`}
              className="block bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/10 dark:border dark:border-gray-800 hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-800 relative h-48">
                {/* Placeholder for video thumbnail - real app would generate thumbnails */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 dark:bg-gray-950 text-white">
                  <span className="text-4xl">▶</span>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={video.title}>
                  {video.title}
                </h3>
                <div className="mt-1 flex justify-between items-center">
                   <p className="text-sm text-gray-600 dark:text-gray-400">
                      by <span className="font-semibold text-gray-900 dark:text-gray-200">{video.user?.name || 'Unknown'}</span>
                   </p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                      {video.views || 0} views
                   </p>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {video.description || 'No description'}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
