import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI, photoAPI } from '../services/api';

const Upload = () => {
  const [contentType, setContentType] = useState('video'); // 'video' or 'photo'
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [fileDuration, setFileDuration] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [visualProgress, setVisualProgress] = useState(0); // For smooth animation
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadStage, setUploadStage] = useState(''); // 'cloudinary', 'saving', 'processing'
  const [error, setError] = useState('');
  const [uploadedId, setUploadedId] = useState(null);
  
  const navigate = useNavigate();

  // Polling for progress
  useEffect(() => {
    let pollInterval;

    if (processing && uploadedId) {
      pollInterval = setInterval(async () => {
        try {
          const api = contentType === 'video' ? videoAPI : photoAPI;
          const response = await api.getById(uploadedId);
          const data = contentType === 'video' ? response.data.video : response.data.photo;
          
          setProcessingProgress(data.processingProgress || 0);

          if (data.processingStatus === 'completed') {
            setProcessingProgress(100);
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } else if (data.processingStatus === 'failed') {
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
  }, [processing, uploadedId, navigate, contentType]);

  // Smooth progress animation
  useEffect(() => {
     if (processingProgress > visualProgress) {
        const interval = setInterval(() => {
           setVisualProgress(prev => {
              if (prev >= processingProgress) {
                 clearInterval(interval);
                 return prev;
              }
              return prev + 1;
           });
        }, 50);
        return () => clearInterval(interval);
     }
  }, [processingProgress, visualProgress]);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        // Size validation - increased limits since we upload directly to Cloudinary
        // 500MB for video, 50MB for photo
        const sizeLimit = contentType === 'video' ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
        
        if (selectedFile.size > sizeLimit) {
            setError(`File too large. Max ${contentType === 'video' ? '500MB' : '50MB'}.`);
            return;
        }

        const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-flv', 'video/x-matroska', 'video/webm'];
        const validPhotoTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        const validTypes = contentType === 'video' ? validVideoTypes : validPhotoTypes;

        if (!validTypes.includes(selectedFile.type)) {
            setError(`Invalid file type. Please upload a ${contentType}.`);
            return;
        }

        setFile(selectedFile);
        setError('');

        if (contentType === 'video') {
            // Extract duration for videos
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = function() {
                window.URL.revokeObjectURL(video.src);
                setFileDuration(video.duration);
            }
            video.src = URL.createObjectURL(selectedFile);
        } else {
            setFileDuration(null);
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    setError('');
    setUploading(true);
    setUploadProgress(0);
    setUploadStage('cloudinary');

    try {
      let response;
      
      if (contentType === 'video') {
        // Use direct Cloudinary upload for videos (bypasses Vercel's 4.5MB limit)
        response = await videoAPI.uploadDirect(
          file, 
          formData.title, 
          formData.description,
          fileDuration ? Math.round(fileDuration) : null,
          (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            if (percentCompleted === 100) {
              setUploadStage('saving');
            }
          }
        );
        setUploadedId(response.data.video.id);
      } else {
        // Use direct Cloudinary upload for photos
        response = await photoAPI.uploadDirect(
          file, 
          formData.title, 
          formData.description,
          (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            if (percentCompleted === 100) {
              setUploadStage('saving');
            }
          }
        );
        setUploadedId(response.data.photo.id);
      }

      setUploading(false);
      setProcessing(true);
      setUploadStage('processing');
      
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMsg);
      setUploading(false);
      setUploadStage('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Upload Content</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        
        {/* Content Type Toggle */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <button
                type="button"
                onClick={() => { setContentType('video'); setFile(null); setError(''); }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    contentType === 'video' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
                Upload Video
            </button>
            <button
                type="button"
                onClick={() => { setContentType('photo'); setFile(null); setError(''); }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    contentType === 'photo' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
                Upload Photo
            </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {uploading && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {uploadStage === 'cloudinary' && 'Uploading to cloud...'}
                {uploadStage === 'saving' && 'Saving to database...'}
              </span>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {!processing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {contentType === 'video' ? 'Video File * (Max 500MB)' : 'Photo File * (Max 50MB)'}
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-primary-500 transition-colors">
                <div className="space-y-1 text-center">
                  {!file ? (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload a file</span>
                          <input  
                            name="file" 
                            type="file" 
                            accept={contentType === 'video' ? "video/*" : "image/*"}
                            className="sr-only" 
                            onChange={handleFileChange}
                            disabled={uploading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {contentType === 'video' ? 'MP4, MOV, AVI up to 500MB' : 'PNG, JPG, GIF up to 50MB'}
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs">{file.name}</span>
                        <button 
                            type="button" 
                            onClick={() => { setFile(null); setFileDuration(null); }}
                            className="ml-2 text-red-500 hover:text-red-700"
                        >
                            Remove
                        </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder={contentType === 'video' ? 'Describe your video (e.g., funny cat, nature, cooking tutorial)' : 'Describe your photo in one keyword (e.g., sunset, portrait, food)'}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm py-2 px-3"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ⚠️ Use descriptive keywords. Content is auto-moderated based on title. Misleading titles may result in account action.
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder={`Enter ${contentType} description (optional)`}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm py-2 px-3"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !file}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                (uploading || !file) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? `Uploading ${uploadProgress}%...` : 'Upload'}
            </button>
          </form>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Processing {contentType === 'video' ? 'Video' : 'Photo'}...</h3>
            
            {/* Processing Steps */}
            <div className="max-w-md mx-auto space-y-6">
                
                {/* Progress Bar */}
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200 dark:bg-primary-900 dark:text-primary-300">
                            Analysis in progress
                        </span>
                        </div>
                        <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-primary-600 dark:text-primary-400">
                            {visualProgress}%
                        </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200 dark:bg-gray-700">
                        <div style={{ width: `${visualProgress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-300 ease-out"></div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className={`flex items-center space-x-3 text-sm ${visualProgress > 10 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        <span className="w-5 h-5 flex items-center justify-center border rounded-full text-xs">1</span>
                        <span>Uploading file...</span>
                    </div>
                    <div className={`flex items-center space-x-3 text-sm ${visualProgress > 40 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        <span className="w-5 h-5 flex items-center justify-center border rounded-full text-xs">2</span>
                        <span>Analyzing content...</span>
                    </div>
                    <div className={`flex items-center space-x-3 text-sm ${visualProgress > 70 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        <span className="w-5 h-5 flex items-center justify-center border rounded-full text-xs">3</span>
                        <span>Checking sensitivity...</span>
                    </div>
                    <div className={`flex items-center space-x-3 text-sm ${visualProgress >= 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        <span className="w-5 h-5 flex items-center justify-center border rounded-full text-xs">4</span>
                        <span>Finalizing...</span>
                    </div>
                </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;