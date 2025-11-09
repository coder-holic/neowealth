import React, { useState, useEffect, useCallback } from "react"; // ✅ ADD useCallback
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
} from "firebase/firestore";
import { db } from "../Firebase";

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

const Analytics = ({
  user,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  onAnalyticsReady, // ✅ ADD THIS PROP
}) => {
  const [isLoading, setIsLoading] = useState(true); // ✅ START WITH TRUE
  const [error, setError] = useState("");
  const [analyticsData, setAnalyticsData] = useState({
    clicks: 0,
    conversions: 0,
    earnings: 0,
    todayEarnings: 0,
    chartData: {
      labels: [],
      datasets: [],
    },
  });

  // ✅ FIXED: Memoized callback to prevent infinite re-renders
  const handleAnalyticsReady = useCallback(
    (data) => {
      console.log("✅ Analytics Data Ready:", data);
      if (onAnalyticsReady) {
        onAnalyticsReady({
          totalEarnings: data.earnings,
          totalClicks: data.clicks,
          totalConversions: data.conversions,
          todayEarnings: data.todayEarnings,
          loading: false, // ✅ STOP LOADING!
          error: null,
        });
      }
    },
    [onAnalyticsReady]
  );

  useEffect(() => {
    if (!user || !user.uid) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);

      // ✅ CALLBACK: Send empty data
      handleAnalyticsReady({
        totalEarnings: 0,
        totalClicks: 0,
        totalConversions: 0,
        todayEarnings: 0,
      });

      return;
    }

    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);
        endDate.setDate(endDate.getDate() + 1);
        const tsFrom = Timestamp.fromDate(startDate);
        const tsTo = Timestamp.fromDate(endDate);

        // Today's earnings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayTsFrom = Timestamp.fromDate(today);
        const todayTsTo = Timestamp.fromDate(tomorrow);

        const clickQ = query(
          collection(db, "affiliateClicks"),
          where("affiliateId", "==", user.uid),
          where("timestamp", ">=", tsFrom),
          where("timestamp", "<", tsTo)
        );
        const convQ = query(
          collection(db, "affiliate-conversions"),
          where("affiliateId", "==", user.uid),
          where("timestamp", ">=", tsFrom),
          where("timestamp", "<", tsTo)
        );
        const todayConvQ = query(
          collection(db, "affiliate-conversions"),
          where("affiliateId", "==", user.uid),
          where("timestamp", ">=", todayTsFrom),
          where("timestamp", "<", todayTsTo)
        );

        const [clickSnap, convSnap, todayConvSnap] = await Promise.all([
          getDocs(clickQ),
          getDocs(convQ),
          getDocs(todayConvQ),
        ]);

        const clickDocs = clickSnap.docs;
        const convDocs = convSnap.docs;
        const todayConvDocs = todayConvSnap.docs;

        const clickGroup = groupByMonth(clickDocs);
        const convGroup = groupByMonth(convDocs);
        const earnGroup = groupByMonth(convDocs, "commission");

        const allLabels = [
          ...new Set([
            ...clickGroup.labels,
            ...convGroup.labels,
            ...earnGroup.labels,
          ]),
        ].sort();

        const clickData = allLabels.map((l) =>
          clickGroup.labels.includes(l)
            ? clickGroup.data[clickGroup.labels.indexOf(l)]
            : 0
        );
        const convData = allLabels.map((l) =>
          convGroup.labels.includes(l)
            ? convGroup.data[convGroup.labels.indexOf(l)]
            : 0
        );
        const earnData = allLabels.map((l) =>
          earnGroup.labels.includes(l)
            ? earnGroup.data[earnGroup.labels.indexOf(l)]
            : 0
        );

        const newAnalyticsData = {
          clicks: clickDocs.length,
          conversions: convDocs.length,
          earnings: convDocs.reduce(
            (sum, doc) => sum + (doc.data().commission || 0),
            0
          ),
          todayEarnings: todayConvDocs.reduce(
            (sum, doc) => sum + (doc.data().commission || 0),
            0
          ),
          chartData: {
            labels: allLabels,
            datasets: [
              {
                label: "Clicks",
                data: clickData,
                borderColor: "rgba(234, 179, 8, 1)",
                backgroundColor: "rgba(234, 179, 8, 0.2)",
                fill: true,
                yAxisID: "y",
              },
              {
                label: "Conversions",
                data: convData,
                borderColor: "rgba(59, 130, 246, 1)",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                fill: true,
                yAxisID: "y",
              },
              {
                label: "Earnings (₵)",
                data: earnData,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
                yAxisID: "y1",
              },
            ],
          },
        };

        // ✅ UPDATE LOCAL STATE
        setAnalyticsData(newAnalyticsData);

        // ✅ CALLBACK: Send data to parent IMMEDIATELY
        handleAnalyticsReady(newAnalyticsData);
      } catch (err) {
        setError("Failed to fetch analytics: " + err.message);
        console.error("Analytics error details:", err);

        // ✅ CALLBACK: Send error state
        if (onAnalyticsReady) {
          onAnalyticsReady({
            error: err.message,
            loading: false,
          });
        }
      } finally {
        setIsLoading(false); // ✅ ALWAYS STOP LOADING
      }
    };
    fetchAnalytics();
  }, [fromDate, toDate, user, handleAnalyticsReady]); // ✅ ADD DEPENDENCY

  // ✅ SAFETY NET: Force callback after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && onAnalyticsReady) {
        console.log("⏰ Analytics: Forcing callback after 3s timeout");
        onAnalyticsReady({
          totalEarnings: analyticsData.earnings,
          totalClicks: analyticsData.clicks,
          totalConversions: analyticsData.conversions,
          todayEarnings: analyticsData.todayEarnings,
          loading: false,
          error: null,
        });
        setIsLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, onAnalyticsReady, analyticsData]);

  const exportAnalyticsToCSV = () => {
    const headers = ["Month", "Clicks", "Conversions", "Earnings (₵)"];
    const csvContent = [
      headers.join(","),
      ...analyticsData.chartData.labels.map(
        (label, index) =>
          `${label},${analyticsData.chartData.datasets[0].data[index]},${analyticsData.chartData.datasets[1].data[index]},${analyticsData.chartData.datasets[2].data[index]}`
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "analytics_data.csv");
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
    <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-lg border border-gray-700/50">
      <h3 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">
        Analytics
      </h3>

      {/* Date Filter */}
      <div className="mb-6">
        <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">
          Filter by Date
        </h4>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-gray-200 text-sm sm:text-base">From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="p-2 bg-gray-700 text-gray-200 rounded-lg w-full sm:w-40 text-sm sm:text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-gray-200 text-sm sm:text-base">To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="p-2 bg-gray-700 text-gray-200 rounded-lg w-full sm:w-40 text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-200 text-sm sm:text-base animate-pulse">
          Loading analytics...
        </p>
      ) : error ? (
        <motion.div
          variants={itemVariants}
          className="p-4 mb-4 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 flex items-center"
        >
          <FaExclamationCircle className="mr-2 text-lg sm:text-xl" />
          <span className="text-sm sm:text-base">{error}</span>
        </motion.div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-700/80 rounded-xl border border-gray-600/50">
              <h4 className="text-sm sm:text-lg font-semibold text-yellow-400">
                Total Clicks
              </h4>
              <p className="text-xl sm:text-2xl text-gray-200">
                {analyticsData.clicks}
              </p>
            </div>
            <div className="p-4 bg-gray-700/80 rounded-xl border border-gray-600/50">
              <h4 className="text-sm sm:text-lg font-semibold text-yellow-400">
                Conversions
              </h4>
              <p className="text-xl sm:text-2xl text-gray-200">
                {analyticsData.conversions}
              </p>
            </div>
            <div className="p-4 bg-gray-700/80 rounded-xl border border-gray-600/50">
              <h4 className="text-sm sm:text-lg font-semibold text-yellow-400">
                Total Earnings
              </h4>
              <p className="text-xl sm:text-2xl text-gray-200">
                ₵{analyticsData.earnings.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-gray-700/80 rounded-xl border border-gray-600/50">
              <h4 className="text-sm sm:text-lg font-semibold text-yellow-400">
                Today's Earnings
              </h4>
              <p className="text-xl sm:text-2xl text-gray-200">
                ₵{analyticsData.todayEarnings.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-6">
            <h4 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">
              Performance Over Time
            </h4>
            <div
              style={{
                position: "relative",
                height: "300px",
                width: "100%",
                minHeight: "300px",
              }}
              className="sm:h-[400px]"
            >
              <Line
                data={analyticsData.chartData}
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
                        text: "Clicks / Conversions",
                        color: "#e5e7eb",
                        font: { size: 12 },
                      },
                    },
                    y1: {
                      type: "linear",
                      display: true,
                      position: "right",
                      title: {
                        display: true,
                        text: "Earnings (₵)",
                        color: "#e5e7eb",
                        font: { size: 12 },
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
                        font: { size: 12 },
                      },
                      ticks: {
                        font: { size: 10 },
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: "#e5e7eb",
                        font: { size: 12 },
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(31, 41, 55, 0.8)",
                      titleColor: "#e5e7eb",
                      bodyColor: "#e5e7eb",
                      titleFont: { size: 12 },
                      bodyFont: { size: 12 },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-2.5 px-6 bg-yellow-400 text-gray-900 font-semibold rounded-full shadow-lg transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
            onClick={exportAnalyticsToCSV}
            aria-label="Export Analytics"
          >
            Export to CSV
          </motion.button>
        </>
      )}
    </div>
  );
};

export default Analytics;
