import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatLKR } from '../../utils/currency';
import axios from 'axios';
import { 
  Users,
  UserCheck,
  Building,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity,
  DollarSign,
  ArrowUpRight,
  Eye,
  Shield,
  Clock,
  Star,
  BarChart3
} from 'lucide-react';

const AdminOverview = ({ stats }) => {
  const { user } = useAuth();
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentUsers();
    fetchRecentActivity();
    fetchSystemHealth();
  }, []);

  const fetchRecentUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users?limit=5&sortBy=createdAt');
      setRecentUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recent users:', error);
      // Set empty array as fallback
      setRecentUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Mock recent activity data
      setRecentActivity([
        { id: 1, type: 'user', message: 'New user registration: John Doe', time: '15 minutes ago', icon: Users },
        { id: 2, type: 'doctor', message: 'Doctor verification: Dr. Sarah Wilson', time: '45 minutes ago', icon: UserCheck },
        { id: 3, type: 'appointment', message: 'Appointment completed: Patient #1234', time: '1 hour ago', icon: Calendar },
        { id: 4, type: 'hospital', message: 'Hospital updated: City Medical Center', time: '2 hours ago', icon: Building },
        { id: 5, type: 'system', message: 'System backup completed successfully', time: '3 hours ago', icon: Shield }
      ]);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      // Mock system health data
      setSystemHealth({
        uptime: '99.9%',
        responseTime: '120ms',
        errors: 3,
        warnings: 12
      });
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-600',
      change: '+12%',
      changeType: 'increase',
      description: 'from last month'
    },
    {
      name: 'Verified Doctors',
      value: `${stats.verifiedDoctors || 0}/${stats.totalDoctors || 0}`,
      icon: UserCheck,
      color: 'bg-green-600',
      change: `${Math.round((stats.verifiedDoctors / (stats.totalDoctors || 1)) * 100)}%`,
      changeType: 'percentage',
      description: 'verification rate'
    },
    {
      name: 'Total Revenue',
      value: `LKR ${(stats.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-600',
      change: '+8%',
      changeType: 'increase',
      description: 'from last month'
    },
    {
      name: 'Active Hospitals',
      value: stats.totalHospitals || 0,
      icon: Building,
      color: 'bg-yellow-600',
      change: '+2',
      changeType: 'increase',
      description: 'new this month'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all system users',
      link: '/admin/users',
      icon: Users,
      color: 'bg-blue-600',
      stats: `${stats.totalUsers || 0} users`
    },
    {
      title: 'Verify Doctors',
      description: 'Review and verify doctor profiles',
      link: '/admin/doctors',
      icon: UserCheck,
      color: 'bg-green-600',
      stats: `${(stats.totalDoctors || 0) - (stats.verifiedDoctors || 0)} pending`
    },
    {
      title: 'Hospital Management',
      description: 'Add and manage hospitals',
      link: '/admin/hospitals',
      icon: Building,
      color: 'bg-purple-600',
      stats: `${stats.totalHospitals || 0} hospitals`
    },
    {
      title: 'View Reports',
      description: 'Analytics and system reports',
      link: '/admin/reports',
      icon: BarChart3,
      color: 'bg-yellow-600',
      stats: 'Latest data'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return Users;
      case 'doctor':
        return UserCheck;
      case 'appointment':
        return Calendar;
      case 'hospital':
        return Building;
      case 'system':
        return Shield;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-600';
      case 'doctor':
        return 'bg-green-100 text-green-600';
      case 'appointment':
        return 'bg-purple-100 text-purple-600';
      case 'hospital':
        return 'bg-yellow-100 text-yellow-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name || 'Administrator'}!
        </h1>
        <p className="text-blue-100">
          Here's your system overview for today
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{stats.todayAppointments || 0} appointments today</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            <span>{stats.totalUsers || 0} total users</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            <span>System: {systemHealth.uptime || '99.9%'} uptime</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 
                        stat.changeType === 'percentage' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {stat.changeType === 'increase' && <TrendingUp className="h-4 w-4 mr-1" />}
                        {stat.change}
                      </div>
                    </dd>
                    <dd className="text-xs text-gray-400 mt-1">
                      {stat.description}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Users
              </h3>
              <Link
                to="/admin/users"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          
          <div className="px-6 py-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || 'https://via.placeholder.com/40'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.email} • {user.role}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent users</h3>
                <p className="mt-1 text-sm text-gray-500">New user registrations will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          
          <div className="px-6 py-4">
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        <ActivityIcon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            System Health
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {systemHealth.uptime || '99.9%'}
              </div>
              <div className="text-sm text-gray-500">System Uptime</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {systemHealth.responseTime || '120ms'}
              </div>
              <div className="text-sm text-gray-500">Avg Response Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {systemHealth.warnings || 12}
              </div>
              <div className="text-sm text-gray-500">Active Warnings</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {systemHealth.errors || 3}
              </div>
              <div className="text-sm text-gray-500">Critical Errors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group flex flex-col p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`${action.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{action.stats}</span>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Analytics */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Appointment Analytics
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appointment Status Distribution */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Status Distribution</h4>
              <div className="space-y-3">
                {stats.appointmentStats?.map((stat) => (
                  <div key={stat._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        stat._id === 'completed' ? 'bg-green-500' :
                        stat._id === 'confirmed' ? 'bg-blue-500' :
                        stat._id === 'scheduled' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-600 capitalize">{stat._id}</span>
                    </div>
                    <span className="text-sm font-medium">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Specializations */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Specializations</h4>
              <div className="space-y-3">
                {stats.topSpecializations?.slice(0, 5).map((spec, index) => (
                  <div key={spec._id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{spec._id}</span>
                    <span className="text-sm font-medium">{spec.count} doctors</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;