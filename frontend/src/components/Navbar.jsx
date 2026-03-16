import "../styles/Navbar.css";

function Navbar(){
    const token=sessionStorage.getItem("token");
    return (
        <nav>
            <p>CODE COLLAB</p>
            {token && (
                <a href="/login" onClick={() => sessionStorage.removeItem("token")}>Logout</a>
            )}
            {!token && <a href="/login">Login</a>}
        </nav>
    );
}

export default Navbar;