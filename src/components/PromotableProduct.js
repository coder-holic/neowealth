import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "../Firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  FaExclamationCircle,
  FaCopy,
  FaShoppingBag,
  FaPercent,
  FaImage,
} from "react-icons/fa";

const PromotableProducts = ({ user }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedProductId, setCopiedProductId] = useState(null);

  // Fetch promotable products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const querySnapshot = await getDocs(
          collection(db, "NEOWEALTH-products")
        );
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (err) {
        setError("Failed to fetch products: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle copying affiliate link
  const handleCopyLink = (productId) => {
    const affiliateLink = `http://localhost:3000/product/${productId}?aff=${user.uid}`;
    navigator.clipboard.writeText(affiliateLink);
    setCopiedProductId(productId);
    setTimeout(() => setCopiedProductId(null), 2000);
  };

  // Format commission display
  const formatCommission = (commission) => {
    if (commission === null || commission === undefined) return "N/A";
    return `${commission}%`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div
      className={`w-full ${
        products.length > 0
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          : "space-y-4"
      }`}
      {...(products.length > 0
        ? { variants: containerVariants, initial: "hidden", animate: "visible" }
        : {})}
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 sm:gap-3 col-span-full"
      >
        <FaShoppingBag className="text-2xl sm:text-3xl text-yellow-400" />
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Promotable Products
        </h2>
      </motion.div>

      {isLoading ? (
        <motion.p
          variants={itemVariants}
          className="text-gray-200 text-sm sm:text-base animate-pulse mb-6 col-span-full"
        >
          Loading products...
        </motion.p>
      ) : error ? (
        <motion.div
          variants={itemVariants}
          className="p-3 sm:p-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center text-sm sm:text-base mb-6 col-span-full"
        >
          <FaExclamationCircle className="mr-2 text-lg sm:text-xl" />
          {error}
        </motion.div>
      ) : products.length === 0 ? (
        <motion.p
          variants={itemVariants}
          className="text-gray-200 text-sm sm:text-base mb-6 col-span-full"
        >
          No products available to promote.
        </motion.p>
      ) : (
        products.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            className="p-4 sm:p-6 bg-gradient-to-br from-gray-700/80 to-gray-800/80 rounded-xl border border-gray-600/50 shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            {/* Product Image */}
            {product.coverImageUrl ? (
              <motion.div
                className="mb-4 rounded-lg overflow-hidden bg-gray-600"
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={product.coverImageUrl}
                  alt={product.name}
                  className="w-full h-32 sm:h-40 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML =
                      '<div class="w-full h-32 sm:h-40 bg-gray-600 flex items-center justify-center"><FaImage className="text-gray-500 text-2xl" /></div>';
                  }}
                />
              </motion.div>
            ) : (
              <div className="w-full h-32 sm:h-40 bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                <FaImage className="text-gray-500 text-2xl" />
              </div>
            )}

            {/* Product Name */}
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 line-clamp-2">
              {product.name || "Unnamed Product"}
            </h3>

            {/* Product Description */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
              {product.description || "No description available"}
            </p>

            {/* Price and Commission Row */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-lg font-semibold text-yellow-400">
                {product.price ? `${product.price} GHS` : "Price N/A"}
              </div>
              <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full text-green-400 text-sm font-medium">
                <FaPercent className="text-xs" />
                {formatCommission(product.commission)}
              </div>
            </div>

            {/* Product Type */}
            {product.type && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                  {product.type.replace("_", " ").toUpperCase()}
                </span>
              </div>
            )}

            {/* Copy Affiliate Link Button */}
            <motion.button
              onClick={() => handleCopyLink(product.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-3 px-4 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                copiedProductId === product.id
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
              }`}
              aria-label={`Copy affiliate link for ${product.name}`}
            >
              <FaCopy />
              {copiedProductId === product.id
                ? "Copied! ✅"
                : "Copy Affiliate Link"}
            </motion.button>

            {/* Affiliate Link Preview (optional - shows after copy) */}
            {copiedProductId === product.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 p-2 bg-gray-600/50 rounded-lg text-xs text-gray-300"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">Link copied to clipboard</span>
                  <button
                    onClick={() => {
                      const affiliateLink = `http://localhost:3000/product/${product.id}?aff=${user.uid}`;
                      navigator.clipboard.writeText(affiliateLink);
                    }}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    📋
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default PromotableProducts;
