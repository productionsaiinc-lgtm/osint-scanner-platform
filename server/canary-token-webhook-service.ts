import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import geoip from 'geoip-lite';

const app = express();
const PORT = 3000;
app.use(bodyParser.json());

// Configuration store for webhook URLs
const webhookConfigs = new Map();

// Store all trigger events
const triggerEvents = [];

// Endpoint to receive canary token triggers
app.post('/trigger', async (req, res) => {
    try {
        const eventId = uuidv4();
        const visitorIP = req.ip;
        const geo = geoip.lookup(visitorIP) || {};
        const userAgent = req.headers['user-agent'];
        const device = userAgent.match(/(tablet|mobile|desktop)/i) ? userAgent.match(/(tablet|mobile|desktop)/i)[0] : 'desktop';
        const browser = userAgent.match(/(chrome|firefox|safari|edge|opera|ie)/i) ? userAgent.match(/(chrome|firefox|safari|edge|opera|ie)/i)[0] : 'unknown';
        const os = userAgent.match(/(windows|macintosh|linux|android|ios)/i) ? userAgent.match(/(windows|macintosh|linux|android|ios)/i)[0] : 'unknown';

        // Log the event
        const triggerEvent = { id: eventId, visitorIP, geo, device, browser, os };
        triggerEvents.push(triggerEvent);

        // Handle webhook notifications
        const webhookUrls = webhookConfigs.get(req.body.token) || [];
        for (const url of webhookUrls) {
            await sendWebhook(url, triggerEvent);
        }

        res.status(200).send('Trigger recorded');
    } catch (error) {
        console.error('Error processing trigger:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Function to send webhook
const sendWebhook = async (url, data, retryCount = 3) => {
    try {
        await axios.post(url, data);
        console.log(`Webhook sent to ${url} successfully.`);
    } catch (error) {
        console.error(`Failed to send webhook to ${url}:`, error);
        if (retryCount > 0) {
            console.log(`Retrying webhook to ${url}...`);
            await sendWebhook(url, data, retryCount - 1);
        } else {
            console.log(`Webhook to ${url} failed after retries.`);
        }
    } finally {
        logWebhookAttempt(url, data);
    }
};

// Log webhook attempts
const logWebhookAttempt = (url, data) => {
    console.log('Webhook attempt:', { url, data });
};

// Configuration endpoint for webhooks
app.post('/configure-webhook', (req, res) => {
    const { token, url } = req.body;
    if (!webhookConfigs.has(token)) {
        webhookConfigs.set(token, []);
    }
    webhookConfigs.get(token).push(url);
    res.status(200).send('Webhook configured');
});

app.listen(PORT, () => {
    console.log(`Canary token webhook service listening on port ${PORT}`);
});
