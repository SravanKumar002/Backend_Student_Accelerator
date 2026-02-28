import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { auth } from '../config/firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import bcrypt from 'bcryptjs';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user exists in MongoDB first
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password for MongoDB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Register in Firebase Auth
        let firebaseUid = null;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            firebaseUid = userCredential.user.uid;
        } catch (firebaseErr) {
            // If user already exists in Firebase (e.g. from a previous attempt), try signing in
            if (firebaseErr.code === 'auth/email-already-in-use') {
                try {
                    const signInResult = await signInWithEmailAndPassword(auth, email, password);
                    firebaseUid = signInResult.user.uid;
                } catch (signInErr) {
                    console.warn("Firebase sign-in fallback failed:", signInErr.message);
                }
            } else {
                console.warn("Firebase Auth Warning (Register):", firebaseErr.message);
            }
        }

        // Create user in MongoDB
        const user = await User.create({
            name: name || 'User',
            email,
            password: hashedPassword,
            role: role || 'student',
        });

        if (user) {
            return res.status(201).json({
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                firebaseUid
            });
        } else {
            return res.status(400).json({ message: 'Invalid user data format' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let firebaseUid = null;
        let authSuccess = false;
        let displayName = email.split('@')[0];

        try {
            // Check Firebase Auth (Backend)
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            firebaseUid = userCredential.user.uid;
            displayName = userCredential.user.displayName || displayName;
            authSuccess = true;
        } catch (firebaseErr) {
            console.warn("Firebase Auth Warning (Login):", firebaseErr.message);
            // Fallback to bcrypt
        }

        // Fetch corresponding user in our MongoDB
        const user = await User.findOne({ email });

        if (!authSuccess && user) {
            // Fallback comparison using MongoDB's hashed password
            authSuccess = await bcrypt.compare(password, user.password || '');
        }

        if (authSuccess && user) {
            return res.json({
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
                firebaseUid
            });
        } else if (authSuccess && !user) {
            // Edge case: Exists in Firebase but not in Mongo. We should create it.
            const newUser = await User.create({
                name: displayName,
                email: email,
                password: '', // because it's managed by Firebase
                role: 'coach',
            });
            return res.json({
                _id: newUser._id,
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                token: generateToken(newUser._id),
                firebaseUid
            });
        } else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
    try {
        const { credential, role } = req.body;

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, sub: googleId, picture } = ticket.getPayload();

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // Link google account to existing email if not linked
            if (!user.googleId) {
                user.googleId = googleId;
                user.avatar = picture || user.avatar;
                await user.save();
            }
        } else {
            // Create user for first time Google login
            user = await User.create({
                name,
                email,
                googleId,
                avatar: picture,
                role: role || 'coach', // Defaulting to coach for demonstration purposes based on the request
            });
        }

        return res.json({
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: 'Invalid Google Identity token', error: error.message });
    }
};
