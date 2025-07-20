import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import PeerService from "../service/peer";

const Call = () => {
  const socket = useSocket();
  const [targetEmail, setTargetEmail] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);

  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const remoteAudioRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const currUser = JSON.parse(sessionStorage.getItem("user"));
    if (currUser?.email) {
      socket.emit("register", { email: currUser.email });
    }

    const getMediaAccess = () => {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: true })
        .then((stream) => {
          setMyStream(stream);
          console.log("✅ Mic & Camera stream set");

          stream.getTracks().forEach((track) => {
            PeerService.peer.addTrack(track, stream);
          });

          PeerService.peer.ontrack = ({ streams: [remoteStream] }) => {
            setRemoteStream(remoteStream);
            if (remoteAudioRef.current || remoteVideoRef.current) {
              remoteAudioRef.current.srcObject = remoteStream;
              remoteVideoRef.current.srcObject = remoteStream;
            }
          };

          PeerService.peer.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", {
                to: targetEmail || incomingCall?.fromSocketId,
                candidate: event.candidate,
              });
            }
          };
        })
        .catch((err) => {
          console.error("❌ Error accessing media devices:", err);
          alert("Please ensure camera & microphone access is enabled.");
        });
    };

    if (navigator.permissions) {
      Promise.all([
        navigator.permissions.query({ name: "microphone" }),
        navigator.permissions.query({ name: "camera" }),
      ])
        .then(([micStatus, camStatus]) => {
          if (micStatus.state === "granted" && camStatus.state === "granted") {
            getMediaAccess();
          } else {
            getMediaAccess(); // trigger prompt
          }
        })
        .catch(() => getMediaAccess());
    } else {
      getMediaAccess();
    }
  }, []);

  useEffect(() => {
    if ((remoteAudioRef.current || remoteVideoRef.current) && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleCallUser = async () => {
    if (!myStream) {
      alert("Microphone access required before making a call.");
      return;
    }

    const offer = await PeerService.getOffer();
    socket.emit("call:request", {
      to: targetEmail,
      offer,
    });
  };

  const acceptCall = async () => {
    if (!myStream || !incomingCall?.offer) {
      alert("Mic access and valid offer required.");
      return;
    }

    const answer = await PeerService.getAnswer(incomingCall.offer);
    socket.emit("call:accept", {
      to: incomingCall.fromSocketId,
      answer,
    });

    setCallActive(true);
    setIncomingCall(null);
  };

  const rejectCall = () => {
    socket.emit("call:reject", { to: incomingCall.fromSocketId });
    setIncomingCall(null);
  };

  const hangUp = () => {
    socket.emit("call:hangup");

    // Stop all tracks of local stream
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }

    // Stop all tracks of remote stream (optional)
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    // Close the peer connection
    if (PeerService.peer) {
      PeerService.peer.close();
      PeerService.createNewPeer(); // Optional: reinitiate for reuse
    }

    // Clear state
    setCallActive(false);
    setRemoteStream(null);
    setMyStream(null);
  };

  useEffect(() => {
    socket.on("call:incoming", ({ fromEmail, fromSocketId, offer }) => {
      setIncomingCall({ fromEmail, fromSocketId, offer });
    });

    socket.on("call:accepted", async ({ answer }) => {
      await PeerService.setLocalDescription(answer);
      setCallActive(true);
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await PeerService.peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate", err);
      }
    });

    socket.on("call:hangup", () => {
      PeerService.peer.close();
      setCallActive(false);
      setRemoteStream(null);
      setMyStream(null);
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("ice-candidate");
      socket.off("call:hangup");
    };
  }, [socket, incomingCall, targetEmail]);
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Make a Call</h1>
      <input
        type="text"
        placeholder="Enter email or ID"
        value={targetEmail}
        onChange={(e) => setTargetEmail(e.target.value)}
        className="p-2 border mb-4 w-64 rounded"
      />
      <button
        onClick={handleCallUser}
        className="bg-blue-500 text-white p-2 rounded mb-4"
      >
        Call
      </button>

      {incomingCall && !callActive && (
        <div className="bg-white p-4 shadow rounded">
          <p>{incomingCall.fromEmail} is calling...</p>
          <button
            onClick={acceptCall}
            className="bg-green-500 text-white p-2 rounded m-2"
          >
            Accept
          </button>
          <button
            onClick={rejectCall}
            className="bg-red-500 text-white p-2 rounded m-2"
          >
            Reject
          </button>
        </div>
      )}

      {callActive && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-green-600 mb-2">Call Active</p>
          <button
            onClick={hangUp}
            className="bg-red-600 text-white p-2 rounded mt-2"
          >
            Hang Up
          </button>
          <audio
            ref={remoteVideoRef}
            muted={false}
            autoPlay
            controls
            className="mt-4"
          />
          <video ref={remoteAudioRef} autoPlay playsInline muted controls />
        </div>
      )}
    </div>
  );
};

export default Call;
