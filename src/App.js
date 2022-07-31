import logo from './logo.svg';
import './App.css';
import { Route, Routes } from "react-router-dom";
import { ethers } from 'ethers';

import Navbar from "./Components/navbar";
import RecordList from "./Components/recordList";
import Edit from "./Components/edit";
import Create from "./Components/create";
import { useEffect, useState } from 'react';

const erc20_abi = require('./utils/erc20_abi.json');

function App() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [userBalance, setUserBalance] = useState(0.0);
  const [addressIndex, setAddressIndex] = useState("");
  const [tokenBalances, setTokenBalances] = useState({
    eth: 0.00,
    usdc: 0.00,
    uni: 0.00
  });
  const [currentNetwork, setCurrentNetwork] = useState({
    networkName: "",
    chainId: ""
  });


  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected to account, ", accounts[0]);
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId != "0x5" && chainId != "0x13881") {
        alert("Please switch to Ethereum Goreli or Polygon Mumbai testnet");
        setCurrentNetwork({ networkName: "", chainId: "0x0" });
      }
      if (chainId == "0x5")
        await setCurrentNetwork({ networkName: "Goreli", chainId: chainId });
      if (chainId == "0x13881")
        await setCurrentNetwork({ networkName: "Mumbai", chainId: chainId });

      console.log("The current network stats", currentNetwork);

      await setConnectedAddress(accounts[0]);
      let addressInd = accounts[0].toString().substring(30);
      window.addressInd = addressInd;
      console.log(window.addressInd);
      console.log(addressInd);
      await setAddressIndex(addressInd);
      await setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  }

  // check if wallet is already connected
  const checkIfWalletisConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== "0x5" && chainId !== "0x13881") {
      alert("Please switch to Ethereum Goreli or Polygon Mumbai testnet");
      setCurrentNetwork({ networkName: "", chainId: "0x0" });
    }
    if (chainId == "0x5")
      await setCurrentNetwork({ networkName: "Goreli", chainId: chainId });
    if (chainId == "0x13881")
      await setCurrentNetwork({ networkName: "Mumbai", chainId: chainId });
    const provider = await new ethers.providers.Web3Provider(ethereum);

    let eth_balance;
    let USDc_balance;
    let UNI_balance;

    await provider.getBalance(accounts[0]).then((balance) => {
      setUserBalance(ethers.utils.formatEther(balance));
      eth_balance = ethers.utils.formatEther(balance);
      console.log("Balance of ETH ", ethers.utils.formatEther(balance));
      console.log(userBalance); // printing the balance of the current connected account
    });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      let addressInd = accounts[0].toString().substring(30);
      await setAddressIndex(addressInd);
      await setConnectedAddress(account);
      await setWalletConnected(true);

      // getting token balance
      const USDc_token = "0x07865c6e87b9f70255377e024ace6630c1eaa37f"; // for goreli testnet
      const USDc_contract = new ethers.Contract(USDc_token, erc20_abi, provider);
      await USDc_contract.balanceOf(accounts[0]).then((balance) => {
        USDc_balance = (((balance.toNumber()) * (10 ** (-6)))).toFixed(2);
        console.log("USDc balance is ", USDc_balance);
      });

      setTokenBalances({
        eth: eth_balance,
        usdc: USDc_balance,
        uni: UNI_balance
      });
      console.log(tokenBalances);

    } else {
      console.log("No authorized account found");
    }
  }

  useEffect(() => {
    checkIfWalletisConnected();
  }, [connectedAddress]);

  return (
    <>
      <Navbar walletConnected={walletConnected} connectedAddress={connectedAddress} userBalance={userBalance} balances={tokenBalances} currentNetwork={currentNetwork} />

      <div className='container-fluid m-0' style={{ backgroundColor: "#3B0847", color:"white" }}>
        <button className='btn btn-primary' onClick={() => connectWallet()}>Connect Wallet</button>
        <div className='row'>
          {walletConnected ? (
            <>
              <div className='col-3'>
                <Routes>
                  <Route exact path="/" element={<RecordList address={connectedAddress} addressInd={addressIndex} />} />
                </Routes>
              </div>
              <div className='col-9'>
                Lending protocol section
              </div>
            </>
          ) : (<></>)}
        </div>
      </div>
      <Routes>
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/create" element={<Create address={connectedAddress} addressInd={addressIndex} />} />
      </Routes>
    </>
  );
}

export default App;
