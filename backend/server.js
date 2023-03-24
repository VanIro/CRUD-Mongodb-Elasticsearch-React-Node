const express = require('express')
const app=express()
const mongoose=require('mongoose')
const cors=require('cors')
const dotenv=require('dotenv')
const bodyParser=require("body-parser")
const postRoute=require('./routes/posts')

dotenv.config()

mongoose.connect(process.env.MONGO_URL)
.catch(e=>{
    console.log('Error in connection: ',e)
})
.then(()=>console.log('db connected'))

app.use(cors())
app.use((req,res,next)=>{
    next()
})
app.use(express.json())
// app.use(bodyParser.json());
app.use('/posts',postRoute)


app.listen(3000,()=>{
    console.log('server running')
})

