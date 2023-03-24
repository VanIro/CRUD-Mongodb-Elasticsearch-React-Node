const mongoose=require('mongoose')
const mongoosastic=require('mongoosastic')

const PostSchema=new mongoose.Schema({
    postId:{
        type:Number,
        required:true,
        unique: true
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    date:{
        type:String,
        default:Date.now,
    },
})

PostSchema.plugin(mongoosastic,{
    "host":'localhost',
    'port':9200
});

const Post=mongoose.model("Posts",PostSchema)
module.exports=Post.createMapping((err, mapping) => {
    console.log('mapping created');
});