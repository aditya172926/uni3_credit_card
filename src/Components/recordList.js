import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Record = (props) => (
    <tr>
        <td>{props.record.name}</td>
        <td>{props.record.user_address}</td>
        <td>{props.record.blockexplorer_link}</td>
        {/* {props.record.contacts.map((name) => {
            return (<td>{name}</td>);

        })} */}
        {/* <td>
            <Link className="btn btn-link" to={`/edit/${props.record._id}`}>Edit</Link> |
            <button className="btn btn-link"
                onClick={() => {
                    props.deleteRecord(props.record._id);
                }}
            >
                Delete
            </button>
        </td> */}
    </tr>
);

export default function RecordList() {
    const [records, setRecords] = useState([]);
    const address = "qqqqqqqqqqq";

    // This method fetches the records from the database.
    useEffect(() => {
        async function getRecords() {
            const response = await fetch(`https://uni3server.herokuapp.com/record/${address}`);            
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
            return (
                // <Record record={record.name} deleteRecord={() => deleteRecord(record._id)} key={record._id} />
                <Record record={record} />
            );
        });
    }

    // This following section will display the table with the records of individuals.
    return (
        <div>
            <h3>Record List</h3>
            <div>
                {/* {recordList()} */}
            </div>
            <table className="table table-striped" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Block Explorer Link</th>
                        <th>Contact of</th>
                    </tr>
                </thead>
                <tbody>{recordList()}</tbody>
            </table>
        </div>
    );
}