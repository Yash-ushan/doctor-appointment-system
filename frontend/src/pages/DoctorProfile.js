import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatLKR } from '../utils/currency';
import axios from 'axios';
import { 
  Star, 
  Clock, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail,
  Award,
  Building,
  Video,
  User
} from 'lucide-react';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await axios.get(`/api/doctors/${id}`);
        setDoctor(response.data.data);
      } catch (error) {
        console.error('Error fetching doctor:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Doctor not found</h2>
        <Link to="/doctors" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
          Back to Doctors
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'availability', label: 'Availability' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'hospitals', label: 'Hospitals' }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Doctor Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Doctor Image */}
          <div className="flex-shrink-0">
            <img
              src={doctor.userId?.avatar || 'https://via.placeholder.com/150'}
              alt={doctor.userId?.name}
              className="w-32 h-32 rounded-full object-cover mx-auto lg:mx-0"
            />
          </div>

          {/* Doctor Info */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-gray-900">
              Dr. {doctor.userId?.name}
            </h1>
            <p className="text-xl text-blue-600 font-medium mt-1">
              {doctor.specialization}
            </p>
            <p className="text-gray-600 mt-1">
              {doctor.experience} years of experience
            </p>

            {/* Rating */}
            <div className="flex items-center justify-center lg:justify-start mt-3">
              <div className="flex items-center space-x-1">
                {renderStars(doctor.rating)}
              </div>
              <span className="text-gray-600 ml-2">
                {doctor.rating?.toFixed(1) || '0.0'} ({doctor.totalRatings || 0} reviews)
              </span>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>Licensed: {doctor.licenseNumber}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Available Today</span>
              </div>
              {doctor.isVerified && (
                <div className="flex items-center text-green-600">
                  <Award className="h-4 w-4 mr-1" />
                  <span>Verified</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {doctor.bio && (
              <p className="text-gray-700 mt-4 max-w-2xl">
                {doctor.bio}
              </p>
            )}
          </div>

          {/* Booking Card */}
          <div className="w-full lg:w-80">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Book Consultation
              </h3>

              {/* Consultation Types */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Online Consultation</p>
                      <p className="text-sm text-gray-600">Video call</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatLKR(doctor.consultationFees?.online || 1500)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Physical Consultation</p>
                      <p className="text-sm text-gray-600">In-person visit</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatLKR(doctor.consultationFees?.physical || 2000)}</p>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              {user?.role === 'patient' ? (
                <Link
                  to={`/book-appointment/${doctor._id}`}
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Book Appointment
                </Link>
              ) : (
                <div className="text-center text-gray-600 text-sm">
                  {user ? 'Only patients can book appointments' : 'Please login to book appointment'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Qualifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Qualifications
                </h3>
                {doctor.qualifications && doctor.qualifications.length > 0 ? (
                  <div className="space-y-3">
                    {doctor.qualifications.map((qual, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Award className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{qual.degree}</p>
                          <p className="text-sm text-gray-600">
                            {qual.institution} ({qual.year})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No qualifications listed</p>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span>{doctor.userId?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span>{doctor.userId?.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Weekly Schedule
              </h3>
              <div className="space-y-3">
                {doctor.availability?.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="font-medium">{slot.day}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {slot.isAvailable ? (
                        <>
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </>
                      ) : (
                        <span className="text-red-600">Not Available</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Patient Reviews
              </h3>
              {doctor.reviews && doctor.reviews.length > 0 ? (
                <div className="space-y-4">
                  {doctor.reviews.map((review, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-medium">Anonymous Patient</p>
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(review.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet</p>
              )}
            </div>
          )}

          {/* Hospitals Tab */}
          {activeTab === 'hospitals' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Associated Hospitals
              </h3>
              {doctor.hospitals && doctor.hospitals.length > 0 ? (
                <div className="space-y-4">
                  {doctor.hospitals.map((hospital) => (
                    <div key={hospital._id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Building className="h-6 w-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {hospital.name}
                          </h4>
                          <div className="flex items-center text-gray-600 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {hospital.address?.street}, {hospital.address?.city}
                            </span>
                          </div>
                          {hospital.contact?.phone && (
                            <div className="flex items-center text-gray-600 mt-1">
                              <Phone className="h-4 w-4 mr-1" />
                              <span className="text-sm">{hospital.contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No hospital information available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;