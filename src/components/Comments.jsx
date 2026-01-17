import { useState, useEffect } from 'react';
import { videoAPI, photoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Comments = ({ videoId, contentType = 'video' }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (contentType === 'video') {
        fetchComments();
    } else {
        setLoading(false); // No comments for photos yet
    }
  }, [videoId, contentType]);

  const fetchComments = async () => {
    try {
      // Currently only videoAPI has getComments
      // If photoAPI gets comments, we would use: 
      // const api = contentType === 'video' ? videoAPI : photoAPI;
      // const response = await api.getComments(videoId);
      
      const response = await videoAPI.getComments(videoId);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await videoAPI.addComment(videoId, newComment);
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await videoAPI.deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (contentType !== 'video') {
      return null; // Or a message saying not supported
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Comments ({comments.length})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
             <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                {user.name.charAt(0).toUpperCase()}
             </div>
             <div className="flex-grow">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
                    required
                ></textarea>
                <div className="mt-2 text-right">
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="btn-primary py-1.5 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Comment
                    </button>
                </div>
             </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">Please <a href="/login" className="text-primary-600 hover:underline">log in</a> to comment.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
               <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                  {comment.user?.name?.charAt(0).toUpperCase() || '?'}
               </div>
               <div className="flex-grow">
                  <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white mr-2">
                            {comment.user?.name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {(user && (user._id === comment.user?._id || user.role === 'Admin')) && (
                          <button 
                            onClick={() => handleDelete(comment._id)}
                            className="text-gray-400 hover:text-red-500 text-sm"
                          >
                            Delete
                          </button>
                      )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;