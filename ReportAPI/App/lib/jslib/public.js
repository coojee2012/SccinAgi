/**
 * Created by LinYong on 2015-03-09.
 */
/**
 * @description 检查并设置程序数据存放目录
 * @returns {*}
 * */
function checkAppdir() {
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
function chooseDir(name) {
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