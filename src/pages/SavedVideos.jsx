import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI, photoAPI } from '../services/api';
import { PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { PlayCircleIcon } from '@heroicons/react/24/solid';

const SavedVideos = () => { // Keeping component name matching file name for consistency, though it handles Content
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState('video'); // 'video' or 'photo'
  
  // Get base URL for content preview
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    fetchItems();
  }, [contentType]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setItems([]);
      
      let fetchedItems = [];
      if (contentType === 'video') {
         const response = await videoAPI.getSaved();
         fetchedItems = response.data.videos;
      } else {
         const response = await photoAPI.getSaved();
         fetchedItems = response.data.photos;
      }

      setItems(fetchedItems);
    } catch (error) {
      console.error(`Error fetching saved ${contentType}s:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Saved Content</h1>
        
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/10 dark:border dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-lg">You haven't saved any {contentType}s yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item._id} 
              className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/10 dark:border dark:border-gray-800 hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col group"
            >
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
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
                   <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.views || 0} views
                   </p>
                </div>
                
                <div className="mt-auto flex justify-between items-center border-t pt-3 dark:border-gray-700">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <Link 
                    to={`/${contentType === 'video' ? 'video' : 'photo'}/${item._id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    View Now →
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

export default SavedVideos;