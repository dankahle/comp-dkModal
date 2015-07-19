!function(){"use strict";var e=angular.module("app",["ngAnimate","ngTouch","dkModal"]);e.controller("ctrl",["$scope","$dkModal",function(e,t){var o;o=t({template:"mymodal",scope:e,target:".one",targetSide:"left",width:"40%",targetVert:"middle"}),e.show=function(){var e=o.show();e.modal.off("ok"),e.modal.on("ok",function(){console.log("got it:",e.scope.user)}),e.modal.on("cancel",function(e){console.log("cancel")})}}]),e.controller("addCtrl",["$scope",function(e){e.$parent.$regScope(e),e.userAgent=window.navigator.userAgent,e.user={name:"dank"},e.submit=function(){}}])}(),function(){"use strict";if(!$)throw new Error("dkModal depends on jquery");if(!angular)throw new Error("dkModal depends on angular");var e=angular.module("dkModal",["ngAnimate"]);e.provider("$dkModal",function(){var e=767,t=2,o="96%",n={},i=-1!=window.navigator.userAgent.indexOf("Mobi"),r={target:void 0,selector:void 0,template:void 0,key:!0,click:!0,targetVert:"middle",targetSide:"right",offsetTop:void 0,offsetLeft:void 0,center:!1,separation:20,width:void 0,backdropColor:void 0};return n.setDefaults=function(e){angular.extend(r,e)},n.$get=["$http","$templateCache","$compile","$animate","$rootScope",function(n,a,d,l,s){return function(c){function f(e){return s.$apply(function(){k.hide("ok")}),!1}function p(e){return s.$apply(function(){k.hide("cancel")}),!1}function h(e){return e.which==y&&s.$apply(function(){k.hide("cancel")}),!1}function g(){return s.$apply(function(){k.hide("cancel")}),!1}var u,w,m,k={},v=!1,x=angular.extend({},r,c),y=27;return k.hide=function(e){v&&(u.find(".exit-ok").off("click",f),u.find(".exit-cancel").off("click",p),u.off("keyup",h)),l.removeClass(w,"open").then(function(){w.remove()}),l.removeClass(u,"open").then(function(){u.trigger(e),v?u.hide():u.remove()})},k.init=function(){function e(e){this.$modalChild=e}if(!x.selector&&!x.template)throw new Error("Must set either dk-modal to selector or data-template to template");if(x.selector){if(v=!0,u=$(x.selector),0===u.length)throw new Error("Failed to find modal from selector: "+x.selector)}else if(x.template){if(!x.scope)throw new Error("scope is required with template option");x.scope.$regScope=e;var t;if((t=a.get(x.template))?u=d(t)(x.scope):n.get(x.template).then(function(e){a.put(e.data),u=d(e.data)(x.scope)},function(e){throw new Error(e.message)}),0===u.length)throw new Error("Failed to create modal from template: "+x.template)}return angular.extend(x,u.data(),c),m={modal:u,scope:x.scope&&x.scope.$modalChild||x.scope}},k.show=function(){var n,r;m||k.init();var a,d;if(a=window.innerWidth<=e,d=u.find("input, select, textarea").length>0,u.find(".exit-ok").click(f),u.find(".exit-cancel").click(p),u.addClass("dk-modal"),u.attr("tabindex","-1"),x.key&&u.on("keyup",h),x.width){var s=-1!=x.width.indexOf("%")?window.innerWidth*parseInt(x.width)/100:parseInt(x.width);s>window.innerWidth?(s=window.innerWidth+"px",console.log("constrain width to:",window.innerWidth)):s=x.width,u.css("width",s)}else u.css("width","");u.css("left","-9999px"),u.show(),v||$(document.body).prepend(u);var c=u.outerWidth(),y=u.outerHeight();u.hide(),u.css("left","");var M=window.innerWidth*(t/100);if(y+(a?M:0)>window.innerHeight?(y=window.innerHeight-(a?M:0),u.css("height",y+"px"),console.log("constrain height to:",y,"innerHeight",window.innerHeight)):u.css("height",""),u.css("top",""),u.css("left",""),u.css("transform",""),i&&a&&d)u.css("transform","translate(0,0)"),u.css("top",M+"px"),u.css("left",t+"%"),u.css("width",o);else if(x.offsetTop&&x.offsetLeft){u.css("transform","translate(0,0)");var C=-1!=x.offsetTop.indexOf("%")?window.innerHeight*parseInt(x.offsetTop)/100:parseInt(x.offsetTop),T=-1!=x.offsetLeft.indexOf("%")?window.innerWidth*parseInt(x.offsetLeft)/100:parseInt(x.offsetLeft);C+y<window.innerHeight?r=x.offsetTop:(r=window.innerHeight-y+"px",console.log("adj top to:",r)),T+c<window.innerWidth?n=x.offsetLeft:(n=window.innerWidth-c+"px",console.log("adj left to:",n)),u.css("top",r),u.css("left",n)}else if(x.target){u.css("transform","translate(0,0)");var W=x.targetSide||"right",b=$(x.target);if(!b.length)throw new Error("Failed to locate target: "+x.target);var H=b.offset(),E=b.outerWidth(),j=b.outerHeight();"right"==W?H.left+E+x.separation+c<window.innerWidth?n=H.left+E+x.separation:(n=window.innerWidth-c,console.log("adj left to:",n)):"left"==W&&(H.left-x.separation-c>0?n=H.left-x.separation-c:(n=0,console.log("adj left to:",n))),"top"==x.targetVert?r=H.top:"middle"==x.targetVert?r=H.top-y/2+j/2:"bottom"==x.targetVert&&(r=H.top-y+j),0>r&&(r=0,console.log("adj top to:",r)),r+y>window.innerHeight&&(r=window.innerHeight-y,console.log("adj top to:",r)),console.log("targetOffset",H),console.log("target width/height",E,j),console.log("modal width/height",c,y),console.log(n,r),u.css("top",r+"px"),u.css("left",n+"px")}return w=$('<div tabindex="-1" class="dk-modal-backdrop"></div>'),x.backgroundColor&&w.css("background-color",x.backdropColor),x.click&&w.click(g),x.key&&w.keyup(h),$("body").prepend(w),w.show(),l.addClass(w,"open"),u.show(),u.focus(),l.addClass(u,"open").then(function(){u.trigger("show")}),m},k}}],n}),e.directive("dkModalTrigger",function(){return{restrict:"A",controller:["$scope","$element","$attrs","$dkModal",function(e,t,o,n){t.click(function(){var i=t.data();i.template&&(i.scope=e),!i.selector&&o.dkModalTrigger&&(i.selector=o.dkModalTrigger),e.$apply(function(){n(i).show()})})}]}}),e.run(["$templateCache",function(e){e.put("dkModalTemplate.html","")}]),e.directive("dkModalTemplate",function(){return{templateUrl:"dkModalTemplate.html",link:function(e,t,o){e.opts=t.data()}}})}();