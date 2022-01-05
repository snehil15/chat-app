import React, { useEffect, useRef, useState } from "react";
import "./Canvas.css";

const Canvas = ({ socket, room }) => {
  const canvasRef = useRef();
  const [ctx, setCtx] = useState({});
  const [mouseDown, setMouseDown] = useState(false);
  const [color, setColor] = useState("black");
  var rect = {};
  let x, y;

  useEffect(() => {
    setCtx(canvasRef.current.getContext("2d"));
    rect = canvasRef.current.getBoundingClientRect();
  });

  useEffect(() => {
    let curCtx = canvasRef.current.getContext("2d");
    console.log("use effect");
    socket.on("onmousedown", (data) => {
      curCtx.beginPath();
      curCtx.moveTo(data.x, data.y);
    });
    socket.on("ondraw", (data) => {
      curCtx.lineCap = "round";
      curCtx.lineWidth = 5;
      curCtx.strokeStyle = data.color;
      curCtx.lineTo(data.x, data.y);
      curCtx.stroke();
      curCtx.beginPath();
      curCtx.moveTo(data.x, data.y);
    });
    socket.on("onclear", () => {
      curCtx.clearRect(0, 0, rect.width, rect.height);
      curCtx.beginPath();
    });
    socket.on("bgcolorchange", (color) => {
      curCtx.fillStyle = color;
      curCtx.fillRect(0, 0, rect.width, rect.height);
    });
  }, [socket]);

  const throttle = (callback, delay) => {
    var prevCall = 0;
    return (...args) => {
      // console.log(arguments);
      var now = new Date().getTime();
      if (now - prevCall >= delay) {
        prevCall = now;
        return callback(...args);
      }
    };
  };

  const onMouseMove = async (e) => {
    x = e.clientX - rect.x;
    y = e.clientY - rect.y;
    if (!mouseDown) return;
    await socket.emit("drawing", room, x, y, color);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onMouseDown = async (e) => {
    let relX = e.clientX - rect.x;
    let relY = e.clientY - rect.y;
    // console.log(e.clientX, rect.x, e.clientY, rect.y);
    ctx.beginPath();
    ctx.moveTo(relX, relY);
    await socket.emit("mousedown", room, relX, relY);
    setMouseDown(true);
  };

  const onMouseUp = () => {
    if (!mouseDown) return;
    setMouseDown(false);
    ctx.beginPath();
  };

  const onClear = () => {
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.beginPath();
    socket.emit("clear", room);
  };

  const onColorChange = (e) => {
    setColor(e.target.value);
  };

  const onFill = (e) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, rect.width, rect.height);
    socket.emit("bgcolor", room, color);
  };

  return (
    <div className="canvas-container">
      <canvas
        id="canvas"
        ref={canvasRef}
        height="600"
        width="800px"
        onMouseMove={throttle(onMouseMove, 10)}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseOut={onMouseUp}
      ></canvas>
      <button className="clear-btn" onClick={onClear}>
        clear
      </button>
      <div className="right">
        <button className="bucket" onClick={onFill}></button>
        <input className="color-picker" type="color" onChange={onColorChange} />
      </div>
    </div>
  );
};

export default Canvas;
