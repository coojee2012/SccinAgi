/**
 * jQuery plugin
 * tooltip like coda website, inspired by http://www.panic.com/coda/ 
 */
(function($){
        $.easing.easeOutQuad = $.easing.easeOutQuad || function (x, t, b, c, d) { return -c *(t/=d)*(t-2) + b; };
        
        $.tooltip = {
                settings: {
                        content: 'tooltip content',
                        duration: 250,
                        opacity: 0.9,
                        // 下面4个回调方法是作为tooltip指向的的DOM元素的方法调用的
                        // on****Start方法如果返回false，则不会展现tooltip
                        onShowStart: $.noop,
                        onShown: $.noop,
                        onHideStart: $.noop,
                        onHidden: $.noop
                }
        };
        
        $.fn.tooltip = function (options) {
                // 如果只传入了一个字符串，则将字符串内容作为tooltip的文本内容进行显示
                var options = $.extend({}, $.tooltip.settings, typeof options === 'string' ? {content: options} : options);

                return this.each(function(){
                        // inprogressing 用于控制动画完成，避免在tooltip没有完成展开就被关闭
                        var self = this, $this = $(this), inprogressing = false,
                                // tooltip box
                                box = $('<div class="ui-tooltip"><div class="ui-tooltip-top-left"></div><div class="ui-tooltip-top-center"></div><div class="ui-tooltip-top-right"></div><div class="ui-tooltip-middle-left"></div><div class="ui-tooltip-middle-center"><div class="ui-tooltip-contents"></div></div><div class="ui-tooltip-middle-right"></div><div class="ui-tooltip-bottom-left"></div><div class="ui-tooltip-bottom-center"><div class="ui-tooltip-bottom-center-tail"></div></div><div class="ui-tooltip-bottom-right"></div></div')
                                                .css({opacity: 0, display: 'block'}).find('.ui-tooltip-contents').html(options.content).end();
                        
                        // make $this absolute or relative for the sake of tooltip position.
                        if ($this.css('position') == 'static') {
                                $this.css('position', 'relative');
                        }
                        
                        // 为了方便下面对box的各组成部分计算宽高，需要先将box置为显示，只是将其置为全透明
                $this.append(box);
                
                var topLeft = box.find('.ui-tooltip-top-left'),
                        topCenter = box.find('.ui-tooltip-top-center'),
                        topRight = box.find('.ui-tooltip-top-right'),
                        middleLeft = box.find('.ui-tooltip-middle-left'),
                        middleCenter = box.find('.ui-tooltip-middle-center'),
                        middleRight = box.find('.ui-tooltip-middle-right'),
                        bottomLeft = box.find('.ui-tooltip-bottom-left'),
                        bottomCenter = box.find('.ui-tooltip-bottom-center'),
                        bottomRight = box.find('.ui-tooltip-bottom-right'),
                        bottomTail = box.find('.ui-tooltip-bottom-center-tail'),
                        
                        centerWidth = middleCenter.width(),
                        centerHeight = middleCenter.height(),
                        topLeftWidth = topLeft.width(),
                        topLeftHeight = topLeft.height(),
                        bottomLeftHeight = bottomLeft.height(),
                        bottomLeftWidth = bottomLeft.width(),
                        boxHeight = topLeftHeight + bottomLeftHeight + centerHeight,
                        boxWidth = topLeftWidth + bottomLeftWidth + centerWidth;
                        
                // tooltip部分与触发对象之间有10像素重合，计算box各部分的宽高完成，将box隐藏，并设置box的真实宽高，用于box.animate方法展示动画效果
                        box.css({top: 10 - boxHeight, display: 'none', height: boxHeight, width: boxWidth});
                        topCenter.css({width: centerWidth});
                        topRight.css({left: centerWidth + topLeftWidth});
                        middleLeft.css({height: centerHeight});
                        middleRight.css({height: centerHeight, left: centerWidth + topLeftWidth});
                        middleCenter.css({height: centerHeight, width: centerWidth});
                        bottomLeft.css({top: topLeftHeight + centerHeight});
                        bottomCenter.css({width: centerWidth, top: topLeftHeight + centerHeight});
                        bottomRight.css({top: topLeftHeight + centerHeight, left: centerWidth + topLeftWidth});
                        box.children().css({opacity: options.opacity});
                        
                $this.mouseenter(function (event) {
                        if (options.onShowStart.call(self, event) !== false && !inprogressing) {
                                inprogressing = true;
                            box.animate({
                                opacity: [1, 'easeOutQuad'],
                                height: ['show', 'easeOutQuad']
                            }, options.duration, function(){
                                        inprogressing = false;
                                $.proxy(options.onShown, self);
                            });
                        }
                    return false;
                }).mouseleave(function (event) {
                        if (options.onHideStart.call(self, event) !== false && !inprogressing) {
                                inprogressing = true;
                            box.animate({
                                opacity: [0, 'easeOutQuad'],
                                height: ['hide', 'easeOutQuad']
                            }, options.duration, function(){
                                        inprogressing = false;
                                $.proxy(options.onHidden, self);
                            });
                        }
                    return false;
                });
                });
    }
})(jQuery);
