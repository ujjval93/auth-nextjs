import {connect} from '@/db/db';
import User from '@/models/userModel';
import {NextResponse, NextRequest} from 'next/server';
import bcrypt from 'bcryptjs';
import {sendEmail} from '@/helpers/mailer';

connect();

export async function POST(req: NextRequest) {
    try {
        const reqBody = await req.json();
        const {name, email, password} = reqBody;
        
        //check if user already exists
        const user = await User.findOne({email});
        if (user) {
            return NextResponse.json({error: 'User already exists'}, {status: 400});
        }

        // hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        
        //send verification email
        await sendEmail({email, emailType: 'VERIFY', userId: savedUser._id});

        return NextResponse.json({
            message: 'User created successfully',
            success: true,
            savedUser
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message}, {status: 500});
    }
}