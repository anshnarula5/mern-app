const express = require("express")
const router = express.Router()
const Profile = require("../../models/Profile")
const auth = require("../../middleware/auth")
const {check, validationResult} = require("express-validator")
const User = require("../../models/User")
const request = require("request")
const config = require("config")

//@route  GET api/profile/me
//@desc   get user profile
//@access private

router.get("/me",auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate("user", ["name", "avatar"])
        if (!profile) {
            return res.status(400).json({msg : "No Profile made for this user"})
        }
        res.json(profile)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
})  

//@route  POST api/profile/
//@desc   Make user profile
//@access private

const validation = [
    check("status", "Status is required").not().isEmpty(),
    check("skills", "Skill is required").not().isEmpty()
]

router.post("/", [auth, validation], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({errors : errors.array()})
    }
    const {
        website,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
        // spread the rest of the fields we don't need to check
        ...rest
      } = req.body;
    const profileFields = {
        user: req.user.id,
        website: website,
        skills: Array.isArray(skills)
          ? skills
          : skills.split(',').map((skill) => ' ' + skill.trim()),
        ...rest
      };
  
      // Build socialFields object
      const socialFields = { youtube, twitter, instagram, linkedin, facebook };
  
      // normalize social fields to ensure valid url
    //   for (const [key, value] of Object.entries(socialFields)) {
    //     if (value && value.length > 0)
    //       socialFields[key] = normalize(value, { forceHttps: true });
    //   }
      // add to profileFields
      profileFields.social = socialFields;
  
    try {
        // Using upsert option (creates new doc if no match is found):
        let profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        return res.json(profile);
      } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
      }

})


//@route  GET api/profile/
//@desc   get all profiles
//@access public

router.get("/", async (req, res) => {
    try {
        const profiles = await Profile.find({}).populate("user", ["name", "avatar"])
        res.json(profiles)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
})

//@route  GET api/profile/user/user_id
//@desc   get profile by userID
//@access public

router.get("/user/:user_id", async (req, res) => {
    try {
        const {user_id} = req.params
        const profile = await Profile.findOne({user : user_id}).populate("user", ["name", "avatar"])
        if (!profile) {
            return res.status(400).json({msg : "NO profile exists for this user"})
        }
        res.json(profile)
    } catch (error) {
        console.log(error.message)
        if (error.name === "CastError") {
            return res.status(400).json({msg : "NO profile exists for this user"})
        }
        res.status(500).send("Server Error")
    }
})


//@route  DELETE api/profile/
//@desc   gelete profile and user
//@access public

router.delete("/", auth, async (req, res) => {
    try {
        //Delete Profile
        await Profile.findOneAndRemove({user : req.user.id})
        //Delete User
        await User.findOneAndRemove({_id: req.user.id})
        res.send("Delete")
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
})



//@route  PUT api/profile/experience
//@desc   add experience
//@access private

const validateExp = [
    check("title", "Title is required").not().isEmpty(),
    check("company", "Company is required").not().isEmpty(),
    check("from", "From date is required").not().isEmpty()
]

router.put("/experience", [auth, validateExp], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()})
    }
    
    try {
        const newExp = {...req.body}
        const profile = await Profile.findOne({user : req.user.id})
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})
//61508b94ef20822099618940
//@route  DELETE api/profile/experience/exp_id
//@desc   delete experience
//@access private

router.delete("/experience/:expID", auth, async (req, res) => {
    try {
        //Delete Profile
        const {expID} = req.params
        const profile = await Profile.findOne({user: req.user.id})
        if (profile.experience) {
            profile.experience = profile.experience.filter(
                profileExp => profileExp._id.toString() !== expID.toString()
            );
        }
        await profile.save()
        res.json(profile)
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
})


//@route  PUT api/profile/education
//@desc   add education
//@access private

const validateEdu = [
    check("school", "School is required").not().isEmpty(),
    check("degree", "Degree is required").not().isEmpty(),
    check("fieldofstudy", "Field is required").not().isEmpty(),
    check("from", "From date is required").not().isEmpty()
]

router.put("/education", [auth, validateEdu], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({errors : errors.array()})
    }
    
    try {
        const newEdu = {...req.body}
        const profile = await Profile.findOne({user : req.user.id})
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send("Server Error")
    }
})

//@route  DELETE api/profile/experience/exp_id
//@desc   delete experience
//@access private

router.delete("/education/:eduId", auth, async (req, res) => {
    try {
        //Delete Profile
        const {eduId} = req.params
        const profile = await Profile.findOne({user: req.user.id})
        if (profile.education) {
            profile.education = profile.education.filter(
                profileEdu => profileEdu._id.toString() !== eduId.toString()
            );
        }
        await profile.save()
        res.json(profile)
        
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
}
)

router.get("/github/:username", async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc
                    &client_id=${config.get("githubClientId")}&client_secret=${config.get("githubSecret")}`,
            method: "GET",
            headers: {"user-agent" : "node.js"}
        }
        request(options, (error, response, body) => {
            if(error) console.log(error)
            if (response.statusCode !== 200) {
                return res.status(404).json({msg : "No github profile found"})
            }
            res.json(JSON.parse(body))
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send("Server Error")
    }
})





module.exports = router