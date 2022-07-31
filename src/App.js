import logo from './logo.svg';
import './App.css';
import { Route, Routes } from "react-router-dom";
import { ethers } from 'ethers';

import Navbar from "./Components/navbar";
import RecordList from "./Components/recordList";
import Edit from "./Components/edit";
import Create from "./Components/create";
import { useEffect, useState } from 'react';

function App() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [userBalance, setUserBalance] = useState(0.0);
  const [addressIndex, setAddressIndex] = useState("");


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
      if (chainId != "0x5")
        alert("Please switch to Ethereum Goreli testnet");
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

  const checkIfWalletisConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    const chain = await window.ethereum.request({ method: "eth_chainId" });
    const provider = await new ethers.providers.Web3Provider(ethereum);
    await provider.getBalance(accounts[0]).then((balance) => {
      setUserBalance(ethers.utils.formatEther(balance));
      console.log(balance);
      console.log(userBalance); // printing the balance of the current connected account
    });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      let addressInd = accounts[0].toString().substring(30);
      await setAddressIndex(addressInd);
      await setConnectedAddress(account);
      await setWalletConnected(true);
    } else {
      console.log("No authorized account found");
    }
  }

  useEffect(() => {
    checkIfWalletisConnected();
  }, [connectedAddress]);

  return (
    <>
      <Navbar walletConnected={walletConnected} connectedAddress={connectedAddress} userBalance={userBalance} />
      <button className='btn btn-primary' onClick={() => connectWallet()}>Connect Wallet</button>
      <div className='container-fluid m-0'>
        <div className='row'>
          {walletConnected ? (
            <>
            <div className='col-4'>
            <Routes>
              <Route exact path="/" element={<RecordList address = {connectedAddress} addressInd = {addressIndex} />} />
            </Routes>
          </div>
          <div className='col-8'>
            lending borrowing stuff
          </div>
          </>
          ) : (<></>)}
        </div>
      </div>
      <Routes>
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/create" element={<Create address = {connectedAddress} addressInd = {addressIndex} />} />
      </Routes>
    </>
  );
}

export default App;
