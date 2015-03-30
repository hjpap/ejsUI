/*
* @create by wei.wang
* @2013.9
*/
(function SwitchButtonInit(EJS){
	"use strict"
	
	var UI=EJS.UI;
	var UIUtil=EJS.Util;
	var UIResource=EJS.Resource;
	
	//resourse string
	var strings={
		get on(){return UIResource._getUIString("ui/on").value || "ON";},
		get off(){return UIResource._getUIString("ui/off").value || "OFF";}
	};
	
	var reg=/\-?[0-9]+/g;             // 匹配负号和数字
    var reg2=/\-?[0-9]+\.?[0-9]*/g    // 可能包含小数点的
	
	//css position class names
	var euSwitch="ui-switchButton";
	var euBg="switchBg";
	var euSlider="slider";
	var euFontTheme="fontSpan";
	//css theme class names
	var euOnBgColor="on";
	var euOffBgColor="off";
	var euSwitchBgTheme="switchBgTheme";
	var euSliderTheme="sliderTheme";
	
	EJS.Class.defineUnderNamespace("EJS.UI","SwitchButton",
		function(hostElement,options){
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._switchBgElement=null;
			this._fontSpan=null;
			this._sliderElement=null;
			
			
			//Strings
			this._labelOn=strings.on;
			this._labelOff=strings.off;
			
			//UI.setOptions(options);
			
			this.init();
		},{
			
			_setElement:function(){
				var elements=createElement();
				this._domElement=elements.rootElement;
				this._switchBgElement=elements.switchBackground;
				UIUtil.addClass(this._switchBgElement,euSwitchBgTheme);
				this._sliderElement=elements.slider;
				UIUtil.addClass(this._sliderElement,euSliderTheme);
				this._fontSpan=elements.fontSpan;
				
				UIUtil.appendChild(this._domElement,this._switchBgElement);
				UIUtil.appendChild(this._switchBgElement,this._fontSpan);
				UIUtil.appendChild(this._switchBgElement,this._sliderElement);		
			},
			
			_setAnimation:function(){
				this._sliderElement.style.webkitTransitionProperty = "all";
				this._sliderElement.style.webkitTransitionDuration = this.aniTime || "300ms";
				this._sliderElement.style.webkitTransitionTimingFunction = "ease-out";
				
				this._switchBgElement.style.webkitTransitionProperty = "all";
				this._switchBgElement.style.webkitTransitionDuration = this.aniTime || "300ms";
				this._switchBgElement.style.webkitTransitionTimingFunction = "ease-out";
			},
			
			_cancelAnimation:function(){
				this._sliderElement.style.webkitTransitionProperty = "";
				this._sliderElement.style.webkitTransitionDuration = ""
				this._sliderElement.style.webkitTransitionTimingFunction = "";
			},
			
			_setChecked:function(value){
				var that=this;
				value = !!value;
				if(value !== this._checked){
					this._checked = value;	
					var offset=this._getOffset;
					if(this._checked){ // On state
						UIUtil.removeClass(this._switchBgElement,euOffBgColor);
						UIUtil.addClass(this._switchBgElement,euOnBgColor);
						this.labelOn=this.labelOn;
						that._sliderElement.style.webkitTransform="Matrix(1,0,0,1,"+offset+",0)";
						if(that.doChange instanceof Function) 
							that.doChange();
					}else{ // Off state
						UIUtil.removeClass(this._switchBgElement,euOnBgColor);
						UIUtil.addClass(this._switchBgElement,euOffBgColor);
						this.labelOff=this.labelOff;
						that._sliderElement.style.webkitTransform="Matrix(1,0,0,1,0,0)";
						if(that.doChange instanceof Function) 
							that.doChange();
					}
				}
			},
			
			_addEvents:function(){
				var that = this;
				var switchSlider = function(event){
					stopBubble(event);
					that.checked = that.checked ? false : true;	
				}
				
				var isStartMove = false;
				var disX;
				var mStart = function(event){
					isStartMove=true;
					that._cancelAnimation();
                                   //alert(event.changedTouches[0]);
					disX=event.changedTouches[0].clientX-that._sliderOffset;
                                   
				}
				
				var mMove = function(event){
					//stopBubble(event);
					if(isStartMove){
						moveHandler(event);
					}
				}
				
				var mEnd = function(event){
					stopBubble(event);
					isStartMove=false;
					that._setAnimation();
                    endHandler(event);
				}
				
				var moveHandler = function(event){
					//stopBubble(event);
					var l = event.changedTouches[0].clientX - disX;
					if(l<0) l=0;
					if(l>that._getOffset) l=that._getOffset;
					that._sliderElement.style.webkitTransform="Matrix(1,0,0,1,"+l+",0)";
				}
                
                var endHandler = function(event){
                    if(that._sliderOffset<(that._getOffset/2)){
                        that._setChecked(false);
                        that._sliderElement.style.webkitTransform="Matrix(1,0,0,1,0,0)";
                    }else{
                        that._setChecked(true);
                        that._sliderElement.style.webkitTransform="Matrix(1,0,0,1,"+that._getOffset+",0)";
                    }
                }
				
				that._domElement.addEventListener("touchend",switchSlider,false);
				that._sliderElement.addEventListener("touchstart",mStart,false);
				that._sliderElement.addEventListener("touchmove",mMove,false);
				that._sliderElement.addEventListener("touchend",mEnd,false);
			},
			
			_getOffset:{
				get:function(){
					var that=this;
					var offset=that.hostElement.style.width 
					|| window.getComputedStyle(that.hostElement , null)['width'];
					var i=offset.indexOf("px");
					offset=offset.slice(0,i);
					offset=parseInt(offset)-28;
					return offset;
				}
			},
			
			_sliderOffset:{
				get:function(){
					var matrix=this._sliderElement.style.webkitTransform
					|| window.getComputedStyle(this._sliderElement , null)['webkitTransform'];
					
					var matrixNums=matrix.match(reg2);
					return matrixNums[4];
				}
			},
			
			aniTime:{
				get:function(){
					return this._anitime;
				},
				set:function(value){
					this._anitime=value;
					this._sliderElement.style.webkitTransitionDuration=value;
				}
				
			},
			
			element:{
				get:function(){
					return this._domElement;
				}
			},
			
			doChange:function(){
				//alert(this.checked);
			},
			
			labelOn:{
				get:function(){
					return this._labelOn;
				},
				set:function(value){
					this._labelOn=value;
					this._fontSpan.innerHTML=this._labelOn;
				}
			},
			
			labelOff:{
				get:function(){
					return this._labelOff;
				},
				set:function(value){
					this._labelOff=value;
					this._fontSpan.innerHTML=this._labelOff;
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
				this._setAnimation();
				this._setChecked(false);
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

		var switchBackground=UIUtil.createDom("div",euBg);
		
		var fontSpan=UIUtil.createDom("span",euFontTheme);

		var slider=UIUtil.createDom("div",euSlider);
		
		return {rootElement:rootElement,switchBackground:switchBackground,slider:slider,fontSpan:fontSpan};
	}
	
})(EJS);