import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../Firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { BiUserCircle } from "react-icons/bi";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTrophy,
  FaTwitter,
  FaLinkedin,
  FaLock,
  FaTelegramPlane,
} from "react-icons/fa";

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "User",
    email: user?.email || "No email provided",
    bio: "",
    socialLinks: { twitter: "", linkedin: "" },
    joinDate: "",
    lastLogin: "",
    achievements: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user profile data from Firestore
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const userDoc = doc(db, "NEOWEALTHusers", user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setProfileData({
            displayName: user.displayName || "User",
            email: user.email || "No email provided",
            bio: docSnap.data().bio || "",
            socialLinks: docSnap.data().socialLinks || {
              twitter: "",
              linkedin: "",
            },
            joinDate: docSnap.data().joinDate || "",
            lastLogin: docSnap.data().lastLogin || "",
            achievements: docSnap.data().achievements || [],
          });
        }
      } catch (err) {
        setError("Failed to fetch profile: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user, navigate]);

  // Handle profile updates
  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
      });

      // Update Firestore profile
      const userDoc = doc(db, "NEOWEALTHusers", user.uid);
      await setDoc(
        userDoc,
        {
          bio: profileData.bio,
          socialLinks: profileData.socialLinks,
          joinDate: profileData.joinDate || new Date().toISOString(),
          lastLogin: profileData.lastLogin || new Date().toISOString(),
          achievements: profileData.achievements,
        },
        { merge: true }
      );

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await sendPasswordResetEmail(auth, user.email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Failed to send password reset email: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-700/50"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <BiUserCircle className="text-2xl sm:text-3xl text-yellow-400" />
        <h3 className="text-xl sm:text-2xl font-bold text-yellow-400">
          Profile
        </h3>
      </div>

      {isLoading ? (
        <motion.p
          variants={itemVariants}
          className="text-gray-200 text-sm sm:text-base animate-pulse"
        >
          Loading...
        </motion.p>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Profile Card */}
          <motion.div
            variants={itemVariants}
            className="p-4 sm:p-6 bg-gray-700/80 rounded-xl border border-gray-600/50"
          >
            <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">
              Personal Information
            </h4>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <BiUserCircle className="w-20 h-20 sm:w-24 sm:h-24 text-yellow-400" />
              <div className="flex-1 space-y-2 sm:space-y-3">
                <div>
                  <label className="text-sm sm:text-base text-gray-200">
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      className="w-full p-2 bg-gray-900/50 text-gray-200 text-sm sm:text-base rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      aria-label="Edit name"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-200">
                      {profileData.displayName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm sm:text-base text-gray-200">
                    Email
                  </label>
                  <p className="text-sm sm:text-base text-gray-200">
                    {profileData.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm sm:text-base text-gray-200">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      className="w-full p-2 bg-gray-900/50 text-gray-200 text-sm sm:text-base rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      rows="3"
                      aria-label="Edit bio"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-200">
                      {profileData.bio || "No bio provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div
            variants={itemVariants}
            className="p-4 sm:p-6 bg-gray-700/80 rounded-xl border border-gray-600/50"
          >
            <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">
              Social Links
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="text-sm sm:text-base text-gray-200 flex items-center gap-2">
                  <FaTwitter /> Twitter
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.socialLinks.twitter}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          twitter: e.target.value,
                        },
                      }))
                    }
                    className="w-full p-2 bg-gray-900/50 text-gray-200 text-sm sm:text-base rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label="Edit Twitter link"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-200">
                    {profileData.socialLinks.twitter ? (
                      <a
                        href={profileData.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {profileData.socialLinks.twitter}
                      </a>
                    ) : (
                      "No Twitter link provided"
                    )}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm sm:text-base text-gray-200 flex items-center gap-2">
                  <FaLinkedin /> LinkedIn
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.socialLinks.linkedin}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          linkedin: e.target.value,
                        },
                      }))
                    }
                    className="w-full p-2 bg-gray-900/50 text-gray-200 text-sm sm:text-base rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label="Edit LinkedIn link"
                  />
                ) : (
                  <p className="text-sm sm:text-base text-gray-200">
                    {profileData.socialLinks.linkedin ? (
                      <a
                        href={profileData.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {profileData.socialLinks.linkedin}
                      </a>
                    ) : (
                      "No LinkedIn link provided"
                    )}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            variants={itemVariants}
            className="p-4 sm:p-6 bg-gray-700/80 rounded-xl border border-gray-600/50"
          >
            <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">
              Account Settings
            </h4>
            <div className="space-y-2 sm:space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePasswordReset}
                className="w-full sm:w-auto py-2 px-4 bg-purple-500 text-white font-semibold rounded-full shadow-md transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 min-h-[44px]"
                disabled={isLoading}
                aria-label="Reset Password"
              >
                <FaLock />
                Reset Password
              </motion.button>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            variants={itemVariants}
            className="p-4 sm:p-6 bg-gray-700/80 rounded-xl border border-gray-600/50"
          >
            <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <FaTrophy /> Achievements
            </h4>
            {profileData.achievements.length === 0 ? (
              <p className="text-sm sm:text-base text-gray-200">
                No achievements earned yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {profileData.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-600/50 rounded-lg"
                  >
                    <FaTrophy className="text-yellow-400" />
                    <div>
                      <p className="text-sm sm:text-base text-gray-200 font-semibold">
                        {achievement.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Earned on{" "}
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-2 sm:gap-3"
          >
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto py-2 px-4 bg-gray-600 text-gray-200 rounded-full text-sm sm:text-base min-h-[44px]"
                  aria-label="Cancel Editing"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveProfile}
                  className="w-full sm:w-auto py-2 px-4 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-md transition-all duration-300 text-sm sm:text-base min-h-[44px]"
                  disabled={isLoading}
                  aria-label="Save Profile"
                >
                  {isLoading ? "Saving..." : "Save Profile"}
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto py-2 px-4 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-md transition-all duration-300 text-sm sm:text-base min-h-[44px]"
                aria-label="Edit Profile"
              >
                Edit Profile
              </motion.button>
            )}
            <motion.a
              href="https://t.me/your_affiliate_group"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto py-2 px-4 bg-blue-500 text-white font-semibold rounded-full shadow-md transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 min-h-[44px]"
              aria-label="Join Telegram Group"
            >
              <FaTelegramPlane />
              Join Telegram Community
            </motion.a>
          </motion.div>

          {/* Feedback Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-3 sm:p-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center text-sm sm:text-base"
              >
                <FaExclamationCircle className="mr-2 text-lg sm:text-xl" />
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-3 sm:p-4 bg-green-500/20 text-green-400 rounded-xl border border-green-500/50 flex items-center text-sm sm:text-base"
              >
                <FaCheckCircle className="mr-2 text-lg sm:text-xl" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default Profile;
