const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../keys')
const requirelogin = require('../middlewar/requireLogin')

router.get('/protected', requirelogin, (req, res) => {
    res.send("hello user in protected page")
})

router.post('/signup', (req, res) => {
    //console.log(req.body.name)
    const {name, email, password} = req.body
    if(!email || !name || !password){
        return res.status(422).json({error: "Please add all the details !.."});
    }
    User.findOne({email: email})
    .then((savedUser)=>{
        if(savedUser){
            console.log("User exists")
            return res.status(422).json({error: "User already exists"})
        }
        bcrypt.hash(password, 12)
        .then(hashedpassword => {
            const user = new User({
                email,
                password:hashedpassword,
                name
            })
            user.save()
            .then(user=>{
                res.json({message: "saved successfully"})
            })
            .catch(err=>{
                console.log(err)
            })
        })

    })
    .catch(err=>{
        console.log(err)
    })
    //res.json({message: "successfully posted"})
})

router.post('/signin', (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(422).json({error: "please add email or password"})
    }
    User.findOne({email: email})
    .then(savedUser=>{
        console.log("Saved USer details "+savedUser)
        if(!savedUser){
            return res.status(422).json({error: "Invalid email or password"})
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch=>{
            console.log("domatch "+ doMatch)
            if(doMatch){
                //res.json({message: "Successfully signed in!.."})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET)
                const {_id,name,email} = savedUser
                res.json({token, user:{_id,name,email}})
            }
            else{
                return res.status(422).json({error: "Invalid email or password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
    .catch(err=>{
        console.log(err)
    })
})
    


module.exports = router;