const mongoose = require('mongoose');
const Post = require('./models/posts');
const Comment = require('./models/comments');
const {delete_comment_and_replies} = require("./delete_comment");

const TEST_URI = 'mongodb://127.0.0.1:27017/phreddit_test'; //for testing

beforeAll(async () => {
    await mongoose.connect(TEST_URI); //connection to db
});

afterEach(async () => {
    await Post.deleteMany(); //delete post
    await Comment.deleteMany(); //delete comment associated with it
});

afterAll(async () => {
    await mongoose.disconnect(); //wait for disconnect
});

async function create_nested_comments() {
    const dummyPostID = new mongoose.Types.ObjectId();
    const dummyUserID = new mongoose.Types.ObjectId();
    const dummyFlairID = new mongoose.Types.ObjectId();

    //create 3 nested comments
    const comment3 = await new Comment({
        content: 'Lv 3 comment',
        commentIDs: [],
        commentedBy: dummyUserID,
        commentedDate: new Date(),
        postID: dummyPostID
    }).save();

    const comment2 = await new Comment({
        content: 'Lv 2 comment',
        commentIDs: [comment3._id],
        commentedBy: dummyUserID,
        commentedDate: new Date(),
        postID: dummyPostID
    }).save();

    const comment1 = await new Comment({
        content: 'Lv 1 comment',
        commentIDs: [comment2._id],
        commentedBy: dummyUserID,
        commentedDate: new Date(),
        postID: dummyPostID
    }).save(); 

    //create post
    const post = await new Post({
        title: "Test Post",
        content: "dummy content",
        postedBy: dummyUserID,
        commentIDs: [comment1._id],
        linkFlairID: dummyFlairID,
        views: 0,
        postedDate: new Date()
    }).save();

    comment1.postID = post._id;
    comment2.postID = post._id;
    comment3.postID = post._id;

    await comment1.save();
    await comment2.save();
    await comment3.save();

    return {postID: post._id, commentIDs: [comment1._id, comment2._id, comment3._id]};
}

test("delete 1 post and all 3 comments", async () => {
    const {postID, commentIDs} = await create_nested_comments();

    const post = await Post.findById(postID); //find post
    expect(post).not.toBeNull();

    for(const comment of post.commentIDs){ //delete all comment first
        await delete_comment_and_replies(comment);
    }
    await Post.findByIdAndDelete(postID); //delete the post

    const postDeleted = await Post.findById(postID); //post should be null
    expect(postDeleted).toBeNull();

    for(const cid of commentIDs){  //all comment should be null
        const comment = await Comment.findById(cid);
        expect(comment).toBeNull();
    }
})