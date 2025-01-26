import React from 'react';
import { Camera } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  description: string;
  userName: string;
  user_name: string;
  event_id: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  currentUserName: string;
  onDelete: () => void;
  isOrganizer: boolean;
}

export function PhotoGallery({ photos, currentUserName }: PhotoGalleryProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
      {photos.map((photo) => (
        <div 
          key={photo.id} 
          className="aspect-square"
        >
          <img
            src={photo.url}
            alt={photo.description || 'Event photo'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
      {photos.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
          <Camera className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-center">No photos yet. Be the first to share!</p>
        </div>
      )}
    </div>
  );
}