import { useParams } from "react-router-dom";
import { useState,useEffect,useRef } from "react";
import axios from "axios";
import CodeEditor from "../components/Editor";
import OutputPanel from "../components/OutputPanel";
import { socket } from "../services/socket";
import Navbar from "../components/Navbar";
import * as Y from "yjs";
import "../styles/Room.css";

function Room(){
    
    const { roomId }=useParams();

    const [yTextState,setYTextState]=useState(null);
    const [output,setOutput]=useState("");
    const [participants,setParticipants]=useState([]);
    const [language,setLanguage]=useState("java");
    const [isCreator,setIsCreator]=useState(false);

    const token=sessionStorage.getItem("token");
    const ydocRef=useRef(null);
    const yTextRef=useRef(null);
    const timeoutRef=useRef(null);
    const lastSavedRef=useRef("");
    const hasInitializedRef=useRef(false);

    const saveCode=async(code)=>{
        if(lastSavedRef.current===code) return;
        lastSavedRef.current=code;

        try{
            await axios.post("http://localhost:5000/api/room/save",{
                roomId,
                code
            });
        }
        catch(err){
            console.error("Save failed",err);
        }
    };

    useEffect(() => {
        const doc=new Y.Doc();
        const yText=doc.getText("code");

        ydocRef.current=doc;
        yTextRef.current=yText;

        setTimeout(() => {
            setYTextState(yText);
        }, 0);

        const loadCode=async()=>{
            try{
                const res=await axios.get(`http://localhost:5000/api/room/${roomId}`);
                const savedCode=res.data.code;

                if(savedCode && yText.length===0){
                    yText.insert(0,savedCode);
                    hasInitializedRef.current=true;
                }
            }
            catch(err){
                console.error("Load failed",err);
            }
        };

        loadCode();

        socket.auth={ token };
        if(!socket.connected){
            socket.connect();
        }

        const joinRoom=async () => {
            const res=await axios.get(`http://localhost:5000/api/auth/profile`,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const name=res.data;
            socket.emit("join-room", { roomId,name });
        };

        if(socket.connected) joinRoom();
        else socket.on("connect", joinRoom);

        doc.on("update", (update) => {
            socket.emit("yjs-update", { roomId, update: Array.from(update) });

            const currentCode=yTextRef.current?.toString() || "";

            if(timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current=setTimeout(()=>{
                saveCode(currentCode);
            },1000);
        });

        socket.off("yjs-update");
        socket.on("yjs-update", (update) => {
            Y.applyUpdate(doc,new Uint8Array(update));
        });

        let hasSentState=false;

        socket.on("request-doc-state", ({ requester }) => {
            if(!hasSentState){
                hasSentState=true;
                const state=Y.encodeStateAsUpdate(doc);
                socket.emit("send-doc-state", {
                    requester,
                    state: Array.from(state)
                });
            }
        });

        socket.on("receive-doc-state", (state) => {
            if(hasInitializedRef.current) return;
            Y.applyUpdate(doc,new Uint8Array(state));
            hasInitializedRef.current=true;
        });

        socket.on("room-info", ({ creator }) => {
            const payload=JSON.parse(atob(token.split('.')[1]));
            const userId=payload.userId;
            setIsCreator(String(creator)===String(userId));
        });

        socket.on("participants-update", (participants) => {
            setParticipants(participants);
        });

        socket.on("removed-from-room", () => {
            alert("You were removed by the creator");
            window.location.href = "/home";
        });

        socket.on("code-output", (data) => {
            setOutput(data.output || data.compileError || data.runtimeError);
        });

        return () => {
            socket.off("connect");
            socket.off("yjs-update");
            socket.off("request-doc-state");
            socket.off("receive-doc-state");
            socket.off("code-output");
            socket.off("participants-update");
            socket.off("room-info");
            socket.off("removed-from-room");
            doc.destroy();
        };

    }, [roomId]);

    useEffect(()=>{
        const interval=setInterval(()=>{
            const currentCode=yTextRef.current?.toString() || "";
            if(currentCode) saveCode(currentCode);
        },10000);

        return ()=>clearInterval(interval);
    },[]);

    useEffect(()=>{
        const handleBeforeUnload=()=>{
            const code=yTextRef.current?.toString() || "";

            navigator.sendBeacon(
                "http://localhost:5000/api/room/save",
                new Blob([JSON.stringify({ roomId, code })], { type: "application/json" })
            );
        };

        window.addEventListener("beforeunload",handleBeforeUnload);

        return ()=>{
            window.removeEventListener("beforeunload",handleBeforeUnload);
        };
    },[]);

    const handleReset = () => {
        const yText=yTextRef.current;
        if(!yText) return;

        yText.delete(0, yText.length);
        setOutput("");
        saveCode("");
        socket.emit("code-reset", { roomId });
    };

    const runCode=async () => {
        try{
            await axios.post(
                "http://localhost:5000/api/run",
                {
                    code: yTextRef.current?.toString() || "",
                    roomId,
                    language
                },
                {
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                }
            );
        }
        catch(err){
            console.log(err);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="room-container">
                <div className="meet-info">
                    <h2 className="room-title">ROOM: <span>{roomId}</span></h2>
                    <div className="participants">
                        <h3>Active participants</h3>
                        {participants.map((p, index) => (
                            <div key={p.socketId}>
                                {index+1}. <span className="participant-name">{p.name}</span>
                                {isCreator && p.socketId!==socket.id && (
                                    <button className="remove-btn" onClick={() => {
                                        socket.emit("remove-participant", {
                                            roomId,
                                            targetSocketId: p.socketId
                                        });
                                    }}>Remove</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="execution">
                        <label className="lang-label">Choose a language: </label>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                        </select>
                        <button className="run-btn" onClick={runCode}>Run ▶</button>
                        <button className="clr-btn" onClick={handleReset}>Reset ↺</button>
                    </div>

                    {yTextState && (
                        <CodeEditor language={language} yText={yTextState} />
                    )}

                    <div className="output">
                        <OutputPanel output={output} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Room;