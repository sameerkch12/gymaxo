# OTP Configuration Guide

This guide explains how to set up and use the OTP (One-Time Password) system in Gymaxo with development and production modes.

## Overview

The OTP system supports two modes:
- **Development Mode**: OTP codes are displayed in the console/server logs
- **Production Mode**: OTP codes are sent via SMS using Twilio

## Development Mode Setup

### Configuration

In your `.env` file, set:

```env
NODE_ENV=development
```

Leave these fields empty or don't set them:
```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

### Usage

When running in development mode:
1. Start the backend: `npm run dev`
2. Call the OTP request endpoint (e.g., `POST /api/auth/request-email-otp`)
3. The OTP will be displayed in the console:
   ```
   📧 [DEV MODE - EMAIL OTP] Email: user@example.com
   📧 [DEV MODE - EMAIL OTP] OTP: 123456
   ```
4. The OTP will also be returned in the API response:
   ```json
   {
     "ok": true,
     "data": {
       "sent": true,
       "devOtp": "123456"
     }
   }
   ```

## Production Mode Setup

### Prerequisites

1. **Twilio Account** - Sign up at [https://www.twilio.com/](https://www.twilio.com/)
2. **Get Credentials**:
   - Account SID
   - Auth Token
   - Phone Number (from Twilio)

### Configuration

In your `.env` file, set:

```env
NODE_ENV=production
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Twilio Setup Steps

1. **Create Twilio Account**:
   - Go to https://www.twilio.com/
   - Sign up and verify your phone number
   - Get your Account SID and Auth Token from the dashboard

2. **Get a Phone Number**:
   - In Twilio console, go to "Phone Numbers" → "Manage" → "Active Numbers"
   - Click "Get your first Twilio phone number"
   - Choose a number and note it down

3. **Update .env**:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1XXX5551234
   ```

### Usage

When running in production mode:
1. Start the backend: `npm start`
2. Call the OTP request endpoint
3. OTP will be sent via SMS to the user's phone
4. User will receive an SMS with the OTP code

## Email OTP

For email-based OTP, configure SMTP:

### Development Mode
Leave SMTP fields empty - OTP shows in console

### Production Mode

1. **Gmail Setup**:
   - Enable 2-step verification: https://myaccount.google.com/security
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use the app password in `.env`

2. **Configure .env**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=Gymaxo <your-email@gmail.com>
   ```

## API Endpoints

### Request Email OTP
```
POST /api/auth/request-email-otp
Body: {
  "email": "user@example.com",
  "role": "owner"
}

Response (Dev Mode):
{
  "ok": true,
  "data": {
    "sent": true,
    "devOtp": "123456"
  }
}

Response (Prod Mode):
{
  "ok": true,
  "data": {
    "sent": true
  }
}
```

### Verify Email OTP
```
POST /api/auth/verify-email-otp
Body: {
  "email": "user@example.com",
  "code": "123456",
  "role": "owner",
  "name": "John Doe",
  "phone": "+919876543210",
  "password": "password123"
}

Response:
{
  "ok": true,
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

## Environment Variables Reference

| Variable | Dev Required | Prod Required | Description |
|----------|-------------|---------------|-------------|
| NODE_ENV | Yes | Yes | Set to "development" or "production" |
| TWILIO_ACCOUNT_SID | No | Yes | Twilio Account SID |
| TWILIO_AUTH_TOKEN | No | Yes | Twilio Auth Token |
| TWILIO_PHONE_NUMBER | No | Yes | Twilio Phone Number |
| SMTP_HOST | No | Yes* | SMTP Server Host |
| SMTP_USER | No | Yes* | SMTP Username |
| SMTP_PASS | No | Yes* | SMTP Password |
| SMTP_FROM | No | No | From email address |

*Only if using email-based OTP in production

## Troubleshooting

### OTP not appearing in development mode
- Check if `NODE_ENV=development` is set
- Check server logs/console
- Ensure backend is running with `npm run dev`

### SMS not sending in production
- Verify Twilio credentials are correct
- Ensure Twilio phone number is in international format: `+1234567890`
- Check Twilio account has enough balance/credits
- Verify phone number format in request

### Email not sending in production
- Verify SMTP credentials are correct (especially Gmail app password)
- Check email address format
- Ensure SMTP port is correct (usually 587 for TLS)
- Try enabling less secure apps if using Gmail

## Security Notes

1. **Development Mode**: OTPs are logged to console - do not use in production
2. **Production Mode**: Always use HTTPS for API calls
3. **OTP Expiry**: OTPs expire in 10 minutes
4. **Rate Limiting**: Failed verification attempts have a limit of 5 tries
5. **Never Commit Credentials**: Keep `.env` out of version control

## Related Files

- Service: [src/services/otp.service.ts](src/services/otp.service.ts)
- Auth Service: [src/services/auth.service.ts](src/services/auth.service.ts)
- Config: [src/config/env.ts](src/config/env.ts)
- Example Env: [.env.example](.env.example)
