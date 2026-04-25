import express  from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Set the response status based on the error status code or default to 500
    res.status(err.statusCode || 500).json({
      message: err.message || "Internal Server Error"
    });
  });
app.use(express.json({limit:"16kb"})) // use to accept data by form
app.use(express.urlencoded({extended:true,limit:"16kb"}))// use to accept params from url 
// extended true means you can accept objects inside object
 //use to sset public folder as public assests that anyone can use 

app.use(cookieParser()) // use to insert secure cookies

// // 
// import userRouter from "./routes/user.routes.js"

// app.use("/api/v1/users",userRouter);



// /api/v1/user is an industry standard where api 



export {app}