const {Router} = require('express')
const Course = require('../models/course')
const router = new Router()

router.get('/', async (req, res) => {

    let courses = await Course.find().populate('userId', 'email name')

    courses = courses.map(c => {
        return {
            id: c._id,
            title: c.title,
            price: c.price,
            img: c.img
        }
    })

    res.render('courses', {
        title: 'Курсы',
        isCourses: true,
        courses: courses
    })

})

router.get('/:id', async (req, res) => {
    let course = await Course.findById(req.params.id)

    course = {
        id: course._id,
        title: course.title,
        price: course.price,
        img: course.img
    }

    res.render('course', {
        layout: 'empty',
        title: `Курс ${course.title}`,
        course
    })
})

router.get('/:id/edit', async (req, res) => {
    if(!req.query.allow){
        return res.redirect('/')
    }
    let course = await Course.findById(req.params.id)

    course = {
        id: course._id,
        title: course.title,
        price: course.price,
        img: course.img
    }
    
    res.render('course-edit', {
        title: `Редактировать курс ${course.title}`,
        course
    })
})

router.post('/edit', async (req, res) => {
    const {id} = req.body
    delete req.body.id
    await Course.findByIdAndUpdate(id, req.body)
    res.redirect('/courses')
})

router.post('/remove', async (req, res) => {

    try{
        await Course.deleteOne({_id: req.body.id})
        res.redirect('/courses')
    }catch(e){
        console.log(e)
    }

})

module.exports = router