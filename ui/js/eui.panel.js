/*
* @create by wei.wang
* @2013.9
*/
(function PanelInit(EJS){
	"use strict"
	
	var UI=EJS.UI;
	var UIUtil=EJS.Util;
	var UIResource=EJS.Resource;
	
	//css position class names
	var euPanel="ui-panel";
	var euTitle="paneltitle";
	var euTitleName="titlename";
	var euTitleButton="titlebutton";
	var euBody="panelbody";
	//css theme class names
	var euPThe="p-the";
	var euPTThe="pt-the";
	var euTBThe="tb-the";
	var euTNThe="tn-the";
	
	EJS.Class.defineUnderNamespace("EJS.UI","Panel",
		function(hostElement,options){
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._titleElement=null;
			this._titleNameElement=null;
			this._panelBodyElement=null;
			this._btnsEle=null;
			
			this._options={
				title:"Panel Title",
			};

			UI.setOptions(this._options,options);
			
			this.init();
		},{
			_setElement:function(){

				this._domElement=createRootDom();
				/*titleDom*/
				var titleElements=createTitleDom();
				this._titleElement=titleElements.titleElement;
				this._titleNameElement=titleElements.titleNameElement;
				this._domElement.appendChild(this._titleElement);
				
				this.title=this._options.title;

				/*PanelBody*/
				this._panelBodyElement=createPanelBody();
				this._domElement.appendChild(this._panelBodyElement);		
			},
			
			_addEvents:function(){
				
			},
			
			setButton:function(options){
				if(this._btnsEle)
				    this._titleElement.removeChild(this._btnsEle);
				this._btnsEle==null;
				this._btnsEle=UIUtil.createDom("div");
				if(UIUtil.isArray(options)){
					for(var i=0,len=options.length;i<len;i++){
						var option=options[i];
						var event=option.event;
						var buttonEle=createTitleButtonDom(option.position,option.name,option.event);
						this._btnsEle.appendChild(buttonEle);
					}
					this._titleElement.appendChild(this._btnsEle);
				}
			},
			
			addToBody:function(dom){
				if(!dom) return;
				if(dom instanceof Object){
					this._panelBodyElement.appendChild(dom);
					return;
				}
				if(typeof(dom)==="string"){
					this._panelBodyElement.innerHTML=dom;
					return;
				}
			},
			
			element:{
				get:function(){
					return this._domElement;
				}
			},
			
			title:{
				get:function(){
					return this._title;
				},
				set:function(value){
					this._title=value;
					this._titleNameElement.innerHTML=this._title;
				}
			},

			init:function(){
				this._setElement();
				if(this._options.buttons){
					this.setButton(this._options.buttons);
				}
				this._domElement.UIControl=this;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
			}
		},{
			
		}
	);
	
	var createRootDom=function(){
		var domElement=UIUtil.createDom("div",euPanel);
		UIUtil.addClass(domElement,euPThe);//add theme class
		return domElement;
	}

	var createTitleDom=function(){
		var titleElement=UIUtil.createDom("div",euTitle);
		UIUtil.addClass(titleElement,euPTThe);//add theme class
		var titleNameElement=UIUtil.createDom("div",euTitleName);
		UIUtil.addClass(titleNameElement,euTNThe);//add theme class
		titleElement.appendChild(titleNameElement);
		return {titleElement:titleElement,titleNameElement:titleNameElement};
	}
	
	var createTitleButtonDom=function(LorR/*right or left*/,name,event){
		var titleButtonElement=UIUtil.createDom("div",euTitleButton+" "+LorR);
		UIUtil.addClass(titleButtonElement,euTBThe);//add theme class
		titleButtonElement.innerHTML=name;
		if(event instanceof Function){
			titleButtonElement.addEventListener("click",function(){
				event();
			},false);
		}
		return titleButtonElement;
	}
	var createPanelBody=function(){
		var panelBodyElement=UIUtil.createDom("div",euBody);
		return panelBodyElement;
	}
	
})(EJS);