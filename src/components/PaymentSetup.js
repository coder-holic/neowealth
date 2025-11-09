import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaCreditCard,
  FaMobileAlt,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaWallet,
  FaExclamationTriangle,
  FaMoneyBillWave,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../Firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

// LoadingSpinner component
const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <motion.div
        className="w-16 h-16 border-4 border-t-yellow-400 border-gray-700 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        aria-label="Loading"
      />
    </div>
  );
};

// ConfirmationModal component
const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700/50 max-w-sm w-full"
          >
            <p className="text-gray-200 mb-4">{message}</p>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onConfirm}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-xl"
                aria-label="Confirm Deletion"
              >
                Confirm
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="flex-1 py-2 px-4 bg-gray-600 text-gray-200 rounded-xl"
                aria-label="Cancel Deletion"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PaymentSetup = ({ sellerData, affiliateData }) => {
  const user = auth.currentUser;
  const navigate = useNavigate();

  // ✅ FIXED: FORCE SHOW UI - NO LOADING STATES!
  const [forceShowUI, setForceShowUI] = useState(true);

  // ✅ SAFE DATA - IGNORE STUCK LOADING
  const totalRevenue = sellerData?.totalRevenue || 0;
  const totalEarnings = affiliateData?.totalEarnings || 0;
  const availableForCashout = totalRevenue + totalEarnings;

  const [userData, setUserData] = useState({
    firstName: "User",
    lastName: "",
    email: user?.email || "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePaymentId, setDeletePaymentId] = useState(null);

  // ✅ SIMPLE FETCH - NO LOADING STATES
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "NEOWEALTHusers", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    // Fetch payments
    const fetchPayments = async () => {
      try {
        const q = query(
          collection(db, "paymentMethods"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const payments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaymentMethods(payments);
      } catch (err) {
        console.error("Payment fetch error:", err);
      }
    };

    fetchUserData();
    fetchPayments();
  }, [user, navigate]);

  // ✅ DEBUG LOG - SHOWS IMMEDIATELY
  console.log("💰 PaymentSetup LOADED:", {
    availableForCashout,
    totalRevenue,
    totalEarnings,
    paymentMethods: paymentMethods.length,
  });

  const onSubmit = async (data) => {
    if (!user) {
      toast.error("No authenticated user. Please log in.", { theme: "dark" });
      return;
    }
    if (!editingPaymentId && paymentMethods.length > 0) {
      toast.error("You can only add one payment method.", { theme: "dark" });
      return;
    }
    setIsSubmitting(true);
    try {
      const paymentDocId = editingPaymentId || Date.now().toString();
      await setDoc(doc(db, "paymentMethods", paymentDocId), {
        userId: user.uid,
        paymentMethod,
        ...data,
        createdAt: editingPaymentId
          ? paymentMethods.find((p) => p.id === editingPaymentId).createdAt
          : new Date(),
        lastUpdatedAt: new Date(),
        isVerified: false,
      });
      reset();
      setPaymentMethod("");
      setEditingPaymentId(null);
      toast.success(
        editingPaymentId
          ? "Payment method updated successfully!"
          : "Payment method added successfully!",
        { theme: "dark" }
      );
      // Refresh payment methods
      const q = query(
        collection(db, "paymentMethods"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      setPaymentMethods(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (err) {
      toast.error(`Failed to save payment method: ${err.message}.`, {
        theme: "dark",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (method) => {
    setPaymentMethod(method.paymentMethod);
    setEditingPaymentId(method.id);
    if (method.paymentMethod === "mobile") {
      setValue("mobileProvider", method.mobileProvider);
      setValue("mobileNumber", method.mobileNumber);
      setValue("mobileAccountHolder", method.mobileAccountHolder);
    } else {
      setValue("bankName", method.bankName);
      setValue("accountHolder", method.accountHolder);
      setValue("accountNumber", method.accountNumber);
      setValue("routingNumber", method.routingNumber);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.error("No authenticated user. Please log in.", { theme: "dark" });
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "paymentMethods", deletePaymentId));
      setPaymentMethods(
        paymentMethods.filter((method) => method.id !== deletePaymentId)
      );
      toast.success("Payment method deleted successfully!", { theme: "dark" });
    } catch (err) {
      toast.error(`Failed to delete payment method: ${err.message}.`, {
        theme: "dark",
      });
    } finally {
      setShowDeleteModal(false);
      setDeletePaymentId(null);
      setIsSubmitting(false);
    }
  };

  // ✅ CASH OUT HANDLER
  const handleCashOut = async () => {
    if (availableForCashout < 50) {
      toast.error("Minimum cashout amount is ₵50", { theme: "dark" });
      return;
    }

    if (paymentMethods.length === 0) {
      toast.warn("Please add a payment method first!", { theme: "dark" });
      return;
    }

    try {
      await setDoc(doc(db, "cashoutRequests", user.uid + Date.now()), {
        userId: user.uid,
        amount: availableForCashout,
        paymentMethod: paymentMethods[0],
        status: "pending",
        createdAt: new Date(),
        totalRevenue,
        totalEarnings,
      });

      toast.success(
        `Cash out of ₵${availableForCashout.toFixed(
          2
        )} requested! Processing in 24-48 hours.`,
        { theme: "dark" }
      );
    } catch (err) {
      toast.error(`Cashout request failed: ${err.message}`, { theme: "dark" });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // ✅ NO LOADING - SHOW UI IMMEDIATELY!
  if (isSubmitting) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-700/50">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* ✅ AVAILABLE BALANCE CARD */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-6 bg-gradient-to-r from-green-600/90 to-blue-600/90 rounded-2xl shadow-xl border border-white/20"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <FaWallet className="text-yellow-300" />
              Available for Cash Out
            </h3>
            <p className="text-green-100 text-sm sm:text-base">
              Total earnings from sales + affiliate commissions
            </p>
          </div>

          <div className="text-right">
            <p className="text-3xl sm:text-4xl font-bold text-white mb-1">
              ₵{availableForCashout.toFixed(2)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-green-200">
              <span>Sales: ₵{totalRevenue.toFixed(2)}</span>
              <span>Affiliate: ₵{totalEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* CASH OUT BUTTON */}
        {availableForCashout >= 50 && (
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 w-full sm:w-auto py-3 px-6 bg-yellow-400 text-gray-900 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-base"
            onClick={handleCashOut}
          >
            <FaMoneyBillWave />
            Request Cash Out (₵{availableForCashout.toFixed(2)})
          </motion.button>
        )}

        {/* MINIMUM BALANCE MESSAGE */}
        {availableForCashout > 0 && availableForCashout < 50 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/50"
          >
            <p className="text-yellow-100 flex items-center gap-2">
              <FaExclamationTriangle />
              Minimum cashout is ₵50. You have ₵{availableForCashout.toFixed(2)}
            </p>
          </motion.div>
        )}

        {/* NO BALANCE MESSAGE */}
        {availableForCashout === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/50"
          >
            <p className="text-yellow-100 flex items-center gap-2">
              <FaExclamationTriangle />
              No funds available for cash out yet.
              <span className="font-semibold">
                Earn from sales or affiliate commissions!
              </span>
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Header with Transaction History Link */}
      <motion.div
        variants={contentVariants}
        className="flex justify-between items-center mb-6"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">
          Payment Setup
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/transactions")}
          className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-full shadow-md flex items-center gap-2 min-h-[44px] text-sm sm:text-base"
          aria-label="View Transaction History"
        >
          <FaHistory />
          Transaction History
        </motion.button>
      </motion.div>

      {/* Saved Payment Methods */}
      <motion.div
        variants={contentVariants}
        className="p-4 sm:p-6 rounded-2xl bg-gray-800/80 shadow-xl border border-gray-700/50 mb-6"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">
          Saved Payment Methods
        </h3>
        {paymentMethods.length === 0 ? (
          <p className="text-gray-200 text-sm sm:text-base">
            No payment methods saved yet. Add one below to receive payments.
          </p>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                className="p-4 rounded-xl bg-gray-700/80 border border-gray-600/50 flex justify-between items-center hover:bg-gray-700/90 transition-all duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  {method.paymentMethod === "mobile" ? (
                    <FaMobileAlt className="text-yellow-400 text-xl" />
                  ) : (
                    <FaCreditCard className="text-yellow-400 text-xl" />
                  )}
                  <div>
                    <p className="text-gray-200 font-semibold text-sm sm:text-base">
                      {method.paymentMethod === "mobile"
                        ? `${
                            method.mobileProvider?.toUpperCase() || "MOBILE"
                          } - ${method.mobileNumber} (${
                            method.mobileAccountHolder
                          })`
                        : `${
                            method.bankName
                          } - Ending in ${method.accountNumber?.slice(-4)}`}
                      {method.isVerified && (
                        <span className="ml-2 text-green-400 flex items-center gap-1 text-sm">
                          <FaCheckCircle /> Verified
                        </span>
                      )}
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      Added on{" "}
                      {new Date(
                        method.createdAt?.toDate?.() || method.createdAt
                      ).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(method)}
                    className="p-2 bg-yellow-400 text-gray-900 rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center"
                    aria-label="Edit Payment Method"
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setDeletePaymentId(method.id);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 bg-red-600 text-white rounded-full min-h-[40px] min-w-[40px] flex items-center justify-center"
                    aria-label="Delete Payment Method"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add/Edit Payment Method */}
      {paymentMethods.length === 0 || editingPaymentId ? (
        <motion.div
          variants={contentVariants}
          className="p-4 sm:p-6 rounded-2xl bg-gray-800/80 shadow-xl border border-gray-700/50"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">
            {editingPaymentId ? "Edit Payment Method" : "Add Payment Method"}
          </h3>

          {paymentMethods.length > 0 && !editingPaymentId ? (
            <p className="text-gray-200 text-sm sm:text-base">
              You can only have one payment method. Edit or delete the existing
              one to add a new one.
            </p>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                  Select Payment Method
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-3 px-4 rounded-xl text-gray-200 font-semibold transition-all duration-300 min-h-[44px] text-sm sm:text-base ${
                      paymentMethod === "mobile"
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-700/80 border border-gray-600/50"
                    }`}
                    onClick={() => {
                      setPaymentMethod("mobile");
                      if (!editingPaymentId) reset();
                    }}
                    disabled={isSubmitting || !user}
                  >
                    <FaMobileAlt className="inline mr-2" /> Mobile Money
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-3 px-4 rounded-xl text-gray-200 font-semibold transition-all duration-300 min-h-[44px] text-sm sm:text-base ${
                      paymentMethod === "bank"
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-gray-700/80 border border-gray-600/50"
                    }`}
                    onClick={() => {
                      setPaymentMethod("bank");
                      if (!editingPaymentId) reset();
                    }}
                    disabled={isSubmitting || !user}
                  >
                    <FaCreditCard className="inline mr-2" /> Bank Account
                  </motion.button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {paymentMethod === "mobile" && (
                  <motion.div
                    key="mobile"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                        Mobile Provider *
                      </label>
                      <select
                        {...register("mobileProvider", {
                          required: "Please select a mobile provider",
                        })}
                        className="w-full p-3 bg-gray-900/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="">Select Provider</option>
                        <option value="mtn">MTN</option>
                        <option value="airtel">Airtel</option>
                        <option value="vodafone">Vodafone</option>
                      </select>
                      {errors.mobileProvider && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.mobileProvider.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                        Mobile Number *
                      </label>
                      <input
                        {...register("mobileNumber", {
                          required: "Mobile number is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Must be 10 digits",
                          },
                        })}
                        type="tel"
                        className="w-full p-3 bg-gray-900/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="e.g. 0241234567"
                      />
                      {errors.mobileNumber && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.mobileNumber.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                        Account Holder Name *
                      </label>
                      <input
                        {...register("mobileAccountHolder", {
                          required: "Account holder name is required",
                        })}
                        type="text"
                        className="w-full p-3 bg-gray-900/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Full Name"
                      />
                      {errors.mobileAccountHolder && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.mobileAccountHolder.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "bank" && (
                  <motion.div
                    key="bank"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                        Bank Name *
                      </label>
                      <input
                        {...register("bankName", {
                          required: "Bank name is required",
                        })}
                        type="text"
                        className="w-full p-3 bg-gray-900/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="e.g. GCB Bank"
                      />
                      {errors.bankName && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.bankName.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                        Account Holder Name *
                      </label>
                      <input
                        {...register("accountHolder", {
                          required: "Account holder name is required",
                        })}
                        type="text"
                        className="w-full p-3 bg-gray-900/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Full Name"
                      />
                      {errors.accountHolder && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.accountHolder.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                        Account Number *
                      </label>
                      <input
                        {...register("accountNumber", {
                          required: "Account number is required",
                          pattern: {
                            value: /^[0-9]{8,12}$/,
                            message: "Must be 8-12 digits",
                          },
                        })}
                        type="text"
                        className="w-full p-3 bg-gray-900/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="e.g. 12345678"
                      />
                      {errors.accountNumber && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.accountNumber.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-200 font-semibold mb-2 text-sm sm:text-base">
                        Routing Number
                      </label>
                      <input
                        {...register("routingNumber")}
                        type="text"
                        className="w-full p-3 bg-gray-900/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Optional"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {paymentMethod && (
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <motion.button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting || !user}
                    className={`flex-1 py-2.5 px-6 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg ${
                      isSubmitting || !user
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmitting ? "Saving..." : "Save Payment Method"}
                  </motion.button>
                </div>
              )}
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={contentVariants}
          className="p-4 sm:p-6 rounded-2xl bg-gray-800/80 shadow-xl border border-gray-700/50"
        >
          <p className="text-gray-200 text-sm sm:text-base">
            You can only have one payment method. Please edit or delete the
            existing one to add a new one.
          </p>
        </motion.div>
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        message="Are you sure you want to delete this payment method?"
      />
    </div>
  );
};

export default PaymentSetup;
