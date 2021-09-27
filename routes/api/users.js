const express = require("express")
const router = express.Router()
const gravatar = require("gravatar")
const bcrypt = require("bcryptjs") 
const jwt = require("jsonwebtoken")
const config = require("config")
const {check, validationResult} = require("express-validator")
const User = require("../../models/User")

//@route  POST apir/users
//@desc   register User
//@access public
const validator = [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Enter a valid email").isEmail(),
    check("password", "Please enter a password with atleast 6 characters").isLength({min : 6})
]

router.post("/", validator, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()})
    }
    const {name, email, password} = req.body
    try {
        //user Validation

        let user = await User.findOne({email})
        if (user) {
            return res.status(500).json({errors: [{msg: "User already exists"}]})
        }
        const avatar = gravatar.url(email, {
            s: "200",
            r: "pg",
            d: "mm"
        })
        user = new User({name, email, avatar, password})

        //bcrypt

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        await user.save()

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