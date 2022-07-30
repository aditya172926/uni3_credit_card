import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

export default function Edit() {
    const [form, setForm] = useState({
        name: "",
        user_address: "",
        blockexplorer_link: ""
    });
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();
            const response = await fetch(`http://localhost:5000/record/${params.id.toString()}`);

            if (!response.ok) {
                const message = `An error has occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const record = await response.json();
            if (!record) {
                window.alert(`Record with id ${id} not found`);
                navigate("/");
                return;
            }
            setForm(record);
        }
        fetchData();
        return;
    }, [params.id, navigate]);

    // These methods will update the state properties.
    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();
        const editedInput = {
            name: form.name,
            user_address: form.user_address,
            blockexplorer_link: form.blockexplorer_link
        };
        // This will send a post request to update the data in the database.
        await fetch(`http://localhost:5000/update/${params.id}`, {
            method: "POST",
            body: JSON.stringify(editedInput),
            headers: { 'Content-Type': 'application/json' },
        });
        navigate("/");
    }

    return (
        <div>
            <h3>Update Record</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name: </label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm({ name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="user_address">Address: </label>
                    <input
                        type="text"
                        className="form-control"
                        id="user_address"
                        value={form.user_address}
                        onChange={(e) => updateForm({ user_address: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="blockexplorer_link">Block Explorer Link: </label>
                    <input
                        type="text"
                        className="form-control"
                        id="blockexplorer_link"
                        value={form.blockexplorer_link}
                        onChange={(e) => updateForm({ blockexplorer_link: e.target.value })}
                    />
                </div>
                <br />

                <div className="form-group">
                    <input
                        type="submit"
                        value="Update Record"
                        className="btn btn-primary"
                    />
                </div>
            </form>
        </div>
    )
}