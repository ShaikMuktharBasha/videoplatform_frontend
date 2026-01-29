import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { videoAPI, photoAPI } from '../services/api';
import { HandThumbUpIcon, HandThumbDownIcon, BookmarkIcon, PhotoIcon, VideoCameraIcon, ShieldExclamationIcon, EyeIcon, ChatBubbleLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid, HandThumbDownIcon as HandThumbDownSolid, BookmarkIcon as BookmarkSolid, PlayCircleIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [contentType, setContentType] = useState('video'); // 'video' or 'photo'
  const { isEditor, user } = useAuth();
  const navigate = useNavigate();
  const videoRefs = useRef({});
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

  // Get base URL for content preview
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const BASE_URL = API_URL.replace('/api', '');

  useEffect(() => {
    fetchContent();
  }, [filter, user, contentType]); 

  const handleMouseEnter = (id) => {
    if (contentType !== 'video') return;

    setHoveredVideoId(id);
    
    // Stop all other videos
    Object.keys(videoRefs.current).forEach(key => {
      const vid = videoRefs.current[key];
      if (String(key) !== String(id) && vid) {
        vid.pause();
        try {
          vid.currentTime = 1.0;
        } catch(e) { /* ignore */ }
      }
    });

    if (videoRefs.current[id]) {
      const playPromise = videoRefs.current[id].play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
           // console.log("Preview play failed:", error);
        });
      }
    }
  };

  const handleMouseLeave = (id) => {
    if (contentType !== 'video') return;

    const vid = videoRefs.current[id];
    
    if (vid && document.fullscreenElement && document.fullscreenElement === vid) {
      return; 
    }
    
    setHoveredVideoId(null);
    if (vid) {
        vid.pause();
        try {
          vid.currentTime = 1.0;
        } catch(e) { /* ignore */ }
    }
  };


  const fetchContent = async () => {
    try {
      setLoading(true);
      setItems([]); // Clear current items while loading
      
      const statusParam = filter === 'all' ? null : filter;
      
      let fetchedItems = [];
      
      if (contentType === 'video') {
          const response = await videoAPI.getAll(statusParam);
          fetchedItems = response.data.videos;
          
          if (user && user.savedVideos) {
            fetchedItems = fetchedItems.map(v => ({
              ...v,
              isSaved: user.savedVideos.includes(v._id)
            }));
          }
      } else {
          const response = await photoAPI.getAll(statusParam);
          fetchedItems = response.data.photos;
          
          if (user && user.savedPhotos) {
            fetchedItems = fetchedItems.map(p => ({
              ...p,
              isSaved: user.savedPhotos.includes(p._id)
            }));
          }
      }

      setItems(fetchedItems);
    } catch (error) {
      console.error(`Error fetching ${contentType}s:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        if (contentType === 'video') {
            await videoAPI.delete(id);
        } else {
            await photoAPI.delete(id);
        }
        setItems(items.filter(item => item._id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleLike = async (e, id) => {
    e.preventDefault();
    try {
      if (contentType === 'video') {
        await videoAPI.toggleLike(id);
      } else {
        await photoAPI.toggleLike(id);
      }
      fetchContent();
    } catch (error) {
      console.error('Error liking item:', error);
    }
  };

  const handleDislike = async (e, id) => {
    e.preventDefault();
    try {
      if (contentType === 'video') {
        await videoAPI.toggleDislike(id);
      } else {
        await photoAPI.toggleDislike(id);
      }
      fetchContent();
    } catch (error) {
      console.error('Error disliking item:', error);
    }
  };

  const handleSave = async (e, id) => {
    e.preventDefault();
    try {
      if (contentType === 'video') {
        await videoAPI.toggleSave(id);
      } else {
        await photoAPI.toggleSave(id);
      }
      fetchContent();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Content</h1>
        
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

        <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'pending' 
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === 'safe' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Published
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/10 dark:border dark:border-gray-800">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-lg">No {contentType}s found.</p>
          <Link to="/upload" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400">
            Upload your first {contentType} →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item._id} 
              className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-900/10 dark:border dark:border-gray-800 hover:shadow-lg transition-shadow duration-200 overflow-hidden flex flex-col group"
              onMouseEnter={() => handleMouseEnter(item._id)}
              onMouseLeave={() => handleMouseLeave(item._id)}
            >
              {/* Preview */}
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {item.processingStatus === 'completed' ? (
                  contentType === 'video' ? (
                    <>
                        <video 
                            ref={el => videoRefs.current[item._id] = el}
                            src={item.filepath && item.filepath.startsWith('http') ? item.filepath : `${BASE_URL}/uploads/${item.filename}`}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            poster={`${BASE_URL}/uploads/${item.thumbnail}`}
                        />
                        {/* Play Icon Overlay (visible when not hovering) */}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200 ${hoveredVideoId === item._id ? 'opacity-0' : 'opacity-100'}`}>
                            <PlayCircleIcon className="w-12 h-12 text-white opacity-80" />
                        </div>
                    </>
                  ) : (
                    <img 
                        src={item.filepath && item.filepath.startsWith('http') ? item.filepath : `${BASE_URL}/uploads/${item.filename}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="w-full max-w-[80%] px-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Processing</span>
                            <span>{item.processingProgress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${item.processingProgress || 0}%` }}></div>
                        </div>
                    </div>
                  </div>
                )}
                
                {/* Status Badge - Enhanced for content rating */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {/* Content Rating Badge */}
                  {item.contentRating === '18+' ? (
                    <span className="px-2 py-1 text-xs font-bold rounded bg-red-600 text-white flex items-center gap-1">
                      <ShieldExclamationIcon className="w-3 h-3" />
                      18+
                    </span>
                  ) : item.contentRating === 'public' ? (
                    <span className="px-2 py-1 text-xs font-bold rounded bg-green-600 text-white">
                      PUBLIC
                    </span>
                  ) : null}
                  
                  {/* Processing Status Badge */}
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    item.sensitivityStatus === 'safe'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : item.sensitivityStatus === 'adult'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : item.sensitivityStatus === 'horror'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                          : item.sensitivityStatus === 'violence'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                            : item.sensitivityStatus === 'flagged'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {item.sensitivityStatus === 'safe' ? 'Safe' 
                      : item.sensitivityStatus === 'adult' ? 'Adult Content'
                        : item.sensitivityStatus === 'horror' ? 'Horror'
                          : item.sensitivityStatus === 'violence' ? 'Violence'
                            : item.sensitivityStatus === 'flagged' ? 'Flagged' 
                              : 'Processing'}
                  </span>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <Link to={`/${contentType === 'video' ? 'video' : 'photo'}/${item._id}`} className="block flex-1 min-w-0 mr-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 transition-colors" title={item.title}>
                        {item.title}
                        </h3>
                    </Link>
                    <div className="flex space-x-1 items-center">
                        <button
                          onClick={(e) => handleLike(e, item._id)}
                          className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                          title={item.likes?.includes(user?._id) ? "Unlike" : "Like"}
                        >
                          {item.likes?.includes(user?._id) ? (
                            <HandThumbUpSolid className="w-5 h-5 text-primary-600" />
                          ) : (
                            <HandThumbUpIcon className="w-5 h-5" />
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => handleDislike(e, item._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title={item.dislikes?.includes(user?._id) ? "Remove Dislike" : "Dislike"}
                        >
                          {item.dislikes?.includes(user?._id) ? (
                            <HandThumbDownSolid className="w-5 h-5 text-red-600" />
                          ) : (
                            <HandThumbDownIcon className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          onClick={(e) => handleSave(e, item._id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title={item.isSaved ? "Unsave" : "Save"}
                        >
                          {item.isSaved ? (
                            <BookmarkSolid className="w-5 h-5 text-blue-600" />
                          ) : (
                            <BookmarkIcon className="w-5 h-5" />
                          )}
                        </button>

                        {/* Delete Action */}
                        <button 
                            onClick={(e) => handleDelete(e, item._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center space-x-3">
                       <span className="flex items-center gap-1" title="Views">
                         <EyeIcon className="w-4 h-4" />
                         {item.views || 0}
                       </span>
                       <span className="flex items-center gap-1" title="Likes">
                         <HandThumbUpIcon className="w-4 h-4" />
                         {(item.likes || []).length}
                       </span>
                       {contentType === 'video' && (
                           <span className="flex items-center gap-1" title="Comments">
                             <ChatBubbleLeftIcon className="w-4 h-4" />
                             {item.commentsCount || 0}
                           </span>
                       )}
                     </div>
                     <div className="flex items-center gap-1 text-xs text-gray-400" title="Uploaded at">
                        <ClockIcon className="w-3 h-3" />
                        {formatDate(item.createdAt)}
                     </div>
                   </div>
                   {/* Show analysis info for 18+ content */}
                   {item.contentRating === '18+' && item.moderationAnalysis && (
                     <div className="flex items-center space-x-1 text-xs">
                       {item.moderationAnalysis.nudity?.detected && (
                         <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded">Nudity</span>
                       )}
                       {item.moderationAnalysis.horror?.detected && (
                         <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded">Horror</span>
                       )}
                       {item.moderationAnalysis.violence?.detected && (
                         <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded">Violence</span>
                       )}
                       {item.moderationAnalysis.gore?.detected && (
                         <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded">Gore</span>
                       )}
                     </div>
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