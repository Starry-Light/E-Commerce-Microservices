const jwt = require("jsonwebtoken")

module.exports = async function isAuthenticated(req, res, next) {
    // "Bearer <token>".split(' ')[1]
    // split the string by the space

    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({message: "No auth header"})
    }
    const token = req.headers["authorization"].split(" ")[1]

    
    jwt.verify(token, "ThisIsTheSecret", (err, user) => {
        if (err) {
            return res.json({
                message: err
            })
        } else {
            req.user = user;
            next()
        }
    })
}