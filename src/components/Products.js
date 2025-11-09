import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExclamationCircle } from "react-icons/fa";

const Products = ({ products, isLoading, error }) => {
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState({});

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="p-6 ">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4">
        Manage Products
      </h3>
      <p className="text-gray-200 text-base mb-6 leading-relaxed">
        Create and manage your digital products with ease.
      </p>
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)",
        }}
        whileTap={{ scale: 0.95 }}
        className="py-2.5 px-6 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 mb-6 text-base"
        onClick={() => navigate("/create-product")}
        aria-label="Create New Product"
      >
        Create New Product
      </motion.button>
      {error && (
        <motion.div
          variants={itemVariants}
          className="p-4 mb-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center"
        >
          <FaExclamationCircle className="mr-2 text-xl" />
          {error}
        </motion.div>
      )}
      {isLoading ? (
        <p className="text-gray-200 text-base animate-pulse">
          Loading products...
        </p>
      ) : products.length === 0 ? (
        <div className="text-center"></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="p-4 bg-gray-700/80 rounded-xl border border-gray-600/50 cursor-pointer"
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 10px rgba(234, 179, 8, 0.3)",
              }}
            >
              {product.coverImageUrl && (
                <img
                  src={product.coverImageUrl}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
              )}
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                {product.name}
              </h4>
              <p className="text-gray-200 text-base mb-2 line-clamp-2">
                {product.description}
              </p>
              <p className="text-gray-300 text-base mb-2">
                Price: {product.price} {product.currency}
              </p>
              <p className="text-gray-300 text-base mb-2">
                Type: {product.type.replace("_", " ").toUpperCase()}
              </p>
              {product.type === "event" && product.ticketTiers && (
                <p className="text-gray-300 text-base mb-2">
                  Tiers:{" "}
                  {product.ticketTiers
                    .map(
                      (tier) =>
                        `${tier.name} (${product.currency} ${tier.price})`
                    )
                    .join(", ")}
                </p>
              )}
              <div className="flex items-center justify-between mt-4 gap-2">
                <motion.button
                  onClick={() => navigate(`/product/${product.id}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-md transition-all duration-300 text-sm"
                  aria-label={`View details for ${product.name}`}
                >
                  View Details
                </motion.button>
                <motion.button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/product/${product.id}`
                    );
                    setIsCopied((prev) => ({
                      ...prev,
                      [product.id]: true,
                    }));
                    setTimeout(
                      () =>
                        setIsCopied((prev) => ({
                          ...prev,
                          [product.id]: false,
                        })),
                      2000
                    );
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="py-2 px-4 bg-green-400 text-gray-900 font-semibold rounded-full shadow-md transition-all duration-300 text-sm"
                  aria-label={`Copy link for ${product.name}`}
                >
                  {isCopied[product.id] ? "Copied!" : "Copy Link"}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
