import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendResetSuccessEmail
} from "../mailtrap/emails.js";

export const signup = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            throw new Error("All fields are required!");
        }

        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exist.." });
        }

        //hash password
        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        //collect user data
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hours
        });

        //save user to mongo db
        await user.save();

        //jwt
        generateTokenAndSetCookie(res, user._id);

        //send verification email
        await sendVerificationEmail(user.email, verificationToken);


        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });

    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


export const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        //try find user
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {
                $gt: Date.now(),
            }
        });

        //if user not found
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "invalid or expired verification code",
            });
        }

        //update user data
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        //save user
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "User virified successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};


export const login = async (req, res) => {
    //get user data from submit
    const { email, password } = req.body;

    try {
        //try find email in db
        const user = await User.findOne({ email });

        //email not find
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        //compare password 
        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        //generate new token and cookie
        generateTokenAndSetCookie(res, user._id);

        //update user info
        user.lastLogin = new Date();

        //save user
        await user.save();

        //set response for success
        res.status(200).json({
            success: true,
            message: "Logged is success!",
            user: {
                ...user._doc,
                password: undefined,
            }
        });

    } catch (error) {
        //console.log("error in login", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};


export const logout = async (req, res) => {
    res.clearCookie("token");

    res.status(200).json({ success: true, message: "Logout success!" });
};


export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        //try find email in db
        const user = await User.findOne({ email });

        //email not find
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        //generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hour

        //collect user data
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        //save user
        await user.save();

        //send email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        //set response for success
        res.status(200).json({
            success: true,
            message: "Reset link is send, success!",
        });

    } catch (error) {
        //console.log("error in forgot password", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });

        //user not find
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        //update password
        const hashedPassword = await bcryptjs.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        await sendResetSuccessEmail(user.email);

        //set response for success
        res.status(200).json({
            success: true,
            message: "Reset password success!",
        });
    } catch (error) {
        //console.log("error in reset password", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
}

export const checkAuth = async (req, res) => {
    try {
        //try find user, and unselect password column
        const user = await User.findById(req.userId).select("-password");

        //user not found
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        //success
        res.status(200).json({
            success: true, user: { ...user._doc }
        });

    } catch (error) {
        //console.log("error in check auth", error.message);
        res.status(40).json({ success: false, message: error.message });
    }
}
