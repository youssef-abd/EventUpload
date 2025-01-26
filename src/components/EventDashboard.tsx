import React from 'react';
import { Download, Key, Users, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';

interface Photo {
  id: string;
  url: string;
  description: string;
  userName: string;
}

interface Event {
  id: string;
  code: string;
  name: string;
  organizer_code: string;
}

interface EventDashboardProps {
  event: Event;
  photos: Photo[];
  onPhotosUpdate: () => void;
}

export function EventDashboard({ event, photos, onPhotosUpdate }: EventDashboardProps) {
  const handleDownloadAll = async () => {
    try {
      toast.loading('Preparing download...', { id: 'download' });
      const zip = new JSZip();
      
      const downloadPromises = photos.map(async (photo) => {
        try {
          const response = await fetch(photo.url);
          if (!response.ok) throw new Error('Failed to fetch image');
          
          const blob = await response.blob();
          const fileName = `${photo.userName}-${photo.id}.${blob.type.split('/')[1]}`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error('Failed to download photo:', error);
        }
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: 'blob' });
      
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.name}-photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download complete!', { id: 'download' });
    } catch (error) {
      toast.error('Failed to download photos', { id: 'download' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{event.name}</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-3">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>Event Code: <span className="font-medium">{event.code}</span></span>
            </div>
            <div className="flex items-center text-sm text-purple-600">
              <Key className="w-4 h-4 mr-2" />
              <span>Organizer Code: <span className="font-medium">{event.organizer_code}</span></span>
            </div>
          </div>
        </div>
        <button
          onClick={handleDownloadAll}
          className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download All
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Event Gallery</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Camera className="w-4 h-4 mr-1.5" />
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              <img
                src={photo.url}
                alt={photo.description}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs">
                <p className="line-clamp-1">By: {photo.userName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}