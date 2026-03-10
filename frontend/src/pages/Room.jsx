import { useParams } from "react-router-dom";
import { useState,useEffect } from "react";
import axios from "axios";
import CodeEditor from "../components/Editor";
import OutputPanel from "../components/OutputPanel";
import { socket } from "../services/socket";

function Room(){
    const { roomId }=useParams();

    const [code,setCode]=useState("");
    const [output,setOutput]=useState("");

    useEffect(() => {
        socket.emit("join-room",roomId);
        socket.on("code-update", (newCode) => {
            setCode(newCode);
        });
        return () => socket.off("code-update");
    }, [roomId]);

    const handleCodeChange = (code) => {
        setCode(code);
        socket.emit("code-change", {
            roomId,
            code: code
        })
    }

    const runCode=async () => {
        try{
            const res=await axios.post("http://localhost:5000/api/run", {code});
            const data=res.data;
            setOutput(data.output || data.compileError || data.runtimeError);
        }
        catch(err){
            console.log(err);
        }
    }

    return (
        <div>
            <h2>ROOM: {roomId}</h2>
            <CodeEditor code={code} setCode={handleCodeChange} />
            <button onClick={runCode}>Run Code</button>
            <OutputPanel output={output} />
        </div>
    )
}

export default Room;