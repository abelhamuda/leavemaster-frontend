import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Building2, ArrowRight, Smartphone } from 'lucide-react';
import { authAPI } from '../services/api';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.employee));
      onLogin(data.employee);
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAccount = (email, password) => {
    setCredentials({ email, password });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md lg:max-w-4xl xl:max-w-6xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Branding (Hidden on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:block text-center lg:text-left"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto lg:mx-0 mb-6"
              >
                <Building2 className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                LeaveMaster
                <span className="block text-lg xl:text-xl font-normal text-gray-600 mt-2">
                  Employee Leave Management System
                </span>
              </h1>
              
              <div className="space-y-4 mt-8">
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Streamlined leave requests</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Real-time approval workflow</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Enterprise-grade security</span>
                </div>
              </div>

              {/* Mobile indicator */}
              <div className="flex items-center justify-center lg:justify-start space-x-2 mt-8 text-gray-500">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">Fully responsive design</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Login Form */}
          <div className="w-full">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Building2 className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">LeaveMaster</h1>
              <p className="text-gray-600 text-sm">Employee Leave Management</p>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 lg:p-10">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Welcome back
                </h2>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                  Sign in to your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs sm:text-sm">!</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-red-800 text-xs sm:text-sm font-medium">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                      required
                      className="block w-full pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      required
                      className="block w-full pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Test Accounts */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <p className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">
                  🚀 Quick Test Access
                </p>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTestAccount('manager@company.com', 'password')}
                    className="flex-1 bg-gray-100 text-gray-900 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
                  >
                    👨‍💼 Manager
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTestAccount('employee@company.com', 'password')}
                    className="flex-1 bg-gray-100 text-gray-900 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
                  >
                    👩‍💻 Employee
                  </motion.button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="mt-4 sm:mt-6 text-center">
                <button className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium">
                  Forgot your password?
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 sm:mt-6">
              <p className="text-xs text-gray-500">
                Secure enterprise authentication system
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;