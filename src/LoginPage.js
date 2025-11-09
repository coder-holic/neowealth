import React, { useState } from 'react';
import { BiUser, BiLock } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth } from './Firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import logo from './assets/logo.jpg'; // Adjust path based on your folder structure

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? 'Incorrect email/password' : err.message);
      setLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.message);
    }
  };

  // Navigate to Signup Page
  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-r from-[#040000] to-[#1b1a1a] overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#e59d02] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#8b00ff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 md:p-10 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20"
      >
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Platform Logo" className="w-12 h-12 sm:w-16 sm:h-16 logo" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#e59d02] mb-6">Welcome Back</h2>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm text-center mb-4 bg-red-500/10 p-2 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          {/* Email input */}
          <div className="flex items-center border border-gray-400 rounded-xl px-3 py-2 bg-white/20 focus-within:border-[#e59d02] focus-within:ring-2 focus-within:ring-[#e59d02] transition-all">
            <BiUser className="text-white text-lg sm:text-xl mr-2 sm:mr-3" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-300"
            />
          </div>

          {/* Password input */}
          <div className="flex items-center border border-gray-400 rounded-xl px-3 py-2 bg-white/20 focus-within:border-[#e59d02] focus-within:ring-2 focus-within:ring-[#e59d02] transition-all">
            <BiLock className="text-white text-lg sm:text-xl mr-2 sm:mr-3" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-300"
            />
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button
              onClick={handlePasswordReset}
              className="text-xs sm:text-sm text-[#e59d02] hover:underline transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Login button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 sm:py-3 bg-[#e59d02] text-black font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        {/* Signup button */}
        <motion.button
          onClick={handleSignup}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-4 py-2 sm:py-3 border border-[#e59d02] text-[#e59d02] font-semibold rounded-xl shadow-lg hover:bg-[#e59d02] hover:text-black transition-all"
        >
          Sign Up
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LoginPage;