// SellerAnalytics.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaExclamationCircle } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../Firebase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const groupByMonth = (docs, valueKey = null) => {
  const groups = {};
  docs.forEach((doc) => {
    const data = doc.data();
    if (!data.timestamp || typeof data.timestamp.toDate !== "function") {
      console.warn(`Invalid timestamp in doc ${doc.id}:`, data.timestamp);
      return;
    }
    const date = data.timestamp.toDate();
    const month = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
    if (!groups[month]) groups[month] = 0;
    if (valueKey) {
      groups[month] += data[valueKey] || 0;
    } else {
      groups[month]++;
    }
  });
  const labels = Object.keys(groups).sort();
  const data = labels.map((label) => groups[label]);
  return { labels, data };
};

const SellerAnalytics = ({
  products,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  onAnalyticsReady, // ✅ NEW CALLBACK PROP
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sellerAnalytics, setSellerAnalytics] = useState({
    numAffiliates: 0,
    totalSales: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    chartData: {
      labels: [],
      datasets: [],
    },
  });

  useEffect(() => {
    if (!auth.currentUser) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }
    const userId = auth.currentUser.uid;

    if (!products || products.length === 0) {
      setError("No products available to analyze.");
      setIsLoading(false);
      return;
    }

    setError("");

    const fetchSellerAnalytics = async () => {
      setIsLoading(true);
      try {
        // ... existing product filtering code (unchanged) ...
        products.forEach((p, index) => {
          console.log(`Product ${index}:`, {
            id: p.id,
            owner: p.owner,
            ownerId: p.ownerId,
            userId: p.userId,
            sellerId: p.sellerId,
            storeId: p.storeId,
            allKeys: Object.keys(p),
          });
        });
        const productIds = products
          .filter((p) => {
            const isOwner =
              p.id &&
              (p.owner === userId ||
                p.ownerId === userId ||
                p.userId === userId ||
                p.sellerId === userId ||
                p.storeId === userId);
            return isOwner;
          })
          .map((p) => p.id);

        if (productIds.length === 0) {
          setError(
            "No products owned by the current user. Check product ownership fields."
          );
          setIsLoading(false);
          return;
        }

        if (!fromDate || !toDate) {
          setError("Please select from and to dates.");
          setIsLoading(false);
          return;
        }
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          setError("Invalid date format.");
          setIsLoading(false);
          return;
        }
        if (startDate > endDate) {
          setError("From date must be before to date.");
          setIsLoading(false);
          return;
        }

        endDate.setDate(endDate.getDate() + 1);
        const tsFrom = Timestamp.fromDate(startDate);
        const tsTo = Timestamp.fromDate(endDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayTsFrom = Timestamp.fromDate(today);
        const todayTsTo = Timestamp.fromDate(tomorrow);

        // ... existing affiliate fetching code (unchanged) ...

        for (const productId of productIds) {
          try {
            const productRef = doc(db, "NEOWEALTH-products", productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              console.log(`Product  data:`);
            } else {
              console.warn(`Product does not exist in NEOWEALTH-products`);
            }
          } catch (err) {
            console.error(`Error accessing NEOWEALTH-products:`, err);
          }
        }
        let affiliateSet = new Set();
        const referralPromises = productIds.map(async (productId) => {
          try {
            const q = query(
              collection(db, "affiliateClicks"),
              where("productId", "==", productId)
            );
            const snap = await getDocs(q);
            snap.docs.forEach((doc) => {
              const data = doc.data();
              if (data.affiliateId) {
                affiliateSet.add(data.affiliateId);
              }
            });
          } catch (err) {
            console.error(`Error fetching affiliateClicks for product`, err);
          }
        });
        await Promise.all(referralPromises);

        // ... existing sales fetching code (unchanged) ...
        const salesPromises = productIds.map(async (productId) => {
          try {
            const salesQ = query(
              collection(db, "NEOWEALTH-sales"),
              where("productId", "==", productId),
              where("timestamp", ">=", tsFrom),
              where("timestamp", "<", tsTo)
            );
            const todaySalesQ = query(
              collection(db, "NEOWEALTH-sales"),
              where("productId", "==", productId),
              where("timestamp", ">=", todayTsFrom),
              where("timestamp", "<", todayTsTo)
            );
            const [salesSnap, todaySalesSnap] = await Promise.all([
              getDocs(salesQ),
              getDocs(todaySalesQ),
            ]);
            return [salesSnap, todaySalesSnap];
          } catch (err) {
            console.error(`Error fetching`, err);
            return [null, null];
          }
        });
        const salesResults = await Promise.all(salesPromises);
        const salesDocs = salesResults
          .filter(([salesSnap]) => salesSnap !== null)
          .flatMap(([salesSnap]) => salesSnap.docs);
        const todaySalesDocs = salesResults
          .filter(([, todaySalesSnap]) => todaySalesSnap !== null)
          .flatMap(([, todaySalesSnap]) => todaySalesSnap.docs);

        const salesGroup = groupByMonth(salesDocs);
        const revenueGroup = groupByMonth(salesDocs, "amount");

        const allLabels = [
          ...new Set([...salesGroup.labels, ...revenueGroup.labels]),
        ].sort();

        const salesData = allLabels.map((l) =>
          salesGroup.labels.includes(l)
            ? salesGroup.data[salesGroup.labels.indexOf(l)]
            : 0
        );
        const revenueData = allLabels.map((l) =>
          revenueGroup.labels.includes(l)
            ? revenueGroup.data[revenueGroup.labels.indexOf(l)]
            : 0
        );

        const totalRevenue = salesDocs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );
        const todayRevenue = todaySalesDocs.reduce(
          (sum, doc) => sum + (doc.data().amount || 0),
          0
        );

        // ✅ UPDATE STATE
        setSellerAnalytics({
          numAffiliates: affiliateSet.size,
          totalSales: salesDocs.length,
          totalRevenue,
          todayRevenue,
          chartData: {
            labels: allLabels,
            datasets: [
              {
                label: "Sales",
                data: salesData,
                borderColor: "rgba(234, 179, 8, 1)",
                backgroundColor: "rgba(234, 179, 8, 0.2)",
                fill: true,
                yAxisID: "y",
              },
              {
                label: "Revenue (₵)",
                data: revenueData,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                yAxisID: "y1",
              },
            ],
          },
        });

        // ✅ CALLBACK: Send data to parent
        if (onAnalyticsReady) {
          onAnalyticsReady({
            totalRevenue,
            totalSales: salesDocs.length,
            todayRevenue,
            numAffiliates: affiliateSet.size,
          });
        }
      } catch (err) {
        setError("Failed to fetch seller analytics: " + err.message);
        console.error("Seller analytics error details:", err);

        // ✅ CALLBACK: Send error state
        if (onAnalyticsReady) {
          onAnalyticsReady({ error: err.message });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSellerAnalytics();
  }, [products, fromDate, toDate, onAnalyticsReady]);

  // ... rest of component (export function, JSX) remains EXACTLY THE SAME ...
  const exportSellerAnalyticsToCSV = () => {
    const headers = ["Month", "Sales", "Revenue (₵)"];
    const csvContent = [
      headers.join(","),
      ...sellerAnalytics.chartData.labels.map(
        (label, index) =>
          `${label},${sellerAnalytics.chartData.datasets[0].data[index]},${sellerAnalytics.chartData.datasets[1].data[index]}`
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "seller_analytics_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="p-3 sm:p-4 md:p-6 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-700/50">
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 mb-4">
        Seller Analytics
      </h3>
      <div className="mb-4 sm:mb-6">
        <h4 className="text-sm sm:text-base md:text-lg font-semibold text-yellow-400 mb-2">
          Filter by Date (for Sales and Revenue)
        </h4>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 w-full">
            <label className="text-gray-200 text-xs sm:text-sm md:text-base">
              From:
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="p-2 bg-gray-700 text-gray-200 rounded-lg w-full text-xs sm:text-sm md:text-base"
            />
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2 w-full">
            <label className="text-gray-200 text-xs sm:text-sm md:text-base">
              To:
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="p-2 bg-gray-700 text-gray-200 rounded-lg w-full text-xs sm:text-sm md:text-base"
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <p className="text-gray-200 text-xs sm:text-sm md:text-base animate-pulse mb-4 sm:mb-6">
          Loading seller analytics...
        </p>
      ) : error ? (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="p-3 sm:p-4 mb-4 sm:mb-6 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center"
        >
          <FaExclamationCircle className="mr-2 text-base sm:text-lg md:text-xl" />
          <span className="text-xs sm:text-sm md:text-base">{error}</span>
        </motion.div>
      ) : (
        <>
          <h4 className="text-sm sm:text-base md:text-lg font-semibold text-yellow-400 mb-3 sm:mb-4">
            Key Metrics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50">
              <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-1">
                Number of Affiliates
              </h4>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200">
                {sellerAnalytics.numAffiliates}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50">
              <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-1">
                Total Sales
              </h4>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200">
                {sellerAnalytics.totalSales}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50">
              <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-1">
                Total Revenue
              </h4>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200">
                ₵{sellerAnalytics.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-gray-700/80 rounded-xl border border-gray-600/50">
              <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-1">
                Today’s Revenue
              </h4>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200">
                ₵{sellerAnalytics.todayRevenue.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mb-4 sm:mb-6">
            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-yellow-400 mb-2">
              Performance Over Time
            </h4>
            <div className="relative h-56 sm:h-64 md:h-80 lg:h-96 w-full">
              <Line
                data={sellerAnalytics.chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      type: "linear",
                      display: true,
                      position: "left",
                      title: {
                        display: true,
                        text: "Sales",
                        color: "#e5e7eb",
                        font: { size: 10 },
                      },
                    },
                    y1: {
                      type: "linear",
                      display: true,
                      position: "right",
                      title: {
                        display: true,
                        text: "Revenue (₵)",
                        color: "#e5e7eb",
                        font: { size: 10 },
                      },
                      grid: {
                        drawOnChartArea: false,
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Month",
                        color: "#e5e7eb",
                        font: { size: 10 },
                      },
                      ticks: {
                        font: { size: 8 },
                        maxRotation: 45,
                        minRotation: 45,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: "#e5e7eb",
                        font: { size: 10 },
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(31, 41, 55, 0.8)",
                      titleColor: "#e5e7eb",
                      bodyColor: "#e5e7eb",
                      titleFont: { size: 10 },
                      bodyFont: { size: 10 },
                    },
                  },
                }}
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-2 px-4 sm:py-2.5 sm:px-6 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 text-xs sm:text-sm md:text-base w-full"
            onClick={exportSellerAnalyticsToCSV}
            aria-label="Export Seller Analytics"
          >
            Export to CSV
          </motion.button>
        </>
      )}
    </div>
  );
};

export default SellerAnalytics;
