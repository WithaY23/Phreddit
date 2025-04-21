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
const bcrypt = require('bcrypt');

import CommunityModel from './models/communities';
import CommentModel from './models/comments';
import LinkFlairModel from './models/linkflairs';

mongoose.connect = 'arg1'
const db = mongoose.connection;
function createCommunity (community)
{
    // const community = 
    // {
    //     name: communityObj.name,
    //     description: communityObj.description,
    //     postIDs: communityObj.postIDs,
    //     startDate: 

    // }
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
async function initializeDB()
{
    //order: User/ Linkflair (should probably remove postIDs), Post, Comments/Communities 

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
        commentedBy: 'bigfeet',
        commentedDate: new Date('September 10, 2024 09:43:00'),
    };
    let commentRef7 = await createComment(comment7);
    
    const comment6 = { // comment 6
        commentID: 'comment6',
        content: 'I want to believe.',
        commentIDs: [commentRef7],
        commentedBy: 'outtheretruth47',
        commentedDate: new Date('September 10, 2024 07:18:00'),
    };
    let commentRef6 = await createComment(comment6);
    
    const comment5 = { // comment 5
        commentID: 'comment5',
        content: 'The same thing happened to me. I guest this channel does still show real history.',
        commentIDs: [],
        commentedBy: 'bigfeet',
        commentedDate: new Date('September 09, 2024 017:03:00'),
    }
    let commentRef5 = await createComment(comment5);
    
    const comment4 = { // comment 4
        commentID: 'comment4',
        content: 'The truth is out there.',
        commentIDs: [commentRef6],
        commentedBy: "astyanax",
        commentedDate: new Date('September 10, 2024 6:41:00'),
    };
    let commentRef4 = await createComment(comment4);
    
    const comment3 = { // comment 3
        commentID: 'comment3',
        content: 'My brother in Christ, are you ok? Also, YTJ.',
        commentIDs: [],
        commentedBy: 'rollo',
        commentedDate: new Date('August 23, 2024 09:31:00'),
    };
    let commentRef3 = await createComment(comment3);
    
    const comment2 = { // comment 2
        commentID: 'comment2',
        content: 'Obvious rage bait, but if not, then you are absolutely the jerk in this situation. Please delete your Tron vehicle and leave is in peace.  YTJ.',
        commentIDs: [],
        commentedBy: 'astyanax',
        commentedDate: new Date('August 23, 2024 10:57:00'),
    };
    let commentRef2 = await createComment(comment2);
    
    const comment1 = { // comment 1
        commentID: 'comment1',
        content: 'There is no higher calling than the protection of Tesla products.  God bless you sir and God bless Elon Musk. Oh, NTJ.',
        commentIDs: [commentRef3],
        commentedBy: 'shemp',
        commentedDate: new Date('August 23, 2024 08:22:00'),
    };
    let commentRef1 = await createComment(comment1);
    console.log("AHH after comments")


    //communities

    // community objects
    const community1 = {// community object 1
        communityID: 'community1',
        name: 'Am I the Jerk?',
        description: 'A practical application of the principles of justice.',
        postIDs: [postRef1],
        startDate: new Date('August 10, 2014 04:18:00'),
        // members: ['rollo', 'shemp', 'catlady13', 'astyanax', 'trucknutz69'], //USER reference
        memberCount: 4,
    };
    const community2 = { // community object 2
        communityID: 'community2',
        name: 'The History Channel',
        description: 'A fantastical reimagining of our past and present.',
        postIDs: [postRef2],
        startDate: new Date('May 4, 2017 08:32:00'),
        // members: ['MarcoArelius', 'astyanax', 'outtheretruth47', 'bigfeet'], //USER reference
        memberCount: 4,
    };
    let communityRef1 = await createCommunity(community1);
    console.log(communityRef1);
    let communityRef2 = await createCommunity(community2);
}

async function encryptPassword(password)
{
    const saltRounds=  10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password,salt);
}

async function verifyPassword(password, hash)
{
    if(await bcrypt.compare(password, hash))
        {
            return true
        }
    return false;
}
