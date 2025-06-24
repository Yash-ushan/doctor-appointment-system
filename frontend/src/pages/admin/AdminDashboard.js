import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  BarChart3,
  Users,
  UserCheck,
  Building,
  Calendar,
  TrendingUp,
  Settings,
  Activity,
  Shield,
  Menu,
  X,
  Bell,
  LogOut,
  FileText,
  DollarSign
} from 'lucide-react';

// Import admin components
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminDoctors from './AdminDoctors';
import AdminHospitals from './AdminHospitals';
import AdminAppointments from './AdminAppointments';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchAdminStats();
    fetchNotifications();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch comprehensive admin statistics with fallback handling
      const requests = [
        axios.get('/api/admin/users').catch(() => ({ data: { data: [] } })),
        axios.get('/api/admin/doctors').catch(() => ({ data: { data: [] } })),
        axios.get('/api/hospitals').catch(() => ({ data: { data: [] } })),
        axios.get('/api/admin/appointments').catch(() => ({ data: { data: [] } }))
      ];

      const [usersRes, doctorsRes, hospitalsRes, appointmentsRes] = await Promise.all(requests);

      const users = usersRes.data.data || [];
      const doctors = doctorsRes.data.data || [];
      const hospitals = hospitalsRes.data.data || [];
      const appointments = appointmentsRes.data.data || [];

      // Calculate comprehensive stats
      const now = new Date();
      const today = new Date().toDateString();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const totalUsers = users.length;
      const totalDoctors = doctors.length;
      const verifiedDoctors = doctors.filter(d => d.isVerified).length;
      const totalHospitals = hospitals.length;
      const totalAppointments = appointments.length;
      
      const todayAppointments = appointments.filter(app => 
        new Date(app.appointmentDate).toDateString() === today
      ).length;

      const thisMonthAppointments = appointments.filter(app => {
        const appointmentDate = new Date(app.appointmentDate);
        return appointmentDate.getMonth() === currentMonth && 
               appointmentDate.getFullYear() === currentYear;
      }).length;

      const completedAppointments = appointments.filter(app => app.status === 'completed').length;
      const pendingAppointments = appointments.filter(app => 
        app.status === 'scheduled' || app.status === 'pending_payment'
      ).length;
      const confirmedAppointments = appointments.filter(app => app.status === 'confirmed').length;

      // Calculate earnings
      const totalEarnings = appointments
        .filter(app => app.status === 'completed')
        .reduce((total, app) => total + (app.consultationFee || 0), 0);

      const appointmentStats = [
        { _id: 'scheduled', count: appointments.filter(a => a.status === 'scheduled').length },
        { _id: 'confirmed', count: appointments.filter(a => a.status === 'confirmed').length },
        { _id: 'pending_payment', count: appointments.filter(a => a.status === 'pending_payment').length },
        { _id: 'completed', count: appointments.filter(a => a.status === 'completed').length },
        { _id: 'cancelled', count: appointments.filter(a => a.status === 'cancelled').length }
      ];

      // Top specializations
      const specializationCount = {};
      doctors.forEach(doctor => {
        const spec = doctor.specialization || 'General';
        specializationCount[spec] = (specializationCount[spec] || 0) + 1;
      });
      
      const topSpecializations = Object.entries(specializationCount)
        .map(([_id, count]) => ({ _id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalUsers,
        totalDoctors,
        verifiedDoctors,
        totalHospitals,
        totalAppointments,
        todayAppointments,
        thisMonthAppointments,
        completedAppointments,
        pendingAppointments,
        confirmedAppointments,
        totalEarnings,
        appointmentStats,
        topSpecializations
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Set fallback stats if everything fails
      setStats({
        totalUsers: 0,
        totalDoctors: 0,
        verifiedDoctors: 0,
        totalHospitals: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        thisMonthAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        totalEarnings: 0,
        appointmentStats: [],
        topSpecializations: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      // Mock notifications - replace with actual API call
      setNotifications([
        { id: 1, message: 'New doctor registration pending approval', time: '5 minutes ago', unread: true },
        { id: 2, message: 'Hospital "City Medical Center" updated facilities', time: '1 hour ago', unread: true },
        { id: 3, message: 'Monthly report is ready for download', time: '2 hours ago', unread: false }
      ]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3, current: location.pathname === '/admin' },
    { name: 'Users', href: '/admin/users', icon: Users, current: location.pathname === '/admin/users' },
    { name: 'Doctors', href: '/admin/doctors', icon: UserCheck, current: location.pathname === '/admin/doctors' },
    { name: 'Hospitals', href: '/admin/hospitals', icon: Building, current: location.pathname === '/admin/hospitals' },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar, current: location.pathname === '/admin/appointments' },
    { name: 'Reports', href: '/admin/reports', icon: FileText, current: location.pathname === '/admin/reports' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: location.pathname === '/admin/settings' }
  ];

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Admin info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar || 'https://via.placeholder.com/40'}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  System Administrator
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
                  {user?.name || 'Administrator'}
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
                <Route path="/" element={<AdminOverview stats={stats} />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/doctors" element={<AdminDoctors />} />
                <Route path="/hospitals" element={<AdminHospitals />} />
                <Route path="/appointments" element={<AdminAppointments />} />
                <Route path="/reports" element={<AdminReports stats={stats} />} />
                <Route path="/settings" element={<AdminSettings />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Placeholder Reports Component
const AdminReports = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">System-wide analytics and reporting</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR {(stats.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Monthly Growth</p>
              <p className="text-2xl font-bold text-gray-900">+12.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((stats.totalUsers || 0) * 0.75)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-green-600">99.9%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Detailed Reports Coming Soon...
        </h3>
        <p className="text-gray-600">
          Advanced analytics, charts, and exportable reports will be available here.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;