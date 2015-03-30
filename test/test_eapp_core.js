

EApp.request({
	url:"eapp://Login/login",
	parameters:{name:"test"},
	testInfo:{
		status:"fail",
		result:{
			data:"hello world!"
		}
	}
}).then(
	function(e){
		console.log(e.result.data);
	},
	function(e){
		console.log(e.result.data);
	},
	function(e){
		console.log(e.result.data);
	}
);


var a=EApp.getRequestArgument();


var ready=0;
