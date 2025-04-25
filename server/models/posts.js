const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title:{type: String, required: true, maxLength: 100},
    content:{type: String, required: true},
    linkFlairID:{type: Schema.Types.ObjectId, ref: 'Linkflair'},
    postedBy:{type: Schema.Types.ObjectId, ref: 'User' ,required: true},
    postedDate:{type: Date, default: Date.now},
    commentIDs:[{type: Schema.Types.ObjectId, ref: 'Comment'}],
    views:{type: Number, required: true, default: 0},
    voteCount:{type: Number, required: true, default: 0},
    // communityId: {types: Schema.Types.ObjectId, ref: 'Community', required:true} //direct access to community, no look up
})

//create virtual URL using property postID | read only | use for navigation
PostSchema.virtual('url').get(function(){
    return 'posts/' + this._id;
});

//must have 1 correspond community, virtual field
PostSchema.virtual('community', {
    ref: 'Community',             //search inside Community model
    localField: '_id',            //try to find match with _id
    foreignField: 'postIDs',      //look in the postIDs array of community model
    justOne: true                 //return community
});
//to allow virtual URL to be also sent back in JSON
PostSchema.set('toJSON', {virtuals: true});

//export model
module.exports = mongoose.model('Post', PostSchema);