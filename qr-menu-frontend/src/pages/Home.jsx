import { Link } from "react-router-dom";
import NavBar from "../components/NavBar"; // Импортираме NavBar

const Home = () => {
    const token = localStorage.getItem("token");

    return (
        <div>
            {/* Показване на навигационната лента, ако потребителят е логнат */}
            {token && <NavBar />}

            <div className="home-container">
                <h1>Welcome to the QR Menu Generator</h1>
                {!token ? (
                    <p>
                        Please <Link className="link" to="/register">register</Link> or <Link className="link" to="/login">login</Link> to continue.
                    </p>
                ) : (
                    <p>Explore our features and manage your QR menus with ease!</p>
                )}
            </div>
        </div>
    );
};

export default Home;
