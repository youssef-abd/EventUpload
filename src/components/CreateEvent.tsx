import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateEventProps {
  onEventCreated: (event: any) => void;
}

export function CreateEvent({ onEventCreated }: CreateEventProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateEventCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const generateOrganizerCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const eventCode = generateEventCode();
      const organizerCode = generateOrganizerCode();
      
      const { data: event, error: createError } = await supabase
        .from('events')
        .insert({
          name: name.trim(),
          code: eventCode,
          organizer_code: organizerCode,
          organizer_id: 'organizer',
        })
        .select()
        .single();

      if (createError) throw createError;
      if (event) {
        onEventCreated(event);
      }
    } catch (err) {
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-purple-100 p-4 rounded-full mb-4">
          <Plus className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
        <p className="text-gray-600 text-center mt-2">
          Create an event and share the code with your guests
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Event Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter event name"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}