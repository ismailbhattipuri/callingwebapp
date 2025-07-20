import { useEffect, useCallback, useState, useRef } from "react";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [mute, setMute] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);


  const handleUserJoined = useCallback(({ email, id }) => {
    // console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      // console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      // console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // console.log("Remote Socket ID:", remoteSocketId);

  return (
    <div className="call-container h-screen w-screen flex flex-col items-center justify-center">
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {/* {myStream && <button className="bg-blue-500 text-white p-2 rounded mt-4" onClick={sendStreams}>Send Stream</button>} */}
      {remoteSocketId && (
        <button
          className="bg-blue-500 text-white p-2 rounded mt-4"
          onClick={handleCallUser}
        >
          CALL
        </button>
      )}
      {myStream && (
        <>
          <video
            ref={myVideoRef}
            autoPlay
            muted={mute}
            playsInline
            className="w-1/2 h-auto border border-gray-300"
          />
          <button
            className="bg-red-500 text-white p-2 rounded mt-4"
            onClick={() => {
              setMute((prev) => !prev);
            }}
          >
            mute
            {mute ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                class="feather feather-volume-x"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                class="feather feather-volume-2"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19 5c1.5 1.5 2.5 3.5 2.5 6s-1 4.5-2.5 6"></path>
                <path d="M15 9.4a4 4 0 0 1 0 5.2"></path>
              </svg>
            )}
          </button>
          <button
            className="bg-red-500 text-white p-2 rounded mt-4"
            onClick={() => {
              setVideoEnabled((prev) => {
                const newState = !prev;
                if (myStream) {
                  myStream.getVideoTracks().forEach((track) => {
                    track.enabled = newState;
                  });
                }
                return newState;
              });
            }}
          >
            {videoEnabled ? "Mute Video" : "Unmute Video"}
          </button>
          <button
            className="bg-red-500 text-white p-2 rounded mt-4"
            onClick={() => {
              myStream.getTracks().forEach((track) => track.stop());
              setMyStream(null);
            }}
          >
            Stop Stream
          </button>
        </>
      )}

      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            className="w-1/2 h-auto border border-gray-300"
          />
        </>
      )}
    </div>
  );
};

export default Room;
