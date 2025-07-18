import React from "react";
import { useCallContext } from "../context/CallContext";

export default function CallPopup() {
  const { incomingCall, acceptCall, rejectCall } = useCallContext();

  if (!incomingCall) return null;

  return (
    <div className="fixed top-5 right-5 bg-white shadow-lg p-4 rounded z-50">
      <p>{incomingCall.username} is calling...</p>
      <button onClick={acceptCall} className="bg-green-500 px-3 py-1">Accept</button>
      <button onClick={rejectCall} className="bg-red-500 px-3 py-1 ml-2">Reject</button>
    </div>
  );
}
