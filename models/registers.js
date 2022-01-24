const mongoose=require("mongoose");
const ragiSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    patname:{
        type:String,
        required:true
    },
    bod:{
        type:Date,
        required:true
    }
})

const Register=new mongoose.model("Register",ragiSchema)
module.exports=Register