import logo from './logo.svg';
import './App.css';
import { Route, Routes } from "react-router-dom";
import {ethers} from 'ethers';

import Navbar from "./Components/navbar";
import RecordList from "./Components/recordList";
import Edit from "./Components/edit";
import Create from "./Components/create";
import { useState } from 'react';

function App() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");

  const connectWallet = async() => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        alert("Get Metamask");
        return;
      }
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connected to account, ",accounts[0]);
      const chainId = await window.ethereum.request({method: "eth_chainId"});
      if (chainId != "0x5")
        alert("Please switch to Ethereum Goreli testnet");
      setConnectedAddress(accounts[0]);
      setWalletConnected(true);
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <>
      <Navbar />
      <button className='btn btn-primary' onClick={() => connectWallet()}>Connect Wallet</button>
      <div className='container-fluid m-0'>
        <div className='row'>
          <div className='col-4'>
            <Routes>
              <Route exact path="/" element={<RecordList />} />
            </Routes>
          </div>
          <div className='col-8'>
            lending borrowing stuff
          </div>
        </div>
      </div>
      <Routes>
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </>
  );
}

export default App;
