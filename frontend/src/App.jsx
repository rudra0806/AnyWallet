import { useState } from "react";
import { ethers } from "ethers";

function App() {
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");


const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send("eth_requestAccounts", []);
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    setAccount(accounts[0]);

    if (chainId === "0xaa36a7") {
      setNetwork("sepolia");
    } else if (chainId === "0x1") {
      setNetwork("mainnet");
    } else {
      setNetwork("unknown");
    }

  } catch (error) {
    console.log(error);
  }
};


  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>AnyWallet</h1>
      <h2>Wallet Risk Analyzer</h2>

      <button
        onClick={connectWallet}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        Connect Wallet
      </button>

      {account && (
        <p style={{ marginTop: "20px" }}>
         Connected Account: {account.slice(0,6)}...{account.slice(-4)}

        </p>
      )}
      {network && (
  <p style={{ marginTop: "10px" }}>
    Network: {network}
  </p>
)}

    </div>
  );
}

export default App;
