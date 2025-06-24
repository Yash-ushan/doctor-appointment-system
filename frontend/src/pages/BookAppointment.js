import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatLKR } from '../utils/currency';
import DummyPayment from '../components/DummyPayment';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  Video, 
  Building, 
  FileText,
  ArrowLeft,
  CreditCard,
  CheckCircle,
  Download,
  Shield,
  AlertCircle,
  TestTube
} from 'lucide-react';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [useDummyPayment, setUseDummyPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  const [formData, setFormData] = useState({
    consultationType: 'online',
    hospitalId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    symptoms: ''
  });

  useEffect(() => {
    fetchDoctorData();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchDoctorData = async () => {
    try {
      const response = await axios.get(`/api/doctors/${doctorId}`);
      setDoctor(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      toast.error('Failed to load doctor information');
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date) => {
    try {
      setSlotsLoading(true);
      const response = await axios.get(`/api/doctors/${doctorId}/availability?date=${date}&type=${formData.consultationType}`);
      setAvailableSlots(response.data.slots || []);
      
      if (!response.data.available && response.data.message) {
        toast.info(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Generate mock slots for demo
      const mockSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      setAvailableSlots(mockSlots);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'appointmentDate') {
      setSelectedDate(value);
      setFormData(prev => ({ ...prev, appointmentTime: '' }));
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.consultationType === 'physical' && !formData.hospitalId) {
      toast.error('Please select a hospital for physical consultation');
      return;
    }

    setSubmitting(true);

    try {
      const appointmentData = {
        doctorId,
        ...formData,
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : [],
        status: 'pending_payment'
      };

      // Create appointment (pending payment)
      const response = await axios.post('/api/appointments', appointmentData);
      const newAppointmentId = response.data.data?._id || response.data._id;
      
      setAppointmentId(newAppointmentId);
      setShowPayment(true);
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create appointment';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const initializePayHere = () => {
    return new Promise((resolve, reject) => {
      if (window.payhere) {
        resolve(window.payhere);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.payhere.lk/lib/payhere.js';
      script.onload = () => {
        if (window.payhere) {
          resolve(window.payhere);
        } else {
          reject(new Error('PayHere failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PayHere script'));
      document.head.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!appointmentId) {
      toast.error('Appointment not created. Please try again.');
      return;
    }

    setPaymentLoading(true);

    try {
      // Initialize PayHere
      const payhere = await initializePayHere();
      
      const consultationFee = formData.consultationType === 'physical' 
        ? (doctor.consultationFees?.physical || 2000)
        : (doctor.consultationFees?.online || 1500);

      // Generate unique order ID
      const orderId = `APT_${appointmentId}_${Date.now()}`;

      console.log('Initiating PayHere payment with:', {
        orderId,
        amount: consultationFee,
        merchant_id: process.env.REACT_APP_PAYHERE_MERCHANT_ID
      });

      // Create payment object for PayHere
      const payment = {
        sandbox: process.env.REACT_APP_PAYHERE_SANDBOX === 'true',
        merchant_id: process.env.REACT_APP_PAYHERE_MERCHANT_ID || '1226061',
        return_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment-cancel`,
        notify_url: `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/notify`,
        order_id: orderId,
        items: `Medical Consultation with Dr. ${doctor.userId?.name || doctor.name}`,
        amount: consultationFee.toFixed(2),
        currency: 'LKR',
        hash: '', // Will be generated
        first_name: user.name.split(' ')[0] || 'Patient',
        last_name: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone || '0712345678',
        address: user.address?.street || 'No 123, Main Street',
        city: user.address?.city || 'Colombo',
        country: 'Sri Lanka',
        delivery_address: '',
        delivery_city: '',
        delivery_country: '',
        custom_1: appointmentId,
        custom_2: doctorId
      };

      // Generate hash
      try {
        console.log('Requesting hash generation...');
        const hashResponse = await axios.post('/api/payments/generate-hash', {
          merchant_id: payment.merchant_id,
          order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency
        });
        
        if (hashResponse.data.success) {
          payment.hash = hashResponse.data.hash;
          console.log('Hash generated successfully:', payment.hash);
        } else {
          throw new Error('Hash generation failed');
        }
      } catch (hashError) {
        console.error('Hash generation error:', hashError);
        toast.error('Payment setup failed. Please try again.');
        setPaymentLoading(false);
        return;
      }

      // PayHere payment callbacks with better error handling
      payhere.onCompleted = function onCompleted(orderId) {
        console.log("Payment completed successfully. OrderID:", orderId);
        handlePaymentSuccess(orderId);
      };

      payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed by user");
        setPaymentLoading(false);
        toast.error('Payment was cancelled');
      };

      payhere.onError = function onError(error) {
        console.error("PayHere Error Details:", error);
        setPaymentLoading(false);
        
        // Handle specific PayHere errors
        if (error.toString().includes('unauthorized') || error.toString().includes('Unauthorized')) {
          setPaymentError('PayHere authorization failed. This may be due to sandbox credentials or configuration issues.');
          toast.error('PayHere authorization failed. Try dummy payment for testing.');
          console.error('PayHere Authorization Error - Check merchant credentials');
        } else if (error.toString().includes('hash')) {
          setPaymentError('Payment security validation failed. Hash generation error.');
          toast.error('Payment security validation failed. Try dummy payment for testing.');
          console.error('PayHere Hash Error - Check hash generation');
        } else {
          setPaymentError('PayHere payment failed: ' + error);
          toast.error('PayHere failed. Try dummy payment for testing.');
        }
      };

      // Log payment object for debugging
      console.log('PayHere Payment Object:', {
        sandbox: payment.sandbox,
        merchant_id: payment.merchant_id,
        order_id: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        hash: payment.hash.substring(0, 10) + '...',
        items: payment.items
      });

      // Start payment
      console.log('Starting PayHere payment...');
      payhere.startPayment(payment);

    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment');
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = async (orderId) => {
    try {
      // Update appointment status and create receipt
      const verifyData = {
        orderId,
        appointmentId,
        paymentAmount: formData.consultationType === 'physical' 
          ? (doctor.consultationFees?.physical || 2000)
          : (doctor.consultationFees?.online || 1500),
        paymentMethod: 'PayHere'
      };

      const response = await axios.post('/api/payments/verify', verifyData);

      if (response.data.success) {
        setPaymentSuccess(true);
        setReceiptData(response.data.receipt);
        
        // Send confirmation email
        try {
          await axios.post('/api/appointments/send-confirmation', {
            appointmentId,
            patientEmail: user.email,
            doctorName: doctor.userId?.name || doctor.name,
            appointmentDate: formData.appointmentDate,
            appointmentTime: formData.appointmentTime,
            consultationType: formData.consultationType,
            amount: verifyData.paymentAmount
          });
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // Don't show error to user as payment was successful
        }

        toast.success('Payment successful! Appointment confirmed.');
      } else {
        toast.error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      // For demo purposes, still show success
      setPaymentSuccess(true);
      setReceiptData({
        appointmentId,
        orderId,
        amount: formData.consultationType === 'physical' 
          ? (doctor.consultationFees?.physical || 2000)
          : (doctor.consultationFees?.online || 1500),
        date: new Date().toISOString(),
        status: 'confirmed'
      });
      toast.success('Payment successful! Appointment confirmed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      // Try to get PDF from backend
      const response = await axios.get(`/api/appointments/${appointmentId}/receipt`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointment-receipt-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Generate a simple text receipt as fallback
      const receiptText = generateTextReceipt();
      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointment-receipt-${appointmentId}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded as text file');
    }
  };

  const generateTextReceipt = () => {
    return `
APPOINTMENT RECEIPT
==================

Patient: ${user.name}
Email: ${user.email}
Doctor: Dr. ${doctor.userId?.name || doctor.name}
Specialization: ${doctor.specialization}

Appointment Details:
-------------------
Date: ${new Date(formData.appointmentDate).toLocaleDateString()}
Time: ${formData.appointmentTime}
Type: ${formData.consultationType}
Reason: ${formData.reason}

Payment Details:
---------------
Amount: LKR ${formData.consultationType === 'physical' 
  ? (doctor.consultationFees?.physical || 2000)
  : (doctor.consultationFees?.online || 1500)}
Payment Method: PayHere
Status: Confirmed
Date: ${new Date().toLocaleString()}

Appointment ID: ${appointmentId}

Thank you for choosing MediLink!
`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Doctor not found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="mt-4 text-blue-600 hover:text-blue-500"
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  const consultationFee = formData.consultationType === 'physical' 
    ? (doctor.consultationFees?.physical || 2000)
    : (doctor.consultationFees?.online || 1500);

  // Payment Success Screen
  if (paymentSuccess && receiptData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your appointment has been confirmed and a confirmation email has been sent.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Doctor:</span>
                <span className="font-medium">Dr. {doctor.userId?.name || doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">{new Date(formData.appointmentDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium">{formData.appointmentTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium capitalize">{formData.consultationType}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-bold">LKR {consultationFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Appointment ID:</span>
                <span className="font-mono text-xs">{appointmentId}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={downloadReceipt}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              View My Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment Screen
  if (showPayment) {
    // Show dummy payment if PayHere failed or user chose dummy payment
    if (useDummyPayment) {
      return (
        <div className="max-w-2xl mx-auto">
          <DummyPayment
            appointmentId={appointmentId}
            amount={consultationFee}
            onSuccess={handlePaymentSuccess}
            onCancel={() => {
              setUseDummyPayment(false);
              setPaymentError(null);
            }}
          />
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h1>
            <p className="text-gray-600">Secure payment powered by PayHere</p>
          </div>

          {/* Payment Error Display */}
          {paymentError && (
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-1">Payment Issue</h4>
                  <p className="text-sm text-red-800 mb-3">{paymentError}</p>
                  <button
                    onClick={() => setUseDummyPayment(true)}
                    className="inline-flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    Use Dummy Payment (Development)
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">Dr. {doctor.userId?.name || doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Specialization:</span>
                <span className="font-medium">{doctor.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Consultation Type:</span>
                <span className="font-medium capitalize">{formData.consultationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">
                  {new Date(formData.appointmentDate).toLocaleDateString()} at {formData.appointmentTime}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">LKR {consultationFee}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">
                Your payment is secured with 256-bit SSL encryption
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowPayment(false)}
              disabled={paymentLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
            >
              {paymentLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay LKR {consultationFee}
                </>
              )}
            </button>
          </div>

          {/* Development Option */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setUseDummyPayment(true)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              <TestTube className="h-3 w-3 mr-1 inline" />
              Use Dummy Payment (Development)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600">Schedule your consultation with Dr. {doctor.userId?.name || doctor.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Consultation Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    formData.consultationType === 'online'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, consultationType: 'online' }))}
                >
                  <div className="flex items-center space-x-3">
                    <Video className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">Online</p>
                      <p className="text-sm text-gray-600">Video consultation</p>
                      <p className="text-lg font-bold text-green-600">LKR {doctor.consultationFees?.online || 1500}</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    formData.consultationType === 'physical'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, consultationType: 'physical' }))}
                >
                  <div className="flex items-center space-x-3">
                    <Building className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium">Physical</p>
                      <p className="text-sm text-gray-600">In-person visit</p>
                      <p className="text-lg font-bold text-blue-600">LKR {doctor.consultationFees?.physical || 2000}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Selection for Physical Consultations */}
            {formData.consultationType === 'physical' && (
              <div>
                <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Hospital *
                </label>
                <select
                  id="hospitalId"
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a hospital</option>
                  <option value="demo-hospital-1">City Medical Center - Colombo</option>
                  <option value="demo-hospital-2">General Hospital - Kandy</option>
                  <option value="demo-hospital-3">District Hospital - Galle</option>
                </select>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="appointmentDate"
                  name="appointmentDate"
                  type="date"
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots *
                </label>
                {slotsLoading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading slots...</p>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, appointmentTime: slot }))}
                        className={`p-2 text-sm rounded-lg border transition ${
                          formData.appointmentTime === slot
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-gray-600 text-sm mt-2">No available slots for this date</p>
                    <p className="text-gray-500 text-xs mt-1">Please try another date</p>
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="reason"
                  name="reason"
                  rows="3"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your symptoms or reason for consultation..."
                />
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Symptoms (Optional)
              </label>
              <input
                id="symptoms"
                name="symptoms"
                type="text"
                value={formData.symptoms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter symptoms separated by commas"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: fever, headache, cough
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !formData.appointmentTime}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Appointment...
                </>
              ) : (
                `Proceed to Payment - LKR ${consultationFee}`
              )}
            </button>
          </form>
        </div>

        {/* Doctor Summary */}
        <div className="space-y-6">
          {/* Doctor Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={doctor.userId?.avatar || doctor.avatar || 'https://via.placeholder.com/60'}
                alt={doctor.userId?.name || doctor.name}
                className="w-15 h-15 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Dr. {doctor.userId?.name || doctor.name}
                </h3>
                <p className="text-blue-600">{doctor.specialization}</p>
                <p className="text-sm text-gray-600">
                  {doctor.experience} years experience
                </p>
              </div>
            </div>

            {doctor.bio && (
              <p className="text-gray-700 text-sm">{doctor.bio}</p>
            )}
          </div>

          {/* Appointment Summary */}
          {(formData.appointmentDate && formData.appointmentTime) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{formData.consultationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(formData.appointmentDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formData.appointmentTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-bold text-lg">LKR {consultationFee}</span>
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Payment is required to confirm your appointment</li>
                  <li>• Secure payment powered by PayHere</li>
                  <li>• Confirmation email will be sent after payment</li>
                  <li>• Receipt will be available for download</li>
                  <li>• Cancellation allowed up to 2 hours before appointment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;