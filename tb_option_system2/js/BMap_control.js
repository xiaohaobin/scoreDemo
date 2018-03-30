var aAreainfo = [];
function drawMap(oAreainfo){
	this.areaType = oAreainfo.areaType;
	this.aJwd = oAreainfo.aJwd;
	this.areaDeac = oAreainfo.areaDeac;
	this.areaName = oAreainfo.areaName;
	this.code = oAreainfo;
}
drawMap.prototype.draw = function(){
	switch(this.areaType) {
		case 'polyline':
			draw_polyline(this.code);
			break;
		case 'rectangle':
			draw_rectangle(this.code);
			break;
		case 'polygon':
			draw_polygon(this.code);
			break;		
	}
}

// 百度地图API功能
var map = new BMap.Map("allmap");
map.centerAndZoom(new BMap.Point(113.953812, 22.549255), 17);
map.disableDoubleClickZoom(); //禁用双击放大。
map.enableScrollWheelZoom();
/*
 * 缩放工具栏			
 * */
var navigationControl = new BMap.NavigationControl({
	anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
	offset: new BMap.Size(0, 300),
	type: BMAP_NAVIGATION_CONTROL_LARGE,
	showZoomInfo: true,
	enableGeolocation: true
});
map.addControl(navigationControl);

/*
 比例尺,比例尺比例和地图级别有关
 * */
var scaleControl = new BMap.ScaleControl({
	anchor: BMAP_ANCHOR_TOP_RIGHT,
	offset: new BMap.Size(0, 0),
});
map.addControl(scaleControl);

//负责进行地图当前位置定位的控件
var geolocationControl = new BMap.GeolocationControl({
	anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
	showAddressBar: true,
	offset: new BMap.Size(0,30),
	enableGeolocation: true
});
//定位成功事件
geolocationControl.addEventListener("locationSuccess", function(e) {
	// 定位成功事件
	console.log(e);
	var address = '';
	address += e.addressComponent.province;
	address += e.addressComponent.city;
	address += e.addressComponent.district;
	address += e.addressComponent.street;
	address += e.addressComponent.streetNumber;
	layer.alert("当前定位地址为：" + address);
	//			    console.log(geolocationControl.getAddressComponent());//：返回当前的定位信息。
});
//定位失败事件
geolocationControl.addEventListener("locationError", function(e) {
	layer.alert("定位失败：" + e.message);
});
map.addControl(geolocationControl);

//
////实例化城市列表类
//var cityList = new BMapLib.CityList({
//	container: 'cityContainer',
//	map: map
//});
//document.getElementById("cityContainer").removeChild(document.getElementById("cityContainer").lastChild);


//鼠标绘制工具扩展类
$.isMoblie(
	function(){//移动
		
	},
	function(){//pc
		//初始化划区域
		if(localStorage.getItem('aAreainfo')){
			aAreainfo = JSON.parse(localStorage.getItem('aAreainfo'));
			console.log(aAreainfo);
			for(var keys in aAreainfo){
				var dM = new drawMap(aAreainfo[keys]);
				dM.draw();
			}
		}
		
		$('head').append($('<link rel="stylesheet" type="text/css" href="css/DrawingManager_min.css" id="DrawingManager"/>'));
		$('body').append($('<script src="js/DrawingManager_min.js" type="text/javascript" charset="utf-8"></script>'));
		
		var styleOptions = {
			strokeColor: "red", //边线颜色。
			fillColor: "red", //填充颜色。当参数为空时，圆形将没有填充效果。
			strokeWeight: 3, //边线的宽度，以像素为单位。
			strokeOpacity: 0.8, //边线透明度，取值范围0 - 1。
			fillOpacity: 0.6, //填充的透明度，取值范围0 - 1。
			strokeStyle: 'solid' //边线的样式，solid或dashed。
		}
		//实例化鼠标绘制工具配置
		var options = {
			isOpen: false, //是否开启绘制模式
			enableDrawingTool: true, //是否显示工具栏
			drawingMode: BMAP_DRAWING_POLYGON, //绘制模式  多边形
			drawingToolOptions: {
				anchor: BMAP_ANCHOR_TOP_LEFT, //位置
				offset: new BMap.Size(5, 5), //偏离值
				drawingModes: [
//					BMAP_DRAWING_POLYGON,//多边形
//					BMAP_DRAWING_MARKER,//圆点
//					BMAP_DRAWING_CIRCLE,//画圆
					BMAP_DRAWING_POLYLINE,//画线
//					BMAP_DRAWING_RECTANGLE//画矩形
				]
			},
			markerOptions: {
				icon:new BMap.Icon("img/tanba.gif", new BMap.Size(36, 36))
			},
			polygonOptions: styleOptions, //多边形的样式
			circleOptions: styleOptions //圆的样式
		};
		
		var oInfo = {
			"name":"探霸标示",
			"id":"0",
			"msg":"主要探测目标设备等终端",
			"time":"2017-12-12"
		};
		
		//鼠标绘制完成回调方法   获取各个点的经纬度
		var overlays = [];
		var overlaycomplete = function(e,j,k) {
			overlays.push(e.overlay);
//				console.log(typeof e.overlay.getPath);
			if(typeof e.overlay.getPath == "function"){//如果不是画标注点，则返回function，否则underfind
				var path = e.overlay.getPath(); //Array<Point> 返回多边型的点数组
				console.log(path);
				for(var i = 0; i < path.length; i++) {
					console.log("lng:" + path[i].lng + "\n lat:" + path[i].lat);
				}
			}
			var aType = drawingManager.getDrawingMode();
			console.log(drawingManager.getDrawingMode());//获取绘制的类型
			console.log(j.overlay);//实例化之后的覆盖物对象
			menu(j.overlay);//所有覆盖物调用右键菜单
			areaInfoWin(path,aType,path[0]);
		};
		//实例化鼠标绘制工具
		var drawingManager = new BMapLib.DrawingManager(map,options);

		//添加鼠标绘制工具监听事件，用于获取绘制结果
		drawingManager.addEventListener('overlaycomplete', overlaycomplete);
		
		//关闭绘制状态
		function closeDrawState(){
			drawingManager.close();
		}
		
		
	}
);

//信息窗口函数
function areaInfoWin(aPoints,areaType,point){
	var aDeacs = '',aName = '';
	if(aAreainfo){
		$.each(aAreainfo, function(i,v) {
			if(JSON.stringify(v.aJwd) == JSON.stringify(aPoints)){
				console.log(v.areaDeac,v.areaName);
				aDeacs = v.areaDeac;
				aName = v.areaName;
			}
		});
	}
	// 创建信息窗口对象
	var areaHtml = '<div><form action="#" class="form"><div class="form-group mb-10"><label for="areaName" class="col-sm-3 control-label">区域名称:</label><div class="col-sm-9"><input type="text" class="form-control" id="areaName" placeholder="输入区域名称" value="'+ aName +'"></div><div class="form-group mb-10"><label for="areaType" class="col-sm-3 control-label">区域类型:</label><div class="col-sm-9"><input type="text" class="form-control" id="areaType" value="'+ areaType +'" readonly></div></div><div class="form-group mb-10"><label for="aJwd" class="col-sm-3 control-label">经纬度组合：</label><div class="col-sm-9"><textarea name="" rows="" cols="" class="form-control" id="aJwd" readonly>'+ JSON.stringify(aPoints) +'</textarea></div></div><div class="form-group mb-10"><label for="areaDeac" class="col-sm-3 control-label">备注：</label><div class="col-sm-9"><textarea name="" rows="" cols="" class="form-control" id="areaDeac">'+ aDeacs +'</textarea></div></div><div class="text-center" ><button type="button" class="btn btn-success sureArea"  style="margin-top:20px;">确定</button></div></form></div>';
	
				
	infoWindow2 = new BMap.InfoWindow(areaHtml, {
		width : 500,     // 信息窗口宽度
	    height: 300,     // 信息窗口高度
	    title : "区域详细信息" , // 信息窗口标题
	});  
	map.openInfoWindow(infoWindow2,point); //开启信息窗口
	
	//提交区域信息
	$('.sureArea').on('click',function(){
		var areaName = $('#areaName').val();
		var aJwd = JSON.parse($('#aJwd').val());
		var areaDeac = $('#areaDeac').val();
		var areaType = $('#areaType').val();
		
		//提交的数据
		var oAreaInfo = {
			areaName:areaName,
			aJwd:aJwd,
			areaDeac:areaDeac,
			areaType:areaType
		};
		
		//判断是否存在之前的区域经纬度，返回不同的经纬度数组
		if(aAreainfo){
			aAreainfo = _.reject(aAreainfo, function(v){
				return JSON.stringify(v.aJwd) == JSON.stringify(aPoints);
			});
			localStorage.setItem("aAreainfo",JSON.stringify(aAreainfo));
			
		}
		aAreainfo.push(oAreaInfo);
		localStorage.setItem('aAreainfo',JSON.stringify(aAreainfo));
		layer.msg('保存成功',{time:1500},function(){
			map.closeInfoWindow();					
		});
	});
}

//标注定义右键菜单
function menu(marker){
	var markerMenu = new BMap.ContextMenu();
	markerMenu.addItem(
		new BMap.MenuItem('删除',function(e,k,m){
			map.removeOverlay(m);
			//更新存储数据
			aAreainfo = _.reject(aAreainfo, function(v){
				return JSON.stringify(v.aJwd) == JSON.stringify(m.code.aJwd);
			});
			localStorage.setItem("aAreainfo",JSON.stringify(aAreainfo));
		})
	);
	markerMenu.addItem(
		new BMap.MenuItem('信息',function(e,k,m){	
			console.log(e,k,m)
//			areaInfoWin(m.ja,m.code.areaType,e);
			if(m instanceof BMap.Polyline){
				areaInfoWin(m.ja,'polyline',e);
			}
		})
	);
	marker.addContextMenu(markerMenu);
	
}

//画曲线
function draw_polyline(code){
	var aPoints = [];
	$.each(code.aJwd, function(i,v) {
		aPoints.push(new BMap.Point(v.lng, v.lat));
	});
	var polyline = new BMap.Polyline(aPoints); //创建折线
	map.addOverlay(polyline); //覆盖折线到地图上
	polyline.code = code;
	//监听点击
	polyline.addEventListener("click", function(e,d,w){
		console.log(this);
	});
	menu(polyline);
}

//画矩形
function draw_rectangle(code){
	
}

//画多边形
function draw_polygon(code){
	
}
