import { Navigate,BrowserRouter,Routes,Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Room from "./pages/Room";
import ProtectedRoute from "./components/ProtectedRoute";

function App(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace/>}/>
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/room/:roomId" element={<ProtectedRoute><Room /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;