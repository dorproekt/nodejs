const {Router} = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const router = new Router()

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        error: req.flash('error')
    })
})

router.get('/logout', async (req, res) => {

    req.session.destroy(() => {
        res.redirect('/')
    })
    
})

router.post('/login', async (req, res) => {

    try{

        const {email, password} = req.body

        const candidate = await User.findOne({email})

        if(candidate){
            const areSame = await bcrypt.compare(password, candidate.password)

            if(areSame){

                req.session.user = candidate
            
                req.session.isAuthenticated = true
            
                req.session.save(err => {
                    if(err){
                        throw err
                    }else{
                        res.redirect('/')
                    }
                })
            }else{
                req.flash('error', 'Не верный пароль')
                res.redirect('/auth/login')
            }

        }else{
            req.flash('error', 'Такого пользователя не существует')
            res.redirect('/auth/login')
        }

    }catch(e){
        console.log(e)
    }
    
})

router.post('/register', async (req, res) => {
    try{
        const {email, password, repeat, name} = req.body

        const candidate = await User.findOne({email})

        if(candidate){
            req.flash('error', 'Пользователь с таким email уже существует')
            res.redirect('/auth/login#register')
        }else{

            const hashPassword = await bcrypt.hash(password, 10)

            const user = new User({
                email, name, password: hashPassword, cart: {items: []}
            })

            await user.save()
            res.redirect('/auth/login')
        }

    }catch(e){
        console.log(e)
    }
})

module.exports = router