import React, { useState, useEffect } from 'react';
import { EventAccess } from './components/EventAccess';
import { CreateEvent } from './components/CreateEvent';
import { PhotoUpload } from './components/PhotoUpload';
import { PhotoGallery } from './components/PhotoGallery';
import { EventDashboard } from './components/EventDashboard';
import { supabase } from './lib/supabase';
import { Toaster, toast } from 'react-hot-toast';
import { Plus, Camera, ImagePlus, LogOut } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  description: string;
  userName: string;
  user_name: string;
  created_at: string;
}

interface Event {
  id: string;
  code: string;
  name: string;
  organizer_code: string;
  organizer_id: string;
  cover_image?: string;
}

function App() {
  const [event, setEvent] = useState<Event | null>(() => {
    const savedEvent = localStorage.getItem('event');
    return savedEvent ? JSON.parse(savedEvent) : null;
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('userName') || '';
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    if (event?.id) {
      loadPhotos();
      
      const channel = supabase
        .channel('photos')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'photos',
            filter: `event_id=eq.${event.id}`,
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              setPhotos(current => current.filter(photo => photo.id !== payload.old.id));
            } else if (payload.eventType === 'INSERT') {
              const newPhoto = payload.new as Photo;
              setPhotos(current => [newPhoto, ...current]);
            }
          }
        )
        .subscribe();

      // Subscribe to event changes to update cover image
      const eventChannel = supabase
        .channel('event')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'events',
            filter: `id=eq.${event.id}`,
          },
          (payload) => {
            if (payload.new) {
              setEvent(prev => prev ? { ...prev, ...payload.new } : null);
              localStorage.setItem('event', JSON.stringify(payload.new));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(eventChannel);
      };
    }
  }, [event?.id]);

  const handleCoverImageUpload = async (file: File) => {
    if (!event?.id || !isOrganizer) return;
    setUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${event.id}/cover.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('covers')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('events')
        .update({ cover_image: publicUrl })
        .eq('id', event.id);

      if (updateError) throw updateError;

      // Fetch the updated event to ensure we have the latest data
      const { data: updatedEvent } = await supabase
        .from('events')
        .select('*')
        .eq('id', event.id)
        .single();

      if (updatedEvent) {
        setEvent(updatedEvent);
        localStorage.setItem('event', JSON.stringify(updatedEvent));
      }

      toast.success('Cover image updated successfully!');
    } catch (error) {
      toast.error('Failed to update cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', event?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      toast.error('Failed to load photos');
    }
  };

  const handleAccess = async (eventCode: string, name: string, organizerCode?: string) => {
    try {
      // First, get the event data
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('code', eventCode.toUpperCase())
        .single();

      if (eventError || !eventData) {
        toast.error('Invalid event code');
        return;
      }

      // If organizer code is provided, verify it
      if (organizerCode) {
        if (eventData.organizer_code !== organizerCode.toUpperCase()) {
          toast.error('Invalid organizer code');
          return;
        }
      }

      const isOrganizerLogin = Boolean(organizerCode);
      localStorage.setItem('event', JSON.stringify(eventData));
      localStorage.setItem('userName', isOrganizerLogin ? 'Organizer' : name);

      setEvent(eventData);
      setUserName(isOrganizerLogin ? 'Organizer' : name);
      setIsOrganizer(isOrganizerLogin);
      toast.success(`Welcome to ${eventData.name}!`);
    } catch (error) {
      toast.error('Failed to access event');
    }
  };

  const handleEventCreated = (newEvent: Event) => {
    setEvent(newEvent);
    setUserName('Organizer');
    setIsOrganizer(true);
    localStorage.setItem('event', JSON.stringify(newEvent));
    localStorage.setItem('userName', 'Organizer');
    setIsCreatingEvent(false);
    toast.success(`Organizer Code: ${newEvent.organizer_code}`);
  };

  const handleUpload = async (files: File[]) => {
    if (!event?.id) return;
    setLoading(true);
    
    try {
      for (const file of files) {
        const fileId = crypto.randomUUID();
        const fileExt = file.name.split('.').pop();
        const filePath = `${event.id}/${fileId}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);

        const { error } = await supabase.from('photos').insert({
          id: fileId,
          event_id: event.id,
          url: publicUrl,
          user_name: userName,
          description: '',
        });

        if (error) throw error;
      }

      toast.success('Photos uploaded successfully!');
      setShowUploadModal(false);
      await loadPhotos();
    } catch (error) {
      toast.error('Failed to upload photos');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveEvent = () => {
    localStorage.removeItem('event');
    localStorage.removeItem('userName');
    setEvent(null);
    setUserName('');
    setPhotos([]);
    setIsOrganizer(false);
    setShowLeaveConfirm(false);
    toast.success('You have left the event');
  };

  if (!event || !userName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        {isCreatingEvent ? (
          <CreateEvent onEventCreated={handleEventCreated} />
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <EventAccess onAccess={handleAccess} />
            <button
              onClick={() => setIsCreatingEvent(true)}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Event
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="relative bg-purple-600 h-32">
        {/* Leave Event Button */}
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="absolute top-4 right-4 flex items-center px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors text-sm"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Leave Event
        </button>

        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
          <div className="relative w-24 h-24 rounded-full bg-white p-1.5 shadow-lg group">
            {event.cover_image ? (
              <img 
                src={event.cover_image} 
                alt={event.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-purple-100 flex items-center justify-center">
                <Camera className="w-8 h-8 text-purple-600" />
              </div>
            )}
            {isOrganizer && (
              <label 
                htmlFor="cover-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ImagePlus className="w-6 h-6 text-white" />
                <input
                  type="file"
                  id="cover-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverImageUpload(file);
                  }}
                  disabled={uploadingCover}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Event Info */}
      <div className="pt-16 pb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{event.name}</h1>
        <p className="text-gray-600 mt-2">Welcome, {userName}!</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        {isOrganizer ? (
          <EventDashboard
            event={event}
            photos={photos}
            onPhotosUpdate={loadPhotos}
          />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="aspect-square bg-gray-50 rounded-none flex flex-col items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500 mt-2">Add Photos</span>
            </button>

            {photos.map((photo) => (
              <div key={photo.id} className="aspect-square">
                <img
                  src={photo.url}
                  alt={photo.description || 'Event photo'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && !isOrganizer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Upload Photos</h2>
            </div>
            <div className="p-4">
              <PhotoUpload onUpload={handleUpload} loading={loading} />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Leave Event?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to leave this event? You can always rejoin later with the event code.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveEvent}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Leave Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;