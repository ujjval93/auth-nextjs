import {connect} from '@/db/db';
import User from '@/models/userModel';
import {NextResponse, NextRequest} from 'next/server';
import bcrypt from 'bcryptjs';
import {sendEmail} from '@/helpers/mailer';

export async function POST(req: NextRequest) {
    try {
        await connect();
        
        const reqBody = await req.json();
        const {username, email, password} = reqBody;
        
        // Check if username already exists
        const existingUsername = await User.findOne({username});
        if (existingUsername) {
            return NextResponse.json({error: 'Username already exists'}, {status: 400});
        }
        
        // Check if email already exists
        const existingEmail = await User.findOne({email});
        if (existingEmail) {
            return NextResponse.json({error: 'Email already exists'}, {status: 400});
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        
        // Send verification email
        await sendEmail({email, emailType: 'VERIFY', userId: savedUser._id});

        return NextResponse.json({
            message: 'User created successfully',
            success: true,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                isVerified: savedUser.isVerified
            }
        });
    } catch (error: any) {
        console.error("SIGNUP ERROR:", error.message);

        // Handle MongoDB E11000 duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const message = field === 'username' ? 'Username already exists' : 'Email already exists';
            return NextResponse.json({error: message}, {status: 400});
        }

        return NextResponse.json({
            error: error.message}, {status: 500});
    }
}