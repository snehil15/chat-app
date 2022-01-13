import React, { useEffect, useRef, useState } from "react";
import "./Canvas.css";

const Canvas = ({ socket, room }) => {
  const canvasRef = useRef();
  const canvasContainerRef = useRef();
  const [ctx, setCtx] = useState({});
  const [mouseDown, setMouseDown] = useState(false);
  const [color, setColor] = useState("black");
  const [myInterval, setMyInterval] = useState();
  const [current, setCurrent] = useState({});
  const [brushSize, setBrushSize] = useState(4);
  var rect = {};

  useEffect(() => {
    setCtx(canvasRef.current.getContext("2d"));
    rect = canvasRef.current.getBoundingClientRect();
  });

  useEffect(() => {
    let ctx = canvasRef.current.getContext("2d");
    socket.on("ondraw", (data, color, brushSize) => {
      drawLine(data, color, brushSize, false);
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

  useEffect(() => {
    if (color === "") {
      setMyInterval(
        setInterval(() => {
          setColor(getRandomColor());
        }, 3000)
      );
    }
  }, [color]);

  const getRandomColor = () => {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // const debounce = (callback, delay) => {
  //   let timeoutID;
  //   return (...args) => {
  //     if (timeoutID) {
  //       clearTimeout(timeoutID);
  //     }
  //     timeoutID = setTimeout(() => {
  //       callback(...args);
  //     }, delay);
  //   };
  // };

  const throttle = (callback, delay) => {
    var prevCall = new Date().getTime();
    return (...args) => {
      var now = new Date().getTime();
      if (now - prevCall >= delay) {
        prevCall = now;
        return callback(...args);
      }
    };
  };

  const drawLine = (data, color, brushSize, emit) => {
    if(!canvasRef || !canvasRef.current) return;
    let ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(data.x1, data.y1);
    ctx.lineTo(data.x2, data.y2);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    ctx.lineWidth = brushSize;
    ctx.stroke();
    ctx.beginPath();

    if (!emit) return;
    socket.emit("drawing", room, data, color, brushSize);
  };

  const onMouseMove = async (e) => {
    if (!mouseDown) return;
    let relX = e.clientX - rect.x;
    let relY = e.clientY - rect.y;
    drawLine(
      { x1: current.x, y1: current.y, x2: relX, y2: relY },
      color,
      brushSize,
      true
    );
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
    drawLine(
      { x1: current.x, y1: current.y, x2: relX, y2: relY },
      color,
      brushSize,
      true
    );
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

  const onBrushSizeChange = (e) => {
    setBrushSize(e.target.value);
  };

  const clearMyInterval = (color) => {
    setColor(color);
    clearInterval(myInterval);
  }

  return (
    <div className="jamboard">
      <div ref={canvasContainerRef} className="canvas-container">
        <div className="canvas-header">
          <h3>JAMBOARD.EXE</h3>
        </div>
        <canvas
          id="canvas"
          ref={canvasRef}
          height={window.innerHeight * 0.87}
          width={window.innerWidth * 0.58}
          onMouseMove={throttle(onMouseMove, 10)}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseOut={onMouseUp}
        ></canvas>
        <div className="canvas-footer">
          <button className="clear-btn" onClick={onClear}>
            Clear
          </button>
          <input
            className="color-picker"
            type="color"
            onChange={(e) => {
              setColor(e.target.value);
              clearInterval(myInterval);
            }}
          />
          <input
            min="1"
            max="30"
            type="range"
            onChange={onBrushSizeChange}
            defaultValue="4"
          />
        </div>
      </div>
      <div className="color-palette">
        <button
          className="color red"
          onClick={()=>clearMyInterval("red")}
        ></button>
        <button
          className="color blue"
          onClick={()=>clearMyInterval("blue")}
        ></button>
        <button
          className="color green"
          onClick={()=>clearMyInterval("green")}
        ></button>
        <button
          className="color yellow"
          onClick={()=>clearMyInterval("yellow")}
        ></button>
        <button
          className="color purple"
          onClick={()=>clearMyInterval("purple")}
        ></button>
        <button
          className="color black"
          onClick={()=>clearMyInterval("black")}
        ></button>
        <button
          className="color white"
          onClick={()=>clearMyInterval("white")}
        ></button>
        <button
          className="color rainbow"
          onClick={(e) => setColor("")}
        ></button>
        <button className="color bucket" onClick={onFill}></button>
      </div>
    </div>
  );
};

export default Canvas;
