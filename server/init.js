/* server/init.js
** You must write a script that will create documents in your database according
** to the datamodel you have defined for the application.  Remember that you 
** must at least initialize an admin user account whose credentials are derived
** from command-line arguments passed to this script. But, you should also add
** some communities, posts, comments, and link-flairs to fill your application
** some initial content.  You can use the initializeDB.js script from PA03 as 
** inspiration, but you cannot just copy and paste it--you script has to do more
** to handle the addition of users to the data model.
*/
const mongoose= require('mongoose');
const CommunityModel = require('./models/communities');
const CommentModel = require('./models/comments');
const LinkFlairModel = require('./models/linkflairs');
const PostModel = require('./models/posts');
const UserModel = require('./models/users');
const {encrypt, verifyEncryption} = require("./encrpytion")

//command parameter [database, admin email, displayname, password]
//command: node server/init.js mongodb://127.0.0.1:27017/phreddit email displayname password
//userArgs
//[sliced] -> node.js
//[sliced] -> path of script
//[0] -> database [1] -> email [2] -> name [3] -> password
let userArgs = process.argv.slice(2);
const mongoDB = userArgs[0];
const adminEmail = userArgs[1];
const adminName = userArgs[2];
const adminPassword = userArgs[3];
const reset = userArgs.includes("-reset"); //for resetting data only

if(!mongoDB || !adminEmail || !adminName || !adminPassword){
    console.error('Use Format: node server/init.js <mongoDB> <adminEmail> <adminName> <adminPassword>')
    return
}
if (!mongoDB.startsWith('mongodb')){
    console.error('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
 
initializeDB(); //start initializing 

async function initializeDB()
{
    mongoose.connect(mongoDB);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, "MongoDB connection error"));

    if(reset){
        console.log("reset data")
        //delete previous data
        await CommunityModel.deleteMany({});
        await CommentModel.deleteMany({});
        await PostModel.deleteMany({});
        await LinkFlairModel.deleteMany({});
        await UserModel.deleteMany({}); 
    }
    

    //order: User/ Linkflair (should probably remove postIDs), Comments, Posts, Communities 
   
    //create admin user object
    const hashedPassword = await encrypt(adminPassword);
    const adminUser = new UserModel({
        email: adminEmail,
        displayName: adminName,
        firstName: 'a',
        lastName: 'b',
        passwordHash: hashedPassword,
        reputation: 1000,
        isAdmin: true
    });

    const admin = await adminUser.save(); //save the admin user into 'User' database

    const hash1 = await encrypt("bigfeet");
    const user1 = new UserModel({
        email: "bigfeet@gmail.com",
        displayName: "bigfeet",
        firstName: 'c',
        lastName: 'd',
        passwordHash: hash1,
        reputation: 100,
        isAdmin: false
    });

    const userRef1 = await createUser(user1);

    const hash2 = await encrypt("astyanax");
    const user2 = new UserModel({
        email: "astyanax@aol.com",
        displayName: "astyanax",
        firstName: 'e',
        lastName: 'f',
        passwordHash: hash2,
        reputation: 100,
        isAdmin: false
    });

    const userRef2 = await createUser(user2);


    const hash3 = await encrypt("rollo");
    const user3 = new UserModel({
        email: "rollo@outlook.com",
        displayName: "rollo",
        firstName: 'g',
        lastName: 'h',
        passwordHash: hash3,
        reputation: 100,
        isAdmin: false
    });

    const userRef3 = await createUser(user3);




    //link flairs
    const linkFlair1 = { // link flair 1
        linkFlairID: 'lf1',
        content: 'The jerkstore called...', 
    };
    const linkFlair2 = { //link flair 2
        linkFlairID: 'lf2',
        content: 'Literal Saint',
    };
    const linkFlair3 = { //link flair 3
        linkFlairID: 'lf3',
        content: 'They walk among us',
    };
    const linkFlair4 = { //link flair 4
        linkFlairID: 'lf4',
        content: 'Worse than Hitler',
    };
    // const linkFlair5 = { //link flair 4
    //     linkFlairID: 'lf4',
    //     content: 'Lorem ipsum dolor sit amet, coaaaa',
    // };
    console.log("AHH")

    let linkFlairRef1 = await createLinkFlair(linkFlair1);
    let linkFlairRef2 = await createLinkFlair(linkFlair2);
    let linkFlairRef3 = await createLinkFlair(linkFlair3);
    let linkFlairRef4 = await createLinkFlair(linkFlair4);
    // let linkFlairRef5 = await createLinkFlair(linkFlair5);

    






    //comments
    const comment7 = { // comment 7
        commentID: 'comment7',
        content: 'Generic poster slogan #42',
        commentIDs: [],
        commentedBy: userRef1,
        commentedDate: new Date('September 10, 2024 09:43:00'),
    };
    let commentRef7 = await createComment(comment7);
    
    // const comment6 = { // comment 6
    //     commentID: 'comment6',
    //     content: 'I want to believe.',
    //     commentIDs: [commentRef7],
    //     // commentedBy: 'outtheretruth47',
    //     commentedDate: new Date('September 10, 2024 07:18:00'),
    // };
    // let commentRef6 = await createComment(comment6);
    
    const comment5 = { // comment 5
        commentID: 'comment5',
        content: 'The same thing happened to me. I guest this channel does still show real history.',
        commentIDs: [],
        commentedBy: userRef1,
        commentedDate: new Date('September 09, 2024 017:03:00'),
    }
    let commentRef5 = await createComment(comment5);
    
    // const comment4 = { // comment 4
    //     commentID: 'comment4',
    //     content: 'The truth is out there.',
    //     commentIDs: [commentRef6],
    //     commentedBy: userRef2,
    //     commentedDate: new Date('September 10, 2024 6:41:00'),
    // };
    // let commentRef4 = await createComment(comment4);
    
    const comment3 = { // comment 3
        commentID: 'comment3',
        content: 'My brother in Christ, are you ok? Also, YTJ.',
        commentIDs: [],
        commentedBy: userRef3,
        commentedDate: new Date('August 23, 2024 09:31:00'),
    };
    let commentRef3 = await createComment(comment3);
    
    const comment2 = { // comment 2
        commentID: 'comment2',
        content: 'Obvious rage bait, but if not, then you are absolutely the jerk in this situation. Please delete your Tron vehicle and leave is in peace.  YTJ.',
        commentIDs: [],
        commentedBy: userRef2,
        commentedDate: new Date('August 23, 2024 10:57:00'),
    };
    let commentRef2 = await createComment(comment2);
    
    // const comment1 = { // comment 1
    //     commentID: 'comment1',
    //     content: 'There is no higher calling than the protection of Tesla products.  God bless you sir and God bless Elon Musk. Oh, NTJ.',
    //     commentIDs: [commentRef3],
    //     // commentedBy: 'shemp',
    //     commentedDate: new Date('August 23, 2024 08:22:00'),
    // };
    // let commentRef1 = await createComment(comment1);
    // console.log("AHH after comments")



    // Posts
    const post1 = { // post 1
        postID: 'p1',
        title: 'AITJ: I parked my cybertruck in the handicapped spot to protect it from bitter, jealous losers.',
        content: 'Recently I went to the store in my brand new Tesla cybertruck. I know there are lots of haters out there, so I wanted to make sure my truck was protected. So I parked it so it overlapped with two of those extra-wide handicapped spots.  When I came out of the store with my beef jerky some Karen in a wheelchair was screaming at me.  So tell me prhreddit, was I the jerk?',
        linkFlairID: linkFlairRef1,
        postedBy: userRef1, // Modifed data
        postedDate: new Date('August 23, 2024 01:19:00'),
        commentIDs: [commentRef2, commentRef3, commentRef7], // Modified data
        views: 14,
    };
    const post2 = { // post 2
        postID: 'p2',
        title: "Remember when this was a HISTORY channel?",
        content: 'Does anyone else remember when they used to show actual historical content on this channel and not just an endless stream of alien encounters, conspiracy theories, and cryptozoology? I do.\n\nBut, I am pretty sure I was abducted last night just as described in that show from last week, "Finding the Alien Within".  Just thought I\'d let you all know.',
        linkFlairID: linkFlairRef3,
        postedBy: userRef2, // Modified data
        postedDate: new Date('September 9, 2024 14:24:00'),
        commentIDs: [commentRef5], // Modified data
        views: 1023,
    };
    const postRef1 = await createPost(post1);
    const postRef2 = await createPost(post2);




    //communities

    // community objects
    const community1 = {// community object 1
        communityID: 'community1',
        name: 'Am I the Jerk?',
        description: 'A practical application of the principles of justice.',
        postIDs: [postRef1],
        startDate: new Date('August 10, 2014 04:18:00'),
        members: [userRef3, userRef2], // Modified data
        memberCount: 2,
        createdBy: userRef3._id
    };
    const community2 = { // community object 2
        communityID: 'community2',
        name: 'The History Channel',
        description: 'A fantastical reimagining of our past and present.',
        postIDs: [postRef2],
        startDate: new Date('May 4, 2017 08:32:00'),
        members: [ userRef2, userRef1], // Modified data 
        memberCount: 2,
        createdBy: userRef2._id
    };
    let communityRef1 = await createCommunity(community1);
    console.log(communityRef1);
    let communityRef2 = await createCommunity(community2);
    console.log(communityRef2);
    
    mongoose.connection.close();
}

function createCommunity (community)
{
    const newCommunity = new CommunityModel(community);
    return newCommunity.save();
}

function createLinkFlair(linkflair)
{
    const newLinkFlair = new LinkFlairModel(linkflair);
    return newLinkFlair.save();
}

function createComment(comment)
{
    const newComment = new CommentModel(comment);
    return newComment.save();
}

function createPost(post){
    const newPost = new PostModel(post);
    return newPost.save();
}

function createUser(user){
    const newUser = new UserModel(user);
    return newUser.save();
}


