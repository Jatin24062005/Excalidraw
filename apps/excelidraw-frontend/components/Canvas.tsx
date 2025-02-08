"use client";
import { Canvas, Circle, Rect ,PencilBrush, ObjectModifyingLayoutContext} from "fabric";
import { useEffect, useRef, useState } from "react";
import { SquareIcon, CircleIcon, PencilIcon, EraserIcon, HandIcon } from "./Icons.jsx"; // Assuming you have EraserIcon and HandIcon
import { Setting } from '../app/canvas/[roomId]/setting.jsx';
import { getExistingShapes } from "@/draw/http";
import { sendChatMessage } from "./Chat";
  
 const  Canvastest1 =  ( { roomId , socket } : {
  roomId : string ; 
  socket:WebSocket;
}) => {
    const canvasRef = useRef(null);
    const [canvas, setCanvas] = useState<Canvas | null>(null);



    useEffect(() => {
        if (canvasRef.current) {
            const initCanvas = new Canvas(canvasRef.current, {
                width: window.innerWidth,
                height: window.innerHeight,
            });

            initCanvas.backgroundColor = "#13171c";
            initCanvas.renderAll();
            setCanvas(initCanvas);

            return () => {
                initCanvas.dispose();
            };
        }
    }, [canvasRef]);

    useEffect(() => {
        if (canvas) {
            // Listen to object added, removed, modified, and drawing events
            const updateCanvas = () => {
                console.log("Canvas updated, sending chat message..."); // Debugging log
                sendChatMessage({ socket, canvas, roomId });
            };

            canvas.on("object:added", () => {
                console.log("Object added!"); // Debugging log
                updateCanvas();
            });

            canvas.on("object:removed", () => {
                console.log("Object removed!"); // Debugging log
                updateCanvas();
            });

            canvas.on("object:modified", () => {
                console.log("Object modified!"); // Debugging log
                updateCanvas();
            });

            canvas.on("mouse:up", () => {
                console.log("Mouse up event triggered!"); // Debugging log
                updateCanvas();
            });

            // Send initial canvas data when first loaded
            sendChatMessage({ socket, canvas, roomId });

            return () => {
                // Cleanup event listeners
                canvas.off("object:added", updateCanvas);
                canvas.off("object:removed", updateCanvas);
                canvas.off("object:modified", updateCanvas);
                canvas.off("mouse:up", updateCanvas);
            };
        }
    }, [canvas, socket, roomId]);

    useEffect(() => {
        if (!canvas || !socket) return;
    
        const fetchExistingShapes = async () => {
            try {
                const existingShapes = await getExistingShapes(roomId);
                if (existingShapes) {
                    canvas.loadFromJSON(existingShapes, () => {
                        canvas.renderAll();
                    });
                }
            } catch (error) {
                console.error("Error fetching existing shapes:", error);
            }
        };
    
        fetchExistingShapes();
    
        const handleMessage = (event: MessageEvent) => {
            try {
                const receivedData = JSON.parse(event.data);
                console.log("Message Received:", receivedData);
        
                // Ensure message exists and is a string
                if (receivedData.type === "chatReceive" && receivedData.message) {
                    try {
                        // Parse the message string into an array of objects
                        const parsedObjects = JSON.parse(receivedData.message);
        
                        if (!Array.isArray(parsedObjects)) {
                            console.error("Error: Parsed objects are not an array", parsedObjects);
                            return;
                        }
        
                        // Extract `specefication` from each object
                        const formattedObjects = parsedObjects.map(obj => obj.specefication);
        
                        // Ensure canvas is available before loading objects
                        if (canvas) {
                            canvas.loadFromJSON({ objects: formattedObjects }, () => {
                                canvas.renderAll();
                            });
                        } else {
                            console.error("Canvas is not initialized.");
                        }
                    } catch (parseError) {
                        console.error("Error parsing message JSON:", parseError);
                    }
                } else {
                    console.error("Invalid WebSocket data structure", receivedData);
                }
            } catch (error) {
                console.error("Error processing WebSocket data:", error);
            }
        };
        
    
        socket.addEventListener("message", handleMessage);
    
        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [canvas, socket, roomId]);
    
    
    
    // Functions
    const addRectangle = async () => {
        if (canvas) {
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
            
            
        }
    };
    
    const addCircle = () => {
        if (canvas) {
            const circle = new Circle({
                top: 150,
                left: 150,
                radius: 100,
                fill: "#c1121f",
            });
            canvas.add(circle);
        }
    };

    const activatePencil = () => {
        if (canvas) {
            const pencilBrush = new PencilBrush(canvas);
            pencilBrush.color = "#ffffff"; // Pencil color
            pencilBrush.width = 5; // Pencil stroke width
            canvas.isDrawingMode = true; // Enable drawing mode
            canvas.freeDrawingBrush = pencilBrush; // Assign brush to canvas
        }
    };

    const activateEraser = () => {
        if (canvas) {
            canvas.isDrawingMode = false; // Disable drawing mode
            canvas.selection = false; // Disable selection
            canvas.defaultCursor = "crosshair"; // Change cursor to indicate eraser mode

            const eraseObject = (e) => {
                const pointer = canvas.getPointer(e.e); // Get mouse position
                const objects = canvas.getObjects(); // Get all objects on the canvas

                objects.forEach((obj) => {
                    if (obj.containsPoint(pointer)) { // Check if the pointer is within the object
                        canvas.remove(obj); // Remove the object
                    }
                });
            };

            // Add event listener for erasing
            canvas.on("mouse:down", (e) => {
                eraseObject(e);
                canvas.on("mouse:move", eraseObject); // Enable continuous erasing while dragging
            });

            canvas.on("mouse:up", () => {
                canvas.off("mouse:move", eraseObject); // Stop erasing on mouse up
            });
        }
    };

    const activateHandTool = () => {
        if (canvas) {
            canvas.isDrawingMode = false; // Disable drawing mode
            canvas.selection = false; // Disable selection
            canvas.defaultCursor = "grab"; // Set cursor to "grab"

            // Enable panning
            const enablePanning = (e) => {
                if (e.e.type === "mousedown") {
                    canvas.isDragging = true;
                    canvas.selection = false;
                    canvas.lastPosX = e.e.clientX;
                    canvas.lastPosY = e.e.clientY;
                } else if (e.e.type === "mousemove" && canvas.isDragging) {
                    const vpt = canvas.viewportTransform;
                    vpt[4] += e.e.clientX - canvas.lastPosX;
                    vpt[5] += e.e.clientY - canvas.lastPosY;
                    canvas.requestRenderAll();
                    canvas.lastPosX = e.e.clientX;
                    canvas.lastPosY = e.e.clientY;
                } else if (e.e.type === "mouseup") {
                    canvas.isDragging = false;
                    canvas.selection = true;
                }
            };

            // Attach panning events
            canvas.on("mouse:down", enablePanning);
            canvas.on("mouse:move", enablePanning);
            canvas.on("mouse:up", enablePanning);
        }
    };

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

export default Canvastest1