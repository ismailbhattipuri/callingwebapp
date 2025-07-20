import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Zoom from "./pages/Zoom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AllUsers from "./pages/AllUsers";
import Header from "./components/Header";
import Register from "./pages/Register";
import Room from "./pages/Room";
import Call from "./pages/Call";


const user = JSON.parse(sessionStorage.getItem("user"))
const App = () => {
  return (
    <Router>
      <Header  />
      <Routes>

        <Route path="/" element={<Home  />} />
        <Route path="/zoom" element={<Zoom  />} />
        <Route path="/call" element={<Call  />} />
        <Route path="/allusers" element={<AllUsers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </Router>
  );
};

export default App;
