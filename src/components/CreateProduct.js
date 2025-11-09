import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth, db, storage } from "../Firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaShoppingBag,
  FaArrowLeft,
  FaExclamationCircle,
  FaCheckCircle,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    type: "",
    commission: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [eventDate, setEventDate] = useState("");
  const [enableTiers, setEnableTiers] = useState(false);
  const [ticketTiers, setTicketTiers] = useState([
    { name: "", price: "", quantity: "" },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [productLink, setProductLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const productTypes = ["video_course", "membership", "event", "ebook"];

  useEffect(() => {
    const getStore = async () => {
      try {
        const q = query(
          collection(db, "stores"),
          where("owner", "==", auth.currentUser.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setStoreId(snap.docs[0].id);
        } else {
          setError("You must be a seller to create products.");
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      } catch (err) {
        setError("Failed to fetch store data: " + err.message);
      }
    };
    getStore();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...ticketTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setTicketTiers(updatedTiers);
  };

  const addTier = () => {
    setTicketTiers([...ticketTiers, { name: "", price: "", quantity: "" }]);
  };

  const removeTier = (index) => {
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(productLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeId) {
      setError("Store not found. Please try again.");
      return;
    }
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.type ||
      !formData.commission
    ) {
      setError("Please fill in all required fields, including commission.");
      return;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      setError("Please enter a valid price in Ghana Cedis.");
      return;
    }
    if (
      isNaN(parseFloat(formData.commission)) ||
      parseFloat(formData.commission) < 0 ||
      parseFloat(formData.commission) > 100
    ) {
      setError("Please enter a valid commission percentage (0-100).");
      return;
    }
    if (formData.type === "event" && enableTiers) {
      if (
        ticketTiers.some(
          (tier) =>
            !tier.name ||
            isNaN(parseFloat(tier.price)) ||
            parseFloat(tier.price) < 0 ||
            isNaN(parseInt(tier.quantity)) ||
            parseInt(tier.quantity) < 0
        )
      ) {
        setError(
          "Please fill in valid ticket tier details (name, price, quantity)."
        );
        return;
      }
    }
    try {
      setIsLoading(true); // Set loading to true
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        commission: parseFloat(formData.commission),
        currency: "GHS",
        storeId,
        owner: auth.currentUser.uid,
        link: "",
        contentUrl: "",
        coverImageUrl: "",
      };
      if (formData.type === "event" && eventDate) {
        productData.eventDate = eventDate;
      }
      if (formData.type === "event" && enableTiers) {
        productData.ticketTiers = ticketTiers.map((tier) => ({
          name: tier.name,
          price: parseFloat(tier.price),
          quantity: parseInt(tier.quantity),
        }));
      }
      // Upload cover image if provided
      if (coverImage) {
        const coverImageRef = ref(
          storage,
          `products/${storeId}/coverImages/${coverImage.name}`
        );
        await uploadBytes(coverImageRef, coverImage);
        productData.coverImageUrl = await getDownloadURL(coverImageRef);
      }
      // Upload content file for ebook or video_course
      if (
        selectedFile &&
        (formData.type === "ebook" || formData.type === "video_course")
      ) {
        const storageRef = ref(
          storage,
          `products/${storeId}/${selectedFile.name}`
        );
        await uploadBytes(storageRef, selectedFile);
        productData.contentUrl = await getDownloadURL(storageRef);
      }
      // Generate document ID and link
      const productRef = doc(collection(db, "NEOWEALTH-products"));
      productData.link = `${window.location.origin}/product/${productRef.id}`;
      // Create document with all fields
      await addDoc(collection(db, "NEOWEALTH-products"), productData);

      setError("");
      setSuccess("Product created successfully!");
      setProductLink(productData.link);
      setTimeout(() => {
        navigate("/dashboard");
      }, 5000);
    } catch (err) {
      setError("Failed to create product: " + err.message);
    } finally {
      setIsLoading(false); // Reset loading state
    }
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
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-500/20 rounded-full mix-blend-overlay blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-overlay blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex justify-between items-center p-4 sm:p-6 bg-gray-800/80 backdrop-blur-xl rounded-b-2xl shadow-2xl border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <FaShoppingBag className="text-3xl text-yellow-400" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            Create Product
          </h2>
        </div>
        <motion.button
          onClick={() => navigate("/dashboard")}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)",
          }}
          whileTap={{ scale: 0.95 }}
          className="p-2 bg-yellow-400 text-gray-900 rounded-full shadow-lg transition-all duration-300"
          aria-label="Back to Dashboard"
        >
          <FaArrowLeft className="text-xl" />
        </motion.button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col max-w-3xl mx-auto mt-6 p-6 bg-gray-800/30 rounded-2xl shadow-xl border border-gray-700/50"
      >
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">
            Create Digital Product
          </h3>
          <p className="text-gray-200 text-base mb-6 leading-relaxed">
            Fill out the details to create a new digital product, including the
            commission for affiliates.
          </p>
        </motion.div>

        {error && (
          <motion.div
            variants={itemVariants}
            className="p-4 mb-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center"
          >
            <FaExclamationCircle className="mr-2 text-xl" />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            variants={itemVariants}
            className="p-4 mb-4 bg-green-500/20 text-green-400 rounded-xl border border-green-500/50 flex items-center justify-between"
          >
            <div className="flex items-center">
              <FaCheckCircle className="mr-2 text-xl" />
              {success} Link:{" "}
              <a href={productLink} className="underline hover:text-green-300">
                {productLink}
              </a>
            </div>
            <motion.button
              onClick={handleCopy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="py-1 px-3 bg-green-400 text-gray-900 font-semibold rounded-full shadow-md transition-all duration-300 text-sm"
            >
              {isCopied ? "Copied!" : "Copy Link"}
            </motion.button>
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.div variants={itemVariants}>
            <label
              htmlFor="name"
              className="block text-gray-200 font-semibold mb-2"
            >
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Enter product name"
              required
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <label
              htmlFor="price"
              className="block text-gray-200 font-semibold mb-2"
            >
              Price (GHS)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Enter price in Ghana Cedis"
              min="0"
              step="0.01"
              required
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <label
              htmlFor="commission"
              className="block text-gray-200 font-semibold mb-2"
            >
              Affiliate Commission (%)
            </label>
            <input
              type="number"
              id="commission"
              name="commission"
              value={formData.commission}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Enter commission percentage (0-100)"
              min="0"
              max="100"
              step="0.1"
              required
            />
          </motion.div>
          <motion.div variants={itemVariants} className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-gray-200 font-semibold mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              placeholder="Describe the product"
              rows="4"
              required
            />
          </motion.div>
          <motion.div variants={itemVariants} className="md:col-span-2">
            <label
              htmlFor="type"
              className="block text-gray-200 font-semibold mb-2"
            >
              Product Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
              required
            >
              <option value="">Select type</option>
              {productTypes.map((t) => (
                <option key={t} value={t}>
                  {t.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </motion.div>
          <motion.div variants={itemVariants} className="md:col-span-2">
            <label
              htmlFor="coverImage"
              className="block text-gray-200 font-semibold mb-2"
            >
              Cover Image
            </label>
            <input
              type="file"
              id="coverImage"
              onChange={handleCoverImageChange}
              accept="image/*"
              className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-gray-900 hover:file:bg-yellow-300"
            />
          </motion.div>
          {(formData.type === "ebook" || formData.type === "video_course") && (
            <motion.div variants={itemVariants} className="md:col-span-2">
              <label
                htmlFor="file"
                className="block text-gray-200 font-semibold mb-2"
              >
                Upload Content
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-gray-900 hover:file:bg-yellow-300"
              />
            </motion.div>
          )}
          {formData.type === "event" && (
            <>
              <motion.div variants={itemVariants} className="md:col-span-2">
                <label
                  htmlFor="eventDate"
                  className="block text-gray-200 font-semibold mb-2"
                >
                  Event Date
                </label>
                <input
                  type="datetime-local"
                  id="eventDate"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                />
              </motion.div>
              <motion.div variants={itemVariants} className="md:col-span-2">
                <label className="block text-gray-200 font-semibold mb-2">
                  <input
                    type="checkbox"
                    checked={enableTiers}
                    onChange={(e) => setEnableTiers(e.target.checked)}
                    className="mr-2"
                  />
                  Enable Ticket Tiers
                </label>
              </motion.div>
              {enableTiers && (
                <motion.div variants={itemVariants} className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                    Ticket Tiers
                  </h4>
                  {ticketTiers.map((tier, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"
                    >
                      <div>
                        <label className="block text-gray-200 font-semibold mb-1">
                          Tier Name
                        </label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) =>
                            handleTierChange(index, "name", e.target.value)
                          }
                          className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                          placeholder="e.g., VIP"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-200 font-semibold mb-1">
                          Price (GHS)
                        </label>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) =>
                            handleTierChange(index, "price", e.target.value)
                          }
                          className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                          placeholder="Enter price"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex-1">
                          <label className="block text-gray-200 font-semibold mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={tier.quantity}
                            onChange={(e) =>
                              handleTierChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-full p-3 bg-gray-700/50 text-gray-200 rounded-xl border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                            placeholder="Enter quantity"
                            min="0"
                            step="1"
                          />
                        </div>
                        {index > 0 && (
                          <motion.button
                            type="button"
                            onClick={() => removeTier(index)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="ml-2 p-3 bg-red-500 text-white rounded-full shadow-md transition-all duration-300"
                          >
                            <FaTrash />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  ))}
                  <motion.button
                    type="button"
                    onClick={addTier}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-4 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Tier
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 relative"
          >
            {isLoading && (
              <div className="flex justify-center items-center mb-4">
                <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-200">Creating product...</span>
              </div>
            )}
            <motion.button
              type="submit"
              disabled={isLoading}
              variants={itemVariants}
              whileHover={{
                scale: isLoading ? 1 : 1.05,
                boxShadow: isLoading
                  ? "none"
                  : "0 0 15px rgba(234, 179, 8, 0.5)",
              }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              className={`py-2.5 px-6 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 mt-4 w-full ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Create Product
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default CreateProduct;
