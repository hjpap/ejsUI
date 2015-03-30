/*
* @create by wei.wang
* @2013.9
*/
(function SliderPageInit(EJS){
	"use strict"
	
	var UI=EJS.UI;
	var UIUtil=EJS.Util;
	var UIResource=EJS.Resource;
	
	var hasTouch='ontouchstart' in window;
	var evStart=hasTouch?"touchstart":"mousedown";
	var evEnd=hasTouch?"touchend":"mouseup";
	var evMove=hasTouch?"touchmove":"mousemove";
	
	var vendor="webkit";
	var cssVendor="-"+vendor.toLowerCase()+"-";
	
	var dummyStyle=document.createElement('div').style;
	var has3d = getVendorCssStyle('perspective') in dummyStyle;
	////css style
	var transform=getVendorCssStyle("transform");
	var transformOrigin=getVendorCssStyle("transformOrigin");
	var transitionProperty=getVendorCssStyle("transitionProperty");
	var transitionDuration=getVendorCssStyle("transitionDuration");
	var transitionTimingFunction=getVendorCssStyle("transitionTimingFunction");
	var transitionDelay=getVendorCssStyle("transitionDelay");
	var translateZ = has3d ? ' translateZ(0)' : '';
	
	//css position class names
	var euContainer="ui-slider-container";
	var euLpage="left-page";
	var euRpage="right-page";
	//css theme class names
	var euShadow="shadow";

	
	EJS.Class.defineUnderNamespace("EJS.UI","SliderPage",
		function(hostElement,options){
			
			options=options || {};
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._leftPage=null;
			this._rightPage=null;
			this._lockPage=null;
			
			this._leftCss=options.leftClass?options.leftClass:null;
			this._rightCss=options.rightClass?options.rightClass:null;	
			this._gap=options.gap?options.gap:50;//当显示左页面时，右页面显示宽度；
			this._showLeftPage=options.showLeftPage?options.showLeftPage:false;//默认是否显示左页面
			
			this._dis=null;//最大位移
			this._leftDis=null;
			
			this.isDown=false;
			this.isMove=false;
				
			this.init();
		},{
			_hasTouch:hasTouch,
			_setElement:function(){
				var els=createElement();
				this._domElement=els.container;
				this._leftPage=els.leftPage;
				this._rightPage=els.rightPage;
				
				if(this._leftCss) UIUtil.addClass(this._leftPage,this._leftCss);
				if(this._rightCss) UIUtil.addClass(this._rightPage,this._rightCss);
					
			},
			_leftAni:function(to,ifShow,dis,x){
				var low=0.3;
				var s=0.5;//越小越快
				if(to=="left"){
					opacity(this._leftPage,low);
					translateX(this._leftPage,0-this._dis/3);
					return;
				}else if(to=="right"){
					opacity(this._leftPage,1);
					translateX(this._leftPage,0);
					return;
				}
				var leftDis=x/3;
				if(ifShow){
					if(dis>=this._dis) leftDis=0;
					translateX(this._leftPage,leftDis);
					
				}else{
					leftDis=0-this._dis/3+leftDis;
					if(dis>=this._dis) leftDis=0;
					
					translateX(this._leftPage,leftDis);
				}
				var o=1+leftDis/(this._dis*s);
				if(dis>=this._dis) o=1;
				if(dis<=0) o=low;
				opacity(this._leftPage,o);
			},
			_setAni:function(){
				this._rightPage.style[transitionProperty]="transform";
				this._rightPage.style[transitionDuration]="100ms";
				this._rightPage.style[transitionTimingFunction]="ease-out";
				this._leftPage.style[transitionProperty]="all";
				this._leftPage.style[transitionDuration]="100ms";
				this._leftPage.style[transitionTimingFunction]="ease-out";
			},
			_cancelAni:function(){
				this._rightPage.style[transitionProperty]="";
				this._rightPage.style[transitionDuration]="";
				this._rightPage.style[transitionTimingFunction]="";
				this._leftPage.style[transitionProperty]="";
				this._leftPage.style[transitionDuration]="";
				this._leftPage.style[transitionTimingFunction]="";
			},
			_addEvent:function(){
				
				var that=this;
				
				that.isDown=false;
				that.isMove=false;
				var startX=null;
				var endX=null;
				var dis=null;
				
				var stopBubble=function(e){
					stopBubble(e);
				}
				var eStart=function(e){
					that._domElement.addEventListener(evMove,eMove,false);
					that._domElement.addEventListener(evEnd,eEnd,true);
					
					startX=e.clientX || e.changedTouches[0].clientX;
					that.isDown=true;
				};
				
				var eMove=function(e){
					//console.log("move");
					if(that.isDown){
						that._cancelAni();
						//当showLeftPage=true时 能往右划 不能往左滑 最大滑 that._dis距离
						//当showLeftPage=false时 能往左滑 不能往右 最小滑到0 
						that.isMove=true;
						endX=e.clientX || e.changedTouches[0].clientX;
						var leftDis=dis=endX-startX;
						if(that._showLeftPage){
							dis=that._dis+dis;
						}
						if(dis>that._dis) dis=that._dis;
						if(dis<0) dis=0;
						translateX(that._rightPage,dis);
						that._leftAni(null,that._showLeftPage,dis,leftDis);
						//stop
					}
				};

				var eEnd=function(e){
					//console.log("end");
					that._setAni();
					// >1/2 translate(x);
					// <1/2 translate(0)
					if(that._showLeftPage || that.isMove){
						stopBubble(e);
					};
					if(that.isMove){
						
						if(dis>(that._dis/3)){
							that.showLeftPage=true;
						}else{
							that.showLeftPage=false;
						}
						that.isMove=false;
					}else{
						//点击右侧时，如果当showLeftPage=true时 则showLeftPage=false
						if(that.showLeftPage){
							that.showLeftPage=false;
						}else{
							that._domElement.removeEventListener("click",eClick,true);
						}
					}
					that.isDown=false;
					that._domElement.removeEventListener(evMove,eMove,false);
					that._domElement.removeEventListener(evEnd,eEnd,true);
				};
				
				that._rightPage.addEventListener(evStart,eStart,true);
				
			},
			_onresize:function(){
				var that=this;
				window.onresize=function(){
					that.refresh();
				}	
			},

			toggle:function(){
				this.showLeftPage?this.showLeftPage=false:this.showLeftPage=true;
			},
			refresh:function(){
				var w=this._domElement.offsetWidth;
				var lw=w-this._gap;
				this._dis=lw;
				this._leftPage.style.width=lw+"px";
				this.showLeftPage=this._showLeftPage;
				
			},	
			showLeftPage:{
				get:function(){
					return this._showLeftPage;
				},
				set:function(value){
					this._showLeftPage=value;
					if(this._showLeftPage){
						translateX(this._rightPage,this._dis);
						this._leftAni("right");
					}else{
						translateX(this._rightPage,0);
						this._leftAni("left");
					}
				}
			},
			addToLeftPage:function(dom){
				if(!dom) return;
				if(dom instanceof Object){
					this._leftPage.appendChild(dom);
					return;
				}
				if(typeof(dom)==="string"){
					this._leftPage.innerHTML=dom;
					return;
				}
			},
			addToRightPage:function(dom){
				if(!dom) return;
				if(dom instanceof Object){
					this._rightPage.appendChild(dom);
					return;
				}
				if(typeof(dom)==="string"){
					this._rightPage.innerHTML=dom;
					return;
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
				this._onresize();
				this._domElement.UIControl=this;
			},
			
			forceLayout:function(){
				this.hostElement.appendChild(this._domElement);
				this.refresh();
			}
		},{
			
		}
	);
	function opacity(el,x){
		el.style["opacity"]=x;
		//el.style["background"]="rgba(0,0,0,"+x+")";
	}
	function translateX(el,x){
		el.style[transform]="translateX("+x+"px)";
	}
	
	function getVendorCssStyle(style){
		if(vendor=='' || style==null)
			return style;
		style=style.charAt(0).toUpperCase()+style.substr(1);
		return vendor+style;
	}
	
	function stopBubble(e){
		if (e && e.stopPropagation){
			e.stopPropagation();
			e.preventDefault();
		}else{
			window.event.cancelBubble=true;
			window.event.returnValue = false;
		}
	}
	
	function createElement(){
		var container = UIUtil.createDom("div",euContainer);
		var leftPage = UIUtil.createDom("div",euLpage);
		var rightPage = UIUtil.createDom("div",euRpage);
		
		container.appendChild(leftPage);
		container.appendChild(rightPage);
		
		return {container:container,leftPage:leftPage,rightPage:rightPage}
	}
	
})(EJS);