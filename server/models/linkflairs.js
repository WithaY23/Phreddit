// LinkFlair Document Schema
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LinkflairSchema = new Schema({
    content:{type: String, maxLength: 30},
    //each linkflair can have 0 or more posts, not required
    postIDs: [{type: Schema.Types.ObjectId, ref:'Post'}] 
});

//virtual url
LinkflairSchema.virtual('url').get(function(){
    return 'linkflair/' + this._id;
});

//allow virtural field to be send back
LinkflairSchema.set('toJSON', {virtuals: true});

module.exports = mongoose.model('Linkflair', LinkflairSchema);