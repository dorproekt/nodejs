const {Router} = require('express')
const Order = require('../models/order')
const auth = require('../middleware/auth')
const router = Router()

function formatOrders(arr){
  let newArr = [];

  for(const [i, item] of arr.entries()){
    let price = 0

    newArr[i] = {
      _id: item._id,
      date: item.date,
      user:{
        useId:{
          name: item.user.userId.name,
          email: item.user.userId.email
        }
      },
      courses: item.courses.map(c => {

        price += c.course.price * c.count

        return {
          course:{
            title: c.course.title,
          },
          count: c.count
        }
      }), 
    }

    newArr[i].price = price
  }

  

  return newArr;
}
 
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({'user.userId': req.user._id}) 
      .populate('user.userId')

    res.render('orders', {
      isOrder: true,
      title: 'Заказы',
      orders: formatOrders(orders)
      // orders: orders.map(o => {
      //   return {
      //     ...o._doc,
      //     price: o.courses.reduce((total, c) => {
      //       return total += c.count * c.course.price
      //     }, 0)
      //   }
      // })
    })
  } catch (e) {
    console.log(e)
  }
})


router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user
      .populate('cart.items.courseId')
      .execPopulate()

    const courses = user.cart.items.map(i => ({
      count: i.count,
      course: {...i.courseId._doc}
    }))

    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses: courses
    })

    await order.save()
    await req.user.clearCart()

    res.redirect('/orders')
  } catch (e) {
    console.log(e)
  }
})

module.exports = router