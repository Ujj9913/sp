const mongoose=require('mongoose')
const Schema=mongoose.Schema;

const songSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    creater:{
        type:String,
        required:true
    },
    song:{
        
    }
},{timestamps :true});
const Song=mongoose.model('Song',songSchema);
module.exports=Song;