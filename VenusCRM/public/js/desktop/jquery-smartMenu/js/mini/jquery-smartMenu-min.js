﻿/*
 * smartMenu.js 智能上下文菜单插件
 * http://www.zhangxinxu.com/
 *
 * Copyright 2011, zhangxinxu
 *
 * 2011-05-26 v1.0	编写
 * 2011-06-03 v1.1	修复func中this失准问题
 */
(function(a) {
	var b = a(document).data("func", {}),
		c = a("body");
	a.smartMenu = a.noop;
	a.fn.smartMenu = function(g, d) {
		var h = {
			name: "",
			offsetX: 2,
			offsetY: 2,
			textLimit: 6,
			beforeShow: a.noop,
			afterShow: a.noop
		};
		var i = a.extend(h, d || {});
		var f = function(k) {
			var m = k || g,
				j = k ? Math.random().toString() : i.name,
				o = "",
				n = "",
				l = "smart_menu_";
			if (a.isArray(m) && m.length) {
				o = '<div id="smartMenu_' + j + '" class="' + l + 'box"><div class="' + l + 'body"><ul class="' + l + 'ul">';
				a.each(m, function(q, p) {
					if (q) {
						o = o + '<li class="' + l + 'li_separate">&nbsp;</li>'
					}
					if (a.isArray(p)) {
						a.each(p, function(s, v) {
							var w = v.text,
								u = "",
								r = "",
								t = Math.random().toString().replace(".", "");
							if (w) {
								if (w.length > i.textLimit) {
									w = w.slice(0, i.textLimit) + "…";
									r = ' title="' + v.text + '"'
								}
								if (a.isArray(v.data) && v.data.length) {
									u = '<li class="' + l + 'li" data-hover="true">' + f(v.data) + '<a href="javascript:" class="' + l + 'a"' + r + ' data-key="' + t + '"><i class="' + l + 'triangle"></i>' + w + "</a></li>"
								} else {
									u = '<li class="' + l + 'li"><a href="javascript:" class="' + l + 'a"' + r + ' data-key="' + t + '">' + w + "</a></li>"
								}
								o += u;
								var x = b.data("func");
								x[t] = v.func;
								b.data("func", x)
							}
						})
					}
				});
				o = o + "</ul></div></div>"
			}
			return o
		}, e = function() {
				var j = "#smartMenu_",
					l = "smart_menu_",
					k = a(j + i.name);
				if (!k.size()) {
					a("body").append(f());
					a(j + i.name + " a").bind("click", function() {
						var m = a(this).attr("data-key"),
							n = b.data("func")[m];
						if (a.isFunction(n)) {
							n.call(b.data("trigger"))
						}
						a.smartMenu.hide();
						return false
					});
					a(j + i.name + " li").each(function() {
						var m = a(this).attr("data-hover"),
							n = l + "li_hover";
						if (m) {
							a(this).hover(function() {
								a(this).addClass(n).children("." + l + "box").show();
								a(this).children("." + l + "a").addClass(l + "a_hover")
							}, function() {
								a(this).removeClass(n).children("." + l + "box").hide();
								a(this).children("." + l + "a").removeClass(l + "a_hover")
							})
						}
					});
					return a(j + i.name)
				}
				return k
			};
		a(this).each(function() {
			this.oncontextmenu = function(l) {
				if (a.isFunction(i.beforeShow)) {
					i.beforeShow.call(this)
				}
				l = l || window.event;
				l.cancelBubble = true;
				if (l.stopPropagation) {
					l.stopPropagation()
				}
				a.smartMenu.hide();
				var k = b.scrollTop();
				var j = e();
				if (j) {
					j.css({
						display: "block",
						left: l.clientX + i.offsetX,
						top: l.clientY + k + i.offsetY
					});
					b.data("target", j);
					b.data("trigger", this);
					if (a.isFunction(i.afterShow)) {
						i.afterShow.call(this)
					}
					return false
				}
			}
		});
		if (!c.data("bind")) {
			c.bind("click", a.smartMenu.hide).data("bind", true)
		}
	};
	a.extend(a.smartMenu, {
		hide: function() {
			var d = b.data("target");
			if (d && d.css("display") === "block") {
				d.hide()
			}
		},
		remove: function() {
			var d = b.data("target");
			if (d) {
				d.remove()
			}
		}
	})
})(jQuery);