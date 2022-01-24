var express=require('express');
var app=express();
var bodyParser=require('body-parser')
var mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
var Login=require('./models/login')
var Regi=require('./models/registers')

const bcrypt=require('bcryptjs')
const JWT_SECRET='dfkhafkgfuegwfgvhfbjhfbkeugwuheb!@@@@%rtqw434324edsdadsd'
const port=process.env.PORT || 3000;

mongoose.connect('mongodb+srv://ujjval:123@cluster0.necyw.mongodb.net/spotify?retryWrites=true&w=majority',{
   useNewUrlParser:true,
   useUnifiedTopology:true
  
  
}).then(()=>{console.log('database connecttion successful');
}).catch((e)=>{console.log(e)})

//use ejs file handeler
app.set('view engine','ejs')


//useing middlewar
app.use(express.static('public')) 
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.get('/login',(req,res)=>{
   res.render('login', { title: 'Login' });
})
app.get('/',(req,res)=>{
   res.render('home' ,{ title: 'Home' });
})
app.get('/register',(req,res)=>{
   res.render('signup' ,{ title: 'signup' });
})
app.get('/change',(req,res)=>{
   res.render('change',{ title: 'change-pass' })
})  
app.post("/register",async(req,res)=>{
   const {name,password:plainTextPassword,email,username,bod}=req.body   
   const password=await bcrypt.hash(plainTextPassword,10)
   try{
      const register=new Regi({
         name:req.body.name,
         email:req.body.email,
         password:password,
         patname:req.body.username,
         bod:req.body.bod
      })
       const registed=await register.save()
       .then((result)=>{
         res.redirect('/');
      })
      .catch((err)=>{
         console.log(err.message) 
      })
   }
   catch (error){
      if(error.code===11000){
     
       return alert({status:'error',error:'you are alrady register'})
      }
      
      
   }
 
})
app.post('/login',async(req,res)=>{
     const {name,email,password}=req.body
     const user=await Regi.findOne({name,email}).lean()
     
     try{
         if(!user){
            return res.json({status:'error',error:'Invalid username and password'})
         }
         if(await bcrypt.compare(password,user.password)){
            const token=jwt.sign(
               { 
               id:user._id,
               email:user.email
               },JWT_SECRET)
         }
         console.log(user);
         res.status(201).redirect('/')
      }catch(err){
         console.log(err.message)
      }

   })


 app.post('/change',async (req,res)=>{
    const {token,newpass}=req.body
    try{
       const user=jwt.verify(token,JWT_SECRET)
       const _id=user.email
       const hashpassword=await  bcrypt.hash(newpass)
       await Regi.updateOne({_id},{
          $set:{password:hashpassword}
       })
    }catch(error){
       res.json({status:error,error:error})
    }
    
 }) 

app.listen(port,()=>{
   console.log(`server is runing ... ${port}`)
});
app.use((req, res) => {
   res.status(404).render('404', { title: 'error' })
});