import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  XCircle, 
  ArrowLeft,
  RefreshCw,
  MessageCircle
} from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Cancel Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          
          {/* Cancel Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled and no charges have been made to your account.
          </p>

          {/* Order Info */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
              <p className="text-sm text-gray-600">
                Order ID: <span className="font-mono">{orderId}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Your appointment was not confirmed due to payment cancellation.
              </p>
            </div>
          )}

          {/* What happens next */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your appointment slot has been released</li>
              <li>• No payment has been charged</li>
              <li>• You can book again anytime</li>
              <li>• Your data is securely stored</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate('/doctors')}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Booking Again
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            
            <button
              onClick={() => window.open('mailto:support@medilink.com', '_blank')}
              className="inline-flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-3">
              If you're experiencing payment issues, our support team is here to help.
            </p>
            <div className="flex flex-col space-y-2 text-sm">
              <a 
                href="mailto:support@medilink.com" 
                className="text-blue-600 hover:text-blue-500"
              >
                📧 support@medilink.com
              </a>
              <a 
                href="tel:+94112345678" 
                className="text-blue-600 hover:text-blue-500"
              >
                📞 +94 11 234 5678
              </a>
            </div>
          </div>
        </div>

        {/* Auto redirect notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            You'll be redirected to the dashboard in 10 seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;