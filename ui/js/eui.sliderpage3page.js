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
	
	var transitionEnd = {
		""      :  "transitionend",
		"webkit":  "webkitTransitionEnd",
		"Moz"   :  "transitionend",
		"O"     :  "otransitionend",
		"ms"    :  "MSTransitionEnd"
	}[vendor];
	
	//css position class names
	var euContainer="ui-slider-container";
	var euLpage="left-page";
	var euMpage="main-page";
	var euRpage="right-page";
	//css theme class names
	var euShadow="shadow";

	
	EJS.Class.defineUnderNamespace("EJS.UI","SliderPage",
		function(hostElement,options){
			
			this.options=options || {};
			
			this.hostElement=hostElement;
			//Elements
			this._domElement=null;
			this._leftPage=null;
			this._mainPage=null;
			this._rightPage=null;
			this._lockPage=null;
			
			this._type=this.options.type || 1;//1 为左页加主页； 2 为主页加右页； 3为三页
			this._leftCss=this.options.leftClass?this.options.leftClass:null;
			this._mainCss=this.options.mainClass?this.options.mainClass:null;
			this._rightCss=this.options.rightClass?this.options.rightClass:null;	
			this._gap=this.options.gap?this.options.gap:50;//当显示左页面时，右页面显示宽度；
			
			this.options._showPage=options._showPage || "main";// left , right , main
			this._showPage=null;
			
			this._dis=null;//最大位移
			
			this.isDown=false;
			this.isMove=false;
				
			this.init();
		},{
			_hasTouch:hasTouch,
			_setElement:function(){
				var els=createElement();
				this._domElement=els.container;
				this._mainPage=els.mainPage;
				if(this._type==2){
					this._rightPage=createRightPage();
					this._domElement.appendChild(this._rightPage);
				}else if(this._type==1){
					this._leftPage=createLeftPage();
					this._domElement.appendChild(this._leftPage);
				}else{
					this._rightPage=createRightPage();
					this._domElement.appendChild(this._rightPage);
					this._leftPage=createLeftPage();
					this._domElement.appendChild(this._leftPage);
				}
				this._domElement.appendChild(this._mainPage);
				if(this._leftCss) UIUtil.addClass(this._leftPage,this._leftCss);
				if(this._mainCss) UIUtil.addClass(this._mainPage,this._mainCss);
				if(this._rightCss) UIUtil.addClass(this._rightPage,this._rightCss);
					
			},
			_setAni:function(){
				this._mainPage.style[transitionProperty]="transform";
				this._mainPage.style[transitionDuration]="100ms";
				this._mainPage.style[transitionTimingFunction]="ease-out";
				if(this._leftPage)this._leftPage.style[transitionProperty]="all";
				if(this._leftPage)this._leftPage.style[transitionDuration]="100ms";
				if(this._leftPage)this._leftPage.style[transitionTimingFunction]="ease-out";
				if(this._rightPage)this._rightPage.style[transitionProperty]="all";
				if(this._rightPage)this._rightPage.style[transitionDuration]="100ms";
				if(this._rightPage)this._rightPage.style[transitionTimingFunction]="ease-out";
			},
			_cancelAni:function(){
				this._mainPage.style[transitionProperty]="";
				this._mainPage.style[transitionDuration]="";
				this._mainPage.style[transitionTimingFunction]="";
				if(this._leftPage)this._leftPage.style[transitionProperty]="";
				if(this._leftPage)this._leftPage.style[transitionDuration]="";
				if(this._leftPage)this._leftPage.style[transitionTimingFunction]="";
				if(this._rightPage)this._rightPage.style[transitionProperty]="";
				if(this._rightPage)this._rightPage.style[transitionDuration]="";
				if(this._rightPage)this._rightPage.style[transitionTimingFunction]="";
			},
			_addEvent:function(){
				var that=this;
				
				var startX=null;
				var endX=null;
				var disX=null; //鼠标滑动距离
				var domDisX=null;
				
				var eStart=function(e){
					that._domElement.addEventListener(evMove,eMove,false);
					that._domElement.addEventListener(evEnd,eEnd,true);
					
					that._mainPage.removeEventListener("click",stopBubble,true);
					that._mainPage.removeEventListener(evEnd,stopBubble,true);
					that._mainPage.removeEventListener(evStart,stopBubble,true);
					
					if(that._showPage!="main"){
						stopBubble(e);
					}
					
					startX=e.clientX || e.changedTouches[0].clientX;
					that.isDown=true;
				};
				var eMove=function(e){
					endX=e.clientX || e.changedTouches[0].clientX;
					//当type==1时 main page左滑有限制 this._dis >= tanslate >= 0 
					//当type==2时 main page右滑有限制 -this._dis >= tanslate >= 0
					//当type==3时 main page左右都可滑  -this._dis >= tanslate <= this._dis
					if(that.isDown){
						
						that._cancelAni();
						disX=endX-startX;
						if(Math.abs(disX)>5)
							that.isMove=true;
						
						switch(that._showPage){
							case "left":
								domDisX=that._dis+disX;
								if(domDisX>=that._dis) domDisX=that._dis;
								if(domDisX<=0) domDisX=0;
								that._leftAni(null,"left",disX,domDisX);
							break;
							case "right":
								domDisX=-that._dis+disX;
								if(domDisX<=-that._dis) domDisX=-that._dis;
								if(domDisX>=0) domDisX=0;
								that._rightAni(null,"right",disX,domDisX);
							break;
							case "main":
								domDisX=disX;
								if(that._type==1){ 
									if(domDisX>=that._dis) domDisX=that._dis;
									if(domDisX<=0) domDisX=0;
									that._leftAni(null,"main",disX,domDisX);
								}
								if(that._type==2){ 
									if(domDisX>=0) domDisX=0;
									if(domDisX<=-that._dis) domDisX=-that._dis;
									that._rightAni(null,"main",disX,domDisX);
								}
								if(that._type==3){
									if(domDisX>=that._dis) domDisX=that._dis;
									if(domDisX<=-that._dis) domDisX=-that._dis;
									that._leftAni(null,"main",disX,domDisX);
									that._rightAni(null,"main",disX,domDisX);
								}
								if(domDisX>0){
									if(that._rightPage)that._rightPage.style.display="none";
								}
								if(domDisX<0){
									if(that._leftPage)that._leftPage.style.display="none";
								}
							break;
						}				
						translateX(that._mainPage,domDisX);	
					}
				};
				var eEnd=function(e){
					// 当domDisX>1/3 that._dis 时 open left;  domDisX<1/3 that._dis时 open main
					// 当domDisX<1/3 -that._dis时 open right ; domDisX>1/3 -that._dis时 open main
					if(that.isMove){
						if(domDisX>=(that._dis/3)){
							that.showPage="left";
						}else if(0<=domDisX && domDisX<(that._dis/3)){
							that.showPage="main";
						}
						if(domDisX<=(-that._dis/3)){
							that.showPage="right";
						}else if((-that._dis/3)<domDisX && domDisX<0){
							that.showPage="main";
						}
					}
					if((that.isDown && that.isMove) || that._showPage!="main"){
						that._mainPage.addEventListener("click",stopBubble,true);
						that._mainPage.addEventListener(evEnd,stopBubble,true);
						that._mainPage.addEventListener(evStart,stopBubble,true);
					}
					if(!that.isMove){
						that.showPage="main";
					}
					that.isDown=false;
					that.isMove=false;
					that._domElement.removeEventListener(evMove,eMove,false);
					that._domElement.removeEventListener(evEnd,eEnd,true);
				};
				that._mainPage.addEventListener(evStart,eStart,true);
			},
			_onresize:function(){
				var that=this;
				window.onresize=function(){
					that.refresh();
				}	
			},

			refresh:function(){
				var w=this._domElement.offsetWidth;
				var lw=w-this._gap;
				this._dis=lw;
				if(this._leftPage) this._leftPage.style.width=lw+"px";
				if(this._rightPage)this._rightPage.style.width=lw+"px";
				this.showPage=this.options._showPage;
			},	
			showPage:{
				get:function(){
					return this._showPage;
				},
				set:function(value){
					if((value=="left" && this._type==2) ||
					(value=="right" && this._type==1))
						return;
					this._setAni();
					var that=this;
					this._hiddenEvent=function(){
						if(that._showPage=="left")
							if(that._rightPage)that._rightPage.style.display="none";
						if(that._showPage=="right")
							if(that._leftPage)that._leftPage.style.display="none";
						if(that._showPage=="main"){
							if(that._rightPage)that._rightPage.style.display="none";
							if(that._leftPage)that._leftPage.style.display="none";
						}
						that._domElement.removeEventListener(transitionEnd,that._hiddenEvent,false);
					}
					this._domElement.addEventListener(transitionEnd,this._hiddenEvent,false);
					var nowPgae=this._showPage;
					this._leftAni("hidden");
					this._mainAni("main");
					this._rightAni("hidden");
						
					if(value=="left"){
						//从main page到left page
						if(this._leftPage)that._leftPage.style.display="block";
						this._mainAni("right");
						this._leftAni("show");
					}else if(value=="right"){
						//从main page 到right page
						if(this._rightPage)that._rightPage.style.display="block";
						this._mainAni("left");
						this._rightAni("show");
					}
					this._showPage=value;
				}
			},
			_leftAni:function(to,state,disX,domDisX){
				if(this._type==2)
					return;
				var low=0.3;
				var s=0.5;//越小越快
				if(to=="hidden"){
					opacity(this._leftPage,low);
					translateX(this._leftPage,0-this._dis/3);
					return;
				}else if(to=="show"){
					opacity(this._leftPage,1);
					translateX(this._leftPage,0);
					return;
				}
				var leftDis=disX/3;
				if(state=="left"){
					if(domDisX>=this._dis) leftDis=0;
					if(domDisX<=0) leftDis=-disX/3;
					translateX(this._leftPage,leftDis);
				}
				if(state=="main"){
					this._leftPage.style.display="block";
					leftDis=0-this._dis/3+leftDis;
					if(disX>=this._dis) leftDis=0;
					
					translateX(this._leftPage,leftDis);
				}
				var o=1+leftDis/(this._dis*s);
				if(domDisX>=this._dis) o=1;
				if(domDisX<=0) o=low;
				opacity(this._leftPage,o);
			},
			_rightAni:function(to,state,disX,domDisX){
				if(this._type==1)
					return;
				var low=0.3;
				var s=0.5;//越小越快
				if(to=="hidden"){
					opacity(this._rightPage,low);
					translateX(this._rightPage,this._dis/3);
					return;
				}else if(to=="show"){
					opacity(this._rightPage,1);
					translateX(this._rightPage,0);
					return;
				}
				var rightDis=disX/3;
				if(state=="right"){
					if(domDisX>=0) rightDis=this._dis/3;
					if(domDisX<=-this._dis) rightDis=0
					translateX(this._rightPage,rightDis);
				}
				if(state=="main"){
					this._rightPage.style.display="block";
					rightDis=0+this._dis/3+rightDis;
					if(-disX>=this._dis) rightDis=0;
					
					translateX(this._rightPage,rightDis);
				}
				var o=1-rightDis/(this._dis*s);
				if(domDisX<=-this._dis) o=1;
				if(domDisX>=0) o=low;
				opacity(this._rightPage,o);
			},
			_mainAni:function(to){
			
				if(to=="left"){
					translateX(this._mainPage,-this._dis);
				}
				if(to=="right"){
					translateX(this._mainPage,this._dis);
				}
				if(to=="main"){
					translateX(this._mainPage,0);
				}
				
			},
			
			addToLeftPage:function(dom){
				if(!dom) return;
				if(dom instanceof Object){
					if(this._leftPage)this._leftPage.appendChild(dom);
					return;
				}
				if(typeof(dom)==="string"){
					if(this._leftPage)this._leftPage.innerHTML=dom;
					return;
				}
			},
			addToRightPage:function(dom){
				if(!dom) return;
				if(dom instanceof Object){
					if(this._rightPage)this._rightPage.appendChild(dom);
					return;
				}
				if(typeof(dom)==="string"){
					if(this._rightPage)this._rightPage.innerHTML=dom;
					return;
				}
			},
			addToMainPage:function(dom){
				if(!dom) return;
				if(dom instanceof Object){
					this._mainPage.appendChild(dom);
					return;
				}
				if(typeof(dom)==="string"){
					this._mainPage.innerHTML=dom;
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
		var mainPage = UIUtil.createDom("div",euMpage);
		return {container:container,mainPage:mainPage}
	}
	function createRightPage(){
		return UIUtil.createDom("div",euRpage);
	}
	function createLeftPage(){
		return UIUtil.createDom("div",euLpage);
	}
	
})(EJS);