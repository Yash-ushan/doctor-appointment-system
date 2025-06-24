import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UserCheck,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Star,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Stethoscope,
  Calendar,
  DollarSign
} from 'lucide-react';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    specialization: '',
    search: '',
    status: '',
    isVerified: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`/api/admin/doctors?${queryParams}`);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Set empty array as fallback and don't show error toast
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDoctor = async (doctorId, currentStatus) => {
    try {
      await axios.put(`/api/admin/verify-doctor/${doctorId}`, {
        isVerified: !currentStatus
      });
      toast.success(`Doctor ${currentStatus ? 'unverified' : 'verified'} successfully`);
      fetchDoctors();
    } catch (error) {
      console.error('Error verifying doctor:', error);
      toast.error('Failed to update doctor verification status');
    }
  };

  const viewDoctorDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  const getVerificationStatus = (isVerified) => {
    return isVerified ? 
      { label: 'Verified', color: 'bg-green-100 text-green-800', icon: Check } :
      { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: X };
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating || 0) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const specializations = [
    'Cardiology', 'Dermatology', 'Emergency Medicine', 'Family Medicine',
    'Internal Medicine', 'Neurology', 'Oncology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
          <p className="text-gray-600 mt-1">Manage and verify doctor profiles</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4 text-sm text-gray-600">
          <div>Total: {doctors.length}</div>
          <div>Verified: {doctors.filter(d => d.isVerified).length}</div>
          <div>Pending: {doctors.filter(d => !d.isVerified).length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verification
            </label>
            <select
              value={filters.isVerified}
              onChange={(e) => setFilters(prev => ({ ...prev, isVerified: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Doctors</option>
              <option value="true">Verified</option>
              <option value="false">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experience
            </label>
            <select
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Experience</option>
              <option value="0-5">0-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ specialization: '', search: '', status: '', isVerified: '' })}
              className="w-full text-blue-600 hover:text-blue-500 text-sm font-medium py-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Doctors List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : doctors.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {doctors.map((doctor) => {
              const verification = getVerificationStatus(doctor.isVerified);
              const VerificationIcon = verification.icon;
              
              return (
                <div key={doctor._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={doctor.userId?.avatar || 'https://via.placeholder.com/48'}
                        alt={doctor.userId?.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            Dr. {doctor.userId?.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${verification.color}`}>
                            <VerificationIcon className="w-3 h-3 mr-1" />
                            {verification.label}
                          </span>
                        </div>
                        
                        <p className="text-sm text-blue-600 font-medium">{doctor.specialization}</p>
                        
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center">
                            <GraduationCap className="h-3 w-3 mr-1" />
                            <span>{doctor.experience} years experience</span>
                          </div>
                          <div className="flex items-center">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            <span>License: {doctor.licenseNumber}</span>
                          </div>
                          {doctor.rating && (
                            <div className="flex items-center">
                              <div className="flex mr-1">
                                {renderStars(doctor.rating)}
                              </div>
                              <span>({doctor.totalRatings || 0})</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            <span>{doctor.userId?.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            <span>{doctor.userId?.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewDoctorDetails(doctor)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleVerifyDoctor(doctor._id, doctor.isVerified)}
                        className={`p-2 rounded text-sm font-medium ${
                          doctor.isVerified 
                            ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                        }`}
                        title={doctor.isVerified ? 'Unverify Doctor' : 'Verify Doctor'}
                      >
                        {doctor.isVerified ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No doctors match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Doctor Detail Modal */}
      {showDetailModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Doctor Profile</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Doctor Header */}
                <div className="flex items-center space-x-6">
                  <img
                    src={selectedDoctor.userId?.avatar || 'https://via.placeholder.com/100'}
                    alt={selectedDoctor.userId?.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900">
                      Dr. {selectedDoctor.userId?.name}
                    </h4>
                    <p className="text-lg text-blue-600 font-medium">{selectedDoctor.specialization}</p>
                    <p className="text-gray-600">{selectedDoctor.experience} years of experience</p>
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        selectedDoctor.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedDoctor.isVerified ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Pending Verification
                          </>
                        )}
                      </span>
                      
                      {selectedDoctor.rating && (
                        <div className="flex items-center space-x-1">
                          <div className="flex">
                            {renderStars(selectedDoctor.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({selectedDoctor.totalRatings || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact & License Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h5>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{selectedDoctor.userId?.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{selectedDoctor.userId?.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Professional Info</h5>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">License: {selectedDoctor.licenseNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">
                          Joined: {new Date(selectedDoctor.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consultation Fees */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Consultation Fees</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Physical Consultation</p>
                          <p className="text-lg font-semibold text-blue-600">
                            LKR {selectedDoctor.consultationFees?.physical || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Online Consultation</p>
                          <p className="text-lg font-semibold text-green-600">
                            LKR {selectedDoctor.consultationFees?.online || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedDoctor.bio && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Biography</h5>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {selectedDoctor.bio}
                    </p>
                  </div>
                )}

                {/* Qualifications */}
                {selectedDoctor.qualifications && selectedDoctor.qualifications.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Qualifications</h5>
                    <div className="space-y-3">
                      {selectedDoctor.qualifications.map((qual, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium text-gray-900">{qual.degree}</p>
                              <p className="text-sm text-gray-600">{qual.institution}</p>
                              <p className="text-xs text-gray-500">{qual.year}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => handleVerifyDoctor(selectedDoctor._id, selectedDoctor.isVerified)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedDoctor.isVerified 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedDoctor.isVerified ? 'Unverify Doctor' : 'Verify Doctor'}
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;