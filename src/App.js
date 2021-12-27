import "./App.css";
import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";

const socket = io.connect("https://jolly-bell-6aeacb.netlify.app/");

function App() {
  const [username, setUsername] = useState();
  const [room, setRoom] = useState();
  const [showChat, setShowChat] = useState();

  const joinRoom = () => {
    if (username && room) {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="join-chat">
          <h3>Join a chat</h3>
          <input
            type="text"
            placeholder="Your name:"
            onChange={({ target }) => setUsername(target.value)}
          />
          <input
            type="text"
            placeholder="Room ID"
            onChange={({ target }) => setRoom(target.value)}
          />
          <button onClick={joinRoom}>Join room</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;
