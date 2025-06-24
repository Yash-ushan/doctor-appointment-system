import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatLKR } from '../utils/currency';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock,
  Video,
  Building
} from 'lucide-react';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    city: '',
    minRating: '',
    maxFee: '',
    sortBy: 'rating'
  });
  const [showFilters, setShowFilters] = useState(false);

  const specializations = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'General Medicine', 'Neurology', 'Oncology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery', 'Urology'
  ];

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`/api/doctors?${queryParams}`);
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      specialization: '',
      city: '',
      minRating: '',
      maxFee: '',
      sortBy: 'rating'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Doctors</h1>
        <p className="text-gray-600">
          Search and book appointments with qualified healthcare professionals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors by name or specialty..."
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              name="search"
              onChange={handleFilterChange}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <select
                  name="specialization"
                  value={filters.specialization}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rating
                </label>
                <select
                  name="minRating"
                  value={filters.minRating}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Fee (LKR)
                </label>
                <input
                  type="number"
                  name="maxFee"
                  placeholder="Max fee in LKR"
                  value={filters.maxFee}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="rating">Rating</option>
                  <option value="experience">Experience</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {doctors.length} Doctor{doctors.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        <div className="divide-y">
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <div key={doctor._id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <img
                        src={doctor.userId?.avatar || 'https://via.placeholder.com/80'}
                        alt={doctor.userId?.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {doctor.userId?.name}
                        </h3>
                        <p className="text-blue-600 font-medium">
                          {doctor.specialization}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {doctor.experience} years experience
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center mt-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {doctor.rating?.toFixed(1) || '0.0'} 
                              ({doctor.totalRatings || 0} reviews)
                            </span>
                          </div>
                        </div>

                        {/* Hospitals */}
                        {doctor.hospitals && doctor.hospitals.length > 0 && (
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <Building className="h-4 w-4 mr-1" />
                            <span>{doctor.hospitals[0].name}</span>
                            {doctor.hospitals.length > 1 && (
                              <span className="ml-1">+{doctor.hospitals.length - 1} more</span>
                            )}
                          </div>
                        )}

                        {/* Bio */}
                        {doctor.bio && (
                          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                            {doctor.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Consultation Options */}
                  <div className="lg:w-80">
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {/* Online Consultation */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Video className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium">Online</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatLKR(doctor.consultationFees?.online || 1500)}</p>
                          <p className="text-xs text-gray-600">Video Call</p>
                        </div>
                      </div>

                      {/* Physical Consultation */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Building className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium">Physical</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatLKR(doctor.consultationFees?.physical || 2000)}</p>
                          <p className="text-xs text-gray-600">In-person</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Link
                          to={`/doctors/${doctor._id}`}
                          className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                          View Profile
                        </Link>
                        <Link
                          to={`/book-appointment/${doctor._id}`}
                          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                        >
                          Book Appointment
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorList;