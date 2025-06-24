import React from 'react';
import { Star, User } from 'lucide-react';

const DoctorReviews = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Reviews</h1>
        <p className="text-gray-600">See what your patients are saying</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
          </div>
          <span className="ml-2 text-lg font-semibold">4.8 out of 5</span>
          <span className="ml-2 text-gray-600">(24 reviews)</span>
        </div>
        <p className="text-gray-600">Patient reviews functionality coming soon...</p>
      </div>
    </div>
  );
};

export default DoctorReviews;