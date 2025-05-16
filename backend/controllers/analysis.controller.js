import analysisModel from "../model/analysis.model.js";
import llmService from "../services/llmService.js";
const snippetAnalyzer = async (req,res) => {
  const {code,language,title} = req.body;
  if(!code || !language || !title){
    return res.status(400).json({
      message : "Please provide all the fields"
    })
  }
  try {
    const analysis = await llmService(code,language,title);
    const newAnalysis = new analysisModel({
      code,
      language,
      title,
      analysis
    })
    await newAnalysis.save();
    return res.status(200).json({
      message : "Analysis saved successfully",
      data : newAnalysis
    })
  } catch (error) {
    return res.status(500).json({
      message : "Internal server error",
      error : error.message
    })
  }
}

export default snippetAnalyzer;