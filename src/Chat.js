import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "./Chat.css";

const Chat = ({ socket, username, room }) => {
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

  useEffect(() => {
    socket.on("recieve_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="Chat">
      <div className="chat-header">
        <h3>Chat App</h3>
      </div>

      <ScrollToBottom className="chat-body">
        {messageList.map((data) => {
          return (
            <div
              key={Math.random() * 999}
              className={username === data.author ? "msg right" : "msg left"}
            >
              <p className="msg-content">{data.message}</p>
              <span className="msg-footer">{data.author}</span>
              <span className="msg-footer">{data.time}</span>
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
