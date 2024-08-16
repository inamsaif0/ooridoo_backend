const express = require('express');
const http = require('http');
const cors = require('cors');
const API = require('./api');
const DB_CONNECT = require('./config/dbConnect');
const { io } = require('./socket');
const cookieSession = require('cookie-session');
const { notFound, errorHandler } = require('./middlewares/errorHandling');
require('dotenv').config();

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);
io(server);
new DB_CONNECT();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use(cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_KEY],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}));
var corsOptions = {
    origin: "http://5.104.83.184:3000", // Allow all origins
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow specific HTTP methods
    credentials: true
    // allowedHeaders:
    //     "Origin, X-Requested-With, Content-Type, Accept, Authorization", // Allow specific headers
    // optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.get('/', (req, res) => res.json({ message: 'Welcome to the Ooridoo API' }));

new API(app).registerGroups();
app.use(notFound);
app.use(errorHandler);
// app.use(storeUserId);

server.listen(PORT,() => console.log(`Server port ${PORT}`));

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory Usage - RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);
  }, 60000);
  