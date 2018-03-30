(function(win, doc, $) {
	function deviceManage(options) {
		this._init(options);
	}
	$.extend(deviceManage.prototype, {
		_init: function(options) {
			var self = this;
			self.options = {
				searchType: "#searchType", //搜索类型输入框
				deviceStatus: "#deviceStatus", //设备状态下拉框
				searchCont: "#searchCont", //搜索内容输入框
				queryTarget: ".queryTarget", //搜索内容按钮
				addDevice: ".addDevice", //新增设备
				refresh: ".refresh", //刷新页面
				deviceLisTable: "#deviceLisTable" //设备列表表格
			};
			$.extend(true, self.options, options || {});
			self._initDomEvent();
			return self;
		},
		/**
		 * 初始化DOM引用
		 * @method _initDomEvent
		 * @return {CusScrollBar}
		 */
		_initDomEvent: function() {
			var self = this;
			var opts = this.options;
			//搜索类型输入框对象
			self.$searchType = $(opts.searchType);
			//设备状态下拉框对象
			self.$deviceStatus = $(opts.deviceStatus);
			//搜索内容输入框对象
			self.$searchCont = $(opts.searchCont);
			//搜索设备按钮对象
			self.$queryTarget = $(opts.queryTarget);
			//新增设备
			self.$addDevice = $(opts.addDevice);
			//刷新页面按钮对象
			self.$refresh = $(opts.refresh);
			//表格对象
			self.$deviceLisTable = $(opts.deviceLisTable);
			/*初始化*/
			self._initDomBindEvent();
			/*当前页数*/
			self.thisPage = 1;
			/*初始化设备列表*/
			self.getDeviceList();
		},
		/**
		 * 初始化DOM绑定事件
		 * @return {[Object]} [this]
		 * */
		_initDomBindEvent: function() {
			var self = this;
			//搜索内容事件绑定
			self.$queryTarget.click(function(e) {
				e.preventDefault();
				$("#pageTool").html("");
				self.searchContEvent();
			});
			//新增设备
			self.$addDevice.click(function(e) {
				e.preventDefault();
				self.addDeviceAlertEvent();
			});
			//编辑信息
			self.$deviceLisTable.on("click", ".editDevice", function(e) {
				e.preventDefault();
				self.editInfoEvent(this);
			});
			//信息详情
			self.$deviceLisTable.on("click", ".detailDevice", function(e) {
				e.preventDefault();
				self.infoDetailEvent(this);
			});
			//刷新页面
			self.$refresh.click(function(e) {
				e.preventDefault();
				location.reload(true);
			});
		},
		//搜索内容事件
		searchContEvent: function(pageNum) {
			var self = this;
			var type = self.$searchType.val();
			var keyword = self.$searchCont.val();
			var status = self.$deviceStatus.val();
			var param = {
				page: pageNum || 1,
				type: type || "0",
				keyword: keyword || "",
				status: status || "-1"
			};
			fnAjax.method_5(url_join1("Device/queryDevice"), param, "post", function(res) {
				if(res.code == 0) {
					var data = res.data.data;
					if(data.length > 0) {
						var trs = "";
						for(var i = 0; i < data.length; i++) {
							var status = "";
							switch(data[i].status) {
								case 0:
									status = "正常"
									break;
								case 1:
									status = "在线"
									break;
								case 2:
									status = "离线"
									break;
								case 3:
									status = "故障"
									break;
								case 4:
									status = "维修中"
									break;
								case 5:
									status = "报废"
									break;
								default:
									status = "未知"
							};
							trs += '<tr data-id="' + data[i].id + '" data-mac="' + data[i].deviceId + '">' +
								'<td>ver ' + data[i].hardver + '</td>' +
								'<td>' + data[i].deviceId + '</td>' +
								'<td>' + data[i].id + '</td>' +
								'<td>' + data[i].areas + '</td>' +
								'<td>' + data[i].address + '</td>' +
								'<td>' + status + '</td>' +
								'<td class="jwd">'+ data[i].longitude +','+ data[i].latitude +'</td>'+
								'<td>' + data[i].createtime + '</td>' +
								'<td>' +
								'<a href="#" class="editDevice mr-15">编辑</a>' +
								'<a href="#" class="detailDevice">详情</a></td></tr>';
						};
						$(".stateInforBar").hide();
						self.$deviceLisTable.children("tbody").html(trs);
						/*修改总页数*/
						$(".pageNum").html(res.data.last_page);
						/*修改总条数*/
						$(".dataNum").html(res.data.total);
						/*分页*/
						if($("#pageTool").html() == "") {
							/*调用分页*/
							laypage({
								cont: 'pageTool', //控制分页容器，
								pages: res.data.last_page, //总页数
								skip: true, //是否开启跳页
								groups: 3, //连续显示分页数
								first: '首页', //若不显示，设置false即可
								last: '尾页', //若不显示，设置false即可
								prev: '<', //若不显示，设置false即可
								next: '>', //若不显示，设置false即可
								hash: true, //开启hash
								jump: function(objs, first) {
									if(!first || first == undefined) { //点击跳页触发函数自身，并传递当前页：obj.curr
										self.searchContEvent(objs.curr, param.type, param.keyword, param.status);
										self.thisPage = objs.curr;
									};
								}
							});
						};
					} else {
						self.$deviceLisTable.children("tbody").html("");
						$("#pageTool").html("");
						$(".stateInforBar").show();
					};
				} else {
					layer.msg(res.message);
				}
			});
		},
		//新增设备弹框事件
		addDeviceAlertEvent: function() {
			var self = this;
			var tPage = self.thisPage;
			layer.open({
				type: 2,
				title: '新增设备',
				maxmin: true,
				area: ['70%', '730px'],
				content: "add-device.html",
				cancel: function() {
					self.getDeviceList(tPage);
				},
				end: function() {
					self.getDeviceList(tPage);
				}
			});
		},
		//获取设备列表
		getDeviceList: function(pageNum) {
			var self = this;
			var param = {
				page: pageNum || 1
			};
			fnAjax.method_5(url_join1("Device/queryDevice"), param, "get", function(res) {
				if(res.code == 0) {
					var data = res.data.data;
					if(data.length > 0) {
						var trs = "";
						for(var i = 0; i < data.length; i++) {
							var status = "";
							switch(data[i].status) {
								case 0:
									status = "正常"
									break;
								case 1:
									status = "在线"
									break;
								case 2:
									status = "离线"
									break;
								case 3:
									status = "故障"
									break;
								case 4:
									status = "维修中"
									break;
								case 5:
									status = "报废"
									break;
								default:
									status = "未知"
							};
							trs += '<tr data-id="' + data[i].id + '" data-mac="' + data[i].deviceId + '">' +
								'<td>ver ' + data[i].hardver + '</td>' +
								'<td>' + data[i].deviceId + '</td>' +
								'<td>' + data[i].id + '</td>' +
								'<td>' + data[i].areas + '</td>' +
								'<td>' + data[i].address + '</td>' +
								'<td>' + status + '</td>' +
								'<td class="jwd">'+ data[i].longitude +','+ data[i].latitude +'</td>'+
								'<td>' + data[i].createtime + '</td>' +
								'<td>' +
								'<a href="#" class="editDevice mr-15">编辑</a>' +
								'<a href="#" class="detailDevice">详情</a></td></tr>';
						};
						$(".stateInforBar").hide();
						self.$deviceLisTable.children("tbody").html(trs);
						/*修改总页数*/
						$(".pageNum").html(res.data.last_page);
						/*修改总条数*/
						$(".dataNum").html(res.data.total);
						/*分页*/
						if($("#pageTool").html() == "") {
							/*调用分页*/
							laypage({
								cont: 'pageTool', //控制分页容器，
								pages: res.data.last_page, //总页数
								skip: true, //是否开启跳页
								groups: 3, //连续显示分页数
								first: '首页', //若不显示，设置false即可
								last: '尾页', //若不显示，设置false即可
								prev: '<', //若不显示，设置false即可
								next: '>', //若不显示，设置false即可
								hash: true, //开启hash
								jump: function(objs, first) {
									//点击跳页触发函数自身，并传递当前页：obj.curr
									if(!first || first == undefined) {
										self.getDeviceList(objs.curr);
										self.thisPage = objs.curr;
									};
								}
							});
						};
					} else {
						self.$deviceLisTable.children("tbody").html("");
						$("#pageTool").html("");
						$(".stateInforBar").show();
					};
				} else {
					layer.msg(res.message);
				}
			});
		},
		//编辑信息事件
		editInfoEvent: function(dom) {
			var self = this;
			var did = $(dom).parents("tr").attr("data-id");
			sessionStorage.did = did;
			var tPage = self.thisPage;
			layer.open({
				type: 2,
				title: '编辑设备',
				maxmin: true,
				area: ['70%', '730px'],
				content: "edit-device.html",
				cancel: function() {
					self.getDeviceList(tPage);
				},
				end: function() {
					self.getDeviceList(tPage);
				}
			});
		},
		//信息详情事件
		infoDetailEvent: function(dom) {
			var self = this;
			var did = $(dom).parents("tr").attr("data-id");
			var mac = $(dom).parents("tr").attr("data-mac");
			sessionStorage.did = did;
			sessionStorage.mac = mac;
			var tPage = self.thisPage;
			layer.open({
				type: 2,
				title: '设备详情',
				area: ['100%', '100%'],
				content: "deviceDetail.html",
				cancel: function() {
					self.getDeviceList(tPage);
				},
				end: function() {
					self.getDeviceList(tPage);
				}
			});
		}
	});
	win.deviceManage = deviceManage;
})(window, document, jQuery);
new deviceManage();