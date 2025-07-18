import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import socket from "../socket";



const Login = () => {
  const navigate = useNavigate();
  const { baseURL } = useApi();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${baseURL}/auth/login`, formData);
      const user = res.data.user;

      setMessage(`✅ ${res.data.message}`);
      setFormData({
        email: "",
        password: "",
      });

      // ✅ Save user in sessionStorage
      sessionStorage.setItem("user", JSON.stringify(user));

      // ✅ Emit socket event to mark user online
      socket.emit("register", user._id);

      // ✅ Redirect to homepage
      navigate("/");
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || "Login failed"}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      {message && <p className="mb-4 text-sm text-red-500">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border px-3 py-2 rounded-md"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            className="w-full border px-3 py-2 rounded-md"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      <p className="text-sm text-center text-gray-500 mt-4">
        Don’t have an account? <Link to="/register" className="text-blue-600 cursor-pointer">Register</Link>
      </p>
    </div>
  );
};

export default Login;
