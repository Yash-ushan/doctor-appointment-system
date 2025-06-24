import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FileText,
  X,
  CheckCircle,
  XCircle,
  Eye,
  Phone
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    date: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: '',
    followUp: ''
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

      const response = await axios.get(`/api/appointments?${queryParams}`);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await axios.put(`/api/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment status');
    }
  };

  const handleAddPrescription = async () => {
    try {
      await axios.put(`/api/appointments/${selectedAppointment._id}/prescription`, prescriptionData);
      toast.success('Prescription added successfully');
      setShowPrescriptionModal(false);
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to add prescription');
    }
  };

  const addMedicine = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedicine = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const updateMedicine = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending_payment: 'bg-orange-100 text-orange-800 border-orange-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      'no-show': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canStartConsultation = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const timeDiff = Math.abs(appointmentDate.getTime() - now.getTime());
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return appointment.status === 'confirmed' && hoursDiff <= 1;
  };

  if (loading) {
    return <LoadingSpinner text="Loading appointments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">
            Manage your patient appointments and consultations
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name..."
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
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({ status: '', type: '', date: '', search: '' })}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {appointments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={appointment.patientId?.avatar || 'https://via.placeholder.com/48'}
                      alt={appointment.patientId?.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {appointment.patientId?.name}
                      </h3>
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
                          {appointment.consultationType === 'online' ? (
                            <Video className="h-4 w-4 mr-1 text-green-600" />
                          ) : (
                            <Building className="h-4 w-4 mr-1 text-blue-600" />
                          )}
                          <span className="capitalize">{appointment.consultationType}</span>
                        </div>
                      </div>
                      
                      {appointment.reason && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {/* View Details */}
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowDetailsModal(true);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>

                      {/* Phone Contact */}
                      <a
                        href={`tel:${appointment.patientId?.phone}`}
                        className="text-gray-400 hover:text-blue-600"
                        title="Call Patient"
                      >
                        <Phone className="h-5 w-5" />
                      </a>

                      {/* Action Buttons */}
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </button>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <>
                          {appointment.consultationType === 'online' && canStartConsultation(appointment) && (
                            <Link
                              to={`/chat/${appointment._id}`}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Start Chat
                            </Link>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowPrescriptionModal(true);
                            }}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Add Prescription
                          </button>
                        </>
                      )}

                      {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                          className="text-red-400 hover:text-red-600"
                          title="Cancel Appointment"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
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
              No appointments match your current filters.
            </p>
          </div>
        )}
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Add Prescription</h3>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{selectedAppointment.patientId?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 font-medium">
                      {selectedAppointment.patientId?.dateOfBirth 
                        ? Math.floor((new Date() - new Date(selectedAppointment.patientId.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                        : 'N/A'} years
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-2 font-medium capitalize">
                      {selectedAppointment.patientId?.gender || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 font-medium">{selectedAppointment.patientId?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis *
                </label>
                <textarea
                  value={prescriptionData.diagnosis}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter diagnosis..."
                  required
                />
              </div>

              {/* Medicines */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Medicines
                  </label>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    + Add Medicine
                  </button>
                </div>
                
                <div className="space-y-4">
                  {prescriptionData.medicines.map((medicine, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Medicine Name *</label>
                          <input
                            type="text"
                            placeholder="Medicine name"
                            value={medicine.name}
                            onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Dosage</label>
                          <input
                            type="text"
                            placeholder="e.g., 500mg"
                            value={medicine.dosage}
                            onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                          <input
                            type="text"
                            placeholder="e.g., Twice daily"
                            value={medicine.frequency}
                            onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Duration</label>
                          <input
                            type="text"
                            placeholder="e.g., 7 days"
                            value={medicine.duration}
                            onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Special instructions (e.g., Take with food)"
                          value={medicine.instructions}
                          onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {prescriptionData.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicine(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={prescriptionData.notes}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or recommendations..."
                />
              </div>

              {/* Follow-up */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Date (Optional)
                </label>
                <input
                  type="date"
                  value={prescriptionData.followUp}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUp: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrescription}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Save Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Appointment Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Patient Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={selectedAppointment.patientId?.avatar || 'https://via.placeholder.com/64'}
                        alt={selectedAppointment.patientId?.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="text-lg font-medium">{selectedAppointment.patientId?.name}</h5>
                        <p className="text-sm text-gray-600">{selectedAppointment.patientId?.email}</p>
                        <p className="text-sm text-gray-600">{selectedAppointment.patientId?.phone}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <span className="ml-2 font-medium">
                          {selectedAppointment.patientId?.dateOfBirth 
                            ? Math.floor((new Date() - new Date(selectedAppointment.patientId.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                            : 'N/A'} years
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <span className="ml-2 font-medium capitalize">
                          {selectedAppointment.patientId?.gender || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Appointment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">
                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
                      </p>
                      <p className="font-medium">{selectedAppointment.appointmentTime}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Consultation Type</p>
                      <p className="font-medium capitalize">{selectedAppointment.consultationType}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                        {selectedAppointment.status}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="font-medium">LKR {selectedAppointment.consultationFee}</p>
                    </div>
                  </div>
                </div>

                {/* Reason & Symptoms */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-2">Reason for Visit</p>
                      <p className="text-sm">{selectedAppointment.reason}</p>
                    </div>
                    
                    {selectedAppointment.symptoms && selectedAppointment.symptoms.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-2">Symptoms</p>
                        <div className="flex flex-wrap gap-2">
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

                {/* Hospital Information (for physical appointments) */}
                {selectedAppointment.hospitalId && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Hospital Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium">{selectedAppointment.hospitalId.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment.hospitalId.address?.street}, {selectedAppointment.hospitalId.address?.city}
                      </p>
                      <p className="text-sm text-gray-600">{selectedAppointment.hospitalId.contact?.phone}</p>
                    </div>
                  </div>
                )}

                {/* Prescription (if exists) */}
                {selectedAppointment.prescription && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Prescription</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Diagnosis</p>
                        <p className="text-sm">{selectedAppointment.prescription.diagnosis}</p>
                      </div>
                      
                      {selectedAppointment.prescription.medicines && selectedAppointment.prescription.medicines.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Medicines</p>
                          <div className="space-y-2">
                            {selectedAppointment.prescription.medicines.map((medicine, index) => (
                              <div key={index} className="bg-white rounded p-3 text-sm">
                                <p className="font-medium">{medicine.name}</p>
                                <p className="text-gray-600">
                                  {medicine.dosage} - {medicine.frequency} - {medicine.duration}
                                </p>
                                {medicine.instructions && (
                                  <p className="text-gray-500 text-xs">Instructions: {medicine.instructions}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedAppointment.prescription.notes && (
                        <div>
                          <p className="text-sm text-gray-500">Additional Notes</p>
                          <p className="text-sm">{selectedAppointment.prescription.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;