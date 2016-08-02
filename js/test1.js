var mongoose=require('mongoose');//引用mongoose模块
// var db=mongoose.createConnection('localhost','test');//创建一个数据库连接
//监测数据库是否有异常
// db.on('error',console.error.bind(console,'连接错误'));
// db.once('open',function(){
	//一次打开
	mongoose.connect('mongodb://localhost/test');

	var PersonSchema=new mongoose.Schema({
		name:String//定义一个属性name，类型为String
	});
	//为PersonSchema追加方法
	PersonSchema.methods.speak=function(){
		console.log("my name is:"+this.name);
	}
	//将Schema发布为Model
	var PersonModel=mongoose.model('job',PersonSchema);
	//用model创建entity
	var personEntity=new PersonModel({name:"xx"});
	//打印实体名字
	console.log(personEntity.name);	
	personEntity.speak();
	//保存到数据库
	// personEntity.save();
	PersonModel.find(function(err,persons){
		console.log(err,'err');
		console.log(persons,'persons');
	});
// });
