import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Lock } from 'lucide-react';

interface EventAccessProps {
  onAccess: (eventCode: string, userName: string, organizerCode?: string) => void;
}

export function EventAccess({ onAccess }: EventAccessProps) {
  const [eventCode, setEventCode] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isOrganizerLogin, setIsOrganizerLogin] = useState(false);
  const [organizerCode, setOrganizerCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isOrganizerLogin && userName.trim().length < 2) {
      setError('Please enter a valid name');
      return;
    }

    if (eventCode.trim().length < 3) {
      setError('Please enter a valid event code');
      return;
    }

    if (isOrganizerLogin) {
      onAccess(eventCode.toUpperCase(), 'Organizer', organizerCode.toUpperCase());
    } else {
      onAccess(eventCode.toUpperCase(), userName.trim());
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
      <div className="flex flex-col items-center mb-6">
        <div className="bg-purple-100 p-4 rounded-full mb-4">
          {isOrganizerLogin ? (
            <Lock className="w-8 h-8 text-purple-600" />
          ) : (
            <Camera className="w-8 h-8 text-purple-600" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          {isOrganizerLogin ? 'Organizer Access' : 'Event Photos'}
        </h1>
        <p className="text-gray-600 text-center mt-2">
          {isOrganizerLogin
            ? 'Enter your event and organizer codes'
            : 'Enter your event code and name to start sharing photos'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="eventCode" className="block text-sm font-medium text-gray-700 mb-1">
            Event Code
          </label>
          <input
            type="text"
            id="eventCode"
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter event code"
            required
          />
        </div>

        {isOrganizerLogin ? (
          <div>
            <label htmlFor="organizerCode" className="block text-sm font-medium text-gray-700 mb-1">
              Organizer Code
            </label>
            <input
              type="text"
              id="organizerCode"
              value={organizerCode}
              onChange={(e) => setOrganizerCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter organizer code"
              required
            />
          </div>
        ) : (
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          {isOrganizerLogin ? 'Access Dashboard' : 'Join Event'}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsOrganizerLogin(!isOrganizerLogin);
            setError('');
            setEventCode('');
            setUserName('');
            setOrganizerCode('');
          }}
          className="w-full text-purple-600 text-sm hover:text-purple-700"
        >
          {isOrganizerLogin ? 'Join as Guest' : 'Login as Organizer'}
        </button>
      </form>
    </div>
  );
}