import { useState } from "react";
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar";
import "../styles/Home.css";

function Home(){

    const [roomId,setRoomId]=useState("");
    const navigate=useNavigate();

    const createNewRoom = () => {
        const id=Date.now().toString(36) + Math.random().toString(36).substring(2,5);
        navigate(`/room/${id}`);
    }

    const features=[
        {
            title: "Real-time Collaboration",
            desc: "Multiple developers can join the same room and write code together instantly. Every change appears in real-time, enabling seamless pair programming and team collaboration."
        },
        {
            title: "Instant Compilation",
            desc: "Compile and run your code directly in the browser without installing anything. Quickly test logic, debug errors, and see results immediately."
        },
        {
            title: "Multi-Language Support",
            desc: "Write and execute code in multiple programming languages such as Java, Python, and C++. Perfect for interviews, learning, and collaborative projects."
        }
    ];
    const [index,setIndex]=useState(0);
    const nextFeature = () => {
        setIndex((index+1)%features.length);
    }
    const prevFeature = () => {
        setIndex((index-1+features.length)%features.length);
    }

    const joinRoom = () => {
        if(!roomId){
            return;
        }
        navigate(`/room/${roomId}`)
    }

    return (
        <div>
            <Navbar />
            <div className="home-container1">
                <h1 className="home-title">CODE COLLAB</h1>
                <h2 className="home-tag">Collaborate. Compile. Execute.</h2>
                <div className="join-section">
                    <button className="home-newroom" onClick={createNewRoom}>New Room</button>
                    <input className="home-ip" placeholder="Enter Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
                    <button className="home-join" onClick={joinRoom}>Join</button>
                </div>
            </div>
            <div className="features">
                <h2 className="cc-features">Why Code Collab?</h2>
                <div className="carousel">
                    <button className="arrow left" onClick={prevFeature}>❮</button>
                    <div className="feature-card">
                        <h3>{features[index].title}</h3>
                        <p>{features[index].desc}</p>
                    </div>
                    <button className="arrow right" onClick={nextFeature}>❯</button>
                </div>
                <div className="dots">
                    {features.map((_,i)=>(
                        <span
                            key={i}
                            className={i===index ? "dot active":"dot"}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Home;