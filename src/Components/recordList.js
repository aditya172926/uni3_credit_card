import React, { useEffect, useRef, useState } from "react";
import { ethers } from 'ethers';

const digitalcard_abi = require('../utils/Digitalcard_abi.json');
const erc20_abi = require('../utils/erc20_abi.json');


const Record = (props) => (
    <>
        <div className="accordion-item" style={{ backgroundColor: "transparent" }}>
            <h2 className="accordion-header" id={props.record.user_address}>
                <div className="d-flex">
                    <button className="accordion-button collapsed" style={{ backgroundColor: "transparent", color: "#3B0847" }}
                        type="button" data-bs-toggle="collapse" data-bs-target={props.accordion_id}
                        aria-expanded="false" aria-controls={props.control_accordion}>
                        {props.record.name}
                    </button>
                    <button className="btn btn-primary py-0" style={{ height: "42px" }} type="button" onClick={() => props.setAddress(props.record.user_address)}>Request</button>
                </div>
            </h2>
            <div id={props.control_accordion} className="accordion-collapse collapse" style={{ backgroundColor: "white" }} aria-labelledby={props.record.user_address} data-bs-parent="#contacts_accordion">
                <div className="d-flex align-items-center">
                    <div className="accordion-body">{props.record.user_address.substring(0, 8)}...{props.record.user_address.substring(38)}</div>
                    <a href={props.block_explorer_link} target="_blank" rel="noreferrer" role="button"><button className="btn btn-primary">Open</button></a>
                </div>
            </div>
        </div>
    </>
);

export default function RecordList(props) {
    const [records, setRecords] = useState([]);
    const [requestToken, setRequestToken] = useState("USDc");
    const [requestAddressVal, setRequestAddressVal] = useState("");
    const [potentialBorrowers, setPotentialBorrowers] = useState([]);
    const [showRepaymentCard, setShowRepaymentCard] = useState(false);
    const [historyType, setHistoryType] = useState("Lending");
    const [repayBorrow, setRepayBorrow] = useState({});

    // contract events
    const [borrowEvents, setBorrowEvents] = useState([]);
    const [lendingEvents, setLendingEvents] = useState([]);
    const [repaymentEvents, setRepaymentEvents] = useState([]);

    const USDcAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";

    const addressInd = props.addressInd.toString();
    console.log(window.addressInd);
    console.log(addressInd);
    console.log(addressInd.type);
    console.log("Fetch contacts of this address ", addressInd);
    const herokuAPI = "https://uni3server.herokuapp.com";

    // This method fetches the records from the database.
    useEffect(() => {
        async function getRecords() {
            const response = await fetch(`https://uni3server.herokuapp.com/record/${addressInd}`);
            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
            const records = await response.json();
            console.log(records);
            console.log(records.contacts[0].name);
            setRecords(records.contacts);
        }
        getRecords();

        return;
    }, [records.length]);

    // this method will delete a record
    async function deleteRecord(id) {
        await fetch(`http://localhost:5000/${id}`, {
            method: "DELETE"
        });
        const newRecords = records.filter((el) => el._id !== id);
        setRecords(newRecords);
    }

    const reqAddress = useRef();
    const requestAmount = useRef();

    const connectToContract = () => {
        const { ethereum } = window;
        if (!ethereum) {
            alert("Get MetaMask!");
            return;
        }
        const provider = new ethers.providers.Web3Provider(ethereum);
        console.log(provider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(props.contractAddress, digitalcard_abi, signer);
        return contract;
    }

    const onSubmitRequest = async () => {
        const { ethereum } = window;
        let amount = (requestAmount.current.value).toString();
        let decimal_places;
        if (amount.includes('.')) {
            decimal_places = amount.split('.')[1].length;
        }
        try {
            if (ethereum) {
                const uni3contract = await connectToContract();

                const reqTxn = await uni3contract.initiateBorrowRequest(
                    (reqAddress.current.value).toString(),
                    (requestAmount.current.value * (10 ** decimal_places)).toString(),
                    requestToken,
                    decimal_places.toString()
                );
                console.log("Mining...", reqTxn.hash);
                await reqTxn.wait();
                console.log("Mined -- ", reqTxn.hash);

            }
        } catch (error) {
            console.log(error);
        }
        // await getBorrowRequests();
    }

    const getBorrowRequests = async (address) => {
        const { ethereum } = window;
        try {
            if (ethereum) {
                const uni3contract = await connectToContract();
                const postedReq = await uni3contract.getBorrowerRequests(address);
                console.log(postedReq);
                return ({
                    borrower: address,
                    lender: postedReq[0],
                    decimal_places: postedReq[1],
                    amount: postedReq[2],
                    tokenType: postedReq[3],
                    repayments: postedReq[4],
                    gotLoan: postedReq[5]
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getLendingRequest = async () => {
        const { ethereum } = window;
        try {
            if (ethereum) {
                const uni3contract = await connectToContract();
                const reqArray = await uni3contract.getBorrowers();
                console.log(reqArray); // will get the array of users who asked you htmlFor money
                // setPotentialBorrowers(reqArray);
                setPotentialBorrowers([]);
                for (let i = 0; i < reqArray.length; i++) {
                    console.log(reqArray[i]);
                    setPotentialBorrowers([
                        ...potentialBorrowers,
                        await getBorrowRequests(reqArray[i])
                    ]);
                }
                console.log(potentialBorrowers);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        let uni3contract;
        const onBorrowRequested = (lender, borrower, amount) => {
            console.log("New borrow request");
        }
        if (window.ethereum) {
            uni3contract = new ethers.providers.Web3Provider(window.ethereum);
            uni3contract.on("borrowRequested", onBorrowRequested);
        }
    });

    const getRequestEvents = async () => {

        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        try {
            if (ethereum) {
                const Uni3contract = await connectToContract();

                // borrow requests that I have received from others
                let borrow = await Uni3contract.filters.borrowRequested(props.connectedAddress, null); // gets the logs of borrow requests: The event goes this way (lender, borrower, amount)
                let lend = await Uni3contract.filters.moneyLent(props.connectedAddress, null);

                console.log(borrow);
                console.log(lend);

                borrow.fromBlock = 0;
                lend.fromBlock = 0;

                let borrowLogs = await provider.getLogs(borrow); // this one works
                console.log(...borrowLogs);
                setBorrowEvents([...borrowLogs,]);
                let lendLogs = await provider.getLogs(lend);
                console.log(lendLogs);
                setLendingEvents([...lendLogs,]);
            }
        } catch (error) {
            console.log("Some error happened ", error);
        }
        console.log(borrowEvents);
    }

    function BorrowEventsComponent() {
        return (
            borrowEvents.map((result, index) => {
                let blockexplorer_link = `https://goerli.etherscan.io/tx/${result.transactionHash}`;
                return (
                    // <p key={index}>{result.data}</p>
                    <div className="alert alert-primary" role="alert" key={index}>
                        From - ...{result.topics[1].substring(58)} | To - ...{result.topics[2].substring(58)} | Amount - {parseInt(result.data, 16)} | <a href={blockexplorer_link} target="_blank" rel="noreferrer">Open</a>
                    </div>
                )
            })
        )
    }

    function LendEventsComponent() {
        return (
            lendingEvents.map((result, index) => {
                let blockexplorer_link = `https://goerli.etherscan.io/tx/${result.transactionHash}`;
                let to = ethers.utils.getAddress(ethers.utils.hexStripZeros(result.data.substring(0, 66)));
                let from = ethers.utils.getAddress(ethers.utils.hexStripZeros(result.topics[1]));
                let amount = parseInt(result.data.substring(66, 130), 16);

                console.log(to);
                console.log(from);
                console.log(parseInt(amount, 16));
                return (
                    // <p key={index}>{result.data}</p>
                    <div className="alert alert-primary" role="alert" key={index}>
                        To - {to.substring(0, 8)}...{to.substring(38)} | From - {from.substring(0, 8)}...{from.substring(38)} | Amount - {amount} | <a href={blockexplorer_link} target="_blank" rel="noreferrer">Open</a>
                    </div>
                )
            })
        )
    }

    function GetHistoryEvents() {
        if (historyType == "Lending") {
            return (<LendEventsComponent />);
        } else if (historyType == "Borrowing") {
            return (<BorrowEventsComponent />);
        }
    }

    useState(() => {
        GetHistoryEvents();
    }, [historyType]);

    async function approve(_price) {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(USDcAddress, erc20_abi, signer);
        console.log(contract);
        console.log(_price);
        let amount = (_price * (10 ** 6));
        console.log(amount);
        amount = Math.ceil(amount);
        console.log(amount);
        const result = await contract.approve(props.contractAddress, amount.toString());
        await result.wait();
        console.log(result);

        return result;
    }

    const grantBorrowRequest = async (amount, index, tokenType, borrower, decimal_places) => {
        console.log(amount, index, tokenType, borrower);
        const { ethereum } = window;
        try {
            if (ethereum) {
                const uni3contract = await connectToContract();
                let grant_amount = amount * (10 ** (6 - decimal_places));
                await approve(grant_amount);
                const lendTxn = await uni3contract.lendTokens(borrower, tokenType, grant_amount, index);
                console.log("Mining...", lendTxn.hash);
                await lendTxn.wait();
                console.log("Mined -- ", lendTxn.hash);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const submitRepayRequest = async (to, amount, installment, decimal_places) => {
        console.log("Repay request made");
        let repay_amount = requestAmount.current.value * (10 ** (6 - decimal_places));
        // let repay_amount = requestAmount.current.value;
        let interest_amt;
        let treasury_amt;
        if (installment == 3) {
            interest_amt = repay_amount * 0.01;
            treasury_amt = repay_amount * 0.005;
        } else if (installment == 2) {
            interest_amt = repay_amount * 0.02;
            treasury_amt = repay_amount * 0.01;
        } else if (installment == 1) {
            interest_amt = repay_amount * 0.03;
            treasury_amt = repay_amount * 0.015;
        }
        console.log(interest_amt, treasury_amt);
        const { ethereum } = window;
        try {
            if (ethereum) {
                const uni3contract = await connectToContract();
                interest_amt = Math.ceil(interest_amt);
                treasury_amt = Math.ceil(treasury_amt);
                await approve(repay_amount + interest_amt + treasury_amt);
                const repayTxn = await uni3contract.repay(to, repay_amount, interest_amt, treasury_amt);
                console.log("Mining...", repayTxn.hash);
                await repayTxn.wait();
                console.log("Mined -- ", repayTxn.hash);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function requestList() {
        return potentialBorrowers.map((request, index) => {
            console.log(request);
            let accordion_id = "#collapse" + index;
            let control_accordion = "collapse" + index;
            return (
                <div className="accordion accordion-flush" style={{ backgroundColor: "#3B0847" }} id="requests_accordion">
                    <div className="accordion-item" style={{ backgroundColor: "#3B0847" }}>
                        <h2 className="accordion-header" id={index}>
                            <div className="d-flex">
                                <button className="accordion-button collapsed" style={{ backgroundColor: "#3B0847", color: "white" }}
                                    type="button" data-bs-toggle="collapse" data-bs-target={accordion_id}
                                    aria-expanded="false" aria-controls={control_accordion}>
                                    {request.borrower.substring(0, 8)}...{request.borrower.substring(38)}
                                </button>
                                <button className="btn btn-primary py-0" style={{ height: "42px" }}
                                    type="button" onClick={() => grantBorrowRequest(
                                        request.amount,
                                        index,
                                        request.tokenType,
                                        request.borrower,
                                        request.decimal_places
                                    )}>
                                    Grant
                                </button>
                            </div>
                        </h2>
                        <div id={control_accordion} className="accordion-collapse collapse"
                            style={{ backgroundColor: "white" }} aria-labelledby={index} data-bs-parent="#requests_accordion">
                            <div className="d-flex align-items-center">
                                <div className="accordion-body">
                                    Amount - {request.amount} {request.tokenType}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        });
    }

    useEffect(() => {
        getLendingRequest();
        requestList();
    }, [props.address, props.currentNetwork]);

    function recordList() {
        return records.map((record) => {
            let accordion_id = "#collapse" + record.user_address;
            let control_accordion = "collapse" + record.user_address;
            let block_explorer_link = `https://goerli.etherscan.io/address/${record.user_address}`;
            return (
                // <Record record={record.name} deleteRecord={() => deleteRecord(record._id)} key={record._id} />
                <Record record={record} key={record.user_address}
                    accordion_id={accordion_id} control_accordion={control_accordion}
                    block_explorer_link={block_explorer_link} setAddress={setRequestAddressVal} />
            );
        });
    }

    const switchToRepay = async () => {
        let repayObj = await getBorrowRequests(props.address);
        setRepayBorrow({ ...repayObj });
        setShowRepaymentCard(true);
    }

    function RepayComponent() {
        console.log(repayBorrow);
        return (<div className="alert alert-primary mt-5" role="alert">
            {repayBorrow.gotLoan ? (
                <>
                    From - {repayBorrow.lender.substring(0, 8)}...{repayBorrow.lender.substring(38)} | Amount {(repayBorrow.amount * (10 ** (-repayBorrow.decimal_places)))}
                </>

            ) : (
                <>
                    No loans granted
                </>
            )}

        </div>
        )
    }

    return (
        <div className="row">
            <div className="col-3 mt-5">
                <h3>Contacts</h3>
                <div className="accordion accordion-flush" style={{ backgroundColor: "transparent" }} id="contacts_accordion">
                    {recordList()}
                </div>
            </div>
            <div className="col-6 text-center">
                Lending protocol section
                <button className='btn btn-primary' onClick={() => getRequestEvents()}>Request Events</button>

                {/* <button className='btn btn-primary' onClick={() => testing()}>Testing</button> */}
                <div className="row justify-content-center mt-5">
                    <div className="card text-bg-dark text-center" style={{ width: "80%" }}>
                        <div className="btn-group my-3" role="group" aria-label="Basic radio toggle button group">
                            <input type="radio" className="btn-check" name="btnradio" onClick={() => setShowRepaymentCard(false)} id="btnradio1" autoComplete="off" />
                            <label className="btn btn-outline-primary" htmlFor="btnradio1">
                                Borrow
                            </label>

                            <input type="radio" className="btn-check" name="btnradio"
                                onClick={() => switchToRepay()} id="btnradio2" autoComplete="off" />
                            <label className="btn btn-outline-primary" htmlFor="btnradio2">
                                Repay
                            </label>
                        </div>
                        {showRepaymentCard ? (
                            <>
                                <div className="card-body">
                                    <form>
                                        <div className="mt-4 mb-2">
                                            <label htmlFor="inputAddress" className="form-label"><h4>To</h4></label>
                                            <input type="text" className="form-control" id="inputAddress"
                                                aria-describedby="addressHelp"
                                                placeholder="0x0000000000000000000000000000000000000000" required ref={reqAddress} />
                                        </div>
                                        <div className="mt-4 mb-2">
                                            <label htmlFor="inputAmount" className="form-label"><h4>Amount</h4></label>
                                        </div>
                                        <div className="input-group mb-3">
                                            <input ref={requestAmount} type="number"
                                                className="form-control" id="inputAmount"
                                                aria-describedby="amountHelp" placeholder="0.0" required />
                                            <span className="input-group-text" id="basic-addon2">
                                                <div className="dropdown">
                                                    <button className="btn btn-secondary dropdown-toggle"
                                                        type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <b>{requestToken}</b>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-dark">
                                                        <li>
                                                            <a href="#" className="btn btn-link dropdown-item" onClick={() => setRequestToken("USDc")}>
                                                                USDc
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a href="#" className="btn btn-link dropdown-item" onClick={() => setRequestToken("ETH")}>
                                                                ETH
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </span>
                                        </div>
                                        <div className="d-grid gap-2 col-6 mx-auto mt-5 mb-3">
                                            <button className="btn btn-primary" type="button"
                                                onClick={() => submitRepayRequest(
                                                    repayBorrow.lender,
                                                    repayBorrow.amount,
                                                    repayBorrow.repayments,
                                                    repayBorrow.decimal_places
                                                )}>
                                                Repay
                                            </button>
                                        </div>
                                    </form>
                                </div>

                            </>) : (
                            <>
                                <div className="card-body">
                                    <form>
                                        <div className="mt-4 mb-2">
                                            <label htmlFor="inputAddress" className="form-label"><h4>From</h4></label>
                                            <input type="text" className="form-control" id="inputAddress"
                                                aria-describedby="addressHelp" value={requestAddressVal}
                                                placeholder="0x0000000000000000000000000000000000000000" required ref={reqAddress} />
                                        </div>
                                        <div className="mt-4 mb-2">
                                            <label htmlFor="inputAmount" className="form-label"><h4>Amount</h4></label>
                                        </div>
                                        <div className="input-group mb-3">
                                            <input ref={requestAmount} type="number" className="form-control" id="inputAmount" aria-describedby="amountHelp" placeholder="0.0" required />
                                            <span className="input-group-text" id="basic-addon2">
                                                <div className="dropdown">
                                                    <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                        <b>{requestToken}</b>
                                                    </button>
                                                    <ul className="dropdown-menu dropdown-menu-dark">
                                                        <li><a href="#" className="btn btn-link dropdown-item" onClick={() => setRequestToken("USDc")}>USDc</a></li>
                                                        <li><a href="#" className="btn btn-link dropdown-item" onClick={() => setRequestToken("ETH")}>ETH</a></li>
                                                    </ul>
                                                </div>
                                            </span>
                                        </div>
                                        <div className="d-grid gap-2 col-6 mx-auto mt-5 mb-3">
                                            <button className="btn btn-primary" type="button" onClick={() => onSubmitRequest()}>Send Request</button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        )}

                    </div>
                </div>
                <div className="row justify-content-center my-5">
                    <h4>Histories</h4>
                    <div className="btn-group my-3" role="group" aria-label="Basic radio toggle button group">
                        <input type="radio" className="btn-check" name="btnradio" id="btnradio3" onClick={() => setHistoryType("Lending")} autoComplete="off" />
                        <label className="btn btn-outline-primary" htmlFor="btnradio3">Lending</label>

                        <input type="radio" className="btn-check" name="btnradio" id="btnradio4" onClick={() => setHistoryType("Borrowing")} autoComplete="off" />
                        <label className="btn btn-outline-primary" htmlFor="btnradio4">Borrowing</label>
                    </div>
                    <GetHistoryEvents />
                </div>
            </div>
            <div className="col-3 text-center mt-5">
                Requests section
                {showRepaymentCard ? (
                    <>
                        <RepayComponent />
                    </>
                ) : (
                    <>
                        {requestList()}
                    </>

                )}

            </div>
        </div >
    );
}