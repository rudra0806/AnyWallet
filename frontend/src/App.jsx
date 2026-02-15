import { useState } from "react";
import { ethers } from "ethers";

function App() {
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [balance, setBalance] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const net = await provider.getNetwork();

      setAccount(accounts[0]);

      const bal = await provider.getBalance(accounts[0]);
      setBalance(Number(ethers.formatEther(bal)).toFixed(4));

      if (net.chainId === 11155111n) {
        setNetwork("sepolia");
      } else {
        setNetwork("mainnet");
      }

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="page">

     <div className="floating-cube cube1">
  <div className="cube-face front"></div>
  <div className="cube-face back"></div>
  <div className="cube-face right"></div>
  <div className="cube-face left"></div>
  <div className="cube-face top"></div>
  <div className="cube-face bottom"></div>
</div>

<div className="floating-cube cube2">
  <div className="cube-face front"></div>
  <div className="cube-face back"></div>
  <div className="cube-face right"></div>
  <div className="cube-face left"></div>
  <div className="cube-face top"></div>
  <div className="cube-face bottom"></div>
</div>


      <div className="card">
        <h1>AnyWallet</h1>
        <p className="subtitle">Cyber Wallet Risk Analyzer</p>

        <button onClick={connectWallet}>
          Connect Wallet
        </button>

        {account && (
          <>
            <p>{account.slice(0,6)}...{account.slice(-4)}</p>
            <p>Network: {network}</p>
            <p>Balance: {balance} ETH</p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
