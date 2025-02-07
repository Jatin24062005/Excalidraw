"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Use this for Next.js 13+
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { useUser } from "@/app/ContextApi";




export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState(""); // Add state for username
  const { user , loginUser} =useUser();
 const router = useRouter();
  const handleSubmit = async () => {
    console.log({ email, password, confirmPassword, username });
  
    try {
      if (isSignin) {

       const res = await axios.post(`${HTTP_BACKEND}/signin`, { 
          username: email, 
          password 
        }, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true 
        });
        console.log(res.data);

        if(res.data.message ==='Login Successfully !'){
          const { name ,token} = res.data;
         
          loginUser(name, token);
      
                router.push('/');
        }
     
      } else {
        
        const res = await axios.post(` ${HTTP_BACKEND}/signup`, {
          name :username,  
          username: email,  
          password,  
          confirmPassword
        },{
          headers: { "Content-Type": "application/json" },
          withCredentials: true 
        });
        console.log( res.data);
        router.push("/signin");
      }

    } catch (error) {

      console.error("Error:", error.response?.data || error.message);
    }
  };
  

  const handleNavigation = () => {
    if (isSignin) {
      router.push("/signup"); // Navigate to the sign-up page if currently on sign-in page
    } else {
      router.push("/signin"); // Navigate to the sign-in page if currently on sign-up page
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-sm mx-4">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {isSignin ? "Sign In" : "Sign Up"}
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered input-ghost w-full"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered input-ghost w-full"
              placeholder="Enter your password"
            />
          </div>

          {!isSignin && (
            <>
             

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input input-bordered input-ghost w-full"
                  placeholder="Confirm your password"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-bordered input-ghost w-full"
                  placeholder="Choose a username"
                />
              </div>
            </>
          )}

          <div className="pt-4">
            <button
              onClick={handleSubmit}
              className="btn btn-primary w-full"
            >
              {isSignin ? "Sign In" : "Sign Up"}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm">
              {isSignin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={handleNavigation}
                className="text-blue-500 font-semibold"
              >
                {isSignin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}