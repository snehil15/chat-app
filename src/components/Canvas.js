import React, { useEffect, useRef, useState } from "react";
import "./Canvas.css";

const Canvas = ({ socket, room }) => {
  const canvasRef = useRef();
  const [ctx, setCtx] = useState({});
  const [mouseDown, setMouseDown] = useState(false);
  const [color, setColor] = useState("black");
  const [current, setCurrent] = useState({});
  var rect = {};

  useEffect(() => {
    setCtx(canvasRef.current.getContext("2d"));
    rect = canvasRef.current.getBoundingClientRect();
  });

  useEffect(() => {
    let ctx = canvasRef.current.getContext("2d");
    console.log("use effect");
    // socket.on("onmousedown", (data) => {
    //   ctx.beginPath();
    //   ctx.moveTo(data.x, data.y);
    // });
    socket.on("ondraw", (data, color) => {
      drawLine(data, color, false);
    });
    socket.on("onclear", () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.beginPath();
    });
    socket.on("bgcolorchange", (color) => {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, rect.width, rect.height);
    });
  }, [socket]);

  const throttle = (callback, delay) => {
    var prevCall = 0;
    return (...args) => {
      var now = new Date().getTime();
      if (now - prevCall >= delay) {
        prevCall = now;
        return callback(...args);
      }
    };
  };

  const drawLine = (data, color, emit) => {
    let ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(data.x1, data.y1);
    ctx.lineTo(data.x2, data.y2);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();

    if (!emit) return;
    socket.emit("drawing", room, data, color);
  };

  const onMouseMove = async (e) => {
    if (!mouseDown) return;
    let relX = e.clientX - rect.x;
    let relY = e.clientY - rect.y;
    drawLine({ x1: current.x, y1: current.y, x2: relX, y2: relY }, color, true);
    setCurrent((prev) => {
      return {
        ...prev,
        x: relX,
        y: relY,
      };
    });
  };

  const onMouseDown = async (e) => {
    setMouseDown(true);
    let relX = e.clientX - rect.x;
    let relY = e.clientY - rect.y;
    setCurrent((prev) => {
      return {
        ...prev,
        x: relX,
        y: relY,
      };
    });
  };

  const onMouseUp = (e) => {
    if (!mouseDown) return;
    let relX = e.clientX - rect.x;
    let relY = e.clientY - rect.y;
    setMouseDown(false);
    drawLine({ x1: current.x, y1: current.y, x2: relX, y2: relY }, color, true);
  };

  const onClear = () => {
    ctx.clearRect(0, 0, rect.width, rect.height);
    socket.emit("clear", room);
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
        <input
          className="color-picker"
          type="color"
          onChange={(e) => {
            setColor(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

export default Canvas;
