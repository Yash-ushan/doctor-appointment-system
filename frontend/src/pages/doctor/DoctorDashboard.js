import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp,
  Settings,
  FileText,
  Star,
  Activity,
  User,
  Menu,
  X,
  Bell,
  LogOut
} from 'lucide-react';

// Import components
import DoctorOverview from './DoctorOverview';
import DoctorAppointments from './DoctorAppointments';
import DoctorPatients from './DoctorPatients';
import DoctorSchedule from './DoctorSchedule';
import DoctorProfile from './DoctorProfile';
import DoctorEarnings from './DoctorEarnings';
import DoctorReviews from './DoctorReviews';
import DoctorPrescriptions from './DoctorPrescriptions';
import DoctorSettings from './DoctorSettings';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchDoctorStats();
    fetchNotifications();
  }, []);

  const fetchDoctorStats = async () => {
    try {
      // Fetch appointments
      const appointmentsResponse = await axios.get('/api/appointments');
      const appointments = appointmentsResponse.data.data || [];
      
      // Calculate comprehensive stats
      const now = new Date();
      const today = new Date().toDateString();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const totalAppointments = appointments.length;
      const todayAppointments = appointments.filter(app => 
        new Date(app.appointmentDate).toDateString() === today
      ).length;
      
      const completedAppointments = appointments.filter(app => app.status === 'completed').length;
      
      const upcomingAppointments = appointments.filter(app => {
        const appointmentDate = new Date(app.appointmentDate);
        return appointmentDate > now && (app.status === 'confirmed' || app.status === 'scheduled');
      }).length;
      
      const pendingAppointments = appointments.filter(app => 
        app.status === 'scheduled' || app.status === 'pending_payment'
      ).length;
      
      const confirmedAppointments = appointments.filter(app => 
        app.status === 'confirmed'
      ).length;
      
      const thisMonthAppointments = appointments.filter(app => {
        const appointmentDate = new Date(app.appointmentDate);
        return appointmentDate.getMonth() === currentMonth && 
               appointmentDate.getFullYear() === currentYear;
      });
      
      // Calculate earnings 
      const thisMonthEarnings = thisMonthAppointments
        .filter(app => app.status === 'completed')
        .reduce((total, app) => total + (app.consultationFee || 0), 0);
      
      const totalEarnings = appointments
        .filter(app => app.status === 'completed')
        .reduce((total, app) => total + (app.consultationFee || 0), 0);

      setStats({
        totalAppointments,
        todayAppointments,
        completedAppointments,
        upcomingAppointments,
        pendingAppointments,
        confirmedAppointments,
        thisMonthEarnings,
        totalEarnings,
        thisMonthAppointments: thisMonthAppointments.length
      });
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      
      setNotifications([
        { id: 1, message: 'New appointment request from John Doe', time: '10 minutes ago', unread: true },
        { id: 2, message: 'Appointment reminder: Sarah Wilson at 3:00 PM', time: '1 hour ago', unread: true },
        { id: 3, message: 'Payment received: LKR 1,500', time: '2 hours ago', unread: false }
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const navigation = [
    { name: 'Overview', href: '/doctor', icon: Activity, current: location.pathname === '/doctor' },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar, current: location.pathname === '/doctor/appointments' },
    { name: 'Patients', href: '/doctor/patients', icon: Users, current: location.pathname === '/doctor/patients' },
    { name: 'Schedule', href: '/doctor/schedule', icon: Clock, current: location.pathname === '/doctor/schedule' },
    { name: 'Earnings', href: '/doctor/earnings', icon: TrendingUp, current: location.pathname === '/doctor/earnings' },
    { name: 'Reviews', href: '/doctor/reviews', icon: Star, current: location.pathname === '/doctor/reviews' },
    { name: 'Prescriptions', href: '/doctor/prescriptions', icon: FileText, current: location.pathname === '/doctor/prescriptions' },
    { name: 'Profile', href: '/doctor/profile', icon: User, current: location.pathname === '/doctor/profile' },
    { name: 'Settings', href: '/doctor/settings', icon: Settings, current: location.pathname === '/doctor/settings' }
  ];

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Doctor Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Doctor info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || 'https://via.placeholder.com/40'}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Dr. {user?.name || 'Doctor'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.specialization || 'Specialist'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`${
                  item.current
                    ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-2 text-sm font-medium rounded-l-md transition-colors`}
              >
                <item.icon
                  className={`${
                    item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-5 w-5`}
                />
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {navigation.find(nav => nav.current)?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="text-gray-400 hover:text-gray-600 relative">
                  <Bell className="h-6 w-6" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {notifications.filter(n => n.unread).length}
                      </span>
                    </span>
                  )}
                </button>
              </div>
              
              {/* User menu */}
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar || 'https://via.placeholder.com/32'}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  Dr. {user?.name || 'Doctor'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Routes>
                <Route path="/" element={<DoctorOverview stats={stats} />} />
                <Route path="/appointments" element={<DoctorAppointments />} />
                <Route path="/patients" element={<DoctorPatients />} />
                <Route path="/schedule" element={<DoctorSchedule />} />
                <Route path="/earnings" element={<DoctorEarnings stats={stats} />} />
                <Route path="/reviews" element={<DoctorReviews />} />
                <Route path="/prescriptions" element={<DoctorPrescriptions />} />
                <Route path="/profile" element={<DoctorProfile />} />
                <Route path="/settings" element={<DoctorSettings />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;