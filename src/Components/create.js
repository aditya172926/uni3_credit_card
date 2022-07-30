import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export default function Create() {
    const [form, setForm] = useState({
        name: "",
        user_address: "",
        blockexplorer_link: ""
    });
    const navigate = useNavigate();

    // these methods will update the state variables
    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();

        // When a post request is sent to the create url, we'll add a new record to the database.
        const newPerson = { ...form };
        await fetch("http://localhost:5000/record/add", {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify(newPerson)
        }).catch(error => {
            window.alert(error);
            return;
        });
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
        </div>
    )
}