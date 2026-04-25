
import mongoose from "mongoose";
 

const {DB_NAME,MONGODB_URI} = process.env;
console.log(`${MONGODB_URI}/${DB_NAME}`);

const connectDB = async ()=> {

    
    try {
        
       const connectionInstance = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
       if(connectionInstance){
           console.log("Mongodb successfully connected !!");
       }
         
        
    } catch (error) {
        console.log("Error in connecting with data base",error);
        process.exit(1) 
    }
}

export default connectDB;