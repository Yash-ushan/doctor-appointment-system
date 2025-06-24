import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  User, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  Stethoscope,
  Shield
} from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">
              Medi<span className="text-blue-600">Link</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition"
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            
            {/* Hide "Find Doctors" for doctors and admins */}
            {(!isAuthenticated || (user?.role !== 'doctor' && user?.role !== 'admin')) && (
              <Link 
                to="/doctors" 
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Find Doctors
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition"
                >
                  {user?.role === 'admin' ? <Shield size={18} /> : <Calendar size={18} />}
                  <span>Dashboard</span>
                </Link>
                
                {/* Hide "Appointments" for doctors and admins */}
                {(user?.role !== 'doctor' && user?.role !== 'admin') && (
                  <Link 
                    to="/appointments" 
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    Appointments
                  </Link>
                )}
                
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition">
                    <User size={18} />
                    <span>{user?.name}</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="inline mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-600"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
              
              {/* Hide "Find Doctors" for doctors and admins in mobile menu */}
              {(!isAuthenticated || (user?.role !== 'doctor' && user?.role !== 'admin')) && (
                <Link 
                  to="/doctors" 
                  className="text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Doctors
                </Link>
              )}

              {isAuthenticated ? (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    className="flex items-center space-x-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar size={18} />
                    <span>Dashboard</span>
                  </Link>
                  
                  {/* Hide "Appointments" for doctors and admins in mobile menu */}
                  {(user?.role !== 'doctor' && user?.role !== 'admin') && (
                    <Link 
                      to="/appointments" 
                      className="text-gray-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Appointments
                    </Link>
                  )}
                  
                  <Link 
                    to="/profile" 
                    className="text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 text-left"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-4">
                  <Link 
                    to="/login" 
                    className="text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;