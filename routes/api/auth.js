const express = require("express")
const router = express.Router()
const auth = require("../../middleware/auth")
const bcrypt = require("bcryptjs") 
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const User = require("../../models/User")
const config = require("config")

//@route  POST apir/users
//@desc   register User
//@access public

router.get("/", auth, async(req, res) =>{
    try {
        const user = await User.findById(req.user.id).select("-password")
        res.json(user)
    } catch (error) {
        console.log(error.message)
        res.status(500)
    }
})
const validator = [
    check("email", "Enter a valid email").isEmail(),
    check("password", "Enter a password").exists()
]

router.post("/", validator, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()})
    }
    const { email, password} = req.body
    try {
        //user Validation

        let user = await User.findOne({email})
        if (!user) {
            return res.status(500).json({errors: [{msg: "Invalid Credentials"}]})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) { 
            return res.status(500).json({errors: [{msg: "Invalid Credentials"}]})
        }
        // jwt

        const payload = {
            user :  {
                id : user.id
            }
        }

        jwt.sign(payload, config.get("jwtSecret"), {expiresIn: 360000}, (err, token) => {
            if (err) throw err
            res.json({token})
        })

    } catch (err) {
        console.log(err)
    }
})

module.exports = router