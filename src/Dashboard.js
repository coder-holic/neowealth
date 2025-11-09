import React, { useState, useEffect, useCallback } from "react"; // ✅ ADD useCallback
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "./Firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./Firebase";
import {
  FaStore,
  FaUsers,
  FaMoneyBillWave,
  FaShoppingBag,
  FaExclamationCircle,
  FaChartLine,
  FaLink,
} from "react-icons/fa";
import { BiUserCircle, BiMenu, BiX, BiLogOut } from "react-icons/bi";
import Analytics from "./components/Analytics";
import SellerAnalytics from "./components/SellerAnalytics";
import ReferralLinks from "./components/ReferralsLink";
import Products from "./components/Products";
import BecomeSeller from "./components/BecomeSeller";
import BecomeAfiliate from "./components/BecomeAfiliate";
import Profile from "./components/Profile";
import PromotableProducts from "./components/PromotableProduct";
import Payments from "./components/PaymentSetup";

// SidebarButton component
const SidebarButton = ({ id, title, icon, isActive, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{
        scale: 1.05,
        backgroundColor: "rgba(234, 179, 8, 0.2)",
      }}
      whileTap={{ scale: 0.95 }}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-gray-200 font-semibold transition-all duration-300 text-base ${
        isActive
          ? "bg-yellow-400 text-gray-900 shadow-md"
          : "hover:bg-gray-700/50"
      }`}
      aria-label={`Go to ${title} section`}
    >
      {icon}
      <span className="flex-1 text-left">{title}</span>
    </motion.button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const displayName = user?.displayName || "User";

  // ✅ STATE
  const [sellerData, setSellerData] = useState({
    totalRevenue: 0,
    totalSales: 0,
    todayRevenue: 0,
    numAffiliates: 0,
    loading: true,
    error: null,
  });

  const [affiliateData, setAffiliateData] = useState({
    totalEarnings: 0,
    totalClicks: 0,
    totalConversions: 0,
    todayEarnings: 0,
    loading: true,
    error: null,
  });

  const [activeTab, setActiveTab] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(
    window.matchMedia("(min-width: 640px)").matches
  );
  const [isSeller, setIsSeller] = useState(false);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [sections, setSections] = useState([]);
  const [errors, setErrors] = useState({
    store: "",
    products: "",
    logout: "",
  });
  const [isLoading, setIsLoading] = useState({ store: false, products: false });
  const [rolesChecked, setRolesChecked] = useState(false);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  // ✅ FIXED: useCallback to prevent infinite re-renders
  const handleSellerAnalyticsReady = useCallback((data) => {
    console.log("✅ Seller Data Received:", data);
    setSellerData({
      ...data,
      loading: false,
      error: data.error || null,
    });
  }, []);

  const handleAffiliateAnalyticsReady = useCallback((data) => {
    console.log("✅ Affiliate Data Received:", data);
    setAffiliateData({
      ...data,
      loading: false,
      error: data.error || null,
    });
  }, []);

  // Track screen size for sidebar visibility
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    const handleChange = () => setIsLargeScreen(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Check user roles (seller and affiliate)
  useEffect(() => {
    if (!user || !user.uid) {
      navigate("/login");
      return;
    }

    const checkSeller = async () => {
      try {
        const q = query(
          collection(db, "stores"),
          where("owner", "==", user.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setStoreId(snap.docs[0].id);
          setStoreData(snap.docs[0].data());
          return true;
        }
        return false;
      } catch (err) {
        throw new Error("Failed to check seller status: " + err.message);
      }
    };

    const checkAffiliate = async () => {
      try {
        const affiliateDoc = doc(db, "NEOWEALTH-affiliates", user.uid);
        const docSnap = await getDoc(affiliateDoc);
        return docSnap.exists();
      } catch (err) {
        throw new Error("Failed to check affiliate status: " + err.message);
      }
    };

    const loadRoles = async () => {
      setIsLoading((prev) => ({ ...prev, store: true }));
      try {
        const [seller, affiliate] = await Promise.all([
          checkSeller(),
          checkAffiliate(),
        ]);
        setIsSeller(seller);
        setIsAffiliate(affiliate);
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          store: err.message,
        }));
      } finally {
        setIsLoading((prev) => ({ ...prev, store: false }));
        setRolesChecked(true);
      }
    };
    loadRoles();
  }, [user, navigate]);

  // Fetch products if isSeller
  useEffect(() => {
    if (isSeller && storeId) {
      const fetchProducts = async () => {
        setIsLoading((prev) => ({ ...prev, products: true }));
        try {
          const q = query(
            collection(db, "NEOWEALTH-products"),
            where("storeId", "==", storeId)
          );
          const snap = await getDocs(q);
          setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          setErrors((prev) => ({
            ...prev,
            products: "Failed to fetch products: " + err.message,
          }));
        } finally {
          setIsLoading((prev) => ({ ...prev, products: false }));
        }
      };
      fetchProducts();
    }
  }, [isSeller, storeId]);

  // ✅ FIXED SECTIONS useEffect - REMOVED CALLBACKS FROM DEPENDENCIES
  useEffect(() => {
    if (!rolesChecked) return;

    const affiliateSections = isAffiliate
      ? [
          {
            id: "analytics",
            title: "Analytics",
            icon: <FaChartLine className="text-2xl text-yellow-400" />,
            content: (
              <Analytics
                key="affiliate-analytics" // ✅ UNIQUE KEY
                user={user}
                fromDate={fromDate}
                toDate={toDate}
                setFromDate={setFromDate}
                setToDate={setToDate}
                onAnalyticsReady={handleAffiliateAnalyticsReady}
              />
            ),
          },
          {
            id: "promotable_products",
            title: "Promotable Products",
            icon: <FaShoppingBag className="text-2xl text-yellow-400" />,
            content: <PromotableProducts key="promotable" user={user} />,
          },
          {
            id: "referrals",
            title: "Referral Links",
            icon: <FaLink className="text-2xl text-yellow-400" />,
            content: <ReferralLinks key="referrals" user={user} />,
          },
        ]
      : [];

    const commonSections = [
      {
        id: "affiliate",
        title: isAffiliate ? "Affiliate" : "Become an Affiliate",
        icon: <FaUsers className="text-2xl text-yellow-400" />,
        content: (
          <BecomeAfiliate
            key="affiliate"
            isAffiliate={isAffiliate}
            user={user}
          />
        ),
      },
      {
        id: "profile",
        title: "Profile",
        icon: <BiUserCircle className="text-2xl text-yellow-400" />,
        content: <Profile key="profile" user={user} />,
      },
      {
        id: "payments",
        title: "Payment/Payout",
        icon: <FaMoneyBillWave className="text-2xl text-yellow-400" />,
        content: (
          <Payments
            key="payments"
            sellerData={sellerData}
            affiliateData={affiliateData}
          />
        ),
      },
    ];

    let dynamicSections = [];
    if (isSeller) {
      dynamicSections = [
        {
          id: "seller_analytics",
          title: "Seller Analytics",
          icon: <FaChartLine className="text-2xl text-yellow-400" />,
          content: (
            <SellerAnalytics
              key="seller-analytics" // ✅ UNIQUE KEY
              products={products}
              fromDate={fromDate}
              toDate={toDate}
              setFromDate={setFromDate}
              setToDate={setToDate}
              onAnalyticsReady={handleSellerAnalyticsReady}
            />
          ),
        },
        {
          id: "products",
          title: "Products",
          icon: <FaShoppingBag className="text-2xl text-yellow-400" />,
          content: (
            <Products
              key="products"
              products={products}
              isLoading={isLoading.products}
              error={errors.products}
            />
          ),
        },
      ];
    } else {
      dynamicSections = [
        {
          id: "seller",
          title: "Become a Seller",
          icon: <FaStore className="text-2xl text-yellow-400" />,
          content: <BecomeSeller key="seller" />,
        },
      ];
    }

    setSections([...dynamicSections, ...affiliateSections, ...commonSections]);

    // ✅ SET INITIAL TAB ONLY ONCE
    if (!activeTab) {
      setActiveTab(
        dynamicSections[0]?.id || affiliateSections[0]?.id || "affiliate"
      );
    }
  }, [
    isSeller,
    isAffiliate,
    storeData,
    products,
    rolesChecked,
    user,
    fromDate,
    toDate,
    errors.products,
    isLoading.products,
    sellerData,
    affiliateData,
    // ✅ REMOVED: handleSellerAnalyticsReady, handleAffiliateAnalyticsReady
  ]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        logout: "Logout failed: " + err.message,
      }));
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // ✅ FIXED: Memoized setActiveTab function
  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId);
      if (!isLargeScreen) {
        setIsMenuOpen(false);
      }
    },
    [isLargeScreen]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const sidebarVariants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-black px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-yellow-500/20 rounded-full mix-blend-overlay blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-overlay blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 sm:p-6 bg-gray-800/90 backdrop-blur-xl rounded-b-2xl shadow-xl border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <BiUserCircle className="text-3xl text-yellow-400" />
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
            Welcome, {displayName}!
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {errors.logout && (
            <motion.div
              variants={itemVariants}
              className="hidden sm:flex p-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 items-center"
            >
              <FaExclamationCircle className="mr-2 text-lg" />
              {errors.logout}
            </motion.div>
          )}
          <motion.button
            onClick={handleLogout}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-yellow-400 text-gray-900 rounded-full shadow-lg transition-all duration-300"
            aria-label="Log out"
          >
            <BiLogOut className="text-xl" />
          </motion.button>
          <button
            className="sm:hidden text-yellow-400 text-3xl focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle sidebar"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <BiX /> : <BiMenu />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col sm:flex-row flex-1 max-w-7xl mx-auto mt-6 gap-6"
      >
        {/* Backdrop for Mobile Sidebar */}
        {isMenuOpen && !isLargeScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black sm:hidden z-40"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <motion.nav
          variants={sidebarVariants}
          initial="hidden"
          animate={isLargeScreen || isMenuOpen ? "visible" : "hidden"}
          className={`fixed inset-y-0 left-0 w-72 bg-gray-800/90 backdrop-blur-xl p-6 rounded-r-2xl shadow-xl sm:static sm:flex sm:flex-col sm:w-1/4 sm:min-w-[200px] transition-transform duration-300 sm:transition-none border-r border-gray-700/50 z-50`}
        >
          {isLoading.store ? (
            <p className="text-gray-200 text-base animate-pulse">Loading...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {sections.map((section) => (
                <SidebarButton
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  icon={section.icon}
                  isActive={activeTab === section.id}
                  onClick={() => handleTabChange(section.id)} // ✅ FIXED
                />
              ))}
            </div>
          )}
        </motion.nav>

        {/* Content Area */}
        <motion.section
          className={`flex-1 p-6 bg-gray-800/40 rounded-2xl sm:ml-6 shadow-xl border border-gray-700/50 ${
            isMenuOpen && !isLargeScreen ? "hidden sm:block" : ""
          }`}
          variants={contentVariants}
          aria-hidden={isMenuOpen && !isLargeScreen}
        >
          {isLoading.store ? (
            <motion.div
              className="w-16 h-16 border-4 border-t-yellow-400 border-gray-700 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab && (
                <motion.div
                  key={activeTab}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.3 } }}
                >
                  {
                    sections.find((section) => section.id === activeTab)
                      ?.content
                  }
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.section>
      </motion.main>
    </div>
  );
};

export default Dashboard;
