import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: [true, 'Password is required'] },
        role: { 
            type: String, 
            enum: ['BUYER', 'SUPPLIER'], 
            default: 'SUPPLIER' 
        }
    },
    { timestamps: true }
);

// Hash password right before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);

});

// Custom method to compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Custom method to generate JWT
console.log(process.env.ACCESS_TOKEN_SECRET);
console.log(process.env.ACCESS_TOKEN_EXPIRY);

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);