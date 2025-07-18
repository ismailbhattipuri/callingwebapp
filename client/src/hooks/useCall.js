import { useEffect, useRef, useState } from "react";
import socket from "../socket";

export const useCall = (currentUser) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const peerConnection = useRef(null);

  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    if (!currentUser?._id) return;
    socket.emit("register", currentUser._id);
    console.log("connected", !currentUser?._id)

    socket.on("incoming-call", ({ from }) => {
      setIncomingCall(from);
    });

    socket.on("call-accepted", async () => {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("send-offer", { offer });
    });

    socket.on("hang-up", () => endCall());

    return () => socket.disconnect();
  }, [currentUser]);

  const startCall = async (toUserId) => {
    socket.emit("call-user", { from: currentUser._id, to: toUserId });
  };

  const acceptCall = async () => {
    peerConnection.current = new RTCPeerConnection(servers);
    localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.ontrack = (event) => {
      remoteStream.current.srcObject = event.streams[0];
    };

    setCallAccepted(true);
    socket.emit("accept-call", { from: incomingCall._id, to: currentUser._id });
  };

  const rejectCall = () => {
    socket.emit("reject-call", { from: incomingCall._id });
    setIncomingCall(null);
  };

  const hangUp = () => {
    socket.emit("hang-up", { to: incomingCall?._id || null });
    endCall();
  };

  const endCall = () => {
    setCallAccepted(false);
    setIncomingCall(null);
    localStream.current?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    peerConnection.current = null;
  };

  return {
    incomingCall,
    callAccepted,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
  };
};
