/**
 * Created by Administrator on 2016/8/22.
 */
var today = new Date();
function addZero (date){
    return  ('0'+date).slice(-2);
}
today.setDate(today.getDate()-1);
var endDate = today.getFullYear() + "-" + addZero(today.getMonth()+1) + "-" + addZero(today.getDate());
today.setMonth(today.getMonth()-1);
var startDate = today.getFullYear() + "-" + addZero(today.getMonth()+1) + "-" + addZero(today.getDate());
var dateRange = new pickerDateRange('date_demo3', {
    aRecent7Days : 'aRecent7DaysDemo3', //最近7天
    aRecent30Days : 'aRecent30DaysDemo3',
    aRecent90Days : 'aRecent90DaysDemo3',
    aRecent180Days : 'aRecent180DaysDemo3',
    isTodayValid : false,
    //startDate : startDate,
    //endDate : endDate,
    startDate : startDate,
    endDate : endDate,
    //needCompare : true,
    //isSingleDay : true,
    //shortOpr : true,
    defaultText : '~',
    inputTrigger : 'input_trigger_demo3',
    theme : 'ta',
    success : function(obj) {
        $("#dCon_demo3").html('开始时间 : ' + obj.startDate + '<br/>结束时间 : ' + obj.endDate);
    }
});