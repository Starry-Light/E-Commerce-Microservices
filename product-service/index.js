const express = require('express')
const app = express()

const PORT = process.env.PORT_TWO || 5050
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const amqp = require('amqplib')
const Product = require('./Product')
const isAuthenticated = require('../isAuthenticated')
var channel, connection
var order
mongoose.connect("mongodb://localhost/product-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Product Service DB CONNECTED')
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))


async function connect() {
    const amqpServer = "amqp://localhost:5672"
    connection = await amqp.connect(amqpServer)
    channel = await connection.createChannel()
    await channel.assertQueue('PRODUCT');

}


connect()

// Creating a new product
// Buying a Product

app.post('/product/create', isAuthenticated, async (req, res) => {
    // req.user.email

    const { name, description, price } = req.body;
    const newProduct = new Product({
        name,
        description,
        price

    })
    newProduct.save()
    return res.json(newProduct)
})

app.get('/test', isAuthenticated, async(req, res) => {
    res.send({message: 'So this works'})
})

// User sends a list of IDs(product ids) to buy (cart)
// Create an order with those products
// total value of order is sum of prices of products.
// user DOES NOT interact with the order service
// we do

app.post('/product/buy', isAuthenticated, async (req, res) => {
    const {ids} = req.body;
    const products = await Product.find({ _id: {$in: ids}})

    channel.sendToQueue("ORDER",Buffer.from(JSON.stringify({
        products,
        userEmail: req.user.email
    })) )
    channel.consume("PRODUCT", data => {
        console.log("Consuming Product Queue");
        order = JSON.parse(data.content)
        channel.ack(data)
    })
    return res.json(order)
})

app.listen(PORT, () => {
    console.log(`Product Service at ${PORT}`)
})

