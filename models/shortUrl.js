const mongoose=require("mongoose");
const shortId=require('shortid');
const shortUrlSchema=new mongoose.Schema({
    full:{
        type:String,
        required:true
    },
    short:{
        type:String,
        required:true,
        default:shortId.generate
    },
    click:{
        type:Number,
        default:0,
        required:false

    }

  })
 
  module.exports=mongoose.model('shortUrl',shortUrlSchema);
