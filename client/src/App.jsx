
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";


import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import AllUsers from "./pages/AllUsers";
import Header from "./components/Header";
import Register from "./pages/Register";


const user = JSON.parse(sessionStorage.getItem("user"))
const App = () => {
  return (
    <Router>
      <Header  />
      <Routes>
        <Route path="/" element={<Home  />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/allusers" element={<AllUsers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
