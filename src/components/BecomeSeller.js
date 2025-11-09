import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, db } from '../Firebase';
import { collection, addDoc } from 'firebase/firestore';
import { FaStore, FaArrowLeft } from 'react-icons/fa';

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    contactEmail: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.storeName || !formData.storeDescription || !formData.contactEmail) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      await addDoc(collection(db, 'stores'), {
        ...formData,
        owner: auth.currentUser.uid,
      });
      setError('');
      setSuccess('Your seller application has been submitted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      setError(err.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-500/20 rounded-full mix-blend-overlay blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-overlay blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col max-w-3xl mx-auto mt-6 p-6 bg-gray-800/30 rounded-2xl shadow-xl border border-gray-700/50"
      >
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">Set Up Your Store</h3>
          <p className="text-gray-200 text-base mb-6 leading-relaxed">
            Fill out the details below to start your journey as a seller. Create a unique store identity and reach customers worldwide!
          </p>
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="p-4 mb-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            variants={itemVariants}
            className="p-4 mb-4 bg-green-500/20 text-green-400 rounded-xl border border-green-500/50"
          >
            {success}
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          variants={itemVariants}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="storeName" className="block text-gray-200 font-semibold mb-2">
              Store Name
            </label>
            <input
              type="text"
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Enter your store name"
              required
            />
          </div>
          <div>
            <label htmlFor="storeDescription" className="block text-gray-200 font-semibold mb-2">
              Store Description
            </label>
            <textarea
              id="storeDescription"
              name="storeDescription"
              value={formData.storeDescription}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Describe your store"
              rows="4"
              required
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-gray-200 font-semibold mb-2">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Enter your contact email"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-200 font-semibold mb-2">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Enter your phone number"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(234, 179, 8, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className="py-2.5 px-6 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 mt-4"
          >
            Submit Application
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default BecomeSeller;