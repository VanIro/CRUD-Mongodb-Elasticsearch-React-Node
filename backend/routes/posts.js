
const router=require('express').Router()
const elasticsearch=require('elasticsearch')
const esClient = new elasticsearch.Client({ node: 'http://localhost:9200',auth:{
    username:process.env.USERNAME,
    password:process.env.PASSWORD
}})

const mongoose=require('mongoose')
const mongoosastic=require('mongoosastic')


const PostSchema=new mongoose.Schema({
    postId:{
        type:Number,
        required:true,
        unique: true,
        es_indexed:true
    },
    title:{
        type:String,
        required:true,
        es_indexed:true,
    },
    description:{
        type:String,
        required:true,
        es_indexed:true
    },
    date:{
        type:String,
        default:Date.now,
    },
})

//Creating a new schema for implementing autoincrementing number field in PostSchema
var CounterSchema = mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});

PostSchema.pre('validate', function(next) {
    let doc = this;
    // console.log("updating the counter")
    let query = {},
    update = {$inc: { seq: 1} },
    options = { upsert: true, new: true, setDefaultsOnInsert: true };
    counter.findOneAndUpdate(query, update, options).exec().then( (arg) =>  {
        // console.log("Update query's result",arg)
        // console.log('new sequence : ',arg.seq)
        doc.postId = arg.seq;
        next();
    }).catch(error=>{
        console.log("error in counter update...")
        return next(error);
    });
});

PostSchema.plugin(mongoosastic,{
	host:"127.0.0.1",
	port:"9200",
	protocol:"http",
	auth: process.env.AUTH_KEY//username:password
})


var counter = mongoose.model('counter', CounterSchema);
const Post=mongoose.model("Post",PostSchema)


Post.createMapping((err, mapping)=>{  
  if(err){
    console.log('error creating mapping (you can safely ignore this)');
    console.log(err);
  }else{
    console.log('mapping created!');
    console.log(mapping);
  }
});

router.post('/add_post',async(req,res)=>{
    const post=new Post({
        // postId:req.body.postId,
        title:req.body.title,
        description:req.body.detail
    })
    try{
        const savedPost=await post.save()
        savedPost.on('es-indexed', (err,result) =>{
            // console.log("result is: ",result)
            if(!err){
                console.log('Indexed')
                res.json({message:'Successfully created!'})
            }
        });
     }catch(e){
        console.log("Error...",e)
        res.json({message:e})
     }
})
router.post('/delete_post',async(req,res)=>{
    // const indices = await esClient.cat.indices({format: 'json'})
    // console.log(indices)

    // const result= await esClient.search({
    //     index: 'Post',
    //     query: {
    //       match: { quote: 'winter' }
    //     }
    //   })

    Post.findOneAndDelete({postId:req.body.postId}).then((arg)=>{
        console.log("Deleted post..",arg)
        res.sendStatus(202)

        // esClient.deleteByQuery({
        //     index: 'posts',
        //     body: {
        //       query: {
        //         match_all: {},
        //       },
        //     },
            
        //   }, (err, response, status) => {
        //     if (err) {
        //       console.log(err);
        //     } else {
        //       console.log(`Deleted all documents: ${response}`);
        //     }
        //   });
    })

})

router.post('/edit_post',async(req,res)=>{
    query={postId:req.body.postId}
    update = {$set:{
        title:req.body.title,
        description:req.body.detail
    }}
    Post.findOneAndUpdate(query, update).exec().then( (arg) =>  {
        console.log('Updated post : ',arg)
        res.sendStatus(202);
    }).catch(error=>{
        console.log("error in post update...")
        res.json({message:error})
    });
})
router.get('/postById/:postId',async (req,res)=>{
    if(!req.params.postId){
        req.json({message:'Bad value for postId'})
        return;
    }
    Post.find({postId:req.params.postId}).exec().then((result)=>{
        if(result.length>0){
            const selected_fields=['postId','title','description','date']
            const ret_obj = Object.fromEntries(selected_fields.map(function(field){
                return [field,this[field]];
            },result[0]))
            res.json(ret_obj)
        }
        else{
            res.json([]);
        }
    })
});

 router.post('/search/',async (req,res)=>{
console.log("Searching for...",req.body.query)

	const result = await Post.search( {
                    wildcard: {
                        title: {
                          value: '*'+req.body.query+'*'
                        }
                      },
                    wildcard: {
                        description: {
                          value: '*'+req.body.query+'*'
                        }
                      },
        },
        (err,results)=>{
	if(err){
		console.log('Error searching',err)
	}
	else{
        top_results = results.hits.hits.slice(0,5).map((item)=>{
            return item._source;
        });
        console.log('Top search results: ',top_results)
		res.send(top_results)	
	}	
})

 })

 router.get('/',async (req,res)=>{
     try{
         const posts=await Post.find()
         res.json(posts)
     }catch(e){
         res.json({message:e})
     }
 })

module.exports=router
