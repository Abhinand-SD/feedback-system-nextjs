const { signAccessToken, verifyAccessToken } = require('./src/lib/tokens');
require('dotenv').config({ path: '.env.local' });

async function testTokens() {
    console.log('Testing Token Logic...');

    if (!process.env.JWT_SECRET) {
        console.error('ERROR: JWT_SECRET is missing in .env.local');
        return;
    }

    console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);

    const payload = { userId: '1234567890', role: 'user' };

    try {
        // 1. Sign
        console.log('Signing token...');
        const token = await signAccessToken(payload);
        console.log('Token generated:', token.substring(0, 20) + '...');

        // 2. Verify
        console.log('Verifying token...');
        const verified = await verifyAccessToken(token);

        if (verified) {
            console.log('SUCCESS: Token verified correctly.');
            console.log('Payload:', verified);
        } else {
            console.error('FAILURE: Token verification returned null.');
        }

    } catch (e) {
        console.error('EXCEPTION:', e);
    }
}

testTokens();
