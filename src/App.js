import "./App.css";
import { io } from "socket.io-client";
import { useState } from "react";
import Chat from "./components/Chat";
import Canvas from "./components/Canvas";
import Chungus from "./images/chungus.gif";

const socket = io("https://chat-server-socketio1.herokuapp.com/");
// const socket = io("http://localhost:3001", {
//   forceNew: true,
// });

function App() {
  const [username, setUsername] = useState();
  const [room, setRoom] = useState();
  const [showChat, setShowChat] = useState();
  const [width, setWidth] = useState(window.innerWidth);

  window.addEventListener("resize", () => {
    setWidth(window.innerWidth);
  });

  const joinRoom = (e) => {
    e.preventDefault();
    if (username && room) {
      socket.emit("join_room", { room, username });
      setShowChat(true);
    }
  };

  const hideChat = () => {
    setShowChat(false);
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="join-chat">
          <h3>JOIN A CHAT</h3>
          <form onSubmit={joinRoom}>
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
            <button type="submit" className="join-chat-btn">
              Join room
            </button>
          </form>
        </div>
      ) : (
        <>
          <Chat
            socket={socket}
            username={username}
            room={room}
            hideChat={hideChat}
          />
          {width > 1000 ? <Canvas socket={socket} room={room} /> : ""}
        </>
      )}
      <img className="chungus" src={Chungus} height="75px" width="75px" />
    </div>
  );
}

export default App;
