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

connect().then(() => {
    channel.consume('ORDER', data => {
        const {products, userEmail} = JSON.parse(data.content)

        console.log('Consuming ORDER queue')
        console.log(products);
        console.log(userEmail);
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

