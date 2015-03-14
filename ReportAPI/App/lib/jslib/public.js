/**
 * Created by LinYong on 2015-03-09.
 */
/**
 * @description 检查并设置程序数据存放目录
 * @returns {*}
 * */



BJExpert.baseFn.checkAppdir = function () {
    var deferred = Q.defer();
    if (!reportApp.appDir) {
        try {
            $('#dd').dialog({
                title: '&nbsp;&nbsp;请选择程序数据保存目录',
                width: 400,
                height: 200,
                closed: true,
                cache: false,
                iconCls: 'icon-save',
                href: './view/appdir.html',
                closable: false,
                modal: true,
                buttons: [
                    {
                        text: '选择目录',
                        handler: function () {
                            chooseDir('#fileDialog').then(function (dir) {
                                reportApp.appDir = dir;
                                localStorage.setItem('appdir', dir);
                                $('#dd').dialog('close');
                                deferred.resolve(dir);
                            });
                        }
                    }
                ],
                onMove: function (e) {
                    /// TODO 尝试禁止拖动对话框
                    //  $('#dd').panel().draggable('disabled', true);
                }
            });
            $('#dd').dialog('open');
            $("#dd").panel("move", {
                top: $(document).scrollTop() + ($(window).height() - 200) * 0.5,
                left: $(document).scrollLeft() + ($(window).width() - 400) * 0.5
            });

        } catch (err) {
            deferred.reject(err);
        }

    } else {
        $('#dd').dialog({
            title: '&nbsp;&nbsp;请选择数据保存目录',
            width: 400,
            height: 200,
            closed: true});
        deferred.resolve(reportApp.appDir);
    }
    return deferred.promise;
}
/***
 * @description 选择目录
 * @param name - 目录元素的ID
 * @returns {*}
 */
BJExpert.baseFn.chooseDir = function (name) {
    var deferred = Q.defer();
    var chooser = $(name);
    try {
        chooser.change(function (evt) {
            console.log($(this).val());
            deferred.resolve($(this).val());
        });
        chooser.trigger('click');
    } catch (err) {
        deferred.reject(err);
    }

    return deferred.promise;
}

BJExpert.baseFn.getChartDate = function () {
    $.ajax({
        url: BJExpert.apiServer + '/base/getreportdate',
        type: 'POST',
        data: {},
        dataType: "json",
        success: function (data) {
            if (data && data.success) {
                $("#reportDateID").html(data.date);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            var msg = textStatus || errorThrown;
            alert("Ajax请求错误：" + msg);
        }
    });
}


BJExpert.chart.contextButton = {
    enabled: true,
    text: '图表菜单',
    menuItems: [
        {
            text: '导出EXCEL',
            onclick: function () {

                var form = $("<form>");
                form.attr('style', 'display:none');
                form.attr('target', '');
                form.attr('method', 'post');
                form.attr('action', BJExpert.apiServer + '/base/getCSV');
                var input1 = $('<input>');
                input1.attr('type', 'hidden');
                input1.attr('name', 'csv');
                input1.attr('value', chart.getCSV());
                var input2 = $('<input>');
                input2.attr('type', 'hidden');
                input2.attr('name', 'filename');
                input2.attr('value', 'ImportExcel');
                $('body').append(form);
                form.append(input1);
                form.append(input2);
                form.submit();
                form.remove();

            }

        },
        {
            separator: true
        } ,
        {
            text: '导出 - PNG',
            onclick: function () {
                this.exportChart();
            }
        },
        {
            text: '导出 - JPG',
            onclick: function () {
                this.exportChart({
                    type: 'image/jpeg'
                });
            }
        },
        {
            separator: true
        },
        {
            text: '导出 - PDF',
            onclick: function () {
                this.exportChart({
                    type: 'application/pdf'
                });
            }
        },
        {
            text: '导出 - SVG',
            onclick: function () {
                this.exportChart({
                    type: 'image/svg+xml'
                });
            }
        },
        {
            separator: true
        },
        {
            text: '打印图表',
            onclick: function () {
                this.print();
            }
        }
    ]
};