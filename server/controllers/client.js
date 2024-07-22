import Product from "../models/Product.js";
import ProductStat from "../models/ProductStat.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import getCountryIso3 from "country-iso-2-to-3";


export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        const stat = await ProductStat.find({
          productId: product._id,
        });
        return {
          ...product._doc,
          stat,
        };
      })
    );
    res.status(200).json(productsWithStats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).select("-password");
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    // Extract query parameters with default values
    const { page = 1, pageSize = 20, sort = "{}", search = "" } = req.query;

    // Parse the sort parameter
    const sortParsed = JSON.parse(sort);
    const sortFormatted = Object.keys(sortParsed).length
      ? { [sortParsed.field]: sortParsed.sort === "asc" ? 1 : -1 }
      : {};

    // Create a filter for search functionality
    const searchFilter = {
      $or: [
        { cost: { $regex: new RegExp(search, "i") } },
        { userId: { $regex: new RegExp(search, "i") } },
      ],
    };

    // Fetch transactions with pagination, sorting, and search
    const transactions = await Transaction.find(searchFilter)
      .sort(sortFormatted)
      .skip((page - 1) * pageSize)
      .limit(parseInt(pageSize));

    // Total count for pagination
    const total = await Transaction.countDocuments(searchFilter);

    // Send the response
    res.status(200).json({
      transactions,
      total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};



export const getGeography = async (req, res) => {
  try {
    // Fetch users from the database
    const users = await User.find();
    console.log("Users fetched:", users); // Log users to check if data is fetched correctly

    // Map user locations by country ISO3 codes
    const mappedLocations = users.reduce((acc, { country }) => {
      const countryISO3 = getCountryIso3(country);
      console.log(`Country: ${country}, ISO3: ${countryISO3}`); // Log each country and its ISO3 code
      if (!acc[countryISO3]) {
        acc[countryISO3] = 0;
      }
      acc[countryISO3]++;
      return acc;
    }, {});

    console.log("Mapped locations:", mappedLocations); // Log mapped locations for verification

    // Format locations for the response
    const formattedLocations = Object.entries(mappedLocations).map(
      ([country, count]) => {
        return { id: country, value: count };
      }
    );

    // Log formatted locations for verification
    console.log("Formatted locations:", formattedLocations);

    // Send the response with a status of 200
    res.status(200).json(formattedLocations);
  } catch (error) {
    console.error("Error fetching geography data:", error);
    res.status(404).json({ message: error.message });
  }
};













