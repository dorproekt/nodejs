const {Router} = require('express')
const Course = require('../models/course')
const router = new Router()

router.get('/', async (req, res) => {

    const courses = await Course.getAll();

    res.render('courses', {
        title: 'Курсы',
        isCourses: true,
        courses: courses
    })

})

router.post('/edit', async (req, res) => {
    await Course.update(req.body)
    res.redirect('/courses')
})

router.get('/:id', async (req, res) => {
    const course = await Course.getByid(req.params.id)

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
    const course = await Course.getByid(req.params.id)
    
    res.render('course-edit', {
        title: `Редактировать курс ${course.title}`,
        course
    })
})

module.exports = router