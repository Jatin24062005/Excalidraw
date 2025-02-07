import { Canvas } from "fabric";

export const sendChatMessage =({socket,canvas,roomId}:{socket:WebSocket; canvas:Canvas | null; roomId:string})=>{
       if(socket && canvas){
        const shapes = canvas.getObjects().map((obj)=>{
            return{
                type:obj.type,
                specefication:obj.toObject()
            }
        });
          
        const payload= {
            type: "chat",
            roomId,
            message: JSON.stringify(shapes),
        }
        console.log(payload);
        socket.send(JSON.stringify(payload));
        
       }
   };
