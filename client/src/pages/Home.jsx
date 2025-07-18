import React, { useEffect, useState } from "react";
import { useCall } from "../hooks/useCall";
import { useNavigate } from "react-router-dom";
import socket from "../socket";


export default function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    console.log(user)
    useEffect(() => {
        const userDetails = JSON.parse(sessionStorage.getItem("user"));
        console.log(userDetails)
        if (userDetails == null) {
            navigate("/login");
            return;
        }
        setUser(userDetails)
    }, [navigate]);

    const [calleeId, setCalleeId] = useState("");
    const {
        startCall,
        callAccepted,
        localStream,
        remoteStream,
        hangUp
    } = useCall(user);

    const handleCall = () => {
        if (!calleeId.trim()) {
            alert("Please enter a User ID to call.");
            return;
        }
        startCall(calleeId.trim());
    };

    useEffect(() => {
        // Notify backend user is online
        socket.emit("user-online", user?._id);

        const handleBeforeUnload = () => {
            socket.emit("user-offline", user?._id); // Notify backend user is offline
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            handleBeforeUnload(); // Also emit when component unmounts
        };
    }, [user?._id]);

    // useEffect(() => {
    //     const user = JSON.parse(sessionStorage.getItem("user"));
    //     if (!user) return;

    //     const interval = setInterval(() => {
    //         socket.emit("heartbeat", user._id);
    //     }, 10000); // every 10 seconds

    //     return () => clearInterval(interval);
    // }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}</h2>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter User ID to Call"
                    className="border px-3 py-2 rounded mr-2"
                    value={calleeId}
                    onChange={(e) => setCalleeId(e.target.value)}
                />
                <button onClick={handleCall} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Call
                </button>
            </div>

            {callAccepted && (
                <div className="bg-gray-100 p-4 rounded shadow">
                    <h3 className="mb-2 font-medium">In Call</h3>
                    <div className="flex gap-4">
                        <video
                            ref={(el) => el && localStream.current && (el.srcObject = localStream.current)}
                            autoPlay muted className="w-1/2 rounded"
                        />
                        <video
                            ref={(el) => el && remoteStream.current && (el.srcObject = remoteStream.current)}
                            autoPlay className="w-1/2 rounded"
                        />
                    </div>
                    <button onClick={hangUp} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
                        Hang Up
                    </button>
                </div>
            )}
        </div>
    );
}
