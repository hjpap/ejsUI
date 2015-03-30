/*
* @create by wei.wang
* @2013.10
*/
(function MenuBarInit(EJS){
	"use strict"
	
	var UI=EJS.UI;
	var UIUtil=EJS.Util;
	var UIResource=EJS.Resource;
	
	var btnId=0;
	var MenuButton=null;
	
	//css common class names
	var euBar="ui-menubar";
	var euBody="mbody";
	
	var euBtn="menubutton";
	var euTitle="buttontitle";
	
	var euSelected="selected";
	//css theme class names
	var classNames={
		defaultCss:"ui-black-menubar",
	}
	
	EJS.Class.defineUnderNamespace("EJS.UI","MenuBar",
		function(hostElement,options){
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._barBody=null;
			
			this._theme=null;
			
			//buttons
			this.buttons=[];
			
			this.options={};
			UI.setOptions(this.options,options);
			this.init();
		},{	

			_setElement:function(){
				var el=createMenuBar();
				this._domElement=el.bar;
				this._barBody=el.barBody;
				this._domElement.appendChild(this._barBody);
				
				this.theme=this.options.theme || "defaultCss";
			},
			
			element:{
				get:function(){
					return this._domElement;
				}
			},
			theme:{
				get:function(){
					return this._theme;
				},
				set:function(value){
					if(this._theme)UIUtil.removeClass(this._domElement,this._theme);
					this._theme=value;
					var themeCss=classNames[this._theme] || this._theme || classNames["defaultCss"];
					UIUtil.addClass(this._domElement,themeCss);
				}
			},
			onButtonClick:function(){
			//点击自己恢复不选中状态的button类型
				if(this.selected==false){
					if(this.menuBar.selectedButton!=null){
						this.menuBar.selectedButton.unSelect();
					}
					this.select();
					this.menuBar.selectedButton=this;
				}else{
					this.unSelect();
					this.menuBar.selectedButton=null;
				}
			},
			onOptionBtnClick:function(){
				if(this.menuBar.selectedButton 
					&& this.menuBar.selectedButton.id!=this.id){
					this.menuBar.selectedButton.unSelect();
				}
				this.select();
				this.menuBar.selectedButton=this;
				
			},
			appendMenuButton:function(menuButton){
				if(menuButton.menuBar==null) menuButton.menuBar=this;
				menuButton.barSelected=this.onOptionBtnClick;
				this.buttons.push(menuButton);
				this._barBody.appendChild(menuButton.element);
			},
			appendMenuButtonWithJSON:function(array){
				for(var i in array){	
					var button=new MenuButton(null,array[i]);
					this.appendMenuButton(button);
				}  
			},
			init:function(){
				MenuButton=require("EJS.UI.MenuButton");
				this._setElement();
				this._domElement.UIControl=this;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
			}
		},{}
	);
	
	function createMenuBar(){
		var bar = UIUtil.createDom("div",euBar);
		var barBody = UIUtil.createDom("div",euBody);
		return {bar:bar,barBody:barBody}
	}
	
	
	
	/*****************************
     *	      menu button        *
	 *****************************/
	EJS.Class.defineUnderNamespace("EJS.UI","MenuButton",
		function(hostElement,options){
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._icon=null;
			this._title=null;

			this.id=null;
			this.selected=false;
			this.barSelected=null;
			this.menuBar=null;
			this.unSelectedEvent=options.unSelectedEvent;
			this.selectedEvent=options.selectedEvent;
			
			this.options={};
			UI.setOptions(this.options,options);
			this.init();
			return this;
		},{	

			_setElement:function(){
				var el=createButton();
				this._domElement=el.button;
				this._icon=el.icon;
				this._title=el.title;
				
				this._domElement.id=this.id=this.options.id || "mbtn_"+btnId;
				
				this._icon.src=this.options.icon;
				this._title.innerHTML=this.options.text;
				
				this._domElement.appendChild(this._icon);
				this._domElement.appendChild(this._title);
			},
			_addEvent:function(){
				var that=this;
				this._domElement.addEventListener("click",function(){
					if(that.barSelected!=null) that.barSelected.call(that);
					//if(that.selectedEvent!=null && that.selected==true) that.selectedEvent.call(that);
					//if(that.unSelectedEvent!=null && that.selected==false) that.unSelectedEvent.call(that); 
				},false);
			},
			select:function(){
				this.selected=true;
				UIUtil.addClass(this._domElement,euSelected);
				if(this.options.selectIcon)this._icon.src=this.options.selectIcon;
				if(this.selectedEvent!=null && this.selected==true) this.selectedEvent.call(this);
			},
			unSelect:function(){
				this.selected=false;
				UIUtil.removeClass(this._domElement,euSelected);
				if(this.options.selectIcon)this._icon.src=this.options.icon;
				if(this.unSelectedEvent!=null && this.selected==false) this.unSelectedEvent.call(this); 
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
				btnId++;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
			}
		},{}
	);
	function createButton(){
		var button = UIUtil.createDom("div",euBtn);
		var icon = UIUtil.createDom("img");
		var title = UIUtil.createDom("div",euTitle);
		
		return {button:button,icon:icon,title:title};
	}
	
	
})(EJS);