import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  code : {
    type: String,
    required: true,
  },
  language : {
    type: String,
    required: true,
  },
  title : {
    type: String,
    required: true,
  },
  analysis : {
    summary : {
      type: String,
      required: true,
    },
    bugs : [{
     type : String
    }
  ],
    vulnerabilities : [{
      type: String,
    }],
    timeComplexity : {
      type: String,
      
    },
    spaceComplexity : {
      type: String,
      
    },
    suggestions : [{
      type: String,
      required: true,
    }],
  }
})

export default mongoose.model('Analysis', analysisSchema);