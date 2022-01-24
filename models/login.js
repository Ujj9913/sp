const mongoose=require('mongoose')
const { stringify } = require('querystring');
const Schema= mongoose.Schema;

const loginSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true}
},{collation:'users'})
const model=mongoose.model('login',loginSchema);
model.exports=model;
