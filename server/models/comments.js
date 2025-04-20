
const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const CommentSchema = new Schema(
    {
        content: {type:String, required: true, maxLength: 500},
        commentIDs: [{type: Schema.Types.ObjectId, ref:'Comment'}],
        commentedBy: {type: Schema.Types.ObjectId, required: true,  ref: 'User'},
        commentedDate: {type: Date, required:true, default: Date.now()},
        voteCount:{type:Number, required:true, default: 0}    //COMMON ERROR: Double check if required and if default is 0 or based on status
    })
    CommentSchema.virtual('url').get(() =>{
        return 'comments/' + this._id;
    })
    CommentSchema.set('toJSON', {virtuals: true});
module.exports = mongoose.model('Comment', CommentSchema);
