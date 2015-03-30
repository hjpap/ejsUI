/*
* @create by wei.wang
* @2013.10
*/
(function ProgressInit(EJS){
	"use strict"
	
	var UI=EJS.UI;
	var UIUtil=EJS.Util;
	var UIResource=EJS.Resource;
	
	//css position class names
	var euDomCss="ui-progress";
	var euProCss="progress";
	//css theme class names
	var euDomBg="ui-pro-bar-bg";
	var euProBg="ui-p-color";


	
	EJS.Class.defineUnderNamespace("EJS.UI","Progress",
		function(hostElement,options){
			
			options=options || {};
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._progress=null;
			
			this._value=options.value || 0;

			this.init();
		},{
			_setElement:function(){
				var eles=createElement();
				this._domElement=eles.domEle;
				this._progress=eles.proEle;
				UIUtil.addClass(this._domElement,euDomBg);	
				UIUtil.addClass(this._progress,euProBg);	
				
				this._progress.style.width=this._value+"%";

			},

			element:{
				get:function(){
					return this._domElement;
				}
			},
			value:{
				get:function(){
					return this._value;
				},
				set:function(value){
					this._value=value;
					this._progress.style.width=this._value+"%";
				}
			},
			init:function(){
				this._setElement();
				this._domElement.UIControl=this;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
			}
		},{
			
		}
	);
	
	function createElement(){
		var domEle=UIUtil.createDom("div",euDomCss);
		var proEle=UIUtil.createDom("div",euProCss);
		domEle.appendChild(proEle);
		return {domEle:domEle,proEle:proEle}
	}
	
})(EJS);