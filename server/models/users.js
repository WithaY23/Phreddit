const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email:{type:String, required:true, unique:true},   //unique email
    displayName:{type:String, required:true, unique:true},    //unique name
    passwordHash:{type:String, required:true},
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    createdDate:{type:Date, default:Date.now},
    reputation:{type:Number, default:100},
    isAdmin:{type:Boolean}   //identification if is admin
})

UserSchema.virtual('url').get(function(){
    return 'users/' + this._id;
});

UserSchema.set('toJSON', {virtual:true});
module.exports = mongoose.model('User', UserSchema);