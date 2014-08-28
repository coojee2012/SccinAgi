/*
全角转半角函数
*/
"use strict";
function FullToHalf(str) {
    str += "";
    var result = "";
    for (var i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) == 12288) {
            result += String.fromCharCode(str.charCodeAt(i) - 12256);
            continue;
        }
        if (str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375)
            result += String.fromCharCode(str.charCodeAt(i) - 65248);
        else
            result += String.fromCharCode(str.charCodeAt(i));
    }
    return result;
}
//全角半角英文数字转半角
//从半角符号到全角符号的转换   
///全角空格为12288，半角空格为32 
///其他字符半角(33-126)与全角(65281-65374)的对应关系是：均相差65248 
//数字：48-57，英文：97-126

function DBC2SBC(str) {
    str += "";
    var i;
    var result = '';
    for (i = 0; i < str.length; i++) {
      var  str1 = str.charCodeAt(i);
        if (str1 > 65344 && str1 < 65375) {
            result += String.fromCharCode(str.charCodeAt(i) - 65248);
            continue;
        } else if (str1 > 65295 && str1 < 65306) {
            result += String.fromCharCode(str.charCodeAt(i) - 65248);
            continue;
        } else

            result += String.fromCharCode(str.charCodeAt(i));

    }
    return result;
}

function itemInArray(item,array){
    var b=false;
    for(var i=0;i<array.length;i++){
        if(array[i]==item){
            b=true;
            break;
        }
    }
    return b;
}

//页面加载完毕后执行的通用初始化 

$(function() {
    //初始化时间控件 -ly   BG
    $(".datetimeserach").each(function() {
        var self = this;
        $(self).attr("readonly", "readonly");
        $(self).css("background-color", "#ffffff");
        $(self).datetimepicker({
            format: "yyyy-mm-dd",
            weekStart: 1,
            autoclose: true, //false,true
            startView: 'month', //hour,day,month,year,decade
            minView: 'month', //default:hour
            maxView: "year", //default:decade
            todayBtn: false, //Default: false
            todayHighlight: true,
            language: 'zh-CN'
        }).on('changeDate', function(ev) {
            var k = $(self).data("id");
            if (k && k != "") {
                var k2 = k.split("\-");
                if (k2[1] && k2[1] == "from") {
                    var vto = $("[data-id='" + k2[0] + "-to']")[0];
                    vto = $(vto).val() + " 23:59:59";
                    // var vto = $("#" + k2[0] + "-to").val() + " 23:59:59";
                    var vfrom = ev.date.valueOf();
                    var myDate = new Date(vto);
                    var vtov = myDate.valueOf();
                    if (vto != "" && ev.date.valueOf() > vtov) {
                        alert("开始时间不能大于结束时间！");
                        $(self).val("");
                        return false;
                    }

                } else if (k2[1] && k2[1] == 'to') {
                    var vto = $("[data-id='" + k2[0] + "-from']")[0];
                    vto = $(vto).val() + " 00:00:00";

                    //var vto = $("#" + k2[0] + "-from").val() + " 00:00:00";
                    var vfrom = ev.date.valueOf();
                    var myDate = new Date(vto);
                    var vtov = myDate.valueOf();
                    if (vto != "" && ev.date.valueOf() < vtov) {
                        alert("结束时间不能小于开始时间！");
                        $(self).val("");
                        return false;
                    }

                } else {

                }
            }
        });

        $(self).next().click(function() {
            $(self).val('');
        });
    });
    //ED 初始化时间控件

    //初始化部门下拉控件-start
    $("[data-selectdom]").each(function() {
        var self = this;
        var ModelName = $(self).data('selectdom');
        var SelectedVal=$(self).data('selectval') || '';
        var oldVal = $(self).val() || SelectedVal+"" ||"";
        $(self).css("maxWidth","150");
        $(self).empty();
        $(self).append($("<option>").val("").text("请选择"));
        $.ajax({
            cache: true,
            type: "POST",
            url: '/base/htmlhelper/getSelectOptions/'+ModelName,
            data: {},
            async: false,
            error: function(request) {
                $.scojs_message('连接服务器失败！', $.scojs_message.TYPE_ERROR);
            },
            success: function(data) {
                for (var i = 0; i < data.length; i++) {
                    var option = $("<option>").val(data[i].v).text(data[i].t);
                    $(self).append(option);
                }
                $(self).val(oldVal);
            }
        });
    });
    //初始化下拉控件-end
}); //end  on ready