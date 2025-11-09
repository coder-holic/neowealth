import React, { useState } from 'react';
import { BiUser, BiLock } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './Firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import logo from './assets/logo.jpg'; // Adjust path based on your folder structure

const SignupPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Update displayName in Firebase Auth
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });
      // Store user data in Firestore
      await setDoc(doc(db, 'NEOWEALTHusers', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date(),
      });
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setError('Error signing in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-r from-[#040000] to-[#1b1a1a] overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#e59d02] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#8b00ff] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Signup card */}
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

        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#e59d02] mb-6">Create Account</h2>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm text-center mb-4 bg-red-500/10 p-2 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSignup} className="space-y-4 sm:space-y-5">
          {/* First Name input */}
          <div className="flex items-center border border-gray-400 rounded-xl px-3 py-2 bg-white/20 focus-within:border-[#e59d02] focus-within:ring-2 focus-within:ring-[#e59d02] transition-all">
            <BiUser className="text-white text-lg sm:text-xl mr-2 sm:mr-3" />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-300"
            />
          </div>

          {/* Last Name input */}
          <div className="flex items-center border border-gray-400 rounded-xl px-3 py-2 bg-white/20 focus-within:border-[#e59d02] focus-within:ring-2 focus-within:ring-[#e59d02] transition-all">
            <BiUser className="text-white text-lg sm:text-xl mr-2 sm:mr-3" />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-300"
            />
          </div>

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

          {/* Confirm Password input */}
          <div className="flex items-center border border-gray-400 rounded-xl px-3 py-2 bg-white/20 focus-within:border-[#e59d02] focus-within:ring-2 focus-within:ring-[#e59d02] transition-all">
            <BiLock className="text-white text-lg sm:text-xl mr-2 sm:mr-3" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-transparent outline-none w-full text-white text-sm sm:text-base placeholder-gray-300"
            />
          </div>

          {/* Signup button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 sm:py-3 bg-[#e59d02] text-black font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </motion.button>
        </form>

        {/* Back to Login */}
        <motion.button
          onClick={() => navigate('/login')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-4 py-2 sm:py-3 border border-[#e59d02] text-[#e59d02] font-semibold rounded-xl shadow-lg hover:bg-[#e59d02] hover:text-black transition-all"
        >
          Back to Login
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SignupPage;