(function switchButtonInit(EJS){
	"use strict"
	
	var UI=EJS.UI;
	var UIUtil=EJS.Util;
	var UIResource=EJS.Resource;
	
	//resourse string
	var strings={
		get on(){return UIResource._getUIString("ui/on").value;},
		get off(){return UIResource._getUIString("ui/off").value;}
	};
	
	//css position class names
	var euSwitch="ui-switch";
	var euOn="on";
	var euOff="off";
	var euDisable="disable";
	//css theme class names
	var bgColor="";
	
	EJS.Class.defineUnderNamespace("EJS.UI","SwitchButton",
		function(hostElement,options){
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._switchElement=null;
			this._titleElement=null;
			this._labelGridElement=null;
			this._labelOnElement=null;
			this._labelOffElement=null;
			
			//Strings
			this._labelOn=string.on;
			this._labelOff=string.off;
			
			
			UI.setOptions(options);
			this.init();
		},{
			
			_setElement:function(element){
				//this._domElement=element;
				UIUtil.addClass(this._domElement,euSwitch);
			},
			
			_setChecked:function(value){
				
			},
			
			element:{
				get:function(){
					return this._domElement;
				}
			},
			
			labelOn:{
				get:function(){
					return this._labelOn;
				},
				set:function(value){
					this._labelOn=value;
					this._labelOnElement.innerHTML=value;
				}
			},
			
			labelOff:{
				get:function(){
					return this._labelOff;
				},
				set:function(value){
					this._labelOff=value;
					this._labelOffElement.innerHTML=this._labelOff;
				}
			},
			
			checked:{
				set:function(value){
					this._checked=value;
					this._setChecked(value);
				},
				get:function(){
					return this._checked;
				}
			},
			
			disabled:{
				get:function(){
					return this._switchEelement.disabled;
				},
				set:function(value){
					var disabled=!!value;
					this._switchEelement.disabled=disabled;
				}
			},
			
			init:function(){
				this._domElement=element;
				this._domElement.UIControl=this;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
			}
		},{
			
		}
	);
	
	function createElement(){
		return UIUtil.createDom("div","ui-switchButton");
	}
	
})(EJS);