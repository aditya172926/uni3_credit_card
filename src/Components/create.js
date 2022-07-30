import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

export default function Create() {

    const localHostAPI = "http://localhost:5000/";
    const deployedAPI = "https://calm-gold-cougar-hem.cyclic.app/"
    const herokuAPI = "https://uni3server.herokuapp.com/";

    const address = "qqqqqqqqqqq";
    const [form, setForm] = useState({
        name: "",
        user_address: "",
        blockexplorer_link: ""
    });

    const [contactExist, setContactExist] = useState(false);
    const [contactsToAdd, setContactsToAdd] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(0);

    const navigate = useNavigate();
    const params = useParams();


    // these methods will update the state variables
    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function getresp() {
        const response = await fetch(`https://uni3server.herokuapp.com/record/${address}`);
        const result = await response.json();
        console.log(result);
        if (result.contacts.length > 0) {
            setContactsToAdd(result.contacts);
            setCurrentUserId(result._id);
            setContactExist(true);
        }
    }

    async function onSubmit(e) {
        e.preventDefault();

        // When a post request is sent to the create url, we'll add a new record to the database.
        const newPerson = { ...form };
        setContactsToAdd(contactsToAdd.push(newPerson));

        if (contactExist == true) {
            // if contacts already present, then updating
            await fetch(`https://uni3server.herokuapp.com/update/${currentUserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ contactsToAdd, connectedAddress: address })
            }).catch(error => {
                window.alert(error);
                return;
            });
        } else {
            // if no contacts then adding a new entry
            await fetch("https://uni3server.herokuapp.com/record/add", {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({ contactsToAdd, connectedAddress: address })
            }).catch(error => {
                window.alert(error);
                return;
            });
        }
        setForm({ name: "", user_address: "", blockexplorer_link: "" });
        navigate("/");
    }

    // this displays the form and takes input from the user
    return (
        <div>
            <h3>Create New Record</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="user_address">Address</label>
                    <input
                        type="text"
                        className="form-control"
                        id="user_address"
                        value={form.user_address}
                        onChange={(e) => updateForm({ user_address: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="blockexplorer_link">Block explorer Link</label>
                    <input
                        type="text"
                        className="form-control"
                        id="blockexplorer_link"
                        value={form.blockexplorer_link}
                        onChange={(e) => updateForm({ blockexplorer_link: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <input
                        type="submit"
                        value="Create person"
                        className="btn btn-primary"
                    />
                </div>
            </form>
            <button className='btn btn-primary' onClick={getresp}>test</button>
        </div>
    )
}