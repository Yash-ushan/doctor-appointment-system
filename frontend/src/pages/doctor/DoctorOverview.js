import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Video,
  MessageCircle,
  Star,
  FileText,
  ArrowUpRight,
  Activity,
  Phone
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DoctorOverview = ({ stats }) => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
    fetchRecentActivity();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get('/api/appointments');
      const appointments = response.data.data.filter(app => 
        app.appointmentDate.split('T')[0] === today
      );
      setTodayAppointments(appointments);
    } catch (error) {
      console.error('Error fetching today appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Mock recent activity data
      setRecentActivity([
        { id: 1, type: 'appointment', message: 'Completed consultation with John Doe', time: '30 minutes ago' },
        { id: 2, type: 'review', message: 'Received 5-star review from Sarah Wilson', time: '2 hours ago' },
        { id: 3, type: 'payment', message: 'Payment received: LKR 1,500', time: '3 hours ago' },
        { id: 4, type: 'appointment', message: 'New appointment booked by Mike Johnson', time: '5 hours ago' }
      ]);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const statCards = [
    {
      name: 'Total Patients',
      value: stats.totalAppointments || 0,
      icon: Users,
      color: 'bg-blue-600',
      change: '+12%',
      changeType: 'increase',
      description: 'from last month'
    },
    {
      name: "Today's Appointments",
      value: stats.todayAppointments || 0,
      icon: Calendar,
      color: 'bg-green-600',
      change: `+${stats.todayAppointments - (stats.yesterdayAppointments || 0)}`,
      changeType: 'increase',
      description: 'from yesterday'
    },
    {
      name: 'Monthly Earnings',
      value: `LKR ${(stats.thisMonthEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-600',
      change: '+8%',
      changeType: 'increase',
      description: 'from last month'
    },
    {
      name: 'Pending Appointments',
      value: stats.pendingAppointments || 0,
      icon: Clock,
      color: 'bg-yellow-600',
      change: stats.pendingAppointments > 5 ? 'High' : 'Normal',
      changeType: stats.pendingAppointments > 5 ? 'warning' : 'normal',
      description: 'need confirmation'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'review':
        return Star;
      case 'payment':
        return DollarSign;
      default:
        return CheckCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, Dr. {user?.name || 'Doctor'}!
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your patients today
        </p>
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{todayAppointments.length} appointments today</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>{stats.pendingAppointments || 0} pending confirmations</span>
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
                        stat.changeType === 'warning' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {stat.changeType === 'increase' && <TrendingUp className="h-4 w-4 mr-1" />}
                        {stat.changeType === 'warning' && <AlertCircle className="h-4 w-4 mr-1" />}
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
        {/* Today's Appointments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Today's Appointments
              </h3>
              <Link
                to="/doctor/appointments"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          
          <div className="px-6 py-4">
            {loading ? (
              <LoadingSpinner size="small" />
            ) : todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                    <div className="flex items-center space-x-3">
                      <img
                        src={appointment.patientId?.avatar || 'https://via.placeholder.com/40'}
                        alt={appointment.patientId?.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.patientId?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {appointment.appointmentTime} • {appointment.consultationType}
                        </p>
                        {appointment.reason && (
                          <p className="text-xs text-gray-400 mt-1 truncate max-w-48">
                            {appointment.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      
                      {/* Quick Actions */}
                      <div className="flex items-center space-x-1">
                        {appointment.consultationType === 'online' && appointment.status === 'confirmed' && (
                          <Link
                            to={`/chat/${appointment._id}`}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="Start Video Call"
                          >
                            <Video className="h-4 w-4" />
                          </Link>
                        )}
                        
                        <a
                          href={`tel:${appointment.patientId?.phone}`}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                          title="Call Patient"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments today</h3>
                <p className="mt-1 text-sm text-gray-500">Your schedule is clear for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
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
                      <div className="bg-gray-100 p-2 rounded-full">
                        <ActivityIcon className="h-4 w-4 text-gray-600" />
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

      {/* Practice Insights */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Practice Insights
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.completedAppointments || 0}
              </div>
              <div className="text-sm text-gray-500">Consultations Completed</div>
              <div className="text-xs text-gray-400 mt-1">This month</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {((stats.completedAppointments / (stats.totalAppointments || 1)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Completion Rate</div>
              <div className="text-xs text-gray-400 mt-1">All time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                LKR {Math.round((stats.thisMonthEarnings || 0) / (stats.thisMonthAppointments || 1)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Avg. Per Consultation</div>
              <div className="text-xs text-gray-400 mt-1">This month</div>
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
            <Link
              to="/doctor/appointments"
              className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all"
            >
              <Calendar className="h-8 w-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-sm font-medium text-gray-900">Manage Appointments</p>
                <p className="text-xs text-gray-500">View and update appointments</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center">
                  View all <ArrowUpRight className="h-3 w-3 ml-1" />
                </p>
              </div>
            </Link>
            
            <Link
              to="/doctor/schedule"
              className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-all"
            >
              <Clock className="h-8 w-8 text-green-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-sm font-medium text-gray-900">Update Schedule</p>
                <p className="text-xs text-gray-500">Set your availability</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  Manage <ArrowUpRight className="h-3 w-3 ml-1" />
                </p>
              </div>
            </Link>
            
            <Link
              to="/doctor/patients"
              className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-all"
            >
              <Users className="h-8 w-8 text-purple-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-sm font-medium text-gray-900">Patient Records</p>
                <p className="text-xs text-gray-500">View patient history</p>
                <p className="text-xs text-purple-600 mt-1 flex items-center">
                  Browse <ArrowUpRight className="h-3 w-3 ml-1" />
                </p>
              </div>
            </Link>
            
            <Link
              to="/doctor/prescriptions"
              className="group flex items-center p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-200 transition-all"
            >
              <FileText className="h-8 w-8 text-yellow-600 mr-3 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-sm font-medium text-gray-900">Prescriptions</p>
                <p className="text-xs text-gray-500">Manage prescriptions</p>
                <p className="text-xs text-yellow-600 mt-1 flex items-center">
                  Create <ArrowUpRight className="h-3 w-3 ml-1" />
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;