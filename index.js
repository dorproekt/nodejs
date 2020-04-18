const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars') 
const app = express()
const homeRoutes = require('./routes/home')
const coursesRoutes = require('./routes/courses')
const addRoutes = require('./routes/add')
const cardRoutes = require('./routes/card')
const ordersRoutes = require('./routes/orders')
const User = require('./models/user')

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(async (req, res, next) => {
    try{
        const user = await User.findById('5e9422cd681ffa70eb81293c')
        req.user = user
        next()
    }catch(e){
        console.log(e)
    }
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({
    extended: true
}))

app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add', addRoutes)
app.use('/card', cardRoutes)
app.use('/orders', ordersRoutes)

const PORT = process.env.PORT || 4000
const PASS = `hgU5tFJYmukN2oBu`

async function start(){

    try{
        const urlMongoDB = `mongodb+srv://admin:${PASS}@cluster0-6nwcy.mongodb.net/shop`
        await mongoose.connect(urlMongoDB, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        
        const candidate = await User.findOne()

        if(!candidate){
            const user = new User({
                email: 'dorproekt@ukr.net',
                name: 'Olexandr',
                cart: {items: []}
            })

            await user.save()
        }

        app.listen(PORT,() =>{
            console.log(`Server is running ${PORT}`) 
        })
    }catch(e){
        console.log(e)
    }

}

start()