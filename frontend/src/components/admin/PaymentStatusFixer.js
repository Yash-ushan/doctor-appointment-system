import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Settings,
  Users,
  CreditCard,
  Calendar
} from 'lucide-react';

const PaymentStatusFixer = () => {
  const [diagnosticData, setDiagnosticData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState(null);

  // Load diagnostic data on component mount
  useEffect(() => {
    loadDiagnosticData();
  }, []);

  const loadDiagnosticData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/diagnostic/payment-status');
      if (response.data.success) {
        setDiagnosticData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load diagnostic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixAllPendingPayments = async () => {
    if (!window.confirm('This will fix ALL pending payments. Are you sure?')) {
      return;
    }

    setFixing(true);
    try {
      const response = await axios.post('/api/payments/fix-pending');
      if (response.data.success) {
        setResults(response.data);
        // Reload diagnostic data to see updated counts
        await loadDiagnosticData();
      }
    } catch (error) {
      console.error('Failed to fix pending payments:', error);
      setResults({
        success: false,
        message: error.response?.data?.message || 'Fix failed'
      });
    } finally {
      setFixing(false);
    }
  };

  const fixSpecificAppointment = async (appointmentId) => {
    try {
      const response = await axios.post(`/api/payments/manual-update/${appointmentId}`, {
        paymentStatus: 'completed',
        paymentReference: `ADMIN-FIX-${Date.now()}`
      });
      
      if (response.data.success) {
        // Reload diagnostic data
        await loadDiagnosticData();
        alert(`Appointment ${appointmentId} has been fixed!`);
      }
    } catch (error) {
      console.error('Failed to fix specific appointment:', error);
      alert('Failed to fix appointment. Check console for details.');
    }
  };

  if (loading && !diagnosticData) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading diagnostic data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            Payment Status Fixer
          </h1>
          <button
            onClick={loadDiagnosticData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Diagnostic Summary */}
        {diagnosticData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">Pending Payments</p>
                  <p className="text-2xl font-bold text-red-900">
                    {diagnosticData.appointments.pending_payment}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">Confirmed</p>
                  <p className="text-2xl font-bold text-green-900">
                    {diagnosticData.appointments.confirmed}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Completed Payments</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {diagnosticData.payments.completed}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fix All Button */}
        {diagnosticData?.appointments.pending_payment > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-yellow-800">
                  Action Required
                </h3>
                <p className="text-sm text-yellow-700">
                  {diagnosticData.appointments.pending_payment} appointments are stuck in "pending_payment" status
                </p>
              </div>
              <button
                onClick={fixAllPendingPayments}
                disabled={fixing}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                {fixing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Fix All Pending Payments
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className={`border rounded-lg p-4 mb-6 ${
            results.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {results.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <div>
                <p className={`font-medium ${results.success ? 'text-green-800' : 'text-red-800'}`}>
                  {results.message}
                </p>
                {results.success && results.fixed > 0 && (
                  <p className="text-sm text-green-700">
                    Successfully fixed {results.fixed} out of {results.totalPending} pending payments
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sample Pending Appointments */}
        {diagnosticData?.samplePendingAppointments?.length > 0 && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Pending Appointments (Sample)
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {diagnosticData.samplePendingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">{appointment.patientEmail}</p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(appointment.appointmentDate).toLocaleDateString()} • 
                        Fee: LKR {appointment.fee} •
                        Created: {new Date(appointment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => fixSpecificAppointment(appointment.id)}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Fix This
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {diagnosticData?.appointments.pending_payment === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">All Good!</h3>
            <p className="text-gray-600">No pending payment issues found.</p>
          </div>
        )}

        {/* Recommendations */}
        {diagnosticData?.recommendations && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Recommendations:</h4>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              {diagnosticData.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusFixer;
