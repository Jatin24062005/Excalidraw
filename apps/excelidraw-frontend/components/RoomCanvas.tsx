"use client";
import React, { useEffect, useState } from "react";
import { WS_URL } from "@/config";
import Canvastest from "./Canvas";

// Function to get cookie by name
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
};

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  
  // Get JWT token from cookies

  const token: string | null | undefined = getCookie("token");  // Replace with your actual cookie name
  console.log(token);
  useEffect(() => {
    if (token) {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onopen = () => {
        setSocket(ws);
        const data = JSON.stringify({
          type: "join_room",
          roomId,
        });
        console.log(data);
        ws.send(data);
      };

      return () => {
        if (ws) {
          ws.close();
        }
      };
    } else {
     
    }
  }, [token, roomId]);

  if (!socket) {
    return <div>Connecting to server....</div>;
  }

  return (
    <div>
      <Canvastest roomId={roomId} socket={socket} />
    </div>
  );
}
