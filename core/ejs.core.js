
var rootNameSpace="EJS";

(function(){
	"use strict";
	
	/***compatibility***/
	
	Object.keys=Object.keys || function(obj){
		var result=[];
		var hasOwnProperty=({}).hasOwnProperty;
		for(var key in obj){
			if(hasOwnProperty.call(obj,key)){
				result.push(key);
			}
		}
		return result;
	};
	
	Object.create=Object.create || function(target,propertites){
		if(target==null) return;
		var temp=function(){};
		temp.prototype=target;
		var instance=new temp();
		instance.defineProperties(propertites);
		return instance;
	};
	
	//Object.defineProperties
})();

(function(global){
	"use strict";
	
	var classSet=global._classSet=global._classSet || {};
	
	function require(classId){
		if(classId==null || typeof classId !== 'string') return;
		if(classSet[classId]){
			var classMoudle=classSet[classId];
			var currentNamespace=EJS.Namespace.define(classMoudle.namespace);
			if(currentNamespace.hasOwnProperty(classMoudle.className)){
				return currentNamespace[classMoudle.className];
			}
			var classTemp=EJS.Class.define(classMoudle.constructor,classMoudle.instanceMembers,classMoudle.staticMembers);
			Object.defineProperty(currentNamespace,classMoudle.className,{value:classTemp,enumerable:true,configurable:true,writable:false});
			return classTemp;
		}
	}
	
	function initPropertites(target,members){
		var properties;
		var keys=Object.keys(members);
		for(var i=0,len=keys.length;i<len;i++){
			var key=keys[i];
			var enumerable=key.charCodeAt(0)!==95/*_*/;
			var member=members[key];
			if(member && typeof member==='object'){
				if(member.value!=undefined || typeof member.get==='function' || typeof member.set==='function'){
					if(member.enumerable===undefined){
						member.enumerable=enumerable;
					}
					properties=properties||{};
					properties[key]=member;
					continue;
				}
			}
			if(!enumerable){
				properties=properties||{};
				properties[key]={value:member,enumerable:enumerable,configurable:true,writable:true};
				continue;
			}
			target[key]=member;
		}
		if(properties){
			Object.defineProperties(target,properties);
		}
	}
	
	/**		define namespace	**/
	(function(rootNameSpace){
		var _rootNameSpace;
		if(!global[rootNameSpace]){
			_rootNameSpace=global[rootNameSpace]=Object.create(Object.prototype);
		}
		if(!_rootNameSpace.Namespace){
			_rootNameSpace.Namespace=Object.create(Object.prototype);
		}
		
		function defineWithParent(parentNameSpace,name,members){
			var currentNameSpace=parentNameSpace,
				nameSplit=name.split(".");
			
			for(var i=0,len=nameSplit.length;i<len;i++){
				var currentName=nameSplit[i];
				if(!currentNameSpace[currentName]){
					Object.defineProperty(currentNameSpace,currentName,
						{value:{},enumerable:true,configurable:true,writable:false}
					);
				}
				currentNameSpace=currentNameSpace[currentName];
			}
			
			if(members){
				initPropertites(currentNameSpace,members);
			}
			
			return currentNameSpace;
		}
		
		function define(name,members){
			return defineWithParent(global,name,members);
		}
		
		Object.defineProperties(_rootNameSpace.Namespace,{
			defineWithParent:{value:defineWithParent,writable:true,enumerable:true,configurable:true },
			define:{value:define,writable:true,enumerable:true,configurable:true }
		});
		
	})(rootNameSpace);
	
	
	/**		define class	**/
	(function(EJS){
		
		function buildClass(constructor,instanceMembers,staticMembers){
			constructor=constructor || function(){};
			if(instanceMembers){
				initPropertites(constructor.prototype,instanceMembers);
			}
			if(staticMembers){
				initPropertites(constructor,staticMembers);
			}
			return constructor;
		}
		
		function define(constructor,instanceMembers,staticMembers){
			return buildClass(constructor,instanceMembers,staticMembers)
		}
		
		function defineUnderNamespace(namespace,className,constructor,instanceMembers,staticMembers){
			if(namespace==null){
				return define(constructor,instanceMembers,staticMembers);
			}
			var currentNamespace;
			if(typeof namespace === 'string'){
				//currentNamespace=EJS.Namespace.define(namespace);
			}else if(typeof namespace === 'object'){
				throw "namespace must a string";
			}
			var classId=namespace+"."+className;
			var classMoudle={
				namespace:namespace,
				className:className,
				constructor:constructor,
				instanceMembers:instanceMembers,
				staticMembers:staticMembers
			};
			if(classSet[classId]){
				throw "class already exist";
			}
			classSet[classId]=classMoudle;
		}
		
		function inheritParent(parentClass,constructor){
			constructor=constructor || function(){};
			var basePrototype=parentClass.prototype;
			constructor.prototype=Object.create(basePrototype);
			Object.defineProperty(constructor.prototype,"constructor",{value:constructor,writable:true,configurable:true,enumerable:true});
			return constructor;
		}
		
		function deriveUnderNamespace(namespace,className,parentClass,constructor,instanceMembers,staticMembers){
			if(parentClass!=null && typeof parentClass === 'string'){
				parentClass=require(parentClass);
			}
			if(parentClass){
				inheritParent(parentClass,constructor);
			}
			return defineUnderNamespace(namespace,className,constructor,instanceMembers,staticMembers);
		}
		
		function derive(parentClass,constructor,instanceMembers,staticMembers){
			if(parentClass){
				inheritParent(parentClass,constructor);
				return buildClass(constructor,instanceMembers,staticMembers);
			}else{
				return define(constructor,instanceMembers,staticMembers);
			}
		}
		
		function mix(constructor){
			constructor=constructor || function(){};
			for(var i=1,len=arguments.length;i<len;i++){
				initPropertites(constructor,arguments[i]);
			}
			return constructor;
		}
		
		EJS.Namespace.define(rootNameSpace+".Class",{
			define:define,
			defineUnderNamespace:defineUnderNamespace,
			derive:derive,
			deriveUnderNamespace:deriveUnderNamespace,
			mix:mix
		});
		
		
	})(EJS);
	
	global.require=require;
	
})(this);