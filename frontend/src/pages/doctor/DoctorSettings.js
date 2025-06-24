import React from 'react';
import { Bell, Lock, Globe } from 'lucide-react';

const DoctorSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-blue-600" />
            <h3 className="ml-3 text-lg font-semibold">Notifications</h3>
          </div>
          <p className="text-gray-600">Notification preferences coming soon...</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
            <h3 className="ml-3 text-lg font-semibold">Security</h3>
          </div>
          <p className="text-gray-600">Security settings coming soon...</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Globe className="h-6 w-6 text-blue-600" />
            <h3 className="ml-3 text-lg font-semibold">Language & Region</h3>
          </div>
          <p className="text-gray-600">Language and region settings coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;