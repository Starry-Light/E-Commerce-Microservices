const express = require('express')
const app = express()
const PORT = process.env.PORT_ONE || 7070
const mongoose = require('mongoose')
const User = require('./User')
const jwt = require('jsonwebtoken')

mongoose.connect("mongodb://localhost/auth-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('AUTH DB CONNECTED')
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
// Register Route



// Login Route


app.post('/auth/login', async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email})

    if (!user) {
        return res.json({message: "User Doesn't Exist"})
    } else {
        if (password !== user.password) {
            return res.json({ messge: "Password Incorrect"})
        }
        const payload = {
            email,
            name: user.name,
        }
        jwt.sign(payload, "ThisIsTheSecret", (err, token) => {
            if (err) console.log(err);
            else {
                return res.json({
                    token
                })
            }
        })
    }

})

app.post('/auth/register', async (req, res) => {
    const {email, password, name} = req.body;

    // Check if user exists
    const userExists = await User.findOne({email})

    if (userExists) {
        return res.json({ message: "User Already Exists"})

    } else {
        const newUser = new User({
            name,
            email,
            password
        });
        newUser.save();
        return res.json(newUser);
    }
})



app.listen(PORT, () => {
    console.log(`Auth Service at ${PORT}`)
})

