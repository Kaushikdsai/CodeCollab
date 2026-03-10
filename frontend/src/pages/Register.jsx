import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register(){
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");

    const navigate=useNavigate();

    const handleSubmit=async (e) => {
        e.preventDefault();
        try{
            const res=await axios.post("http://localhost:5000/api/auth/register", {
                name,email,password
            });
            navigate("/login");
        }
        catch(err){
            console.log(err.response?.data || err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>REGISTER</h1>
            <input placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Enter password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Submit</button>
        </form>
    )
}

export default Register;