import express from 'express';
import snippetAnalyzer from '../controllers/analysis.controller.js';
const analyzeRouter = express.Router();


analyzeRouter.post('/snippets',snippetAnalyzer);

export default analyzeRouter;