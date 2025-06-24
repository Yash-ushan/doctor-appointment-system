import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Building,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  Wifi,
  Car,
  Activity
} from 'lucide-react';

const AdminHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    city: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Sri Lanka'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    facilities: [],
    operatingHours: {
      weekdays: { open: '06:00', close: '22:00' },
      weekends: { open: '08:00', close: '20:00' },
      is24x7: false
    }
  });

  const facilityOptions = [
    { id: 'emergency', label: 'Emergency', icon: Activity },
    { id: 'icu', label: 'ICU', icon: Shield },
    { id: 'operation_theater', label: 'Operation Theater', icon: Activity },
    { id: 'xray', label: 'X-Ray', icon: Activity },
    { id: 'mri', label: 'MRI', icon: Activity },
    { id: 'ct_scan', label: 'CT Scan', icon: Activity },
    { id: 'laboratory', label: 'Laboratory', icon: Activity },
    { id: 'pharmacy', label: 'Pharmacy', icon: Activity },
    { id: 'blood_bank', label: 'Blood Bank', icon: Activity },
    { id: 'ambulance', label: 'Ambulance', icon: Activity },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi }
  ];

  useEffect(() => {
    fetchHospitals();
  }, [filters]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`/api/hospitals?${queryParams}`);
      setHospitals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      // Set empty array as fallback and don't show error toast
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/hospitals', formData);
      toast.success('Hospital created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchHospitals();
    } catch (error) {
      console.error('Error creating hospital:', error);
      toast.error('Failed to create hospital');
    }
  };

  const handleUpdateHospital = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/hospitals/${selectedHospital._id}`, formData);
      toast.success('Hospital updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchHospitals();
    } catch (error) {
      console.error('Error updating hospital:', error);
      toast.error('Failed to update hospital');
    }
  };

  const handleDeleteHospital = async (hospitalId) => {
    if (window.confirm('Are you sure you want to delete this hospital?')) {
      try {
        await axios.delete(`/api/admin/hospitals/${hospitalId}`);
        toast.success('Hospital deleted successfully');
        fetchHospitals();
      } catch (error) {
        console.error('Error deleting hospital:', error);
        toast.error('Failed to delete hospital');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Sri Lanka'
      },
      contact: {
        phone: '',
        email: '',
        website: ''
      },
      facilities: [],
      operatingHours: {
        weekdays: { open: '06:00', close: '22:00' },
        weekends: { open: '08:00', close: '20:00' },
        is24x7: false
      }
    });
    setSelectedHospital(null);
  };

  const openEditModal = (hospital) => {
    setSelectedHospital(hospital);
    setFormData(hospital);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFacilityChange = (facilityId) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facilityId)
        ? prev.facilities.filter(f => f !== facilityId)
        : [...prev.facilities, facilityId]
    }));
  };

  const getFacilityIcon = (facilityId) => {
    const facility = facilityOptions.find(f => f.id === facilityId);
    return facility ? facility.icon : Activity;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hospital Management</h1>
          <p className="text-gray-600 mt-1">Manage hospital information and facilities</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by hospital name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="Filter by city..."
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', city: '' })}
              className="w-full text-blue-600 hover:text-blue-500 text-sm font-medium py-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Hospitals List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : hospitals.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {hospitals.map((hospital) => (
              <div key={hospital._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{hospital.name}</h3>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{hospital.address.city}, {hospital.address.state}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{hospital.contact.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span>{hospital.contact.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        {hospital.facilities.slice(0, 5).map((facilityId) => {
                          const facility = facilityOptions.find(f => f.id === facilityId);
                          const FacilityIcon = getFacilityIcon(facilityId);
                          return (
                            <span
                              key={facilityId}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              <FacilityIcon className="w-3 h-3 mr-1" />
                              {facility?.label || facilityId}
                            </span>
                          );
                        })}
                        {hospital.facilities.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{hospital.facilities.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(hospital)}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded"
                      title="Edit Hospital"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteHospital(hospital._id)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                      title="Delete Hospital"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hospitals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first hospital.
            </p>
          </div>
        )}
      </div>

      {/* Create Hospital Modal */}
      {showCreateModal && (
        <HospitalModal
          title="Add New Hospital"
          formData={formData}
          facilityOptions={facilityOptions}
          onSubmit={handleCreateHospital}
          onClose={() => { setShowCreateModal(false); resetForm(); }}
          onInputChange={handleInputChange}
          onFacilityChange={handleFacilityChange}
        />
      )}

      {/* Edit Hospital Modal */}
      {showEditModal && selectedHospital && (
        <HospitalModal
          title="Edit Hospital"
          formData={formData}
          facilityOptions={facilityOptions}
          onSubmit={handleUpdateHospital}
          onClose={() => { setShowEditModal(false); resetForm(); }}
          onInputChange={handleInputChange}
          onFacilityChange={handleFacilityChange}
        />
      )}
    </div>
  );
};

// Hospital Modal Component
const HospitalModal = ({ 
  title, 
  formData, 
  facilityOptions, 
  onSubmit, 
  onClose, 
  onInputChange, 
  onFacilityChange 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <form onSubmit={onSubmit} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Hospital Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Address */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  required
                  value={formData.address.street}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="address.city"
                  required
                  value={formData.address.city}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="address.state"
                  required
                  value={formData.address.state}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  required
                  value={formData.address.zipCode}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="contact.phone"
                  required
                  value={formData.contact.phone}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="contact.email"
                  required
                  value={formData.contact.email}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
              <div className="grid grid-cols-3 gap-2">
                {facilityOptions.map((facility) => {
                  const FacilityIcon = facility.icon;
                  return (
                    <label key={facility.id} className="flex items-center p-2 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.facilities.includes(facility.id)}
                        onChange={() => onFacilityChange(facility.id)}
                        className="mr-2"
                      />
                      <FacilityIcon className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm">{facility.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 24/7 Operation */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="operatingHours.is24x7"
                  checked={formData.operatingHours.is24x7}
                  onChange={onInputChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium">24/7 Operation</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {title.includes('Edit') ? 'Update Hospital' : 'Create Hospital'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminHospitals;