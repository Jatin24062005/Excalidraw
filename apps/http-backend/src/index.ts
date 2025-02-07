import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cookieParser from "cookie-parser";
import cors from 'cors'


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.post("/signup",  async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error.issues);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
        try { 
            const user = await prismaClient.user.create({
                data : {
                    email : parsedData.data?.username,
                    password : parsedData.data?.password,
                    name :parsedData.data?.name
                }
            })

            res.status(200).json({
                userId:user.id,
                message:"Account Created Succesfully"
            })
            
        } catch (error) {
            res.status(411).json({
                message: "User already exists with this username"
            })
        }

})

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
         const user = await prismaClient.user.findFirst({
            where :{
                email:parsedData.data?.username,
                password: parsedData.data?.password
            }
         });
    
     const userId = user?.id;
     const token = jwt.sign({userId},JWT_SECRET);
      const name = user?.name;
     res.status(200).cookie("token", token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "strict" }).json({
        message:"Login Successfully !",
         name,
        token
     })



    } catch (error) {
        res.status(411).json({
            message: "User not exist"
        })
    }
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }  
    // @ts-ignore: TODO: Fix this
      const userId = req.userId;
      try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        res.json({
            roomId: room.id
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }

    })


    
app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
})

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})


app.listen(3001,()=>{
    console.log('Server is Running')
});