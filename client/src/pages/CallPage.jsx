import { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function CallPage() {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const pc = useRef(new RTCPeerConnection());

  const [myId, setMyId] = useState("");
  const [users, setUsers] = useState({});

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
      socket.emit("register-user", socket.id);
    });

    socket.on("online-users", setUsers);

    socket.on("incoming-call", async ({ from, offer }) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => pc.current.addTrack(track, stream));
      localVideo.current.srcObject = stream;

      await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.emit("answer-call", { to: from, answer });

      pc.current.ontrack = (e) => {
        remoteVideo.current.srcObject = e.streams[0];
      };
    });

    socket.on("call-answered", async ({ answer }) => {
      await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    });
  }, []);

  const callUser = async (targetId) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(track => pc.current.addTrack(track, stream));
    localVideo.current.srcObject = stream;

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    pc.current.ontrack = (e) => {
      remoteVideo.current.srcObject = e.streams[0];
    };

    socket.emit("call-user", { to: targetId, offer });
  };

  return (
    <div>
      <h2>My ID: {myId}</h2>
      <h3>Online Users</h3>
      <ul>
        {Object.keys(users).map(id => id !== myId && (
          <li key={id}>
            {id}
            <button onClick={() => callUser(id)}>Call</button>
          </li>
        ))}
      </ul>
      <video ref={localVideo} autoPlay playsInline muted />
      <video ref={remoteVideo} autoPlay playsInline />
    </div>
  );
}
