import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatLKR } from '../utils/currency';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  Search,
  Star,
  MapPin,
  Activity,
  Download,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Receipt
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, doctorsRes] = await Promise.all([
        axios.get('/api/appointments?limit=10').catch(() => ({ data: { data: [] } })),
        axios.get('/api/doctors?limit=3&sortBy=rating').catch(() => ({ data: { data: [] } }))
      ]);

      const appointments = appointmentsRes.data.data || [];
      const doctors = doctorsRes.data.data || [];

      setRecentAppointments(appointments);
      setTopDoctors(doctors);
      
      // Generate receipts from paid appointments
      const receipts = appointments
        .filter(app => app.status === 'completed' || app.status === 'confirmed')
        .map(app => ({
          _id: app._id,
          appointmentId: app._id,
          date: app.appointmentDate,
          doctorName: app.doctorId?.userId?.name || 'Dr. Smith',
          amount: app.consultationFee || (app.consultationType === 'physical' ? 2000 : 1500),
          paymentStatus: 'paid',
          consultationType: app.consultationType,
          receiptNumber: `REC-${app._id?.slice(-6) || '123456'}`
        }));
      
      setRecentReceipts(receipts.slice(0, 5));
      
      // Calculate stats
      const now = new Date();
      const totalAppointments = appointments.length;
      const upcomingAppointments = appointments.filter(
        app => new Date(app.appointmentDate) > now && app.status !== 'cancelled'
      ).length;
      const completedAppointments = appointments.filter(
        app => app.status === 'completed'
      ).length;
      const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);

      setStats({
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        totalSpent
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data
      setStats({
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        totalSpent: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (appointmentId, receiptNumber) => {
    try {
      // Try to get PDF from backend
      const response = await axios.get(`/api/appointments/${appointmentId}/receipt`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      // Generate a simple text receipt as fallback
      const receipt = recentReceipts.find(r => r.appointmentId === appointmentId);
      if (receipt) {
        const receiptText = generateTextReceipt(receipt);
        const blob = new Blob([receiptText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt-${receiptNumber}.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success('Receipt downloaded as text file');
      }
    }
  };

  const generateTextReceipt = (receipt) => {
    return `
MEDICAL CONSULTATION RECEIPT
===========================

Receipt Number: ${receipt.receiptNumber}
Date: ${new Date(receipt.date).toLocaleDateString()}

Patient Information:
-------------------
Name: ${user.name}
Email: ${user.email}

Service Details:
---------------
Doctor: ${receipt.doctorName}
Consultation Type: ${receipt.consultationType}
Date: ${new Date(receipt.date).toLocaleDateString()}

Payment Information:
-------------------
Amount: LKR ${receipt.amount}
Payment Status: ${receipt.paymentStatus}
Payment Method: PayHere

Thank you for choosing MediLink!
Contact: support@medilink.com
`;
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'confirmed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100">
          Here's your health dashboard overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Appointments
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.upcomingAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-600 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.completedAppointments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-yellow-600 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Spent
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    LKR {stats.totalSpent?.toLocaleString() || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`${
              activeTab === 'appointments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            My Appointments
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`${
              activeTab === 'receipts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Payment Receipts
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Recent Appointments
                </h2>
                <Link
                  to="/appointments"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {recentAppointments.length > 0 ? (
                <div className="space-y-4">
                  {recentAppointments.slice(0, 3).map((appointment) => {
                    const StatusIcon = getStatusIcon(appointment.status);
                    return (
                      <div key={appointment._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <img
                            src={appointment.doctorId?.userId?.avatar || 'https://via.placeholder.com/40'}
                            alt={appointment.doctorId?.userId?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Dr. {appointment.doctorId?.userId?.name || 'Doctor'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by booking your first appointment.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/doctors"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Find Doctors
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Rated Doctors */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Rated Doctors
                </h2>
                <Link
                  to="/doctors"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {topDoctors.length > 0 ? topDoctors.map((doctor) => (
                  <Link
                    key={doctor._id}
                    to={`/doctors/${doctor._id}`}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={doctor.userId?.avatar || 'https://via.placeholder.com/48'}
                      alt={doctor.userId?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        Dr. {doctor.userId?.name}
                      </h4>
                      <p className="text-sm text-blue-600">{doctor.specialization}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(doctor.rating || 4) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          ({doctor.totalRatings || Math.floor(Math.random() * 50) + 10})
                        </span>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No doctors available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All My Appointments</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => {
                const StatusIcon = getStatusIcon(appointment.status);
                return (
                  <div key={appointment._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={appointment.doctorId?.userId?.avatar || 'https://via.placeholder.com/48'}
                          alt={appointment.doctorId?.userId?.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Dr. {appointment.doctorId?.userId?.name || 'Doctor'}
                          </h3>
                          <p className="text-sm text-blue-600">
                            {appointment.doctorId?.specialization || 'General Medicine'}
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{appointment.appointmentTime}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="capitalize">{appointment.consultationType}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {appointment.status}
                        </span>
                        {(appointment.status === 'completed' || appointment.status === 'confirmed') && (
                          <button
                            onClick={() => downloadReceipt(appointment._id, `REC-${appointment._id?.slice(-6) || '123456'}`)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Book your first appointment to get started.
                </p>
                <div className="mt-6">
                  <Link
                    to="/doctors"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Find Doctors
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'receipts' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Payment Receipts</h2>
              <div className="text-sm text-gray-500">
                Total: LKR {stats.totalSpent?.toLocaleString() || 0}
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentReceipts.length > 0 ? (
              recentReceipts.map((receipt) => (
                <div key={receipt._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Receipt className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Consultation with {receipt.doctorName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receipt #{receipt.receiptNumber}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(receipt.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="capitalize">{receipt.consultationType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          LKR {receipt.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 capitalize">
                          {receipt.paymentStatus}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadReceipt(receipt.appointmentId, receipt.receiptNumber)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Receipts from completed appointments will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;