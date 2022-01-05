import React, { useEffect, useRef, useState } from "react";
import "./Canvas.css";

const Canvas = ({ socket, room }) => {
  const canvasRef = useRef();
  const [ctx, setCtx] = useState({});
  const [mouseDown, setMouseDown] = useState(false);
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
      curCtx.lineWidth = 3;
      curCtx.lineTo(data.x, data.y);
      curCtx.stroke();
    });
    socket.on("onclear", () => {
      curCtx.clearRect(0, 0, rect.width, rect.height);
      curCtx.beginPath();
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
    await socket.emit("drawing", room, x, y);
    ctx.lineWidth = 3;
    ctx.lineTo(x, y);
    ctx.stroke();
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
    ctx.closePath();
    setMouseDown(false);
  };

  const onClear = () => {
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.beginPath();
    socket.emit("clear", room);
  };

  return (
    <div className="canvas-container">
      <canvas
        id="canvas"
        ref={canvasRef}
        height="600px"
        width="700px"
        onMouseMove={throttle(onMouseMove, 15)}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseOut={onMouseUp}
      ></canvas>
      <button onClick={onClear}>clear</button>
    </div>
  );
};

export default Canvas;
