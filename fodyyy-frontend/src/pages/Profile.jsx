import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getInitials, isValidPhone, formatDate } from '../utils/helpers';

// Helper to split combined address ("Hostel, Room: 101") into parts
const parseStudentAddress = (address = '') => {
  if (!address) return { hostelAddress: '', roomNumber: '' };
  const roomMatch = address.match(/Room\s*:\s*(.+)$/i);
  const hostelAddress = address.replace(/,?\s*Room\s*:\s*(.+)$/i, '').trim();
  const roomNumber = roomMatch ? roomMatch[1].trim() : '';
  return { hostelAddress, roomNumber };
};

// Rebuild address for API
const buildStudentAddress = (hostelAddress, roomNumber) => {
  const host = (hostelAddress || '').trim();
  const room = (roomNumber || '').trim();
  if (!host && !room) return '';
  if (host && room) return `${host}, Room: ${room}`;
  return host || room; // fallback
};

// Inline editable row component
const EditableRow = ({
  id,
  label,
  icon,
  type = 'text',
  value,
  onSave,
  validator = null,
  placeholder = '',
  readOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  const handleSave = async () => {
    if (readOnly) return;
    const trimmed = typeof draft === 'string' ? draft.trim() : draft;
    if (validator) {
      const { valid, message } = validator(trimmed);
      if (!valid) {
        setError(message || 'Invalid value');
        return;
      }
    }
    try {
      setSaving(true);
      await onSave(trimmed);
      setIsEditing(false);
      setError('');
      toast.success('Updated successfully');
    } catch (e) {
      const msg = e?.message || 'Update failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value || '');
    setError('');
    setIsEditing(false);
  };

  return (
    <div className={`group p-4 rounded-xl border bg-white/80 backdrop-blur shadow-sm hover:shadow-md transition-all ${error ? 'border-red-300 animate-profile-shake' : 'border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <div className="mt-1 text-gray-400" aria-hidden="true">{icon}</div>
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="block text-xs font-semibold tracking-wide text-gray-500 mb-1">
            {label}
          </label>
          {!isEditing || readOnly ? (
            <div className="flex items-center justify-between">
              <p className="text-base text-gray-900 truncate pr-3">{value || <span className="text-gray-400">{placeholder}</span>}</p>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="shrink-0 inline-flex items-center gap-2 text-gray-500 hover:text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-50"
                  aria-label={`Edit ${label}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h2m4.586 1.586a2 2 0 010 2.828l-7.5 7.5a2 2 0 01-.878.518l-3 1a1 1 0 01-1.265-1.265l1-3a2 2 0 01.518-.878l7.5-7.5a2 2 0 012.828 0z" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                id={id}
                type={type}
                value={draft}
                onChange={(e) => { setDraft(e.target.value); if (error) setError(''); }}
                className={`flex-1 h-12 rounded-lg border-2 px-3 outline-none transition-all ${error ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'}`}
                placeholder={placeholder}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-green-500 text-white font-medium shadow hover:bg-green-600 disabled:opacity-60"
                aria-label={`Save ${label}`}
              >
                {saving ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8v0m0 0a8 8 0 018 8m0 0a8 8 0 01-8 8m0 0a8 8 0 01-8-8" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 disabled:opacity-60"
                aria-label={`Cancel ${label}`}
              >
                Cancel
              </button>
            </div>
          )}
          {error && (
            <p id={`${id}-error`} className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, isStudent, logout, updateUser } = useAuth();

  // For non-students, route to their profile page quickly
  useEffect(() => {
    if (user && !isStudent()) {
      navigate('/restaurant/profile');
    }
  }, [user, isStudent, navigate]);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const { hostelAddress, roomNumber } = useMemo(() => parseStudentAddress(profile?.address || user?.address || ''), [profile?.address, user?.address]);
  const [hostel, setHostel] = useState('');
  const [room, setRoom] = useState('');

  useEffect(() => {
    setHostel(hostelAddress);
    setRoom(roomNumber);
  }, [hostelAddress, roomNumber]);

  // Load latest profile from API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await authService.getProfile();
        if (res.success && res.data?.data) {
          setProfile(res.data.data);
        } else {
          // fallback to context user
          setProfile(user);
        }
      } catch (e) {
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const initial = getInitials(user?.name);

  const handleSaveField = async (patch) => {
    // Call API update, update context on success
    const res = await authService.updateProfile(patch);
    if (!res.success) throw new Error(res.message || 'Profile update failed');
    const updated = { ...user, ...(res.data?.data || patch) };
    updateUser(updated);
    setProfile(prev => ({ ...(prev || {}), ...(res.data?.data || patch) }));
  };

  const phoneValidator = (val) => ({ valid: isValidPhone(val), message: 'Please enter a valid phone number' });
  const requiredValidator = (val) => ({ valid: !!String(val || '').trim(), message: 'This field is required' });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-6 h-6 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <span>Loading profile…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Local styles for gentle shake animation */}
      <style>{`
        @keyframes profile-shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
        .animate-profile-shake { animation: profile-shake 0.4s ease both; }
      `}</style>

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Header / Avatar card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-white shadow-lg mb-5">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-semibold shadow-md" aria-label="User avatar">
                {initial || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {user?.isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium" aria-label="Active student">
                      <span className="sr-only">Status:</span>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Active Student
                    </span>
                  )}
                  {user?.createdAt && (
                    <span className="text-gray-500">Joined {formatDate(user.createdAt)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="h-12 rounded-2xl bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 flex items-center justify-center gap-2"
                aria-label="Go to order history"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Order History
              </button>
              <button
                type="button"
                onClick={async () => { await logout(); navigate('/login'); }}
                className="h-12 rounded-2xl bg-red-500 text-white font-semibold shadow hover:bg-red-600 flex items-center justify-center gap-2"
                aria-label="Sign out"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8v8a4 4 0 004 4h3" /></svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Profile details card */}
        <div className="rounded-3xl bg-white shadow-lg p-4 space-y-3 border border-orange-100">
          <EditableRow
            id="name"
            label="Full Name"
            value={profile?.name}
            onSave={(val) => handleSaveField({ name: val })}
            validator={requiredValidator}
            placeholder="Your name"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A4 4 0 018 17h8a4 4 0 012.879 1.204M15 11a3 3 0 10-6 0 3 3 0 006 0z" /></svg>}
          />

          {/* Email (readonly) */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-gray-400" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m8 0a4 4 0 10-8 0 4 4 0 008 0zm0 0v1a4 4 0 01-4 4H8a4 4 0 01-4-4v-1a8 8 0 1116 0v1a4 4 0 01-4 4h-4" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1">Email (read-only)</label>
                <div className="flex items-center justify-between">
                  <p className="text-base text-gray-900 break-all">{profile?.email}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-xs" aria-label="Locked">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11V7a4 4 0 10-8 0v4" /><rect x="4" y="11" width="16" height="9" rx="2" ry="2" strokeWidth="2" /></svg>
                    Locked
                  </span>
                </div>
              </div>
            </div>
          </div>

          <EditableRow
            id="phone"
            label="Phone Number"
            type="tel"
            value={profile?.phone}
            onSave={(val) => handleSaveField({ phone: val })}
            validator={phoneValidator}
            placeholder="e.g. +91 9876543210"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h1.28a2 2 0 011.414.586l1.44 1.44a2 2 0 010 2.828l-.72.72a2 2 0 000 2.828l3.58 3.58a2 2 0 002.828 0l.72-.72a2 2 0 012.828 0l1.44 1.44A2 2 0 0121 18.72V20a2 2 0 01-2 2h-1C9.163 22 2 14.837 2 6V5z" /></svg>}
          />

          {/* Student-specific fields */}
          <EditableRow
            id="hostel"
            label="Hostel / Address"
            value={hostel}
            onSave={async (val) => {
              const address = buildStudentAddress(val, room);
              await handleSaveField({ address });
              setHostel(val);
            }}
            validator={requiredValidator}
            placeholder="e.g. Hostel A, Block 2"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10l9-7 9 7v8a2 2 0 01-2 2h-3a2 2 0 01-2-2V12H8v6a2 2 0 01-2 2H3a2 2 0 01-2-2v-8z" /></svg>}
          />

          <EditableRow
            id="room"
            label="Room Number"
            value={room}
            onSave={async (val) => {
              const address = buildStudentAddress(hostel, val);
              await handleSaveField({ address });
              setRoom(val);
            }}
            validator={requiredValidator}
            placeholder="e.g. 101"
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 16V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8m18 0a2 2 0 01-2 2H5a2 2 0 01-2-2m18 0v2m-18-2v2" /></svg>}
          />
        </div>

        {/* Footer sign-out for extra clarity on mobile (optional second CTA) */}
        

        {/* Spacer to avoid bottom nav overlap */}
        <div className="h-24" />
      </div>
    </div>
  );
};

export default Profile;