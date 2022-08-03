import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

export default function Create(props) {

    const localHostAPI = "http://localhost:5000/";
    const deployedAPI = "https://calm-gold-cougar-hem.cyclic.app/"
    const herokuAPI = "https://uni3server.herokuapp.com";

    const address = props.address;
    const addressInd = props.addressInd;
    console.log("Adding contact to this address ", addressInd);
    const [form, setForm] = useState({
        name: "",
        user_address: "",
        blockexplorer_link: ""
    });

    const [contactExist, setContactExist] = useState(false);
    const [contactsToAdd, setContactsToAdd] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(0);

    const navigate = useNavigate();

    // these methods will update the state variables
    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function getresp() {
        const response = await fetch(`${herokuAPI}/record/${addressInd}`);
        const result = await response.json();
        console.log(result);
        if (result.contacts.length > 0) {
            setContactsToAdd(result.contacts);
            setCurrentUserId(result._id);
            setContactExist(true);
        }
    }

    useEffect(() => {
        getresp();
    });

    async function onSubmit(e) {
        e.preventDefault();

        // When a post request is sent to the create url, we'll add a new record to the database.
        const newPerson = { ...form };
        setContactsToAdd(contactsToAdd.push(newPerson));

        if (contactExist == true) {
            // if contacts already present, then updating
            await fetch(`${herokuAPI}/update/${currentUserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ contactsToAdd, connectedAddress: addressInd })
            }).catch(error => {
                window.alert(error);
                return;
            });
        } else {
            // if no contacts then adding a new entry
            await fetch(`${herokuAPI}/record/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify({ contactsToAdd, connectedAddress: addressInd })
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
        <div className='container text-center' style={{width: "50%"}}>
            <h3 className='my-4'>Add New Contact</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group my-4">
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        className="form-control my-4"
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                    />
                </div>
                <div className="form-group my-4">
                    <label htmlFor="user_address">Address</label>
                    <input
                        type="text"
                        className="form-control my-4"
                        id="user_address"
                        placeholder='0x0000000000000000000000000000000000000000'
                        value={form.user_address}
                        onChange={(e) => updateForm({ user_address: e.target.value })}
                    />
                </div>
                <div className="form-group my-4">
                    <label htmlFor="blockexplorer_link">Block explorer Link</label>
                    <input
                        type="text"
                        className="form-control my-4"
                        id="blockexplorer_link"
                        placeholder='Optional'
                        value={form.blockexplorer_link}
                        onChange={(e) => updateForm({ blockexplorer_link: e.target.value })}
                    />
                </div>
                <div className="form-group my-4">
                    <input
                        type="submit"
                        value="Add Contact"
                        className="btn btn-primary"
                    />
                </div>
                <br />
                <br />
                
            </form>
        </div>
    )
}