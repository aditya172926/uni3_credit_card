import React, { useEffect, useRef, useState } from "react";
import { ethers } from 'ethers';

const digitalcard_abi = require('../utils/Digitalcard_abi.json');
const erc20_abi = require('../utils/erc20_abi.json');


const Record = (props) => (
    <>
        <div className="accordion-item" style={{ backgroundColor: "#3B0847" }}>
            <h2 className="accordion-header" id={props.record.user_address}>
                <div className="d-flex">
                    <button className="accordion-button collapsed" style={{ backgroundColor: "#3B0847", color: "white" }}
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
        {/* <li className="list-group-item">{props.record.name}</li> */}
    </>

    // <tr>
    //     <td>{props.record.name}</td>
    //     <td>{props.record.user_address}</td>
    //     <td>{props.record.blockexplorer_link}</td>
    //     {/* {props.record.contacts.map((name) => {
    //         return (<td>{name}</td>);

    //     })} */}
    //     {/* <td>
    //         <Link className="btn btn-link" to={`/edit/${props.record._id}`}>Edit</Link> |
    //         <button className="btn btn-link"
    //             onClick={() => {
    //                 props.deleteRecord(props.record._id);
    //             }}
    //         >
    //             Delete
    //         </button>
    //     </td> */}
    // </tr>
);

export default function RecordList(props) {
    const [records, setRecords] = useState([]);
    const [requestToken, setRequestToken] = useState("USDc");
    const [requestAddressVal, setRequestAddressVal] = useState("");
    const [potentialBorrowers, setPotentialBorrowers] = useState([]);

    const USDcAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";

    const address = "bbbbbbbbbbb";
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
        try {
            if (ethereum) {
                const uni3contract = await connectToContract();

                const reqTxn = await uni3contract.initiateBorrowRequest(
                    (reqAddress.current.value).toString(),
                    (requestAmount.current.value).toString(),
                    requestToken,
                    "1"
                );
                console.log("Mining...", reqTxn.hash);
                await reqTxn.wait();
                console.log("Mined -- ", reqTxn.hash);

            }
        } catch (error) {
            console.log(error);
        }
        await getBorrowRequests();
    }

    const getBorrowRequests = async (address) => {
        const { ethereum } = window;
        try {
            if (ethereum) {
                const uni3contract = await connectToContract();
                const postedReq = await uni3contract.getBorrowerRequests(address);
                console.log(postedReq[0]);
                return ({ borrower: address, amount: postedReq[1], tokenType: postedReq[2] });
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
                console.log(reqArray); // will get the array of users who asked you for money
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

    async function approve(_price) {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(USDcAddress, erc20_abi, signer);
        console.log(contract);
        let amount = _price * (10**6);
        console.log(amount);
        const result = await contract.approve(props.contractAddress, amount.toString());
        await result.wait();
        console.log(result);

        return result;
      }

    const grantBorrowRequest = async (amount, index, tokenType, borrower) => {
        console.log(amount, index, tokenType, borrower);
        const { ethereum } = window;
        try {
            if (ethereum) {
                const uni3contract = await connectToContract();
                await approve(amount);
                const lendTxn = await uni3contract.lendTokens(borrower, tokenType, amount, index);
                console.log("Mining...", lendTxn.hash);
                await lendTxn.wait();
                console.log("Mined -- ", lendTxn.hash);
            }
        } catch(error) {
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
                                    type="button" onClick={() => grantBorrowRequest(request.amount, index, request.tokenType, request.borrower)}>
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

    // This following section will display the table with the records of individuals.
    return (
        <div className="row">
            <div className="col-3 mt-5">
                <h3>Contacts</h3>
                <div className="accordion accordion-flush" style={{ backgroundColor: "#3B0847" }} id="contacts_accordion">
                    {recordList()}
                </div>
            </div>
            <div className="col-6 text-center">
                Lending protocol section
                <div className="row justify-content-center mt-5">
                    <div className="card text-bg-dark text-center" style={{ width: "80%" }}>
                        <div className='card-header'>Request To Borrow</div>
                        <div className="card-body">

                            <form>
                                <div className="mb-3">
                                    <label for="inputAddress" class="form-label">From</label>
                                    <input type="text" class="form-control" id="inputAddress"
                                        aria-describedby="addressHelp" value={requestAddressVal}
                                        placeholder="0x0000000000000000000000000000000000000000" required ref={reqAddress} />
                                </div>
                                <div className="my-2">
                                    <label for="inputAmount" class="form-label">Amount</label>
                                </div>
                                <div className="input-group mb-3">
                                    <input ref={requestAmount} type="number" class="form-control" id="inputAmount" aria-describedby="amountHelp" placeholder="0.0" required />
                                    <span class="input-group-text" id="basic-addon2">
                                        <div class="dropdown">
                                            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <b>{requestToken}</b>
                                            </button>
                                            <ul class="dropdown-menu dropdown-menu-dark">
                                                <li><a href="#" class="btn btn-link dropdown-item" onClick={() => setRequestToken("USDc")}>USDc</a></li>
                                                <li><a href="#" class="btn btn-link dropdown-item" onClick={() => setRequestToken("ETH")}>ETH</a></li>
                                            </ul>
                                        </div>
                                    </span>
                                </div>
                                <div class="d-grid gap-2 col-6 mx-auto">
                                    <button className="btn btn-primary" type="button" onClick={() => onSubmitRequest()}>Send Request</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-3 text-center mt-5">
                Requests section
                {requestList()}
            </div>
        </div>
    );
}