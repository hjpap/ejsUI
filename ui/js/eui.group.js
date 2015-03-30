/*
* @create by wei.wang
* @2013.9
*/
(function GroupInit(EJS){
	"use strict"
	
	var UI=EJS.UI;
	var UIUtil=EJS.Util;
	var UIResource=EJS.Resource;
	
	//css position class names
	var euGrops="ui-groups";
	var euOneGroup="group";
	var euGoupContent="groupcontent";
	//css theme class names

	var uiGroupId=0;
	var uiPre="goup_";
	
	EJS.Class.defineUnderNamespace("EJS.UI","Group",
		function(hostElement,options){
			
			//Elements
			this.hostElement=hostElement;
			this._domElement=null;
			
			//Set options
			if(!options)
				return;
			this.groupHeaderTemplateId=options.groupHeaderTemplateId || "default-gh-template";
			this.itemTemplateId=options.itemTemplateId || "default-i-template";	
			this.noHeader=options.noHeader || false;
			this.groupClass=options.groupClass || null;
			this.sort=options.sort || null;
			this._dataSource=options.dataSource;
			if(typeof this.sort==="function") 
				this._dataSource.sort(this.sort);
			
			this.setItemTemplateId=options.setItemTemplateId || null;
			this.setHeaderTemplateId=options.setHeaderTemplateId || null;
			
			
			this._events={};
			this.id=uiPre+uiGroupId;
			uiGroupId++;
			
			//init
			this.templateManager=new EJS.UI.TemplateManager();
			this._initDefaultTemplate();
			this.init();
		},{
			_setElement:function(){
				this._domElement=createRootElement();
			},
			
			_initDefaultTemplate:function(){
				var defaultGhTemplate="<div class='grouptitle' data-bind='innerHTML:title'></div>";
				var defaultItemTemplate="<div class='groupitem' event-bind='itemClick:click'><!--img class='itempic' data-bind='src:icon'/--><div class='itemtitle' data-bind='innerHTML:itemtitle'>Starred</div><div class='set'></div></div>";
				this.templateManager.initOneTemplateByHtmlString(defaultGhTemplate,"default-gh-template");
				this.templateManager.initOneTemplateByHtmlString(defaultItemTemplate,"default-i-template");
			},
			
			_getElementByTemplate:function(templateId,dataSource,newId){
			
				if(!this.templateManager.templateTable[templateId]){
					this.templateManager.initOneTemplateById(templateId);
				}
				var templateObj=this.templateManager.getTemplateDomById(templateId);
				if(!templateObj) return;
						
				var templateElement=templateObj["element"];
				var bindElement=templateObj["bindElements"];
				var newElement=this.templateManager.render(templateElement,bindElement,dataSource,newId);
				UIUtil.removeClass(newElement,"ui-template");
				return newElement;
			},
			
			_createGroupDom:function(){
			
				var gDatas=this.dataSource;
				var ghTemplateId=null;
				var giTemplateId=null;
				
				if(gDatas && UIUtil.isArray(gDatas)){
					for(var i=0,len=gDatas.length;i<len;i++){
						var gId=this.id+"_g_"+i;
						var onegroup=createGroup();
						onegroup.id=gId;
						var gropContent=createGroupContent();
						//Create header
						if(!this.noHeader){
							var domId=gId+"_h_"+i
							var groupHeader=gDatas[i]["header"];
							groupHeader["domId"]=domId;
							ghTemplateId = this._setHeaderTemplateId(groupHeader) || this.groupHeaderTemplateId;
							var groupHeaderElement = this._getElementByTemplate(ghTemplateId,groupHeader,domId);
							if(groupHeaderElement)
								onegroup.appendChild(groupHeaderElement);

						}
						onegroup.appendChild(gropContent);
						//Create items
						var groupItems=gDatas[i]["items"];
						for(var j=0,len2=groupItems.length;j<len2;j++){
							var itemDomId=gId+"_i_"+j;
							groupItems[j]["domId"]=itemDomId;
							giTemplateId = this._setItemTemplateId(groupItems[j]) || this.itemTemplateId;
							var groupItemElement = this._getElementByTemplate(giTemplateId,groupItems[j],itemDomId);	
							if(len2===1){
								UIUtil.addClass(groupItemElement,"single");
							}else if(j===0){
								UIUtil.addClass(groupItemElement,"top");
							}else if(j===(len2-1)){
								UIUtil.addClass(groupItemElement,"bottom");
							}
							gropContent.appendChild(groupItemElement);
							//给每个item设置默认的单独的css
							if(groupItems[j].css) UIUtil.addClass(groupItemElement,groupItems[j].css);
						}
						if(giTemplateId=="default-i-template"){
							//给默认模板添加class，防止top，bottom的样式重复
							UIUtil.addClass(onegroup,"defultTemplate");
						}
						
						if(this.groupClass) UIUtil.addClass(onegroup,this.groupClass);
						this._domElement.appendChild(onegroup);
					}
				}
			},
			_setDomElementEvent:function(){
				var that=this;
				this._domElement.addEventListener("click",function(e){
					that._domElementClick(e.target,e.currentTarget);
				},false);
			},
			
			_domElementClick:function(target,currentTarget){
				var nowDom=target;
				var itemEventBreak=false;
				while(nowDom!=null){
					var bindEvent=UIUtil.getElementAttrValue(nowDom,"event-bind");
					if(bindEvent!=null){
						var bindArr = bindEvent.split(":");
						if(bindArr!=null && bindArr.length>1){
							var func=this._events[bindArr[0]];
							if(func!=null){
								var itemData=this.findItemDataByDom(nowDom);
								var eventBreak=func.call(this,{target:nowDom,itemData:itemData});
								if(!eventBreak){
									itemEventBreak=true;
									break;
								}
							}
						}
					}
					nowDom=nowDom.parentNode;
					if(nowDom==currentTarget) break;
				}
			},
			
			_setItemTemplateId:function(giData){
				if(this.setItemTemplateId instanceof Function)
					return this.setItemTemplateId(giData);
				
			},
			
			_setHeaderTemplateId:function(ghData){
				if(this.setHeaderTemplateId instanceof Function)
					return this.setHeaderTemplateId(ghData);
			},
			//Set a unique id for a number of different item elements
			setItemTemplateId:null,
			//Set a unique id for a number of different group header elements
			setHeaderTemplateId:null,
			
			addEvent:function(eventName,event){
				this._events[eventName]=event;
			},
			
			removeEvent:function(eventName,event){
				this._events[eventName]=null;
			},
			
			findItemDataByDom:function(element){
				var id=element.id;
				if(!id || id.indexOf(uiPre)==-1)
					return;
				var idArr=id.split("_");
				if(idArr.length>=6 && idArr[4]==="i"){
					var itemData=this._dataSource[idArr[3]]["items"][idArr[5]];
					return itemData;
				}
			},
			
			reInit:function(){
				this.dataSource=this._dataSource;
			},
				
			dataSource:{
				get:function(){
					return this._dataSource;
				},
				set:function(val){
					this._dataSource=val;
					if(typeof this.sort==="function") 
						this._dataSource.sort(this.sort);
					this.hostElement.innerHTML="";
					this.init();
					this.forceLayout();
				}
			},
			sort:null,
			element:{
				get:function(){
					return this._domElement;
				}
			},
			
			init:function(){
				this._setElement();
				this._createGroupDom();
				this._domElement.UIControl=this;
				this._domElement.id=this.id;
				this._setDomElementEvent();
			},
			
			dispose:function(){
				this.hostElement.innerHTML="";
				
				this.templateManager=null;
				this._domElement=null;
				this.groupHeaderTemplateId=null;
				this.itemTemplateId=null;	
				this.noHeader=null;
				this.groupMargin=null;
				this._dataSource=null;
				this._events=null;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
			}
		},{  
			
		}
	);

	var createRootElement=function(){
		return UIUtil.createDom("div",euGrops);
	}
	var createGroup=function(){
		return UIUtil.createDom("div",euOneGroup);
	}
	var createGroupContent=function(){
		return UIUtil.createDom("div",euGoupContent);
	}
	
})(EJS);