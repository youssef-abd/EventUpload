import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  onUpload: (files: File[]) => void;
  loading?: boolean;
}

export function PhotoUpload({ onUpload, loading = false }: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
    
    // Create previews
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => {
      // Clean up old previews
      prev.forEach(url => URL.revokeObjectURL(url));
      return newPreviews;
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: true,
    disabled: loading
  });

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      // Clean up previews after upload
      previews.forEach(url => URL.revokeObjectURL(url));
      setPreviews([]);
      setSelectedFiles([]);
    }
  };

  const handleClear = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setPreviews([]);
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedFiles.length > 0 ? 'bg-purple-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {previews.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={preview} className="relative aspect-square rounded-lg overflow-hidden group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <ImageIcon className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {loading
                ? "Uploading..."
                : isDragActive
                ? "Drop the photos here..."
                : "Drag 'n' drop photos here, or click to select"}
            </p>
            <p className="text-xs text-gray-500">Supported formats: JPEG, PNG</p>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleClear}
            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4 mr-2" />
            Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Photo' : 'Photos'}
          </button>
        </div>
      )}
    </div>
  );
}