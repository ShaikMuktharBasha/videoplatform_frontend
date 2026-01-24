import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { videoAPI, photoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PhotoIcon, VideoCameraIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { PlayCircleIcon } from '@heroicons/react/24/solid';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState('video'); // 'video' or 'photo'
  const [ageVerified, setAgeVerified] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [viewingAdult, setViewingAdult] = useState(false);
  const { user, isEditor } = useAuth();
  const navigate = useNavigate();

  // Get base URL for content preview
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    // Redirect Editors and Admins to Dashboard (My Content) by default
    if (isEditor) {
      navigate('/dashboard');
      return;
    }
    fetchContent();
  }, [user, isEditor, navigate, contentType, viewingAdult]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setItems([]);
      
      let fetchedItems = [];
      if (contentType === 'video') {
         if (viewingAdult && ageVerified) {
           const response = await videoAPI.getAdult();
           fetchedItems = response.data.videos;
         } else {
           const response = await videoAPI.getPublic();
           fetchedItems = response.data.videos;
         }
      } else {
         if (viewingAdult && ageVerified) {
           const response = await photoAPI.getAdult();
           fetchedItems = response.data.photos;
         } else {
           const response = await photoAPI.getPublic();
           fetchedItems = response.data.photos;
         }
      }
      
      setItems(fetchedItems);
    } catch (error) {
      console.error(`Error fetching public ${contentType}s:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdultToggle = () => {
    if (!ageVerified && !viewingAdult) {
      setShowAgeModal(true);
    } else {
      setViewingAdult(!viewingAdult);
    }
  };

  const confirmAge = () => {
    setAgeVerified(true);
    setViewingAdult(true);
    setShowAgeModal(false);
  };

  // Content Rating Badge Component
  const ContentRatingBadge = ({ rating, status }) => {
    if (rating === '18+' || status === 'adult' || status === 'horror' || status === 'violence') {
      return (
        <span className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-md flex items-center gap-1 z-10">
          <ShieldExclamationIcon className="w-3 h-3" />
          18+
        </span>
      );
    }
    if (rating === 'public' && status === 'safe') {
      return (
        <span className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-md z-10">
          PUBLIC
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Age Verification Modal */}
      {showAgeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 text-center">
            <ShieldExclamationIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Age Verification Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This section contains mature content (18+) including nudity, horror, violence, or other sensitive material.
              By proceeding, you confirm that you are at least 18 years old.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setShowAgeModal(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAge}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                I am 18+
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Feed</h1>
          {viewingAdult && (
            <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full flex items-center gap-1">
              <ShieldExclamationIcon className="w-4 h-4" />
              18+ Content
            </span>
          )}
        </div>
        
        <div className="flex space-x-3">
          {/* Adult Content Toggle */}
          <button
            onClick={handleAdultToggle}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewingAdult
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <ShieldExclamationIcon className="w-5 h-5" />
            <span>{viewingAdult ? 'Exit 18+' : '18+ Content'}</span>
          </button>
          
          {/* Content Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
                onClick={() => setContentType('video')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    contentType === 'video'
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <VideoCameraIcon className="w-5 h-5" />
                <span>Videos</span>
            </button>
            <button
                onClick={() => setContentType('photo')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    contentType === 'photo'
                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
                <PhotoIcon className="w-5 h-5" />
                <span>Photos</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/10 dark:border dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No public {contentType}s yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item._id} 
              className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/10 dark:border dark:border-gray-800 hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col group"
            >
              {/* Preview */}
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {/* Content Rating Badge */}
                <ContentRatingBadge rating={item.contentRating} status={item.sensitivityStatus} />
                
                {item.processingStatus === 'completed' ? (
                   contentType === 'video' ? (
                    <>
                        <video 
                            src={item.filepath && item.filepath.startsWith('http') ? item.filepath : `${BASE_URL}/uploads/${item.filename}`}
                            className="w-full h-full object-cover"
                            poster={item.thumbnail ? `${BASE_URL}/uploads/${item.thumbnail}` : undefined}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                            <PlayCircleIcon className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </>
                   ) : (
                    <img 
                        src={item.filepath && item.filepath.startsWith('http') ? item.filepath : `${BASE_URL}/uploads/${item.filename}`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                   )
                ) : (
                  <div className="text-gray-500 flex flex-col items-center">
                    <span className="text-2xl mb-2">⏳</span>
                    <span className="text-xs">Processing...</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <Link to={`/${contentType === 'video' ? 'video' : 'photo'}/${item._id}`} className="block">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 transition-colors" title={item.title}>
                    {item.title}
                    </h3>
                </Link>
                <div className="mt-1 flex justify-between items-center mb-2">
                   <p className="text-sm text-gray-600 dark:text-gray-400">
                      by <span className="font-semibold text-gray-900 dark:text-gray-200">{item.user?.name || 'Unknown'}</span>
                   </p>
                   <div className="flex items-center space-x-2">
                     {/* Show sensitivity status indicator */}
                     {item.sensitivityStatus === 'horror' && (
                       <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">Horror</span>
                     )}
                     {item.sensitivityStatus === 'violence' && (
                       <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">Violence</span>
                     )}
                     {item.sensitivityStatus === 'adult' && (
                       <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">Adult</span>
                     )}
                     <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.views || 0} views
                     </p>
                   </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                  {item.description || 'No description'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
