import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExclamationCircle, FaLink } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Firebase";

const ReferralLinks = ({ user }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [referralLinks, setReferralLinks] = useState([]);
  const [isCopied, setIsCopied] = useState({});

  useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, "NEOWEALTH-referrals"),
          where("affiliateId", "==", user.uid)
        );
        const snap = await getDocs(q);
        setReferralLinks(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        setError("Failed to fetch referral links: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReferrals();
  }, [user.uid]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-700/50">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4">
        Referral Links
      </h3>
      {isLoading ? (
        <p className="text-gray-200 text-base animate-pulse">
          Loading referral links...
        </p>
      ) : error ? (
        <motion.div
          variants={itemVariants}
          className="p-4 mb-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center"
        >
          <FaExclamationCircle className="mr-2 text-xl" />
          {error}
        </motion.div>
      ) : (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-2.5 px-6 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 mb-6 text-base"
            onClick={() => navigate("/create-referral")}
            aria-label="Generate New Referral Link"
          >
            Generate New Referral Link
          </motion.button>
          <div className="grid grid-cols-1 gap-4">
            {referralLinks.length === 0 ? (
              <p className="text-gray-200 text-base">
                No referral links available.
              </p>
            ) : (
              referralLinks.map((link) => (
                <motion.div
                  key={link.id}
                  variants={itemVariants}
                  className="p-4 bg-gray-700/80 rounded-xl border border-gray-600/50"
                >
                  <p className="text-gray-200 text-base mb-2">{link.url}</p>
                  <p className="text-gray-300 text-sm mb-2">
                    Clicks: {link.clicks || 0}
                  </p>
                  <motion.button
                    onClick={() => {
                      navigator.clipboard.writeText(link.url);
                      setIsCopied((prev) => ({
                        ...prev,
                        [link.id]: true,
                      }));
                      setTimeout(
                        () =>
                          setIsCopied((prev) => ({
                            ...prev,
                            [link.id]: false,
                          })),
                        2000
                      );
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-4 bg-green-400 text-gray-900 font-semibold rounded-full shadow-md transition-all duration-300 text-sm"
                    aria-label={`Copy link for ${link.url}`}
                  >
                    {isCopied[link.id] ? "Copied!" : "Copy Link"}
                  </motion.button>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralLinks;
