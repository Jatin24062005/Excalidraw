import axios from 'axios';
import { HTTP_BACKEND } from '@/config';
import { Canvas } from 'fabric';


export const getExistingShapes = async (roomId : string)=>{
     const res = await  axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
     const messages = res.data.message;

     const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })
    return shapes;
}

