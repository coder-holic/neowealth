import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../Firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import {
  FaUsers,
  FaExclamationCircle,
  FaCheckCircle,
  FaCopy,
  FaShareAlt,
  FaTelegramPlane,
  FaTrophy,
  FaInfoCircle,
  FaEnvelope,
} from "react-icons/fa";

const BecomeAffiliate = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [affiliateLink, setAffiliateLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({ sales: 0, earnings: 0 });
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");

  // Check if user is already an affiliate and fetch user stats
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const checkAffiliateStatus = async () => {
      setIsLoading(true);
      try {
        const affiliateDoc = doc(db, "NEOWEALTH-affiliates", user.uid);
        const docSnap = await getDoc(affiliateDoc);
        if (docSnap.exists()) {
          setIsAffiliate(true);
          setAffiliateLink(`${window.location.origin}/affiliate/${user.uid}`);
          setUserStats({
            sales: docSnap.data().sales || 0,
            earnings: docSnap.data().earnings || 0,
          });
        }
      } catch (err) {
        setError("Failed to check affiliate status: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    checkAffiliateStatus();
  }, [user, navigate]);

  // Fetch leaderboard if user is affiliate
  useEffect(() => {
    if (isAffiliate) {
      const fetchLeaderboard = async () => {
        setIsLoadingLeaderboard(true);
        setLeaderboardError("");
        try {
          const q = query(
            collection(db, "NEOWEALTH-affiliates"),
            orderBy("sales", "desc"),
            limit(10)
          );
          const querySnapshot = await getDocs(q);
          const topAffiliates = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            displayName: doc.data().displayName || "Anonymous",
            sales: doc.data().sales || 0,
            earnings: doc.data().earnings || 0,
          }));
          setLeaderboard(topAffiliates);
        } catch (err) {
          setLeaderboardError("Failed to fetch leaderboard: " + err.message);
        } finally {
          setIsLoadingLeaderboard(false);
        }
      };
      fetchLeaderboard();
    }
  }, [isAffiliate]);

  // Handle affiliate signup with modal confirmation
  const handleJoinAffiliate = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const affiliateDoc = doc(db, "NEOWEALTH-affiliates", user.uid);
      await setDoc(affiliateDoc, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || "Anonymous",
        joinedAt: new Date().toISOString(),
        status: "active",
        sales: 0,
        earnings: 0,
      });
      setIsAffiliate(true);
      setAffiliateLink(`${window.location.origin}/affiliate/${user.uid}`);
      setUserStats({ sales: 0, earnings: 0 });
      setSuccess("Successfully joined the affiliate program!");
      setShowModal(false);
    } catch (err) {
      setError("Failed to join affiliate program: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy affiliate link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Share affiliate link (opens native share dialog if available)
  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Affiliate Link",
          text: "Check out this product through my affiliate link!",
          url: affiliateLink,
        });
      } catch (err) {
        setError("Failed to share link: " + err.message);
      }
    } else {
      setError("Sharing not supported on this device.");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black px-2 sm:px-4 lg:px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-40 h-40 sm:w-80 sm:h-80 bg-yellow-500/10 rounded-full mix-blend-overlay blur-3xl opacity-20 sm:opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-80 sm:h-80 bg-purple-500/10 rounded-full mix-blend-overlay blur-3xl opacity-20 sm:opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-1 max-w-4xl mx-auto mt-4 p-4 sm:p-6 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50"
      >
        <div className="w-full space-y-4 sm:space-y-6">
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 sm:gap-3"
          >
            <FaUsers className="text-2xl sm:text-3xl text-yellow-400" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              Affiliate Program
            </h2>
          </motion.div>

          {isLoading ? (
            <motion.p
              variants={itemVariants}
              className="text-gray-200 text-sm sm:text-base animate-pulse"
            >
              Loading...
            </motion.p>
          ) : isAffiliate ? (
            <>
              <motion.div variants={itemVariants}>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400 mb-2 sm:mb-4">
                  Welcome, Affiliate!
                </h3>
                <p className="text-gray-200 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                  Share your unique affiliate link to earn commissions on every
                  sale. Track your earnings in the Payments section of your
                  dashboard.
                </p>
              </motion.div>

              {/* Your Stats */}
              <motion.div
                variants={itemVariants}
                className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50"
              >
                <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">
                  Your Performance Stats
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm sm:text-base text-gray-200">
                  <div>Total Sales: {userStats.sales}</div>
                  <div>Total Earnings: ${userStats.earnings.toFixed(2)}</div>
                </div>
              </motion.div>

              {/* Affiliate Link Section */}
              <motion.div
                variants={itemVariants}
                className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50 relative"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">
                  Your Affiliate Link
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <input
                    type="text"
                    value={affiliateLink}
                    readOnly
                    className="w-full p-2 bg-gray-900/50 text-gray-200 text-sm sm:text-base rounded-lg border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    aria-label="Your affiliate link"
                  />
                  <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <motion.button
                      onClick={handleCopyLink}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 sm:flex-none py-2 px-4 bg-green-400 text-gray-900 font-semibold rounded-full shadow-md transition-all duration-300 text-sm flex items-center justify-center gap-2 min-h-[44px]"
                      aria-label="Copy affiliate link"
                    >
                      <FaCopy />
                      {isCopied ? "Copied!" : "Copy"}
                    </motion.button>
                    <motion.button
                      onClick={handleShareLink}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 sm:flex-none py-2 px-4 bg-blue-400 text-gray-900 font-semibold rounded-full shadow-md transition-all duration-300 text-sm flex items-center justify-center gap-2 min-h-[44px]"
                      aria-label="Share affiliate link"
                    >
                      <FaShareAlt />
                      Share
                    </motion.button>
                  </div>
                </div>
                <AnimatePresence>
                  {tooltipVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 p-2 bg-gray-800/90 text-gray-200 text-xs sm:text-sm rounded-lg shadow-lg border border-gray-700/50 max-w-[90%]"
                    >
                      Use this link to promote products and earn commissions!
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Join Telegram Group */}
              <motion.div
                variants={itemVariants}
                className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50"
              >
                <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">
                  Mentorship Community
                </h4>
                <p className="text-gray-200 text-sm sm:text-base mb-3">
                  Join our Telegram group for mentorship, tips, and discussions
                  with other affiliates.
                </p>
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
                  Join Telegram Group
                </motion.a>
              </motion.div>

              {/* Affiliate Leaderboard */}
              <motion.div
                variants={itemVariants}
                className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50"
              >
                <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <FaTrophy /> Affiliate Leaderboard
                </h4>
                {isLoadingLeaderboard ? (
                  <p className="text-gray-200 text-sm sm:text-base animate-pulse">
                    Loading leaderboard...
                  </p>
                ) : leaderboardError ? (
                  <div className="text-red-400 text-sm sm:text-base flex items-center">
                    <FaExclamationCircle className="mr-2" />
                    {leaderboardError}
                  </div>
                ) : leaderboard.length === 0 ? (
                  <p className="text-gray-200 text-sm sm:text-base">
                    No data available yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm sm:text-base text-gray-200">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="py-2 text-left">Rank</th>
                          <th className="py-2 text-left">Affiliate</th>
                          <th className="py-2 text-right">Sales</th>
                          <th className="py-2 text-right">Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((aff, index) => (
                          <tr
                            key={aff.id}
                            className="border-b border-gray-600/50"
                          >
                            <td className="py-2">{index + 1}</td>
                            <td className="py-2">{aff.displayName}</td>
                            <td className="py-2 text-right">{aff.sales}</td>
                            <td className="py-2 text-right">
                              ${aff.earnings.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>

              {/* Resources Section */}
              <motion.div
                variants={itemVariants}
                className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50"
              >
                <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <FaInfoCircle /> Resources
                </h4>
                <ul className="space-y-2 text-sm sm:text-base text-gray-200">
                  <li>
                    <a
                      href="/resources/tips"
                      className="text-blue-400 hover:underline"
                    >
                      Affiliate Marketing Tips
                    </a>
                  </li>
                  <li>
                    <a
                      href="/resources/banners"
                      className="text-blue-400 hover:underline"
                    >
                      Download Promotional Banners
                    </a>
                  </li>
                  <li>
                    <a
                      href="/resources/guides"
                      className="text-blue-400 hover:underline"
                    >
                      Beginner's Guide to Affiliates
                    </a>
                  </li>
                </ul>
              </motion.div>

              {/* Support Contact */}
              <motion.div
                variants={itemVariants}
                className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50"
              >
                <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <FaEnvelope /> Support
                </h4>
                <p className="text-gray-200 text-sm sm:text-base mb-3">
                  Need help? Contact our support team.
                </p>
                <motion.a
                  href="mailto:support@NEOWEALTH.com"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto py-2 px-4 bg-purple-500 text-white font-semibold rounded-full shadow-md transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 min-h-[44px]"
                  aria-label="Contact Support"
                >
                  <FaEnvelope />
                  Contact Support
                </motion.a>
              </motion.div>

              {success && (
                <motion.div
                  variants={itemVariants}
                  className="p-3 sm:p-4 bg-green-500/20 text-green-400 rounded-xl border border-green-500/50 flex items-center text-sm sm:text-base"
                >
                  <FaCheckCircle className="mr-2 text-lg sm:text-xl" />
                  {success}
                </motion.div>
              )}
            </>
          ) : (
            <>
              <motion.div variants={itemVariants}>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400 mb-2 sm:mb-4">
                  Join Our Affiliate Program
                </h3>
                <p className="text-gray-200 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                  Earn commissions by promoting products you love. Share your
                  unique links with your audience and track your earnings in
                  real-time. No upfront costs, just sign up and start sharing!
                </p>
              </motion.div>
              {error && (
                <motion.div
                  variants={itemVariants}
                  className="p-3 sm:p-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center text-sm sm:text-base"
                >
                  <FaExclamationCircle className="mr-2 text-lg sm:text-xl" />
                  {error}
                </motion.div>
              )}
              <motion.button
                variants={itemVariants}
                onClick={() => setShowModal(true)}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto py-2.5 px-6 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                disabled={isLoading}
                aria-label="Join Affiliate Program"
              >
                {isLoading ? "Joining..." : "Join Now"}
              </motion.button>
            </>
          )}
        </div>
      </motion.main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2 sm:px-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              variants={modalVariants}
              className="p-4 sm:p-6 bg-gray-800/90 rounded-2xl shadow-xl border border-gray-700/50 w-full max-w-[90vw] sm:max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-2 sm:mb-4">
                Confirm Join
              </h3>
              <p className="text-gray-200 text-sm sm:text-base mb-4 sm:mb-6">
                Are you sure you want to join the affiliate program? You'll
                receive a unique link to share.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-gray-600 text-gray-200 rounded-full text-sm sm:text-base min-h-[44px]"
                  onClick={() => setShowModal(false)}
                  aria-label="Cancel"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-yellow-400 text-gray-900 rounded-full font-semibold text-sm sm:text-base min-h-[44px]"
                  onClick={handleJoinAffiliate}
                  disabled={isLoading}
                  aria-label="Confirm Join"
                >
                  {isLoading ? "Joining..." : "Confirm"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BecomeAffiliate;
