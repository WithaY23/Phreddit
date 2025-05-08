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

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true                    //require authentication
}));
// {timestamps: true}, could use this for schemas
// MUST STORE USER SESSION IN DB
app.use(
    session({
        secret: "supersecret difficult to guess string",
        resave: false,
        saveUninitialized: false,
        //store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/bcrypt_test'})
        store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/phreddit'}),
        cookie: {
            httpOnly:true,
            sameSite: 'lax',       //allows cross orgin get requests
            //secure: true,
            maxAge: 1000*60*60*24, //1 day
        }
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

app.get("/users/session", (req, res) => {   //route for session
    if(req.session.user){    //logged in
        res.status(200).json(req.session.user);  //send back current user
    }
    else{                   //not logged in
        res.status(401).json({error: "Not logged in"})
    }
});

app.get("/", function (req, res) {
    console.log("Get request received at '/'");
    res.send("Hello Phreddit!");
});

//sending data to client
app.get("/communities", async (req, res) => {
    try 
    {
        const communities = await Community.find().populate("members");
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
app.post("/comments/updateCommentVote/:commentID/:votername/:newVote", async(req,res) =>{
    try
    {
        //votes have value of {-1,1} dislike and like
        const commentID = req.params["commentID"];
        const votername = req.params["votername"];
        // const previousVote = req.params["previousVote"]; //voters previous vote, can't assume previous vote
        const newVote = req.params["newVote"]; //voters new vote 

        
        const comment = await Comment.findOne({_id: commentID}).populate('voteUp').populate('voteDown');
        const previousVote = comment.voteUp.find(votername) ? 1 : (comment.voteDown.find(votername) ? -1: 0);

        const voteDifference = newVote - previousVote; 



        switch (voteDifference)
        {
            case 0: //user chose same option again, "deselect" it
            {
                //find out what the previous vote was to deselect it, 
                if (previousVote === 1) //previous vote was a like
                {
                    await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: -1}}) //may need to unencrypt postedBy
                    res.status(200).json(await Comment.findByIdAndUpdate(commentID, {$pop: {voteUp: votername}}, {new: true}) ) //may need to unencrypt votersname
                }
                else
                {
                    await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: 1}}) //may need to unencrypt postedBy
                    res.status(200).json(await Comment.findByIdAndUpdate(commentID, {$pop: {voteDown: votername}}, {new:true}))  //may need to unencrypt votersname
                }
                break;
            }
            case 2: //user went from dislike to like
            {
                await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: 2}}) //may need to unencrypt postedBy
                res.status(200).json(await Comment.findByIdAndUpdate(commentID, {$pop: {voteDown: votername}, $push: {voteUp:votername}}, {new: true}))  //may need to unencrypt votersname
                break;
            }
        case 1: //user went from no vote to like
            {
                await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: 1}}) //may need to unencrypt postedBy
                res.status(200).send(Comment.findByIdAndUpdate(commentID, {$push: {voteUp:votername}}, {new: true}))  //may need to unencrypt votersname
                break;
            }
        case -1: //user went from no vote to dislike
            {
                await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: -1}}) //may need to unencrypt postedBy
                res.status(200).json(await Comment.findByIdAndUpdate(commentID, {$push: {voteDown:votername}}, {new:true}))  //may need to unencrypt votersname
                break;
            }
        case -2: //user went from like to dislike
            {
                await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: -2}}) //may need to unencrypt postedBy
                res.status(200).json(await Comment.findByIdAndUpdate(commentID, {$pop: {voteUp: votername}, $push: {voteDown:votername}}, {new:true }))  //may need to unencrypt votersname
                break;
            }
        }
    }
    catch(err)
    {
        console.error("Error getting the linkflairs: ", err);
        res.status(500).json({error: "Failed to update posts"});
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

app.post("/posts/updatePostVote/:postID/:votername/:newVote", async(req,res) =>{
    try
    {
        //votes have value of {-1,1} dislike and like
        const postID = req.params["postID"];
        const votername = req.params["votername"];
        // const previousVote = req.params["previousVote"]; //voters previous vote, can't assume previous vote
        const newVote = req.params["newVote"]; //voters new vote 
        
        const post = await Post.findOne({_id: postID}).populate('voteUp').populate('voteDown');
        const previousVote = post.voteUp.find(votername) ? 1 : (post.voteDown.find(votername) ? -1: 0);


        const voteDifference = newVote - previousVote; 


        switch (voteDifference)
        {
            case 0: //user chose same option again, "deselect" it
            {
                //find out what the previous vote was to deselect it, 
                if (previousVote === 1) //previous vote was a like
                {
                    await User.updateOne({_id: post.postedBy}, {$inc: {reputation: -1}}) //may need to unencrypt postedBy
                    res.status(200).json(await Post.findByIdAndUpdate(postID, {$pop: {voteUp: votername}}, {new: true})) //may need to unencrypt votersname
                }
                else
                {
                    await User.updateOne({_id: post.postedBy}, {$inc: {reputation: 1}}) //may need to unencrypt postedBy
                    res.status(200).send(await Post.findByIdAndUpdate(postID, {$pop: {voteDown: votername}}, {new:true})) //may need to unencrypt votersname
                }
                break;
            }
            case 2: //user went from dislike to like
            {
                await User.updateOne({_id: post.postedBy}, {$inc: {reputation: 2}}) //may need to unencrypt postedBy
                res.status(200).send(await Post.findByIdAndUpdate(postID, {$pop: {voteDown: votername}, $push: {voteUp:votername}}, {new: true})) //may need to unencrypt votersname
                break;
            }
        case 1: //user went from no vote to like
            {
                await User.updateOne({_id: post.postedBy}, {$inc: {reputation: 1}}) //may need to unencrypt postedBy
                res.status(200).send(await Post.findByIdAndUpdate(postID, {$push: {voteUp:votername}}, {new: true})) //may need to unencrypt votersname
                break;
            }
        case -1: //user went from no vote to dislike
            {
                await User.updateOne({_id: post.postedBy}, {$inc: {reputation: -1}}) //may need to unencrypt postedBy
                res.status(200).send(await Post.findByIdAndUpdate(postID, {$push: {voteDown:votername}}, {new:true})) //may need to unencrypt votersname
                break;
            }
        case -2: //user went from like to dislike
            {
                await User.updateOne({_id: post.postedBy}, {$inc: {reputation: -2}}) //may need to unencrypt postedBy
                res.status(200).send(Post.findByIdAndUpdate(postID, {$pop: {voteUp: votername}, $push: {voteDown:votername}}, {new:true }) )//may need to unencrypt votersname
                break;
            }
        }
    }
    catch(err)
    {
        console.error("Error getting the linkflairs: ", err);
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
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findOne({email}); //get the user
        if(!user){
            return res.status(400).send({error: "Invalid Email"});
        }

        const password_match = await verifyEncryption(password, user.passwordHash);
        if(!password_match){
            return res.status(400).send({error: "Invalid Password"});
        }

        //add session
        req.session.user = {
            id: user._id,
            displayName: user.displayName,
            isAdmin: user.isAdmin,
            email: user.email,
        }

        return res.status(200).send(req.session.user); //send user back
    }
    catch(err){
        console.error("error login", err);
        return res.status(500).send({ error: "server error" });
    }
});

app.post("/users/logout", (req,res) => {
    req.session.destroy(error => {        //end session
        if(error){
            return res.status(500).send({error:"fail to logout"});
        }
        
        res.clearCookie("connect.sid");    //clear cookie
        return res.status(200).send({success: "logged out success"})
    });
})

app.get("/username/loggedin", (req,res) =>
{
    if(req.session.username)
    {
        res.status(200).send({loggedin: true, username: req.session.username});
    }
    else
    {
        res.status(200).send({loggedin: false, username: undefined})
    }
})

//start the server
app.listen(8000, () => {console.log("Server listening on port 8000...");});


