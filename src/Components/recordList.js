import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Record = (props) => (
    <>
        <div className="accordion-item">
            <h2 className="accordion-header" id={props.record.user_address}>
                <button className="accordion-button collapsed" style={{ backgroundColor: "#3B0847", color: "white" }}
                    type="button" data-bs-toggle="collapse" data-bs-target={props.accordion_id}
                    aria-expanded="false" aria-controls={props.control_accordion}>
                    {props.record.name}
                </button>
            </h2>
            <div id={props.control_accordion} className="accordion-collapse collapse" aria-labelledby={props.record.user_address} data-bs-parent="#contacts_accordion">
                <div className="accordion-body">{props.record.user_address}</div>
                <a href={props.record.blockexplorer_link} target="_blank" rel="noreferrer" role="button">Block Link</a>
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

    function recordList() {
        return records.map((record) => {
            let accordion_id = "#collapse" + record.user_address;
            let control_accordion = "collapse" + record.user_address;
            return (
                // <Record record={record.name} deleteRecord={() => deleteRecord(record._id)} key={record._id} />
                <Record record={record} key={record.user_address} accordion_id={accordion_id} control_accordion={control_accordion} />
            );
        });
    }

    // This following section will display the table with the records of individuals.
    return (
        <div>
            <h3>Contacts</h3>
            <div className="accordion accordion-flush" style={{ backgroundColor: "#3B0847" }} id="contacts_accordion">
                {recordList()}
            </div>
        </div>
    );
}