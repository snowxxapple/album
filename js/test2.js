var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/test');
// var db=mongoose.createConnection('localhost','test');
// db.on('error',console.error.bind(console,'连接错误'));
// db.once('open',function(){
	var PersonSchema=new mongoose.Schema({name:String,type:String});
	PersonSchema.methods.findSimilarType=function(){
		return this.model("Person").find({type:this.type});
	}
	PersonSchema.statics.findByName=function(name,cb){
		this.find({name:name},cb);
	}
	var PersonModel=mongoose.model('Person',PersonSchema);
	var PersonEnity=new PersonModel({name:"qq",type:"web"});
	var calback=PersonModel.find(function(err,persons){
		console.log(persons,'persons');
	})
	PersonEnity.save(calback);
	// console.log(PersonEnity.findSimilarType());
	// PersonModel.findByName('Kyouky',function(err,persons){
	// 	console.log(persons,'persons');
	// })
// })