var express=require('express');
var app=express();
var bodyParser=require('body-parser')
var mongoose=require('mongoose')

var Login=require('./models/login')
var Regi=require('./models/registers')

const bcrypt=require('bcryptjs')
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
app.post("/register",async(req,res)=>{
   const password=await bcrypt.hash(password,10)
   try{
    const register=new Regi({
       name:req.body.name,
       email:req.body.email,
       password:req.body.password,
       patname:req.body.username,
       bod:req.body.bod
    })
   const registed=await register.save();
   res.status(201).redirect('/')  
}catch(e){
      if(e='E11000'){
         console.log('alrady registaion');
      }else{
      console.log(e)
      }
      return res.json({status:'error'})
   }
})
app.post('/login',async(req,res)=>{
   console.log(req.body)
   
   /* const {name,email,password : plainTextPassword}=req.body;
   const password=await bcrypt.hash(password,10)
   try{
       const responce=await User.create({
          name,
          email,password
          
       })
       console.log('User create successfuly')
   }catch (error){
       console.log(error)
       return res.json({status:'error'})
   } */
   res.json({status:'ok'})
  ;
})
app.listen(port,()=>{
   console.log(`server is runing ... ${port}`)
});
app.use((req, res) => {
   res.status(404).render('404', { title: 'error' })
});