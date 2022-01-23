var express=require('express');
var app=express();
app.listen(3000);
app.set('view engine','ejs')
 app.use(express.static('public')) 
app.get('/login',(req,res)=>{
   res.render('login', { title: 'Login' });
})
app.get('/',(req,res)=>{
   res.render('home' ,{ title: 'Home' });
})
app.get('/signup',(req,res)=>{
   res.render('signup' ,{ title: 'signup' });
})