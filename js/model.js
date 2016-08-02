var mongoose=require('mongoose');
var imgSchema=mongoose.Schema({tag:String,name:String,src:String,index:Number});
var imgModel=mongoose.model('imgModel',imgSchema);
exports.imgModel=imgModel;
exports.imgSchema=imgSchema;
// module.exports=imgModel;