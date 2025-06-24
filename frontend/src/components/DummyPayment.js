import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatLKR } from '../utils/currency';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  CreditCard,
  TestTube,
  CheckCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

const DummyPayment = ({ appointmentId, amount, onSuccess, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleDummyPayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // Generate dummy order ID
        const orderId = `DUMMY_${appointmentId}_${Date.now()}`;
        
        // Call payment verification endpoint
        const response = await axios.post('/api/payments/verify', {
          orderId,
          appointmentId,
          paymentAmount: amount,
          paymentMethod: 'Dummy Payment (Development)'
        });

        if (response.data.success) {
          toast.success('Dummy payment completed successfully!');
          onSuccess(orderId);
        } else {
          toast.error('Payment verification failed');
        }
      } catch (error) {
        console.error('Dummy payment error:', error);
        toast.error('Payment processing failed');
      } finally {
        setProcessing(false);
      }
    }, 2000); // 2 second delay to simulate processing
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TestTube className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Development Payment Mode</h2>
        <p className="text-gray-600 text-sm">
          PayHere is not available. Use dummy payment for testing.
        </p>
      </div>

      <div className="bg-yellow-50 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">Development Mode</h4>
            <p className="text-sm text-yellow-800">
              This simulates a successful payment. In production, PayHere integration will be used.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Appointment Fee:</span>
            <span className="font-medium">{formatLKR(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium">Dummy Payment</span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-green-600">{formatLKR(amount)}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          disabled={processing}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2 inline" />
          Back
        </button>
        <button
          onClick={handleDummyPayment}
          disabled={processing}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Dummy Payment
            </>
          )}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        This is a development feature. No real payment is processed.
      </div>
    </div>
  );
};

export default DummyPayment;
