import express from 'express';
import {snippetAnalyzer,getAllSnippets} from '../controllers/analysis.controller.js';
const analyzeRouter = express.Router();


analyzeRouter.post('/snippets',snippetAnalyzer);
analyzeRouter.get('/snippets',getAllSnippets);

export default analyzeRouter;