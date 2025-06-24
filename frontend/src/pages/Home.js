import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Calendar, 
  MessageCircle, 
  Shield, 
  Clock, 
  Users,
  Star,
  ArrowRight 
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Find Doctors',
      description: 'Search and filter doctors by specialty, location, and ratings'
    },
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book appointments online or schedule physical consultations'
    },
    {
      icon: MessageCircle,
      title: 'Online Consultation',
      description: 'Chat with doctors from the comfort of your home'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and kept completely confidential'
    },
    {
      icon: Clock,
      title: '24/7 Available',
      description: 'Access healthcare services anytime, anywhere'
    },
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Connect with verified and experienced healthcare professionals'
    }
  ];

  const stats = [
    { number: '500+', label: 'Verified Doctors' },
    { number: '10,000+', label: 'Happy Patients' },
    { number: '50+', label: 'Hospitals' },
    { number: '4.8', label: 'Average Rating', icon: Star }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Your Health, Our 
            <span className="text-gradient"> Priority</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book appointments with qualified doctors, get online consultations, 
            and manage your healthcare journey all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link 
                to="/doctors" 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center"
              >
                Find Doctors
                <ArrowRight className="ml-2" size={20} />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Get Started
                </Link>
                <Link 
                  to="/doctors" 
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Browse Doctors
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-blue-600">
                    {stat.number}
                  </span>
                  {stat.icon && <stat.icon className="ml-1 text-yellow-400" size={24} />}
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose MediLink?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive healthcare solutions with modern technology 
              and experienced medical professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition card"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who trust MediLink for their healthcare needs.
          </p>
          
          {!isAuthenticated && (
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center"
            >
              Start Your Journey
              <ArrowRight className="ml-2" size={20} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;