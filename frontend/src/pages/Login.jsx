import {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/login.css";

const API_URL=import.meta.env.VITE_API_URL;

function Login(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const navigate=useNavigate();

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setError("");
        try{
            const res=await axios.post(`${API_URL}/api/auth/login`,{email,password});
            sessionStorage.setItem("token",res.data.token);
            navigate("/home");
        }
        catch(err){
            setError(err.response?.data?.message||"Login failed");
        }
    };

    return(
        <>
            <Navbar/>
            <form onSubmit={handleSubmit}>
                <h1 className="login-title">LOGIN</h1>
                <input className="login-ip" placeholder="Enter email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                <input className="login-ip" placeholder="Enter password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                {error && <p className="error-msg">{error}</p>}
                <button className="login-btn" type="submit">Submit</button>
                <a href="/register">Create Account</a>
            </form>
        </>
    );
}

export default Login;