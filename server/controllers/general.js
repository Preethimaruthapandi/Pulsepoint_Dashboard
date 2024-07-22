import User from "../models/User.js";
import OverallStat from "../models/OverallStat.js";
import Transaction from "../models/Transaction.js";

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    // Hardcoded values
    const currentMonth = "November";
    const currentYear = 2021;
    const currentDay = "2021-11-15";

    /* Recent Transactions */
    const transactions = await Transaction.find()
      .limit(50)
      .sort({ createdOn: -1 });

    /* Overall Stats */
    const overallStat = await OverallStat.find({ year: currentYear });

    console.log("Fetched Overall Stats:", overallStat); // Log the fetched data

    if (overallStat.length === 0) {
      return res.status(404).json({ message: "No overall stats found for this year." });
    }

    // Extract the first item from the array
    const data = overallStat[0];
    
    // Debugging: Log the data to ensure it matches expectations
    console.log("Data to be destructured:", data);

    const {
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
    } = data;

    // Find stats for this month and today
    const thisMonthStats = monthlyData.find(({ month }) => month === currentMonth) || {};
    const todayStats = data.dailyData.find(({ date }) => date === currentDay) || {};

    res.status(200).json({
      totalCustomers,
      yearlyTotalSoldUnits,
      yearlySalesTotal,
      monthlyData,
      salesByCategory,
      thisMonthStats,
      todayStats,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
