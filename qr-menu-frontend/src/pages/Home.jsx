import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="home-container">
            <h1>Welcome to the QR Menu Generator</h1>
            <p>
                Please <Link className="link" to="/register">register</Link> or <Link className="link" to="/login">login</Link> to continue.
            </p>
        </div>
    );
};

export default Home;
