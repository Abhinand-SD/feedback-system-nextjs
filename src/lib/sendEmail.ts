import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTP = async (email: string, otp: string) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('EMAIL_USER or EMAIL_PASS not set. OTP for ' + email + ': ' + otp);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent to ' + email);
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback for development if email fails
        console.log('Fallback OTP: ' + otp);
    }
};
