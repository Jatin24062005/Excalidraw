import { AuthPage } from "@/components/AuthPage";
import { UserProvider } from "../ContextApi";

export default function Signup() {
    return(
        <UserProvider>     
            <AuthPage isSignin={false} />
        </UserProvider>
    )
}