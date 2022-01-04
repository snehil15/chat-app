import React, { useEffect, useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import "./Canvas.css";

const Canvas = ({ socket, room }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("black");
  const [brushSize, setBrushSize] = useState(2);
  // const [width, setWidth] = useState(600);

  const mouseUp = (e) => setDrawing(false);

  const mouseDown = (e) => setDrawing(true);

  const mouseMove = (e) => {
    socket.emit("drawing", {
      canvasState: canvasRef.current.getSaveData(),
      room,
    });
  };

  const onChange = (e) => {
    if (drawing) {
      socket.emit("drawing", {
        canvasState: canvasRef.current.getSaveData(),
        room,
      });
    }
  };

  const colorChange = (e) => {
    setColor(e.target.value);
  };

  const wheel = (e) => {
    e.preventDefault();
    console.log(e.deltaY);
    setBrushSize((prev) => {
      let size = prev + e.deltaY * -0.2;
      return size <= 1 || size >= 15 ? prev : size;
    });
  };

  useEffect(() => {
    if (!canvasRef) return;
    socket.on("update_canvas", (data) => {
      if (canvasRef.current) {
        canvasRef.current.loadSaveData(data.canvasState);
      }
    });
  }, [socket]);

  return (
    <div
      id="canvas"
      className="canvas"
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
      onMouseMove={mouseMove}
      onWheel={wheel}
    >
      <CanvasDraw
        ref={canvasRef}
        canvasHeight={600}
        canvasWidth={700}
        lazyRadius={2}
        brushRadius={brushSize}
        brushColor={color}
        onChange={onChange}
        immediateLoading={true}
      />
      <button className="clear-btn" onClick={() => canvasRef.current.clear()}>
        Clear
      </button>
      <button className="undo-btn" onClick={() => canvasRef.current.undo()}>
        Undo
      </button>
      <input className="colorpicker" type="color" onChange={colorChange} />
    </div>
  );
};

export default Canvas;
