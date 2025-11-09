import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from "../Firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import {
  FaArrowLeft,
  FaExclamationCircle,
  FaFileDownload,
  FaMoneyBillWave,
  FaImage,
  FaUser,
  FaPhone,
} from "react-icons/fa";

const ProductDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
  });
  const [formValid, setFormValid] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState({
    price: null,
    tierName: null,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "NEOWEALTH-products", id));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
        } else {
          setError("Product not found.");
        }

        // Log affiliate click if 'aff' parameter exists
        const params = new URLSearchParams(location.search);
        const affiliateId = params.get("aff");
        if (affiliateId) {
          await addDoc(collection(db, "affiliateClicks"), {
            productId: id,
            affiliateId,
            timestamp: Timestamp.fromDate(new Date()),
          });
        }
      } catch (err) {
        setError("Failed to fetch product: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, location.search]);

  // Validate user info
  const validateUserInfo = () => {
    const isNameValid = userInfo.name.trim() !== "";
    const isEmailValid =
      userInfo.email.trim() && /\S+@\S+\.\S+/.test(userInfo.email);
    const isPhoneValid =
      userInfo.phone.trim() && /^\+233\d{9}$/.test(userInfo.phone); // Stricter for Ghana
    const isValid = isNameValid && isEmailValid && isPhoneValid;
    setFormValid(isValid);
    if (!isValid) {
      if (!isNameValid) setError("Name is required.");
      else if (!isEmailValid) setError("Valid email is required.");
      else if (!isPhoneValid)
        setError("Valid Ghana phone number (+233) is required.");
    } else {
      setError("");
    }
  };

  // Update form validation on input change
  useEffect(() => {
    validateUserInfo();
  }, [userInfo]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Paystack payment with user info
  const handlePaystackPayment = (paymentUserInfo, price, tierName = null) => {
    if (!price) {
      setPaymentStatus("Error: Price not available.");
      return;
    }

    const params = new URLSearchParams(location.search);
    const affiliateId = user?.uid || params.get("aff"); // Prefer user.uid for affiliateId

    const handler = window.PaystackPop.setup({
      key: "pk_test_d3834e4345d6c4535860bde88c00b25760e86fb1", // Replace with your Paystack public key
      email: paymentUserInfo.email, // Use collected email
      amount: price * 100, // Convert to pesewas (for GHS)
      currency: "GHS", // Use GHS as specified
      ref: `NEOWEALTH_${id}_${tierName ? tierName + "_" : ""}${Date.now()}`, // Unique reference with tier name if applicable
      callback: function (response) {
        if (response.status === "success") {
          setPaymentStatus(
            `Payment successful!`
          );
          // Log payment to NEOWEALTH-sales with user info
          const paymentData = {
            productId: id,
            userId: user?.uid || "anonymous",
            name: paymentUserInfo.name,
            email: paymentUserInfo.email,
            phone: paymentUserInfo.phone,
            amount: price,
            currency: "GHS",
            tierName: tierName || null,
            reference: response.reference,
            timestamp: Timestamp.fromDate(new Date()),
          };
          addDoc(collection(db, "NEOWEALTH-sales"), paymentData);

          // Log to affiliate-conversions if affiliateId exists
          if (affiliateId) {
            addDoc(collection(db, "affiliate-conversions"), {
              productId: id,
              affiliateId,
              commission: product?.commission || 20,
              timestamp: Timestamp.fromDate(new Date()),
            });
          }
        } else {
          setPaymentStatus("Payment failed. Please try again.");
        }
      },
      onClose: function () {
        setPaymentStatus("Payment cancelled.");
      },
    });
    handler.openIframe();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-yellow-400 text-xl font-semibold"
        >
          Loading product...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 w-full">
        {product?.coverImageUrl ? (
          <img
            src={product.coverImageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover rounded-b-2xl shadow-lg"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-b-2xl">
            <FaImage className="text-5xl text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-b-2xl" />
        <div className="absolute top-4 left-4">
          <motion.button
            onClick={() => navigate("/dashboard")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full shadow-lg transition-all duration-300"
            aria-label="Back to dashboard"
          >
            <FaArrowLeft /> Back
          </motion.button>
        </div>
        <div className="absolute bottom-6 left-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md">
            {product?.name}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
      >
        {error && (
          <motion.div
            variants={itemVariants}
            className="p-4 mb-6 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center gap-2"
          >
            <FaExclamationCircle className="text-2xl" />
            {error}
          </motion.div>
        )}

        {paymentStatus && (
          <motion.div
            variants={itemVariants}
            className={`p-4 mb-6 rounded-xl border flex items-center gap-2 ${
              paymentStatus.includes("successful")
                ? "bg-green-500/20 text-green-400 border-green-500/50"
                : "bg-red-500/20 text-red-400 border-red-500/50"
            }`}
          >
            <FaExclamationCircle className="text-2xl" />
            {paymentStatus}
          </motion.div>
        )}

        {product && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700/50">
            {/* Product Details */}
            <div className="space-y-6">
              <motion.p
                variants={itemVariants}
                className="text-lg text-gray-300 leading-relaxed"
              >
                {product.description}
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-4 items-center text-lg"
              >
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold rounded-full shadow-md">
                  {product.price} GHS
                </span>
                <span className="px-4 py-2 bg-gray-700/70 rounded-full text-sm uppercase tracking-wide">
                  {product.type.replace("_", " ")}
                </span>
              </motion.div>
              {/* Additional Fields */}
              <motion.div variants={itemVariants} className="space-y-2">
                {product.type === "event" && product.eventDate && (
                  <p className="text-lg text-gray-200">
                    Event Date:{" "}
                    <span className="font-semibold text-yellow-400">
                      {new Date(product.eventDate).toLocaleString()}
                    </span>
                  </p>
                )}
                <p className="text-lg text-gray-200">
                  Commission:{" "}
                  <span className="font-semibold text-yellow-400">
                    {product.commission || 20}%
                  </span>
                </p>
                <p className="text-lg text-gray-200">
                  Store ID:{" "}
                  <span className="font-semibold text-yellow-400">
                    {product.storeId}
                  </span>
                </p>
                <p className="text-lg text-gray-200">
                  Owner:{" "}
                  <span className="font-semibold text-yellow-400">
                    {product.owner}
                  </span>
                </p>
              </motion.div>
              {/* User Info Form */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h3 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                  <FaUser /> Buyer Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaUser /> Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userInfo.name}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaUser /> Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <FaPhone /> Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    placeholder="+233 123 456 789"
                    required
                  />
                </div>
              </motion.div>
              {/* Content URL for Ebook/Video Course */}
              {(product.type === "ebook" || product.type === "video_course") &&
                product.contentUrl && (
                  <motion.a
                    variants={itemVariants}
                    href={product.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-blue-400 to-blue-500 text-gray-900 font-semibold rounded-full shadow-lg hover:scale-105 transition-all duration-300"
                    aria-label="View or download content"
                  >
                    <FaFileDownload /> View / Download Content
                  </motion.a>
                )}
              {/* Purchase Button for Non-Event Products or Events without Tiers */}
              {product.link &&
                (product.type !== "event" ||
                  !product.ticketTiers ||
                  product.ticketTiers.length === 0) && (
                  <motion.button
                    variants={itemVariants}
                    onClick={() => {
                      setSelectedPurchase({
                        price: product.price,
                        tierName: null,
                      });
                      handlePaystackPayment(userInfo, product.price, null);
                    }}
                    disabled={!formValid}
                    whileHover={{
                      scale: formValid ? 1.05 : 1,
                      boxShadow: formValid
                        ? "0 0 15px rgba(234,179,8,0.5)"
                        : "none",
                    }}
                    whileTap={{ scale: formValid ? 0.95 : 1 }}
                    className={`inline-flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 ${
                      !formValid ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-label="Purchase product"
                  >
                    <FaMoneyBillWave /> Purchase Now
                  </motion.button>
                )}
            </div>
            {/* Ticket Tiers (for Events) */}
            {product.type === "event" &&
              product.ticketTiers &&
              product.ticketTiers.length > 0 && (
                <motion.div variants={itemVariants} className="space-y-4">
                  <h4 className="text-xl font-bold text-yellow-400">
                    🎟 Ticket Tiers
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.ticketTiers.map((tier, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{
                          y: -5,
                          boxShadow: "0 0 15px rgba(234,179,8,0.3)",
                        }}
                        className="p-4 bg-gray-700/50 rounded-xl border border-gray-600/50"
                      >
                        <p className="text-lg font-semibold text-white">
                          {tier.name}
                        </p>
                        <p className="text-gray-300">{tier.price} GHS</p>
                        <p className="text-gray-400">
                          Available: {tier.quantity}
                        </p>
                        <motion.button
                          variants={itemVariants}
                          onClick={() => {
                            setSelectedPurchase({
                              price: tier.price,
                              tierName: tier.name,
                            });
                            handlePaystackPayment(
                              userInfo,
                              tier.price,
                              tier.name
                            );
                          }}
                          disabled={!formValid}
                          whileHover={{
                            scale: formValid ? 1.05 : 1,
                            boxShadow: formValid
                              ? "0 0 15px rgba(234,179,8,0.5)"
                              : "none",
                          }}
                          whileTap={{ scale: formValid ? 0.95 : 1 }}
                          className={`mt-3 inline-flex items-center gap-2 py-2 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 w-full justify-center ${
                            !formValid ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          aria-label={`Purchase ${tier.name} ticket`}
                        >
                          <FaMoneyBillWave /> Purchase {tier.name}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductDetails;
