const express = require('express');
const https = require('https'); // Use https instead of http
const fs = require('fs'); // To read SSL certificate files
const cors = require('cors');
const API = require('./api');
const DB_CONNECT = require('./config/dbConnect');
const { io } = require('./socket');
const cookieSession = require('cookie-session');
const { notFound, errorHandler } = require('./middlewares/errorHandling');
require('dotenv').config();

// Load SSL Certificates
const privateKey = fs.readFileSync('/etc/letsencrypt/live/ooridoo.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/ooridoo.com/fullchain.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/ooridoo.com/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const PORT = process.env.PORT || 9000;  // Make sure the backend port is 9000 if not set in .env
const app = express();
const server = https.createServer(credentials, app);  // Use HTTPS server
io(server); // Socket connection
new DB_CONNECT();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use(cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}));

// Configure CORS (ensure your frontend URL is set here)
app.use(cors({ origin: "https://ooridoo.com", credentials: true }));

// Welcome route
app.get('/', (req, res) => res.json({ message: 'Welcome to the RentalSite API' }));

// API routes and error handling
new API(app).registerGroups();
app.use(notFound);
app.use(errorHandler);

// Start HTTPS server
server.listen(PORT, () => console.log(`Server is running on https://ooridoo.com:${PORT}`));

// Optional memory usage logging
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory Usage - RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);
}, 60000);
