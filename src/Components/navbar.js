import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { SwapWidget } from '@uniswap/widgets'
import '@uniswap/widgets/fonts.css'
import { Modal } from "react-bootstrap";
import { ethers } from "ethers";

export default function Navbar(props) {
    const [showSwapModal, setShowSwapModal] = useState(false);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const onHideModal = () => {
        setShowSwapModal(false);
    }

    const changeNetwork = async (chainId) => {
        if (props.currentNetwork.chainId == chainId) {
            console.log("You are on the same chain");
            return;
        }
        if (chainId == "0x5") {
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: chainId }],
                });
            } catch (switchError) {
                window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [{
                        chainId: "0x5",
                        rpcUrls: ["https://goerli.infura.io/v3/"],
                        chainName: "Goerli Test Network",
                        nativeCurrency: {
                            name: "GoerliETH",
                            symbol: "GoerliETH",
                            decimals: 18
                        },
                        blockExplorerUrls: ["https://goerli.etherscan.io"]
                    }]
                });
            }
        }
        if (chainId == "0x13881") {
            window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [{
                    chainId: "0x13881",
                    rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
                    chainName: "Mumbai Testnet",
                    nativeCurrency: {
                        name: "MATIC",
                        symbol: "MATIC",
                        decimals: 18
                    },
                    blockExplorerUrls: ["https://polygonscan.com/"]
                }]
            });
        }
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <NavLink className="navbar-brand" to="/">
                        Uni3
                    </NavLink>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {props.walletConnected ? (
                        <div className="d-flex" id="navbarSupportedContent">
                            <div className="dropdown">
                                <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {props.currentNetwork.networkName}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-start">
                                    <li>
                                        <button className='btn btn-success dropdown-item' onClick={() => changeNetwork("0x13881")}>Polygon Mumbai</button>
                                    </li>
                                    <li>
                                        <button className='btn btn-success dropdown-item' onClick={() => changeNetwork("0x5")}>Ethereum Goreli</button>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <ul className="navbar-nav ml-auto">
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/create">
                                            Add Contact
                                        </NavLink>
                                    </li>
                                    <li className="nav-item dropdown">
                                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            Balance
                                        </a>
                                        <ul className="dropdown-menu dropdown-menu-dark">
                                            <li><a className="dropdown-item" href="#">ETH - {parseFloat(props.balances.eth).toFixed(4)}</a></li>
                                            <li><a className="dropdown-item" href="#">USDc - {props.balances.usdc}</a></li>
                                            <li><a className="dropdown-item" href="#">UNI - {props.balances.UNI}</a></li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>
                            <div className="card" style={{ height: "26px", marginTop: "7px" }}>
                                <div className="card-body py-0">
                                    {props.connectedAddress.substring(0, 8)}...{props.connectedAddress.substring(38)}
                                </div>
                            </div>
                            <button className="btn btn-primary mx-2" onClick={() => setShowSwapModal(true)}>
                                Swap
                            </button>
                        </div>
                    ) : (
                        <></>
                    )}

                </div>
            </nav>
            <Modal show={showSwapModal} onHide={onHideModal} centered className="connectWalletModal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        Swap Tokens
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="container">
                        <br></br>
                        <div className="row">
                            <div className="col text-center">
                                <div className="Uniswap">
                                    <SwapWidget
                                        provider={provider}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}