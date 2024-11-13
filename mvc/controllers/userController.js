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


// Login function with better error handling
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required", success: false });
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email) || email.length < 5 || email.length > 30) {
        return res.status(400).json({ message: "Invalid email format", success: false });
    }
    if (password.length < 5 || !/(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,}/.test(password)) {
        return res.status(400).json({ message: "Password must be at least 5 characters, contain 1 special character and 1 number", success: false });
    }

    try {
        // Check if the user exists
        const existUser = await User.findOne({ email });
        if (!existUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, existUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials", success: false });
        }

        // Generate JWT token
        const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

        // Set token in cookie with secure options
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "None",
            secure: process.env.NODE_ENV === "production",
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 2 hours
        });

        return res.status(200).json({ message: "Login successful", success: true, user: existUser, token });

    } catch (error) {
        return res.status(500).json({ message: "Server error during login", success: false, error: error.message });
    }
};

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    console.log("🚀 ~ file: userController.js:92 ~ token:", token);

    if (!token) {
        return res.status(401).json({ message: "No token provided", success: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token", success: false });
    }
};

// Fetch authenticated user details
export const getUser = async (req, res) => {
    const userId = req.id;

    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        return res.status(200).json({ message: "User fetched successfully", success: true, user });
    } catch (error) {
        return res.status(500).json({ message: "Server error while fetching user", success: false, error: error.message });
    }
};

// Logout function
export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).json({ message: "Logout successful", success: true });
};
