/*
* @create by wei.wang
* @2013.9
*/
(function ButtonInit(EJS){
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
		get on(){return UIResource._getUIString("ui/on").value;},
		get off(){return UIResource._getUIString("ui/off").value;}
	};
	
	//css position class names
	var euBtn="ui-btn";
	var euBtnInner="ui-btn-inner";
	var euText="ui-btn-text";
	var euIcon="ui-btn-icon";
	//css common theme class names
	var euShadow="ui-btn-shadow";
	var euInline="isinline";
	var euIconLeft="ui-btn-icon-left";
	var euIconRight="ui-btn-icon-right";
	var euHoverCss="ui-btn-active";
	//css theme class names
	var classNames={
		defaultCss:"ui-btn-jqt",
		blackArrowLeft:"ui-btn-arrowt arr-black-t arr-black-t-left",
		blackArrowRight:"ui-btn-arrowt arr-black-t arr-black-t-right",
	}
	
	EJS.Class.defineUnderNamespace("EJS.UI","Button",
		function(hostElement,options){
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._innerElement=null;
			this._textElement=null;
			this._iconElement=null;
			
			this._euHoverCss=euHoverCss;
			this._text=null;
			this._theme=null;
			this._isinline=false;
			this._disabled=false;
			this._icon=false;
			this._iconAlign=null;
			
			this._initOptions(options);
			this.init();
		},{
			_initOptions:function(options){
				this._options=options || {};
				this._text=this._options.text || this._options.text===""? this._options.text : "Button";
				this._theme=this._options.theme || "defaultCss";
				this._className=this._options.className || null;
				this._isinline=this._options.inline || false;
				this._icon=this._options.icon || false;
				this._iconAlign=this._options.iconAlign || "left";
				this.doClick=typeof(this._options.doClick)==="function"?this._options.doClick:this.doClick;
				this.doStart=typeof(this._options.doStart)==="function"?this._options.doStart:this.doStart;
				this.doEnd=typeof(this._options.doEnd)==="function"?this._options.doEnd:this.doEnd;
			},
			
			_createElement:function(){
				this._domElement=UIUtil.createDom("a",euBtn);
				this._innerElement=UIUtil.createDom("span",euBtnInner);
				this._domElement.appendChild(this._innerElement);
				
				this._textElement=UIUtil.createDom("span",euText);
				this._innerElement.appendChild(this._textElement);
			},
			
			_setElement:function(){
				this.text=this._text;
				if(this._icon) this.icon=this._icon;
				if(this._isinline) this.inline=this._isinline;
				this.iconAlign=this._iconAlign;
				this.theme=this._theme;
				if(this._className)
					UIUtil.addClass(this._domElement,this._className);
			},
			
			_eStart:function(e){
				//this.UIControl.setActive=true;
				if(typeof this.UIControl.doStart === "function") this.UIControl.doStart(e);
			},
			
			_eEnd:function(e){
				//this.UIControl.setActive=false;
				if(typeof this.UIControl.doClick === "function") this.UIControl.doClick(e);
				if(typeof this.UIControl.doEnd === "function") this.UIControl.doEnd(e);
			},
			
			_bindEvent:function(){
				this._domElement.addEventListener(evStart,this._eStart,false);
				this._domElement.addEventListener(evEnd,this._eEnd,false);
			},
			
			activeCss:{
				get:function(){
					return this._euHoverCss;
				},
				set:function(css){
					this._euHoverCss=css;
				}
			},
			
			setActive:{
				get:function(){
					return this._state;
				},
				set:function(v){
					this._state=v;
					if(v){
						if(this._euHoverCss) UIUtil.addClass(this._domElement,this._euHoverCss);
					}else{
						if(this._euHoverCss) UIUtil.removeClass(this._domElement,this._euHoverCss);
					}
				}
				
			},
			
			doClick:function(e){
				console.log("click");
				return;
			},
			
			doEnd:function(e){
				console.log("end");
				return;
			},
			
			doStart:function(e){
				console.log("start");
				return;
			},
			
			element:{
				get:function(){
					return this._domElement;
				}
			},
			
			text:{
				get:function(){
					return this._text;
				},
				set:function(text){
					this._text=text;
					this._textElement.innerHTML=text;
				}
			},
			theme:{
				get:function(){
					return this._theme;
				},
				set:function(themeName){
					var reCss=classNames[this._theme] || this._theme;
					var css=classNames[themeName] || themeName;
					UIUtil.removeClass(this._domElement,reCss);
					UIUtil.addClass(this._domElement,css);
					this._theme=themeName;
				}
			},
			
			icon:{
				get:function(){
					return this._icon;
				},
				set:function(className){
					var b=className && className!=="false";
					if(!b){
						this._icon=false;
						if(this._iconElement){
							this._innerElement.removeChild(this._iconElement);
							this._iconElement=null;
							UIUtil.removeClass(this._domElement,euIconLeft);
							UIUtil.removeClass(this._domElement,euIconRight);
						}
						return;
					}
					this._icon=className;
					if(this._iconElement){
						this._iconElement.className=euIcon;
						UIUtil.addClass(this._iconElement,className);
					}else{
						this._iconElement = UIUtil.createDom("span",euIcon);
						UIUtil.addClass(this._iconElement,className);
						this._innerElement.appendChild(this._iconElement);
						this.iconAlign="left";
					}
				}
			},
			
			iconAlign:{
				get:function(){
					return this._iconAlign;
				},
				set:function(pos){
					if(!this._iconElement)
						return;
					if(pos==="left"){
						this._iconAlign="left";
						UIUtil.removeClass(this._domElement,euIconRight);
						UIUtil.addClass(this._domElement,euIconLeft);
					}else{
						this._iconAlign="right";
						UIUtil.removeClass(this._domElement,euIconLeft);
						UIUtil.addClass(this._domElement,euIconRight);
					}
				}
			},
			
			inline:{
				get:function(){
					return this._isinline;
				},
				set:function(value){
					this._isinline=(/^true$/i).test(value);
					if(this._isinline)
						UIUtil.addClass(this._domElement,euInline);
					else
						UIUtil.removeClass(this._domElement,euInline);
				}
			},
			
			disabled:{
				get:function(){
					return this._disabled;
				},
				set:function(value){
					var _disabled=!!value;
					//this._switchEelement.disabled=disabled;
				}
			},
			
			init:function(){
				this._createElement();
				this._setElement();
				this._bindEvent();
				this._domElement.UIControl=this;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
			}
		},{
			
		}
	);
	
	function createElement(){
		var domElement=UIUtil.createDom("a",euBtn);
		var innerElement=UIUtil.createDom("span",euBtnInner);
		
		return 
	}
	function createTextEle(text){
		var textElement=UIUtil.createDom("span",euText);
		textElement.innerHTML=text;
		return textElement;
	}
	function createIconEle(){
		return UIUtil.createDom("span",euIcon);
	}
})(EJS);