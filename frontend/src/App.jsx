import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [network, setNetwork] = useState("");
  const [contract, setContract] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [showChart, setShowChart] = useState(false);
  const [page, setPage] = useState("landing");
  const [manualAddress, setManualAddress] = useState("");
  const [loading, setLoading] = useState(false);

       // Calculate raw risk
      const rawRisk =
        account && transactions.length > 0
          ? transactions.reduce((total, tx) => {
              const isSent =
                tx.from?.toLowerCase() === account.toLowerCase();

              const amount = parseFloat(
                ethers.formatEther(tx.value)
              );

              let txRisk = 0;

              if (amount > 0.01) txRisk += 10;
              if (isSent) txRisk += 5;

              return total + txRisk;
            }, 0)
          : 0;

let adjustedRisk = rawRisk;

// Add risk for high transaction frequency
if (transactions.length > 20) {
  adjustedRisk += 15;
} else if (transactions.length > 10) {
  adjustedRisk += 8;
}

// Normalize to 0–100
const walletRiskScore = Math.min(adjustedRisk, 100);

          const sentTransactions = transactions.filter(
            (tx) =>
              tx.from?.toLowerCase() === account?.toLowerCase()
          );

          let walletBehavior = "Normal Activity";
          let behaviorColor = "#00ffa6"; // green

          const totalTx = transactions.length;

          if (walletRiskScore > 40) {
            walletBehavior = "High Risk Wallet";
            behaviorColor = "#ff4d4d"; // red
          }
          else if (sentTransactions.length >= 5) {
            walletBehavior = "High Outflow Wallet";
            behaviorColor = "#ff9f43"; // orange
          }
          else if (totalTx > 20) {
            walletBehavior = "High Activity Wallet";
            behaviorColor = "#feca57"; // yellow
          }
          else if (sentTransactions.length === 0 && totalTx > 0) {
            walletBehavior = "Passive Wallet";
            behaviorColor = "#00ffa6"; // green
          }
          else if (totalTx <= 3) {
            walletBehavior = "Low Activity Wallet";
            behaviorColor = "#54a0ff"; // blue
          }

          // Total Sent and Received calculation with count
          let totalSent = 0;
          let totalReceived = 0;
          

          transactions.forEach((tx) => {
            const amount = parseFloat(ethers.formatEther(tx.value));

            const isSent =
              tx.from?.toLowerCase() === account?.toLowerCase();

            if (isSent) {
              totalSent += amount;
            } else {
              totalReceived += amount;
            }
          });

          const transactionCount = transactions.length;

          const avgTransaction =
            transactionCount > 0
              ? (totalSent + totalReceived) / transactionCount
              : 0;

          const largestTransaction = //calc of large transac
          transactions.length > 0
            ? Math.max(
                ...transactions.map(tx =>
                  parseFloat(ethers.formatEther(tx.value))
                )
              )
            : 0;  

          const chartData = [ //chart calc
              { name: "Sent", value: totalSent },
              { name: "Received", value: totalReceived }
            ];
          const COLORS = ["#ff4d6d", "#00f0ff"];

           const sentCount = transactions.filter(
              (tx) =>
                tx.from &&
                account &&
                tx.from.toLowerCase() === account.toLowerCase()
            ).length;

            const receivedCount = transactions.filter(
              (tx) =>
                tx.to &&
                account &&
                tx.to.toLowerCase() === account.toLowerCase()
            ).length;

    const disconnectWallet = () => {
      setAccount("");
      setBalance("");
      setNetwork("");
    };

    const fetchTransactions = async (walletAddress, page = 1) => {
      try {
        setLoading(true); 
        console.log("Fetching from backend:", walletAddress);

    
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/transactions/${walletAddress}`)

    const data = await response.json();

      if (data.status === "1") {
      setTransactions(data.result);
      setShowChart(true);        // open chart automatically
      

    } else {
      setTransactions([]);
    }
    setLoading(false);

  } catch (error) {
    console.log("Fetch error:", error);
  }
};

// useEffect(() => {
//       if (activeTab === "history" && account) {
//         fetchTransactions(account, currentPage);
//       }
//     }, [activeTab, currentPage, account]);

useEffect(() => {
  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        setAccount(account);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Placeholder — replace later
        // const contractInstance = new ethers.Contract(
        //   "CONTRACT_ADDRESS_HERE",
        //   ABI_HERE,
        //   signer
        // );

        // setContract(contractInstance);

        const net = await provider.getNetwork();
        setNetwork(net.name);

        const bal = await provider.getBalance(account);
        setBalance(Number(ethers.formatEther(bal)).toFixed(4));
        //fetchTransactions(account, currentPage);
      }

    } catch (err) {
      console.log("Auto connect error:", err);
    }
  };

  checkConnection();
}, []);



 const connectWallet = async () => {
console.log("Ethereum object:", window.ethereum);

if (typeof window.ethereum === "undefined") {
  alert("MetaMask not detected");
  return;
}

if (!window.ethereum.isMetaMask) {
  alert("MetaMask not detected properly");
  return;
}

  try {
    console.log("Requesting accounts...");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const account = accounts[0];
    setAccount(account);
    await fetchTransactions(account);
    setPage("dashboard");

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Get network
    const net = await provider.getNetwork();
    setNetwork(net.name);

    // Get balance
    const bal = await provider.getBalance(account);
    setBalance(Number(ethers.formatEther(bal)).toFixed(4));

  } catch (error) {
    console.log("Error:", error);
  }
};

if (page === "landing") {
          return (
            <div className="landing">
              <h1>AnyWallet</h1>
              <p className="tagline">
                Analyze Ethereum wallets and detect risky behavior instantly
                </p>

              <button
                className="connect-btn"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>

               <div className="features">
                <div className="feature">Risk Analysis</div>
                <div className="feature">Transaction Monitoring</div>
                <div className="feature">Wallet Intelligence</div>
                </div>

            </div>
          );
        }


  return (
    <div className="app">
      <div className="hero">
        <div className="hero-left">
          <h1 className="title">ANYWALLET</h1>
         
        <div className="analyze-container">
         <div className="analyze-row">

      <input
        placeholder="Enter wallet address (0x...)"
        className="wallet-input"
        value={manualAddress}
        onChange={(e) => setManualAddress(e.target.value)}
      />

      <button
      className="analyze-btn"
      onClick={() => {
        if (!ethers.isAddress(manualAddress)) {
          alert("Invalid Ethereum wallet address");
          return;
        }
        setActiveTab("dashboard"); //auto opens dashboard    
        fetchTransactions(manualAddress, 1);
      }}
      disabled={loading}
    >
      {loading ? "Analyzing..." : "Analyze Wallet"}
    </button>

      </div>
      </div>

      <div className="wallet-btn-area">
        {!account ? (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <button className="connect-btn connected" onClick={disconnectWallet}>
            Disconnect ❌
          </button>
        )}
      </div>


        {account && (
            <div className="tabs">
              <button
                  className={activeTab === "dashboard" ? "tab active" : "tab"}
                  onClick={() => setActiveTab("dashboard")}
                >
                  Dashboard
                </button>

                <button
                className={activeTab === "history" ? "tab active" : "tab"}
                onClick={() => {
                  setActiveTab("history");
                  setCurrentPage(1);
                }}
              >
                Transaction History
              </button>

            </div>
          )}

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              Analyzing wallet...
            </div>
          )}

         {account && activeTab === "dashboard" && (
             <div className="dashboard-layout">
            <div className="wallet-panel left-panel">
           <p>
              Address: {account.slice(0,6)}...{account.slice(-5)}
             <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(account);
                alert("Wallet address copied!");
              }}
            >
              Copy
            </button>
            </p>
            <p>Balance: {balance} ETH</p>
            <p> Network: {network}
              <span className={`status-dot ${network === "sepolia" ? "online" : "offline"}`}></span>
            </p>
            <p>
              Wallet Risk Score:{" "}
             <span
                className="wallet-risk"
                style={{
                  color:
                    walletRiskScore < 30
                      ? "#00ff88"
                      : walletRiskScore < 70
                      ? "#ffcc00"
                      : "#ff4d4d"
                }}
              >
                {walletRiskScore} / 100
              </span>
            </p>

          {walletRiskScore > 50 && (
          <div className="risk-warning">
            ⚠️ Suspicious wallet activity detected
          </div>
        )}

            <div className="risk-meter">

              <div className="risk-bar">
               <div
                    className="risk-fill"
                    style={{
                      width: `${walletRiskScore}%`,
                      background:
                        walletRiskScore < 30
                          ? "#00ff88"
                          : walletRiskScore < 70
                          ? "#ffcc00"
                          : "#ff4d4d"
                    }}
                  ></div>
              </div>

              <p>{walletRiskScore} / 100</p>

            </div>

            <p>
              Behavior:{" "}  
              <span className={`wallet-behavior behavior-${walletBehavior.replace(/\s+/g, "-")}`}>
                {walletBehavior}
              </span>
            </p>

            <p className="behavior-info">
              {walletBehavior === "High Risk Wallet" &&
                "This wallet shows suspicious transaction patterns."}

              {walletBehavior === "High Outflow Wallet" &&
                "Most transactions are outgoing transfers."}

              {walletBehavior === "High Activity Wallet" &&
                "This wallet performs many transactions frequently."}

              {walletBehavior === "Passive Wallet" &&
                "This wallet mostly receives funds and rarely sends."}

              {walletBehavior === "Low Activity Wallet" &&
                "Only a few transactions detected."}
            </p>

               <button
                className="chart-toggle"
                onClick={() => setShowChart(!showChart)}
              >
                {showChart ? "Hide Activity Chart" : "Show Activity Chart"}
              </button>     

            <h3 className="analytics-title">Wallet Analytics</h3>
          <div className="analytics-grid">

            <div className="analytics-card">
              <h4>Total Sent</h4>
              <p>{totalSent.toFixed(4)} ETH</p>
            </div>

            <div className="analytics-card">
              <h4>Total Received</h4>
              <p>{totalReceived.toFixed(4)} ETH</p>
            </div>

            <div className="analytics-card">
              <h4>Transactions</h4>
              <p>{transactionCount}</p>
            </div>

            <div className="analytics-card">
              <h4>Avg Transaction</h4>
              <p>{avgTransaction.toFixed(4)} ETH</p>
            </div>

            <div className="analytics-card">
              <h4>Largest Tx</h4>
              <p>{largestTransaction.toFixed(4)} ETH</p>
              </div>

          </div>
          </div>
            {showChart && (
      <div className="chart-panel">
  <h3>Wallet Activity</h3>

<div className="tx-summary">
  Transactions: {transactions.length} |
  Sent: {sentCount} |
  Received: {receivedCount}
</div>

  <PieChart width={300} height={260}>
  <Pie
    data={chartData}
    dataKey="value"
    nameKey="name"
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={90}
    paddingAngle={3}>
    {chartData.map((entry, index) => (
     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
    </Pie>
    <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#00f0ff"
        fontSize="16"
        fontWeight="600"
      >
        Activity
    </text>
  <Tooltip />
  <Legend />
</PieChart>

      </div>
    )}
          </div>
        )}

        

      {account && activeTab === "history" && (
  <div className="history">
    <h2>Transaction History</h2>

    <div className="tx-filters">
      <button onClick={() => setFilter("all")}>All</button>
      <button onClick={() => setFilter("sent")}>Sent</button>
      <button onClick={() => setFilter("received")}>Received</button>
    </div>

    {transactions.length === 0 ? (
      <p>No transactions found.</p>
    ) : (
      <table className="tx-table">
        <thead>
          <tr>
            <th>Hash</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Block</th>
            <th>View</th>
            <th>Risk</th>
          </tr>
        </thead>

        <tbody>
          {transactions
            .filter((tx) => {
              const isSent =
                tx.from?.toLowerCase() === account?.toLowerCase();

              if (filter === "sent") return isSent;
              if (filter === "received") return !isSent;
              return true;
            })
            .map((tx, index) => {
              const amount = parseFloat(ethers.formatEther(tx.value));

                let txRisk = "Low";
                let riskColor = "#00ff88";

                if (amount > 1) {
                  txRisk = "High";
                  riskColor = "#ff4d4d";
                } else if (amount > 0.1) {
                  txRisk = "Medium";
                  riskColor = "#ffcc00";
                }
              const isSent =
                tx.from?.toLowerCase() === account?.toLowerCase();

             

              return (
                <tr
                    key={index}
                    style={{
                      background:
                        parseFloat(amount) > 1 ? "rgba(255,77,77,0.1)" : "transparent"
                    }}
                  >
                  <td>{tx.hash.slice(0, 10)}...</td>
                  <td>{isSent ? "Sent" : "Received"}</td>
                  <td>{parseFloat(amount).toFixed(4)} ETH</td>
                  <td>{tx.blockNumber}</td>
                  <td>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </td>
                  <td>
                  <span style={{ color: riskColor, fontWeight: "bold" }}>
                    {txRisk}
                  </span>
                </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    )}
  </div>
)}

{account && activeTab === "history" && (
  <>
    <div className="pagination">
      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => {
          if (currentPage > 1) {
            const newPage = currentPage - 1;
            setCurrentPage(newPage);
            fetchTransactions(account, newPage);
          }
        }}
      >
        ← Previous
      </button>

      <span className="page-number">Page {currentPage}</span>

      <button
        className="page-btn"
        onClick={() => {
          const newPage = currentPage + 1;
          setCurrentPage(newPage);
          fetchTransactions(account, newPage);
        }}
      >
        Next →
      </button>
    </div>
  </>
)}

      </div>
    </div>
  </div>
);
}

export default App;