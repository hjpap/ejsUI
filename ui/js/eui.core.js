(function uiBaseInit(EJS){
	"use strict"
	
	EJS.Namespace.define("EJS.UI",{
		setOptions:function(control,options){
			if(typeof options === 'object'){
				var keys=Object.keys(options);
				for(var i=0,len=keys.length;i<len;i++){
					var key=keys[i];
					var value=options[key];
					
					control[key]=value;
				}
			}
		}
	});

	
//////////////////////////////////////////
///////    EJS  TemplateManager    ///////
//////////////////////////////////////////
	EJS.Namespace.define("EJS.UI",{
		TemplateManager : EJS.Class.define(
			function(){
				this.templateTable={};
				this.eventTable={};
			},{
				templateTable:null,
				eventTable:null,
				
				getTemplateDomById:function (elementId){
					return this.templateTable[elementId];
				},
				
				initOneTemplateByDom:function(dom,elementId){
					if(dom==null)
						return;
					var template=dom;
					var elementId=template.id||elementId;
					if(elementId==null){
						throw new UI.Exception(1,"template id is not allow null");
					}else{
						//data
						this.templateTable[elementId] = this.templateTable[elementId] || {};
						this.templateTable[elementId]["element"]=template;
						this.templateTable[elementId]["bindElements"] = {};
						this.templateTable[elementId]["bindElements"].items=[];
						//event
						this.eventTable[elementId]=this.eventTable[elementId] || {};
						this.eventTable[elementId]["bindElements"]={};
						this.eventTable[elementId]["bindElements"].items=[];
						
						this.parseTemplate(template,this.templateTable[elementId]["bindElements"],this.eventTable[elementId]["bindElements"]);
					}
					return {id:elementId,pareElement:this.templateTable[elementId]};
				},
				
				initOneTemplateByHtmlString:function(htmlStr,elementId){
					if(htmlStr==null)
						return;
					var tempDom=document.createElement("div");
					tempDom.innerHTML=htmlStr;
					var templateDom=tempDom.firstElementChild;
					return this.initOneTemplateByDom(templateDom,elementId);
				},
				
				initOneTemplateById:function(elementId){
					if(elementId==null)
						return;
					var templateDom=document.getElementById(elementId);
					return this.initOneTemplateByDom(templateDom);
				},
				
				parseTemplate:function (dom,bindList,eventList){
					if(dom==null) return;
					//data bind
					var dataBindAttr = EJS.Util.getElementAttrValue(dom,"data-bind");
					this.parseBindValue(dom,dataBindAttr,bindList.items);
					//event bind
					var eventBindAttr=EJS.Util.getElementAttrValue(dom,"event-bind");
					this.parseBindEvent(dom,eventBindAttr,eventList.items);
					
					var children=dom.childNodes;
					for(var i=0;i<children.length;i++){
						var child=children[i];
						this.parseTemplate(child,bindList,eventList);
					}
				},
				
				parseBindEvent:function(element,bindValue,bindItems){
					if(bindValue==null) return;
					var itemList=bindValue.split(";");
					var count=itemList.length;
					for(var i=0;i<count;i++){
						var oneItem=itemList[i];
						var item=oneItem.split(":");
						if(item.length>1){
							var bindKey=item[0].replace(" ","");
							var bindValue=item[1].replace(" ","");
							
							var eventItem={
								bindKey:bindKey,
								bindValue:bindValue,
								bindElement:element,
							};
							
							bindItems.push(eventItem);
						}
					}
				},
				
				parseBindValue:function(element,bindValue,bindItems){
					if(bindValue==null)	return;
					var itemList = bindValue.split(";");
					var count=itemList.length;
					for(var i=0;i<count;i++){
						var oneItem=itemList[i];
						var item=oneItem.split(":");
						if(item.length>1){
							var bindKey=item[0].replace(" ","");
							var bindValue=item[1].replace(" ","");
							var bKeys=bindKey.split(".");
							var bindElementKey=element;
							var keysCount=bKeys.length-1;
							var lastBindkey=bKeys[keysCount];
							for(var j=0;j<keysCount;j++){
								bindElementKey=bindElementKey[bKeys[j]];
							}
							var bindItem={
								bindKey:bindKey,
								bindValue:bindValue,
								bindElement:element,
								bindElementKey:bindElementKey,
								lastBindKey:lastBindkey
							};
							bindItems.push(bindItem);
						}
					}
				},
				
				render:function(templateElement,bindElements,data,newDomId){
					if(bindElements!=null && bindElements.items!=null && data!=null){
						var bindItems=bindElements.items;
						var bindItemCount=bindItems.length;
						for(var i=0;i<bindItemCount;i++){
							var oneBindItem=bindItems[i];
							oneBindItem.bindElementKey[oneBindItem.lastBindKey]=data[oneBindItem.bindValue];
						}
					}
					var newElement = templateElement.cloneNode(true);
					if(newDomId!=null){
						newElement.id=newDomId;
					}else{
						newElement.id="";
					}
					return newElement;
				},
				
				renderByTpId:function(templateId,data,newDomId){
					var templateObject=this.getTemplateDomById(templateId);
					if(templateObject==null || templateObject["element"]==null)
						return;
					var templateElement=templateObject["element"];
					var bindElements=templateObject["bindElements"];
					return this.render(templateElement,bindElements,data,newDomId);
				},
				
				getTemplateEvents:function(templateId){
					if(templateId==null || this.eventTable[templateId]==null) return;
					var events = this.eventTable[templateId]["bindElements"];
					var count=events.items.length;
					var groupEvents={};
					for(var i=0;i<count;i++){
						var item=events.items[i];
						var eventName=item.bindValue;
						switch(eventName){
							case "mousedown":
							case "touchstart":
							case "starte":
								groupEvents["startE"] = groupEvents["startE"] || [];
								groupEvents["startE"].push(item);
							break;
							case "mouseup":
							case "touchend":
							case "ende":
								groupEvents["endE"] = groupEvents["endE"] || [];
								groupEvents["endE"].push(item);
							break;
							case "mousemove":
							case "touchmove":
							case "movee":
								groupEvents["moveE"] = groupEvents["moveE"] || [];
								groupEvents["moveE"].push(item);
							break;
							case "click":
								groupEvents["click"] = groupEvents["click"] || [];
								groupEvents["click"].push(item);
							break;
							default:
								groupEvents["other"] = groupEvents["other"] || [];
								groupEvents["other"].push(item);
							break;
						}
					}
					return groupEvents;
				}
			}
		)
	});
})(EJS);



///////////////////////////////////
/////////	EJS	 Util	///////////
///////////////////////////////////
(function utilInit(EJS){
	"use strict"
	
	function setElementAttr(element,attrName,attrValue){
		if(element!=null && element.attributes!=null){
			var attr=document.createAttribute(attrName);
			attr.value=attrValue;
			element.attributes.setNamedItem(attr);
		}
		return element;
	}
	
	function getElementAttr(element,attrName){
		if(element!=null && element.attributes!=null){
			return element.attributes[attrName];
		}
		return null;
	}
	
	function getElementAttrValue(element,attrName){
		var value;
		if(element!=null){
			if(typeof element.getAttribute ==="function"){
				value=element.getAttribute(attrName);
			}else{
				var attr=getElementAttr(element,attrName);
				value=attr==null?null:attr.value;
			}
		}
		return value;
	}
	
	function setElementAttrValue(element,attrName,attrValue){
		if(element!=null){
			if(typeof element.setAttribute==="function"){
				element.setAttribute(attrName,attrValue);
			}else{
				setElementAttr(element,attrName,attrValue);
			}
		}
		return element;
	}
	
	function setClassName(e, value) {
        var name = e.className || "";
        if (typeof (name) == "string") {
            e.className = value;
        }
        return e;
    };
	
	function getClassName(e) {
        var name = e.className || "";
        if (typeof (name) == "string") {
            return name;
        }
        return "";
    };
	
	function getClassNameArray(element){
		var className = getClassName(element);
		var names = className.split(" ");
		var l = removeEmpties(names);
		if(l>0)
			return names;
		return null;
	};
	
	function ifContainClassName(element,className){
		if(element==null || className==null || className=="")
			return false;
		var className = getClassName(element);
		var names = className.split(" ");
		var len = names.length;
        for (var i = len - 1; i >= 0; i--) {
            if (!names[i] && className.indexOf(names[i])!=-1) {
                return true;
            }
        }
		return false;
	};
	
    function removeEmpties(arr) {
        var len = arr.length;
        for (var i = len - 1; i >= 0; i--) {
            if (!arr[i]) {
                arr.splice(i, 1);
                len--;
            }
        }
        return len;
    }
	
	function addClass(element,name){
		if(!element)
			return;
		var className = getClassName(element);
		var names = className.split(" ");
		var l = removeEmpties(names);
		var toAdd;
		if (name.indexOf(" ") >= 0) {
			var namesToAdd = name.split(" ");
			removeEmpties(namesToAdd);
			for (var i = 0; i < l; i++) {
				var found = namesToAdd.indexOf(names[i]);
				if (found >= 0) {
					namesToAdd.splice(found, 1);
				}
			}
			if (namesToAdd.length > 0) {
				toAdd = namesToAdd.join(" ");
			}
		}
		else {
			var saw = false;
			for (var i = 0; i < l; i++) {
				if (names[i] === name) {
					saw = true;
					break;
				}
			}
			if (!saw) { toAdd = name; }
		}
		if (toAdd) {
			if (l > 0 && names[0].length > 0) {
				setClassName(element, className + " " + toAdd);
			}
			else {
				setClassName(element, toAdd);
			}
		}
		return element;
	}
	
	function removeClass(element,name){
		if(!element)
			return;
		var original = getClassName(element);
		var namesToRemove;
		var namesToRemoveLen;

		if (name.indexOf(" ") >= 0) { 
			namesToRemove = name.split(" ");
			namesToRemoveLen = removeEmpties(namesToRemove);
		}
		else {
			if (original.indexOf(name) < 0) {
				return element;
			}
			namesToRemove = [name];
			namesToRemoveLen = 1;
		}
		var removed;
		var names = original.split(" ");
		var namesLen = removeEmpties(names);

		for (var i = namesLen - 1; i >= 0; i--) {
			if (namesToRemove.indexOf(names[i]) >= 0) {
				names.splice(i, 1);
				removed = true;
			}
		}

		if (removed) {
			setClassName(element, names.join(" "));
		}
		return element;
	}
	
	function getCssHeight(element){
		if(element==null || element.style==null)
			return null;
		return parseIntValueWithPx(element.style.height);
	}
	
	function parseIntValueWithPx(value){
		var intValue;
		if(value!=null){
			value=value.replace("px","");
			if(value!="" && isNaN(value) == false){
				intValue=parseInt(value);
			}
		}
		return intValue;
	}
	
	function getCssWidth(element){
		if(element==null || element.style==null)
			return null;
		return parseIntValueWithPx(element.style.width);
	}
	
	function createDom(tagName,className,attributes){
		var element=document.createElement(tagName);
		if(className!=null) element.className=className;
		for(var attr in attributes){
			setElementAttrValue(element,attr,attributes[attr]);
		}
		return element;
	};
	
	function appendChild(parentDom){
		if(!parentDom || !parentDom.appendChild)
			return;
		if(arguments.length<2)
			return parentDom;
		
		for(var i=1,len=arguments.length;i<len;i++){
			parentDom.appendChild(arguments[i]);
		}
		return parentDom;
	}
	
	function isArray(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	}
	/***************JS************/
	function addJsRef(document,src){
		var head = document.getElementsByTagName('head').item(0);
		s = document.createElement("script"); 
		s.type = "text/javascript"; 
		s.src = src; 
		head.appendChild(s); 
	}
	/***************************/
	
	function clone(obj){
		if(!obj) { 
			return obj;
		}

		if(obj instanceof Array){
			var retVal = new Array();
			for(var i = 0; i < obj.length; ++i){
				retVal.push(clone(obj[i]));
			}
			return retVal;
		}

		if (obj instanceof Function) {
			return obj;
		}

		if(!(obj instanceof Object)){
			return obj;
		}
		
		if (obj instanceof Date) {
			return obj;
		}

		var retVal = new Object();
		for(i in obj){
			if(!(i in retVal) || retVal[i] != obj[i]) {
				retVal[i] = clone(obj[i]);
			}
		}
		return retVal;
	}
	

	
	EJS.Namespace.define("EJS.Util",{
		addClass:addClass,
		removeClass:removeClass,
		ifContainClassName:ifContainClassName,
		setElementAttrValue:setElementAttrValue,
		getElementAttrValue:getElementAttrValue,
		createDom:createDom,
		appendChild:appendChild,
		addJsRef:addJsRef,
		isArray:isArray,
		
		clone:clone,
	});
	
	
})(EJS);



///////////////////////////////////
/////////	Event	 Resource	///////
///////////////////////////////////
(function eventInit(EJS){
	
	var hasMouseEvent="onmouseup" in window ? true : false;
	var hasTouchEvent=("ontouchend" in window) && window.navigator.platform!="Win32" ? true : false;
	
	////event
	var RESIZE_EVENT='onorientationchange' in window ?'orientationchange':'resize';
	var START_EVENT= hasTouchEvent?'touchstart':"mousedown";
	var MOVE_EVENT=hasTouchEvent?'touchmove':'mousemove';
	var END_EVENT=hasTouchEvent?'touchend':'mouseup';
	var CANCEL_EVENT=hasTouchEvent?'touchcancel':'mouseup';
    var CLICK_EVENT=hasTouchEvent?'click':'click';
	
	var mtEventMap={
		"mouseup":"touchend",
		"mousedown":"touchstart",
		"mousemove":"touchmove"
	};
	
	var realAddEventListener=Node.prototype.addEventListener;
	var realRemoveEventListener=Node.prototype.removeEventListener;
	
	function simulateMouseEvent(event,eventName){

        if(event.touches.length>1){
            return;
        }
        event.preventDefault();
        var touch=event.changedTouches[0] || event.touches[0];
        var simulateEvent=document.createEvent("MouseEvents");
        
        simulateEvent.initMouseEvent(
            eventName,
            true,
            true,
            window,
            1,
            touch.screenX,
            touch.screenY,
            touch.clientX,
            touch.clientY,
            false,
            false,
            false,
            false,
            0,
            null
        );
        
        event.target.dispatchEvent(simulateEvent);
    }
	
	function eventCompatibility(){
	
		HTMLElement.prototype.addEventListener=function(type,handler,capture){
			switch(type){
				case "mouseup":
					realAddEventListener.apply(this,["mouseup",handler,!!capture]);
					realAddEventListener.apply(this,[mtEventMap[type],touchStartHandler,!!capture]);
				break;
				
				case "mousedown":
					realAddEventListener.apply(this,["mousedown",handler,!!capture]);
					realAddEventListener.apply(this,[mtEventMap[type],touchEndHandler,!!capture]);
				break;
				
				case "mousemove":
					realAddEventListener.apply(this,["mousemove",handler,!!capture]);
					realAddEventListener.apply(this,[mtEventMap[type],touchMoveHandler,!!capture]);
				break;
				
				default:
					realAddEventListener.apply(this,[type,handler,!!capture]);
				break;
			}
		};
		
		HTMLElement.prototype.removeEventListener=function(type,handler,capture){
			switch(type){
				case "mouseup":
					realRemoveEventListener.apply(this,["mouseup",handler,!!capture]);
					realRemoveEventListener.apply(this,[mtEventMap[type],touchStartHandler,!!capture]);
				break;
				
				case "mousedown":
					realRemoveEventListener.apply(this,["mousedown",handler,!!capture]);
					realRemoveEventListener.apply(this,[mtEventMap[type],touchEndHandler,!!capture]);
				break;
				
				case "mousemove":
					realRemoveEventListener.apply(this,["mousemove",handler,!!capture]);
					realRemoveEventListener.apply(this,[mtEventMap[type],touchMoveHandler,!!capture]);
				break;
				
				default:
					realRemoveEventListener.apply(this,[type,handler,!!capture]);
				break;
			}
		};
	
	}
	
	function touchStartHandler(e){
		simulateMouseEvent(e,"mousedown");
	}
	
	function touchEndHandler(e){
		simulateMouseEvent(e,"mouseup");
	}
	
	function touchMoveHandler(e){
		simulateMouseEvent(e,"mousemove");
	}
	
	if(hasTouchEvent==true){
		eventCompatibility();
	}
	
	/*****************************************/
	
	(function eventManagerInit(EJS){
	
		var eventManager=EJS.Class.define(
			function(){
			
				this._events={}
				this._instanceId=0;
				this._globalId=EJS.EventManager.globalId++;
			},{
				_instanceId:null,
				
				_events:null,
				
				clickMoveSpace:5,
				
				Resize_Event:RESIZE_EVENT,
				
				Start_Event:START_EVENT,
				
				Move_Event:MOVE_EVENT,
				
				End_Event:END_EVENT,
				
				Cancel_Event:CANCEL_EVENT,
				
				Click_Event:CLICK_EVENT,
				
				addEvent:function(element,type,func,capture){
					if(element==null || type==null || func==null ) return;
					var eventId;
					if(element!=null && type!=null){
						switch(type){
							case CLICK_EVENT:
								eventId=this.onClickEvent(element,type,func,!!capture);
							break;
							
							default:
								eventId=this._registerEvent(element,type,func,!!capture);
							break;
						}
					}
					return eventId;
				},
				
				onClickEvent:function(element,type,func,capture){
					if(hasTouchEvent){
						
						var startX,startY;
						var that=this;

						var endFunc=function(e){
							var point=e.touches[0] || e.changedTouches[0];
							if( Math.abs(point.pageX-startX)<that.clickMoveSpace && Math.abs(point.pageY-startY)<that.clickMoveSpace){
								func.call(element,e);
							}
							element.removeEventListener(END_EVENT,endFunc,!!capture);
						};
						
						var startFunc=function(e){
							var point=e.touches[0] || e.changedTouches[0];
							startX=point.pageX;
							startY=point.pageY;
							
							element.addEventListener(END_EVENT,endFunc,!!capture);
						};
						element.addEventListener(START_EVENT,startFunc,!!capture);
						
						var eventInfo={
							type:type,
							element:element,
							func:func,
							capture:capture,
							childEvent:[
								{
									element:element,
									type:START_EVENT,
									func:startFunc,
									capture:capture
								},{
									element:element,
									type:END_EVENT,
									func:endFunc,
									capture:capture
								}
							]
						};
						var eventId="evt_"+this._globalId+"_"+this._instanceId++;
						this._events[eventId]=eventInfo;
						return eventId;
					}else{
						return this._registerEvent(element,type,func,capture);
					}
				},
				
				removeEvent:function(eventId){
					var eventInfo=this._events[eventId];
					if(eventInfo.type==CLICK_EVENT && hasTouchEvent){
						for(var i=0,len=eventInfo.childEvent.length;i<len;i++){
							this._removeEventByInfo(eventInfo.childEvent[i]);
						}
					}else{
						this._removeEventByInfo(eventInfo);
					}
				},
				
				removeEventByElement:function(element,func){
					//warning:performance problem
					for(var eventId in this._events){
						var eventInfo=this._events[eventId];
						if(eventInfo.element==element && eventInfo.func==func){
							this._removeEventByInfo(eventInfo);
							break;
						}
					}
				},
				
				dispose:function(){
					for(var eventId in this._events){
						this.removeEvent(eventId);
					}
					this._events=null;
				},
				
				_registerEvent:function(element,type,func,capture){
					element.addEventListener(type,func,!!capture);
					return this._addEventInfo(element,type,func,capture);
				},
				
				_addEventInfo:function(element,type,func,capture){
					var eventId="evt_"+this._globalId+"_"+this._instanceId++;
					var eventInfo={
						type:type,
						element:element,
						func:func,
						capture:capture
					};
					this._events[eventId]=eventInfo;
					return eventId;
				},
				
				_removeEventByInfo:function(eventInfo){
					if(eventInfo==null || eventInfo.element==null) return;
					eventInfo.element.removeEventListener(eventInfo.type,eventInfo.func,!!eventInfo.capture);
				}
				
			},{
			
				globalId:0,
				
				hasTouch:hasTouchEvent,
				///////////////////////////
				Resize_Event:RESIZE_EVENT,
				
				Start_Event:START_EVENT,
				
				Move_Event:MOVE_EVENT,
				
				End_Event:END_EVENT,
				
				Cancel_Event:CANCEL_EVENT,
				
				Click_Event:CLICK_EVENT
			}
		);
	
		EJS.EventManager=eventManager;
	})(EJS);

})(EJS);

///////////////////////////////////
/////////	EJS	 pAGE	///////
///////////////////////////////////
(function pageInit(){
	"use strict"
	
	EJS.Namespace.define("EJS.UI.Page",{

	});
	
})();


///////////////////////////////////
/////////	EJS	 Resource	///////
///////////////////////////////////
(function resourceInit(){
	"use strict"
	
	EJS.Namespace.define("EJS.Resource",{
		_getUIString:function(key){
			return "";
		}
	});
	
})();