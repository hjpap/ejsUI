/*
* @create by wei.wang
* @2013.9
*/
(function SwitchButtonInit(EJS){
	"use strict"
	
	var UI=EJS.UI;
	var UIUtil=EJS.Util;
	var UIResource=EJS.Resource;
	
	var hasTouch='ontouchstart' in window;
	var evStart=hasTouch?"touchstart":"mousedown";
	var evEnd=hasTouch?"touchend":"mouseup";
	var evMove=hasTouch?"touchmove":"mousemove";
	
	//resourse string
	var strings={
		get on(){return UIResource._getUIString("ui/on").value || "ON";},
		get off(){return UIResource._getUIString("ui/off").value || "OFF";}
	};
	
	var reg=/\-?[0-9]+/g;             // 匹配负号和数字
    var reg2=/\-?[0-9]+\.?[0-9]*/g    // 可能包含小数点的
	
	//css position class names
	var euSwitch="ui-slider-switch";
	var euLabel="ui-slider-label";
	var euLa="ui-slider-label-a";
	var euLb="ui-slider-label-b";
	var euSliderOffset="ui-slider-inneroffset";
	var euSliderHandle="ui-slider-handle";
	//css theme class names
	var euSitchBg="ui-switch-bg";
	var euActiveLa="ui-btn-active";
	var euOffLa="ui-btn-down-c";
	var euHandleDefault="ui-btn-up-a-default";
	
	EJS.Class.defineUnderNamespace("EJS.UI","ToggleSwitch",
		function(hostElement,options){
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null,
			this._onLabel=null,
			this._offLabel=null,
			this._sliderOffset=null,
			this._sliderHandle=null,
			
			//Strings
			this._labelOn=strings.on;
			this._labelOff=strings.off;
			
			
			this._checked=false;
			this._sWidth=null;
			//UI.setOptions(options);
			
			this.init();
		},{
			_hasTouch:hasTouch,
			_setElement:function(){
				var elements=createElement();
				this._domElement=elements.rootElement;
				this._onLabel=elements.onLabel;
				this._offLabel=elements.offLabel;
				this._sliderOffset=elements.sliderOffset;
				this._sliderHandle=elements.sliderHandle;
				
				this.labelOn=this._labelOn;
				this.labelOff=this._labelOff;
				
				UIUtil.addClass(this._domElement,euSitchBg);
				UIUtil.addClass(this._onLabel,euActiveLa);
				UIUtil.addClass(this._offLabel,euOffLa);
				
				UIUtil.addClass(this._sliderHandle,euHandleDefault);
			},
			_ani:function(){
				this._onLabel.style.webkitTransitionProperty = "width";
				this._onLabel.style.webkitTransitionDuration =  "70ms";
				this._onLabel.style.webkitTransitionTimingFunction = "linear";
				this._offLabel.style.webkitTransitionProperty = "width";
				this._offLabel.style.webkitTransitionDuration =  "70ms";
				this._offLabel.style.webkitTransitionTimingFunction = "linear";
			},
			_removeAni:function(){
				this._onLabel.style.webkitTransitionProperty = "";
				this._onLabel.style.webkitTransitionDuration =  "";
				this._onLabel.style.webkitTransitionTimingFunction = "";
				this._offLabel.style.webkitTransitionProperty = "";
				this._offLabel.style.webkitTransitionDuration =  "";
				this._offLabel.style.webkitTransitionTimingFunction = "";
			},
			_setChecked:function(value){
				if(value){
					this._checked=true
					this._setEle(true);
					if(typeof this.doChange==="function") 
						this.doChange({checked:true});
				}else{
					this._checked=false
					this._setEle(false);
					if(typeof this.doChange==="function") 
						this.doChange({checked:false});
				}
			},
			_setEle:function(value,event){
				if(typeof value=="number"){
				
					this._sliderHandle.style.left=value+"%";
					
					var v=0;
					var that=this;
				
					if(value<40){
						v=33+value/3;
						this._onLabel.style.width=v+"%";
						this._offLabel.style.width=100-v+"%";
					}else if(value<90){
						this._ani();
						v=34+value*(13/20);
						this._onLabel.style.width=v+"%";
						this._offLabel.style.width=100-v+"%";
					}else{
						this._ani();
						this._onLabel.style.width=value+"%";
						this._offLabel.style.width=100-value+"%";
					}
										
					console.log();
					
					return;
				}
				if(value){
					this._sliderHandle.style.left="100%";
					this._onLabel.style.width="100%";
					this._offLabel.style.width="0";
				}else{
					this._sliderHandle.style.left="0";
					this._onLabel.style.width="0";
					this._offLabel.style.width="100%";
				}
			},
			
			_addEvents:function(){
				var that = this;

				var offsetL=null,      //按钮offsetLeft值 
				moveDis=null,      //鼠标在按钮中的相对位置（x值）
				disPre=null;       //鼠标点击时的位置相对于按钮宽度的百分比
				
				var ifDown=false;
				
				var getDate=function(event){
					var clientX=event.clientX || event.changedTouches[0].clientX;
					moveDis=clientX-offsetL;
					
					if(moveDis>that._sWidth){
						moveDis=that._sWidth;
					}else if(moveDis<0){
						moveDis=0;
					}
					
					disPre=(moveDis/that._sWidth)*100;
					return{offsetL:offsetL,moveDis:moveDis,disPre:disPre,clientX:clientX}
				}
				
				var mStart = function(event){
					document.addEventListener(evEnd,mEnd,false);
					document.addEventListener(evMove,mMove,false);
					ifDown=true;
					
					offsetL=that._domElement.offsetLeft;
					that._sWidth=that._domElement.offsetWidth-2;
					var pData=getDate(event);
					
					//点击事件: 当状态为off时，大于50%的距离，直接为on
					//反之 当状态为on时，小于50%的距离，直接为off
					//不满足sliderHandle将浮于鼠标下
					if(that._checked){
						disPre<50?that._setEle(false):that._setEle(disPre,pData);
					}else{
						disPre>50?that._setEle(true):that._setEle(disPre,pData);
					}

				}
				
				var mMove = function(event){
					//move时，sliderHandle将浮于鼠标下
					getDate(event);
					that._setEle(disPre,event);
				}
				
				var mEnd = function(event){
					//判断距离，大于1/2则转为on
					//小于1/2转为off
					//置按钮状态
					//触发事件
					that._removeAni();
					var state=false;
					
					if(disPre>50){
						that._setEle(true);
						state=true;
					}else{
						that._setEle(false);
						state=false;
					};				
					if(typeof that.doChange === "function" && that._checked!==state) {
						that._checked=state;
						that.doChange({checked:that._checked});
					}
					console.log("up");
					
					document.removeEventListener(evEnd,mEnd,false);
					document.removeEventListener(evMove,mMove,false);
				}
				
				this._domElement.addEventListener(evStart,mStart,false);
				
				
			},
			
			element:{
				get:function(){
					return this._domElement;
				}
			},
			
			doChange:null,
			
			labelOn:{
				get:function(){
					return this._labelOn;
				},
				set:function(value){
					this._labelOn=value;
					this._onLabel.innerHTML=this._labelOn;
				}
			},
			
			labelOff:{
				get:function(){
					return this._labelOff;
				},
				set:function(value){
					this._labelOff=value;
					this._offLabel.innerHTML=this._labelOff;
				}
			},
			
			checked:{
				set:function(value){
				    this._setChecked(value);
				},
				get:function(){
					return this._checked;
				}
			},
			
			init:function(){
				this._setElement();
				this._addEvents();
				this._domElement.UIControl=this;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
			}
		},{
			
		}
	);
	
	function stopBubble(e){
		if (e && e.stopPropagation)
			e.stopPropagation()
		else
			window.event.cancelBubble=true
	}
	
	function createElement(){
		var rootElement=UIUtil.createDom("div",euSwitch);

		var onLabel=UIUtil.createDom("span",euLabel+" "+euLa);
		//onLabel.style.width="0%";
		
		var offLabel=UIUtil.createDom("span",euLabel+" "+euLb);
		//offLabel.style.width="100%";
		
		var sliderOffset=UIUtil.createDom("div",euSliderOffset);

		var sliderHandle=UIUtil.createDom("div",euSliderHandle);
		
		rootElement.appendChild(onLabel);
		rootElement.appendChild(offLabel);
		rootElement.appendChild(sliderOffset);
		
		sliderOffset.appendChild(sliderHandle);
		
		return {rootElement:rootElement,onLabel:onLabel,offLabel:offLabel,sliderOffset:sliderOffset,sliderHandle:sliderHandle};
	}
	
})(EJS);