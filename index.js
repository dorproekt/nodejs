const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars') 
const app = express()
const homeRoutes = require('./routes/home')
const coursesRoutes = require('./routes/courses')
const addRoutes = require('./routes/add')
const cardRoutes = require('./routes/card')

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({
    extended: true
}))

app.use('/', homeRoutes)
app.use('/courses', coursesRoutes)
app.use('/add', addRoutes)
app.use('/card', cardRoutes)

const PORT = process.env.PORT || 3000
const PASS = `hgU5tFJYmukN2oBu`

async function start(){

    try{
        const urlMongoDB = `mongodb+srv://admin:${PASS}@cluster0-6nwcy.mongodb.net/test?retryWrites=true&w=majority`
        await mongoose.connect(urlMongoDB, {useNewUrlParser: true})
        // await mongoose.connect(urlMongoDB, {useUnifiedTopology: true})

        app.listen(PORT,() =>{
            console.log(`Server is running ${PORT}`) 
        })
    }catch(e){
        console.log(e)
    }

}

start()