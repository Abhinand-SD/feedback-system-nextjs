import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

// Log initialization status
console.log('[SMS Init] Twilio Config:', {
    hasAccountSid: !!accountSid,
    hasAuthToken: !!authToken,
    hasFromPhone: !!fromPhone
});

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export const sendSMS = async (mobile: string, otp: string) => {
    console.log(`[SMS Start] Attempting to send OTP to ${mobile}`);

    if (client && fromPhone) {
        try {
            console.log('[SMS Twilio] Sending via Twilio...');
            await client.messages.create({
                body: `Your verification code is: ${otp}`,
                from: fromPhone,
                to: mobile,
            });
            console.log(`[Twilio SMS] Sent OTP to ${mobile} successfully`);
            return;
        } catch (error: any) {
            if (error.code === 21608) {
                console.warn(`[Twilio SMS Warning] Trial Account Limitation: Destination ${mobile} is not verified.`);
                console.warn('-> You must verify this number in Twilio Console or upgrade your account.');
                console.warn('-> Falling back to MOCK SMS for development.');
            } else {
                console.error('[Twilio SMS] Error sending SMS:', error.message);
            }
            // Fallthrough to mock log so we can see the OTP in dev
        }
    } else {
        console.warn('[SMS Warning] Twilio client or phone number missing. using Mock.');
    }

    // Mock implementation / Fallback
    console.log(`[MOCK SMS] Sending OTP ${otp} to ${mobile}`);
    return Promise.resolve();
};
