"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, Circle, Rect, PencilBrush } from "fabric";
import {
  SquareIcon,
  CircleIcon,
  PencilIcon,
  EraserIcon,
  HandIcon,
} from "./Icons.jsx";
import { Setting } from "../app/canvas/[roomId]/setting.jsx";
import { sendChatMessage } from "./Chat";

const Canvastest1 = ({
  roomId,
  socket,
}: {
  roomId: string;
  socket: WebSocket;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [existingShape, setExistingShape] = useState<any>({
    objects: [
      {
        type: "rect",
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: "red",
      },
      {
        type: "circle",
        left: 250,
        top: 150,
        radius: 50,
        fill: "blue",
      },
    ],
  });

    async function draw(canvas: Canvas | null) {
        if (canvas && existingShape?.objects?.length) {
          canvas.loadFromJSON(existingShape, () => {
            canvas.requestRenderAll();
          });
        }
      }

      
      function UpdateExistingShape(socket: WebSocket | null) {
        if (!socket) return;
      
        socket.onmessage = (e) => {
          let res;
          try {
            res = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
          } catch (error) {
            console.error("❌ Error parsing WebSocket message:", error, e.data);
            return;
          }
      
          if (res.type === "chatReceive" && res.message) {
            let message;
            try {
              message = typeof res.message === "string" ? JSON.parse(res.message) : res.message;
            } catch (error) {
              console.error("❌ Error parsing 'message' field:", error, res.message);
              return;
            }
      
            // Ensure message is always an array
            const messageArray = Array.isArray(message) ? message : [message];
      
            const newObjects = messageArray.map((m) => m.specefication);
      
            // ✅ Functional update to ensure we get the latest existingShape state
            setExistingShape((prev) => {
              const updatedShapes = { objects: [ ...newObjects] };
            });
          }
        };
      }
      
      
  
  

  // Load existing shapes on startup
  useEffect( () => {
    if (!canvasRef.current) return;

    const initCanvas = new Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#13171c",
    });
    initCanvas.renderAll();
    setCanvas(initCanvas);
    

    return () => {
      initCanvas.dispose();
    };
  }, [canvasRef]);

  useEffect(() => {
    if (!canvas) return;

    const updateCanvas = () => sendChatMessage({ socket, canvas, roomId });

    canvas.on("object:added", updateCanvas);
    canvas.on("object:removed", updateCanvas);
    canvas.on("object:modified", updateCanvas);
    canvas.on("mouse:up", updateCanvas);

    sendChatMessage({ socket, canvas, roomId });
    draw(canvas);

    return () => {
      canvas.off("object:added", updateCanvas);
      canvas.off("object:removed", updateCanvas);
      canvas.off("object:modified", updateCanvas);
      canvas.off("mouse:up", updateCanvas);
    };
  }, [canvas]);

  useEffect(()=>{
    UpdateExistingShape(socket);
    draw(canvas);
  },[canvas,socket,roomId])

  // Functions
  const addRectangle = () => {
    if (!canvas) return;
    const rect = new Rect({
      top: 100,
      left: 50,
      width: 250,
      height: 175,
      fill: "#669bbc",
      rx: 10,
      ry: 10,
    });
    canvas.add(rect);
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new Circle({
      top: 150,
      left: 150,
      radius: 100,
      fill: "#c1121f",
    });
    canvas.add(circle);
  };

  const activatePencil = () => {
    if (!canvas) return;
    const pencilBrush = new PencilBrush(canvas);
    pencilBrush.color = "#ffffff";
    pencilBrush.width = 5;
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = pencilBrush;
  };

  const activateEraser = () => {
    if (!canvas) return;
    canvas.isDrawingMode = false;
    canvas.selection = false;

    const eraseObject = (e) => {
      const pointer = canvas.getPointer(e.e);
      const objects = canvas.getObjects();
      objects.forEach((obj) => {
        if (obj.containsPoint(pointer)) canvas.remove(obj);
      });
    };

    canvas.on("mouse:down", (e) => {
      eraseObject(e);
      canvas.on("mouse:move", eraseObject);
    });

    canvas.on("mouse:up", () => canvas.off("mouse:move", eraseObject));
  };
  const activateHandTool = () => {
    if (canvas) {
      canvas.isDrawingMode = false; // Disable drawing mode
      canvas.selection = true; // Allow selection
      canvas.defaultCursor = "default"; // Reset to normal cursor

      // Remove any dragging event listeners that may have been added
      canvas.off("mouse:down");
      canvas.off("mouse:move");
      canvas.off("mouse:up");
    }}
  

  return (
    <div>
      <div className="z-20 fixed bg-[#232329] p-1 m-4 flex h-fit rounded-md max-w-screen-md space-x-4">
        <span
          className="cursor-pointer p-2 hover:bg-gray-700 rounded-sm"
          onClick={addRectangle}
        >
          <SquareIcon className="fill-white" />
        </span>
        <span
          className="cursor-pointer p-2 hover:bg-gray-700 rounded-sm"
          onClick={addCircle}
        >
          <CircleIcon className="fill-white" />
        </span>
        <span
          className="cursor-pointer p-2 hover:bg-gray-700 rounded-sm"
          onClick={activatePencil}
        >
          <PencilIcon className="fill-white" />
        </span>
        <span
          className="cursor-pointer p-2 hover:bg-gray-700 rounded-sm"
          onClick={activateEraser}
        >
          <EraserIcon className="fill-white" />
        </span>
        <span
          className="cursor-pointer p-2 hover:bg-gray-700 rounded-sm"
          onClick={activateHandTool}
        >
          <HandIcon className="fill-white" />
        </span>
      </div>
      <canvas ref={canvasRef} />
      <Setting
        className="fixed inset-y-1/2 -translate-y-1/2 right-4"
        canvas={canvas}
      />
    </div>
  );
};


export default Canvastest1;
