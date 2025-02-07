"use client"; // Ensure this is at the top

import React, { useEffect, useState } from "react";
import { WS_URL } from "@/config";
import Canvastest from "./Canvas";



export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/get-token")
      .then((res) => res.json())
      .then((data) => {
        console.log("Token from API:", data.token);
        setToken(data.token);
      });
  }, []);

  useEffect(() => {
    if (token) {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onopen = () => {
        setSocket(ws);
        ws.send(
          JSON.stringify({
            type: "join_room",
            roomId,
          })
        );
      };

      return () => ws.close();
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
