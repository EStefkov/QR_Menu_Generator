
import { Link } from "react-router-dom";

const Home = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to the QR Menu Generator</h1>
            <p className="text-lg mb-6">
                Please <Link className="text-blue-500 underline" to="/register">register</Link> or <Link className="text-blue-500 underline" to="/login">login</Link> to continue.
            </p>
        </div>
    );
};

export default Home;
