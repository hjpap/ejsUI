(function promiseInit(){
	"use strict";
	
	var State={
		PENDING   	:0,
		FULFILLED 	:1,
		REJECTED  	:2,
		PROGRESSING	:4,
	};
	
	var Promise=EJS.Class.define(function(init){
		
		this.readyState=State.PENDING;
		this._resolves=[];
		this._rejects=[];
		this._progresses=[];
		
		if(init!=null){
			var that=this;
			init(
				function(data){
					that._onComplated(data);
				},
				function(data){
					that._onComplated(data);
				},
				function(data){
					that._onProgress(data);
				}
			);
		}
		
	},{
		_onComplated:function(data){
			this.resolve(data);
		},
		_onError:function(data){
			this.reject(data);
		},
		_onProgress:function(data){
			this.progress(data);
		},
		then:function(onComplated,onError,onProgress){
			
			var newPromise=new Promise();
			var fulFill=function(data){
				var result=onComplated ? onComplated(data) : data;
				if(isPromise(result)){
					result.then(function(dt){
						newPromise.resolve(dt);
					},
					function(dt){
						newPromise.reject(dt);
					},
					function(dt){
						newPromise.progress(dt);
					});
				}else{
					newPromise.resolve(result);
				}
				return result;
			};
			
			if(this.readyState==State.REJECTED || this.readyState==State.FULFILLED){
				return newPromise;
			}
			
			this._resolves.push(fulFill);
			
			if(onError){
				this._rejects.push(onError);
			}else{
				this._rejects.push(function(data){
					newPromise.reject(data);
				});
			}
			
			if(onProgress){
				this._progresses.push(onProgress);
			}else{
				this._progresses.push(function(data){
					newPromise.progress(data);
				});
			}
			
			return newPromise;
		},
		/*
		done:function(onComplated,onError,onProgress){
			
			
		},
		*/
		resolve:function(data){
			if(this.readyState==State.REJECTED || this.readyState==State.FULFILLED){
				return;
			}
			this.readyState=State.FULFILLED;
			
			for(var i=0,len=this._resolves.length;i<len;i++){
				var handler=this._resolves[i];
				handler(data);
			}
		},
		reject:function(data){
			if(this.readyState==State.REJECTED || this.readyState==State.FULFILLED){
				return;
			}
			this.readyState=State.REJECTED;
			
			for(var i=0,len=this._rejects.length;i<len;i++){
				var handler=this._rejects[i];
				handler(data);
			}
		},
		progress:function(data){
			if(this.readyState==State.REJECTED || this.readyState==State.FULFILLED){
				return;
			}
			this.readyState=State.PROGRESSING;
			
			for(var i=0,len=this._progresses.length;i<len;i++){
				var handler=this._progresses[i];
				handler(data);
			}
		}
	},{
		State:State,
		
		isPromise:isPromise,
		
		as:function(value){
			if(value && value==='object' && typeof value.then==='function'){
				return value;
			}
			return new Promise(value);
		},
		
		any:function(promises){
			if(promises==null) return;
			var newPromise=new Promise();
			
			for(var i=0,len=promises.length;i<len;i++){
				var promise=promises[i];
				promise.then(function(data){
					newPromise.resolve(data);
				},function(data){
					newPromise.reject(data);
				},function(data){
					newPromise.progress(data);
				});
			}
			
			return newPromise;
		},
		
		all:function(promises){
			if(promises==null) return;
			var newPromise=new Promise();
			
			var results=[],counter=0;
			for(var i=0,len=promises.length;i<len;i++){
				var promise=promises[i];
				promise.then(function(data){
					results.push(data);
					if(++counter >= len){
						newPromise.resolve(results);
					}
				});
			}
			
			return newPromise;
		}
	});
	
	function isPromise(promise){
		return promise && typeof promise.then==='function';
	}
	
	EJS.Namespace.define("EJS",{
		Promise:Promise
	});
	
})(this);