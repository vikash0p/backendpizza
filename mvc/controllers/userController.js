import User from "../models/userSchema.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const Register = async (req, res) => {

    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
        res.status(404).json({ message: "All fields are required", success: false });
    } else if (password.length < 5) {
        res.status(404).json({ message: "Password must be at least 5 characters", success: false });
    } else if (!password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,}$/)) {
        res.status(404).json({ message: "Password must contain at least 1 special character and 1 number", success: false });
    } else if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/) || !email.includes("@") || !email.includes(".") || email.length < 5 || email.length > 30 || !email.trim() || !email.endsWith(".com")) {
        res.status(404).json({ message: "Invalid email", success: false });
    } else if (!/^[a-zA-Z\s]*$/.test(fullName) || fullName.length < 2 || fullName.length > 50) {
        res.status(404).json({ message: "Invalid full name", success: false });
    } else if (role !== "user" && role !== "admin") {
        res.status(404).json({ message: "Invalid role", success: false });
    }
    try {
        //exist user

        const existUser = await User.findOne({ email });
        if (existUser) {
            return res.status(400).json({ message: "User already exist", success: false });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ fullName, email, password: hashPassword, role });
        if (!user) res.status(404).json({ message: "failed to create the user", success: false })

        // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: "Register successfully", success: true, user });

    } catch (error) {
        res.status(404).json({ message: "failed to register", success: false, error: error.message });


    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(404).json({ message: "Email and password are required", success: false });
    } else if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/) || !email.includes("@") || !email.includes(".") || email.length < 5 || email.length > 30 || !email.trim()) {
        res.status(404).json({ message: "Invalid email", success: false });
    } else if (password.length < 5) {
        res.status(404).json({ message: "Password must be at least 5 characters", success: false });
    } else if (!password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,}$/)) {
        res.status(404).json({ message: "Password must contain at least 1 special character and 1 number", success: false });
    }
    try {
        const existUser = await User.findOne({ email });
        if (!existUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        const isMatch = await bcrypt.compare(password, existUser.password);
        if (!isMatch) {
            return res.status(404).json({ message: "Invalid credentials", success: false });
        }
        const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        console.log("🚀 ~ file: userController.js:65 ~ token:", token);
        res.cookie("token", token, { expires: new Date(Date.now() + 1000*60*60*2) });
        if (!token) res.status(400).json({ message: "InValid token", success: false });
        res.status(201).json({ message: "Login successfully", success: true, existUser, token });

    } catch (error) {
        res.status(404).json({ message: "failed to login", success: false, error: error.message });

    }


}


export const verifyToken = async (req, res, next) => {
    const cookie = req.cookies.token;

    console.log("🚀 ~ file: userController.js:80 ~ cookie:", cookie);

    if (!cookie) {
        return res.status(404).json({ message: "No token provided", success: false });
    }
    const verify = jwt.verify(cookie, process.env.JWT_SECRET);
    console.log("🚀 ~ file: userController.js:88 ~ verify:", verify);

    if (!verify) {
        return res.status(404).json({ message: "Invalid token", success: false });
    }
    req.id = verify.id;
    next();


    // const user = await User.findById(verify.id);
    // if (!user) {
    //     return res.status(404).json({ message: "User not found", success: false });
    // }
    // res.status(201).json({ message: "Token verified successfully", success: true, user });


}

export const getUser = async (req, res, next) => {
    const userId = req.id;
    let user;
    try {
        user = await User.findById(userId, "-password");
    } catch (error) {
        next(error.message);
    }
    if (!user) {
        res.status(404).json({
            message: "User not found",
            success: false,
        });
    }
    return res.status(200).json({ message: "fetch the user successfully !", success: true, user });
};


export const logout = (req, res) => {
    res.clearCookie('token'); // Clear the 'token' cookie
    res.status(200).json({ message: "Logout successful", success: true });
};