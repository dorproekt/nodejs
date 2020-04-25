const {Router} = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../keys')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const router = new Router()

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SEND_GRID_API_KEY}
}))

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
            await transporter.sendMail(regEmail(email))
            res.redirect('/auth/login')

        }

    }catch(e){
        console.log(e)
    }
})

router.get('/reset', async (req, res) => {
    res.render('auth/reset', {
        title: 'Забыли пароль?',
        error: req.flash('error')

    })
})

router.post('/reset', (req, res) => {

    try{
        crypto.randomBytes(32, async (err, buffer) => {
            if(err){
                req.flash('error', 'Что-то пошло не так')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')

            const candidate = await User.findOne({email: req.body.email})

            if(candidate){
                candidate.resetTokken = token
                candidate.resetTokkenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                res.redirect('/auth/login')

            }else{
                req.flash('error', 'Такого email нет')
                res.redirect('/auth/reset')
            }

        })
    }catch(e){
        console.log(e)
    }
    
})

router.get('/password/:token', async (req, res) => {

    if(!req.params.token){
        return res.redirect('/auth/login')
    }

    try{
        const user = await User.findOne({
            resetTokken: req.params.token,
            resetTokkenExp: {$gt: Date.now()}
        })

        if(!user){
            return res.redirect('/auth/login')
        }else{
            res.render('auth/password', {
                title: 'Восстановление пароля',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }
    }catch(e){
        console.log(e)
    }

})

router.post('/password', async (req, res) => {
    try{
        const user = await User.findOne({
            _id: req.body.userId,
            resetTokken: req.body.token,
            resetTokkenExp: {$gt: Date.now()}
        })

        if(user){
            user.password =  await bcrypt.hash(req.body.password, 10)
            user.resetTokken = undefined
            user.resetTokkenExp = undefined
            await user.save()
            res.redirect('/auth/login')
        }else{
            req.flash('loginError', 'Время жизни токена истекло')
            res.redirect('/user/auth')
        }
    }catch(e){
        console.log(e)
    }
})

module.exports = router