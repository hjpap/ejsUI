/*
* @create by wei.wang
* @2013.10
*/
(function SliderInit(EJS){
	"use strict"
	
	var UI=EJS.UI;
	var UIUtil=EJS.Util;
	var UIResource=EJS.Resource;
	
	var hasTouch='ontouchstart' in window;
	var evStart=hasTouch?"touchstart":"mousedown";
	var evEnd=hasTouch?"touchend":"mouseup";
	var evMove=hasTouch?"touchmove":"mousemove";
	
	//css position class names
	var euSlider="ui-slider";
	var euRrogress="progress";
	var euBtn="sliderBtn";
	var euTip="tip";
	var euDis="disabled";
	//css theme class names
	var euShadow="shadow";

	
	EJS.Class.defineUnderNamespace("EJS.UI","Slider",
		function(hostElement,options){
				
			options=options || {};
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._progress=null;
			this._sliderBtn=null;
			this._tip=null;
			
			this._value=0;
			this._showTip=true;
			this.init();
		},{
			_hasTouch:hasTouch,
			_setElement:function(){
				var eles=createElement();
				this._domElement=eles.slider;
				this._progress=eles.progress;
				this._sliderBtn=eles.sliderBtn;
				this._tip=eles.tip;
			},
			
			_addEvent:function(){
				var that=this,
				    isDown=false,
					wi=0,
					ol=0,
					x=0;
				this.eStart=function(e){
					document.addEventListener(EJS.EventManager.Move_Event,eMove,false);
					document.addEventListener(EJS.EventManager.End_Event,eEnd,false);
					isDown=true;
					e=that._hasTouch?e.touches[0]:e;
					if(that._showTip)
						that._tip.style.display="block";
					wi=that._domElement.offsetWidth;
					ol=that._domElement.offsetLeft;
					doAni(e);	
				};
				
				var eMove=function(e){
					if(isDown){
						e=that._hasTouch?e.touches[0]:e;
						doAni(e);
					}
				};
				
				var eEnd=function(e){
					isDown=false;
					if(that._showTip)
						that._tip.style.display="none";
					document.removeEventListener(EJS.EventManager.Move_Event,eMove,false);
					document.removeEventListener(EJS.EventManager.End_Event,eEnd,false);
				};
				
				var doAni=function(e){
					x=e.clientX-ol;
					x<=0?x=0:x;
					x>=wi?x=wi:x;
					x=Math.round(x/wi*100);
					that.value=x;
				}
				this._domElement.addEventListener(EJS.EventManager.Start_Event,this.eStart,false);
				//this._domElement.addEventListener(evStart,this.eStart,false);
			},
			value:{
				get:function(){
					return this._value;
				},
				set:function(value){
					this._value=value;
					this._progress.style.width=value+"%";
					this._sliderBtn.style.left=value+"%";
					this._tip.innerHTML=value;
				}
			},
			disabled:function(flag){
				if(flag){
					this._domElement.removeEventListener(evStart,this.eStart,false);
					UIUtil.addClass(this._progress,euDis);
				}else{
					this._domElement.addEventListener(evStart,this.eStart,false);
				}
			},
			element:{
				get:function(){
					return this._domElement;
				}
			},
			
			init:function(){
				this._setElement();
				this._addEvent();
				this._domElement.UIControl=this;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
			}
		},{
			
		}
	);
	
	function createElement(){
		var slider=UIUtil.createDom("div",euSlider);
		var progress=UIUtil.createDom("div",euRrogress);
		var sliderBtn=UIUtil.createDom("div",euBtn);
		var tip=UIUtil.createDom("span",euTip);
		tip.style.display="none";
		
		slider.appendChild(progress);
		slider.appendChild(sliderBtn);
		sliderBtn.appendChild(tip);
		return {slider:slider,progress:progress,sliderBtn:sliderBtn,tip:tip}
	}
	
})(EJS);