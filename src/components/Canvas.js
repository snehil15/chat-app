import React, { useEffect, useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";
import "./Canvas.css";

const Canvas = ({ socket, room }) => {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("black");
  const [brushSize, setBrushSize] = useState(3);
  const [firstLoadFlag, setFirstLoadFlag] = useState(true);

  const mouseUp = async (e) => setDrawing(false);

  const mouseDown = async (e) => setDrawing(true);

  // const mouseMove = async (e) => {
  //   console.log("mousemove");
  //   if (drawing) {
  //     await socket.emit("drawing", {
  //       canvasState: canvasRef.current.getSaveData(),
  //       room,
  //     });
  //   }
  // };

  const onChange = async (e) => {
    if (drawing && !firstLoadFlag) {
      await socket.emit("drawing", {
        canvasState: canvasRef.current.getSaveData(),
        room,
      });
    }
  };

  const colorChange = (e) => {
    setColor(e.target.value);
  };

  const wheel = async (e) => {
    e.preventDefault();
    setTimeout(() => {
      setBrushSize((prev) => {
        let size = prev + e.deltaY * -0.2;
        return size <= 1 || size >= 15 ? prev : size;
      });
    }, 150);
  };

  const clear = async (e) => {
    canvasRef.current.clear();
    await socket.emit("drawing", {
      canvasState: canvasRef.current.getSaveData(),
      room,
    });
  };

  const undo = async (e) => {
    canvasRef.current.undo();
    await socket.emit("drawing", {
      canvasState: canvasRef.current.getSaveData(),
      room,
    });
  };

  useEffect(() => {
    setFirstLoadFlag(true);
    if (!canvasRef) return;
    socket.on("get_canvas_data", (data) => {
      if (canvasRef.current) {
        canvasRef.current.loadSaveData(data.canvasData);
      }
    });
    setFirstLoadFlag(false);
  }, []);

  useEffect(() => {
    if (!canvasRef) return;
    socket.on("update_canvas", (data) => {
      if (!(data.id == socket.id) && canvasRef.current) {
        canvasRef.current.loadSaveData(data.canvasState);
      }
    });
  }, [socket]);

  return (
    <div
      id="canvas"
      className="canvas"
      onMouseDown={(e) => mouseDown(e)}
      onMouseUp={(e) => mouseUp(e)}
      // onMouseMove={(e) => mouseMove(e)}
      onWheel={(e) => wheel(e)}
    >
      <CanvasDraw
        ref={canvasRef}
        canvasHeight={600}
        canvasWidth={700}
        lazyRadius={2}
        brushRadius={brushSize}
        brushColor={color}
        onChange={() => onChange()}
        immediateLoading={true}
      />
      <button className="clear-btn" onClick={(e) => clear(e)}>
        Clear
      </button>
      <button className="undo-btn" onClick={(e) => undo(e)}>
        Undo
      </button>
      <input className="colorpicker" type="color" onChange={colorChange} />
    </div>
  );
};

export default Canvas;
