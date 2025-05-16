import express from 'express';
import cors from 'cors';
import "dotenv/config.js";
import http from 'http';
import connectDB from './config/mongoDB.js';
import analyzeRouter from './routes/analysis.route.js';
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/',() => {
  console.log('API call successful');
})

app.use('/api/analyze',analyzeRouter);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
})