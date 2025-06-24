import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Calendar,
  Search,
  Filter,
  Eye,
  Clock,
  User,
  Building,
  Video,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  DollarSign,
  X
} from 'lucide-react';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    date: '',
    search: ''
  });

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

      const response = await axios.get(`/api/admin/appointments?${queryParams}`);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Set empty array as fallback and don't show error toast
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await axios.put(`/api/admin/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending_payment: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      'no-show': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      case 'confirmed':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'online' ? Video : Building;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all system appointments</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4 text-sm text-gray-600">
          <div>Total: {appointments.length}</div>
          <div>Today: {appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length}</div>
          <div>Pending: {appointments.filter(a => a.status === 'scheduled').length}</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR {appointments
                  .filter(a => a.status === 'completed')
                  .reduce((total, a) => total + (a.consultationFee || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
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
                placeholder="Search by patient or doctor..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="online">Online</option>
              <option value="physical">Physical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', type: '', date: '', search: '' })}
              className="w-full text-blue-600 hover:text-blue-500 text-sm font-medium py-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : appointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => {
              const StatusIcon = getStatusIcon(appointment.status);
              const TypeIcon = getTypeIcon(appointment.consultationType);
              
              return (
                <div key={appointment._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={appointment.patientId?.avatar || 'https://via.placeholder.com/48'}
                          alt={appointment.patientId?.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {appointment.patientId?.name}
                          </h3>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm text-blue-600 font-medium">
                            Dr. {appointment.doctorId?.userId?.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                          <div className="flex items-center">
                            <TypeIcon className="h-4 w-4 mr-1" />
                            <span className="capitalize">{appointment.consultationType}</span>
                          </div>
                          {appointment.consultationFee && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>LKR {appointment.consultationFee}</span>
                            </div>
                          )}
                        </div>
                        
                        {appointment.reason && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Reason:</span> {appointment.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {appointment.status}
                      </span>
                      
                      <button
                        onClick={() => viewAppointmentDetails(appointment)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No appointments match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Appointment Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Appointment Overview */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Patient Information</h4>
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedAppointment.patientId?.avatar || 'https://via.placeholder.com/48'}
                          alt={selectedAppointment.patientId?.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{selectedAppointment.patientId?.name}</p>
                          <p className="text-sm text-gray-600">{selectedAppointment.patientId?.email}</p>
                          <p className="text-sm text-gray-600">{selectedAppointment.patientId?.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Doctor Information</h4>
                      <div className="flex items-center space-x-3">
                        <img
                          src={selectedAppointment.doctorId?.userId?.avatar || 'https://via.placeholder.com/48'}
                          alt={selectedAppointment.doctorId?.userId?.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Dr. {selectedAppointment.doctorId?.userId?.name}</p>
                          <p className="text-sm text-blue-600">{selectedAppointment.doctorId?.specialization}</p>
                          <p className="text-sm text-gray-600">{selectedAppointment.doctorId?.userId?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Appointment Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date & Time:</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedAppointment.appointmentDate).toLocaleDateString()} at {selectedAppointment.appointmentTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium capitalize">{selectedAppointment.consultationType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                          {selectedAppointment.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fee:</span>
                        <span className="text-sm font-medium">
                          LKR {selectedAppointment.consultationFee || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Medical Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Reason for Visit:</span>
                        <p className="text-sm font-medium mt-1">{selectedAppointment.reason || 'Not specified'}</p>
                      </div>
                      {selectedAppointment.symptoms && selectedAppointment.symptoms.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600">Symptoms:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedAppointment.symptoms.map((symptom, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hospital Information */}
                {selectedAppointment.hospitalId && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Hospital Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedAppointment.hospitalId.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.hospitalId.address?.street}, {selectedAppointment.hospitalId.address?.city}
                      </p>
                      <p className="text-sm text-gray-600">{selectedAppointment.hospitalId.contact?.phone}</p>
                    </div>
                  </div>
                )}

                {/* Prescription */}
                {selectedAppointment.prescription && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Prescription</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Diagnosis:</span>
                        <p className="text-sm font-medium">{selectedAppointment.prescription.diagnosis}</p>
                      </div>
                      
                      {selectedAppointment.prescription.medicines && selectedAppointment.prescription.medicines.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600">Medicines:</span>
                          <div className="mt-1 space-y-2">
                            {selectedAppointment.prescription.medicines.map((medicine, index) => (
                              <div key={index} className="bg-white p-3 rounded border">
                                <p className="font-medium text-sm">{medicine.name}</p>
                                <p className="text-xs text-gray-600">
                                  {medicine.dosage} - {medicine.frequency} - {medicine.duration}
                                </p>
                                {medicine.instructions && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Instructions: {medicine.instructions}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedAppointment.prescription.notes && (
                        <div>
                          <span className="text-sm text-gray-600">Notes:</span>
                          <p className="text-sm font-medium">{selectedAppointment.prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                {selectedAppointment.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment._id, 'confirmed');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment._id, 'cancelled');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </>
                )}
                
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

export default AdminAppointments;