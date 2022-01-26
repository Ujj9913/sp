var express=require('express');
var app=express();
var bodyParser=require('body-parser')
var mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
var Login=require('./models/login')
var Regi=require('./models/registers')
var path=require('path')

// const Song=require('./models/song')
const bcrypt=require('bcryptjs');
const { redirect } = require('express/lib/response');
const JWT_SECRET='dfkhafkgfuegwfgvhfbjhfbkeugwuheb!@@@@%rtqw434324edsdadsd'
const port=process.env.PORT || 3000;

const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
// const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const crypto=require('crypto');
const res = require('express/lib/response');
const mongoUrl='mongodb+srv://ujjval:123@cluster0.necyw.mongodb.net/spotify?retryWrites=true&w=majority'
mongoose.connect(mongoUrl,{
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
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:false}));
// app.use(upload())
//mongo connection
const conn=mongoose.createConnection(mongoUrl);
//file uploding 
let gfs;
conn.once('open',()=>{
gfs=Grid(conn.db,mongoose.mongo)
gfs.collection('song')
})

const storage =new GridFsStorage({
   url: mongoUrl,
   file: (req, file) => {
     return new Promise((resolve, reject) => {
       crypto.randomBytes(16, (err, buf) => {
         if (err) {
           return reject(err);
         }
         const filename = buf.toString('hex') + path.extname(file.originalname);
         const fileInfo = {
           filename: filename,
           bucketName: 'song'
         };
         resolve(fileInfo);
       });
     });
   }
 });
 const Song = multer({ storage });



app.get('/login',(req,res)=>{
   res.render('login', { title: 'Login' });
})
app.get('/',(req,res)=>{
   res.redirect('/home')
})
app.get('/register',(req,res)=>{
  res.render('signup' ,{ title: 'signup' });
})
app.get('/change',(req,res)=>{
   res.render('change',{ title: 'change-pass' })
}) 
app.get('/addnew',(req,res)=>{
   res.render('addnew',{title:'Add New song'})
}) 
app.get('/files', (req, res) => {
   gfs.files.find().toArray((err, files) => {
     // Check if files
     if (!files || files.length === 0) {
       return res.status(404).json({
         err: 'No files exist'
       });
     }
 
     // Files exist
     return res.json(files);
   });
 });
 app.get('/files/:filename', (req, res) => {
   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
     // Check if file
     if (!file || file.length === 0) {
       return res.status(404).json({
         err: 'No file exists'
       });
     }
     // File exists
     return res.json(file);
   });
 });
 app.get('/image/:filename', (req, res) => {
   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
     // Check if file
     if (!file || file.length === 0) {
       return res.status(404).json({
         err: 'No file exists'
       });
     }
 
     // Check if image
     if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
       // Read output to browser
       const readstream = gfs.createReadStream(file.filename);
       readstream.pipe(res);
     } else {
       res.status(404).json({
         err: 'Not an image'
       });
     }
   });
 });
 app.delete('/files/:id', (req, res) => {
   gfs.remove({ _id: req.params.id, root: 'uploads' }, (err, gridStore) => {
     if (err) {
       return res.status(404).json({ err: err });
     }
 
     res.redirect('/');
   });
 });
 
app.get('/home', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No files exist'
      });
    }

    // Files exist
    return res.render('home',{files:files});
  });

})

app.get('/home/:id', (req, res) => {
   const id = req.params.id;
   Song.findById(id)
       .then((result) => {
           res.render('play', { song: result, title: 'song play' });
       })
       .catch((err) => {
           res.status(404).render('404', { title: 'error' })
       })
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
       res.status(201).render('/login')
    }catch(error){
       res.json({status:error,error:error})
    }
    
 }) 
 app.post('/addnew', Song.single('file'),function(req,res){
    
       
          res.redirect('/');
       
       
    
 })

app.listen(port,()=>{
   console.log(`server is runing ... ${port}`)
});
app.use((req, res) => {
   res.status(404).render('404', { title: 'error' })
});