import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Save, 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Globe,
  X,
  CheckCircle
} from 'lucide-react';

const DoctorSchedule = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [myHospitals, setMyHospitals] = useState([]);
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // General availability (for online consultations)
  const [generalAvailability, setGeneralAvailability] = useState([
    { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: false },
    { day: 'Sunday', startTime: '09:00', endTime: '13:00', isAvailable: false }
  ]);

  // Hospital schedule form data
  const [scheduleData, setScheduleData] = useState({
    hospitalId: '',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: false },
      { day: 'Sunday', startTime: '09:00', endTime: '13:00', isAvailable: false }
    ],
    consultationFee: '',
    slotDuration: 30,
    maxPatientsPerSlot: 1
  });

  const tabs = [
    { id: 'general', label: 'General Availability', icon: Globe },
    { id: 'hospitals', label: 'Hospital Schedules', icon: Building },
    { id: 'holidays', label: 'Holidays & Leaves', icon: Calendar }
  ];

  useEffect(() => {
    fetchHospitals();
    fetchMyHospitalSchedules();
    fetchGeneralAvailability();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await axios.get('/api/hospitals');
      setHospitals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      // Set empty array as fallback
      setHospitals([]);
    }
  };

  const fetchMyHospitalSchedules = async () => {
    try {
      const response = await axios.get('/api/doctors/hospital-schedules');
      setMyHospitals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hospital schedules:', error);
      // Set empty array as fallback
      setMyHospitals([]);
    }
  };

  const fetchGeneralAvailability = async () => {
    try {
      const response = await axios.get('/api/doctors/availability');
      if (response.data.data?.availability) {
        setGeneralAvailability(response.data.data.availability);
      }
    } catch (error) {
      console.error('Error fetching general availability:', error);
      // Keep default availability settings
    }
  };

  const handleGeneralAvailabilityChange = (index, field, value) => {
    setGeneralAvailability(prev => 
      prev.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const handleScheduleChange = (index, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      schedule: prev.schedule.map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const handleSaveGeneralSchedule = async () => {
    setLoading(true);
    try {
      await axios.put('/api/doctors/availability', { 
        availability: generalAvailability 
      });
      toast.success('General availability updated successfully');
    } catch (error) {
      console.error('Error updating general availability:', error);
      toast.error('Failed to update general availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHospitalSchedule = async () => {
    if (!scheduleData.hospitalId) {
      toast.error('Please select a hospital');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/doctors/hospital-schedules', scheduleData);
      toast.success('Hospital schedule added successfully');
      setShowAddHospitalModal(false);
      resetScheduleData();
      fetchMyHospitalSchedules();
    } catch (error) {
      console.error('Error adding hospital schedule:', error);
      toast.error('Failed to add hospital schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHospitalSchedule = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/doctors/hospital-schedules/${selectedHospital._id}`, scheduleData);
      toast.success('Hospital schedule updated successfully');
      setShowEditScheduleModal(false);
      setSelectedHospital(null);
      resetScheduleData();
      fetchMyHospitalSchedules();
    } catch (error) {
      console.error('Error updating hospital schedule:', error);
      toast.error('Failed to update hospital schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHospitalSchedule = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this hospital schedule?')) {
      try {
        await axios.delete(`/api/doctors/hospital-schedules/${scheduleId}`);
        toast.success('Hospital schedule deleted successfully');
        fetchMyHospitalSchedules();
      } catch (error) {
        console.error('Error deleting hospital schedule:', error);
        toast.error('Failed to delete hospital schedule');
      }
    }
  };

  const openEditModal = (hospitalSchedule) => {
    setSelectedHospital(hospitalSchedule);
    setScheduleData({
      hospitalId: hospitalSchedule.hospitalId._id,
      schedule: hospitalSchedule.schedule,
      consultationFee: hospitalSchedule.consultationFee,
      slotDuration: hospitalSchedule.slotDuration || 30,
      maxPatientsPerSlot: hospitalSchedule.maxPatientsPerSlot || 1
    });
    setShowEditScheduleModal(true);
  };

  const resetScheduleData = () => {
    setScheduleData({
      hospitalId: '',
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00', isAvailable: false },
        { day: 'Sunday', startTime: '09:00', endTime: '13:00', isAvailable: false }
      ],
      consultationFee: '',
      slotDuration: 30,
      maxPatientsPerSlot: 1
    });
  };

  const getAvailableHospitals = () => {
    const assignedHospitalIds = myHospitals.map(mh => mh.hospitalId._id);
    return hospitals.filter(h => !assignedHospitalIds.includes(h._id));
  };

  const renderGeneralAvailability = () => (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Online Consultation Availability</h3>
            <p className="text-sm text-gray-600">Set your general availability for online consultations</p>
          </div>
          <Globe className="h-8 w-8 text-blue-600" />
        </div>
        
        <div className="space-y-4">
          {generalAvailability.map((slot, index) => (
            <div key={slot.day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-24">
                <span className="font-medium text-gray-900">{slot.day}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={slot.isAvailable}
                  onChange={(e) => handleGeneralAvailabilityChange(index, 'isAvailable', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Available</span>
              </div>
              
              {slot.isAvailable && (
                <>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">From:</label>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleGeneralAvailabilityChange(index, 'startTime', e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">To:</label>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleGeneralAvailabilityChange(index, 'endTime', e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSaveGeneralSchedule}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save General Schedule'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderHospitalSchedules = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Hospital Schedules</h3>
          <p className="text-sm text-gray-600">Manage your schedules at different hospitals</p>
        </div>
        <button
          onClick={() => setShowAddHospitalModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hospital Schedule
        </button>
      </div>

      {/* Hospital Schedules List */}
      <div className="grid grid-cols-1 gap-6">
        {myHospitals.length > 0 ? (
          myHospitals.map((hospitalSchedule) => (
            <div key={hospitalSchedule._id} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {hospitalSchedule.hospitalId.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{hospitalSchedule.hospitalId.address.city}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Fee: LKR {hospitalSchedule.consultationFee}
                  </span>
                  <button
                    onClick={() => openEditModal(hospitalSchedule)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteHospitalSchedule(hospitalSchedule._id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {hospitalSchedule.schedule.filter(slot => slot.isAvailable).map((slot) => (
                  <div key={slot.day} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">{slot.day}</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hospital schedules</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first hospital schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderHolidaysTab = () => (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <Calendar className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Holiday Management</h3>
      <p className="mt-1 text-sm text-gray-500">
        Holiday and leave management coming soon...
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
        <p className="text-gray-600 mt-1">Manage your availability and hospital schedules</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'general' && renderGeneralAvailability()}
        {activeTab === 'hospitals' && renderHospitalSchedules()}
        {activeTab === 'holidays' && renderHolidaysTab()}
      </div>

      {/* Add Hospital Schedule Modal */}
      {showAddHospitalModal && (
        <HospitalScheduleModal
          title="Add Hospital Schedule"
          hospitals={getAvailableHospitals()}
          scheduleData={scheduleData}
          setScheduleData={setScheduleData}
          onSubmit={handleAddHospitalSchedule}
          onClose={() => {
            setShowAddHospitalModal(false);
            resetScheduleData();
          }}
          onScheduleChange={handleScheduleChange}
          loading={loading}
        />
      )}

      {/* Edit Hospital Schedule Modal */}
      {showEditScheduleModal && selectedHospital && (
        <HospitalScheduleModal
          title="Edit Hospital Schedule"
          hospitals={[selectedHospital.hospitalId]}
          scheduleData={scheduleData}
          setScheduleData={setScheduleData}
          onSubmit={handleUpdateHospitalSchedule}
          onClose={() => {
            setShowEditScheduleModal(false);
            setSelectedHospital(null);
            resetScheduleData();
          }}
          onScheduleChange={handleScheduleChange}
          loading={loading}
          isEdit={true}
        />
      )}
    </div>
  );
};

// Hospital Schedule Modal Component
const HospitalScheduleModal = ({ 
  title, 
  hospitals, 
  scheduleData, 
  setScheduleData, 
  onSubmit, 
  onClose, 
  onScheduleChange, 
  loading,
  isEdit = false
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Hospital Selection */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Hospital
                </label>
                <select
                  value={scheduleData.hospitalId}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, hospitalId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a hospital...</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name} - {hospital.address.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Schedule Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee (LKR)
                </label>
                <input
                  type="number"
                  value={scheduleData.consultationFee}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, consultationFee: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slot Duration (minutes)
                </label>
                <select
                  value={scheduleData.slotDuration}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, slotDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Patients per Slot
                </label>
                <input
                  type="number"
                  value={scheduleData.maxPatientsPerSlot}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, maxPatientsPerSlot: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10"
                />
              </div>
            </div>

            {/* Weekly Schedule */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Weekly Schedule</h4>
              <div className="space-y-4">
                {scheduleData.schedule.map((slot, index) => (
                  <div key={slot.day} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-24">
                      <span className="font-medium text-gray-900">{slot.day}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={slot.isAvailable}
                        onChange={(e) => onScheduleChange(index, 'isAvailable', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Available</span>
                    </div>
                    
                    {slot.isAvailable && (
                      <>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">From:</label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => onScheduleChange(index, 'startTime', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-600">To:</label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => onScheduleChange(index, 'endTime', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={loading || !scheduleData.hospitalId || !scheduleData.consultationFee}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Schedule' : 'Add Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;