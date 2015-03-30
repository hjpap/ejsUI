

var printName=function(){
	var pro=new EJS.Promise();
	setTimeout(function(){
		for(var i=0;i<10;i++){
			pro.progress(i);
		//	console.log("ppppp");
		}
		pro.resolve("printName complate");
		//console.log("ppoooo");
	},10);
	return pro;
}


var printAge=function(data){
	var pro=new EJS.Promise();
	setTimeout(function(){
		for(var i=0;i<10;i++){
			pro.progress(i+"printAge");
			//console.log("aaaaa");
		}
		pro.resolve("printAge complate"+data);
	},10);
	return pro;
}


EJS.Promise.any([printName(),printAge()]).then(function(e){
	console.log(e);
},function(e){
	console.log(e);
},function(e){
	console.log(e);
});

var ppro=printName();

ppro.then(
	function(e){
		console.log(e);
		return printAge();
	},
	function(e){
		console.log(e);
	},
	function(e){
		console.log(e);
	}
).then(
	function(e){
		console.log(e);
	},
	function(e){
		console.log(e);
	},
	function(e){
		console.log(e);
	}
);

/*
function fun(c,e,p){
	data;
	c(data);
	e(data);
	setTimeout(function(){
		for(var i=0;i<10;i++){
			p("test"+i);
		}
		c("test complate");
	});
}

var printSex=function(){
	return new EJS.Promise(fun);
}

fun(
function(){},
function(){},
function(){},

);

printSex().then(function(e){
	console.log(e);
},function(e){
	console.log(e);
},function(e){
	console.log(e);
});

*/

