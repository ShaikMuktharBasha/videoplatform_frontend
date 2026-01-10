import { useState, useEffect } from 'react';
import { videoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Comments = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    try {
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

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a public comment..."
          className="input-field w-full mb-2 min-h-[80px]"
          required
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="btn-primary"
          >
            Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 font-semibold">
                {comment.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                  {comment.user?.name || 'Unknown User'}
                  <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </p>
                {(user?._id === comment.user?._id || user?.role === 'Admin') && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
            </div>
          </div>
        ))}

        {!loading && comments.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet</p>
        )}
      </div>
    </div>
  );
};

export default Comments;
