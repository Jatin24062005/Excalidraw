import { AuthPage } from "@/components/AuthPage";
import { UserProvider } from "../ContextApi";


export default function Signin() {

    return (
             <UserProvider>
             <AuthPage isSignin={true} />
             </UserProvider>
)}