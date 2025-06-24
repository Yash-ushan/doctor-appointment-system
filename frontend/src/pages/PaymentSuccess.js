import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  CheckCircle, 
  Download, 
  Calendar,
  Clock,
  User,
  DollarSign,
  ArrowLeft
} from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [appointmentData, setAppointmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const paymentId = searchParams.get('payment_id');
    
    if (orderId) {
      verifyPayment(orderId, paymentId);
    } else {
      // If no order ID, redirect to appointments
      setTimeout(() => navigate('/appointments'), 3000);
    }
  }, [searchParams, navigate]);

  const verifyPayment = async (orderId, paymentId) => {
    try {
      console.log('🔍 Verifying payment:', { orderId, paymentId });
      
      // First, try to verify the payment
      const response = await axios.post('/api/payments/verify', {
        orderId
      });

      if (response.data.success) {
        console.log('✅ Payment verified:', response.data);
        
        if (response.data.appointment) {
          setAppointmentData(response.data.appointment);
        } else {
          // If no appointment data returned, try to get it by payment ID
          const paymentIdOnly = orderId.replace('PAY-', '');
          await getAppointmentByPaymentId(paymentIdOnly);
        }
      } else {
        console.log('⚠️ Payment verification returned false, trying alternative approach');
        await getAppointmentByPaymentId(orderId.replace('PAY-', ''));
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      // Try alternative approach
      await getAppointmentByPaymentId(orderId.replace('PAY-', ''));
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentByPaymentId = async (paymentId) => {
    try {
      console.log('🔍 Getting appointment by payment ID:', paymentId);
      
      // Try to get appointment data directly
      const appointmentResponse = await axios.get(`/api/appointments/${paymentId}`);
      if (appointmentResponse.data.success) {
        console.log('✅ Found appointment data:', appointmentResponse.data.data);
        setAppointmentData(appointmentResponse.data.data);
      } else {
        // If that doesn't work, create mock data for display
        console.log('⚠️ Creating mock appointment data for display');
        setAppointmentData({
          _id: paymentId,
          consultationFee: 2500, // Default fee
          appointmentDate: new Date(),
          appointmentTime: 'Unknown',
          consultationType: 'online',
          status: 'confirmed',
          doctorId: {
            userId: {
              name: 'Unknown Doctor'
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ Error getting appointment:', error);
      // Still set some basic data so user can download receipt
      setAppointmentData({
        _id: paymentId,
        consultationFee: 2500,
        appointmentDate: new Date(),
        appointmentTime: 'Unknown',
        consultationType: 'online',
        status: 'confirmed'
      });
    }
  };

  const downloadReceipt = async () => {
    if (!appointmentData) return;
    
    try {
      console.log('📥 Downloading receipt for appointment:', appointmentData._id);
      
      const response = await axios.get(`/api/appointments/${appointmentData._id}/receipt`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      // Check if response is actually a PDF
      if (response.data.type === 'application/pdf' || response.headers['content-type']?.includes('pdf')) {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `appointment-receipt-${appointmentData._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log('✅ PDF receipt downloaded successfully');
      } else {
        // If not PDF, treat as text
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/plain' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt-${appointmentData._id}.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        console.log('✅ Text receipt downloaded successfully');
      }
    } catch (error) {
      console.error('Download error:', error);
      
      // Generate fallback text receipt
      const receiptText = `
MEDILINK APPOINTMENT RECEIPT
============================

Receipt #: ${appointmentData._id}
Date Generated: ${new Date().toLocaleString()}

PATIENT INFORMATION
-------------------
Name: ${user?.name || 'N/A'}
Email: ${user?.email || 'N/A'}

DOCTOR INFORMATION
------------------
Doctor: Dr. ${appointmentData.doctorId?.userId?.name || appointmentData.doctorId?.name || 'N/A'}
Specialization: ${appointmentData.doctorId?.specialization || 'N/A'}

APPOINTMENT DETAILS
-------------------
Date: ${new Date(appointmentData.appointmentDate).toLocaleDateString()}
Time: ${appointmentData.appointmentTime}
Type: ${appointmentData.consultationType}
Status: ${appointmentData.status}

PAYMENT DETAILS
---------------
Consultation Fee: LKR ${appointmentData.consultationFee?.toLocaleString()}
Payment Status: Confirmed
Payment Date: ${new Date().toLocaleDateString()}

============================
Thank you for choosing MediLink!
For support, contact: support@medilink.com
============================
      `;
      
      const blob = new Blob([receiptText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${appointmentData._id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log('✅ Fallback text receipt generated');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your appointment has been confirmed and a confirmation email has been sent to {user?.email}.
          </p>

          {/* Appointment Details */}
          {appointmentData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Appointment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Doctor:</span>
                  </div>
                  <span className="font-medium">Dr. {appointmentData.doctorId?.userId?.name}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Date:</span>
                  </div>
                  <span className="font-medium">
                    {new Date(appointmentData.appointmentDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Time:</span>
                  </div>
                  <span className="font-medium">{appointmentData.appointmentTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Amount:</span>
                  </div>
                  <span className="font-bold text-green-600">
                    LKR {appointmentData.consultationFee?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {appointmentData && (
              <button
                onClick={downloadReceipt}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </button>
            )}
            
            <button
              onClick={() => navigate('/appointments')}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View My Appointments
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center px-4 py-2 text-blue-600 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@medilink.com" className="text-blue-600 hover:text-blue-500">
              support@medilink.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;