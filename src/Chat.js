import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "./Chat.css";

const Chat = ({ socket, username, room, hideChat }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  const leaveChat = () => {
    hideChat();
    socket.emit("leave_room", { room, username });
  };

  useEffect(() => {
    socket.on("recieve_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    socket.on("user_joined", (username) => {
      const data = {
        type: "user_joined",
        message: `${username} joined.`,
      };
      setMessageList((list) => [...list, data]);
    });
    socket.on("user_left", (username) => {
      const data = {
        type: "user_left",
        message: `${username} left.`,
      };
      setMessageList((list) => [...list, data]);
    });
    // socket.on("disconnect", (socket) => {
    //   socket.to(room).emit("leave_room", { room, username });
    // });
  }, [socket]);

  return (
    <div className="Chat">
      <div className="chat-header">
        <h3>Chat App</h3>
        <button className="leave-chat" onClick={leaveChat}>
          Leave Chat
        </button>
      </div>

      <ScrollToBottom className="chat-body">
        {messageList.map((data) => {
          return !data.type ? (
            <div
              key={Math.random() * 999}
              className={username === data.author ? "msg right" : "msg left"}
            >
              <p className="msg-content">{data.message}</p>
              <span className="msg-footer">{data.author}</span>
              <span className="msg-footer">{data.time}</span>
            </div>
          ) : (
            <div className="user-join">
              <p>{data.message}</p>
            </div>
          );
        })}
      </ScrollToBottom>

      <div className="chat-footer">
        <form onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Enter your Message"
            className="msg-input"
            value={currentMessage}
            onChange={({ target }) => setCurrentMessage(target.value)}
          />
          <button type="submit" className="msg-send">
            &#9658;
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
