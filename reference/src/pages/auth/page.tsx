import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { Link } from 'react-router-dom';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/account';
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignIn) {
        // Sign In validation
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        if (!validateEmail(email)) {
          throw new Error('Please enter a valid email address');
        }
        
        await login(email, password);
        navigate(returnUrl);
      } else {
        // Sign Up validation
        if (!name || !email || !password || !confirmPassword) {
          throw new Error('Please fill in all fields');
        }
        if (!validateEmail(email)) {
          throw new Error('Please enter a valid email address');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        await signup(name, email, password);
        navigate(returnUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignIn(!isSignIn);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12 mt-20">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-green-700 hover:text-white text-gray-700 text-sm font-semibold rounded-md transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-arrow-left-line"></i>
              </div>
              Back to Home
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Tab Switcher */}
            <div className="flex mb-8 bg-gray-100 rounded-full p-1">
              <button
                type="button"
                onClick={() => setIsSignIn(true)}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  isSignIn
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignIn(false)}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  !isSignIn
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              {isSignIn ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-gray-600 text-sm text-center mb-6">
              {isSignIn
                ? 'Sign in to access your account'
                : 'Join us to start shopping'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Sign Up Only) */}
              {!isSignIn && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    placeholder="John Doe"
                    required={!isSignIn}
                  />
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm pr-10"
                    placeholder={isSignIn ? 'Enter your password' : 'Min. 8 characters'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <i className={`ri-${showPassword ? 'eye-off' : 'eye'}-line text-lg`}></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {!isSignIn && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm pr-10"
                      placeholder="Re-enter your password"
                      required={!isSignIn}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <i className={`ri-${showConfirmPassword ? 'eye-off' : 'eye'}-line text-lg`}></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot Password (Sign In Only) */}
              {isSignIn && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i>
                    Processing...
                  </span>
                ) : (
                  <>{isSignIn ? 'Sign In' : 'Create Account'}</>
                )}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {isSignIn ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={switchMode}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {isSignIn ? 'Create one' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}