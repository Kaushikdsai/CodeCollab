import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");

    const navigate=useNavigate();

    const handleSubmit=async (e) => {
        e.preventDefault();
        try{
            const res=await axios.post("http://localhost:5000/api/auth/login", {
                email,password
            });
            const data=res.data;
            localStorage.setItem("token",data.token);
            navigate("/home");
        }
        catch(err){
            console.log(err.response?.data || err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>LOGIN</h1>
            <input placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Submit</button>
            <a href="/register">Create Account</a>
        </form>
    )
}

export default Login;