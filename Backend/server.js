const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("AnyWallet Backend Running 🚀");
});

// 🔥 Get Transactions
app.get("/transactions/:address", async (req, res) => {
  const { address } = req.params;

  try {
    const response = await axios.get(
      "https://api.etherscan.io/v2/api",
      {
        params: {
          chainid: 11155111, // Sepolia
          module: "account",
          action: "txlist",
          address: address,
          startblock: 0,
          endblock: 99999999,
          sort: "desc",
          apikey: process.env.ETHERSCAN_API_KEY,
          offset: 10,
          page: 1,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});