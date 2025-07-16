const express = require('express')
const app = express()

const PORT = process.env.PORT_THREE || 6060
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const amqp = require('amqplib')
const Order = require('./Order')
const isAuthenticated = require('../isAuthenticated')
var channel, connection

mongoose.connect("mongodb://localhost/order-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Order Service DB CONNECTED')
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))


async function connect() {
    const amqpServer = "amqp://localhost:5672"
    connection = await amqp.connect(amqpServer)
    channel = await connection.createChannel()
    await channel.assertQueue('ORDER');

}

function createOrder(products, userEmail) {
    let total = 0;
    for (let t = 0; t< products.length; ++t) {
        total += products[t].price
    }
    const newOrder = new Order({
        products,
        user: userEmail,
        total_price: total
    })
    newOrder.save()
    return newOrder
}

connect().then(() => {
    channel.consume('ORDER', data => {
        const {products, userEmail} = JSON.parse(data.content)
        const newOrder = createOrder(products, userEmail)
        console.log('Consuming ORDER queue')
        console.log(products);
        console.log(userEmail);
        channel.ack(data)
        channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({
            newOrder
        })))
    })
})

// Creating a new product
// Buying a Product


app.get('/test', isAuthenticated, async(req, res) => {
    res.send({message: 'So this works'})
})


app.listen(PORT, () => {
    console.log(`Order Service at ${PORT}`)
})

