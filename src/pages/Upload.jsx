import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0); // For smooth animation
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [uploadedVideoId, setUploadedVideoId] = useState(null);
  
  const navigate = useNavigate();

  // Polling for progress
  useEffect(() => {
    let pollInterval;

    if (processing && uploadedVideoId) {
      pollInterval = setInterval(async () => {
        try {
          const response = await videoAPI.getById(uploadedVideoId);
          const video = response.data.video;
          
          setProcessingProgress(video.processingProgress || 0);

          if (video.processingStatus === 'completed') {
            setProcessingProgress(100);
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } else if (video.processingStatus === 'failed') {
            setError('Processing failed');
            setProcessing(false);
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 2000); // Check every 2 seconds
    }

    return () => {
        if (pollInterval) clearInterval(pollInterval);
    };
  }, [processing, uploadedVideoId, navigate]);

  // Smooth progress animation effect
  useEffect(() => {
    if (processing && visualProgress < processingProgress) {
      const timer = setTimeout(() => {
        setVisualProgress(prev => {
          const next = prev + 1;
          return next > processingProgress ? processingProgress : next;
        });
      }, 50); // Updates every 50ms for smooth counting
      return () => clearTimeout(timer);
    } else if (!processing && processingProgress === 0) {
      setVisualProgress(0);
    } else if (visualProgress > processingProgress && processing) {
       // Reset if we start over
       setVisualProgress(processingProgress);
    }
  }, [visualProgress, processingProgress, processing]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv', 'video/webm'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid video file (mp4, avi, mov, wmv, flv, mkv, webm)');
        return;
      }
      
      // Validate file size (4.5MB max for Vercel/Serverless)
      const maxSize = 4.5 * 1024 * 1024; // 4.5MB
      if (selectedFile.size > maxSize) {
        setError('File size must be less than 4.5MB (Vercel Serverless Limit). For larger files, please configure cloud storage.');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a video file');
      return;
    }
    
    if (!formData.title) {
      setError('Please enter a title');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    const uploadFormData = new FormData();
    uploadFormData.append('video', file);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('description', formData.description);

    try {
      const response = await videoAPI.upload(uploadFormData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      setUploading(false);
      setProcessing(true);
      setProcessingProgress(0);
      setVisualProgress(0);
      setUploadedVideoId(response.data.video.id);
      
    } catch (error) {
      setUploading(false);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Video</h1>
        <p className="text-gray-600 mt-1">Share your content with the platform</p>
      </div>

      <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {!uploading && !processing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video File *
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer dark:bg-gray-800 dark:text-gray-300"
                  required
                />
                {file && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  rows="4"
                  placeholder="Enter video description (optional)"
                />
              </div>

              <div className="flex space-x-4">
                <button type="submit" className="flex-1 btn-primary">
                  Upload Video
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {uploading && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</span>
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-primary-600 dark:bg-primary-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {processing && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Processing & Analyzing Content...
                    </span>
                    <span className="text-sm font-medium text-primary-600 dark:text-primary-400">{visualProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-green-600 dark:bg-green-500 h-3 rounded-full transition-all duration-100 ease-linear"
                      style={{ width: `${visualProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
                    {visualProgress === 100 
                      ? '✓ Processing complete! Redirecting to dashboard...'
                      : 'Please wait while we analyze your video for sensitive content...'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
};
export default Upload;
