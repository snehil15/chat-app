import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
// import Image from "../components/Image";
import "./Chat.css";

const audio = new Audio(require("../audio/notification.mp3"));

const Chat = ({ socket, username, room, hideChat }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [file, setFile] = useState();

  const selectFile = ({ target }) => {
    setFile(target.files[0]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (file) {
      const messageData = {
        id: socket.id,
        room: room,
        author: username,
        type: "file",
        file: file,
        mimeType: file.type,
        message: currentMessage ? currentMessage : file.name,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setFile();
    } else if (currentMessage !== "") {
      const messageData = {
        id: socket.id,
        room: room,
        author: username,
        type: "text",
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
      audio.play();
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

  const renderMessages = (message, index) => {
    // if (message.type === "file") {
    //   const blob = new Blob([message.file], { type: message.type });
    //   return (
    //     <div
    //       key={index}
    //       className={socket.id === message.id ? "msg right" : "msg left"}
    //     >
    //       <Image message={message.message} blob={blob} />
    //       <span className="msg-footer">{message.author}</span>
    //       <span className="msg-footer">{message.time}</span>
    //     </div>
    //   );
    // }
    if (message.type === "text") {
      return (
        <div
          key={index}
          className={socket.id === message.id ? "msg right" : "msg left"}
        >
          <p className="msg-content">{message.message}</p>
          <span className="msg-footer">{message.author}</span>
          <span className="msg-footer">{message.time}</span>
        </div>
      );
    }
    if (message.type === "user_joined" || message.type === "user_left") {
      return (
        <div key={index} className="user-join">
          <p>{message.message}</p>
        </div>
      );
    }
  };

  return (
    <div className="Chat">
      <div className="chat-header">
        <h3>CHAT.EXE</h3>
        <button className="leave-chat" onClick={leaveChat}>
          Leave Chat
        </button>
      </div>

      <ScrollToBottom className="chat-body">
        {messageList.map(renderMessages)}
      </ScrollToBottom>

      <div className="chat-footer">
        <form className="send" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Enter your Message"
            className="msg-input"
            value={currentMessage}
            onChange={({ target }) => setCurrentMessage(target.value)}
          />
          {/* <input
            accept="image/*"
            data-max-size="1000000"
            onChange={selectFile}
            className="file-send"
            type="file"
          /> */}
          <button type="submit" className="msg-send">
            &#9658;
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
