import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';

const AllUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/sample/users");
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();
    }, []);

    

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">All Users</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {users.map((user, id) => (
                    <div
                        key={id}
                        className="bg-white rounded-xl shadow-md p-5 flex items-center space-x-5 hover:shadow-lg transition"
                    >
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-16 h-16 rounded-full border border-gray-300"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                            <p className="text-gray-400 text-xs">ID: {user._id}</p>

                            {user.isOnline ? (
                                <p className="text-green-600 text-sm font-medium">🟢 Online</p>
                            ) : (
                                <>
                                    <p className="text-red-600 text-sm font-medium">🔴 Offline</p>
                                    <p className="text-gray-500 text-sm">
                                        Last seen : {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllUsers;
