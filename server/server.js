// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const cors = require('cors');

//import all schemas
const Comment = require('./models/comments');
const Community = require('./models/communities');
const Linkflair = require('./models/linkflairs');
const Post = require('./models/posts');
const User = require('./models/users');
const {encrypt, verifyEncryption} = require("./encrpytion")

const app = express();
const port = 8000;

app.use(cors());
// {timestamps: true}, could use this for schemas
// MUST STORE USER SESSION IN DB
app.use(
    session({
      secret: "supersecret difficult to guess string",
      cookie: {},
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/bcrypt_test'})
    })
  );



//connect to MongoDB, database name: phreddit, port: 27017
const mongoDB = 'mongodb://127.0.0.1:27017/phreddit';
mongoose.connect(mongoDB);

//get connection
const db = mongoose.connection;

//bind error event
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', function(){
    console.log('Connected to database');
});

app.use(express.json()); //allow server side to receive data sent from client side in json

//------------------Defining Routes------------------------

app.get("/", function (req, res) {
    console.log("Get request received at '/'");
    res.send("Hello Phreddit!");
});

//sending data to client
app.get("/communities", async (req, res) => {
    try 
    {
        const communities = await Community.find();
        console.log(communities)
        res.status(200).json(communities);
    } 
    catch (err) 
    {
        console.error("Failed to get communities: ", err);
        res.status(500).json("fail to get communities");
    }
    
})
//posting new post
//updating community postIDs array
app.post("/communities/update-community-postIDs/:communityID", async(req,res) =>{
    try{
        console.log("In community update")
        
        const post = req.body;
        const communityID = req.params['communityID'];
        // const community = await Community.find({url: 'communities/' + communityID}).populate('postIDs').exec()
        console.log("Post", post)
        console.log("CommunityID", communityID)
        // community.postIDs.push(post) //idk what to push, the objectID is weird

        const community = await Community.findByIdAndUpdate(communityID, {$push: {postIDs: post}}, {new: true})
        // Community.updateOne({url: 'communities/' + communityID},
        //     community
        // ) //may work, check with TA
        res.status(200).json({success: 'Updated community to include postID', community: community})
    }
    catch(err)
    {
        console.error("Error has occurred in updating community" + req.params['communityID'] + " postIDs: ", err)
        res.status(500).json({error: "Failed to get update community"})
    }
}) //update community postID

//get data from client
app.post('/communities', async (req, res) => {
    try{
        const new_community = new Community(req.body); //.body contains pure data 
        const save_community = await new_community.save(); //generate _id for MongoDB, save() saves to model 'Community'
        res.status(201).json(save_community);
    }
    catch{
        console.error("Failed to create community!!!!");
    }
})

app.get("/community/:communityID", async (req,res) =>{
    try{
        const comID = req.params['communityID'];
        //const community= await Community.find({url: 'communities/' + comID}).populate('postIDs').exec() // WILL NEED TO REMOVE .communityID IN SRC and replace with .url, remove 'communities/' prefix here and elsewhere
        const community = await Community.findById(comID).populate('postIDs');
        res.status(200).json(community)
    }
    catch(err){
        console.log("Error has occurred in getting community" + req.params['communityID'] + ": ", err)
        res.status(500).json({error: "Failed to get communities"})
    }

})
app.get("/comments", async (req, res) => {
    try{
        const comments = await Comment.find();
        res.status(200).json(comments);
    }
    catch(err)
    {
        console.error("Failed to get comments: ", err)
        res.status(500).json("fail to get comments");
    }
});

//need updating
app.get("/comment/:commentID", async (req,res) => {
    res.status(200).json(Comment.find({commentID: req.params['commentID']}, 'param field'));
});

//case for loading Post page, need comments as well
//get comments for post with postID
// app.get('/comments/post/:postID', async (req, res) => {
//     try
//     {
//         const comments = Comment.find({})

//     }
//     catch(err)
//     {

//     }
// })
app.post("/comments", async(req, res) => {
    try
    {
        const comment = req.body;
        const newComment = new Comment(comment);
        const savedComment = await newComment.save();
        res.status(201).json({success: "Created comment", comment: savedComment})
    }
    catch(err)
    {
        res.status(500).json({error: "Failed to create comment" + err});
    }

})
app.post("/comments/update-comments-commentIDs/:commentID", async(req,res) => {
    
    try
    {
        const commentID = req.params['commentID'];
        const subComment = req.body;
        console.log("In updating comment commentID");
        console.log(commentID);
        console.log(subComment);
        const updatedParentComment=  await Comment.findByIdAndUpdate(commentID, {$push: {commentIDs: subComment}}, {new: true});
        res.status(200).json({success: 'Updated comment to include new commentID',comment: updatedParentComment})
    }
    catch(err)
    {
        console.log("Error has occurred in updating comment" + req.params['commentID'] + " commentIDs: ", err)
        res.status(500).json({error: "Failed to get update comment"})
    }
})




//app.get: express http GET POST PUT DELETE| request to posts
app.get('/posts', async (req, res) => {
    try 
    {
    const posts = await Post.find().populate('linkFlairID').populate('community'); //Post.find(), find all the posts
    res.status(200).json(posts);     //send date in json
    } catch (err) 
    {
        console.error("Failed to load posts: ", err)
        res.status(500).json("fail to get posts");
    }
    
})
app.get('/posts/:postID', async (req,res) =>{

    try
    {
        const postID = req.params['postID'];
        const posts = await Post.find({_id: postID}).populate('linkFlairID').populate('community');
        if (posts === undefined || posts.length === 0)
        {
            throw new Error("Did not retrieve post");
        }
        const post = posts[0];
        res.status(200).json(post);
    }
    catch(err)
    {
        console.error("Failed to load post: ", err)
        res.status(500).json("fail to get post");
    }

})


app.post("/posts/", async(req,res) =>{
    // const postID = req.params["postsID"];
    // if(!postID)
    // {
    //     return res.status(400).json({error:"New post creation without attached postID in post"})
    // }
    try{

        const post = req.body;
        const newPost = new Post(post);
        console.log("post in app.post(/posts/)", post);
        const savedNewPost = await newPost.save()
        res.status(200).json({ success: "Created post", post: savedNewPost });
    }
    catch(err)
    {
        console.log("Error creating post: ", err);
        res.status(500).json({error: "Failed to create post"});
    }
})
app.post("/posts/update-posts-commentIDs/:postID", async (req,res) =>{
    try
    {
        const postID = req.params["postID"];
        const comment = req.body;
        const post = await Post.findByIdAndUpdate(postID, {$push: {commentIDs: comment}}, {new: true});
        res.status(200).json({success: "Updated post to include commentID", post: post})

    }
    catch(err)
    {
        console.log("Error updating post's comments: ", err);
        res.status(500).json({error: "Failed to update posts"});
    }
})
app.post("/posts/update-posts-views/:postID", async(req,res) =>{
    
    try
    {
    const postID = req.params['postID'];
    const updatedPost = await Post.findByIdAndUpdate(postID,{$inc: {views:1}}, {new: true});
    res.status(200).json(updatedPost)
    }
    catch(err)
    {
        console.log("Error updating post's view count: ", err);
        res.status(500).json({error: "Failed to update posts"});
    }
})


app.get('/linkflairs', async (req, res) => 
{
    try{
        const linkflairs = await Linkflair.find();
        res.status(200).json(linkflairs);
    }
    catch(err)
    {
        console.error("Error getting the linkflairs: ", err)
    }
    
})
app.get('/linkflairs/:linkflairID', async (req,res) =>
{
    try
    {
        const linkflairs=  await(Linkflair.find({_id: req.params['linkflairID']}))
        if (linkflairs === undefined || linkflairs.length === 0)
            {
                throw new Error("Did not retrieve linkflair");
            }
        const linkflair = linkflairs[0];
        console.log("Here is my linkflair: ", linkflair)
        res.status(200).json(linkflair);
    }
    catch(err)
    {
        console.error("Error getting linkflair " + req.params['linkflairID'] + ": ", err)
    }
})

app.post("/linkflairs/", async (req,res) =>{
    try
    {
        const linkflair = req.body;
        const newLinkflair = new Linkflair(linkflair)
        const saveLinkflair = await newLinkflair.save();
        // const newLinkflair = await createLinkFlair(linkflair);
        res.status(201).json({ success: "Created linkflair", linkflair: saveLinkflair })
    }
    catch
    {
        res.status(500).json({error: "Failed to create linkflair"});
    }
    
})



//user routes

app.get("/users/", async (req,res) => {
  try
  {
    const users = await User.find();
    res.status(200).send(users);
  }
  catch(err)
  {
    res.status(500).send({error: "Failed to get users"})
  }
})

app.get("/users/username/:displayName", async (req,res) => {
  try
  {
    const displayName = req.params["displayName"];
    const users = await User.find();
    const user = users.find(async (user) => {
      await verifyEncryption(displayName, user.displayName)
    })
    if(user)
    {
      res.status(200).send(user);
    }
    else
    {
      res.status(500).send({error: "Failed to find user"})
    }
  }
  catch(err)
  {
    res.status(500).send({error: "Failed to get user", err})
  }
})

// Try to find user email and password
// app.post("/users/login/:emailAddress/:password", async (req,res) => {
//     try
//     {
//       const emailAddress = req.params["emailAddress"];
//       const password = req.params["password"];
//       const users = await User.find();
//       const user = users.find(async (user) => {
//         await verifyEncryption(emailAddress, user.email)
//       })
//       if(user)
//       {
//         if(await verifyEncryption(password, user.passwordHash)) // Password matched database password associated with email
//         {
//             res.status(200).send(user);
//         }
//         res.status(500).send({error: "Failed to find user"})
//       }
//       else
//       {
//         res.status(500).send({error: "Failed to find user"})
//       }
//     }
//     catch(err)
//     {
//       res.status(500).send({error: "Failed to get user", err})
//     }
// })

app.post("/users/login", async (req, res) =>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).send({error: "Invalid Email"});
        }

        const password_match = await verifyEncryption(password, user.passwordHash);
        if(!password_match){
            return res.status(400).send({error: "Invalid Password"});
        }

        return res.status(200).send(user); //send user back
    }
    catch(err){
        console.error("error login", err);
        return res.status(500).send({ error: "server error" });
    }
});


//start the server
app.listen(8000, () => {console.log("Server listening on port 8000...");});


