import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CreditCard, Lock, Shield } from 'lucide-react';

const PaymentForm = ({ appointment, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Use environment variables for PayHere URL
  const getPayHereURL = () => {
    const isSandbox = process.env.REACT_APP_PAYHERE_SANDBOX === 'true';
    return isSandbox 
      ? 'https://sandbox.payhere.lk/pay/checkout'  // Sandbox URL
      : 'https://www.payhere.lk/pay/checkout';     // Live URL
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      console.log('🔧 Environment Check:');
      console.log('Sandbox Mode:', process.env.REACT_APP_PAYHERE_SANDBOX);
      console.log('API URL:', process.env.REACT_APP_API_URL);
      console.log('PayHere URL:', getPayHereURL());

      // Use environment variable for API URL
      const apiUrl = process.env.REACT_APP_API_URL || '';
      
      const response = await axios.post(`${apiUrl}/api/payments/initiate`, {
        appointmentId: appointment._id
      });

      console.log('💰 Payment Response:', response.data);

      const { paymentData, environment } = response.data;

      // Verify environment consistency
      const frontendSandbox = process.env.REACT_APP_PAYHERE_SANDBOX === 'true';
      const backendSandbox = environment === 'sandbox';
      
      console.log('🔍 Environment Sync Check:');
      console.log('Frontend Sandbox:', frontendSandbox);
      console.log('Backend Sandbox:', backendSandbox);
      
      if (frontendSandbox !== backendSandbox) {
        toast.error('Environment mismatch detected!');
        console.error('Environment mismatch: Frontend and Backend have different sandbox settings');
        return;
      }

      // Validate required payment data
      const requiredFields = ['merchant_id', 'order_id', 'amount', 'currency', 'hash'];
      const missingFields = requiredFields.filter(field => !paymentData[field]);
      
      if (missingFields.length > 0) {
        toast.error('Payment data incomplete');
        console.error('Missing required fields:', missingFields);
        return;
      }

      // Create PayHere form and submit
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = getPayHereURL();
      
      console.log('Form Details:');
      console.log('Action URL:', form.action);
      console.log('Payment Data:', paymentData);

      // Add all payment data to form
      Object.keys(paymentData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
        console.log(`Form field: ${key} = ${paymentData[key]}`);
      });

      document.body.appendChild(form);
      
      // Show success message before redirect
      toast.success('Redirecting to PayHere...');
      
      console.log('Submitting form to PayHere...');
      form.submit();
      
    } catch (error) {
      toast.error('Payment initiation failed');
      console.error('Payment error:', error);
      
      
      if (error.response) {
        console.error('API Error Response:', error.response.data);
        console.error('API Error Status:', error.response.status);
      } else if (error.request) {
        console.error('API Request failed:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold">Payment Details</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Consultation Fee:</span>
            <span className="font-semibold">LKR {appointment.consultationFee}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Service Charge:</span>
            <span className="font-semibold">LKR 0.00</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Amount:</span>
            <span className="text-lg font-bold text-blue-600">LKR {appointment.consultationFee}</span>
          </div>
        </div>

        {/* Environment indicator for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
            <strong>Development Mode:</strong> {process.env.REACT_APP_PAYHERE_SANDBOX === 'true' ? 'Sandbox' : 'Live'} Environment
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Secured by PayHere Payment Gateway</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Lock className="h-4 w-4" />
          <span>Your payment information is encrypted and secure</span>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2" size={20} />
              Pay LKR {appointment.consultationFee} 
              {process.env.REACT_APP_PAYHERE_SANDBOX === 'true' && ' (Test)'}
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By proceeding, you agree to our Terms of Service and Privacy Policy.
          You will receive a booking confirmation and invoice via email after successful payment.
        </p>

        {/* Test card info for sandbox mode */}
        {process.env.REACT_APP_PAYHERE_SANDBOX === 'true' && process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs">
            <strong>Test Mode:</strong> Use card number <code>4916217501611292</code>, CVV <code>123</code>, Expiry <code>12/25</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;