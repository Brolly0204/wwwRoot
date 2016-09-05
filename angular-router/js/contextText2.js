/**
 * Created by Administrator on 2016/8/22.
 */
var options = angular.module('routeApp');
options.controller('context2', ['$scope', '$http', '$timeout', '$filter', function ($scope, $http, $timeout, $filter) {
    //  初始数据
    $scope.startLoading = function () {
        $('.loading').css('top', $(document).scrollTop());
        $('.loading').css('left', $(document).scrollLeft());
        $('.loading').css('width', $(document).outerWidth());
        $('.loading').css('height', $(document).outerHeight());
        $('.loading').show();
    };
    $scope.endLoading = function () {
        if ($('.loading').is(':visible')) {
            $('.loading').hide();
        }
    };
    //  初始 执行加载中
    $scope.startLoading();
    $scope.initData = function () {
        var today = new Date();
        //  补零
        function addZero(date) {
            return ('0' + date).slice(-2);
        }
        //  日期
        today.setDate(today.getDate() - 1);
        $scope.endDate = today.getFullYear() + "" + addZero(today.getMonth() + 1) + "" + addZero(today.getDate());
        today.setMonth(today.getMonth() - 1);
        $scope.startDate = today.getFullYear() + "" + addZero(today.getMonth() + 1) + "" + addZero(today.getDate());
        var reqUrl = 'http://cp01-rdqa-dev313.cp01.baidu.com:8080/poseidon/core_index?';
        $scope.everyObj = {
            ids: 'ws_comp_chart,ws_comp_table,ws_comp_table_summary',
            param_dep_time: -1,
            param_agency: -1,
            param_dep_city: -1,
            param_arr_city: -1,
            param_product: -1,
            param_item: -1,
            param_os: -1,
            param_app_version: -1,
            param_order_type: -1,
            param_airline_name: -1,
            param_class_name: -1,
            param_agency_split: false,
            param_dep_city_split: false,
            param_arr_city_split: false,
            param_product_split: false,
            param_item_split: false,
            param_os_split: false,
            param_app_version_split: false,
            param_order_type_split: false,
            param_airline_name_split: false,
            param_class_name_split: false,
            param_chartIndexes: 'all_order_gmv',
            param_tableIndexes: 'all_order_gmv',
            param_pageSize: 10,
            param_pageIndex: 0,
            param_dep_time_split: false,
            param_startDate: $scope.startDate,
            param_endDate: $scope.endDate
        };
        //  获取初始数据
        $.ajax({
            //$scope.startDate  &param_endDate=$scope.endDate,
            url: reqUrl,
            type: 'get',
            data: $scope.everyObj,
            dataType: 'jsonp',
            success: function (result) {
                if (result.errorNo == 0) {
                    var data = result.data[0].datasets;
                    $('#footer').show();
                    //   K线图数据
                    if (data['ws_comp_chart']) {
                        var chartData = data['ws_comp_chart'];
                        var categories = chartData['categories'];
                        var dataFormat = chartData['dataFormat'];
                        var series = chartData['series'];
                        $scope.Min = chartData.yMin;
                        $scope.getChartdata(categories, series);
                    }
                    //   表格数据
                    if (data['ws_comp_table']) {
                        $scope.timee = $timeout(function () {
                            var tableDatas = data['ws_comp_table'];
                            if (tableDatas.data.length == '0') {
                                $('.pointTable').show();
                                $('.pageNum').hide();
                                $scope.tableData = '';
                                $scope.fields = '';
                                $scope.dataPages($scope.tableData);
                                return;
                            } else {
                                $('.pointTable').hide();
                                $('.pageNum').show();
                            }
                            $scope.tableData = tableDatas.data;
                            $scope.rowCount = tableDatas.rowCount;
                            $scope.fields = tableDatas.fields;
                            //  数据处理
                            $scope.dataPages($scope.tableData);
                            //  页码计算
                            $scope.pageNum = Math.ceil($scope.rowCount / $scope.totel);
                            $scope.inds = [];
                            for (var i = 0; i < $scope.pageNum; i++) {
                                $scope.inds.push(i + 1);
                            }
                            $scope.showInd = $scope.pageNum;
                            if ($scope.inds.length > 5) {
                                $scope.inds.pop();
                                $('.pageNum').children().last().data('index', $scope.pageNum - 1);
                            }

                            $timeout.cancel($scope.timee);
                        }, 0);
                    }
                    //   数据总结
                    if (data['ws_comp_table_summary']) {
                        $scope.times = $timeout(function () {
                            var sunmmData = data['ws_comp_table_summary'];
                            if (sunmmData.data.length == '0') {
                                $('.pointSummry').show();
                                return;
                            }
                            console.log(sunmmData);
                            $scope.summaryData = sunmmData.data;
                            $scope.summaryFields = sunmmData.fields;
                            $timeout.cancel($scope.times);
                        }, 0);
                    }
                }
            },
            error: function (error) {
                $('.pointTable').show();
                $('.pointSummry').show();
            }
        })
    };
    $scope.initData();

    //  最近日期选中
    $('.latestDate>a').on('click',function(){
        $(this).addClass('select').siblings('a').removeClass('select')
    });
    $scope.orderTable = function (key) {
        $scope.order = key;
        $scope.reverse = !$scope.reverse;
        console.log($scope.reverse);
    };
    //  获取查询条件
    $.ajax({
        url: 'http://cp01-rdqa-dev313.cp01.baidu.com:8080/poseidon/create_json?',
        type: 'get',
        dataType: 'jsonp',
        //url: '../cp1-creatData.json',
        //type: 'get',
        success: function (result) {
            if (result.errorNo === 0) {
                var data = result.data;
                //  订单类型 -1
                $scope.timer = $timeout(function () {
                    //    订单类型
                    $scope.order_type = data.order_type;
                    //    代理商 -1
                    $scope.agency = data.agency;
                    //    产品线
                    $scope.product = data.product;
                    //    分端
                    $scope.item = data.item;
                    //    os
                    $scope.os = data.os;
                    //    version
                    $scope.app_version = data.app_version;
                    //    出发城市
                    $scope.dep_city = data.dep_city;
                    $scope.depCitys = $scope.arrObject($scope.dep_city);
                    //     到达城市
                    $scope.arr_city = data.arr_city;
                    $scope.arrCitys = $scope.arrObject(data.arr_city);
                    //     航空公司
                    $scope.airline_name = data.airline_name;
                    $scope.airlines = $scope.arrObject(data.airline_name);
                    //     舱位类型
                    $scope.class_name = data.class_name;

                    $('.tablist_more').show();
                    $scope.endLoading();
                    $timeout.cancel($scope.timer);
                }, 0);

            }
        }
    });

    //  获取查询参数
    $scope.getParams = function () {
        var paramsObj = {};
        // ids
        paramsObj.ids = 'ws_comp_chart,ws_comp_table,ws_comp_table_summary';
        //  日期
        var dates = $('#date_demo3').text().split('~');
        paramsObj['param_startDate'] = dates[0].replace(/-/g, '');
        paramsObj['param_endDate'] = dates[1].replace(/-/g, '');

        //  代理商
        paramsObj['param_agency'] = $scope.getAttrs('#param_agency', '.selected');

        //  订单类型
        paramsObj['param_order_type'] = $scope.getAttrs('#param_order_type', '.selected');

        //  产品线
        paramsObj['param_product'] = $scope.getAttrs('#param_product', '.selected');

        //  分端
        paramsObj['param_item'] = $scope.getAttrs('#param_item', '.selected');

        //  os
        paramsObj['param_os'] = $scope.getAttrs('#param_os', '.selected');

        //  分版本
        paramsObj['param_app_version'] = $scope.getAttrs('#param_app_version', '.selected');

        //  出发城市
        paramsObj['param_dep_city'] = $scope.getCityAttr('#param_dep_city');

        //  到达城市
        paramsObj['param_arr_city'] = $scope.getCityAttr('#param_arr_city');

        //  航空公司
        paramsObj['param_airline_name'] = $scope.getCityAttr('#param_airline_name');

        //  舱位类型
        paramsObj['param_class_name'] = $scope.getAttrs('#param_class_name', '.selected');

        paramsObj['param_dep_time'] = '-1';
        //  汇总与对比
        paramsObj['param_agency_split'] = $scope.getSplits('#param_agency');
        paramsObj['param_order_type_split'] = $scope.getSplits('#param_order_type');
        paramsObj['param_product_split'] = $scope.getSplits('#param_product');
        paramsObj['param_item_split'] = $scope.getSplits('#param_item');
        paramsObj['param_os_split'] = $scope.getSplits('#param_os');
        paramsObj['param_app_version_split'] = $scope.getSplits('#param_app_version');
        paramsObj['param_dep_city_split'] = $scope.getSplits('#param_dep_city');
        paramsObj['param_arr_city_split'] = $scope.getSplits('#param_arr_city');
        paramsObj['param_airline_name_split'] = $scope.getSplits('#param_airline_name');
        paramsObj['param_class_name_split'] = $scope.getSplits('#param_class_name');
        paramsObj['param_dep_time_split'] = 'false';

        paramsObj['param_chartIndexes'] = $scope.lsParams || 'all_order_gmv';

        paramsObj['param_tableIndexes'] = $scope.tableIndex || 'all_order_gmv';
        paramsObj['param_pageSize'] = $scope.pageSize || '10';
        paramsObj['param_pageIndex'] = $scope.pageIndex || '0';
        return paramsObj;

    };

    //  获取筛选参数
    $scope.getAttrs = function (idName, ele) {
        var agent = $(idName).children(ele);
        var agentAttr = [];
        agent.each(function (ind, item) {
            agentAttr.push($(item).data("index"));
        });
        return agentAttr.join()
    };

    //  获取 tab选中 和 more更多选中
    $scope.getCityAttr = function (tabId) {
        var strArr = $scope.getAttrs(tabId, ".selected");
        var splitArr;
        if (strArr) {
            splitArr = strArr.split(",");
        }

        var arrTab = [];
        var newArr;
        var selectTab = $(tabId)
            .nextAll(".tabmore_city")
            .children("div.search_text")
            .find("span.selected");
        selectTab.each(function (ind, item) {
            var cur = $(item).data("index");
            if (cur) {
                arrTab.push(cur);
            }
        });
        if (splitArr) {
            return splitArr.concat(arrTab).join();
            //console.log(splitArr.concat(arrTab).join());
        } else {
            return arrTab.join();
            //console.log(arrTab.join());
        }
    };
    //  获取 split
    $scope.getSplits = function (tabId) {
        var paramSplit = {};
        var orderType = $(tabId).nextAll('div.split').find('label.on').data('type');
        return orderType;
    };

    // 汇总 对比
    $('.split').on('click', function (event) {
        event.stopPropagation();
    });

    //  拆分对象 成数组
    $scope.arrObject = function (obj) {
        var arrObj = [], arrTab = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (arrObj.length <= 10) {
                    arrObj.push(obj[key]);
                } else {
                    arrTab.push(obj[key]);
                }

            }
        }
        return {arrObj: arrObj, arrTab: arrTab}
    };

    //  拆分对象
    $scope.splitObject = function (obj) {
        var arrObj = {}, arrTab = {}, count = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (count <= 10) {
                    arrObj[key] = obj[key];
                } else {
                    arrTab[key] = obj[key];
                }
                count++;
            }
        }
        return {arrObj: arrObj, tabObj: arrTab};
    };

    //  更多现显示
    $(document).on('click', function () {
        $('.tabmore_city').hide();
        $('.tabmore_city').children('div.search_text').find('li').show();
        $('.select_alls').removeAttr('checked');
        $('.chart_params').hide();
        $('.table_params').hide();
    });
    $scope.isshowe = function ($event) {
        $event.stopPropagation();
        var tar = $event.target;
        var tabMore = $(tar).parent().nextAll('div.tabmore_city');
        if (tabMore.is(':visible')) {
            tabMore.hide();
        } else {
            $('.tabmore_city').hide();
            $('.select_alls').removeAttr('checked');
            tabMore.show();
        }
    };
    //  tab 多选切换
    //  显示已选择
    $('.tabmore_city').on('click', function (event) {
        event.stopPropagation();
    });
    $scope.selectShow = function ($event) {
        var tar = $event.target;

        var ulist = $(tar).parent().parent().next('div.search_text').find("li");
        if ($scope.selecter) {
            console.log($scope.selecter);
            $(tar).parent('.select_all').next().children('input').val('');
            $.each(ulist, function (index, item) {
                var hasFlag = $(item).children('label').children('input').hasClass('checked');
                if (!hasFlag) {
                    $(item).hide();
                } else {
                    $(item).show();
                }
            })
        } else {
            ulist.show();
        }
    };
    //   更多的 选择控制
    $scope.moreSelect = function ($event) {
        var tar = $event.target;
        var sibling = $(tar).parents('li.query_checks').siblings('li').find('label').children('input');
        var nextSibs = sibling.next();
        var tabSibs = $(tar).parents("div.tabmore_city").prevAll('div.tabOptions').children("span");
        var selectAll = $(tar).parents("div.search_text").prev().find('input.select_alls');
        var moreBtn = $(tar).parents('div.tabmore_city').prevAll('div.tabOptions').find('span.tablist_more');
        var tarSiblins = $(tar).parents('ul').find('input');
        console.log(moreBtn);
        //  单选
        if (!$scope.flag) {
            sibling.removeAttr('checked');
            if ($(tar).hasClass('checked')) {
                $(tar).removeClass('checked').addClass('uncheck');
                $(tar).next("span").removeClass("selected");
                nextSibs.removeClass("selected");
            } else {
                $(tar).addClass('checked').removeClass('uncheck');
                $(tar).next("span").addClass("selected");
                sibling.removeClass('checked').addClass('uncheck');
                nextSibs.removeClass("selected");
                tabSibs.removeClass("selected");
            }
        } else {
            //  多选
            //  全部按钮
            tabSibs.eq(0).removeClass("selected");
            if ($(tar).hasClass('checked')) {
                $(tar).removeClass('checked').addClass('uncheck');
                $(tar).next("span").removeClass("selected");
            } else {
                $(tar).addClass('checked').removeClass('uncheck');
                $(tar).next("span").addClass("selected");
            }
        }
        if (selectAll.is(':checked')) {
            if (!$(tar).hasClass('checked')) {
                $(tar).parents('li.query_checks').hide();
                console.log(34242);
            }
        }
        if (tarSiblins.is(':checked')) {
            moreBtn.addClass('moreSelect');
        } else {
            moreBtn.removeClass('moreSelect')
        }
    };
    //  多选按钮
    $scope.selectTab = function ($event) {
        $event.stopPropagation();
        var tar = $event.target;
        var tarParent = $(tar).parent();
        var tabCity = tarParent.nextAll('.tabmore_city');
        var showTab = tabCity.children('div.search_query').find('input.select_alls');
        var couple = tarParent.next('.couple_selection');
        var searchText = tabCity.children('.search_text');
        var moreInput = searchText.find('input.checked');
        var moreSpan = searchText.find('span.selected');
        var arrSelect = tarParent.siblings().children('span.selected');
        var tabOpt = tarParent.prev('div.tabOptions');
        var tabFlag = tabOpt.attr('badg');
        if (!tabFlag) {
            //  多选
            $(tar).addClass('to_select');
            $(couple).removeClass('move_over');
            $(tar).parent().addClass('to_move');
            $scope.flag = true;
            tabOpt.attr('badg', true);
        } else {
            //  单选
            tabOpt.attr('badg', '');
            $scope.flag = false;
            $(tar).removeClass('to_select');
            $(tar).parent().removeClass('to_move');
            $(couple).addClass('move_over');
            if (arrSelect.length) {
                $.each(arrSelect, function () {
                    $(this).removeClass('selected');
                });
                moreInput.removeClass('checked').addClass('uncheck');
                moreInput.removeAttr('checked');
                moreSpan.removeClass('selected');
                $(arrSelect[0]).addClass('selected');
            } else {
                moreInput.removeClass('checked').addClass('uncheck');
                moreInput.removeAttr('checked');
                moreSpan.removeClass('selected');
                moreInput.eq(0).addClass('checked').attr('checked', 'checked');
                moreInput.eq(0).removeClass('uncheck');
                moreSpan.eq(0).addClass('selected');
            }
        }
    };

    //   搜索
    $scope.searchQuery = function ($name) {
        if ($('.select_alls').is(':checked')) {
            $('.select_alls').removeAttr('checked')
        }
        var query = $name.val();
        var seatchLi = $name.parents('.search_query').next('div.search_text').find('span');
        var text;
        seatchLi.each(function (ind, item) {
            text = $(item).text();
            if (text.indexOf(query) != -1) {
                $(item).parents('li').show();
            } else {
                $(item).parents('li').hide();
            }
        });
    };

    //  出发城市
    $scope.queryChange = function () {
        $scope.searchQuery($('.search_worldr'));
    };
    //  到达城市
    $scope.queryChanger = function () {
        $scope.searchQuery($('.search_worlde'));
    };
    //  航空公司
    $scope.queryChanges = function () {
        $scope.searchQuery($('.search_airlines'));
    };

    //  对比汇总
    $scope.tabSplit = function ($event) {
        var tar = $event.target;
        $(tar).addClass("on").siblings("label").removeClass("on");
    };

    //  查询tab选中
    $scope.tabSelect = function ($event) {
        var tar = $event.target;
        var flag = $(tar).parent().attr("badg");
        var boolea = $(tar).data('index') == -1;
        var tabMoreCity = $(tar).parent().nextAll('div.tabmore_city');
        var moreCity = tabMoreCity.children("div.search_text");
        var moreInput = moreCity.find("input.checked");
        var moreSpan = moreCity.find("span.selected");
        if (tabMoreCity.is(':visible')) {
            $event.stopPropagation();
        }
        //  单选
        if (!$scope.flag || boolea) {
            //  #param_dep_city.span  And  search_text
            $(tar).addClass("selected").siblings("span").removeClass("selected");
            moreInput.removeAttr("checked").removeClass("checked").addClass("uncheck");
            moreSpan.removeClass("selected");
            //  多选
        } else if ($scope.flag && !boolea) {
            var bool = $(tar).hasClass("selected");
            $(tar).parent().find('span').eq(0).removeClass("selected");
            if (bool) {
                $(tar).removeClass("selected")
            } else {
                $(tar).addClass("selected")
            }
        }

    };

    //   查询
    $scope.queryParamData = function () {
        $.ajax({
            //url: '../cp0-charts.json',
            //data: $scope.paramsObj,
            //type: 'GET',
            url: 'http://cp01-rdqa-dev313.cp01.baidu.com:8080/poseidon/core_index?',
            data: $scope.paramsObj,
            type: 'GET',
            dataType: 'jsonp',
            success: function (result) {
                $scope.endLoading();
                if (result.errorNo == 0) {
                    var data = result.data[0].datasets;
                    //   K线图数据
                    if (data['ws_comp_chart']) {
                        var chartData = data['ws_comp_chart'];
                        var categories = chartData['categories'];
                        var dataFormat = chartData['dataFormat'];
                        var series = chartData['series'];
                        if (chartData) {
                            $scope.endLoading();
                        }
                        $scope.Min = chartData.yMin;
                        $scope.getChartdata(categories, series);

                    }
                    //   表格数据
                    if (data['ws_comp_table']) {
                        $scope.timee = $timeout(function () {
                            var tableDatas = data['ws_comp_table'];

                            $scope.tableData = tableDatas.data;
                            $scope.rowCount = tableDatas.rowCount;
                            if (tableDatas.data.length == '0' &&  $scope.rowCount == '0') {
                                $('.pageNum').hide();
                                $('.pointTable').show();
                                $scope.pageNum = 0
                            } else {
                                $('.pageNum').show();
                                $('.pointTable').hide();
                            }
                            $scope.fields = tableDatas.fields;


                            $scope.dataPages($scope.tableData);
                            $scope.pageNum = Math.ceil($scope.rowCount / $scope.totel);
                            if($scope.curPage>= $scope.pageNum){
                                $scope.paramsObj.param_pageSize = $scope.totel;
                                $scope.paramsObj.param_pageIndex = 0;
                                $scope.curPage = 0;
                                $scope.queryParamData();
                                $scope.changeNum(0);
                            }else {
                                $scope.inds = [];
                                for (var i = 0; i < $scope.pageNum; i++) {
                                    $scope.inds.push(i + 1);
                                }
                                $scope.showInd = $scope.pageNum;
                                if($scope.showInd>5){
                                    if($scope.curPage>= $scope.pageNum){
                                        $scope.changeNum(0);
                                        $scope.curPage = 0;
                                        console.log(123132);
                                        $scope.changeNum($scope.curPage);
                                    }
                                }
                                if ($scope.inds.length > 5) {
                                    $scope.inds.pop();
                                }
                                $scope.endLoading();
                            }


                            $timeout.cancel($scope.timee);
                        }, 0);
                    }
                    //   数据总结
                    if (data['ws_comp_table_summary']) {
                        $scope.times = $timeout(function () {
                            var sunmmData = data['ws_comp_table_summary'];
                            if (sunmmData.data.length == '0') {
                                $('.pointSummry').show();
                                return;
                            } else {
                                $('.pointSummry').hide();
                            }
                            $scope.summaryData = sunmmData.data;
                            $scope.summaryFields = sunmmData.fields;
                            //console.log(sunmmData);
                            //console.log( $scope.summaryFields);
                            $timeout.cancel($scope.times);
                        }, 0);
                    }
                }
            },
            error: function (error) {
                //$('.loading').hide();
                $scope.endLoading();
                console.log(error);
            }
        });
    };

    $('.search_data').click(function () {
        $scope.startLoading();
        $scope.everyObj = $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj.param_pageIndex = 0;
        $scope.queryParamData();
        $scope.changeNum(0);

    });
    //  chart数据处理
    $scope.getChartdata = function (categorie, serie) {
        $scope.seriesObj = [];
        $scope.seriesName = [];
        $scope.categories = [];
        //console.log(serie);
        var date;
        $.each(categorie, function (index, item) {
            date = item.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            $scope.categories.push(date);
        });
        //  series
        $(serie).each(function (index, item) {
            $scope.getSeries(item.name, item.data);
        });
        $scope.lintGrp($scope.categories, $scope.seriesObj, $scope.seriesName);
        myChart.setOption(option);
    };

    $scope.getSeries = function (serName, serData) {
        var sersObj = {}, seriesY = [];
        $scope.seriesName.push(serName);
        $(serData).each(function (index, item) {
            seriesY.push(item.y);
        });
        sersObj = {
            name: serName,
            type: 'line',
            label: {
                normal: {
                    show: true,
                    position: 'top'
                }
            },
            //areaStyle: {normal: {}},
            data: seriesY
        };
        $scope.seriesObj.push(sersObj);
    };

    // K线图
    var datas = {};
    var myChart;
    $scope.lintGrp = function (categories, serObj, seriesName) {
        myChart = echarts.init($("#main")[0]);
        option = {
            title: {
                text: ''
            },
//        滑过显示设置
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                    shadowColor: 'blue',
                    color: 'red'
                }
            },
            legend: {
                width: '60%',
                left: '30%'
            },
            //   工具栏
            toolbox: {
                feature: {
                    dataZoom: {
                        //yAxisIndex: 'none'
                        //show:'true'
                    },
                    dataView: {
                        readOnly: false,
                        show: 'true',
                        //   数据视图
                        optionToContent: function (opt) {
                            var axisData = opt.xAxis[0].data;
                            var series = opt.series;
                            var table = '<div style="height: 230px; overflow-y:scroll "><table class="dataTable" style="width:100%;text-align:center"><tbody><tr>'
                                + '<td >日期</td>';
                            for (var g = 0; g < series.length; g++) {
                                table += '<td>' + series[g].name + '</td>'
                            }

                            table += '</tr>';
                            for (var i = 0, l = axisData.length; i < l; i++) {
                                table += '<tr>'
                                    + '<td>' + axisData[i] + '</td>';
                                for (var j = 0, k = series.length; j < k; j++) {
                                    var datas = series[j].data[i] || 0;
                                    table += '<td>' + datas + '</td>'
                                }
                                table += '</tr>';
                            }
                            for (var j = 0, l = series.length; j < l; j++) {
                            }
                            table += '</tbody></table></div>';
                            return table;
                        }
                    },
                    magicType: {type: ['line', 'bar', 'stack', 'tiled']},
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            //  x轴
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: ''
                }
            ],
            //  y轴
            yAxis: [
                {
                    type: 'value',
                    scale: 'true',
                    //   y轴 数据单位
                    axisLabel: {
                        //formatter: '{value} k'
                        formatter: function (value, index) {
                            return value / 1000 + "k";
                        }
                    }
                }
            ],
            //  维度
            series: []
        };
        option.xAxis[0].data = null;
        option.legend['data'] = null;
        option.series = [];
        option.yAxis[0].min = $scope.Min;
        option.xAxis[0].data = categories;
        $(serObj).each(function (index, item) {
            option.series.push(item);
        });
        option.legend['data'] = seriesName;
    };

    $scope.getSerise = function (seriseData) {
        datas.valueData = [];
        $.each(seriseData, function (index, item) {
            datas.valueData.push(item.y);
        });
        // console.log(datas);
    };

    //  分页

    //  导出excel
    $scope.exportExcel = function (){
        if($('.pointTable').is(':visible')) return;
        var  url='http://cp01-rdqa-dev313.cp01.baidu.com:8080/poseidon/core_index?param_export=true';
        var exports = [];
        var paramStr = '';
        var params = $scope.paramsObj;
        for(var key in params){
            if(params.hasOwnProperty(key)){
                exports.push(key+'='+params[key])
            }
        }
        angular.forEach(exports,function (item){
            paramStr+='&'+item;
        });
        console.log(url+paramStr);
        window.location = url+paramStr;

    };



    //  多页码方法 start
    //  查找指定个数哥哥 和 弟弟
    $.fn.extend({
        nexts: function (num) {
            var nextNum = [];
            var next = $(this);
            for (var i = 0; i < num; i++) {
                next = next.next();
                if (next[0]) {
                    nextNum.push(next[0]);
                }
            }
            return $(nextNum);
        },
        prevs: function (num) {
            var prevNum = [];
            var pres = $(this);
            for (var i = 0; i < num; i++) {
                pres = pres.prev();
                if (pres[0]) {
                    prevNum.unshift(pres[0]);
                }
            }
            return $(prevNum);
        },
        //   增加显示隐藏解决 （ng-hide/ng-show 样式权重太大）
        addShow: function () {
            $(this).not('span').addClass('showPage').removeClass('hidePage');
        }
    });

    //  多页码切换
    $scope.changeNum = function (cur) {
        var curPage = $('.pageNum>li').eq(cur);
        curPage.addClass('selected').siblings("li").removeClass("selected");
        if (cur == '0') {
            $('.pageNum>li').not('li:last').not(curPage).addClass('hidePage').removeClass('showPage');
            curPage.addShow();
            curPage.nexts(4).addShow();
            console.log($scope.showInd);
            //return;
        }
        if (cur == $scope.showInd - 3) {
            $('.pageNum>li').not('li:last').not(curPage).addClass('hidePage').removeClass('showPage');
            $('.dot').hide();
            curPage.nexts(1).addShow();
            curPage.prevs(3).addShow();
            return;
        }
        if (cur == $scope.showInd - 2) {
            $('.pageNum>li').not('li:last').addClass('hidePage').removeClass('showPage');
            $('.dot').hide();
            $('.pageNum>li').eq(cur).addShow();
            curPage.prevs(4).addShow();
            return;
        }
        if (cur == $scope.showInd - 1) {
            $('.pageNum>li').not('li:last').addClass('hidePage').removeClass('showPage');
            curPage.prevs(6).addShow();
        }
        if (cur >= 2 && cur <= $scope.showInd - 3) {
            $('.pageNum>li').not('li:last').not(curPage).addClass('hidePage').removeClass('showPage');
            curPage.nexts(2).addShow();
            curPage.prevs(2).addShow();
        }
        if (cur == 1) {
            curPage.prev().addShow();
        }
        if (cur >= $scope.showInd - 4) {
            curPage.nextAll().addShow();
            $('.dot').hide();
        } else if (cur <= $scope.showInd - 5) {
            $('.dot').show();
        }
    };

    $('.condline').click(function (){
        $scope.clickFlag = true;
        console.log($scope.clickFlag);
    });
    $('.date_title').on('click',function (){
        $scope.clickFlag = true;
        console.log($scope.clickFlag);
    });
    $('.opt_sel').on('click',function (){
        $scope.clickFlag = true;
        console.log($scope.clickFlag);
    });

    $scope.pageInde = function () {
        $('.pageList').eq(0).addClass('selected').siblings('li').removeClass('selected');
        //  请求数据
        if ( $scope.curPage == 0 && !$scope.clickFlag )return;
        $scope.curPage = 0;
        $scope.startLoading();
        console.log('第一页:' + $scope.curPage);
        $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj.param_pageIndex = 0;
        $scope.everyObj = $scope.paramsObj;
        $scope.queryParamData();
        $scope.changeNum(0);
        $scope.clickFlag = false;
    };
    $scope.pageLast = function () {
        //  请求数据
        var pageLast = $('.pageList').last();
        pageLast.addClass('selected').siblings('li').removeClass('selected');
        if ( $scope.curPage == $scope.pageNum - 1 && !$scope.clickFlag )return;
        $scope.startLoading();
        $scope.curPage = $scope.pageNum - 1;
        console.log('最后一页:' + $scope.curPage);
        $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj.param_pageIndex = $scope.curPage;
        console.log($scope.curPage);
        $scope.everyObj = $scope.paramsObj;
        $scope.queryParamData();
        $scope.changeNum($scope.curPage);
        $scope.clickFlag = false;
    };
    $scope.curPage = 0;
    $scope.dataPages = function (result) {
        result = $filter('orderBy')(result, 'create_time', false);
        $scope.total = result;
        $.each(result, function (index, item) {
            item.create_time = item.create_time.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
        });
        $scope.pageInfo = result;


        //   上下页切换
        $scope.watchCurpag = function ($event) {
            var tar = $event.target;
            //  下一页

            if (tar.className.toLowerCase() == 'arrownext') {
                $scope.curPage++;
                console.log('下一页:' + $scope.curPage);
                if ($scope.curPage > $scope.showInd - 1) {
                    $scope.curPage = $scope.showInd - 1;
                    return;
                }
                $scope.startLoading();
                if ($scope.showInd > 5) {
                    $scope.changeNum($scope.curPage);
                }
            } else {
                //  上一页
                $scope.curPage--;
                if ($scope.curPage < 0) {
                    $scope.curPage = 0;
                    return;
                }
                console.log('上一页:' + $scope.curPage);
                $scope.startLoading();
                if ($scope.showInd > 5) {
                    $scope.changeNum($scope.curPage);
                }
            }
            $(".pageList").eq($scope.curPage).addClass("selected").siblings("li").removeClass("selected");
            $scope.paramsObj = $scope.getParams();
            $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
            $scope.paramsObj.param_pageSize = $scope.totel;
            $scope.paramsObj.param_pageIndex = $scope.curPage;
            $scope.everyObj = $scope.paramsObj;
            $scope.queryParamData();
        }
    };
    $scope.newVal = function ($event) {
        $scope.startLoading();
        $scope.pageSize = $('.pageSize').val();
        $scope.pageNum = Math.ceil($scope.rowCount / $scope.totel);
        console.log($scope.pageNum);
        $('.pageNum >li').removeClass('selected');
        $('.pageNum >li').eq(0).addClass('selected').addShow();
        $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.pageSize;
        $scope.paramsObj.param_pageIndex = 0;
        //$scope.paramsObj.param_tableIndexes =
        $scope.everyObj = $scope.paramsObj;
        $scope.queryParamData();
        $scope.curPage = 0;
        if( $scope.showInd>5){
            $scope.changeNum(0);
        }

    };
    $scope.pageCount = function ($event) {
        var tar = $event.target;
        var indPage = $(tar).text() - 1;
        console.log($scope.clickFlag);
        if ( $scope.curPage == indPage && !$scope.clickFlag )return;
        $scope.startLoading();
        $(tar).addClass('selected').siblings("li").removeClass("selected");
        $scope.pageSize = $scope.totel;
        $scope.curPage = $scope.pageIndex = indPage;
        console.log('count:' + $scope.curPage);
        //  请求数据
        $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj['param_pageIndex'] = indPage;
        $scope.everyObj = $scope.paramsObj;
        $scope.queryParamData();
        if ($scope.showInd >= 5) {
            $scope.changeNum($(tar).text() - 1);
        }
        $scope.clickFlag = false;
    };


    $http.get('../param_index.json').success(function (data) {
        if (data.errorNo == "0") {
            $scope.tabIndexs = data.tabIndex[0];
        }
    });

    //  选择指标
    $scope.tabChart = function ($event) {
        $('.table_params').hide();
        $event.stopPropagation();
        var tableShow = $('.chart_params').is(':visible');
        if (tableShow) {
            $('.chart_params').hide();
        } else {
            $('.chart_params').show();
        }
    };
    $scope.tabIndes = function ($event) {
        $('.chart_params').hide();
        $event.stopPropagation();
        var tableShow = $('.table_params').is(':visible');
        if (tableShow) {
            $('.table_params').hide();
        } else {
            $('.table_params').show();
        }

    };
    $('.data_params').on('click', function (event) {
        event.stopPropagation();
    });
    //  指标单选多选切换
    $scope.lsChange = function ($event) {
        var tar = $event.target;
        $(tar).addClass('on').siblings('label').removeClass('on');
    };
    $scope.singleTabs = function ($event) {
        var tar = $event.target;
        var lsCheckes = $(tar).parents('div.label_checks').next('ul');
        var selecTab = lsCheckes.find('input:checked');
        selecTab.removeAttr('checked');
        var tarIds = $(tar).parents('div.lsCharts').data('ids');
        $(selecTab[0]).attr('checked', 'checked');
        if ($(selecTab[0]).is(':checked')) {
            $scope.startLoading();
        }
        if (tarIds) {
            $scope.lsParams = $(selecTab[0]).data('index');
            $scope.paramsObj = $scope.getParams();
            $scope.paramsObj.ids = tarIds;
            $scope.queryParamData();
        }


    };
    $scope.changIndexs = function ($event) {

        var tar = $event.target;
        if ($(tar).is(':checked')) {
            $scope.startLoading();
        }
        var lsParam = [];
        var lsChecked;
        var tabLs = $('.lsCharts').find('label.on').children().data('index');
        var siblings = $(tar).parents('li').siblings('li').find('input');
        var ids = $(tar).parents('ul').data('ids');
        if ($scope.tabShowFlag) {
            if ($(tar).is(':visible')) {
                $(tar).parent().hide();
            }
        }
        //  单选
        if (tabLs == 0) {
            siblings.removeAttr('checked');
            lsChecked = $('#param_chartIndexes').find('input:checked');
            angular.forEach(lsChecked, function (item) {
                lsParam.push($(item).data('index'));
            });
            $scope.lsParams = lsParam.join(',');
            //console.log('单选：'+ $scope.lsParams);
        } else {
            //  多选

            lsChecked = $('#param_chartIndexes').find('input:checked');
            angular.forEach(lsChecked, function (item) {
                lsParam.push($(item).data('index'));
            });
            $scope.lsParams = lsParam.join(',');
            //console.log('多选：'+ $scope.lsParams);
        }
        //     查询
        if ($scope.lsParams) {
            $scope.paramsObj = $scope.getParams();
            $scope.paramsObj.ids = ids;
            if($scope.clickFlag){
                $scope.paramsObj.ids = 'ws_comp_chart,ws_comp_table,ws_comp_table_summary';
            }
            $scope.everyObj = $scope.paramsObj;
            $scope.queryParamData();
            $scope.clickFlag = false;
        }
    };

    //  指标显示已选择
    $scope.tabShowFlag = false;
    $scope.tabShowe = function ($event) {
        $scope.tabShowFlag = !$scope.tabShowFlag;
        var tar = $event.target;

        var tabShower = $(tar).parents('div.label_checks').next('ul');
        if ($scope.tabShowFlag) {
            tabShower.find('input').parent().hide();
            tabShower.find('input:checked').parent().show();
        } else {
            tabShower.find('input').parent().show();
        }
    };

    //  table 维度选择
    $scope.changTable = function ($event) {

        var tar = $event.target;
        if ($(tar).is(':checked')) {
            $scope.startLoading();
        }
        var lsParam = [];
        var lsChecked;
        var ids = $(tar).parents('ul').data('ids');
        var tabSibling = $(tar).parents('li').siblings('li').find('input');
        var tabLs = $('.lsTables').find('label.on').children().data('index');

        if (tabLs == '0') {
            tabSibling.removeAttr('checked');
            lsChecked = $('#param_tableIndexes').find('input:checked');
            angular.forEach(lsChecked, function (item) {
                lsParam.push($(item).data('index'));
            });
            $scope.tableIndex = lsParam.join(',');
        } else {
            lsChecked = $('#param_tableIndexes').find('input:checked');
            angular.forEach(lsChecked, function (item) {
                lsParam.push($(item).data('index'));
            });
            $scope.tableIndex = lsParam.join(',');
        }
        if ($scope.tableIndex) {
            $scope.paramsObj = $scope.getParams();
            $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
            if($scope.clickFlag){
                $scope.paramsObj.ids = 'ws_comp_chart,ws_comp_table,ws_comp_table_summary';
            }
            $scope.paramsObj.param_pageSize = $scope.totel;
            $scope.paramsObj.param_pageIndex = $scope.curPage;
            console.log($scope.curPage);
            $scope.everyObj = $scope.paramsObj;
            $scope.queryParamData();
            $scope.clickFlag = false;
        }
    };
    $scope.singleTabe = function ($event) {
        var tar = $event.target;
        var tabPatam = $('#param_tableIndexes').find('input:checked');
        var tabPatams = [];
        tabPatam.removeAttr('checked');
        $(tabPatam[0]).attr('checked', true);
        if ($(tabPatam[0]).is(':checked')) {
            $scope.startLoading();
        }
        $scope.changeNum(0);
        $scope.curPage = 0;
        $scope.tableIndex = $(tabPatam[0]).data('index');
        //  请求数据
        $scope.paramsObj = $scope.getParams();
        console.log($scope.getParams());
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj.param_tableIndexes = $scope.tableIndex;
        $scope.paramsObj['param_pageIndex'] = 0;
        $scope.queryParamData();
    }
}]);





/**
 * Created by Administrator on 2016/8/22.
 */
var options = angular.module('routeApp');
options.controller('context2', ['$scope', '$http', '$timeout', '$filter', function ($scope, $http, $timeout, $filter) {
    //  初始数据
    $scope.startLoading = function () {
        $('.loading').css('top', $(document).scrollTop());
        $('.loading').css('left', $(document).scrollLeft());
        $('.loading').css('width', $(document).outerWidth());
        $('.loading').css('height', $(document).outerHeight());
        $('.loading').show();
    };
    $scope.endLoading = function () {
        if ($('.loading').is(':visible')) {
            $('.loading').hide();
        }
    };
    //  初始 执行加载中
    $scope.startLoading();
    $scope.initData = function () {
        var today = new Date();
        //  补零
        function addZero(date) {
            return ('0' + date).slice(-2);
        }
        //  日期
        today.setDate(today.getDate() - 1);
        $scope.endDate = today.getFullYear() + "" + addZero(today.getMonth() + 1) + "" + addZero(today.getDate());
        today.setMonth(today.getMonth() - 1);
        $scope.startDate = today.getFullYear() + "" + addZero(today.getMonth() + 1) + "" + addZero(today.getDate());
        var reqUrl = 'http://cp01-rdqa-dev313.cp01.baidu.com:8080/poseidon/core_index?';
        $scope.everyObj = {
            ids: 'ws_comp_chart,ws_comp_table,ws_comp_table_summary',
            param_dep_time: -1,
            param_agency: -1,
            param_dep_city: -1,
            param_arr_city: -1,
            param_product: -1,
            param_item: -1,
            param_os: -1,
            param_app_version: -1,
            param_order_type: -1,
            param_airline_name: -1,
            param_class_name: -1,
            param_agency_split: false,
            param_dep_city_split: false,
            param_arr_city_split: false,
            param_product_split: false,
            param_item_split: false,
            param_os_split: false,
            param_app_version_split: false,
            param_order_type_split: false,
            param_airline_name_split: false,
            param_class_name_split: false,
            param_chartIndexes: 'all_order_gmv',
            param_tableIndexes: 'all_order_gmv',
            param_pageSize: 10,
            param_pageIndex: 0,
            param_dep_time_split: false,
            param_startDate: $scope.startDate,
            param_endDate: $scope.endDate
        };
        //  获取初始数据
        $.ajax({
            //$scope.startDate  &param_endDate=$scope.endDate,
            url: reqUrl,
            type: 'get',
            data: $scope.everyObj,
            dataType: 'jsonp',
            success: function (result) {
                if (result.errorNo == 0) {
                    var data = result.data[0].datasets;
                    $('#footer').show();
                    //   K线图数据
                    if (data['ws_comp_chart']) {
                        var chartData = data['ws_comp_chart'];
                        var categories = chartData['categories'];
                        var dataFormat = chartData['dataFormat'];
                        var series = chartData['series'];
                        $scope.Min = chartData.yMin;
                        $scope.getChartdata(categories, series);
                    }
                    //   表格数据
                    if (data['ws_comp_table']) {
                        $scope.timee = $timeout(function () {
                            var tableDatas = data['ws_comp_table'];
                            if (tableDatas.data.length == '0') {
                                $('.pointTable').show();
                                $('.pageNum').hide();
                                $scope.tableData = '';
                                $scope.fields = '';
                                $scope.dataPages($scope.tableData);
                                return;
                            } else {
                                $('.pointTable').hide();
                                $('.pageNum').show();
                            }
                            $scope.tableData = tableDatas.data;
                            $scope.rowCount = tableDatas.rowCount;
                            $scope.fields = tableDatas.fields;
                            //  数据处理
                            $scope.dataPages($scope.tableData);
                            //  页码计算
                            $scope.pageNum = Math.ceil($scope.rowCount / $scope.totel);
                            $scope.inds = [];
                            for (var i = 0; i < $scope.pageNum; i++) {
                                $scope.inds.push(i + 1);
                            }
                            $scope.showInd = $scope.pageNum;
                            if ($scope.inds.length > 5) {
                                $scope.inds.pop();
                                $('.pageNum').children().last().data('index', $scope.pageNum - 1);
                            }

                            $timeout.cancel($scope.timee);
                        }, 0);
                    }
                    //   数据总结
                    if (data['ws_comp_table_summary']) {
                        $scope.times = $timeout(function () {
                            var sunmmData = data['ws_comp_table_summary'];
                            if (sunmmData.data.length == '0') {
                                $('.pointSummry').show();
                                return;
                            }
                            console.log(sunmmData);
                            $scope.summaryData = sunmmData.data;
                            $scope.summaryFields = sunmmData.fields;
                            $timeout.cancel($scope.times);
                        }, 0);
                    }
                }
            },
            error: function (error) {
                $('.pointTable').show();
                $('.pointSummry').show();
            }
        })
    };
    $scope.initData();

    //  最近日期选中
    $('.latestDate>a').on('click',function(){
        $(this).addClass('select').siblings('a').removeClass('select')
    });
    $scope.orderTable = function (key) {
        $scope.order = key;
        $scope.reverse = !$scope.reverse;
        console.log($scope.reverse);
    };
    //  获取查询条件
    $.ajax({
        url: 'http://cp01-rdqa-dev313.cp01.baidu.com:8080/poseidon/create_json?',
        type: 'get',
        dataType: 'jsonp',
        //url: '../cp1-creatData.json',
        //type: 'get',
        success: function (result) {
            if (result.errorNo === 0) {
                var data = result.data;
                //  订单类型 -1
                $scope.timer = $timeout(function () {
                    //    订单类型
                    $scope.order_type = data.order_type;
                    //    代理商 -1
                    $scope.agency = data.agency;
                    //    产品线
                    $scope.product = data.product;
                    //    分端
                    $scope.item = data.item;
                    //    os
                    $scope.os = data.os;
                    //    version
                    $scope.app_version = data.app_version;
                    //    出发城市
                    $scope.dep_city = data.dep_city;
                    $scope.depCitys = $scope.arrObject($scope.dep_city);
                    //     到达城市
                    $scope.arr_city = data.arr_city;
                    $scope.arrCitys = $scope.arrObject(data.arr_city);
                    //     航空公司
                    $scope.airline_name = data.airline_name;
                    $scope.airlines = $scope.arrObject(data.airline_name);
                    //     舱位类型
                    $scope.class_name = data.class_name;

                    $('.tablist_more').show();
                    $scope.endLoading();
                    $timeout.cancel($scope.timer);
                }, 0);

            }
        }
    });

    //  获取查询参数
    $scope.getParams = function () {
        var paramsObj = {};
        // ids
        paramsObj.ids = 'ws_comp_chart,ws_comp_table,ws_comp_table_summary';
        //  日期
        var dates = $('#date_demo3').text().split('~');
        paramsObj['param_startDate'] = dates[0].replace(/-/g, '');
        paramsObj['param_endDate'] = dates[1].replace(/-/g, '');

        //  代理商
        paramsObj['param_agency'] = $scope.getAttrs('#param_agency', '.selected');

        //  订单类型
        paramsObj['param_order_type'] = $scope.getAttrs('#param_order_type', '.selected');

        //  产品线
        paramsObj['param_product'] = $scope.getAttrs('#param_product', '.selected');

        //  分端
        paramsObj['param_item'] = $scope.getAttrs('#param_item', '.selected');

        //  os
        paramsObj['param_os'] = $scope.getAttrs('#param_os', '.selected');

        //  分版本
        paramsObj['param_app_version'] = $scope.getAttrs('#param_app_version', '.selected');

        //  出发城市
        paramsObj['param_dep_city'] = $scope.getCityAttr('#param_dep_city');

        //  到达城市
        paramsObj['param_arr_city'] = $scope.getCityAttr('#param_arr_city');

        //  航空公司
        paramsObj['param_airline_name'] = $scope.getCityAttr('#param_airline_name');

        //  舱位类型
        paramsObj['param_class_name'] = $scope.getAttrs('#param_class_name', '.selected');

        paramsObj['param_dep_time'] = '-1';
        //  汇总与对比
        paramsObj['param_agency_split'] = $scope.getSplits('#param_agency');
        paramsObj['param_order_type_split'] = $scope.getSplits('#param_order_type');
        paramsObj['param_product_split'] = $scope.getSplits('#param_product');
        paramsObj['param_item_split'] = $scope.getSplits('#param_item');
        paramsObj['param_os_split'] = $scope.getSplits('#param_os');
        paramsObj['param_app_version_split'] = $scope.getSplits('#param_app_version');
        paramsObj['param_dep_city_split'] = $scope.getSplits('#param_dep_city');
        paramsObj['param_arr_city_split'] = $scope.getSplits('#param_arr_city');
        paramsObj['param_airline_name_split'] = $scope.getSplits('#param_airline_name');
        paramsObj['param_class_name_split'] = $scope.getSplits('#param_class_name');
        paramsObj['param_dep_time_split'] = 'false';

        paramsObj['param_chartIndexes'] = $scope.lsParams || 'all_order_gmv';

        paramsObj['param_tableIndexes'] = $scope.tableIndex || 'all_order_gmv';
        paramsObj['param_pageSize'] = $scope.pageSize || '10';
        paramsObj['param_pageIndex'] = $scope.pageIndex || '0';
        return paramsObj;

    };

    //  获取筛选参数
    $scope.getAttrs = function (idName, ele) {
        var agent = $(idName).children(ele);
        var agentAttr = [];
        agent.each(function (ind, item) {
            agentAttr.push($(item).data("index"));
        });
        return agentAttr.join()
    };

    //  获取 tab选中 和 more更多选中
    $scope.getCityAttr = function (tabId) {
        var strArr = $scope.getAttrs(tabId, ".selected");
        var splitArr;
        if (strArr) {
            splitArr = strArr.split(",");
        }

        var arrTab = [];
        var newArr;
        var selectTab = $(tabId)
            .nextAll(".tabmore_city")
            .children("div.search_text")
            .find("span.selected");
        selectTab.each(function (ind, item) {
            var cur = $(item).data("index");
            if (cur) {
                arrTab.push(cur);
            }
        });
        if (splitArr) {
            return splitArr.concat(arrTab).join();
            //console.log(splitArr.concat(arrTab).join());
        } else {
            return arrTab.join();
            //console.log(arrTab.join());
        }
    };
    //  获取 split
    $scope.getSplits = function (tabId) {
        var paramSplit = {};
        var orderType = $(tabId).nextAll('div.split').find('label.on').data('type');
        return orderType;
    };

    // 汇总 对比
    $('.split').on('click', function (event) {
        event.stopPropagation();
    });

    //  拆分对象 成数组
    $scope.arrObject = function (obj) {
        var arrObj = [], arrTab = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (arrObj.length <= 10) {
                    arrObj.push(obj[key]);
                } else {
                    arrTab.push(obj[key]);
                }

            }
        }
        return {arrObj: arrObj, arrTab: arrTab}
    };

    //  拆分对象
    $scope.splitObject = function (obj) {
        var arrObj = {}, arrTab = {}, count = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (count <= 10) {
                    arrObj[key] = obj[key];
                } else {
                    arrTab[key] = obj[key];
                }
                count++;
            }
        }
        return {arrObj: arrObj, tabObj: arrTab};
    };

    //  更多现显示
    $(document).on('click', function () {
        $('.tabmore_city').hide();
        $('.tabmore_city').children('div.search_text').find('li').show();
        $('.select_alls').removeAttr('checked');
        $('.chart_params').hide();
        $('.table_params').hide();
    });
    $scope.isshowe = function ($event) {
        $event.stopPropagation();
        var tar = $event.target;
        var tabMore = $(tar).parent().nextAll('div.tabmore_city');
        if (tabMore.is(':visible')) {
            tabMore.hide();
        } else {
            $('.tabmore_city').hide();
            $('.select_alls').removeAttr('checked');
            tabMore.show();
        }
    };
    //  tab 多选切换
    //  显示已选择
    $('.tabmore_city').on('click', function (event) {
        event.stopPropagation();
    });
    $scope.selectShow = function ($event) {
        var tar = $event.target;

        var ulist = $(tar).parent().parent().next('div.search_text').find("li");
        if ($scope.selecter) {
            console.log($scope.selecter);
            $(tar).parent('.select_all').next().children('input').val('');
            $.each(ulist, function (index, item) {
                var hasFlag = $(item).children('label').children('input').hasClass('checked');
                if (!hasFlag) {
                    $(item).hide();
                } else {
                    $(item).show();
                }
            })
        } else {
            ulist.show();
        }
    };
    //   更多的 选择控制
    $scope.moreSelect = function ($event) {
        var tar = $event.target;
        var sibling = $(tar).parents('li.query_checks').siblings('li').find('label').children('input');
        var nextSibs = sibling.next();
        var tabSibs = $(tar).parents("div.tabmore_city").prevAll('div.tabOptions').children("span");
        var selectAll = $(tar).parents("div.search_text").prev().find('input.select_alls');
        var moreBtn = $(tar).parents('div.tabmore_city').prevAll('div.tabOptions').find('span.tablist_more');
        var tarSiblins = $(tar).parents('ul').find('input');
        console.log(moreBtn);
        //  单选
        if (!$scope.flag) {
            sibling.removeAttr('checked');
            if ($(tar).hasClass('checked')) {
                $(tar).removeClass('checked').addClass('uncheck');
                $(tar).next("span").removeClass("selected");
                nextSibs.removeClass("selected");
            } else {
                $(tar).addClass('checked').removeClass('uncheck');
                $(tar).next("span").addClass("selected");
                sibling.removeClass('checked').addClass('uncheck');
                nextSibs.removeClass("selected");
                tabSibs.removeClass("selected");
            }
        } else {
            //  多选
            //  全部按钮
            tabSibs.eq(0).removeClass("selected");
            if ($(tar).hasClass('checked')) {
                $(tar).removeClass('checked').addClass('uncheck');
                $(tar).next("span").removeClass("selected");
            } else {
                $(tar).addClass('checked').removeClass('uncheck');
                $(tar).next("span").addClass("selected");
            }
        }
        if (selectAll.is(':checked')) {
            if (!$(tar).hasClass('checked')) {
                $(tar).parents('li.query_checks').hide();
                console.log(34242);
            }
        }
        if (tarSiblins.is(':checked')) {
            moreBtn.addClass('moreSelect');
        } else {
            moreBtn.removeClass('moreSelect')
        }
    };
    //  多选按钮
    $scope.selectTab = function ($event) {
        $event.stopPropagation();
        var tar = $event.target;
        var tarParent = $(tar).parent();
        var tabCity = tarParent.nextAll('.tabmore_city');
        var showTab = tabCity.children('div.search_query').find('input.select_alls');
        var couple = tarParent.next('.couple_selection');
        var searchText = tabCity.children('.search_text');
        var moreInput = searchText.find('input.checked');
        var moreSpan = searchText.find('span.selected');
        var arrSelect = tarParent.siblings().children('span.selected');
        var tabOpt = tarParent.prev('div.tabOptions');
        var tabFlag = tabOpt.attr('badg');
        if (!tabFlag) {
            //  多选
            $(tar).addClass('to_select');
            $(couple).removeClass('move_over');
            $(tar).parent().addClass('to_move');
            $scope.flag = true;
            tabOpt.attr('badg', true);
        } else {
            //  单选
            tabOpt.attr('badg', '');
            $scope.flag = false;
            $(tar).removeClass('to_select');
            $(tar).parent().removeClass('to_move');
            $(couple).addClass('move_over');
            if (arrSelect.length) {
                $.each(arrSelect, function () {
                    $(this).removeClass('selected');
                });
                moreInput.removeClass('checked').addClass('uncheck');
                moreInput.removeAttr('checked');
                moreSpan.removeClass('selected');
                $(arrSelect[0]).addClass('selected');
            } else {
                moreInput.removeClass('checked').addClass('uncheck');
                moreInput.removeAttr('checked');
                moreSpan.removeClass('selected');
                moreInput.eq(0).addClass('checked').attr('checked', 'checked');
                moreInput.eq(0).removeClass('uncheck');
                moreSpan.eq(0).addClass('selected');
            }
        }
    };

    //   搜索
    $scope.searchQuery = function ($name) {
        if ($('.select_alls').is(':checked')) {
            $('.select_alls').removeAttr('checked')
        }
        var query = $name.val();
        var seatchLi = $name.parents('.search_query').next('div.search_text').find('span');
        var text;
        seatchLi.each(function (ind, item) {
            text = $(item).text();
            if (text.indexOf(query) != -1) {
                $(item).parents('li').show();
            } else {
                $(item).parents('li').hide();
            }
        });
    };

    //  出发城市
    $scope.queryChange = function () {
        $scope.searchQuery($('.search_worldr'));
    };
    //  到达城市
    $scope.queryChanger = function () {
        $scope.searchQuery($('.search_worlde'));
    };
    //  航空公司
    $scope.queryChanges = function () {
        $scope.searchQuery($('.search_airlines'));
    };

    //  对比汇总
    $scope.tabSplit = function ($event) {
        var tar = $event.target;
        $(tar).addClass("on").siblings("label").removeClass("on");
    };

    //  查询tab选中
    $scope.tabSelect = function ($event) {
        var tar = $event.target;
        var flag = $(tar).parent().attr("badg");
        var boolea = $(tar).data('index') == -1;
        var tabMoreCity = $(tar).parent().nextAll('div.tabmore_city');
        var moreCity = tabMoreCity.children("div.search_text");
        var moreInput = moreCity.find("input.checked");
        var moreSpan = moreCity.find("span.selected");
        if (tabMoreCity.is(':visible')) {
            $event.stopPropagation();
        }
        //  单选
        if (!$scope.flag || boolea) {
            //  #param_dep_city.span  And  search_text
            $(tar).addClass("selected").siblings("span").removeClass("selected");
            moreInput.removeAttr("checked").removeClass("checked").addClass("uncheck");
            moreSpan.removeClass("selected");
            //  多选
        } else if ($scope.flag && !boolea) {
            var bool = $(tar).hasClass("selected");
            $(tar).parent().find('span').eq(0).removeClass("selected");
            if (bool) {
                $(tar).removeClass("selected")
            } else {
                $(tar).addClass("selected")
            }
        }

    };

    //   查询
    $scope.queryParamData = function () {
        $.ajax({
            //url: '../cp0-charts.json',
            //data: $scope.paramsObj,
            //type: 'GET',
            url: 'http://cp01-rdqa-dev313.cp01.baidu.com:8080/poseidon/core_index?',
            data: $scope.paramsObj,
            type: 'GET',
            dataType: 'jsonp',
            success: function (result) {
                $scope.endLoading();
                if (result.errorNo == 0) {
                    var data = result.data[0].datasets;
                    //   K线图数据
                    if (data['ws_comp_chart']) {
                        var chartData = data['ws_comp_chart'];
                        var categories = chartData['categories'];
                        var dataFormat = chartData['dataFormat'];
                        var series = chartData['series'];
                        if (chartData) {
                            $scope.endLoading();
                        }
                        $scope.Min = chartData.yMin;
                        $scope.getChartdata(categories, series);

                    }
                    //   表格数据
                    if (data['ws_comp_table']) {
                        $scope.timee = $timeout(function () {
                            var tableDatas = data['ws_comp_table'];

                            $scope.tableData = tableDatas.data;
                            $scope.rowCount = tableDatas.rowCount;
                            if (tableDatas.data.length == '0' &&  $scope.rowCount == '0') {
                                $('.pageNum').hide();
                                $('.pointTable').show();
                                $scope.pageNum = 0
                            } else {
                                $('.pageNum').show();
                                $('.pointTable').hide();
                            }
                            $scope.fields = tableDatas.fields;


                            $scope.dataPages($scope.tableData);
                            $scope.pageNum = Math.ceil($scope.rowCount / $scope.totel);
                            if($scope.curPage>= $scope.pageNum){
                                $scope.paramsObj.param_pageSize = $scope.totel;
                                $scope.paramsObj.param_pageIndex = 0;
                                $scope.curPage = 0;
                                $scope.queryParamData();
                                $scope.changeNum(0);
                            }else {
                                $scope.inds = [];
                                for (var i = 0; i < $scope.pageNum; i++) {
                                    $scope.inds.push(i + 1);
                                }
                                $scope.showInd = $scope.pageNum;
                                if($scope.showInd>5){
                                    if($scope.curPage>= $scope.pageNum){
                                        $scope.changeNum(0);
                                        $scope.curPage = 0;
                                        console.log(123132);
                                        $scope.changeNum($scope.curPage);
                                    }
                                }
                                if ($scope.inds.length > 5) {
                                    $scope.inds.pop();
                                }
                                $scope.endLoading();
                            }


                            $timeout.cancel($scope.timee);
                        }, 0);
                    }
                    //   数据总结
                    if (data['ws_comp_table_summary']) {
                        $scope.times = $timeout(function () {
                            var sunmmData = data['ws_comp_table_summary'];
                            if (sunmmData.data.length == '0') {
                                $('.pointSummry').show();
                                return;
                            } else {
                                $('.pointSummry').hide();
                            }
                            $scope.summaryData = sunmmData.data;
                            $scope.summaryFields = sunmmData.fields;
                            //console.log(sunmmData);
                            //console.log( $scope.summaryFields);
                            $timeout.cancel($scope.times);
                        }, 0);
                    }
                }
            },
            error: function (error) {
                //$('.loading').hide();
                $scope.endLoading();
                console.log(error);
            }
        });
    };

    $('.search_data').click(function () {
        $scope.startLoading();
        $scope.everyObj = $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj.param_pageIndex = 0;
        $scope.queryParamData();
        $scope.changeNum(0);

    });
    //  chart数据处理
    $scope.getChartdata = function (categorie, serie) {
        $scope.seriesObj = [];
        $scope.seriesName = [];
        $scope.categories = [];
        //console.log(serie);
        var date;
        $.each(categorie, function (index, item) {
            date = item.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
            $scope.categories.push(date);
        });
        //  series
        $(serie).each(function (index, item) {
            $scope.getSeries(item.name, item.data);
        });
        $scope.lintGrp($scope.categories, $scope.seriesObj, $scope.seriesName);
        myChart.setOption(option);
    };

    $scope.getSeries = function (serName, serData) {
        var sersObj = {}, seriesY = [];
        $scope.seriesName.push(serName);
        $(serData).each(function (index, item) {
            seriesY.push(item.y);
        });
        sersObj = {
            name: serName,
            type: 'line',
            label: {
                normal: {
                    show: true,
                    position: 'top'
                }
            },
            //areaStyle: {normal: {}},
            data: seriesY
        };
        $scope.seriesObj.push(sersObj);
    };

    // K线图
    var datas = {};
    var myChart;
    $scope.lintGrp = function (categories, serObj, seriesName) {
        myChart = echarts.init($("#main")[0]);
        option = {
            title: {
                text: ''
            },
//        滑过显示设置
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                    shadowColor: 'blue',
                    color: 'red'
                }
            },
            legend: {
                width: '60%',
                left: '30%'
            },
            //   工具栏
            toolbox: {
                feature: {
                    dataZoom: {
                        //yAxisIndex: 'none'
                        //show:'true'
                    },
                    dataView: {
                        readOnly: false,
                        show: 'true',
                        //   数据视图
                        optionToContent: function (opt) {
                            var axisData = opt.xAxis[0].data;
                            var series = opt.series;
                            var table = '<div style="height: 230px; overflow-y:scroll "><table class="dataTable" style="width:100%;text-align:center"><tbody><tr>'
                                + '<td >日期</td>';
                            for (var g = 0; g < series.length; g++) {
                                table += '<td>' + series[g].name + '</td>'
                            }

                            table += '</tr>';
                            for (var i = 0, l = axisData.length; i < l; i++) {
                                table += '<tr>'
                                    + '<td>' + axisData[i] + '</td>';
                                for (var j = 0, k = series.length; j < k; j++) {
                                    var datas = series[j].data[i] || 0;
                                    table += '<td>' + datas + '</td>'
                                }
                                table += '</tr>';
                            }
                            for (var j = 0, l = series.length; j < l; j++) {
                            }
                            table += '</tbody></table></div>';
                            return table;
                        }
                    },
                    magicType: {type: ['line', 'bar', 'stack', 'tiled']},
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            //  x轴
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: ''
                }
            ],
            //  y轴
            yAxis: [
                {
                    type: 'value',
                    scale: 'true',
                    //   y轴 数据单位
                    axisLabel: {
                        //formatter: '{value} k'
                        formatter: function (value, index) {
                            return value / 1000 + "k";
                        }
                    }
                }
            ],
            //  维度
            series: []
        };
        option.xAxis[0].data = null;
        option.legend['data'] = null;
        option.series = [];
        option.yAxis[0].min = $scope.Min;
        option.xAxis[0].data = categories;
        $(serObj).each(function (index, item) {
            option.series.push(item);
        });
        option.legend['data'] = seriesName;
    };

    $scope.getSerise = function (seriseData) {
        datas.valueData = [];
        $.each(seriseData, function (index, item) {
            datas.valueData.push(item.y);
        });
        // console.log(datas);
    };

    //  分页

    //  导出excel
    $scope.exportExcel = function (){
        if($('.pointTable').is(':visible')) return;
        var  url='http://cp01-rdqa-dev313.cp01.baidu.com:8080/poseidon/core_index?param_export=true';
        var exports = [];
        var paramStr = '';
        var params = $scope.paramsObj;
        for(var key in params){
            if(params.hasOwnProperty(key)){
                exports.push(key+'='+params[key])
            }
        }
        angular.forEach(exports,function (item){
            paramStr+='&'+item;
        });
        console.log(url+paramStr);
        window.location = url+paramStr;

    };



    //  多页码方法 start
    //  查找指定个数哥哥 和 弟弟
    $.fn.extend({
        nexts: function (num) {
            var nextNum = [];
            var next = $(this);
            for (var i = 0; i < num; i++) {
                next = next.next();
                if (next[0]) {
                    nextNum.push(next[0]);
                }
            }
            return $(nextNum);
        },
        prevs: function (num) {
            var prevNum = [];
            var pres = $(this);
            for (var i = 0; i < num; i++) {
                pres = pres.prev();
                if (pres[0]) {
                    prevNum.unshift(pres[0]);
                }
            }
            return $(prevNum);
        },
        //   增加显示隐藏解决 （ng-hide/ng-show 样式权重太大）
        addShow: function () {
            $(this).not('span').addClass('showPage').removeClass('hidePage');
        }
    });

    //  多页码切换
    $scope.changeNum = function (cur) {
        var curPage = $('.pageNum>li').eq(cur);
        curPage.addClass('selected').siblings("li").removeClass("selected");
        if (cur == '0') {
            $('.pageNum>li').not('li:last').not(curPage).addClass('hidePage').removeClass('showPage');
            curPage.addShow();
            curPage.nexts(4).addShow();
            console.log($scope.showInd);
            //return;
        }
        if (cur == $scope.showInd - 3) {
            $('.pageNum>li').not('li:last').not(curPage).addClass('hidePage').removeClass('showPage');
            $('.dot').hide();
            curPage.nexts(1).addShow();
            curPage.prevs(3).addShow();
            return;
        }
        if (cur == $scope.showInd - 2) {
            $('.pageNum>li').not('li:last').addClass('hidePage').removeClass('showPage');
            $('.dot').hide();
            $('.pageNum>li').eq(cur).addShow();
            curPage.prevs(4).addShow();
            return;
        }
        if (cur == $scope.showInd - 1) {
            $('.pageNum>li').not('li:last').addClass('hidePage').removeClass('showPage');
            curPage.prevs(6).addShow();
        }
        if (cur >= 2 && cur <= $scope.showInd - 3) {
            $('.pageNum>li').not('li:last').not(curPage).addClass('hidePage').removeClass('showPage');
            curPage.nexts(2).addShow();
            curPage.prevs(2).addShow();
        }
        if (cur == 1) {
            curPage.prev().addShow();
        }
        if (cur >= $scope.showInd - 4) {
            curPage.nextAll().addShow();
            $('.dot').hide();
        } else if (cur <= $scope.showInd - 5) {
            $('.dot').show();
        }
    };

    $('.condline').click(function (){
        $scope.clickFlag = true;
        console.log($scope.clickFlag);
    });
    $('.date_title').on('click',function (){
        $scope.clickFlag = true;
        console.log($scope.clickFlag);
    });
    $('.opt_sel').on('click',function (){
        $scope.clickFlag = true;
        console.log($scope.clickFlag);
    });

    $scope.pageInde = function () {
        $('.pageList').eq(0).addClass('selected').siblings('li').removeClass('selected');
        //  请求数据
        if ( $scope.curPage == 0 && !$scope.clickFlag )return;
        $scope.curPage = 0;
        $scope.startLoading();
        console.log('第一页:' + $scope.curPage);
        $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj.param_pageIndex = 0;
        $scope.everyObj = $scope.paramsObj;
        $scope.queryParamData();
        $scope.changeNum(0);
        $scope.clickFlag = false;
    };
    $scope.pageLast = function () {
        //  请求数据
        var pageLast = $('.pageList').last();
        pageLast.addClass('selected').siblings('li').removeClass('selected');
        if ( $scope.curPage == $scope.pageNum - 1 && !$scope.clickFlag )return;
        $scope.startLoading();
        $scope.curPage = $scope.pageNum - 1;
        console.log('最后一页:' + $scope.curPage);
        $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj.param_pageIndex = $scope.curPage;
        console.log($scope.curPage);
        $scope.everyObj = $scope.paramsObj;
        $scope.queryParamData();
        $scope.changeNum($scope.curPage);
        $scope.clickFlag = false;
    };
    $scope.curPage = 0;
    $scope.dataPages = function (result) {
        result = $filter('orderBy')(result, 'create_time', false);
        $scope.total = result;
        $.each(result, function (index, item) {
            item.create_time = item.create_time.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3');
        });
        $scope.pageInfo = result;


        //   上下页切换
        $scope.watchCurpag = function ($event) {
            var tar = $event.target;
            //  下一页

            if (tar.className.toLowerCase() == 'arrownext') {
                $scope.curPage++;
                console.log('下一页:' + $scope.curPage);
                if ($scope.curPage > $scope.showInd - 1) {
                    $scope.curPage = $scope.showInd - 1;
                    return;
                }
                $scope.startLoading();
                if ($scope.showInd > 5) {
                    $scope.changeNum($scope.curPage);
                }
            } else {
                //  上一页
                $scope.curPage--;
                if ($scope.curPage < 0) {
                    $scope.curPage = 0;
                    return;
                }
                console.log('上一页:' + $scope.curPage);
                $scope.startLoading();
                if ($scope.showInd > 5) {
                    $scope.changeNum($scope.curPage);
                }
            }
            $(".pageList").eq($scope.curPage).addClass("selected").siblings("li").removeClass("selected");
            $scope.paramsObj = $scope.getParams();
            $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
            $scope.paramsObj.param_pageSize = $scope.totel;
            $scope.paramsObj.param_pageIndex = $scope.curPage;
            $scope.everyObj = $scope.paramsObj;
            $scope.queryParamData();
        }
    };
    $scope.newVal = function ($event) {
        $scope.startLoading();
        $scope.pageSize = $('.pageSize').val();
        $scope.pageNum = Math.ceil($scope.rowCount / $scope.totel);
        console.log($scope.pageNum);
        $('.pageNum >li').removeClass('selected');
        $('.pageNum >li').eq(0).addClass('selected').addShow();
        $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.pageSize;
        $scope.paramsObj.param_pageIndex = 0;
        //$scope.paramsObj.param_tableIndexes =
        $scope.everyObj = $scope.paramsObj;
        $scope.queryParamData();
        $scope.curPage = 0;
        if( $scope.showInd>5){
            $scope.changeNum(0);
        }

    };
    $scope.pageCount = function ($event) {
        var tar = $event.target;
        var indPage = $(tar).text() - 1;
        console.log($scope.clickFlag);
        if ( $scope.curPage == indPage && !$scope.clickFlag )return;
        $scope.startLoading();
        $(tar).addClass('selected').siblings("li").removeClass("selected");
        $scope.pageSize = $scope.totel;
        $scope.curPage = $scope.pageIndex = indPage;
        console.log('count:' + $scope.curPage);
        //  请求数据
        $scope.paramsObj = $scope.getParams();
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj['param_pageIndex'] = indPage;
        $scope.everyObj = $scope.paramsObj;
        $scope.queryParamData();
        if ($scope.showInd >= 5) {
            $scope.changeNum($(tar).text() - 1);
        }
        $scope.clickFlag = false;
    };


    $http.get('../param_index.json').success(function (data) {
        if (data.errorNo == "0") {
            $scope.tabIndexs = data.tabIndex[0];
        }
    });

    //  选择指标
    $scope.tabChart = function ($event) {
        $('.table_params').hide();
        $event.stopPropagation();
        var tableShow = $('.chart_params').is(':visible');
        if (tableShow) {
            $('.chart_params').hide();
        } else {
            $('.chart_params').show();
        }
    };
    $scope.tabIndes = function ($event) {
        $('.chart_params').hide();
        $event.stopPropagation();
        var tableShow = $('.table_params').is(':visible');
        if (tableShow) {
            $('.table_params').hide();
        } else {
            $('.table_params').show();
        }

    };
    $('.data_params').on('click', function (event) {
        event.stopPropagation();
    });
    //  指标单选多选切换
    $scope.lsChange = function ($event) {
        var tar = $event.target;
        $(tar).addClass('on').siblings('label').removeClass('on');
    };
    $scope.singleTabs = function ($event) {
        var tar = $event.target;
        var lsCheckes = $(tar).parents('div.label_checks').next('ul');
        var selecTab = lsCheckes.find('input:checked');
        selecTab.removeAttr('checked');
        var tarIds = $(tar).parents('div.lsCharts').data('ids');
        $(selecTab[0]).attr('checked', 'checked');
        if ($(selecTab[0]).is(':checked')) {
            $scope.startLoading();
        }
        if (tarIds) {
            $scope.lsParams = $(selecTab[0]).data('index');
            $scope.paramsObj = $scope.getParams();
            $scope.paramsObj.ids = tarIds;
            $scope.queryParamData();
        }


    };
    $scope.changIndexs = function ($event) {

        var tar = $event.target;
        if ($(tar).is(':checked')) {
            $scope.startLoading();
        }
        var lsParam = [];
        var lsChecked;
        var tabLs = $('.lsCharts').find('label.on').children().data('index');
        var siblings = $(tar).parents('li').siblings('li').find('input');
        var ids = $(tar).parents('ul').data('ids');
        if ($scope.tabShowFlag) {
            if ($(tar).is(':visible')) {
                $(tar).parent().hide();
            }
        }
        //  单选
        if (tabLs == 0) {
            siblings.removeAttr('checked');
            lsChecked = $('#param_chartIndexes').find('input:checked');
            angular.forEach(lsChecked, function (item) {
                lsParam.push($(item).data('index'));
            });
            $scope.lsParams = lsParam.join(',');
            //console.log('单选：'+ $scope.lsParams);
        } else {
            //  多选

            lsChecked = $('#param_chartIndexes').find('input:checked');
            angular.forEach(lsChecked, function (item) {
                lsParam.push($(item).data('index'));
            });
            $scope.lsParams = lsParam.join(',');
            //console.log('多选：'+ $scope.lsParams);
        }
        //     查询
        if ($scope.lsParams) {
            $scope.paramsObj = $scope.getParams();
            $scope.paramsObj.ids = ids;
            if($scope.clickFlag){
                $scope.paramsObj.ids = 'ws_comp_chart,ws_comp_table,ws_comp_table_summary';
            }
            $scope.everyObj = $scope.paramsObj;
            $scope.queryParamData();
            $scope.clickFlag = false;
        }
    };

    //  指标显示已选择
    $scope.tabShowFlag = false;
    $scope.tabShowe = function ($event) {
        $scope.tabShowFlag = !$scope.tabShowFlag;
        var tar = $event.target;

        var tabShower = $(tar).parents('div.label_checks').next('ul');
        if ($scope.tabShowFlag) {
            tabShower.find('input').parent().hide();
            tabShower.find('input:checked').parent().show();
        } else {
            tabShower.find('input').parent().show();
        }
    };

    //  table 维度选择
    $scope.changTable = function ($event) {

        var tar = $event.target;
        if ($(tar).is(':checked')) {
            $scope.startLoading();
        }
        var lsParam = [];
        var lsChecked;
        var ids = $(tar).parents('ul').data('ids');
        var tabSibling = $(tar).parents('li').siblings('li').find('input');
        var tabLs = $('.lsTables').find('label.on').children().data('index');

        if (tabLs == '0') {
            tabSibling.removeAttr('checked');
            lsChecked = $('#param_tableIndexes').find('input:checked');
            angular.forEach(lsChecked, function (item) {
                lsParam.push($(item).data('index'));
            });
            $scope.tableIndex = lsParam.join(',');
        } else {
            lsChecked = $('#param_tableIndexes').find('input:checked');
            angular.forEach(lsChecked, function (item) {
                lsParam.push($(item).data('index'));
            });
            $scope.tableIndex = lsParam.join(',');
        }
        if ($scope.tableIndex) {
            $scope.paramsObj = $scope.getParams();
            $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
            if($scope.clickFlag){
                $scope.paramsObj.ids = 'ws_comp_chart,ws_comp_table,ws_comp_table_summary';
            }
            $scope.paramsObj.param_pageSize = $scope.totel;
            $scope.paramsObj.param_pageIndex = $scope.curPage;
            console.log($scope.curPage);
            $scope.everyObj = $scope.paramsObj;
            $scope.queryParamData();
            $scope.clickFlag = false;
        }
    };
    $scope.singleTabe = function ($event) {
        var tar = $event.target;
        var tabPatam = $('#param_tableIndexes').find('input:checked');
        var tabPatams = [];
        tabPatam.removeAttr('checked');
        $(tabPatam[0]).attr('checked', true);
        if ($(tabPatam[0]).is(':checked')) {
            $scope.startLoading();
        }
        $scope.changeNum(0);
        $scope.curPage = 0;
        $scope.tableIndex = $(tabPatam[0]).data('index');
        //  请求数据
        $scope.paramsObj = $scope.getParams();
        console.log($scope.getParams());
        $scope.paramsObj.ids = 'ws_comp_table,ws_comp_table_summary';
        $scope.paramsObj.param_pageSize = $scope.totel;
        $scope.paramsObj.param_tableIndexes = $scope.tableIndex;
        $scope.paramsObj['param_pageIndex'] = 0;
        $scope.queryParamData();
    }
}]);





