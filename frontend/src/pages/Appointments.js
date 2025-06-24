import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Video, 
  Building, 
  User,
  Filter,
  Search,
  MessageCircle,
  Star,
  FileText,
  X
} from 'lucide-react';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`/api/appointments?${queryParams}`);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus, cancellationReason = '') => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/status`, {
        status: newStatus,
        cancellationReason
      });
      
      toast.success(`Appointment ${newStatus} successfully`);
      fetchAppointments();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update appointment';
      toast.error(message);
    }
  };

  const handleAddReview = async () => {
    if (!selectedAppointment) return;

    try {
      await axios.post(`/api/doctors/${selectedAppointment.doctorId._id}/reviews`, {
        rating,
        comment: reviewComment
      });
      
      toast.success('Review added successfully');
      setShowRatingModal(false);
      setSelectedAppointment(null);
      setRating(5);
      setReviewComment('');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add review';
      toast.error(message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canCancelAppointment = (appointment) => {
    const appointmentDateTime = new Date(`${appointment.appointmentDate.split('T')[0]}T${appointment.appointmentTime}`);
    const now = new Date();
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 3600);
    
    return hoursDifference > 2 && appointment.status === 'scheduled';
  };

  const canRateDoctor = (appointment) => {
    return appointment.status === 'completed' && user?.role === 'patient';
  };

  const canStartChat = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const today = new Date();
    
    return appointment.consultationType === 'online' && 
           appointment.status === 'confirmed' &&
           appointmentDate.toDateString() === today.toDateString();
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">
            Manage your appointments and consultations
          </p>
        </div>
        
        {user?.role === 'patient' && (
          <Link
            to="/doctors"
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Book New Appointment
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
          >
            <Filter size={18} />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="online">Online</option>
                <option value="physical">Physical</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', type: '' })}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {appointments.length > 0 ? (
          <div className="divide-y">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Doctor/Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <img
                        src={
                          user?.role === 'patient'
                            ? appointment.doctorId?.userId?.avatar
                            : appointment.patientId?.avatar
                        }
                        alt={
                          user?.role === 'patient'
                            ? appointment.doctorId?.userId?.name
                            : appointment.patientId?.name
                        }
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user?.role === 'patient' ? (
                            <>Dr. {appointment.doctorId?.userId?.name}</>
                          ) : (
                            appointment.patientId?.name
                          )}
                        </h3>
                        
                        {user?.role === 'patient' && (
                          <p className="text-blue-600 font-medium">
                            {appointment.doctorId?.specialization}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                          <div className="flex items-center">
                            {appointment.consultationType === 'online' ? (
                              <Video className="h-4 w-4 mr-1 text-green-600" />
                            ) : (
                              <Building className="h-4 w-4 mr-1 text-blue-600" />
                            )}
                            <span className="capitalize">{appointment.consultationType}</span>
                          </div>
                        </div>

                        {appointment.reason && (
                          <p className="text-gray-700 mt-2 text-sm">
                            <span className="font-medium">Reason:</span> {appointment.reason}
                          </p>
                        )}

                        {appointment.hospitalId && (
                          <p className="text-gray-600 mt-1 text-sm">
                            <span className="font-medium">Hospital:</span> {appointment.hospitalId.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="lg:w-80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <span className="text-lg font-bold">
                        ₹{appointment.consultationFee}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {canStartChat(appointment) && (
                        <Link
                          to={`/chat/${appointment._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center space-x-1"
                        >
                          <MessageCircle size={16} />
                          <span>Start Chat</span>
                        </Link>
                      )}

                      {canCancelAppointment(appointment) && (
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a reason for cancellation:');
                            if (reason) {
                              handleStatusUpdate(appointment._id, 'cancelled', reason);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 text-sm"
                        >
                          Cancel
                        </button>
                      )}

                      {canRateDoctor(appointment) && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowRatingModal(true);
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center space-x-1"
                        >
                          <Star size={16} />
                          <span>Rate Doctor</span>
                        </button>
                      )}

                      {appointment.prescription && (
                        <Link
                          to={`/appointments/${appointment._id}`}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center space-x-1"
                        >
                          <FileText size={16} />
                          <span>View Prescription</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'patient' 
                ? 'Book your first appointment with a doctor'
                : 'No appointments scheduled yet'
              }
            </p>
            {user?.role === 'patient' && (
              <div className="mt-6">
                <Link to="/doctors" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200">
                  Find Doctors
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Rate Dr. {selectedAppointment.doctorId?.userId?.name}</h3>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedAppointment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddReview}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Submit Review
                </button>
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;