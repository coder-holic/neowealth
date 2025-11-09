import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBell } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Firebase";

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const q = query(
          collection(db, "NEOWEALTH-notifications"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        setNotifications(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        setError("Failed to fetch notifications: " + err.message);
      }
    };
    fetchNotifications();
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
      <h3 className="text-2xl font-bold text-yellow-400 mb-4">Notifications</h3>
      {error ? (
        <motion.div
          variants={itemVariants}
          className="p-4 mb-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center"
        >
          <FaBell className="mr-2 text-xl" />
          {error}
        </motion.div>
      ) : notifications.length === 0 ? (
        <p className="text-gray-200 text-base">No new notifications.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              variants={itemVariants}
              className="p-4 bg-gray-700/80 rounded-xl border border-gray-600/50"
            >
              <p className="text-gray-200 text-base mb-2">
                {notification.message}
              </p>
              <p className="text-gray-400 text-sm">
                {new Date(
                  notification.timestamp?.seconds * 1000
                ).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
