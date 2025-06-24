import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Wallet,
  Users
} from 'lucide-react';

const DoctorEarnings = ({ stats }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [earningsData, setEarningsData] = useState({
    thisMonth: 0,
    lastMonth: 0,
    thisYear: 0,
    total: 0,
    avgPerConsultation: 0,
    totalConsultations: 0,
    pendingPayments: 0,
    paidConsultations: 0
  });

  useEffect(() => {
    // Calculate earnings from stats
    const thisMonthEarnings = stats.thisMonthEarnings || 0;
    const totalEarnings = stats.totalEarnings || 0;
    const completedAppointments = stats.completedAppointments || 0;
    const avgPerConsultation = completedAppointments > 0 ? Math.round(totalEarnings / completedAppointments) : 0;

    setEarningsData({
      thisMonth: thisMonthEarnings,
      lastMonth: Math.round(thisMonthEarnings * 0.85), // Mock data
      thisYear: Math.round(thisMonthEarnings * 8.5), // Mock data
      total: totalEarnings,
      avgPerConsultation: avgPerConsultation,
      totalConsultations: completedAppointments,
      pendingPayments: Math.round(thisMonthEarnings * 0.15), // Mock data
      paidConsultations: completedAppointments
    });
  }, [stats]);

  const earningsCards = [
    {
      title: 'This Month',
      amount: earningsData.thisMonth,
      icon: DollarSign,
      color: 'bg-green-600',
      change: earningsData.thisMonth - earningsData.lastMonth,
      changePercent: earningsData.lastMonth > 0 ? ((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth * 100).toFixed(1) : 0
    },
    {
      title: 'Total Earnings',
      amount: earningsData.total,
      icon: TrendingUp,
      color: 'bg-blue-600',
      change: Math.round(earningsData.total * 0.12),
      changePercent: '12.5'
    },
    {
      title: 'Avg per Consultation',
      amount: earningsData.avgPerConsultation,
      icon: Banknote,
      color: 'bg-purple-600',
      change: 150,
      changePercent: '8.3'
    },
    {
      title: 'Pending Payments',
      amount: earningsData.pendingPayments,
      icon: CreditCard,
      color: 'bg-yellow-600',
      change: -Math.round(earningsData.pendingPayments * 0.2),
      changePercent: '-15.2'
    }
  ];

  const monthlyData = [
    { month: 'Jan', earnings: 25000, consultations: 18 },
    { month: 'Feb', earnings: 32000, consultations: 22 },
    { month: 'Mar', earnings: 28000, consultations: 20 },
    { month: 'Apr', earnings: 35000, consultations: 25 },
    { month: 'May', earnings: 42000, consultations: 28 },
    { month: 'Jun', earnings: earningsData.thisMonth, consultations: earningsData.totalConsultations },
  ];

  const consultationTypes = [
    { type: 'Online Consultation', amount: Math.round(earningsData.thisMonth * 0.65), count: Math.round(earningsData.totalConsultations * 0.6), color: 'bg-blue-500' },
    { type: 'Physical Consultation', amount: Math.round(earningsData.thisMonth * 0.35), count: Math.round(earningsData.totalConsultations * 0.4), color: 'bg-green-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Reports</h1>
          <p className="text-gray-600 mt-1">Track your consultation earnings and financial performance</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {earningsCards.map((card, index) => (
          <div key={index} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900">
                        LKR {card.amount.toLocaleString()}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        card.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {card.change >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {card.changePercent}%
                      </div>
                    </dd>
                    <dd className="text-xs text-gray-400 mt-1">
                      {card.change >= 0 ? '+' : ''}LKR {Math.abs(card.change).toLocaleString()} from last period
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Monthly Earnings</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-700 w-8">{month.month}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(month.earnings / Math.max(...monthlyData.map(m => m.earnings))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">LKR {month.earnings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{month.consultations} consultations</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Consultation Types Breakdown */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Consultation Types</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {consultationTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${type.color}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{type.type}</p>
                      <p className="text-xs text-gray-500">{type.count} consultations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">LKR {type.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {((type.amount / earningsData.thisMonth) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Wallet className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                LKR {(earningsData.thisMonth - earningsData.pendingPayments).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Received This Month</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <CreditCard className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                LKR {earningsData.pendingPayments.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Pending Payments</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {earningsData.paidConsultations}
              </div>
              <div className="text-sm text-gray-600">Completed Consultations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              View All
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Online Consultation - Patient #{index + 1}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(Date.now() - index * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">
                  +LKR {(1500 + index * 200).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorEarnings;