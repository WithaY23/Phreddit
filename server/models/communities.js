// Community Document Schema
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommunitySchema = new Schema(
{
    name: {type: String, required: true, maxLength: 100},
    description: {type: String, required: true, maxLength:500},
    //community can have 0 or more posts, not required
    postIDs: [{type: Schema.Types.ObjectId, ref:'Post'}], // COMMON ERROR- ref: Posts or Post, required: true or false
    startDate: {type: Date, required: true, default: Date.now}, //COMMON ERROR: Understand type: date
    members: [{type: Schema.Types.ObjectID, required: true, ref:'User' }], //COMMON ERROR: User
});

//virtual membercount
CommunitySchema.virtual('memberCount').get(function(){
    return this.members.length;
})

//virtual URL
CommunitySchema.virtual('url').get(function(){
    return 'communities/'+ this._id;
});

//allow virtural field to be send back
CommunitySchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('Community', CommunitySchema);