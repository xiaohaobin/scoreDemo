//本地存储数据
//var aTbInfo = [];
//if(localStorage.getItem("aTbInfo")) aTbInfo = JSON.parse(localStorage.getItem("aTbInfo"));
//console.log(aTbInfo);
//$('.countNum').text(aTbInfo.length);
//$.each(aTbInfo, function(i,v) {
//	var sHtml = $('<tr><td class="tanbaID">'+ v.tanbaID +'</td><td class="tanbaName">'+ v.tanbaName +'</td><td class="tbDB">'+ v.tbDB +'</td><td class="tbRadius">'+ v.radius +'</td><td class="lng">'+ v.jwd[0] +'</td><td class="lat">'+ v.jwd[1] +'</td><td class="tanbaAddr">'+ v.tanbaAddr +'</td><td class="desc">'+ v.desc +'</td></tr>');
//	$('.table tbody').append(sHtml);
//});


//服务器数据

$('.tbTable').paging({
	url:url_join2('Device/queryDevice'),
	data: {page:1},
	type: "get",
	callBack: function(data) {
//		Fn(data);
		console.log(data);
		createTabel(data,'.tbTable');
	}
});

//创建表格
function createTabel(data,ele){
	if(data.data.length > 0){
		$(ele).children('tbody').html("");
		$.each(data.data, function(i,v) {
			var sTr = '<tr data-id="'+ v.id +'">'+
					  '<td class="hardver">'+ v.hardver +'</td>'+	
					  '<td class="deviceId">'+ v.deviceId +'</td>'+	
					  '<td class="jwd">'+ v.longitude +','+ v.latitude +'</td>'+
					  '<td class="address">'+ v.address +'</td>'+	
					  '<td class="areas">'+ v.areas +'</td>'+	
					  '<td class="status">'+ getTbStatus(v.status) +'</td>'+	
					  '<td class="locationType">'+ getLocationType(v.locationType) +'</td>'+	
					  '<td class="antennaPower">'+ getAntennaPower(v.antennaPower) +'</td>'+	
					  '<td class="createtime">'+ v.createtime +'</td>';
			$(ele).children('tbody').append($(sTr));
		});
	}
	
}

//获取探霸状态字段
function getTbStatus(n){
	switch (n){
		case 0:
			return '正常'
			break;
		case 1:
			return '在线'
			break;
		case 2:
			return '离线'
			break;
		case 3:
			return '故障'
			break;
		case 4:
			return '维修中'
			break;
		case 5:
			return '报废'
			break;
	}
}

//获取探霸设备类型
function getDeviceType(n){
	switch (n){
		case 0:
			return '基站'
			break;
		case 1:
			return '移动'
			break;		
	}
}
//获取探霸位置类型
function getLocationType(n){
	switch (n){
		case 0:
			return '不设定'
			break;
		case 1:
			return '出口'
			break;		
		case 2:
			return '入口'
			break;	
	}
}
//获取探霸天线功率
function getAntennaPower(n){
	switch (n){
		case 0:
			return '<b>2db</b>(<i>100</i>)m';
			break;
		case 1:
			return '<b>3db</b>(<i>150</i>)m';
			break;		
		case 2:
			return '<b>6db</b>(<i>200</i>)m';
			break;
		case 3:
			return '<b>9db</b>(<i>300</i>)m';
			break;
		case 4:
			return '<b>10db</b>(<i>320</i>)m';
			break;
		case '-1':
			return '<b>1db</b>(<i>50</i>)m';
			break;
		case '-2':
			return '<b>0db</b>(<i>0</i>)m';
			break;
	}
}
