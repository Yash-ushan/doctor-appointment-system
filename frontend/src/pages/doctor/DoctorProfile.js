import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, User } from 'lucide-react';

const DoctorProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    bio: '',
    consultationFees: {
      physical: 500,
      online: 300
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.doctorProfile) {
        setProfile(response.data.doctorProfile);
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await axios.put('/api/doctors/profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Update your professional information</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Bio
            </label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write about your experience, specializations, and approach to patient care..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physical Consultation Fee (LKR)
              </label>
              <input
                type="number"
                value={profile.consultationFees?.physical || 500}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  consultationFees: {
                    ...prev.consultationFees,
                    physical: parseInt(e.target.value)
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Online Consultation Fee (LKR)
              </label>
              <input
                type="number"
                value={profile.consultationFees?.online || 300}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  consultationFees: {
                    ...prev.consultationFees,
                    online: parseInt(e.target.value)
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
          >
            <Save className="mr-2" size={20} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;