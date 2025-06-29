import dotenv from 'dotenv';
import express from 'express';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Firebase Admin Initialization
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const serviceAccountPath = join(__dirname, './service-account-file.json');
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// App Configuration
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/send-notification', async (req, res) => {
    const { token, userId, userName, textMessage } = req.body;

    if (!token || !userId || !userName || !textMessage) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
        });
    }

    const message = {
        token,
        notification: {
            title: userName,
            body: textMessage,
        },
        data: {
            userId,
        },
        android: {
            priority: 'high',
        },
        apns: {
            headers: {
                'apns-priority': '5',
            },
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Notification sent successfully:', response);

        return res.status(200).json({
            success: true,
            message: 'Notification sent successfully',
            response,
        });
    } catch (error) {
        console.error('FCM send error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error sending notification',
            error: error.message,
        });
    }
});

// Server Start
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});