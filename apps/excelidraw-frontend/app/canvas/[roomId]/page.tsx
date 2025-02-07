import { UserProvider } from "@/app/ContextApi";
import { RoomCanvas } from "@/components/RoomCanvas";


export default async function CanvasPage({ params }: {
    params: {
        roomId: string
    }
}) {
    const roomId = (await params).roomId;
   
    return( 
        <UserProvider>
    <RoomCanvas roomId={roomId}/>
    </UserProvider>
    )
   
}