import React from 'react';
import { FileText, Calendar } from 'lucide-react';

const DoctorPrescriptions = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-600">Manage patient prescriptions</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <FileText className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <h3 className="text-lg font-semibold">Prescription Management</h3>
            <p className="text-gray-600">Create and manage prescriptions for your patients</p>
          </div>
        </div>
        <p className="text-gray-600">Prescription management functionality coming soon...</p>
      </div>
    </div>
  );
};

export default DoctorPrescriptions;