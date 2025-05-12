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
    console.log("Get request received at /");
    res.send("Hello Phreddit! Get request received at localhost:8000");
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

app.post("/communities/update/removepost", async (req,res) =>{
    try
    {
        const postID = req.body["postID"];
        const communityID = req.body["communityID"];

        const updatedCommunity = await Community.findByIdAndUpdate(communityID,
            {
                $pull: {postIDs: postID}
            },
            {new: true}
        );

        if (!updatedCommunity) 
        {
            return res.status(404).json({error: "Community not found"});
        }
        res.status(200).json({success: "Post removed from community", community:updatedCommunity});

    }
    catch(err)
    {
        console.error("Error removing post from community: ", err);
        res.status(500).json({error: "Failed to remove post from community"});
    }


})


//get data from client
app.post('/communities', async (req, res) => {
    try{
        const new_community = new Community(req.body); //.body contains pure data 
        const save_community = await new_community.save(); //generate _id for MongoDB, save() saves to model 'Community'
        res.status(201).json(save_community);
    }
    catch(err){
        console.error("Failed to create community!!!!", err);
        res.status(500).json({error: "Failed to create community", details: err.message});
    }
})

app.get("/community/:communityID", async (req,res) =>{
    try{
        const comID = req.params['communityID'];
        //const community= await Community.find({url: 'communities/' + comID}).populate('postIDs').exec() // WILL NEED TO REMOVE .communityID IN SRC and replace with .url, remove 'communities/' prefix here and elsewhere
        const community = await Community.findById(comID).populate('postIDs').populate('createdBy');
        res.status(200).json(community)
    }
    catch(err){
        console.log("Error has occurred in getting community" + req.params['communityID'] + ": ", err)
        res.status(500).json({error: "Failed to get communities"})
    }

})
app.get("/comments", async (req, res) => {
    try{
        const comments = await Comment.find().populate("commentedBy");
        res.status(200).json(comments);
    }
    catch(err)
    {
        console.error("Failed to get comments: ", err)
        res.status(500).json("fail to get comments");
    }
});

//need updating
app.get("/comments/:commentID", async (req,res) => 
{
    try
    {
    const comments = await (Comment.find({_id: req.params['commentID']}).exec());
    if (comments === undefined || comments.length ===0)
    {
        res.status(404).json({error: "Could not find comment with commentID"})
    }
    const comment= comments[0];
    res.status(200).json(comment);
    }
    catch(err)
    {
        console.error("Error getting comment", err)
        res.status(500).json({error: "Error getting comment"})
    }
    
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
        console.log(comment);
        const newComment = new Comment(comment);
        console.log(newComment);
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
app.post("/comments/updateCommentVote/:newVote", async(req,res) =>{
    try
    {
        //votes have value of {-1,1} dislike and like
        const commentID = req.body["commentID"];
        const votername = req.body["votername"];
        // const previousVote = req.params["previousVote"]; //voters previous vote, can't assume previous vote
        const newVote = req.params["newVote"]; //voters new vote 

        
        const comment = await Comment.findOne({_id: commentID}).populate('voteUp').populate('voteDown');
        const previousVote = comment.voteUp.find((name) => name._id.toString() === votername.id) ? 1 : (comment.voteDown.find((name) => name._id.toString() === votername.id) ? -1: 0);

        const voteDifference = newVote - previousVote; 

        const voterID = votername.id;


        switch (voteDifference)
        {
            case 0: //user chose same option again, "deselect" it
            {
                const voteStatus = 0;
                //find out what the previous vote was to deselect it, 
                if (previousVote === 1) //previous vote was a like
                {
                    await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: -5}}) //may need to unencrypt postedBy
                    res.status(200).json({comment: await Comment.findByIdAndUpdate(commentID, {$pull: {voteUp: voterID}}, {new: true}), voteStatus: voteStatus }) //may need to unencrypt votersname
                }
                else//previous vote was a dislike
                {
                    await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: 10}}) //may need to unencrypt postedBy
                    res.status(200).json({comment: await Comment.findByIdAndUpdate(commentID, {$pull: {voteDown: voterID}}, {new:true}), voteStatus: voteStatus})  //may need to unencrypt votersname
                }
                break;
            }
            case 2: //user went from dislike to like
            {
                const voteStatus = 1;
                await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: 15}}) //may need to unencrypt postedBy
                res.status(200).json({comment: await Comment.findByIdAndUpdate(commentID, {$pull: {voteDown: voterID}, $push: {voteUp:voterID}}, {new: true}), voteStatus: voteStatus})  //may need to unencrypt votersname
                break;
            }
        case 1: //user went from no vote to like
            {
                const voteStatus = 1;
                await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: 5}}) //may need to unencrypt postedBy
                console.log(commentID);
                res.status(200).json({comment: await Comment.findByIdAndUpdate(commentID, {$push: {voteUp:voterID}}, {new: true}), voteStatus: voteStatus})  //may need to unencrypt votersname
                break;
            }
        case -1: //user went from no vote to dislike
            {
                const voteStatus=  -1;
                await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: -10}}) //may need to unencrypt postedBy
                res.status(200).json({comment: await Comment.findByIdAndUpdate(commentID, {$push: {voteDown:voterID}}, {new:true}), voteStatus: voteStatus})  //may need to unencrypt votersname
                break;
            }
        case -2: //user went from like to dislike
            {
                const voteStatus=  -1;
                await User.updateOne({_id: comment.commentedBy}, {$inc: {reputation: -15}}) //may need to unencrypt postedBy
                res.status(200).json({comment: await Comment.findByIdAndUpdate(commentID, {$pull: {voteUp: voterID}, $push: {voteDown:voterID}}, {new:true }), voteStatus: voteStatus})  //may need to unencrypt votersname
                break;
            }
        }
    }
    catch(err)
    {
        console.error("Error voting on the comments: ", err);
        res.status(500).json({error: "Failed to vote on comments"});
    }

})

app.post("/comments/editcomment", async(req,res) =>
{
    try
    {
        const comment = req.body.comment;
        console.log(comment);
        const newComment=  await Comment.findByIdAndUpdate(comment.commentID,{
            content: comment.content,
            commentIDs: comment.commentIDs, 
            commentedBy: comment.commentedBy,
            commentedDate: comment.commentedDate,
            voteUp: comment.voteUp,
            voteDown: comment.voteDown,
            postID: comment.postID
        }, {new: true})
        res.status(200).json(newComment);
    }
    catch(err)
    {
        console.error("Error editting comment", err);
    }
    
})
app.post("/users/register", async (req, res) => {
    const {firstName, lastName, email, displayName, password} = req.body;

    try{
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ error: "Email already registered" });
        }

        const passwordHash = await encrypt(password);  //create password
        const newUser = new User({
            firstName,
            lastName,
            email,
            displayName,
            passwordHash,
            isAdmin: false,
            createdDate: new Date(),
            reputation: 100
        });
        await newUser.save();  //save user

        res.status(200).json({success: "register success"});
    } 
    catch(err){
        console.error("Registration failed", err);
        res.status(500).json({error: "Server error during registration"});
    }
});

app.put("/communities/:communityID", async (req, res) => {  //for updating community
    try{
        const communityID = req.params.communityID;
        const updatedCommunity = await Community.findByIdAndUpdate(communityID,
            {
                name: req.body.name,
                description: req.body.description
            },{new: true, runValidators: true}
        );
        if(!updatedCommunity){
            return res.status(404).json({ error: "Community not found" });
        }

        res.status(200).json(updatedCommunity);
    } 
    catch(err){
        console.error("Error updating community:", err);
        res.status(500).json({error: "Failed to update community"});
    }
});
app.put('/communities/:id/join', async (req, res) => { //join community
    const {userID} = req.body;
    try{
        const updated = await Community.findByIdAndUpdate(
            req.params.id,
            {$addToSet: {members: userID}}, //avoid duplicates
            {new: true}
        );
        res.json(updated);
    } 
    catch(err){
        res.status(500).json({ error: "Failed to join community"});
    }
});
app.put('/communities/:id/leave', async (req, res) => { //leav community
    const {userID} = req.body;
    try{
        const updated = await Community.findByIdAndUpdate(
            req.params.id,
            {$pull:{members: userID}}, //remove userID
            {new: true}
        );
        res.json(updated);
    }
    catch(err){
        res.status(500).json({ error: "Failed to leave community"});
    }
});


//app.get: express http GET POST PUT DELETE| request to posts
app.get('/posts', async (req, res) => {
    try 
    {
    const posts = await Post.find().populate('linkFlairID').populate('community').populate('postedBy'); //Post.find(), find all the posts
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
        const posts = await Post.find({_id: postID}).populate('linkFlairID').populate('community').populate('postedBy');
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

//return a JSON object of {post: newPost, voteStatus: [-1,0,1]}
app.post("/posts/updatePostVote/:newVote", async(req,res) =>{
    try
    {
        console.log("Here in new vote for post")
        //votes have value of {-1,1} dislike and like
        const postID = req.body["postID"];
        const votername = req.body["votername"];
        // const previousVote = req.params["previousVote"]; //voters previous vote, can't assume previous vote
        const newVote = req.params["newVote"]; //voters new vote 
    
        const post = await Post.findOne({_id: postID}).populate('voteUp').populate('voteDown');
        console.log("Post object", post);
        console.log("Votername object", votername);

        // votername is an object with a string .id field
        // voteUp contains users with a 
        // console.log("To string of voteUp user id", post.voteUp[0]._id.toString());
        const previousVote = post.voteUp.find((name) => name._id.toString() === votername.id) ? 1 : (post.voteDown.find((name) => name._id.toString() === votername.id) ? -1: 0);

        const voterID = votername.id;

        const voteDifference = newVote - previousVote; 

        //like: +5; dislike: -10
        //return a JSON object of {post: newPost, voteStatus: [-1,0,1]}
        switch (voteDifference)
        {
            case 0: //user chose same option again, "deselect" it
            {
                const voteStatus = 0;
                //find out what the previous vote was to deselect it, 
                if (previousVote === 1) //previous vote was a like
                {
                    await User.updateOne({_id: post.postedBy}, {$inc: {reputation: -5}}) //may need to unencrypt postedBy
                    res.status(200).json({post: await Post.findByIdAndUpdate(postID, {$pull: {voteUp: voterID}}, {new: true}), voteStatus: voteStatus}) //may need to unencrypt votersname
                }
                else
                {
                    await User.updateOne({_id: post.postedBy}, {$inc: {reputation: 10}}) //may need to unencrypt postedBy
                    res.status(200).json({post: await Post.findByIdAndUpdate(postID, {$pull: {voteDown: voterID}}, {new:true}), voteStatus: voteStatus}) //may need to unencrypt votersname
                }
                break;
            }
            case 2: //user went from dislike to like
            {
                const voteStatus = 1;
                await User.updateOne({_id: post.postedBy}, {$inc: {reputation: 15}}) //may need to unencrypt postedBy
                res.status(200).json({post: await Post.findByIdAndUpdate(postID, {$pull: {voteDown: voterID}, $push: {voteUp:voterID}}, {new: true}), voteStatus: voteStatus}) //may need to unencrypt votersname
                break;
            }
        case 1: //user went from no vote to like
            {
                const voteStatus = 1;
                console.log("Post page no vote to like")
                console.log("PostID:", postID);
                console.log("Votername object")
                console.log(votername)
                await User.updateOne({_id: post.postedBy}, {$inc: {reputation: 5}}) //may need to unencrypt postedBy
                res.status(200).json({post: await Post.findByIdAndUpdate(postID, {$push: {voteUp:voterID}}, {new: true}), voteStatus: voteStatus}) //may need to unencrypt votersname
                break;
            }
        case -1: //user went from no vote to dislike
            {
                const voteStatus= -1;
                await User.updateOne({_id: post.postedBy}, {$inc: {reputation: -10}}) //may need to unencrypt postedBy
                res.status(200).json({post: await Post.findByIdAndUpdate(postID, {$push: {voteDown:voterID}}, {new:true}), voteStatus: voteStatus}) //may need to unencrypt votersname
                break;
            }
        case -2: //user went from like to dislike
            {
                console.log("In like to dislike")
                const voteStatus= -1;
                await User.updateOne({_id: post.postedBy}, {$inc: {reputation: -15}}) //may need to unencrypt postedBy
                console.log("After user update")
                res.status(200).json({post: await Post.findByIdAndUpdate(postID, {$pull: {voteUp: voterID}, $push: {voteDown:voterID}}, {new:true }), voteStatus: voteStatus })//may need to unencrypt votersname
                break;
            }
        }
    }
    catch(err)
    {
        console.error("Error updating vote for post page: ", err);
        res.status(500).json({error: "Failed to update posts"});
    }

})
app.post("/posts/update/editpost", async (req,res) =>{
    const post = req.body['post'];
    console.log(post);
    try{
if(post.hasOwnProperty("linkFlairID"))
    {
        const newPost = await Post.findByIdAndUpdate(post.postID, 
            {_id: post.postID, 
            title: post.title, 
            content: post.content, 
            linkFlairID: post.linkFlairID,
            postedBy: post.postedBy,
            postedDate: post.postedDate,
            commentIDs: post.commentIDs,
            views: post.views,
            voteUp: post.voteUp,
            voteDown: post.voteDown
        }, {new: true})
        res.status(200).json({post: newPost, success: "Updating post is a success"});
    }
    else
    {
        const newPost = await Post.findByIdAndUpdate(post.postID, 
            {$unset: {"linkFlairID":""},
            $set: {_id: post.postID, 
            title: post.title, 
            content: post.content, 
            postedBy: post.postedBy,
            postedDate: post.postedDate,
            commentIDs: post.commentIDs,
            views: post.views,
            voteUp: post.voteUp,
            voteDown: post.voteDown
        }}, {new: true} )

        res.status(200).json({post: newPost, success: "Updating post is a success"});
    }
    }

    catch(err)
    {
        console.error("Could not edit post to new data", err);
        res.status(500).json({error: "Could not edit post to new data"})
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

app.get("/users/username/:id", async (req,res) => {
  try
  {
    const id = req.params["id"];
    console.log("HIIII" , id);
    const users = await User.find();
    console.log(users);
    const user = users.find((user) => {
      return user._id.toString() === id
    })
    if(user)
    {
      res.status(200).send(user);
    }
    else
    {
      res.status(404).send({error: "Failed to find user"})
    }
  }
  catch(err)
  {
    res.status(500).send({error: "Failed to get user", err})
  }
})

app.get("/users/:userID/reputation", async (req,res) => {
    try{
        const user = await User.findById(req.params.userID);
        res.status(200).json({reputation: user.reputation});
    }
    catch{
        res.status(500).send("fail to get reputation");
    }
})

// app.get("/test/", async (req,res) =>
// {
//     try
//     {
//    const comment =  await Comment.findById('6821e715d7aa0c4824c0ba9e');
//    res.status(200).json(comment);
//     }
//     catch(err)
//     {
//         res.status(500).send("fail to get comment");
//     }

// })


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
            createdDate: user.createdDate,
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

//-----------------------------deletion request-----------------------------------
app.delete("/comments/:commentID", async (req,res) => {   //delete comment
    try{
        const commentID = req.params.commentID;
        await delete_comment_and_replies(commentID);
        //find if comment replied to another comment, remove it from parent's commentIDs
        await Comment.findOneAndUpdate({commentIDs: commentID}, {$pull: {commentIDs: commentID}});

        res.status(200).json({success: "comment deleted"});
    }
    catch{
        res.status(500).json({error: "failed to delete comment"});
    }
});

app.delete("/posts/:postID", async (req,res) => { //delete post
    try{
        const postID = req.params.postID;
        const post = await Post.findById(postID); //find post
        if(!post){
            res.status(404).json({error: "post not found"});
        }

        for(const comment of post.commentIDs){ //delete all comment first
            await delete_comment_and_replies(comment);
        }

        await Post.findByIdAndDelete(postID); //delete the post

        //clean up community's postIDs
        await Community.updateMany({postIDs: postID},{$pull:{postIDs: postID}});
        await Linkflair.updateMany({postIDs: postID},{$pull:{postIDs: postID}});

        res.status(200).json({success: "post deleted"});
    }
    catch{
        res.status(500).json({error: "failed to delete post"});
    }
});

app.delete("/communities/:communityID", async (req,res) => {
    try{
        const communityID = req.params.communityID;
        const community = await Community.findById(communityID);
        if(!community){
            res.status(404).json({error: "community not found"});
        }

        for(const postID of community.postIDs){        //for all posts of community
            const post = await Post.findById(postID);  //find the post
            if(post){
                for(const commentID of post.commentIDs){    //for each comment
                    await delete_comment_and_replies(commentID);  //delete comment and all replies
                }
                await Post.findByIdAndDelete(postID);   //delete post
                await Linkflair.updateMany({postIDs: postID}, {$pull:{postIDs: postID }});
            }
        }
        await Community.findByIdAndDelete(communityID);  //delete community
        res.status(200).json({success: "community deleted"});

    }
    catch{
        res.status(500).json({error: "failed to delete community"});
    }
});

app.delete("/users/:userID", async (req, res) => {
    try{
        const userID = req.params.userID;

        //delete all comments and replies by this user
        const comments = await Comment.find({commentedBy: userID});
        for (const comment of comments) {
            await delete_comment_and_replies(comment._id);
        }

        //delete all posts by this user
        const posts = await Post.find({postedBy: userID});
        for(const post of posts){
            for (const commentID of post.commentIDs) {
                await delete_comment_and_replies(commentID);
            }
            await Post.findByIdAndDelete(post._id);
            await Community.updateMany({}, {$pull:{postIDs: post._id }});
            await Linkflair.updateMany({}, {$pull:{postIDs: post._id }});
        }

        //delete all communities created by this user
        const communities = await Community.find({createdBy: userID});
        for(const community of communities){
            for(const postID of community.postIDs){
                const post = await Post.findById(postID);
                if(post){
                    for(const commentID of post.commentIDs){
                        await delete_comment_and_replies(commentID);
                    }
                    await Post.findByIdAndDelete(postID);
                    await Linkflair.updateMany({}, { $pull:{ postIDs: postID}});
                }
            }
            await Community.findByIdAndDelete(community._id);
        }
        //delete user
        await User.findByIdAndDelete(userID);

        res.status(200).json({ success: "User and associated data deleted"});
    } catch (err) {
        console.error("Failed to delete user and associated data:", err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

async function delete_comment_and_replies(commentID){
    try{
        const comment = await Comment.findById(commentID);
        if (!comment) return;

        for(const reply of comment.commentIDs){ //all replies
            console.log("Replies in serverside", reply);
            await delete_comment_and_replies(reply);
        }
        if(comment.postID){
            await Post.updateOne({_id:comment.postID},{$pull:{commentIDs:commentID}});
        }


        await Comment.findByIdAndDelete(commentID); //deletion
    }
    catch{
        console.error("fail to delete comment");
    }
}
//-------------------------------------------------------------------------------------

//start the server
app.listen(8000, () => {console.log("Server listening on port 8000...");});


