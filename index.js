const port = 9000;
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
//setting express app
const app = express();

// function isValidPage(){
//     return (req, res, next)=>{
//         if(Number(req.querry.page) !== NaN){
//             if(Number(req.querry.page) !== NaN){
                
//             }else{
//                 res.send('Limit is required')
//             }
//         }else{
//             res.send('Page number is required')
//         }
//     }
// }

//setting up fuc*ing multer
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/productImages');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
   
var upload = multer({ storage: storage , limits: {
    fileSize: 3*1024*1024
}})


// parse application/x-www-form-urlencoded
app.use( bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


//setting static image routes
app.use('/productImages', express.static('productImages'))

//importing middlewares and functions
// let pagination = require('./middlewares.js');
let getProducts = require('./middlewares/getProducts.js');
let Register = require('./authentication/register.js');
let login = require('./authentication/login.js');
let isValidUser = require('./authentication/auth.js');
let Upload = require('./seller/upload.js');
let sellerConfirm = require('./seller/sellerConfirm.js')
let createShop = require('./seller/createShop.js');
let createSale = require('./middlewares/createSale.js')
let getReviews = require('./middlewares/getReviews.js');
let delivered = require('./middlewares/delivered.js')
let requiredValidation = require('./authentication/requiredValidation.js');
let buyProduct = require('./middlewares/buyProduct.js');
let getorders = require('./middlewares/ordered.js');
let rawValidCats = require('./middlewares/test-cats.js');
let administrative = require('./admin/administrative.js');
let giveReview = require('./middlewares/giveReview.js')
let edit = require('./seller/edit.js');
let extractedCats ;

mongoose.connect('mongodb://localhost/shop' , { useUnifiedTopology: true ,  useNewUrlParser: true });
let db = mongoose.connection;

//importing models
let Product = require('./models/product.js');
let User = require('./models/user.js');
let Shop = require('./models/shop.js')
let Cat = require('./models/cat.js');
let Order = require('./models/order.js');
let Packet = require('./models/packet.js');

db.once('open' , async (err)=>{
    if(!err){
        console.log('connected to database');
        Cat.findOne({onuse: true}, (err, cats)=>{
            if(err){console.log(err)}else{
                console.log(cats)
            }
        })
        console.log(extractedCats);
    }else{console.log(err);
    }
})

//setting middlewares
app.use(isValidUser(User));
app.use('/admin', administrative());




//setting routes
// app.get('/', (req, res)=>{
//     res.json('Hello from ht')
// })

app.get('/product', (req, res)=>{

})
app.get('/getcatagorys', (req, res)=>{
    console.log('Req reacived')
    res.json(rawValidCats);
})

app.post('/product/createsale', createSale(Product), (req, res)=>{
    res.send("You have successfully created a sale.. And a sale can not be modifyed until it ends");
})
app.post('/product/review', giveReview(Order, Product), (req, res)=>{
    res.send('Successfully reviewed the product')
})

app.get('/me/ordered', getorders(User), (req, res)=>{
    res.send(req.orders)
})
app.post('/editproduct', edit(Product), (req, res)=>{
    res.send('Successfulle Edited the product');
})

app.get('/product/getreviews', getReviews(Product), (req, res)=>{
    res.send(req.reviews);
})

app.get('/products/recent', getProducts(Product, false), async (req , res)=>{
    console.log('Req recieved')
    try {
        console.log(req.isValidUser, req.user);
        let final = res.result;
        res.result = undefined;
        console.log(final)
        res.json(final)
    } catch (error) {
        console.log(error);
        
    }
})
app.get('/ordered/confirm', sellerConfirm(Order, Product, User), (req, res)=>{
    res.send('Order Confirmed')
})

app.get('/orders/delivered', delivered(User, Order, Product), (req, res)=>{
    res.send('You have successfully confirmed the delivery');
})

app.get('/products/search', getProducts(Product, true), (req, res)=>{
    res.send(res.result);
})

app.get('/products/catagory', getProducts(Product) , (req, res)=>{
    console.log('trg64');
    res.send(res.result)
})
app.post('/product/buy', requiredValidation(), buyProduct(Product, User, Order, Shop), (req, res)=>{
    res.send('Damn Fuck. You successfully ordered the fucking hell product')
} )
app.post('/products/upload', Upload(Product, User, Shop, extractedCats), (req, res)=>{
    res.send('Successfully added the product')
})
app.post('/user/register', Register(User), (req, res)=>{
    console.log('/user/register')
    res.send(req.body.username+'is is');
})
app.post('/user/login', async (req, res)=>{
    console.log('/user/login')
    let token = await login(req, res, User);
    if(token === null){
        res.send('Invalid username or password')
    }
    console.log(token);
    res.send();
})
app.post('/createshop', createShop(Product, User, Shop), (req, res)=>{
    console.log('Is from index.js')
})

//Development routes ..... Will be removed in production.


app.get('/users', getProducts(User),  (req , res)=>{
    res.send(res.result)
})

app.listen(port , (err)=>{
    if(err){console.log(err)}else{
        console.log(`Server started at port ${port}`)
    }
})