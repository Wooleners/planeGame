var cc = cc || {};
cc._tmp = cc._tmp || {};
cc._LogInfos = {};
_p = window;
_p = Object.prototype;
delete window._p;
cc.newElement = function(a) {
	return document.createElement(a)
};
cc._addEventListener = function(a, b, c, d) {
	a.addEventListener(b, c, d)
};
cc._isNodeJs = "undefined" !== typeof require && require("fs");
cc.each = function(a, b, c) {
	if (a)
		if (a instanceof Array)
			for (var d = 0, e = a.length; d < e && !1 !== b.call(c, a[d], d); d++);
		else
			for (d in a)
				if (!1 === b.call(c, a[d], d)) break
};
cc.extend = function(a) {
	var b = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [];
	cc.each(b, function(b) {
		for (var d in b) b.hasOwnProperty(d) && (a[d] = b[d])
	});
	return a
};
cc.isFunction = function(a) {
	return "function" == typeof a
};
cc.isNumber = function(a) {
	return "number" == typeof a || "[object Number]" == Object.prototype.toString.call(a)
};
cc.isString = function(a) {
	return "string" == typeof a || "[object String]" == Object.prototype.toString.call(a)
};
cc.isArray = function(a) {
	return "[object Array]" == Object.prototype.toString.call(a)
};
cc.isUndefined = function(a) {
	return "undefined" == typeof a
};
cc.isObject = function(a) {
	var b = typeof a;
	return "function" == b || a && "object" == b
};
cc.isCrossOrigin = function(a) {
	if (!a) return cc.log("invalid URL"), !1;
	var b = a.indexOf("://");
	if (-1 == b) return !1;
	b = a.indexOf("/", b + 3);
	return (-1 == b ? a : a.substring(0, b)) != location.origin
};
cc.AsyncPool = function(a, b, c, d, e) {
	var f = this;
	f._srcObj = a;
	f._limit = b;
	f._pool = [];
	f._iterator = c;
	f._iteratorTarget = e;
	f._onEnd = d;
	f._onEndTarget = e;
	f._results = a instanceof Array ? [] : {};
	f._isErr = !1;
	cc.each(a, function(a, b) {
		f._pool.push({
			index: b,
			value: a
		})
	});
	f.size = f._pool.length;
	f.finishedSize = 0;
	f._workingSize = 0;
	f._limit = f._limit || f.size;
	f.onIterator = function(a, b) {
		f._iterator = a;
		f._iteratorTarget = b
	};
	f.onEnd = function(a, b) {
		f._onEnd = a;
		f._onEndTarget = b
	};
	f._handleItem = function() {
		var a = this;
		if (0 != a._pool.length && !(a._workingSize >= a._limit)) {
			var b = a._pool.shift(),
				c = b.value,
				d = b.index;
			a._workingSize++;
			a._iterator.call(a._iteratorTarget, c, d, function(b) {
				if (!a._isErr)
					if (a.finishedSize++, a._workingSize--, b) a._isErr = !0, a._onEnd && a._onEnd.call(a._onEndTarget, b);
					else {
						var c = Array.prototype.slice.call(arguments, 1);
						a._results[this.index] = c[0];
						a.finishedSize == a.size ? a._onEnd && a._onEnd.call(a._onEndTarget, null, a._results) : a._handleItem()
					}
			}.bind(b), a)
		}
	};
	f.flow = function() {
		if (0 == this._pool.length) this._onEnd && this._onEnd.call(this._onEndTarget, null, []);
		else
			for (var a = 0; a < this._limit; a++) this._handleItem()
	}
};
cc.async = {
	series: function(a, b, c) {
		a = new cc.AsyncPool(a, 1, function(a, b, f) {
			a.call(c, f)
		}, b, c);
		a.flow();
		return a
	},
	parallel: function(a, b, c) {
		a = new cc.AsyncPool(a, 0, function(a, b, f) {
			a.call(c, f)
		}, b, c);
		a.flow();
		return a
	},
	waterfall: function(a, b, c) {
		var d = [];
		a = new cc.AsyncPool(a, 1, function(a, b, g) {
			d.push(function(a) {
				d = Array.prototype.slice.call(arguments, 1);
				g.apply(null, arguments)
			});
			a.apply(c, d)
		}, function(a, d) {
			if (b) {
				if (a) return b.call(c, a);
				b.call(c, null, d[d.length - 1])
			}
		});
		a.flow();
		return a
	},
	map: function(a, b, c, d) {
		var e = b;
		"object" == typeof b && (c = b.cb, d = b.iteratorTarget, e = b.iterator);
		a = new cc.AsyncPool(a, 0, e, c, d);
		a.flow();
		return a
	},
	mapLimit: function(a, b, c, d, e) {
		a = new cc.AsyncPool(a, b, c, d, e);
		a.flow();
		return a
	}
};
cc.path = {
	join: function() {
		for (var a = arguments.length, b = "", c = 0; c < a; c++) b = (b + ("" == b ? "" : "/") + arguments[c]).replace(/(\/|\\\\)$/, "");
		return b
	},
	extname: function(a) {
		return (a = /(\.[^\.\/\?\\]*)(\?.*)?$/.exec(a)) ? a[1] : null
	},
	mainFileName: function(a) {
		if (a) {
			var b = a.lastIndexOf(".");
			if (-1 !== b) return a.substring(0, b)
		}
		return a
	},
	basename: function(a, b) {
		var c = a.indexOf("?");
		0 < c && (a = a.substring(0, c));
		c = /(\/|\\\\)([^(\/|\\\\)]+)$/g.exec(a.replace(/(\/|\\\\)$/, ""));
		if (!c) return null;
		c = c[2];
		return b && a.substring(a.length -
			b.length).toLowerCase() == b.toLowerCase() ? c.substring(0, c.length - b.length) : c
	},
	dirname: function(a) {
		return a.replace(/((.*)(\/|\\|\\\\))?(.*?\..*$)?/, "$2")
	},
	changeExtname: function(a, b) {
		b = b || "";
		var c = a.indexOf("?"),
			d = "";
		0 < c && (d = a.substring(c), a = a.substring(0, c));
		c = a.lastIndexOf(".");
		return 0 > c ? a + b + d : a.substring(0, c) + b + d
	},
	changeBasename: function(a, b, c) {
		if (0 == b.indexOf(".")) return this.changeExtname(a, b);
		var d = a.indexOf("?"),
			e = "";
		c = c ? this.extname(a) : "";
		0 < d && (e = a.substring(d), a = a.substring(0, d));
		d = a.lastIndexOf("/");
		return a.substring(0, 0 >= d ? 0 : d + 1) + b + c + e
	}
};
cc.loader = {
	_jsCache: {},
	_register: {},
	_langPathCache: {},
	_aliases: {},
	resPath: "",
	audioPath: "",
	cache: {},
	getXMLHttpRequest: function() {
		return window.XMLHttpRequest ? new window.XMLHttpRequest : new ActiveXObject("MSXML2.XMLHTTP")
	},
	_getArgs4Js: function(a) {
		var b = a[0],
			c = a[1],
			d = a[2],
			e = ["", null, null];
		if (1 === a.length) e[1] = b instanceof Array ? b : [b];
		else if (2 === a.length) "function" == typeof c ? (e[1] = b instanceof Array ? b : [b], e[2] = c) : (e[0] = b || "", e[1] = c instanceof Array ? c : [c]);
		else if (3 === a.length) e[0] = b || "", e[1] = c instanceof
		Array ? c : [c], e[2] = d;
		else throw "arguments error to load js!";
		return e
	},
	loadJs: function(a, b, c) {
		var d = this,
			e = d._jsCache,
			f = d._getArgs4Js(arguments),
			g = f[0],
			h = f[1],
			f = f[2]; - 1 < navigator.userAgent.indexOf("Trident/5") ? d._loadJs4Dependency(g, h, 0, f) : cc.async.map(h, function(a, b, c) {
			a = cc.path.join(g, a);
			if (e[a]) return c(null);
			d._createScript(a, !1, c)
		}, f)
	},
	loadJsWithImg: function(a, b, c) {
		var d = this._loadJsImg(),
			e = this._getArgs4Js(arguments);
		this.loadJs(e[0], e[1], function(a) {
			if (a) throw a;
			d.parentNode.removeChild(d);
			if (e[2]) e[2]()
		})
	},
	_createScript: function(a, b, c) {
		var d = document,
			e = cc.newElement("script");
		e.async = b;
		e.src = a;
		this._jsCache[a] = !0;
		cc._addEventListener(e, "load", function() {
			e.parentNode.removeChild(e);
			this.removeEventListener("load", arguments.callee, !1);
			c()
		}, !1);
		cc._addEventListener(e, "error", function() {
			e.parentNode.removeChild(e);
			c("Load " + a + " failed!")
		}, !1);
		d.body.appendChild(e)
	},
	_loadJs4Dependency: function(a, b, c, d) {
		if (c >= b.length) d && d();
		else {
			var e = this;
			e._createScript(cc.path.join(a, b[c]), !1, function(f) {
				if (f) return d(f);
				e._loadJs4Dependency(a, b, c + 1, d)
			})
		}
	},
	_loadJsImg: function() {
		var a = document,
			b = a.getElementById("cocos2d_loadJsImg");
		if (!b) {
			b = cc.newElement("img");
			cc._loadingImage && (b.src = cc._loadingImage);
			a = a.getElementById(cc.game.config.id);
			//a.style.backgroundColor = "black";
			a.parentNode.appendChild(b);
			var c = getComputedStyle ? getComputedStyle(a) : a.currentStyle;
			c || (c = {
				width: a.width,
				height: a.height
			});
			b.style.left = a.offsetLeft + (parseFloat(c.width) - b.width) / 2 + "px";
			b.style.top = a.offsetTop + (parseFloat(c.height) - b.height) / 2 + "px";
			b.style.position = "absolute"
		}
		return b
	},
	loadTxt: function(a, b) {
		if (cc._isNodeJs) require("fs").readFile(a, function(a, c) {
			a ? b(a) : b(null, c.toString())
		});
		else {
			var c = this.getXMLHttpRequest(),
				d = "load " + a + " failed!";
			c.open("GET", a, !0);
			/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent) ? (c.setRequestHeader("Accept-Charset", "utf-8"), c.onreadystatechange = function() {
				4 == c.readyState && (200 == c.status ? b(null, c.responseText) : b(d))
			}) : (c.overrideMimeType && c.overrideMimeType("text/plain; charset\x3dutf-8"), c.onload = function() {
				4 == c.readyState && (200 == c.status ? b(null, c.responseText) : b(d))
			});
			c.send(null)
		}
	},
	_loadTxtSync: function(a) {
		if (cc._isNodeJs) return require("fs").readFileSync(a).toString();
		var b = this.getXMLHttpRequest();
		b.open("GET", a, !1);
		/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent) ? b.setRequestHeader("Accept-Charset", "utf-8") : b.overrideMimeType && b.overrideMimeType("text/plain; charset\x3dutf-8");
		b.send(null);
		return 4 == !b.readyState || 200 != b.status ? null : b.responseText
	},
	loadJson: function(a, b) {
		this.loadTxt(a, function(c, d) {
			try {
				c ? b(c) : b(null, JSON.parse(d))
			} catch (e) {
				throw "load json [" + a + "] failed : " + e;
			}
		})
	},
	_checkIsImageURL: function(a) {
		return null != /(\.png)|(\.jpg)|(\.bmp)|(\.jpeg)|(\.gif)/.exec(a)
	},
	loadImg: function(a, b, c) {
		var d = {
			isCrossOrigin: !0
		};
		void 0 !== c ? d.isCrossOrigin = null == b.isCrossOrigin ? d.isCrossOrigin : b.isCrossOrigin : void 0 !== b && (c = b);
		var e = new Image;
		d.isCrossOrigin && "file://" != location.origin && (e.crossOrigin = "Anonymous");
		var f = function() {
				this.removeEventListener("load", f, !1);
				this.removeEventListener("error", g, !1);
				c && c(null, e)
			},
			g = function() {
				this.removeEventListener("error", g, !1);
				"anonymous" == e.crossOrigin.toLowerCase() ? (d.isCrossOrigin = !1, cc.loader.loadImg(a, d, c)) : "function" == typeof c && c("load image failed")
			};
		cc._addEventListener(e, "load", f);
		cc._addEventListener(e, "error", g);
		e.src = a;
		return e
	},
	_loadResIterator: function(a, b, c) {
		var d = this,
			e = null,
			f = a.type;
		f ? (f = "." + f.toLowerCase(), e = a.src ? a.src : a.name + f) : (e = a, f = cc.path.extname(e));
		if (b = d.cache[e]) return c(null, b);
		b = d._register[f.toLowerCase()];
		if (!b) return cc.error("loader for [" + f + "] not exists!"), c();
		f = b.getBasePath ? b.getBasePath() : d.resPath;
		f = d.getUrl(f, e);
		b.load(f, e, a, function(a, b) {
			a ? (cc.log(a), d.cache[e] = null, delete d.cache[e], c()) : (d.cache[e] = b, c(null, b))
		})
	},
	getUrl: function(a, b) {
		var c = this._langPathCache,
			d = cc.path;
		if (void 0 !== a && void 0 === b) {
			b = a;
			var e = d.extname(b),
				e = e ? e.toLowerCase() : "";
			a = (e = this._register[e]) ? e.getBasePath ? e.getBasePath() : this.resPath : this.resPath
		}
		b = cc.path.join(a || "", b);
		if (b.match(/[\/(\\\\)]lang[\/(\\\\)]/i)) {
			if (c[b]) return c[b];
			d = d.extname(b) || "";
			b = c[b] = b.substring(0, b.length - d.length) + "_" + cc.sys.language + d
		}
		return b
	},
	load: function(a, b, c) {
		var d = this,
			e = arguments.length;
		if (0 == e) throw "arguments error!";
		3 == e ? "function" == typeof b && (b = "function" == typeof c ? {
			trigger: b,
			cb: c
		} : {
			cb: b,
			cbTarget: c
		}) : 2 == e ? "function" == typeof b && (b = {
			cb: b
		}) : 1 == e && (b = {});
		a instanceof Array || (a = [a]);
		e = new cc.AsyncPool(a, 0, function(a, c, e, k) {
			d._loadResIterator(a, c, function(a) {
				if (a) return e(a);
				var c = Array.prototype.slice.call(arguments, 1);
				b.trigger && b.trigger.call(b.triggerTarget, c[0], k.size, k.finishedSize);
				e(null, c[0])
			})
		}, b.cb, b.cbTarget);
		e.flow();
		return e
	},
	_handleAliases: function(a, b) {
		var c = this._aliases,
			d = [],
			e;
		for (e in a) {
			var f = a[e];
			c[e] = f;
			d.push(f)
		}
		this.load(d, b)
	},
	loadAliases: function(a, b) {
		var c = this,
			d = c.getRes(a);
		d ? c._handleAliases(d.filenames, b) : c.load(a, function(a, d) {
			c._handleAliases(d[0].filenames, b)
		})
	},
	register: function(a, b) {
		if (a && b) {
			if ("string" == typeof a) return this._register[a.trim().toLowerCase()] = b;
			for (var c = 0, d = a.length; c < d; c++) this._register["." + a[c].trim().toLowerCase()] = b
		}
	},
	getRes: function(a) {
		return this.cache[a] || this.cache[this._aliases[a]]
	},
	release: function(a) {
		var b = this.cache,
			c = this._aliases;
		delete b[a];
		delete b[c[a]];
		delete c[a]
	},
	releaseAll: function() {
		var a = this.cache,
			b = this._aliases,
			c;
		for (c in a) delete a[c];
		for (c in b) delete b[c]
	}
};
cc.formatStr = function() {
	var a = arguments,
		b = a.length;
	if (1 > b) return "";
	var c = a[0],
		d = !0;
	"object" == typeof c && (d = !1);
	for (var e = 1; e < b; ++e) {
		var f = a[e];
		if (d)
			for (;;) {
				var g = null;
				if ("number" == typeof f && (g = c.match(/(%d)|(%s)/))) {
					c = c.replace(/(%d)|(%s)/, f);
					break
				}
				c = (g = c.match(/%s/)) ? c.replace(/%s/, f) : c + ("    " + f);
				break
			} else c += "    " + f
	}
	return c
};
(function() {
	var a = window,
		b, c;
	cc.isUndefined(document.hidden) ? cc.isUndefined(document.mozHidden) ? cc.isUndefined(document.msHidden) ? cc.isUndefined(document.webkitHidden) || (b = "webkitHidden", c = "webkitvisibilitychange") : (b = "msHidden", c = "msvisibilitychange") : (b = "mozHidden", c = "mozvisibilitychange") : (b = "hidden", c = "visibilitychange");
	var d = function() {
			cc.eventManager && cc.game._eventHide && cc.eventManager.dispatchEvent(cc.game._eventHide)
		},
		e = function() {
			cc.eventManager && cc.game._eventShow && cc.eventManager.dispatchEvent(cc.game._eventShow);
			cc.game._intervalId && (window.cancelAnimationFrame(cc.game._intervalId), cc.game._runMainLoop())
		};
	b ? cc._addEventListener(document, c, function() {
		document[b] ? d() : e()
	}, !1) : (cc._addEventListener(a, "blur", d, !1), cc._addEventListener(a, "focus", e, !1)); - 1 < navigator.userAgent.indexOf("MicroMessenger") && (a.onfocus = function() {
		e()
	});
	"onpageshow" in window && "onpagehide" in window && (cc._addEventListener(a, "pagehide", d, !1), cc._addEventListener(a, "pageshow", e, !1));
	c = a = null
})();
cc.log = cc.warn = cc.error = cc.assert = function() {};
cc.create3DContext = function(a, b) {
	for (var c = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"], d = null, e = 0; e < c.length; ++e) {
		try {
			d = a.getContext(c[e], b)
		} catch (f) {}
		if (d) break
	}
	return d
};
cc._initSys = function(a, b) {
	cc._RENDER_TYPE_CANVAS = 0;
	cc._RENDER_TYPE_WEBGL = 1;
	cc.sys = {};
	var c = cc.sys;
	c.LANGUAGE_ENGLISH = "en";
	c.LANGUAGE_CHINESE = "zh";
	c.LANGUAGE_FRENCH = "fr";
	c.LANGUAGE_ITALIAN = "it";
	c.LANGUAGE_GERMAN = "de";
	c.LANGUAGE_SPANISH = "es";
	c.LANGUAGE_DUTCH = "du";
	c.LANGUAGE_RUSSIAN = "ru";
	c.LANGUAGE_KOREAN = "ko";
	c.LANGUAGE_JAPANESE = "ja";
	c.LANGUAGE_HUNGARIAN = "hu";
	c.LANGUAGE_PORTUGUESE = "pt";
	c.LANGUAGE_ARABIC = "ar";
	c.LANGUAGE_NORWEGIAN = "no";
	c.LANGUAGE_POLISH = "pl";
	c.OS_WINDOWS = "Windows";
	c.OS_IOS = "iOS";
	c.OS_OSX = "OS X";
	c.OS_UNIX = "UNIX";
	c.OS_LINUX = "Linux";
	c.OS_ANDROID = "Android";
	c.OS_UNKNOWN = "Unknown";
	c.WINDOWS = 0;
	c.LINUX = 1;
	c.MACOS = 2;
	c.ANDROID = 3;
	c.IPHONE = 4;
	c.IPAD = 5;
	c.BLACKBERRY = 6;
	c.NACL = 7;
	c.EMSCRIPTEN = 8;
	c.TIZEN = 9;
	c.WINRT = 10;
	c.WP8 = 11;
	c.MOBILE_BROWSER = 100;
	c.DESKTOP_BROWSER = 101;
	c.BROWSER_TYPE_WECHAT = "wechat";
	c.BROWSER_TYPE_ANDROID = "androidbrowser";
	c.BROWSER_TYPE_IE = "ie";
	c.BROWSER_TYPE_QQ = "qqbrowser";
	c.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
	c.BROWSER_TYPE_UC = "ucbrowser";
	c.BROWSER_TYPE_360 = "360browser";
	c.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
	c.BROWSER_TYPE_BAIDU = "baidubrowser";
	c.BROWSER_TYPE_MAXTHON = "maxthon";
	c.BROWSER_TYPE_OPERA = "opera";
	c.BROWSER_TYPE_OUPENG = "oupeng";
	c.BROWSER_TYPE_MIUI = "miuibrowser";
	c.BROWSER_TYPE_FIREFOX = "firefox";
	c.BROWSER_TYPE_SAFARI = "safari";
	c.BROWSER_TYPE_CHROME = "chrome";
	c.BROWSER_TYPE_UNKNOWN = "unknown";
	c.isNative = !1;
	var d = [c.BROWSER_TYPE_BAIDU, c.BROWSER_TYPE_OPERA, c.BROWSER_TYPE_FIREFOX, c.BROWSER_TYPE_CHROME, c.BROWSER_TYPE_SAFARI],
		e = [c.BROWSER_TYPE_BAIDU, c.BROWSER_TYPE_OPERA, c.BROWSER_TYPE_FIREFOX, c.BROWSER_TYPE_CHROME, c.BROWSER_TYPE_BAIDU_APP, c.BROWSER_TYPE_SAFARI, c.BROWSER_TYPE_UC, c.BROWSER_TYPE_QQ, c.BROWSER_TYPE_MOBILE_QQ, c.BROWSER_TYPE_IE],
		f = window,
		g = f.navigator,
		h = document.documentElement,
		k = g.userAgent.toLowerCase();
	c.isMobile = -1 != k.indexOf("mobile") || -1 != k.indexOf("android");
	c.platform = c.isMobile ? c.MOBILE_BROWSER : c.DESKTOP_BROWSER;
	var m = g.language,
		m = (m = m ? m : g.browserLanguage) ? m.split("-")[0] : c.LANGUAGE_ENGLISH;
	c.language = m;
	var m = c.BROWSER_TYPE_UNKNOWN,
		n = k.match(/micromessenger|qqbrowser|mqqbrowser|ucbrowser|360browser|baiduboxapp|baidubrowser|maxthon|trident|oupeng|opera|miuibrowser|firefox/i) || k.match(/chrome|safari/i);
	n && 0 < n.length && (m = n[0].toLowerCase(), "micromessenger" == m ? m = c.BROWSER_TYPE_WECHAT : "safari" === m && k.match(/android.*applewebkit/) ? m = c.BROWSER_TYPE_ANDROID : "trident" == m && (m = c.BROWSER_TYPE_IE));
	c.browserType = m;
	c._supportMultipleAudio = -1 < e.indexOf(c.browserType);
	e = parseInt(a[b.renderMode]);
	m = cc._RENDER_TYPE_WEBGL;
	n = cc.newElement("Canvas");
	cc._supportRender = !0;
	d = -1 == d.indexOf(c.browserType);
	if (1 === e || 0 === e && (c.isMobile || d) || "file://" == location.origin) m = cc._RENDER_TYPE_CANVAS;
	c._canUseCanvasNewBlendModes = function() {
		var a = document.createElement("canvas");
		a.width = 1;
		a.height = 1;
		a = a.getContext("2d");
		a.fillStyle = "#000";
		a.fillRect(0, 0, 1, 1);
		a.globalCompositeOperation = "multiply";
		var b = document.createElement("canvas");
		b.width = 1;
		b.height = 1;
		var c = b.getContext("2d");
		c.fillStyle = "#fff";
		c.fillRect(0, 0, 1, 1);
		a.drawImage(b, 0, 0, 1, 1);
		return 0 === a.getImageData(0, 0, 1, 1).data[0]
	};
	c._supportCanvasNewBlendModes = c._canUseCanvasNewBlendModes();
	m != cc._RENDER_TYPE_WEBGL || f.WebGLRenderingContext && cc.create3DContext(n, {
		stencil: !0,
		preserveDrawingBuffer: !0
	}) || (0 == e ? m = cc._RENDER_TYPE_CANVAS : cc._supportRender = !1);
	if (m == cc._RENDER_TYPE_CANVAS) try {
		n.getContext("2d")
	} catch (q) {
		cc._supportRender = !1
	}
	cc._renderType = m;
	try {
		c._supportWebAudio = !!new(f.AudioContext || f.webkitAudioContext || f.mozAudioContext)
	} catch (s) {
		c._supportWebAudio = !1
	}
	try {
		var r = c.localStorage = f.localStorage;
		r.setItem("storage", "");
		r.removeItem("storage");
		r = null
	} catch (t) {
		"SECURITY_ERR" !== t.name && "QuotaExceededError" !== t.name || cc.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option"), c.localStorage = function() {}
	}
	r = c.capabilities = {
		canvas: !0
	};
	cc._renderType == cc._RENDER_TYPE_WEBGL && (r.opengl = !0);
	if (void 0 !== h.ontouchstart || g.msPointerEnabled) r.touches = !0;
	void 0 !== h.onmouseup && (r.mouse = !0);
	void 0 !== h.onkeyup && (r.keyboard = !0);
	if (f.DeviceMotionEvent || f.DeviceOrientationEvent) r.accelerometer = !0;
	f = k.match(/(iPad|iPhone|iPod)/i) ? !0 : !1;
	k = k.match(/android/i) || g.platform.match(/android/i) ? !0 : !1;
	h = c.OS_UNKNOWN; - 1 != g.appVersion.indexOf("Win") ? h = c.OS_WINDOWS : f ? h = c.OS_IOS : -1 != g.appVersion.indexOf("Mac") ? h = c.OS_OSX : -1 != g.appVersion.indexOf("X11") ? h = c.OS_UNIX : k ? h = c.OS_ANDROID : -1 != g.appVersion.indexOf("Linux") && (h = c.OS_LINUX);
	c.os = h;
	c.garbageCollect = function() {};
	c.dumpRoot = function() {};
	c.restartVM = function() {};
	c.dump = function() {
		var a;
		a = "" + ("isMobile : " + this.isMobile + "\r\n");
		a += "language : " + this.language + "\r\n";
		a += "browserType : " + this.browserType + "\r\n";
		a += "capabilities : " + JSON.stringify(this.capabilities) + "\r\n";
		a += "os : " + this.os + "\r\n";
		a += "platform : " + this.platform + "\r\n";
		cc.log(a)
	}
};
cc.ORIENTATION_PORTRAIT = 0;
cc.ORIENTATION_PORTRAIT_UPSIDE_DOWN = 1;
cc.ORIENTATION_LANDSCAPE_LEFT = 2;
cc.ORIENTATION_LANDSCAPE_RIGHT = 3;
cc._drawingUtil = null;
cc._renderContext = null;
cc._canvas = null;
cc._gameDiv = null;
cc._rendererInitialized = !1;
cc._setupCalled = !1;
cc._setup = function(a, b, c) {
	if (!cc._setupCalled) {
		cc._setupCalled = !0;
		var d = window,
			e = new Date,
			f = 1E3 / cc.game.config[cc.game.CONFIG_KEY.frameRate],
			g = function(a) {
				var b = (new Date).getTime(),
					c = Math.max(0, f - (b - e)),
					d = window.setTimeout(function() {
						a()
					}, c);
				e = b + c;
				return d
			},
			h = function(a) {
				clearTimeout(a)
			};
		cc.sys.os === cc.sys.OS_IOS && cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT ? (d.requestAnimFrame = g, d.cancelAnimationFrame = h) : 60 != cc.game.config[cc.game.CONFIG_KEY.frameRate] ? (d.requestAnimFrame = g, d.cancelAnimationFrame = h) : (d.requestAnimFrame = d.requestAnimationFrame || d.webkitRequestAnimationFrame || d.mozRequestAnimationFrame || d.oRequestAnimationFrame || d.msRequestAnimationFrame || g, d.cancelAnimationFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.msCancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.oCancelAnimationFrame || h);
		h = cc.$(a) || cc.$("#" + a);
		"CANVAS" == h.tagName ? (b = b || h.width, c = c || h.height, g = cc.container = cc.newElement("DIV"), a = cc._canvas = h, a.parentNode.insertBefore(g, a), a.appendTo(g), g.setAttribute("id", "Cocos2dGameContainer")) : ("DIV" != h.tagName && cc.log("Warning: target element is not a DIV or CANVAS"), b = b || h.clientWidth, c = c || h.clientHeight, g = cc.container = h, a = cc._canvas = cc.$(cc.newElement("CANVAS")), h.appendChild(a));
		a.addClass("gameCanvas");
		a.setAttribute("width", b || 480);
		a.setAttribute("height", c || 320);
		a.setAttribute("tabindex", 99);
		a.style.outline = "none";
		h = g.style;
		h.width = (b || 480) + "px";
		h.height = (c || 320) + "px";
		h.margin = "0 auto";
		h.position = "relative";
		h.overflow = "hidden";
		g.top = "100%";
		cc._renderType == cc._RENDER_TYPE_WEBGL && (cc._renderContext = cc.webglContext = cc.create3DContext(a, {
			stencil: !0,
			preserveDrawingBuffer: !0,
			antialias: !cc.sys.isMobile,
			alpha: !1
		}));
		cc._renderContext ? (d.gl = cc._renderContext, cc._drawingUtil = new cc.DrawingPrimitiveWebGL(cc._renderContext), cc._rendererInitialized = !0, cc.textureCache._initializingRenderer(), cc.shaderCache._init()) : (cc._renderContext = a.getContext("2d"), cc._mainRenderContextBackup = cc._renderContext, cc._renderContext.translate(0, a.height), cc._drawingUtil = cc.DrawingPrimitiveCanvas ? new cc.DrawingPrimitiveCanvas(cc._renderContext) : null);
		cc._gameDiv = g;
		cc.log(cc.ENGINE_VERSION);
		cc._setContextMenuEnable(!1);
		cc.sys.isMobile && (b = cc.newElement("style"), b.type = "text/css", document.body.appendChild(b), b.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;-webkit-tap-highlight-color:rgba(0,0,0,0);}");
		cc.view = cc.EGLView._getInstance();
		cc.inputManager.registerSystemEvent(cc._canvas);
		cc.director = cc.Director._getInstance();
		cc.director.setOpenGLView && cc.director.setOpenGLView(cc.view);
		cc.winSize = cc.director.getWinSize();
		cc.saxParser = new cc.SAXParser;
		cc.plistParser = new cc.PlistParser
	}
};
cc._checkWebGLRenderMode = function() {
	if (cc._renderType !== cc._RENDER_TYPE_WEBGL) throw "This feature supports WebGL render mode only.";
};
cc._isContextMenuEnable = !1;
cc._setContextMenuEnable = function(a) {
	cc._isContextMenuEnable = a;
	cc._canvas.oncontextmenu = function() {
		if (!cc._isContextMenuEnable) return !1
	}
};
cc.game = {
	DEBUG_MODE_NONE: 0,
	DEBUG_MODE_INFO: 1,
	DEBUG_MODE_WARN: 2,
	DEBUG_MODE_ERROR: 3,
	DEBUG_MODE_INFO_FOR_WEB_PAGE: 4,
	DEBUG_MODE_WARN_FOR_WEB_PAGE: 5,
	DEBUG_MODE_ERROR_FOR_WEB_PAGE: 6,
	EVENT_HIDE: "game_on_hide",
	EVENT_SHOW: "game_on_show",
	_eventHide: null,
	_eventShow: null,
	_onBeforeStartArr: [],
	CONFIG_KEY: {
		engineDir: "engineDir",
		dependencies: "dependencies",
		debugMode: "debugMode",
		showFPS: "showFPS",
		frameRate: "frameRate",
		id: "id",
		renderMode: "renderMode",
		jsList: "jsList",
		classReleaseMode: "classReleaseMode"
	},
	_prepareCalled: !1,
	_prepared: !1,
	_paused: !0,
	_intervalId: null,
	config: null,
	onStart: null,
	onStop: null,
	setFrameRate: function(a) {
		this.config[this.CONFIG_KEY.frameRate] = a;
		this._intervalId && window.cancelAnimationFrame(this._intervalId);
		this._paused = !0;
		this._runMainLoop()
	},
	_runMainLoop: function() {
		var a = this,
			b, c = cc.director;
		c.setDisplayStats(a.config[a.CONFIG_KEY.showFPS]);
		b = function() {
			a._paused || (c.mainLoop(), a._intervalId = window.requestAnimFrame(b))
		};
		window.requestAnimFrame(b);
		a._paused = !1
	},
	run: function(a) {
		var b = this,
			c = function() {
				a && (b.config[b.CONFIG_KEY.id] = a);
				b._prepareCalled || b.prepare(function() {
					b._prepared = !0
				});
				cc._supportRender && (b._checkPrepare = setInterval(function() {
					b._prepared && (cc._setup(b.config[b.CONFIG_KEY.id]), b._runMainLoop(), b._eventHide = b._eventHide || new cc.EventCustom(b.EVENT_HIDE), b._eventHide.setUserData(b), b._eventShow = b._eventShow || new cc.EventCustom(b.EVENT_SHOW), b._eventShow.setUserData(b), b.onStart(), clearInterval(b._checkPrepare))
				}, 10))
			};
		document.body ? c() : cc._addEventListener(window, "load", function() {
			this.removeEventListener("load", arguments.callee, !1);
			c()
		}, !1)
	},
	_initConfig: function() {
		var a = this.CONFIG_KEY,
			b = function(b) {
				b[a.engineDir] = b[a.engineDir] || "frameworks/cocos2d-html5";
				null == b[a.debugMode] && (b[a.debugMode] = 0);
				b[a.frameRate] = b[a.frameRate] || 60;
				null == b[a.renderMode] && (b[a.renderMode] = 1);
				return b
			};
		if (document.ccConfig) this.config = b(document.ccConfig);
		else try {
			for (var c = document.getElementsByTagName("script"), d = 0; d < c.length; d++) {
				var e = c[d].getAttribute("cocos");
				if ("" == e || e) break
			}
			var f, g, h;
			if (d < c.length) {
				if (f = c[d].src) h = /(.*)\//.exec(f)[0], cc.loader.resPath = h, f = cc.path.join(h, "project.json");
				g = cc.loader._loadTxtSync(f)
			}
			g || (g = cc.loader._loadTxtSync("project.json"));
			var k = JSON.parse(g);
			this.config = b(k || {})
		} catch (m) {
			cc.log("Failed to read or parse project.json"), this.config = b({})
		}
		cc._initSys(this.config, a)
	},
	_jsAddedCache: {},
	_getJsListOfModule: function(a, b, c) {
		var d = this._jsAddedCache;
		if (d[b]) return null;
		c = c || "";
		var e = [],
			f = a[b];
		if (!f) throw "can not find module [" + b + "]";
		b = cc.path;
		for (var g = 0, h = f.length; g < h; g++) {
			var k = f[g];
			if (!d[k]) {
				var m = b.extname(k);
				m ? ".js" == m.toLowerCase() && e.push(b.join(c, k)) : (m = this._getJsListOfModule(a, k, c)) && (e = e.concat(m));
				d[k] = 1
			}
		}
		return e
	},
	prepare: function(a) {
		var b = this,
			c = b.config,
			d = b.CONFIG_KEY,
			e = c[d.engineDir],
			f = cc.loader;
		if (!cc._supportRender) throw "The renderer doesn't support the renderMode " + c[d.renderMode];
		b._prepareCalled = !0;
		var g = c[d.jsList] || [];
		cc.Class ? f.loadJsWithImg("", g, function(c) {
			if (c) throw c;
			b._prepared = !0;
			a && a()
		}) : (d = cc.path.join(e, "moduleConfig.json"), f.loadJson(d, function(d, f) {
			if (d) throw d;
			var m = c.modules || [],
				n = f.module,
				q = [];
			cc._renderType == cc._RENDER_TYPE_WEBGL ? m.splice(0, 0, "shaders") : 0 > m.indexOf("core") && m.splice(0, 0, "core");
			for (var s = 0, r = m.length; s < r; s++) {
				var t = b._getJsListOfModule(n, m[s], e);
				t && (q = q.concat(t))
			}
			q = q.concat(g);
			cc.loader.loadJsWithImg(q, function(c) {
				if (c) throw c;
				b._prepared = !0;
				a && a()
			})
		}))
	}
};
cc.game._initConfig();
Function.prototype.bind = Function.prototype.bind || function(a) {
	if (!cc.isFunction(this)) throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
	var b = Array.prototype.slice.call(arguments, 1),
		c = this,
		d = function() {},
		e = function() {
			return c.apply(this instanceof d && a ? this : a, b.concat(Array.prototype.slice.call(arguments)))
		};
	d.prototype = this.prototype;
	e.prototype = new d;
	return e
};
cc._LogInfos = {
	ActionManager_addAction: "cc.ActionManager.addAction(): action must be non-null",
	ActionManager_removeAction: "cocos2d: removeAction: Target not found",
	ActionManager_removeActionByTag: "cc.ActionManager.removeActionByTag(): an invalid tag",
	ActionManager_removeActionByTag_2: "cc.ActionManager.removeActionByTag(): target must be non-null",
	ActionManager_getActionByTag: "cc.ActionManager.getActionByTag(): an invalid tag",
	ActionManager_getActionByTag_2: "cocos2d : getActionByTag(tag \x3d %s): Action not found",
	configuration_dumpInfo: "cocos2d: **** WARNING **** CC_ENABLE_PROFILERS is defined. Disable it when you finish profiling (from ccConfig.js)",
	configuration_loadConfigFile: "Expected 'data' dict, but not found. Config file: %s",
	configuration_loadConfigFile_2: "Please load the resource first : %s",
	Director_resume: "cocos2d: Director: Error in gettimeofday",
	Director_setProjection: "cocos2d: Director: unrecognized projection",
	Director_popToSceneStackLevel: "cocos2d: Director: unrecognized projection",
	Director_popToSceneStackLevel_2: "cocos2d: Director: Error in gettimeofday",
	Director_popScene: "running scene should not null",
	Director_pushScene: "the scene should not null",
	arrayVerifyType: "element type is wrong!",
	Scheduler_scheduleCallbackForTarget: "CCSheduler#scheduleCallback. Callback already scheduled. Updating interval from:%s to %s",
	Scheduler_scheduleCallbackForTarget_2: "cc.scheduler.scheduleCallbackForTarget(): callback_fn should be non-null.",
	Scheduler_scheduleCallbackForTarget_3: "cc.scheduler.scheduleCallbackForTarget(): target should be non-null.",
	Scheduler_pauseTarget: "cc.Scheduler.pauseTarget():target should be non-null",
	Scheduler_resumeTarget: "cc.Scheduler.resumeTarget():target should be non-null",
	Scheduler_isTargetPaused: "cc.Scheduler.isTargetPaused():target should be non-null",
	Node_getZOrder: "getZOrder is deprecated. Please use getLocalZOrder instead.",
	Node_setZOrder: "setZOrder is deprecated. Please use setLocalZOrder instead.",
	Node_getRotation: "RotationX !\x3d RotationY. Don't know which one to return",
	Node_getScale: "ScaleX !\x3d ScaleY. Don't know which one to return",
	Node_addChild: "An Node can't be added as a child of itself.",
	Node_addChild_2: "child already added. It can't be added again",
	Node_addChild_3: "child must be non-null",
	Node_removeFromParentAndCleanup: "removeFromParentAndCleanup is deprecated. Use removeFromParent instead",
	Node_boundingBox: "boundingBox is deprecated. Use getBoundingBox instead",
	Node_removeChildByTag: "argument tag is an invalid tag",
	Node_removeChildByTag_2: "cocos2d: removeChildByTag(tag \x3d %s): child not found!",
	Node_removeAllChildrenWithCleanup: "removeAllChildrenWithCleanup is deprecated. Use removeAllChildren instead",
	Node_stopActionByTag: "cc.Node.stopActionBy(): argument tag an invalid tag",
	Node_getActionByTag: "cc.Node.getActionByTag(): argument tag is an invalid tag",
	Node_resumeSchedulerAndActions: "resumeSchedulerAndActions is deprecated, please use resume instead.",
	Node_pauseSchedulerAndActions: "pauseSchedulerAndActions is deprecated, please use pause instead.",
	Node__arrayMakeObjectsPerformSelector: "Unknown callback function",
	Node_reorderChild: "child must be non-null",
	Node_runAction: "cc.Node.runAction(): action must be non-null",
	Node_schedule: "callback function must be non-null",
	Node_schedule_2: "interval must be positive",
	Node_initWithTexture: "cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.",
	AtlasNode_updateAtlasValues: "cc.AtlasNode.updateAtlasValues(): Shall be overridden in subclasses",
	AtlasNode_initWithTileFile: "",
	AtlasNode__initWithTexture: "cocos2d: Could not initialize cc.AtlasNode. Invalid Texture.",
	_EventListenerKeyboard_checkAvailable: "cc._EventListenerKeyboard.checkAvailable(): Invalid EventListenerKeyboard!",
	_EventListenerTouchOneByOne_checkAvailable: "cc._EventListenerTouchOneByOne.checkAvailable(): Invalid EventListenerTouchOneByOne!",
	_EventListenerTouchAllAtOnce_checkAvailable: "cc._EventListenerTouchAllAtOnce.checkAvailable(): Invalid EventListenerTouchAllAtOnce!",
	_EventListenerAcceleration_checkAvailable: "cc._EventListenerAcceleration.checkAvailable(): _onAccelerationEvent must be non-nil",
	EventListener_create: "Invalid parameter.",
	__getListenerID: "Don't call this method if the event is for touch.",
	eventManager__forceAddEventListener: "Invalid scene graph priority!",
	eventManager_addListener: "0 priority is forbidden for fixed priority since it's used for scene graph based priority.",
	eventManager_removeListeners: "Invalid listener type!",
	eventManager_setPriority: "Can't set fixed priority with scene graph based listener.",
	eventManager_addListener_2: "Invalid parameters.",
	eventManager_addListener_3: "listener must be a cc.EventListener object when adding a fixed priority listener",
	eventManager_addListener_4: "The listener has been registered, please don't register it again.",
	LayerMultiplex_initWithLayers: "parameters should not be ending with null in Javascript",
	LayerMultiplex_switchTo: "Invalid index in MultiplexLayer switchTo message",
	LayerMultiplex_switchToAndReleaseMe: "Invalid index in MultiplexLayer switchTo message",
	LayerMultiplex_addLayer: "cc.Layer.addLayer(): layer should be non-null",
	EGLView_setDesignResolutionSize: "Resolution not valid",
	EGLView_setDesignResolutionSize_2: "should set resolutionPolicy",
	inputManager_handleTouchesBegin: "The touches is more than MAX_TOUCHES, nUnusedIndex \x3d %s",
	swap: "cc.swap is being modified from original macro, please check usage",
	checkGLErrorDebug: "WebGL error %s",
	animationCache__addAnimationsWithDictionary: "cocos2d: cc.AnimationCache: No animations were found in provided dictionary.",
	animationCache__addAnimationsWithDictionary_2: "cc.AnimationCache. Invalid animation format",
	animationCache_addAnimations: "cc.AnimationCache.addAnimations(): File could not be found",
	animationCache__parseVersion1: "cocos2d: cc.AnimationCache: Animation '%s' found in dictionary without any frames - cannot add to animation cache.",
	animationCache__parseVersion1_2: "cocos2d: cc.AnimationCache: Animation '%s' refers to frame '%s' which is not currently in the cc.SpriteFrameCache. This frame will not be added to the animation.",
	animationCache__parseVersion1_3: "cocos2d: cc.AnimationCache: None of the frames for animation '%s' were found in the cc.SpriteFrameCache. Animation is not being added to the Animation Cache.",
	animationCache__parseVersion1_4: "cocos2d: cc.AnimationCache: An animation in your dictionary refers to a frame which is not in the cc.SpriteFrameCache. Some or all of the frames for the animation '%s' may be missing.",
	animationCache__parseVersion2: "cocos2d: CCAnimationCache: Animation '%s' found in dictionary without any frames - cannot add to animation cache.",
	animationCache__parseVersion2_2: "cocos2d: cc.AnimationCache: Animation '%s' refers to frame '%s' which is not currently in the cc.SpriteFrameCache. This frame will not be added to the animation.",
	animationCache_addAnimations_2: "cc.AnimationCache.addAnimations(): Invalid texture file name",
	Sprite_reorderChild: "cc.Sprite.reorderChild(): this child is not in children list",
	Sprite_ignoreAnchorPointForPosition: "cc.Sprite.ignoreAnchorPointForPosition(): it is invalid in cc.Sprite when using SpriteBatchNode",
	Sprite_setDisplayFrameWithAnimationName: "cc.Sprite.setDisplayFrameWithAnimationName(): Frame not found",
	Sprite_setDisplayFrameWithAnimationName_2: "cc.Sprite.setDisplayFrameWithAnimationName(): Invalid frame index",
	Sprite_setDisplayFrame: "setDisplayFrame is deprecated, please use setSpriteFrame instead.",
	Sprite__updateBlendFunc: "cc.Sprite._updateBlendFunc(): _updateBlendFunc doesn't work when the sprite is rendered using a cc.CCSpriteBatchNode",
	Sprite_initWithSpriteFrame: "cc.Sprite.initWithSpriteFrame(): spriteFrame should be non-null",
	Sprite_initWithSpriteFrameName: "cc.Sprite.initWithSpriteFrameName(): spriteFrameName should be non-null",
	Sprite_initWithSpriteFrameName1: " is null, please check.",
	Sprite_initWithFile: "cc.Sprite.initWithFile(): filename should be non-null",
	Sprite_setDisplayFrameWithAnimationName_3: "cc.Sprite.setDisplayFrameWithAnimationName(): animationName must be non-null",
	Sprite_reorderChild_2: "cc.Sprite.reorderChild(): child should be non-null",
	Sprite_addChild: "cc.Sprite.addChild(): cc.Sprite only supports cc.Sprites as children when using cc.SpriteBatchNode",
	Sprite_addChild_2: "cc.Sprite.addChild(): cc.Sprite only supports a sprite using same texture as children when using cc.SpriteBatchNode",
	Sprite_addChild_3: "cc.Sprite.addChild(): child should be non-null",
	Sprite_setTexture: "cc.Sprite.texture setter: Batched sprites should use the same texture as the batchnode",
	Sprite_updateQuadFromSprite: "cc.SpriteBatchNode.updateQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
	Sprite_insertQuadFromSprite: "cc.SpriteBatchNode.insertQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
	Sprite_addChild_4: "cc.SpriteBatchNode.addChild(): cc.SpriteBatchNode only supports cc.Sprites as children",
	Sprite_addChild_5: "cc.SpriteBatchNode.addChild(): cc.Sprite is not using the same texture",
	Sprite_initWithTexture: "Sprite.initWithTexture(): Argument must be non-nil ",
	Sprite_setSpriteFrame: "Invalid spriteFrameName",
	Sprite_setTexture_2: "Invalid argument: cc.Sprite.texture setter expects a CCTexture2D.",
	Sprite_updateQuadFromSprite_2: "cc.SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null",
	Sprite_insertQuadFromSprite_2: "cc.SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null",
	Sprite_addChild_6: "cc.SpriteBatchNode.addChild(): child should be non-null",
	SpriteBatchNode_addSpriteWithoutQuad: "cc.SpriteBatchNode.addQuadFromSprite(): SpriteBatchNode only supports cc.Sprites as children",
	SpriteBatchNode_increaseAtlasCapacity: "cocos2d: CCSpriteBatchNode: resizing TextureAtlas capacity from %s to %s.",
	SpriteBatchNode_increaseAtlasCapacity_2: "cocos2d: WARNING: Not enough memory to resize the atlas",
	SpriteBatchNode_reorderChild: "cc.SpriteBatchNode.addChild(): Child doesn't belong to Sprite",
	SpriteBatchNode_removeChild: "cc.SpriteBatchNode.addChild(): sprite batch node should contain the child",
	SpriteBatchNode_addSpriteWithoutQuad_2: "cc.SpriteBatchNode.addQuadFromSprite(): child should be non-null",
	SpriteBatchNode_reorderChild_2: "cc.SpriteBatchNode.addChild():child should be non-null",
	spriteFrameCache__getFrameConfig: "cocos2d: WARNING: originalWidth/Height not found on the cc.SpriteFrame. AnchorPoint won't work as expected. Regenrate the .plist",
	spriteFrameCache_addSpriteFrames: "cocos2d: WARNING: an alias with name %s already exists",
	spriteFrameCache__checkConflict: "cocos2d: WARNING: Sprite frame: %s has already been added by another source, please fix name conflit",
	spriteFrameCache_getSpriteFrame: "cocos2d: cc.SpriteFrameCahce: Frame %s not found",
	spriteFrameCache__getFrameConfig_2: "Please load the resource first : %s",
	spriteFrameCache_addSpriteFrames_2: "cc.SpriteFrameCache.addSpriteFrames(): plist should be non-null",
	spriteFrameCache_addSpriteFrames_3: "Argument must be non-nil",
	CCSpriteBatchNode_updateQuadFromSprite: "cc.SpriteBatchNode.updateQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
	CCSpriteBatchNode_insertQuadFromSprite: "cc.SpriteBatchNode.insertQuadFromSprite(): cc.SpriteBatchNode only supports cc.Sprites as children",
	CCSpriteBatchNode_addChild: "cc.SpriteBatchNode.addChild(): cc.SpriteBatchNode only supports cc.Sprites as children",
	CCSpriteBatchNode_initWithTexture: "Sprite.initWithTexture(): Argument must be non-nil ",
	CCSpriteBatchNode_addChild_2: "cc.Sprite.addChild(): child should be non-null",
	CCSpriteBatchNode_setSpriteFrame: "Invalid spriteFrameName",
	CCSpriteBatchNode_setTexture: "Invalid argument: cc.Sprite texture setter expects a CCTexture2D.",
	CCSpriteBatchNode_updateQuadFromSprite_2: "cc.SpriteBatchNode.updateQuadFromSprite(): sprite should be non-null",
	CCSpriteBatchNode_insertQuadFromSprite_2: "cc.SpriteBatchNode.insertQuadFromSprite(): sprite should be non-null",
	CCSpriteBatchNode_addChild_3: "cc.SpriteBatchNode.addChild(): child should be non-null",
	TextureAtlas_initWithFile: "cocos2d: Could not open file: %s",
	TextureAtlas_insertQuad: "cc.TextureAtlas.insertQuad(): invalid totalQuads",
	TextureAtlas_initWithTexture: "cc.TextureAtlas.initWithTexture():texture should be non-null",
	TextureAtlas_updateQuad: "cc.TextureAtlas.updateQuad(): quad should be non-null",
	TextureAtlas_updateQuad_2: "cc.TextureAtlas.updateQuad(): Invalid index",
	TextureAtlas_insertQuad_2: "cc.TextureAtlas.insertQuad(): Invalid index",
	TextureAtlas_insertQuads: "cc.TextureAtlas.insertQuad(): Invalid index + amount",
	TextureAtlas_insertQuadFromIndex: "cc.TextureAtlas.insertQuadFromIndex(): Invalid newIndex",
	TextureAtlas_insertQuadFromIndex_2: "cc.TextureAtlas.insertQuadFromIndex(): Invalid fromIndex",
	TextureAtlas_removeQuadAtIndex: "cc.TextureAtlas.removeQuadAtIndex(): Invalid index",
	TextureAtlas_removeQuadsAtIndex: "cc.TextureAtlas.removeQuadsAtIndex(): index + amount out of bounds",
	TextureAtlas_moveQuadsFromIndex: "cc.TextureAtlas.moveQuadsFromIndex(): move is out of bounds",
	TextureAtlas_moveQuadsFromIndex_2: "cc.TextureAtlas.moveQuadsFromIndex(): Invalid newIndex",
	TextureAtlas_moveQuadsFromIndex_3: "cc.TextureAtlas.moveQuadsFromIndex(): Invalid oldIndex",
	textureCache_addPVRTCImage: "TextureCache:addPVRTCImage does not support on HTML5",
	textureCache_addETCImage: "TextureCache:addPVRTCImage does not support on HTML5",
	textureCache_textureForKey: "textureForKey is deprecated. Please use getTextureForKey instead.",
	textureCache_addPVRImage: "addPVRImage does not support on HTML5",
	textureCache_addUIImage: "cocos2d: Couldn't add UIImage in TextureCache",
	textureCache_dumpCachedTextureInfo: "cocos2d: '%s' id\x3d%s %s x %s",
	textureCache_dumpCachedTextureInfo_2: "cocos2d: '%s' id\x3d HTMLCanvasElement %s x %s",
	textureCache_dumpCachedTextureInfo_3: "cocos2d: TextureCache dumpDebugInfo: %s textures, HTMLCanvasElement for %s KB (%s MB)",
	textureCache_addUIImage_2: "cc.Texture.addUIImage(): image should be non-null",
	Texture2D_initWithETCFile: "initWithETCFile does not support on HTML5",
	Texture2D_initWithPVRFile: "initWithPVRFile does not support on HTML5",
	Texture2D_initWithPVRTCData: "initWithPVRTCData does not support on HTML5",
	Texture2D_addImage: "cc.Texture.addImage(): path should be non-null",
	Texture2D_initWithImage: "cocos2d: cc.Texture2D. Can't create Texture. UIImage is nil",
	Texture2D_initWithImage_2: "cocos2d: WARNING: Image (%s x %s) is bigger than the supported %s x %s",
	Texture2D_initWithString: "initWithString isn't supported on cocos2d-html5",
	Texture2D_initWithETCFile_2: "initWithETCFile does not support on HTML5",
	Texture2D_initWithPVRFile_2: "initWithPVRFile does not support on HTML5",
	Texture2D_initWithPVRTCData_2: "initWithPVRTCData does not support on HTML5",
	Texture2D_bitsPerPixelForFormat: "bitsPerPixelForFormat: %s, cannot give useful result, it's a illegal pixel format",
	Texture2D__initPremultipliedATextureWithImage: "cocos2d: cc.Texture2D: Using RGB565 texture since image has no alpha",
	Texture2D_addImage_2: "cc.Texture.addImage(): path should be non-null",
	Texture2D_initWithData: "NSInternalInconsistencyException",
	MissingFile: "Missing file: %s",
	radiansToDegress: "cc.radiansToDegress() should be called cc.radiansToDegrees()",
	RectWidth: "Rect width exceeds maximum margin: %s",
	RectHeight: "Rect height exceeds maximum margin: %s",
	EventManager__updateListeners: "If program goes here, there should be event in dispatch.",
	EventManager__updateListeners_2: "_inDispatch should be 1 here."
};
cc._logToWebPage = function(a) {
	if (cc._canvas) {
		var b = cc._logList,
			c = document;
		if (!b) {
			var d = c.createElement("Div"),
				b = d.style;
			d.setAttribute("id", "logInfoDiv");
			cc._canvas.parentNode.appendChild(d);
			d.setAttribute("width", "200");
			d.setAttribute("height", cc._canvas.height);
			b.zIndex = "99999";
			b.position = "absolute";
			b.top = "0";
			b.left = "0";
			b = cc._logList = c.createElement("textarea");
			c = b.style;
			b.setAttribute("rows", "20");
			b.setAttribute("cols", "30");
			b.setAttribute("disabled", !0);
			d.appendChild(b);
			c.backgroundColor = "transparent";
			c.borderBottom = "1px solid #cccccc";
			c.borderRightWidth = "0px";
			c.borderLeftWidth = "0px";
			c.borderTopWidth = "0px";
			c.borderTopStyle = "none";
			c.borderRightStyle = "none";
			c.borderLeftStyle = "none";
			c.padding = "0px";
			c.margin = 0
		}
		b.value = b.value + a + "\r\n";
		b.scrollTop = b.scrollHeight
	}
};
cc._formatString = function(a) {
	if (cc.isObject(a)) try {
		return JSON.stringify(a)
	} catch (b) {
		return ""
	} else return a
};
cc._initDebugSetting = function(a) {
	var b = cc.game;
	if (a != b.DEBUG_MODE_NONE) {
		var c;
		a > b.DEBUG_MODE_ERROR ? (c = cc._logToWebPage.bind(cc), cc.error = function() {
			c("ERROR :  " + cc.formatStr.apply(cc, arguments))
		}, cc.assert = function(a, b) {
			if (!a && b) {
				for (var f = 2; f < arguments.length; f++) b = b.replace(/(%s)|(%d)/, cc._formatString(arguments[f]));
				c("Assert: " + b)
			}
		}, a != b.DEBUG_MODE_ERROR_FOR_WEB_PAGE && (cc.warn = function() {
			c("WARN :  " + cc.formatStr.apply(cc, arguments))
		}), a == b.DEBUG_MODE_INFO_FOR_WEB_PAGE && (cc.log = function() {
			c(cc.formatStr.apply(cc, arguments))
		})) : console && (cc.error = function() {
			return 1
		}, cc.assert = function(a, b) {
			if (!a && b) {
				for (var c = 2; c < arguments.length; c++) b = b.replace(/(%s)|(%d)/, cc._formatString(arguments[c]));
				throw b;
			}
		}, a != b.DEBUG_MODE_ERROR && (cc.warn = function() {
			return console.warn.apply(console, arguments)
		}), a == b.DEBUG_MODE_INFO && (cc.log = function() {
			return console.log.apply(console, arguments)
		}))
	}
};
cc._initDebugSetting(cc.game.config[cc.game.CONFIG_KEY.debugMode]);
cc.loader.loadBinary = function(a, b) {
	var c = this,
		d = this.getXMLHttpRequest(),
		e = "load " + a + " failed!";
	d.open("GET", a, !0);
	/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent) ? (d.setRequestHeader("Accept-Charset", "x-user-defined"), d.onreadystatechange = function() {
		if (4 == d.readyState && 200 == d.status) {
			var a = cc._convertResponseBodyToText(d.responseBody);
			b(null, c._str2Uint8Array(a))
		} else b(e)
	}) : (d.overrideMimeType && d.overrideMimeType("text/plain; charset\x3dx-user-defined"), d.onload = function() {
		4 == d.readyState && 200 == d.status ? b(null, c._str2Uint8Array(d.responseText)) : b(e)
	});
	d.send(null)
};
cc.loader._str2Uint8Array = function(a) {
	if (!a) return null;
	for (var b = new Uint8Array(a.length), c = 0; c < a.length; c++) b[c] = a.charCodeAt(c) & 255;
	return b
};
cc.loader.loadBinarySync = function(a) {
	var b = this.getXMLHttpRequest(),
		c = "load " + a + " failed!";
	b.open("GET", a, !1);
	a = null;
	if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
		b.setRequestHeader("Accept-Charset", "x-user-defined");
		b.send(null);
		if (200 != b.status) return cc.log(c), null;
		(b = cc._convertResponseBodyToText(b.responseBody)) && (a = this._str2Uint8Array(b))
	} else {
		b.overrideMimeType && b.overrideMimeType("text/plain; charset\x3dx-user-defined");
		b.send(null);
		if (200 != b.status) return cc.log(c), null;
		a = this._str2Uint8Array(b.responseText)
	}
	return a
};
var Uint8Array = Uint8Array || Array;
if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
	var IEBinaryToArray_ByteStr_Script = '\x3c!-- IEBinaryToArray_ByteStr --\x3e\r\nFunction IEBinaryToArray_ByteStr(Binary)\r\n   IEBinaryToArray_ByteStr \x3d CStr(Binary)\r\nEnd Function\r\nFunction IEBinaryToArray_ByteStr_Last(Binary)\r\n   Dim lastIndex\r\n   lastIndex \x3d LenB(Binary)\r\n   if lastIndex mod 2 Then\r\n       IEBinaryToArray_ByteStr_Last \x3d Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n   Else\r\n       IEBinaryToArray_ByteStr_Last \x3d ""\r\n   End If\r\nEnd Function\r\n',
		myVBScript = cc.newElement("script");
	myVBScript.type = "text/vbscript";
	myVBScript.textContent = IEBinaryToArray_ByteStr_Script;
	document.body.appendChild(myVBScript);
	cc._convertResponseBodyToText = function(a) {
		for (var b = {}, c = 0; 256 > c; c++)
			for (var d = 0; 256 > d; d++) b[String.fromCharCode(c + 256 * d)] = String.fromCharCode(c) + String.fromCharCode(d);
		c = IEBinaryToArray_ByteStr(a);
		a = IEBinaryToArray_ByteStr_Last(a);
		return c.replace(/[\s\S]/g, function(a) {
			return b[a]
		}) + a
	}
};
cc = cc || {};
cc._loadingImage = "data:image/gif;base64,R0lGODlhEAAQALMNAD8/P7+/vyoqKlVVVX9/fxUVFUBAQGBgYMDAwC8vL5CQkP///wAAAP///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFAAANACwAAAAAEAAQAAAEO5DJSau9OOvNex0IMnDIsiCkiW6g6BmKYlBFkhSUEgQKlQCARG6nEBwOgl+QApMdCIRD7YZ5RjlGpCUCACH5BAUAAA0ALAAAAgAOAA4AAAQ6kLGB0JA4M7QW0hrngRllkYyhKAYqKUGguAws0ypLS8JxCLQDgXAIDg+FRKIA6v0SAECCBpXSkstMBAAh+QQFAAANACwAAAAACgAQAAAEOJDJORAac6K1kDSKYmydpASBUl0mqmRfaGTCcQgwcxDEke+9XO2WkxQSiUIuAQAkls0n7JgsWq8RACH5BAUAAA0ALAAAAAAOAA4AAAQ6kMlplDIzTxWC0oxwHALnDQgySAdBHNWFLAvCukc215JIZihVIZEogDIJACBxnCSXTcmwGK1ar1hrBAAh+QQFAAANACwAAAAAEAAKAAAEN5DJKc4RM+tDyNFTkSQF5xmKYmQJACTVpQSBwrpJNteZSGYoFWjIGCAQA2IGsVgglBOmEyoxIiMAIfkEBQAADQAsAgAAAA4ADgAABDmQSVZSKjPPBEDSGucJxyGA1XUQxAFma/tOpDlnhqIYN6MEAUXvF+zldrMBAjHoIRYLhBMqvSmZkggAIfkEBQAADQAsBgAAAAoAEAAABDeQyUmrnSWlYhMASfeFVbZdjHAcgnUQxOHCcqWylKEohqUEAYVkgEAMfkEJYrFA6HhKJsJCNFoiACH5BAUAAA0ALAIAAgAOAA4AAAQ3kMlJq704611SKloCAEk4lln3DQgyUMJxCBKyLAh1EMRR3wiDQmHY9SQslyIQUMRmlmVTIyRaIgA7";
cc._fpsImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAAgCAYAAAD9qabkAAAKQ2lDQ1BJQ0MgcHJvZmlsZQAAeNqdU3dYk/cWPt/3ZQ9WQtjwsZdsgQAiI6wIyBBZohCSAGGEEBJAxYWIClYUFRGcSFXEgtUKSJ2I4qAouGdBiohai1VcOO4f3Ke1fXrv7e371/u855zn/M55zw+AERImkeaiagA5UoU8Otgfj09IxMm9gAIVSOAEIBDmy8JnBcUAAPADeXh+dLA//AGvbwACAHDVLiQSx+H/g7pQJlcAIJEA4CIS5wsBkFIAyC5UyBQAyBgAsFOzZAoAlAAAbHl8QiIAqg0A7PRJPgUA2KmT3BcA2KIcqQgAjQEAmShHJAJAuwBgVYFSLALAwgCgrEAiLgTArgGAWbYyRwKAvQUAdo5YkA9AYACAmUIszAAgOAIAQx4TzQMgTAOgMNK/4KlfcIW4SAEAwMuVzZdL0jMUuJXQGnfy8ODiIeLCbLFCYRcpEGYJ5CKcl5sjE0jnA0zODAAAGvnRwf44P5Dn5uTh5mbnbO/0xaL+a/BvIj4h8d/+vIwCBAAQTs/v2l/l5dYDcMcBsHW/a6lbANpWAGjf+V0z2wmgWgrQevmLeTj8QB6eoVDIPB0cCgsL7SViob0w44s+/zPhb+CLfvb8QB7+23rwAHGaQJmtwKOD/XFhbnauUo7nywRCMW735yP+x4V//Y4p0eI0sVwsFYrxWIm4UCJNx3m5UpFEIcmV4hLpfzLxH5b9CZN3DQCshk/ATrYHtctswH7uAQKLDljSdgBAfvMtjBoLkQAQZzQyefcAAJO/+Y9AKwEAzZek4wAAvOgYXKiUF0zGCAAARKCBKrBBBwzBFKzADpzBHbzAFwJhBkRADCTAPBBCBuSAHAqhGJZBGVTAOtgEtbADGqARmuEQtMExOA3n4BJcgetwFwZgGJ7CGLyGCQRByAgTYSE6iBFijtgizggXmY4EImFINJKApCDpiBRRIsXIcqQCqUJqkV1II/ItchQ5jVxA+pDbyCAyivyKvEcxlIGyUQPUAnVAuagfGorGoHPRdDQPXYCWomvRGrQePYC2oqfRS+h1dAB9io5jgNExDmaM2WFcjIdFYIlYGibHFmPlWDVWjzVjHVg3dhUbwJ5h7wgkAouAE+wIXoQQwmyCkJBHWExYQ6gl7CO0EroIVwmDhDHCJyKTqE+0JXoS+cR4YjqxkFhGrCbuIR4hniVeJw4TX5NIJA7JkuROCiElkDJJC0lrSNtILaRTpD7SEGmcTCbrkG3J3uQIsoCsIJeRt5APkE+S+8nD5LcUOsWI4kwJoiRSpJQSSjVlP+UEpZ8yQpmgqlHNqZ7UCKqIOp9aSW2gdlAvU4epEzR1miXNmxZDy6Qto9XQmmlnafdoL+l0ugndgx5Fl9CX0mvoB+nn6YP0dwwNhg2Dx0hiKBlrGXsZpxi3GS+ZTKYF05eZyFQw1zIbmWeYD5hvVVgq9ip8FZHKEpU6lVaVfpXnqlRVc1U/1XmqC1SrVQ+rXlZ9pkZVs1DjqQnUFqvVqR1Vu6k2rs5Sd1KPUM9RX6O+X/2C+mMNsoaFRqCGSKNUY7fGGY0hFsYyZfFYQtZyVgPrLGuYTWJbsvnsTHYF+xt2L3tMU0NzqmasZpFmneZxzQEOxrHg8DnZnErOIc4NznstAy0/LbHWaq1mrX6tN9p62r7aYu1y7Rbt69rvdXCdQJ0snfU6bTr3dQm6NrpRuoW623XP6j7TY+t56Qn1yvUO6d3RR/Vt9KP1F+rv1u/RHzcwNAg2kBlsMThj8MyQY+hrmGm40fCE4agRy2i6kcRoo9FJoye4Ju6HZ+M1eBc+ZqxvHGKsNN5l3Gs8YWJpMtukxKTF5L4pzZRrmma60bTTdMzMyCzcrNisyeyOOdWca55hvtm82/yNhaVFnMVKizaLx5balnzLBZZNlvesmFY+VnlW9VbXrEnWXOss623WV2xQG1ebDJs6m8u2qK2brcR2m23fFOIUjynSKfVTbtox7PzsCuya7AbtOfZh9iX2bfbPHcwcEh3WO3Q7fHJ0dcx2bHC866ThNMOpxKnD6VdnG2ehc53zNRemS5DLEpd2lxdTbaeKp26fesuV5RruutK10/Wjm7ub3K3ZbdTdzD3Ffav7TS6bG8ldwz3vQfTw91jicczjnaebp8LzkOcvXnZeWV77vR5Ps5wmntYwbcjbxFvgvct7YDo+PWX6zukDPsY+Ap96n4e+pr4i3z2+I37Wfpl+B/ye+zv6y/2P+L/hefIW8U4FYAHBAeUBvYEagbMDawMfBJkEpQc1BY0FuwYvDD4VQgwJDVkfcpNvwBfyG/ljM9xnLJrRFcoInRVaG/owzCZMHtYRjobPCN8Qfm+m+UzpzLYIiOBHbIi4H2kZmRf5fRQpKjKqLupRtFN0cXT3LNas5Fn7Z72O8Y+pjLk722q2cnZnrGpsUmxj7Ju4gLiquIF4h/hF8ZcSdBMkCe2J5MTYxD2J43MC52yaM5zkmlSWdGOu5dyiuRfm6c7Lnnc8WTVZkHw4hZgSl7I/5YMgQlAvGE/lp25NHRPyhJuFT0W+oo2iUbG3uEo8kuadVpX2ON07fUP6aIZPRnXGMwlPUit5kRmSuSPzTVZE1t6sz9lx2S05lJyUnKNSDWmWtCvXMLcot09mKyuTDeR55m3KG5OHyvfkI/lz89sVbIVM0aO0Uq5QDhZML6greFsYW3i4SL1IWtQz32b+6vkjC4IWfL2QsFC4sLPYuHhZ8eAiv0W7FiOLUxd3LjFdUrpkeGnw0n3LaMuylv1Q4lhSVfJqedzyjlKD0qWlQyuCVzSVqZTJy26u9Fq5YxVhlWRV72qX1VtWfyoXlV+scKyorviwRrjm4ldOX9V89Xlt2treSrfK7etI66Trbqz3Wb+vSr1qQdXQhvANrRvxjeUbX21K3nShemr1js20zcrNAzVhNe1bzLas2/KhNqP2ep1/XctW/a2rt77ZJtrWv913e/MOgx0VO97vlOy8tSt4V2u9RX31btLugt2PGmIbur/mft24R3dPxZ6Pe6V7B/ZF7+tqdG9s3K+/v7IJbVI2jR5IOnDlm4Bv2pvtmne1cFoqDsJB5cEn36Z8e+NQ6KHOw9zDzd+Zf7f1COtIeSvSOr91rC2jbaA9ob3v6IyjnR1eHUe+t/9+7zHjY3XHNY9XnqCdKD3x+eSCk+OnZKeenU4/PdSZ3Hn3TPyZa11RXb1nQ8+ePxd07ky3X/fJ897nj13wvHD0Ivdi2yW3S609rj1HfnD94UivW2/rZffL7Vc8rnT0Tes70e/Tf/pqwNVz1/jXLl2feb3vxuwbt24m3Ry4Jbr1+Hb27Rd3Cu5M3F16j3iv/L7a/eoH+g/qf7T+sWXAbeD4YMBgz8NZD+8OCYee/pT/04fh0kfMR9UjRiONj50fHxsNGr3yZM6T4aeypxPPyn5W/3nrc6vn3/3i+0vPWPzY8Av5i8+/rnmp83Lvq6mvOscjxx+8znk98ab8rc7bfe+477rfx70fmSj8QP5Q89H6Y8en0E/3Pud8/vwv94Tz+4A5JREAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfcAgcQLxxUBNp/AAAQZ0lEQVR42u2be3QVVZbGv1N17829eRLyIKAEOiISEtPhJTJAYuyBDmhWjAEx4iAGBhxA4wABbVAMWUAeykMCM+HRTcBRWkNH2l5moS0LCCrQTkYeQWBQSCAIgYRXEpKbW/XNH5zS4noR7faPEeu31l0h4dSpvc+t/Z199jkFWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY/H9D/MR9qfKnLj/00U71aqfJn9+HCkCR/Wk36ddsgyJ/1wF4fkDfqqm9/gPsUeTnVr6a2xlQfnxdI7zs0W7irzD17Ytb2WT7EeNv/r4ox1O3Quf2QP2pgt9utwfout4FQE8AVBSlnaRmfvAURQkg2RlAbwB9AThlW5L0GaiKojhJhgOIBqDa7XaPrusdPtr5kQwF0BVAAoBIABRCKDd5aFUhRDAAw57eAOwAhKIoupft3zoqhB1AqLwuHIBut9uFt02qqvqRDJR2dAEQJj/BAOjn56dqmma+xiaECAEQAWAggLsB6A6HQ2iaZggBhBAqgEAAnQB0kzaEmT4hAITT6VQ8Ho/HJAKKECJQtr8LwD1y/A1/vcdfEUIEyfZ9AcQbYvZ942Px88L2UwlJR0dH0EMPPbRj5syZPUeNGrXR7Xb/641xIwJ1XY9NSUlZm52dfW+XLl1w8uRJzJ8//+OGhoYJqqqe1TSt1Wsm9NN1PSIqKmr12rVrR5WUlHy1bdu2AQCumWc3IYRD1/UwVVXnFRQUTIuNjUVzczN2797dWFJSkq8oymZd15sAGAEnFEUJ1nX9nzIzM1dnZmZGh4SE4OTJk5g5c+Zf29vbp9pstrMej6fVOyhIhgAYU1hY+B+hoaGoqKg4XVlZea+XTULTNFdCQsLGiRMnPuR2u3UhBOV9eeDAAWXTpk095DUe6WsoyRE5OTlr0tLSAux2O/bs2cO5c+e+pijKUpIXSHaQVAGkvPLKK++6XK4OksJLCFlXV2cvKSlJBFAjhU+x2WwhHo9nUHp6+urMzMy7wsLCUF9fjxdffPHjxsbGiTab7WuPx9NiEutOuq4PyMjI+M+srKyYqKgoHD58GDNmzNjq8XhyVFU9b/q+LH7hBAEYu3PnTlZVVRFAGgCX6f/tAHoOHDjwa0p27txp/JO9e/f+QM7cipw9nfL3kQBKt2zZQpJ87rnn6mQmoHilw2EACs+cOUOSrK+vZ1NTE0nyo48+IoBpxswoBcMJ4Ndjx471kOTFixe5d+9ekqTH42H//v13A4jyzpAURfEH0H/OnDnthu1z5sw558MmFUCPWbNmnaMP3nrrLZoyDmP8Hl68eDFJ8siRI9/Yc+zYMQKYKdtAztrTrl27xptRXV1NAKMAOAyBBBA/Y8aMdpLs6Ojgxx9//E37+++//29yvFXppwvAwMcee8xjtDHsuXLlCqOjo//ia3wsfpkoALqFhoZuIckJEyackimm3dQmEMDUmpoakmRISMhhAHOHDx/eQJIbN24kgKEyMAHAFRMTs2XXrl1saWkhSZ0kp0+ffhrAr3wEW/S8efOukORLL72kA1gKYMPWrVtJkk899dRJAHeYrgsEsIQkjx8/TgDvAPjd448/3kaSb7zxBmUa7vC6z53BwcFbSHL9+vU6Sc6aNes8gF5ewWAH0PfVV18lSQL4DMBGIcQ6AKtcLleBFC2jXtFt8ODBe0iyoqKCAJYByC8qKmJDQwOzsrK+MAmqo1OnTveHhoa+GRkZ+XZkZOSWiIiIvzgcjk9mzpypkWRmZuZpmbYbGV4AgPnNzc1sa2sjgN0A5iQmJtaSZHl5OQHcb/K3s81mW0uSTU1NBFAFYFbfvn1Pk+Tbb79NAA8IIVzW42/hByA+Pz/fLR/2ZXIda05NI/z9/TeR5J49ewhgqlxTrtI0jY2NjQQw3zTLuWJiYjaUlJToS5Ys6fjkk080kwDEeAmADcA9GzZsIElGRUW9CyAWwLApU6Y0kOSKFSsog9QICGdERMTGsrIyZmVlEcC9AB4IDw/fTpLbtm0jgN94CUAnAJmVlZVcs2aNZ/LkyRdJcvbs2b4EwAkgZfPmzTxw4AABFAN4BkC6vFeUSewcAO5duXIlSTIhIaEawGMAxgKYAmAGgCS73e5vrKVk/yGythANYEhCQsIhkly+fDkBpKqqGmL6DgIALDKN/3yZpVWQZGVlJQE8aPI3KiMjo5okV61aRQAjAPQBMPfIkSN0u90EUCBtsPiFEwpgbn19PdetW2fM5N4zQ9ekpKQqkty0aRMBpMjiWM6JEydIkoqirJUFJ6iq6pAPVy8A6cZMehMBUACEuVyuFwG8HBwcPEIWx367ZMkSjSQXLVrUJouTRorrkAHdA8BdQogsAOsKCwtJkmPGjDkvMw2bDDo/ADEjRoz4XylyFbm5uY0mAbjLyyZ/AOOrq6tZVlbWsWDBgo69e/eyoqKCgwcPPg4gSQaoIRbp27dvN7KF+tLSUr28vJwFBQXtMpvpYRIM7+wrAkDeqVOnePbsWQIoNKfzpiXPg8uXLydJJicnNwF4f+nSpW6STEtLq5fjYwhk1wkTJtSQ5Ouvv04AqTKj+N2xY8dIkgEBAW/Ie1v8wncRegwZMmQvSfbr12+3Ua33WqPfOWbMmP0kWVpaSgCDZAqcfejQIWNZsEGKgvnh9gfQb9myZd8nAEJVVZtMkUNk8CcNHTq0liR1XWdYWNhmH1mJIme80OnTp18x1rp5eXkEsNJms92Fb7e/IgEsvHz5Mp999tkmAI/l5uZeMC0B7vEqqAYAyL106RJJsra2lpWVld+sucePH38ZQG+5NncBeOrgwYMkqbe3t/Po0aOsra011wAWyl0H7x0JJ4DE+fPnu0kyPT29DsDdUrBuyNKEEAkAdpw/f/6GeoEM8GUmfwEgPCIiopwkGxsbabPZPgOw6L777vvm4p49e26VGYjFLxUhhD+ApLKyMp44ccIoVnXybgbgzkcfffRzklyzZg0BDJYCMMmoCwQFBXkLgLGWvvcWAgBToSsKwNPTp09vMR7UuLi4rwH0lgU8c/Db5ezbeeTIkRWzZ8++aMxu+fn5BPCADBwHgP4LFy701NXVEUAJgAnPP/98kyxMNgHo53A4zH77BQQETMvPz7+Um5vbBuAlAFMSExPPmdbVL0qh8Acw8fDhw5SCchVAEYAVb775JknyhRdeaJYztHfxMwLAaqNwCGC2FArv8x0hAHKNLGPKlCme5OTk/Zs3bzb7O0wKiiG8KXl5ed8IxenTp0mSR48e1UmyW7duWywBuD2xyQcgFECgoih+8H1gyJgZV5Lkyy+/3CbTRIePtl2HDBmyw1QBHyGDdXZdXR1JUghRKkXBjOMHCoBdpr0L3nvvPZLkF198wejo6O0A4lVVDTb74HQ6AwD8Wq7Jh8rgGgDgQ13XjVR8qaxJuADMbmlpYXl5uV5UVNRWUFDgfv/993Vj/ZydnU1c37eHXML4S3viAcQqitJD2l104cIFY8lTKsXSBWBMVVWVcd9yed2A1NTUQ6Zl00CvLMMOoHdubm6zFIlWOf5+PsY/Kj09vdrU11QAwwGsv3jxIk21m2DZr10I0RXAuAcffPBgaWkpV69eTYfDcdiwUxY0w6xw+flX8L1xApjevXv3lREREaW6rofB93aPDUDQpEmTMgHgtddeqwBwEd/utZvpqK6uPgEAcXFxkA94NwB9unfvjrNnz4LklwDcf08iIqv66Zs2bXrl4YcfxooVKxAbG7uqrq5uAYA2TdOEqqpGYIi2tjbl6aeffu/YsWPv5uTk7JaC1wHg4Pnz542MwoVvTx+21dbWYvjw4WLixIl+2dnZ9lGjRgmSTE1NRUpKCkwFTGiaxtTU1OXTpk3707Bhw/6g67pDipnT4biuj7qut+Lbk3Vf1tTUXI9qu91Pjq1QFEUBgJaWFgBo8yGOQ8eNGxcAAOvXr/8QwBUfYygAKL169eoCABcuXACAWtn2hOGv0+kMNO1KiPDw8F4A4rZv3/7R1KlTR0+bNu1ht9u9r1+/fqitrQXJgwDarRC6/QjPzs4+QJIffPCB9/aQmSAA43ft2mW0e1QGoi8CAPyLsZccExNTC2BlRkbGRdOyYJCP2csBIN6UAZzCd7cBbQCijYp/dXU1ExMTz6SmptaMHj36f9LS0vYlJCRsl6mxIWSdu3fv/g5J7t+/nwC2AShMTk6+SJKff/45AWRLYbD7+fndAeDf5BJnLoCCyZMnt5JkdnZ2C4B/F0KEm1Pu+Pj4rST55ZdfEsBWAK+mpaVdMo3raDn7KwDuSEpK+m+S3LBhAwG8DuCtHTt2UBbpjgC408vvcFVV15HkuXPnjMp+p5uMf0RcXNyHJNnQ0EBVVfcCWBQXF3fG+Jv0yxABPwB5LS0tRmFxN4BlTzzxxGWSXLx4sS5F3GGFy+1Hp5SUlJq6ujoWFxdTpsZ2H+0iIyMj/0iSWVlZX5mr5jfJFroPGzasxlhTnjp1iiTZ3NxMl8tlrCd9pfa9SkpKSJI5OTmnZOageLUZZqxvfVFWVkZcPwdgNwnSCKPqb17jkmR8fPzfZMDZ5CRsFBmNI7h95s2b1yhT7/MAYmStwCx4vy0uLqa3v5qmEcCfvSr1QQAeXb16NY3Cm3HQ55133iGAp+SxZTNhKSkpfzUddkrFjYevzAQCeGjp0qXfsYckY2NjTwD4leGDLCL2HTdunNtoY+zWSHFcIHdsFCtcfuZ1vO9Eqs3m7/F47sb1k2qX/f3997W2tl7BjWfpBYDOzzzzzIVJkyZh0KBBCwEsB3AJvl9AETabLcDj8dwRFRW1ctasWb8JCgpSzp07d62wsPC/Wltb8xRFadR1/ZqPXYbgAQMGbI2Pjw/+6quv9ldVVT0r01ezuPRJSUn5Y9euXXVd11WzDaqq6kePHm3+7LPPRgO4KlNuxWazhXo8nuTk5OSXMjIyEl0uFxoaGtqKior+dPXq1VdUVT0jj7r68ieoT58+vx8yZMjdx48fP1JVVTVF9m20VW02WyfZf97YsWPjXS4X6urqWvPy8jYCWCyEuEDS8FdVFKWzruv//OSTTy5OTk7uqWkaPv3007qysrJ8RVH+LI8ym8/rB3Tu3HnRI488knLo0KG2ffv2ZQI4C98vP6mqqoZqmpaclpa2cOTIkX39/f3R0NDQUVxc/G5TU9PLqqrWa5rWLH1QVFUN0TStX1JSUvH48eP7BwYG4uDBg1cKCgpeBbBe2u+2Qug2EwD5N5sMPuNtMe8XP4TT6Qxoa2sbIGeXvUKIK7d4IISiKC5d1wPljOfA9bPwzYqiXNV13dd6Uqiq6qdpml2mpe02m63d4/G4vcTF5fF47LJf71nJA6BZVVW3pmntuPHlmAD5wk6Q9NnbHp9vHaqq6tA0zU/64PZhk1FfCZB9G/23ALiqKEqzD39tpvbGUqoFwFUhRLP3yzpCCDtJpxyXDulfG27+pqRR3DXsUWVd4Yq0x/taVQjhIhksC8L+ABpM9ljBf5sKwI8pIBr75L5E4vvu+UNeG/a+hv+AL7yFH8qPtOfHjtOP6V/Bja8D6z/B2Nys/1u9Xv33tLf4GfF/LC4GCJwByWIAAAAASUVORK5CYII\x3d";
cc._loaderImage = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAlAAD/4QMpaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjAtYzA2MCA2MS4xMzQ3NzcsIDIwMTAvMDIvMTItMTc6MzI6MDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjM4MDBEMDY2QTU1MjExRTFBQTAzQjEzMUNFNzMxRkQwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjM4MDBEMDY1QTU1MjExRTFBQTAzQjEzMUNFNzMxRkQwIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzUgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkU2RTk0OEM4OERCNDExRTE5NEUyRkE3M0M3QkE1NTlEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkU2RTk0OEM5OERCNDExRTE5NEUyRkE3M0M3QkE1NTlEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQADQkJCQoJDQoKDRMMCwwTFhENDREWGhUVFhUVGhkUFhUVFhQZGR0fIB8dGScnKionJzk4ODg5QEBAQEBAQEBAQAEODAwOEA4RDw8RFA4RDhQVERISERUfFRUXFRUfKB0ZGRkZHSgjJiAgICYjLCwoKCwsNzc1NzdAQEBAQEBAQEBA/8AAEQgAyACgAwEiAAIRAQMRAf/EALAAAAEFAQEAAAAAAAAAAAAAAAQAAgMFBgcBAQEAAwEBAAAAAAAAAAAAAAAAAQMEAgUQAAIBAgIEBwoLBgQGAwAAAAECAwAEEQUhMRIGQVFxsTITFGGBwdEiQlKSMzWRoeFicqKyI1NzFYJjJDQWB9KjVCbxwkNkJWXik3QRAAIBAgMFBQcDBQEAAAAAAAABAhEDIRIEMUFRcTJhwVIUBZGhsSJyEzOB0ULhYpIjUxX/2gAMAwEAAhEDEQA/AMJSpUqAVKlXuFAeUq9wpUB5XuFe4V6ooDzZHDox0CnGMinzwl7Z8NajaHeoO3vmTBZBtp9YUIqTEV5ROxHKnWRnaU8VRMhFBUjpV7hSoSeUq9pUB5Sr2lhQHlKvcK8oBV7hSFSRrtaKAZs07YNPM1pG2xJIAw1jSeandry/8X4m8VCKkWwaWwam7Xl/4v1W8VLtmX/i/VbxUoKkWwakSM407tmX/i/VbxUmzGwjQsjdY41IARie/U0IbZO0kNtCXnOCkEBeFu4KI3Bs7DNb27ya+jDx3kJeEnpJJEcQVbWDsk17u5urd591ucZkWhym2Vnd9RkCDEpFxDRpbw0bunu5mlp2De2FMLYXOD2wB2xbOeraUcYGJ72mlSUiqzzdzMd3Z3mixltA2yzcK/NlHM1DQyRXce1HocdNOEfJXZ88y9ZojOqhiBszIRiHQ8Y4cK5TvHuzLljHNMqxNoDjLFraHHnjPxcNCGVbxEUzYNTx5jZSxhpW6qTzlwJ+DCvO2Zf+L9VvFSgqyHYNLYNTdssPxfibxUu15f8Ai/VPiqCakOwa82DU/a8v/F+JvFTDdWPBL8R8VKCvYRYV5UzoMAy6QdIIqI0B4KJtxiRQwou16QoGUkntH5Tz0RbZbmF2hktraSVBo2lUkY8tDye0flPPXTslVUyiyVRsjqUOA4yMT8dW2ram2m6UVTNq9S7EIyUVJydMTn/6DnP+im9Wl+g5z/opvVrpteEhQWY4AaSTwAVf5WPiZh/9S5/zj7zltzlmYWkfWXNvJDGTgGcYDHirR7i7mSbwXParsFMrgb7w6jKw/wCmnc9I14kF3vpvCljbMyWMOJL4aEiB8qU/ObUK7HYWVrl1pFZWiCOCBQqKOLjPGTrNZZqKbUXVHq2nNwTuJRk1VpbgXN8s7Rk5ym0UQQzhIG2NAjhxHWbI+gCBVjBBFbwxwQqEiiUJGg1BVGAFe7dV28WYLYZFmF2Th1UD7JGjymGyn1iK5OyzIBGB1HgrLZhamzumQAGJwSqnSCh1q3GOCodxt4cxurdcpzuN4cyhiWaF5Bg09udUmnWw1H/jV9nFuJ7Quo+8h8peThFA+047vduyMtk7fYqTl07YFdfUufMPzT5p71UdtlmYXaGS2t3mQHAsgxANdadYJopLe4QS2867EsZ4QfCNYrCFbjdDPmgkYyWFxgVf04ifJf6ScNdRUW1XBb6FU5TjF5EpSSrGu/s5lN+g5z/opvVpfoOc/wCim9WtdHnatvObJXDW7xLGhB8nrPaY9/HCr+tEdPCVaSeDoYLnqF63lzW4/PFSW3ecxbI84VSzWUwUaSdg0DXXK5nvAipnd6qgKvWnQO7pri9ZUEmm3Vl2j1kr8pRlFRyquBNZjGxQ/S56Y1S2fu9OVueon11Szahoou06QoQUXadIVCD2FJJ7R+U89dMydv8Axdn+TH9muZye0flPPXQstlK5Tbka1gUjlC1q0vVLkeb6r+O3Tx9xcY1nt8c0NrZCyiOE1108NYjGv1joo7Js1jzKyScYLIvkzL6LDwHXVJksH9Sb49dKNq0tj1jA6uriOCL+02FWX7iVtZX1/AzaHTyeoauKn2MX9W79zebiZCuR5MjSrhfXuEtwTrUeZH+yNfdrRNcxI6IzhXlJEak6WIGJ2Rw4ChWnChndtlVBLMdQA0k1gbXNMzzDfDLs6mjaPKppJbWwJ1bOwwxw43OnHh71YT3DpfWUJmFlb5jHHDdeXBHIsrRea5TSqvxqG04cNN62vetoCS4tre5mgnkGE9q+3DKOkuI2WX6LDQRRHWDh1UCtwj7QRg2wdl8Djgw1qe7XvW0BQ3kfZ7mSLgU+T9E6RVbnuVrnWVSWqj+Lt8ZbRuHEdKPkYVcZ2MJY5fSGyeVar45+rkWQHAqccalPE5km1htWK5nK4Wnt5FuUBUwOMG4nGkA/BXUrW4S6torlOjMgcd/xVn7rLo7zKs0uEjCNeSvdwoBhgsZxX1l2j36k3Lu+uyprdj5Vs5A+i/lD48a0aaVJOPi7jB6lbzWozpjB48pf1NDXNN4vfl7+Z4BXS65pvF78vfzPAK71XTHmZ/S/yT+jvJ7L3fHytz1E+upbL+Qj5W56jfXWRnsIYKLtekKEFGWvSFQgyjk9o/Keet3YthlMP/5x9msJJ7R+U89biyb/AMXEv7gD6tadL1T+kwepRrC39ZkLDMbiwMvUHRPG0bjlGg8ore/23sxBldxfMPLupNhT8yL/AORNZbdzJ484scytxgLqJY5LZj6Q2sV5G1Vud1mjjyG0ij0NEGSZToKyhjtqw4waztuiXA3qKTbSxltfGhbZlE95ZtZqxVbgiOZhrER9ph3Svk9+pJILZ4Y4DGBFCUMKjRsGPobPFhUfW0NJmljE2xJcIrcI2vFUEln1lRXd6lrazXT9GCNpD+yNqoI7mOVduNw6nzlOIoPOUa6yye1XXcbMR5GdQ3xY0BSbj31/FcTQZirJ+q431q7anbHCTZ72Bw7lbPrKBMcBWNNgbMBBh+bsjBdni0VJ1lARZs6yWiupxCuMDy6KpS2IwOo6DTr3Mre3e5tZZVUM4ZBjqOOJoWO4jkXajcOOMHGgDISvWIrdAkKR80+TzVl908bPPL3LzxOuHdifxVfiTAg92qI/w+/8gGgSyN/mR7XPVlp0lF/3L3mbVKtu5Hjbk/8AHE2Fc03i9+Xv5ngFdKNc13i9+Xv5ngFaNV0x5nn+l/kn9HeEWXu+PlbnqJ9dS2Xu9OVueon11kZ7CGCjLXpCgxRlr0hUIPYUcntH5Tz1s8vb+Bt1/dqPirGSe0flPPWusG/g4Py15q06XqlyMWvVYQ+ruI9xJOqzO9hOto/sP8tbGOFIrmWeM7IuMDMnAXXQJOUjQeOsJk0nY96ip0CYunrjaHx1t+srPJUbXBm2LrFPikwTOb+T+VhbZxGMrDXp83x1QSy2tucJpUjPETp+Cn5/ftaRvKvtp3Kx48HG3erHMzOxZiWZtLMdJNQSbbL71Vk6yynViOkqnEEfOWtPbXi3EQkGg6mXiNckjeSJxJGxR10qw0GtxuxmvbImD4CZMFlA4fRfv0BqesqqzTMZNMEDbIHtHH2QeCiZJSqMQdOGiue53mz3czQwsRbIcNHnkec3c4qAMuriz68gTIToxwOOnlp0MjxMJYW741Gs3RVldtbygE/dMcHX/moDaxTiWNZB53B3arb8/wC+4SOF4sf/AKxU9kcBsfOGHfoUHtG/RbzY5Die5HHhXdvavqiZ9Q8Jdlq4/gbKua7xe/L38zwCuhpf2Uk/Zo50kmwJKIdogDjw1VzzeL35e/meAVp1LTgqY4nn+mRauzqmqwrjzCLL3fHytz1E+upLL+Qj5W56jfXWRnroYKLtekKEFF2vSFQg9hSSe0flPPWosm/hIfoLzVl5PaPynnrRWb/w0X0F5q06XqlyM2sVYx5gmbFre/t71NY2T+0h8VbSO5SWNJUOKSAMp7jDGspmMPaLRlXS6eWve1/FRO7WYdbZm1Y/eW/R7qHxHRXGojlm3ulid6aVbaW+OALvgCLq2Hm9WxHKWqjhj6xsK1e8dm15l4niG1LZkswGsxtrPeOmsvayBJA1VItlWjptLuTdPMo7LtjRDq9naK4+WF9IrUW7BaHOljGqVHB7w2hzVoZt87d8vaNYSLl02CcRsDEbJbj71Uu7UBkvJ7/D7q2QoDxySaAO8MTXdxRVMpRp5XZOWdF/ms7R5XdyKfKWJsO/5PhrG5XlNxmEywW6bTnTxAAcJNbGSMXkM1pjgbiNo1PziPJ+Os7u7m/6ReM00ZOgxSpqYYHT3wRXMKN4ll9zUG4bQfNshu8sZVuEA2hirA4qe/VOwwrVbzbww5mI44UKRRYkbWG0S3JWctbd7u5WFfOOLHiUdJqmaipfLsIsObhWe001lMkMVvJNjhghIALMcBxCs7fxXQmkupx1bXDswGPlaTidVaEyKNXkoo4eBV+Sq7L7Vs9zcBgeyQ4GQ/MB1crmoim2orezqcowTuSeEY48jQ7oZX2PLzdyLhNd6RjrEY6I7+uspvH78vfzPAK6UAAAFGAGgAcArmu8Xvy9/M8ArTfio24RW5nnaG67uou3H/KPuqT2X8hHytz1G+upLL3enK3PUb66ys9RDBRdr0hQgou06QqEGUkntH5Tz1e238vF9BeaqKT2j8p56vbb+Xi+gvNWjTdUuRn1XTHmTh8KrJTJlt8t1CPIY44cGnpJVjTJYkmjaN9Ib4u7V923njTethRauZJV3PaW1rfLIiXEDYg6R4VYc9CXW7thfOZbKdbGZtLW8uPVY/u3GrkNUkM9zlcxUjbhfWOA90cRq4gv4LhdqN+VToNYWmnRm9NNVWNTyHc6VWBv8wt4YeHqm6xyPmroq1Z7WGFLSxTq7WLSuPSdjrkfumq5yHXDUeA92oO2SKpVumNAaoJLMXH3myp0rpJ4uKhc3tbDM5BMri1zAj79j7KTiY8TcdBpcsith0286o+sPCagEX9Pzg4zXUCp6QYse8oouCG3tk6m1BYv05W6T+IdyolxbHDAAa2OgDlNCz3ryN2WxBd5PJMg1t81eId2ukqnLlTBbfcuY+9uJLiRcvtPvHdsHK+cfRHcHDWsyawjyy0WBcDI3lTP6TeIcFV+S5OmXx9bJg1048o8Cj0V8Jq2DVu09nL80up7OxHi+oal3P8AXB/IsZS8T/YOV65zvCcc7vfzPAK3ivWCz445zeH954BXOr6I8yfSfyz+jvCLP3fHytz1G+upLP3fHytz1E+usbPaQ0UXadIUIKLtekKhB7Ckk9o/Keer22/l4/oLzVRSe0flPPV7b/y8X0F5q0abqlyM+q6Y8yQsBTDMor1o8aiaE1pbluMqS3sbLLHIhSRQyngqukhaJ9uBjo+H5aOa3ao2t34qouRlLajTalGP8v0IY8ylXQ+PKPFU/bYXOLPge6CKia0LaxTOxHu1Q7cuBd9yPEJ7TbjXKO8CajbMIF6CNIeNvJHjqIWJ7tSpYkalqVblwIdyG+RGXur0hXYJFxal+Dhq5y3slkv3Y2pD0pTr+QUClpJRUdo9XW4OLrTHtM16cZLLWkeC7y4jvlNEpcRtw1Ux27Ci448NZrTFy3nn3IQWxlgGrDZ3pza7/M8ArZo+ArF5171uvp+CqdV0R5l/psUrs2vB3hdl7vTlbnqJ9dS2Xu+PlbnqJ9dY2eshooq16QoQUXa9IVCD2FLJ7RuU89WNtmUSQqkgYMgw0accKrpPaPynnrZWG4Vi+VWmY5tnMWXG+XrIYnA0rhj0mdcTgdNdwnKDqjmduM1SRR/qlr8/4KX6pa8T/BVzDuLZXudRZblmbxXcPUNPc3KqCIwrbOzgrHEnHjoyD+3eSXkht7DeKG4umDGOJVUklfouThXfmbnZ7Cvy1vt9pmv1W1+d8FL9VteJvgq5yrcOGfLmzHN80iyyETPbptAEFo2ZG8pmUa1OFNn3Ky6W/sbDKM5hv5bx2WTZA+7RF2y52WOPJTzE+z2Dy1vt9pT/AKpacTerS/U7Tib1a04/t7kDXPY03jhN0W6sQ7K7W3q2dnrMccaDy/8At80kuZfqWYxWNtlcvUPPhiGYhWDeUy7IwYU8xPs9g8tb7faUn6pacTerTxm9oOBvVq3v9z927aynuId44LiWKNnjhAXF2UYhRg516qpsryjLr21665zFLSTaK9U2GOA87SwqY37knRU+BzOzags0s1Oyr+BKM6sxwP6tSDPLMen6vy0rvdm3Sxlu7K/S7WDDrFUDUTxgnTU826eXW7KlxmqQuwDBXUKcD+1Xee/wXuKX5XDGWLapSVcOyhEM/seJ/V+WnjeGx4pPV+Wkm6kKZlFay3Jlt7iFpYZY8ASVK6DjtDDA0f8A0Tl340/1f8Ndx8xJVWXB0KbktFFpNzdVXAC/qOwA0CQni2flrO3Vwbm5lnI2TKxbDirX/wBE5d+NcfV/wVR7xZPa5U9utvI8nWhmbbw0YEAYYAVxfhfy5rlKR4Fulu6X7mW1mzT8S4Yis/5CPlbnqJ9dSWfu9OVueon11mZvQ2i7XpChKKtekKhBlNJ7R+U89bDfGTb3a3ZX0Lcj6kdY+T2j8p560288m1kWQr6MJ+ylSAr+2cnV5renjs3H1loX+3j9XvbbtxLN9lqW4UnV5jdnjtXHxihtyZNjeSBu5J9k1BJe7xy7W5CJ/wCzuD/mTVTf2+fq97LJuLrPsNRueS7W6aJ/38x+vLVXuY+xvHaNxbf2GoCezf8A36j/APsSf8w1sLnqczTefJluYoLm5uo5F61sBshItP1cNFYe1f8A3ir/APfE/wCZUe9bB94r5jwuPsrQFhmG4l/Z2M17HdW90tuu3IkTHaCjWdIw0VVZdks9/C06yJFEp2dp+E1bbqybGTZ8vpQD7L1XRv8A7blT96Oda7tpNuuNE37Cq9KSisjyuUoxrStKllHbLlWTXsMs8chuSuwEPDqwoLe5y+YRE/gLzmqRekvKKtd4327yM/ulHxmrHJStySWVRyrjxKI2XC/CTlnlPPKTpTdFbP0L1bgrf5Lp0G3dPhQHwV0S1lzBsns3sESR8Crh9WAJGjSOKuU3E+zdZQ3oJh8IArdZXFDmOTpHa3i2+YrI2KtKy4ricBsBuHHgFXSo440+Wa2qqxjvM9uMoy+WvzWpLCWWWE28HxL6e43ojgkeSCBY1Ri5BGIUDT51cl3vm276BBqSEH4WbxV0tlkyXJcxTMb+OW6uY9mGHrCzDQwwAbTp2uKuTZ9N1uYsfRRR8WPhrm419mSSjRyiqxVK7y23B/ftuTm2oSdJyzNVw3BFn7vTlbnqF9dS2fu9OVueon11lZuQ2iLdsGFD05H2dNQGV0ntG5Tz1dWm9N1b2kVq8EVwsI2UaQaQOKhmitZGLOmk68DhSFvY+gfWNSAg7z3Qvo7yKCKIohiaNR5LKxx8qpxvjcqS0VpbxvwOAcRQPZ7D0G9Y0uz2HoH1jUCpLY7zXlpbm3eKO5QuzjrBqZji3x17PvNcyT288VvDBJbMWUovS2hslW7mFQ9nsPQPrGl2ew9A+saCod/WNxtbYsrfb17WBxx5ddD2281xC88klvDcSXEnWuzrqOGGC9zRUPZ7D0G9Y0uzWHoH1jQVCLreq6ntZbaO3it1mGy7RjTs1X2mYy20ZiCq8ZOODcdEdmsPQb1jS7PYegfWNdJuLqnQiSUlRqpFLmryxtH1Ma7Qw2gNNPOdSt0oI27p007s9h6B9Y0uz2HoH1jXX3Z+I4+1b8IJdX89xLHKQFMXQUahpxoiPN5P+onfU+A0/s9h6DesaXZ7D0D6xpG7OLbUtu0StW5JJx2bBsmbtiSiEk+cxoCWWSaVpZOk2vDVo0VYdnsPQb1jSNvZcCH1jSd2c+p1XAmFqEOmOPEfaH+BQd1ueo211IzrgFUYKNAAqI1WztCpUqVCRUqVKgFSpUqAVKlSoBUqVKgFSpUqAVKlSoBUqVKgFSpUqAVKlSoD/9k\x3d";
var cc = cc || {},
	ClassManager = {
		id: 0 | 998 * Math.random(),
		instanceId: 0 | 998 * Math.random(),
		compileSuper: function(a, b, c) {
			a = a.toString();
			var d = a.indexOf("("),
				e = a.indexOf(")"),
				d = a.substring(d + 1, e),
				d = d.trim(),
				e = a.indexOf("{"),
				f = a.lastIndexOf("}");
			for (a = a.substring(e + 1, f); - 1 != a.indexOf("this._super");) {
				var e = a.indexOf("this._super"),
					f = a.indexOf("(", e),
					g = a.indexOf(")", f),
					g = a.substring(f + 1, g),
					g = (g = g.trim()) ? "," : "";
				a = a.substring(0, e) + "ClassManager[" + c + "]." + b + ".call(this" + g + a.substring(f + 1)
			}
			return Function(d, a)
		},
		getNewID: function() {
			return this.id++
		},
		getNewInstanceId: function() {
			return this.instanceId++
		}
	};
ClassManager.compileSuper.ClassManager = ClassManager;
(function() {
	var a = /\b_super\b/,
		b = cc.game.config[cc.game.CONFIG_KEY.classReleaseMode];
	b && console.log("release Mode");
	cc.Class = function() {};
	cc.Class.extend = function(c) {
		function d() {
			this.__instanceId = ClassManager.getNewInstanceId();
			this.ctor && this.ctor.apply(this, arguments)
		}
		var e = this.prototype,
			f = Object.create(e),
			g = ClassManager.getNewID();
		ClassManager[g] = e;
		var h = {
			writable: !0,
			enumerable: !1,
			configurable: !0
		};
		f.__instanceId = null;
		d.id = g;
		h.value = g;
		Object.defineProperty(f, "__pid", h);
		d.prototype = f;
		h.value = d;
		Object.defineProperty(d.prototype, "constructor", h);
		this.__getters__ && (d.__getters__ = cc.clone(this.__getters__));
		this.__setters__ && (d.__setters__ = cc.clone(this.__setters__));
		for (var k = 0, m = arguments.length; k < m; ++k) {
			var n = arguments[k],
				q;
			for (q in n) {
				var s = "function" === typeof n[q],
					r = "function" === typeof e[q],
					t = a.test(n[q]);
				b && s && r && t ? (h.value = ClassManager.compileSuper(n[q], q, g), Object.defineProperty(f, q, h)) : s && r && t ? (h.value = function(a, b) {
					return function() {
						var c = this._super;
						this._super = e[a];
						var d = b.apply(this, arguments);
						this._super = c;
						return d
					}
				}(q, n[q]), Object.defineProperty(f, q, h)) : s ? (h.value = n[q], Object.defineProperty(f, q, h)) : f[q] = n[q];
				if (s) {
					var u, y;
					if (this.__getters__ && this.__getters__[q]) {
						var s = this.__getters__[q],
							v;
						for (v in this.__setters__)
							if (this.__setters__[v] == s) {
								y = v;
								break
							}
						cc.defineGetterSetter(f, s, n[q], n[y] ? n[y] : f[y], q, y)
					}
					if (this.__setters__ && this.__setters__[q]) {
						s = this.__setters__[q];
						for (v in this.__getters__)
							if (this.__getters__[v] == s) {
								u = v;
								break
							}
						cc.defineGetterSetter(f, s, n[u] ? n[u] : f[u], n[q], u, q)
					}
				}
			}
		}
		d.extend = cc.Class.extend;
		d.implement = function(a) {
			for (var b in a) f[b] = a[b]
		};
		return d
	}
})();
cc.defineGetterSetter = function(a, b, c, d, e, f) {
	if (a.__defineGetter__) c && a.__defineGetter__(b, c), d && a.__defineSetter__(b, d);
	else if (Object.defineProperty) {
		var g = {
			enumerable: !1,
			configurable: !0
		};
		c && (g.get = c);
		d && (g.set = d);
		Object.defineProperty(a, b, g)
	} else throw Error("browser does not support getters");
	if (!e && !f)
		for (var g = null != c, h = void 0 != d, k = Object.getOwnPropertyNames(a), m = 0; m < k.length; m++) {
			var n = k[m];
			if ((a.__lookupGetter__ ? !a.__lookupGetter__(n) : !Object.getOwnPropertyDescriptor(a, n)) && "function" === typeof a[n]) {
				var q = a[n];
				if (g && q === c && (e = n, !h || f)) break;
				if (h && q === d && (f = n, !g || e)) break
			}
		}
	a = a.constructor;
	e && (a.__getters__ || (a.__getters__ = {}), a.__getters__[e] = b);
	f && (a.__setters__ || (a.__setters__ = {}), a.__setters__[f] = b)
};
cc.clone = function(a) {
	var b = a.constructor ? new a.constructor : {},
		c;
	for (c in a) {
		var d = a[c];
		b[c] = "object" != typeof d || !d || d instanceof cc.Node || d instanceof HTMLElement ? d : cc.clone(d)
	}
	return b
};
cc = cc || {};
cc._tmp = cc._tmp || {};
cc.associateWithNative = function(a, b) {};
cc.KEY = {
	backspace: 8,
	tab: 9,
	enter: 13,
	shift: 16,
	ctrl: 17,
	alt: 18,
	pause: 19,
	capslock: 20,
	escape: 27,
	pageup: 33,
	pagedown: 34,
	end: 35,
	home: 36,
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	insert: 45,
	Delete: 46,
	0: 48,
	1: 49,
	2: 50,
	3: 51,
	4: 52,
	5: 53,
	6: 54,
	7: 55,
	8: 56,
	9: 57,
	a: 65,
	b: 66,
	c: 67,
	d: 68,
	e: 69,
	f: 70,
	g: 71,
	h: 72,
	i: 73,
	j: 74,
	k: 75,
	l: 76,
	m: 77,
	n: 78,
	o: 79,
	p: 80,
	q: 81,
	r: 82,
	s: 83,
	t: 84,
	u: 85,
	v: 86,
	w: 87,
	x: 88,
	y: 89,
	z: 90,
	num0: 96,
	num1: 97,
	num2: 98,
	num3: 99,
	num4: 100,
	num5: 101,
	num6: 102,
	num7: 103,
	num8: 104,
	num9: 105,
	"*": 106,
	"+": 107,
	"-": 109,
	numdel: 110,
	"/": 111,
	f1: 112,
	f2: 113,
	f3: 114,
	f4: 115,
	f5: 116,
	f6: 117,
	f7: 118,
	f8: 119,
	f9: 120,
	f10: 121,
	f11: 122,
	f12: 123,
	numlock: 144,
	scrolllock: 145,
	semicolon: 186,
	",": 186,
	equal: 187,
	"\x3d": 187,
	";": 188,
	comma: 188,
	dash: 189,
	".": 190,
	period: 190,
	forwardslash: 191,
	grave: 192,
	"[": 219,
	openbracket: 219,
	"]": 221,
	closebracket: 221,
	backslash: 220,
	quote: 222,
	space: 32
};
cc.FMT_JPG = 0;
cc.FMT_PNG = 1;
cc.FMT_TIFF = 2;
cc.FMT_RAWDATA = 3;
cc.FMT_WEBP = 4;
cc.FMT_UNKNOWN = 5;
cc.getImageFormatByData = function(a) {
	return 8 < a.length && 137 == a[0] && 80 == a[1] && 78 == a[2] && 71 == a[3] && 13 == a[4] && 10 == a[5] && 26 == a[6] && 10 == a[7] ? cc.FMT_PNG : 2 < a.length && (73 == a[0] && 73 == a[1] || 77 == a[0] && 77 == a[1] || 255 == a[0] && 216 == a[1]) ? cc.FMT_TIFF : cc.FMT_UNKNOWN
};
cc.inherits = function(a, b) {
	function c() {}
	c.prototype = b.prototype;
	a.superClass_ = b.prototype;
	a.prototype = new c;
	a.prototype.constructor = a
};
cc.base = function(a, b, c) {
	var d = arguments.callee.caller;
	if (d.superClass_) return ret = d.superClass_.constructor.apply(a, Array.prototype.slice.call(arguments, 1));
	for (var e = Array.prototype.slice.call(arguments, 2), f = !1, g = a.constructor; g; g = g.superClass_ && g.superClass_.constructor)
		if (g.prototype[b] === d) f = !0;
		else if (f) return g.prototype[b].apply(a, e);
	if (a[b] === d) return a.constructor.prototype[b].apply(a, e);
	throw Error("cc.base called from a method of one name to a method of a different name");
};
cc.Point = function(a, b) {
	this.x = a || 0;
	this.y = b || 0
};
cc.p = function(a, b) {
	return void 0 == a ? {
		x: 0,
		y: 0
	} : void 0 == b ? {
		x: a.x,
		y: a.y
	} : {
		x: a,
		y: b
	}
};
cc.pointEqualToPoint = function(a, b) {
	return a && b && a.x === b.x && a.y === b.y
};
cc.Size = function(a, b) {
	this.width = a || 0;
	this.height = b || 0
};
cc.size = function(a, b) {
	return void 0 === a ? {
		width: 0,
		height: 0
	} : void 0 === b ? {
		width: a.width,
		height: a.height
	} : {
		width: a,
		height: b
	}
};
cc.sizeEqualToSize = function(a, b) {
	return a && b && a.width == b.width && a.height == b.height
};
cc.Rect = function(a, b, c, d) {
	this.x = a || 0;
	this.y = b || 0;
	this.width = c || 0;
	this.height = d || 0
};
cc.rect = function(a, b, c, d) {
	return void 0 === a ? {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	} : void 0 === b ? {
		x: a.x,
		y: a.y,
		width: a.width,
		height: a.height
	} : {
		x: a,
		y: b,
		width: c,
		height: d
	}
};
cc.rectEqualToRect = function(a, b) {
	return a && b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
};
cc._rectEqualToZero = function(a) {
	return a && 0 === a.x && 0 === a.y && 0 === a.width && 0 === a.height
};
cc.rectContainsRect = function(a, b) {
	return a && b ? !(a.x >= b.x || a.y >= b.y || a.x + a.width <= b.x + b.width || a.y + a.height <= b.y + b.height) : !1
};
cc.rectGetMaxX = function(a) {
	return a.x + a.width
};
cc.rectGetMidX = function(a) {
	return a.x + a.width / 2
};
cc.rectGetMinX = function(a) {
	return a.x
};
cc.rectGetMaxY = function(a) {
	return a.y + a.height
};
cc.rectGetMidY = function(a) {
	return a.y + a.height / 2
};
cc.rectGetMinY = function(a) {
	return a.y
};
cc.rectContainsPoint = function(a, b) {
	return b.x >= cc.rectGetMinX(a) && b.x <= cc.rectGetMaxX(a) && b.y >= cc.rectGetMinY(a) && b.y <= cc.rectGetMaxY(a)
};
cc.rectIntersectsRect = function(a, b) {
	var c = a.y + a.height,
		d = b.x + b.width,
		e = b.y + b.height;
	return !(a.x + a.width < b.x || d < a.x || c < b.y || e < a.y)
};
cc.rectOverlapsRect = function(a, b) {
	return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y)
};
cc.rectUnion = function(a, b) {
	var c = cc.rect(0, 0, 0, 0);
	c.x = Math.min(a.x, b.x);
	c.y = Math.min(a.y, b.y);
	c.width = Math.max(a.x + a.width, b.x + b.width) - c.x;
	c.height = Math.max(a.y + a.height, b.y + b.height) - c.y;
	return c
};
cc.rectIntersection = function(a, b) {
	var c = cc.rect(Math.max(cc.rectGetMinX(a), cc.rectGetMinX(b)), Math.max(cc.rectGetMinY(a), cc.rectGetMinY(b)), 0, 0);
	c.width = Math.min(cc.rectGetMaxX(a), cc.rectGetMaxX(b)) - cc.rectGetMinX(c);
	c.height = Math.min(cc.rectGetMaxY(a), cc.rectGetMaxY(b)) - cc.rectGetMinY(c);
	return c
};
cc.SAXParser = cc.Class.extend({
	_parser: null,
	_isSupportDOMParser: null,
	ctor: function() {
		window.DOMParser ? (this._isSupportDOMParser = !0, this._parser = new DOMParser) : this._isSupportDOMParser = !1
	},
	parse: function(a) {
		return this._parseXML(a)
	},
	_parseXML: function(a) {
		var b;
		this._isSupportDOMParser ? b = this._parser.parseFromString(a, "text/xml") : (b = new ActiveXObject("Microsoft.XMLDOM"), b.async = "false", b.loadXML(a));
		return b
	}
});
cc.PlistParser = cc.SAXParser.extend({
	parse: function(a) {
		a = this._parseXML(a).documentElement;
		if ("plist" != a.tagName) throw "Not a plist file!";
		for (var b = null, c = 0, d = a.childNodes.length; c < d && (b = a.childNodes[c], 1 != b.nodeType); c++);
		return this._parseNode(b)
	},
	_parseNode: function(a) {
		var b = null,
			c = a.tagName;
		if ("dict" == c) b = this._parseDict(a);
		else if ("array" == c) b = this._parseArray(a);
		else if ("string" == c)
			if (1 == a.childNodes.length) b = a.firstChild.nodeValue;
			else
				for (b = "", c = 0; c < a.childNodes.length; c++) b += a.childNodes[c].nodeValue;
		else "false" == c ? b = !1 : "true" == c ? b = !0 : "real" == c ? b = parseFloat(a.firstChild.nodeValue) : "integer" == c && (b = parseInt(a.firstChild.nodeValue, 10));
		return b
	},
	_parseArray: function(a) {
		for (var b = [], c = 0, d = a.childNodes.length; c < d; c++) {
			var e = a.childNodes[c];
			1 == e.nodeType && b.push(this._parseNode(e))
		}
		return b
	},
	_parseDict: function(a) {
		for (var b = {}, c = null, d = 0, e = a.childNodes.length; d < e; d++) {
			var f = a.childNodes[d];
			1 == f.nodeType && ("key" == f.tagName ? c = f.firstChild.nodeValue : b[c] = this._parseNode(f))
		}
		return b
	}
});
cc._txtLoader = {
	load: function(a, b, c, d) {
		cc.loader.loadTxt(a, d)
	}
};
cc.loader.register(["txt", "xml", "vsh", "fsh", "atlas"], cc._txtLoader);
cc._jsonLoader = {
	load: function(a, b, c, d) {
		cc.loader.loadJson(a, d)
	}
};
cc.loader.register(["json", "ExportJson"], cc._jsonLoader);
cc._imgLoader = {
	load: function(a, b, c, d) {
		cc.loader.cache[b] = cc.loader.loadImg(a, function(a, c) {
			if (a) return d(a);
			cc.textureCache.handleLoadedTexture(b);
			d(null, c)
		})
	}
};
cc.loader.register("png jpg bmp jpeg gif ico".split(" "), cc._imgLoader);
cc._serverImgLoader = {
	load: function(a, b, c, d) {
		cc.loader.cache[b] = cc.loader.loadImg(c.src, function(a, c) {
			if (a) return d(a);
			cc.textureCache.handleLoadedTexture(b);
			d(null, c)
		})
	}
};
cc.loader.register(["serverImg"], cc._serverImgLoader);
cc._plistLoader = {
	load: function(a, b, c, d) {
		cc.loader.loadTxt(a, function(a, b) {
			if (a) return d(a);
			d(null, cc.plistParser.parse(b))
		})
	}
};
cc.loader.register(["plist"], cc._plistLoader);
cc._fontLoader = {
	TYPE: {
		".eot": "embedded-opentype",
		".ttf": "truetype",
		".woff": "woff",
		".svg": "svg"
	},
	_loadFont: function(a, b, c) {
		var d = document,
			e = cc.path,
			f = this.TYPE,
			g = cc.newElement("style");
		g.type = "text/css";
		d.body.appendChild(g);
		var h = "@font-face { font-family:" + a + "; src:";
		if (b instanceof Array)
			for (var k = 0, m = b.length; k < m; k++) c = e.extname(b[k]).toLowerCase(), h += "url('" + b[k] + "') format('" + f[c] + "')", h += k == m - 1 ? ";" : ",";
		else h += "url('" + b + "') format('" + f[c] + "');";
		g.textContent += h + "};";
		b = cc.newElement("div");
		c = b.style;
		c.fontFamily = a;
		b.innerHTML = ".";
		c.position = "absolute";
		c.left = "-100px";
		c.top = "-100px";
		d.body.appendChild(b)
	},
	load: function(a, b, c, d) {
		b = c.type;
		a = c.name;
		b = c.srcs;
		cc.isString(c) ? (b = cc.path.extname(c), a = cc.path.basename(c, b), this._loadFont(a, c, b)) : this._loadFont(a, b);
		d(null, !0)
	}
};
cc.loader.register(["font", "eot", "ttf", "woff", "svg"], cc._fontLoader);
cc._binaryLoader = {
	load: function(a, b, c, d) {
		cc.loader.loadBinary(a, d)
	}
};
window.CocosEngine = cc.ENGINE_VERSION = "Cocos2d-JS v3.0 Final";
cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL = 0;
cc.DIRECTOR_STATS_POSITION = cc.p(0, 0);
cc.DIRECTOR_FPS_INTERVAL = 0.5;
cc.COCOSNODE_RENDER_SUBPIXEL = 1;
cc.SPRITEBATCHNODE_RENDER_SUBPIXEL = 1;
cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA = 0;
cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP = 0;
cc.TEXTURE_ATLAS_USE_VAO = 0;
cc.TEXTURE_NPOT_SUPPORT = 0;
cc.RETINA_DISPLAY_SUPPORT = 1;
cc.RETINA_DISPLAY_FILENAME_SUFFIX = "-hd";
cc.USE_LA88_LABELS = 1;
cc.SPRITE_DEBUG_DRAW = 0;
cc.SPRITEBATCHNODE_DEBUG_DRAW = 0;
cc.LABELBMFONT_DEBUG_DRAW = 0;
cc.LABELATLAS_DEBUG_DRAW = 0;
cc.IS_RETINA_DISPLAY_SUPPORTED = 1;
cc.DEFAULT_ENGINE = cc.ENGINE_VERSION + "-canvas";
cc.ENABLE_STACKABLE_ACTIONS = 1;
cc.ENABLE_GL_STATE_CACHE = 1;
cc.$ = function(a) {
	var b = this == cc ? document : this;
	if (a = a instanceof HTMLElement ? a : b.querySelector(a)) a.find = a.find || cc.$, a.hasClass = a.hasClass || function(a) {
		return this.className.match(RegExp("(\\s|^)" + a + "(\\s|$)"))
	}, a.addClass = a.addClass || function(a) {
		this.hasClass(a) || (this.className && (this.className += " "), this.className += a);
		return this
	}, a.removeClass = a.removeClass || function(a) {
		this.hasClass(a) && (this.className = this.className.replace(a, ""));
		return this
	}, a.remove = a.remove || function() {
		this.parentNode && this.parentNode.removeChild(this);
		return this
	}, a.appendTo = a.appendTo || function(a) {
		a.appendChild(this);
		return this
	}, a.prependTo = a.prependTo || function(a) {
		a.childNodes[0] ? a.insertBefore(this, a.childNodes[0]) : a.appendChild(this);
		return this
	}, a.transforms = a.transforms || function() {
		this.style[cc.$.trans] = cc.$.translate(this.position) + cc.$.rotate(this.rotation) + cc.$.scale(this.scale) + cc.$.skew(this.skew);
		return this
	}, a.position = a.position || {
		x: 0,
		y: 0
	}, a.rotation = a.rotation || 0, a.scale = a.scale || {
		x: 1,
		y: 1
	}, a.skew = a.skew || {
		x: 0,
		y: 0
	}, a.translates = function(a, b) {
		this.position.x = a;
		this.position.y = b;
		this.transforms();
		return this
	}, a.rotate = function(a) {
		this.rotation = a;
		this.transforms();
		return this
	}, a.resize = function(a, b) {
		this.scale.x = a;
		this.scale.y = b;
		this.transforms();
		return this
	}, a.setSkew = function(a, b) {
		this.skew.x = a;
		this.skew.y = b;
		this.transforms();
		return this
	};
	return a
};
switch (cc.sys.browserType) {
	case cc.sys.BROWSER_TYPE_FIREFOX:
		cc.$.pfx = "Moz";
		cc.$.hd = !0;
		break;
	case cc.sys.BROWSER_TYPE_CHROME:
	case cc.sys.BROWSER_TYPE_SAFARI:
		cc.$.pfx = "webkit";
		cc.$.hd = !0;
		break;
	case cc.sys.BROWSER_TYPE_OPERA:
		cc.$.pfx = "O";
		cc.$.hd = !1;
		break;
	case cc.sys.BROWSER_TYPE_IE:
		cc.$.pfx = "ms";
		cc.$.hd = !1;
		break;
	default:
		cc.$.pfx = "webkit", cc.$.hd = !0
}
cc.$.trans = cc.$.pfx + "Transform";
cc.$.translate = cc.$.hd ? function(a) {
	return "translate3d(" + a.x + "px, " + a.y + "px, 0) "
} : function(a) {
	return "translate(" + a.x + "px, " + a.y + "px) "
};
cc.$.rotate = cc.$.hd ? function(a) {
	return "rotateZ(" + a + "deg) "
} : function(a) {
	return "rotate(" + a + "deg) "
};
cc.$.scale = function(a) {
	return "scale(" + a.x + ", " + a.y + ") "
};
cc.$.skew = function(a) {
	return "skewX(" + -a.x + "deg) skewY(" + a.y + "deg)"
};
cc.$new = function(a) {
	return cc.$(document.createElement(a))
};
cc.$.findpos = function(a) {
	var b = 0,
		c = 0;
	do b += a.offsetLeft, c += a.offsetTop; while (a = a.offsetParent);
	return {
		x: b,
		y: c
	}
};
cc.INVALID_INDEX = -1;
cc.PI = Math.PI;
cc.FLT_MAX = parseFloat("3.402823466e+38F");
cc.FLT_MIN = parseFloat("1.175494351e-38F");
cc.RAD = cc.PI / 180;
cc.DEG = 180 / cc.PI;
cc.UINT_MAX = 4294967295;
cc.swap = function(a, b, c) {
	if (!cc.isObject(c) || cc.isUndefined(c.x) || cc.isUndefined(c.y)) cc.log(cc._LogInfos.swap);
	else {
		var d = c[a];
		c[a] = c[b];
		c[b] = d
	}
};
cc.lerp = function(a, b, c) {
	return a + (b - a) * c
};
cc.rand = function() {
	return 16777215 * Math.random()
};
cc.randomMinus1To1 = function() {
	return 2 * (Math.random() - 0.5)
};
cc.random0To1 = Math.random;
cc.degreesToRadians = function(a) {
	return a * cc.RAD
};
cc.radiansToDegrees = function(a) {
	return a * cc.DEG
};
cc.radiansToDegress = function(a) {
	cc.log(cc._LogInfos.radiansToDegress);
	return a * cc.DEG
};
cc.REPEAT_FOREVER = Number.MAX_VALUE - 1;
cc.BLEND_SRC = cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA ? 1 : 770;
cc.BLEND_DST = 771;
cc.nodeDrawSetup = function(a) {
	a._shaderProgram && (a._shaderProgram.use(), a._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4())
};
cc.enableDefaultGLStates = function() {};
cc.disableDefaultGLStates = function() {};
cc.incrementGLDraws = function(a) {
	cc.g_NumberOfDraws += a
};
cc.FLT_EPSILON = 1.192092896E-7;
cc.contentScaleFactor = cc.IS_RETINA_DISPLAY_SUPPORTED ? function() {
	return cc.director.getContentScaleFactor()
} : function() {
	return 1
};
cc.pointPointsToPixels = function(a) {
	var b = cc.contentScaleFactor();
	return cc.p(a.x * b, a.y * b)
};
cc.pointPixelsToPoints = function(a) {
	var b = cc.contentScaleFactor();
	return cc.p(a.x / b, a.y / b)
};
cc._pointPixelsToPointsOut = function(a, b) {
	var c = cc.contentScaleFactor();
	b.x = a.x / c;
	b.y = a.y / c
};
cc.sizePointsToPixels = function(a) {
	var b = cc.contentScaleFactor();
	return cc.size(a.width * b, a.height * b)
};
cc.sizePixelsToPoints = function(a) {
	var b = cc.contentScaleFactor();
	return cc.size(a.width / b, a.height / b)
};
cc._sizePixelsToPointsOut = function(a, b) {
	var c = cc.contentScaleFactor();
	b.width = a.width / c;
	b.height = a.height / c
};
cc.rectPixelsToPoints = cc.IS_RETINA_DISPLAY_SUPPORTED ? function(a) {
	var b = cc.contentScaleFactor();
	return cc.rect(a.x / b, a.y / b, a.width / b, a.height / b)
} : function(a) {
	return a
};
cc.rectPointsToPixels = cc.IS_RETINA_DISPLAY_SUPPORTED ? function(a) {
	var b = cc.contentScaleFactor();
	return cc.rect(a.x * b, a.y * b, a.width * b, a.height * b)
} : function(a) {
	return a
};
cc.ONE = 1;
cc.ZERO = 0;
cc.SRC_ALPHA = 770;
cc.SRC_ALPHA_SATURATE = 776;
cc.SRC_COLOR = 768;
cc.DST_ALPHA = 772;
cc.DST_COLOR = 774;
cc.ONE_MINUS_SRC_ALPHA = 771;
cc.ONE_MINUS_SRC_COLOR = 769;
cc.ONE_MINUS_DST_ALPHA = 773;
cc.ONE_MINUS_DST_COLOR = 775;
cc.ONE_MINUS_CONSTANT_ALPHA = 32772;
cc.ONE_MINUS_CONSTANT_COLOR = 32770;
cc.checkGLErrorDebug = function() {
	if (cc.renderMode == cc._RENDER_TYPE_WEBGL) {
		var a = cc._renderContext.getError();
		a && cc.log(cc._LogInfos.checkGLErrorDebug, a)
	}
};
cc.DEVICE_ORIENTATION_PORTRAIT = 0;
cc.DEVICE_ORIENTATION_LANDSCAPE_LEFT = 1;
cc.DEVICE_ORIENTATION_PORTRAIT_UPSIDE_DOWN = 2;
cc.DEVICE_ORIENTATION_LANDSCAPE_RIGHT = 3;
cc.DEVICE_MAX_ORIENTATIONS = 2;
cc.VERTEX_ATTRIB_FLAG_NONE = 0;
cc.VERTEX_ATTRIB_FLAG_POSITION = 1;
cc.VERTEX_ATTRIB_FLAG_COLOR = 2;
cc.VERTEX_ATTRIB_FLAG_TEX_COORDS = 4;
cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX = cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS;
cc.GL_ALL = 0;
cc.VERTEX_ATTRIB_POSITION = 0;
cc.VERTEX_ATTRIB_COLOR = 1;
cc.VERTEX_ATTRIB_TEX_COORDS = 2;
cc.VERTEX_ATTRIB_MAX = 3;
cc.UNIFORM_PMATRIX = 0;
cc.UNIFORM_MVMATRIX = 1;
cc.UNIFORM_MVPMATRIX = 2;
cc.UNIFORM_TIME = 3;
cc.UNIFORM_SINTIME = 4;
cc.UNIFORM_COSTIME = 5;
cc.UNIFORM_RANDOM01 = 6;
cc.UNIFORM_SAMPLER = 7;
cc.UNIFORM_MAX = 8;
cc.SHADER_POSITION_TEXTURECOLOR = "ShaderPositionTextureColor";
cc.SHADER_POSITION_TEXTURECOLORALPHATEST = "ShaderPositionTextureColorAlphaTest";
cc.SHADER_POSITION_COLOR = "ShaderPositionColor";
cc.SHADER_POSITION_TEXTURE = "ShaderPositionTexture";
cc.SHADER_POSITION_TEXTURE_UCOLOR = "ShaderPositionTexture_uColor";
cc.SHADER_POSITION_TEXTUREA8COLOR = "ShaderPositionTextureA8Color";
cc.SHADER_POSITION_UCOLOR = "ShaderPosition_uColor";
cc.SHADER_POSITION_LENGTHTEXTURECOLOR = "ShaderPositionLengthTextureColor";
cc.UNIFORM_PMATRIX_S = "CC_PMatrix";
cc.UNIFORM_MVMATRIX_S = "CC_MVMatrix";
cc.UNIFORM_MVPMATRIX_S = "CC_MVPMatrix";
cc.UNIFORM_TIME_S = "CC_Time";
cc.UNIFORM_SINTIME_S = "CC_SinTime";
cc.UNIFORM_COSTIME_S = "CC_CosTime";
cc.UNIFORM_RANDOM01_S = "CC_Random01";
cc.UNIFORM_SAMPLER_S = "CC_Texture0";
cc.UNIFORM_ALPHA_TEST_VALUE_S = "CC_alpha_value";
cc.ATTRIBUTE_NAME_COLOR = "a_color";
cc.ATTRIBUTE_NAME_POSITION = "a_position";
cc.ATTRIBUTE_NAME_TEX_COORD = "a_texCoord";
cc.ITEM_SIZE = 32;
cc.CURRENT_ITEM = 3233828865;
cc.ZOOM_ACTION_TAG = 3233828866;
cc.NORMAL_TAG = 8801;
cc.SELECTED_TAG = 8802;
cc.DISABLE_TAG = 8803;
cc.arrayVerifyType = function(a, b) {
	if (a && 0 < a.length)
		for (var c = 0; c < a.length; c++)
			if (!(a[c] instanceof b)) return cc.log("element type is wrong!"), !1;
	return !0
};
cc.arrayRemoveObject = function(a, b) {
	for (var c = 0, d = a.length; c < d; c++)
		if (a[c] == b) {
			a.splice(c, 1);
			break
		}
};
cc.arrayRemoveArray = function(a, b) {
	for (var c = 0, d = b.length; c < d; c++) cc.arrayRemoveObject(a, b[c])
};
cc.arrayAppendObjectsToIndex = function(a, b, c) {
	a.splice.apply(a, [c, 0].concat(b));
	return a
};
cc.copyArray = function(a) {
	var b, c = a.length,
		d = Array(c);
	for (b = 0; b < c; b += 1) d[b] = a[b];
	return d
};
cc = cc || {};
cc._tmp = cc._tmp || {};
cc._tmp.WebGLColor = function() {
	cc.color = function(a, c, d, e, f, g) {
		return void 0 === a ? new cc.Color(0, 0, 0, 255, f, g) : cc.isString(a) ? (a = cc.hexToColor(a), new cc.Color(a.r, a.g, a.b, a.a)) : cc.isObject(a) ? new cc.Color(a.r, a.g, a.b, a.a, a.arrayBuffer, a.offset) : new cc.Color(a, c, d, e, f, g)
	};
	cc.Color = function(a, c, d, e, f, g) {
		this._arrayBuffer = f || new ArrayBuffer(cc.Color.BYTES_PER_ELEMENT);
		this._offset = g || 0;
		f = this._arrayBuffer;
		g = this._offset;
		var h = Uint8Array.BYTES_PER_ELEMENT;
		this._rU8 = new Uint8Array(f, g, 1);
		this._gU8 = new Uint8Array(f, g + h, 1);
		this._bU8 = new Uint8Array(f, g + 2 * h, 1);
		this._aU8 = new Uint8Array(f, g + 3 * h, 1);
		this._rU8[0] = a || 0;
		this._gU8[0] = c || 0;
		this._bU8[0] = d || 0;
		this._aU8[0] = null == e ? 255 : e;
		void 0 === e && (this.a_undefined = !0)
	};
	cc.Color.BYTES_PER_ELEMENT = 4;
	var a = cc.Color.prototype;
	a._getR = function() {
		return this._rU8[0]
	};
	a._setR = function(a) {
		this._rU8[0] = 0 > a ? 0 : a
	};
	a._getG = function() {
		return this._gU8[0]
	};
	a._setG = function(a) {
		this._gU8[0] = 0 > a ? 0 : a
	};
	a._getB = function() {
		return this._bU8[0]
	};
	a._setB = function(a) {
		this._bU8[0] = 0 > a ? 0 : a
	};
	a._getA = function() {
		return this._aU8[0]
	};
	a._setA = function(a) {
		this._aU8[0] = 0 > a ? 0 : a
	};
	cc.defineGetterSetter(a, "r", a._getR, a._setR);
	cc.defineGetterSetter(a, "g", a._getG, a._setG);
	cc.defineGetterSetter(a, "b", a._getB, a._setB);
	cc.defineGetterSetter(a, "a", a._getA, a._setA);
	cc.Vertex2F = function(a, c, d, e) {
		this._arrayBuffer = d || new ArrayBuffer(cc.Vertex2F.BYTES_PER_ELEMENT);
		this._offset = e || 0;
		this._xF32 = new Float32Array(this._arrayBuffer, this._offset, 1);
		this._yF32 = new Float32Array(this._arrayBuffer, this._offset + 4, 1);
		this._xF32[0] = a || 0;
		this._yF32[0] = c || 0
	};
	cc.Vertex2F.BYTES_PER_ELEMENT = 8;
	Object.defineProperties(cc.Vertex2F.prototype, {
		x: {
			get: function() {
				return this._xF32[0]
			},
			set: function(a) {
				this._xF32[0] = a
			},
			enumerable: !0
		},
		y: {
			get: function() {
				return this._yF32[0]
			},
			set: function(a) {
				this._yF32[0] = a
			},
			enumerable: !0
		}
	});
	cc.Vertex3F = function(a, c, d, e, f) {
		this._arrayBuffer = e || new ArrayBuffer(cc.Vertex3F.BYTES_PER_ELEMENT);
		this._offset = f || 0;
		e = this._arrayBuffer;
		f = this._offset;
		this._xF32 = new Float32Array(e, f, 1);
		this._xF32[0] = a || 0;
		this._yF32 = new Float32Array(e, f + Float32Array.BYTES_PER_ELEMENT, 1);
		this._yF32[0] = c || 0;
		this._zF32 = new Float32Array(e, f + 2 * Float32Array.BYTES_PER_ELEMENT, 1);
		this._zF32[0] = d || 0
	};
	cc.Vertex3F.BYTES_PER_ELEMENT = 12;
	Object.defineProperties(cc.Vertex3F.prototype, {
		x: {
			get: function() {
				return this._xF32[0]
			},
			set: function(a) {
				this._xF32[0] = a
			},
			enumerable: !0
		},
		y: {
			get: function() {
				return this._yF32[0]
			},
			set: function(a) {
				this._yF32[0] = a
			},
			enumerable: !0
		},
		z: {
			get: function() {
				return this._zF32[0]
			},
			set: function(a) {
				this._zF32[0] = a
			},
			enumerable: !0
		}
	});
	cc.Tex2F = function(a, c, d, e) {
		this._arrayBuffer = d || new ArrayBuffer(cc.Tex2F.BYTES_PER_ELEMENT);
		this._offset = e || 0;
		this._uF32 = new Float32Array(this._arrayBuffer, this._offset, 1);
		this._vF32 = new Float32Array(this._arrayBuffer, this._offset + 4, 1);
		this._uF32[0] = a || 0;
		this._vF32[0] = c || 0
	};
	cc.Tex2F.BYTES_PER_ELEMENT = 8;
	Object.defineProperties(cc.Tex2F.prototype, {
		u: {
			get: function() {
				return this._uF32[0]
			},
			set: function(a) {
				this._uF32[0] = a
			},
			enumerable: !0
		},
		v: {
			get: function() {
				return this._vF32[0]
			},
			set: function(a) {
				this._vF32[0] = a
			},
			enumerable: !0
		}
	});
	cc.Quad2 = function(a, c, d, e, f, g) {
		this._arrayBuffer = f || new ArrayBuffer(cc.Quad2.BYTES_PER_ELEMENT);
		this._offset = g || 0;
		f = this._arrayBuffer;
		g = cc.Vertex2F.BYTES_PER_ELEMENT;
		this._tl = a ? new cc.Vertex2F(a.x, a.y, f, 0) : new cc.Vertex2F(0, 0, f, 0);
		this._tr = c ? new cc.Vertex2F(c.x, c.y, f, g) : new cc.Vertex2F(0, 0, f, g);
		this._bl = d ? new cc.Vertex2F(d.x, d.y, f, 2 * g) : new cc.Vertex2F(0, 0, f, 2 * g);
		this._br = e ? new cc.Vertex2F(e.x, e.y, f, 3 * g) : new cc.Vertex2F(0, 0, f, 3 * g)
	};
	cc.Quad2.BYTES_PER_ELEMENT = 32;
	cc.Quad3 = function(a, c, d, e) {
		this.bl = a || new cc.Vertex3F(0, 0, 0);
		this.br = c || new cc.Vertex3F(0, 0, 0);
		this.tl = d || new cc.Vertex3F(0, 0, 0);
		this.tr = e || new cc.Vertex3F(0, 0, 0)
	};
	Object.defineProperties(cc.Quad2.prototype, {
		tl: {
			get: function() {
				return this._tl
			},
			set: function(a) {
				this._tl.x = a.x;
				this._tl.y = a.y
			},
			enumerable: !0
		},
		tr: {
			get: function() {
				return this._tr
			},
			set: function(a) {
				this._tr.x = a.x;
				this._tr.y = a.y
			},
			enumerable: !0
		},
		bl: {
			get: function() {
				return this._bl
			},
			set: function(a) {
				this._bl.x = a.x;
				this._bl.y = a.y
			},
			enumerable: !0
		},
		br: {
			get: function() {
				return this._br
			},
			set: function(a) {
				this._br.x = a.x;
				this._br.y = a.y
			},
			enumerable: !0
		}
	});
	cc.V3F_C4B_T2F = function(a, c, d, e, f) {
		this._arrayBuffer = e || new ArrayBuffer(cc.V3F_C4B_T2F.BYTES_PER_ELEMENT);
		this._offset = f || 0;
		e = this._arrayBuffer;
		f = this._offset;
		var g = cc.Vertex3F.BYTES_PER_ELEMENT;
		this._vertices = a ? new cc.Vertex3F(a.x, a.y, a.z, e, f) : new cc.Vertex3F(0, 0, 0, e, f);
		this._colors = c ? cc.color(c.r, c.g, c.b, c.a, e, f + g) : cc.color(0, 0, 0, 0, e, f + g);
		this._texCoords = d ? new cc.Tex2F(d.u, d.v, e, f + g + cc.Color.BYTES_PER_ELEMENT) : new cc.Tex2F(0, 0, e, f + g + cc.Color.BYTES_PER_ELEMENT)
	};
	cc.V3F_C4B_T2F.BYTES_PER_ELEMENT = 24;
	Object.defineProperties(cc.V3F_C4B_T2F.prototype, {
		vertices: {
			get: function() {
				return this._vertices
			},
			set: function(a) {
				var c = this._vertices;
				c.x = a.x;
				c.y = a.y;
				c.z = a.z
			},
			enumerable: !0
		},
		colors: {
			get: function() {
				return this._colors
			},
			set: function(a) {
				var c = this._colors;
				c.r = a.r;
				c.g = a.g;
				c.b = a.b;
				c.a = a.a
			},
			enumerable: !0
		},
		texCoords: {
			get: function() {
				return this._texCoords
			},
			set: function(a) {
				this._texCoords.u = a.u;
				this._texCoords.v = a.v
			},
			enumerable: !0
		}
	});
	cc.V3F_C4B_T2F_Quad = function(a, c, d, e, f, g) {
		this._arrayBuffer = f || new ArrayBuffer(cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT);
		this._offset = g || 0;
		f = this._arrayBuffer;
		g = this._offset;
		var h = cc.V3F_C4B_T2F.BYTES_PER_ELEMENT;
		this._tl = a ? new cc.V3F_C4B_T2F(a.vertices, a.colors, a.texCoords, f, g) : new cc.V3F_C4B_T2F(null, null, null, f, g);
		this._bl = c ? new cc.V3F_C4B_T2F(c.vertices, c.colors, c.texCoords, f, g + h) : new cc.V3F_C4B_T2F(null, null, null, f, g + h);
		this._tr = d ? new cc.V3F_C4B_T2F(d.vertices, d.colors, d.texCoords, f, g + 2 * h) : new cc.V3F_C4B_T2F(null, null, null, f, g + 2 * h);
		this._br = e ? new cc.V3F_C4B_T2F(e.vertices, e.colors, e.texCoords, f, g + 3 * h) : new cc.V3F_C4B_T2F(null, null, null, f, g + 3 * h)
	};
	cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT = 96;
	Object.defineProperties(cc.V3F_C4B_T2F_Quad.prototype, {
		tl: {
			get: function() {
				return this._tl
			},
			set: function(a) {
				var c = this._tl;
				c.vertices = a.vertices;
				c.colors = a.colors;
				c.texCoords = a.texCoords
			},
			enumerable: !0
		},
		bl: {
			get: function() {
				return this._bl
			},
			set: function(a) {
				var c = this._bl;
				c.vertices = a.vertices;
				c.colors = a.colors;
				c.texCoords = a.texCoords
			},
			enumerable: !0
		},
		tr: {
			get: function() {
				return this._tr
			},
			set: function(a) {
				var c = this._tr;
				c.vertices = a.vertices;
				c.colors = a.colors;
				c.texCoords = a.texCoords
			},
			enumerable: !0
		},
		br: {
			get: function() {
				return this._br
			},
			set: function(a) {
				var c = this._br;
				c.vertices = a.vertices;
				c.colors = a.colors;
				c.texCoords = a.texCoords
			},
			enumerable: !0
		},
		arrayBuffer: {
			get: function() {
				return this._arrayBuffer
			},
			enumerable: !0
		}
	});
	cc.V3F_C4B_T2F_QuadZero = function() {
		return new cc.V3F_C4B_T2F_Quad
	};
	cc.V3F_C4B_T2F_QuadCopy = function(a) {
		if (!a) return cc.V3F_C4B_T2F_QuadZero();
		var c = a.tl,
			d = a.bl,
			e = a.tr;
		a = a.br;
		return {
			tl: {
				vertices: {
					x: c.vertices.x,
					y: c.vertices.y,
					z: c.vertices.z
				},
				colors: {
					r: c.colors.r,
					g: c.colors.g,
					b: c.colors.b,
					a: c.colors.a
				},
				texCoords: {
					u: c.texCoords.u,
					v: c.texCoords.v
				}
			},
			bl: {
				vertices: {
					x: d.vertices.x,
					y: d.vertices.y,
					z: d.vertices.z
				},
				colors: {
					r: d.colors.r,
					g: d.colors.g,
					b: d.colors.b,
					a: d.colors.a
				},
				texCoords: {
					u: d.texCoords.u,
					v: d.texCoords.v
				}
			},
			tr: {
				vertices: {
					x: e.vertices.x,
					y: e.vertices.y,
					z: e.vertices.z
				},
				colors: {
					r: e.colors.r,
					g: e.colors.g,
					b: e.colors.b,
					a: e.colors.a
				},
				texCoords: {
					u: e.texCoords.u,
					v: e.texCoords.v
				}
			},
			br: {
				vertices: {
					x: a.vertices.x,
					y: a.vertices.y,
					z: a.vertices.z
				},
				colors: {
					r: a.colors.r,
					g: a.colors.g,
					b: a.colors.b,
					a: a.colors.a
				},
				texCoords: {
					u: a.texCoords.u,
					v: a.texCoords.v
				}
			}
		}
	};
	cc.V3F_C4B_T2F_QuadsCopy = function(a) {
		if (!a) return [];
		for (var c = [], d = 0; d < a.length; d++) c.push(cc.V3F_C4B_T2F_QuadCopy(a[d]));
		return c
	};
	cc.V2F_C4B_T2F = function(a, c, d, e, f) {
		this._arrayBuffer = e || new ArrayBuffer(cc.V2F_C4B_T2F.BYTES_PER_ELEMENT);
		this._offset = f || 0;
		e = this._arrayBuffer;
		f = this._offset;
		var g = cc.Vertex2F.BYTES_PER_ELEMENT;
		this._vertices = a ? new cc.Vertex2F(a.x, a.y, e, f) : new cc.Vertex2F(0, 0, e, f);
		this._colors = c ? cc.color(c.r, c.g, c.b, c.a, e, f + g) : cc.color(0, 0, 0, 0, e, f + g);
		this._texCoords = d ? new cc.Tex2F(d.u, d.v, e, f + g + cc.Color.BYTES_PER_ELEMENT) : new cc.Tex2F(0, 0, e, f + g + cc.Color.BYTES_PER_ELEMENT)
	};
	cc.V2F_C4B_T2F.BYTES_PER_ELEMENT = 20;
	Object.defineProperties(cc.V2F_C4B_T2F.prototype, {
		vertices: {
			get: function() {
				return this._vertices
			},
			set: function(a) {
				this._vertices.x = a.x;
				this._vertices.y = a.y
			},
			enumerable: !0
		},
		colors: {
			get: function() {
				return this._colors
			},
			set: function(a) {
				var c = this._colors;
				c.r = a.r;
				c.g = a.g;
				c.b = a.b;
				c.a = a.a
			},
			enumerable: !0
		},
		texCoords: {
			get: function() {
				return this._texCoords
			},
			set: function(a) {
				this._texCoords.u = a.u;
				this._texCoords.v = a.v
			},
			enumerable: !0
		}
	});
	cc.V2F_C4B_T2F_Triangle = function(a, c, d, e, f) {
		this._arrayBuffer = e || new ArrayBuffer(cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT);
		this._offset = f || 0;
		e = this._arrayBuffer;
		f = this._offset;
		var g = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
		this._a = a ? new cc.V2F_C4B_T2F(a.vertices, a.colors, a.texCoords, e, f) : new cc.V2F_C4B_T2F(null, null, null, e, f);
		this._b = c ? new cc.V2F_C4B_T2F(c.vertices, c.colors, c.texCoords, e, f + g) : new cc.V2F_C4B_T2F(null, null, null, e, f + g);
		this._c = d ? new cc.V2F_C4B_T2F(d.vertices, d.colors, d.texCoords, e, f + 2 * g) : new cc.V2F_C4B_T2F(null, null, null, e, f + 2 * g)
	};
	cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT = 60;
	Object.defineProperties(cc.V2F_C4B_T2F_Triangle.prototype, {
		a: {
			get: function() {
				return this._a
			},
			set: function(a) {
				var c = this._a;
				c.vertices = a.vertices;
				c.colors = a.colors;
				c.texCoords = a.texCoords
			},
			enumerable: !0
		},
		b: {
			get: function() {
				return this._b
			},
			set: function(a) {
				var c = this._b;
				c.vertices = a.vertices;
				c.colors = a.colors;
				c.texCoords = a.texCoords
			},
			enumerable: !0
		},
		c: {
			get: function() {
				return this._c
			},
			set: function(a) {
				var c = this._c;
				c.vertices = a.vertices;
				c.colors = a.colors;
				c.texCoords = a.texCoords
			},
			enumerable: !0
		}
	})
};
cc._tmp.PrototypeColor = function() {
	var a = cc.color;
	a._getWhite = function() {
		return a(255, 255, 255)
	};
	a._getYellow = function() {
		return a(255, 255, 0)
	};
	a._getBlue = function() {
		return a(0, 0, 255)
	};
	a._getGreen = function() {
		return a(0, 255, 0)
	};
	a._getRed = function() {
		return a(255, 0, 0)
	};
	a._getMagenta = function() {
		return a(255, 0, 255)
	};
	a._getBlack = function() {
		return a(0, 0, 0)
	};
	a._getOrange = function() {
		return a(255, 127, 0)
	};
	a._getGray = function() {
		return a(166, 166, 166)
	};
	cc.defineGetterSetter(a, "WHITE", a._getWhite);
	cc.defineGetterSetter(a, "YELLOW", a._getYellow);
	cc.defineGetterSetter(a, "BLUE", a._getBlue);
	cc.defineGetterSetter(a, "GREEN", a._getGreen);
	cc.defineGetterSetter(a, "RED", a._getRed);
	cc.defineGetterSetter(a, "MAGENTA", a._getMagenta);
	cc.defineGetterSetter(a, "BLACK", a._getBlack);
	cc.defineGetterSetter(a, "ORANGE", a._getOrange);
	cc.defineGetterSetter(a, "GRAY", a._getGray);
	cc.BlendFunc._disable = function() {
		return new cc.BlendFunc(cc.ONE, cc.ZERO)
	};
	cc.BlendFunc._alphaPremultiplied = function() {
		return new cc.BlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA)
	};
	cc.BlendFunc._alphaNonPremultiplied = function() {
		return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA)
	};
	cc.BlendFunc._additive = function() {
		return new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE)
	};
	cc.defineGetterSetter(cc.BlendFunc, "DISABLE", cc.BlendFunc._disable);
	cc.defineGetterSetter(cc.BlendFunc, "ALPHA_PREMULTIPLIED", cc.BlendFunc._alphaPremultiplied);
	cc.defineGetterSetter(cc.BlendFunc, "ALPHA_NON_PREMULTIPLIED", cc.BlendFunc._alphaNonPremultiplied);
	cc.defineGetterSetter(cc.BlendFunc, "ADDITIVE", cc.BlendFunc._additive)
};
cc.Color = function(a, b, c, d) {
	this.r = a || 0;
	this.g = b || 0;
	this.b = c || 0;
	this.a = null == d ? 255 : d
};
cc.color = function(a, b, c, d) {
	return void 0 === a ? {
		r: 0,
		g: 0,
		b: 0,
		a: 255
	} : cc.isString(a) ? cc.hexToColor(a) : cc.isObject(a) ? {
		r: a.r,
		g: a.g,
		b: a.b,
		a: null == a.a ? 255 : a.a
	} : {
		r: a,
		g: b,
		b: c,
		a: null == d ? 255 : d
	}
};
cc.colorEqual = function(a, b) {
	return a.r === b.r && a.g === b.g && a.b === b.b
};
cc.Acceleration = function(a, b, c, d) {
	this.x = a || 0;
	this.y = b || 0;
	this.z = c || 0;
	this.timestamp = d || 0
};
cc.Vertex2F = function(a, b) {
	this.x = a || 0;
	this.y = b || 0
};
cc.vertex2 = function(a, b) {
	return new cc.Vertex2F(a, b)
};
cc.Vertex3F = function(a, b, c) {
	this.x = a || 0;
	this.y = b || 0;
	this.z = c || 0
};
cc.vertex3 = function(a, b, c) {
	return new cc.Vertex3F(a, b, c)
};
cc.Tex2F = function(a, b) {
	this.u = a || 0;
	this.v = b || 0
};
cc.tex2 = function(a, b) {
	return new cc.Tex2F(a, b)
};
cc.BlendFunc = function(a, b) {
	this.src = a;
	this.dst = b
};
cc.blendFuncDisable = function() {
	return new cc.BlendFunc(cc.ONE, cc.ZERO)
};
cc.hexToColor = function(a) {
	a = a.replace(/^#?/, "0x");
	a = parseInt(a);
	return cc.color(a >> 16, (a >> 8) % 256, a % 256)
};
cc.colorToHex = function(a) {
	var b = a.r.toString(16),
		c = a.g.toString(16),
		d = a.b.toString(16);
	return "#" + (16 > a.r ? "0" + b : b) + (16 > a.g ? "0" + c : c) + (16 > a.b ? "0" + d : d)
};
cc.TEXT_ALIGNMENT_LEFT = 0;
cc.TEXT_ALIGNMENT_CENTER = 1;
cc.TEXT_ALIGNMENT_RIGHT = 2;
cc.VERTICAL_TEXT_ALIGNMENT_TOP = 0;
cc.VERTICAL_TEXT_ALIGNMENT_CENTER = 1;
cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM = 2;
cc._Dictionary = cc.Class.extend({
	_keyMapTb: null,
	_valueMapTb: null,
	__currId: 0,
	ctor: function() {
		this._keyMapTb = {};
		this._valueMapTb = {};
		this.__currId = 2 << (0 | 10 * Math.random())
	},
	__getKey: function() {
		this.__currId++;
		return "key_" + this.__currId
	},
	setObject: function(a, b) {
		if (null != b) {
			var c = this.__getKey();
			this._keyMapTb[c] = b;
			this._valueMapTb[c] = a
		}
	},
	objectForKey: function(a) {
		if (null == a) return null;
		var b = this._keyMapTb,
			c;
		for (c in b)
			if (b[c] === a) return this._valueMapTb[c];
		return null
	},
	valueForKey: function(a) {
		return this.objectForKey(a)
	},
	removeObjectForKey: function(a) {
		if (null != a) {
			var b = this._keyMapTb,
				c;
			for (c in b)
				if (b[c] === a) {
					delete this._valueMapTb[c];
					delete b[c];
					break
				}
		}
	},
	removeObjectsForKeys: function(a) {
		if (null != a)
			for (var b = 0; b < a.length; b++) this.removeObjectForKey(a[b])
	},
	allKeys: function() {
		var a = [],
			b = this._keyMapTb,
			c;
		for (c in b) a.push(b[c]);
		return a
	},
	removeAllObjects: function() {
		this._keyMapTb = {};
		this._valueMapTb = {}
	},
	count: function() {
		return this.allKeys().length
	}
});
cc.FontDefinition = function() {
	this.fontName = "Arial";
	this.fontSize = 12;
	this.textAlign = cc.TEXT_ALIGNMENT_CENTER;
	this.verticalAlign = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
	this.fillStyle = cc.color(255, 255, 255, 255);
	this.boundingHeight = this.boundingWidth = 0;
	this.strokeEnabled = !1;
	this.strokeStyle = cc.color(255, 255, 255, 255);
	this.lineWidth = 1;
	this.shadowEnabled = !1;
	this.shadowBlur = this.shadowOffsetY = this.shadowOffsetX = 0;
	this.shadowOpacity = 1
};
cc._renderType === cc._RENDER_TYPE_WEBGL && (cc.assert(cc.isFunction(cc._tmp.WebGLColor), cc._LogInfos.MissingFile, "CCTypesWebGL.js"), cc._tmp.WebGLColor(), delete cc._tmp.WebGLColor);
cc.assert(cc.isFunction(cc._tmp.PrototypeColor), cc._LogInfos.MissingFile, "CCTypesPropertyDefine.js");
cc._tmp.PrototypeColor();
delete cc._tmp.PrototypeColor;
cc.Touches = [];
cc.TouchesIntergerDict = {};
cc.DENSITYDPI_DEVICE = "device-dpi";
cc.DENSITYDPI_HIGH = "high-dpi";
cc.DENSITYDPI_MEDIUM = "medium-dpi";
cc.DENSITYDPI_LOW = "low-dpi";
cc.EGLView = cc.Class.extend({
	_delegate: null,
	_frameSize: null,
	_designResolutionSize: null,
	_originalDesignResolutionSize: null,
	_viewPortRect: null,
	_visibleRect: null,
	_retinaEnabled: !1,
	_autoFullScreen: !0,
	_devicePixelRatio: 1,
	_viewName: "",
	_resizeCallback: null,
	_scaleX: 1,
	_originalScaleX: 1,
	_scaleY: 1,
	_originalScaleY: 1,
	_indexBitsUsed: 0,
	_maxTouches: 5,
	_resolutionPolicy: null,
	_rpExactFit: null,
	_rpShowAll: null,
	_rpNoBorder: null,
	_rpFixedHeight: null,
	_rpFixedWidth: null,
	_initialized: !1,
	_captured: !1,
	_wnd: null,
	_hDC: null,
	_hRC: null,
	_supportTouch: !1,
	_contentTranslateLeftTop: null,
	_frame: null,
	_frameZoomFactor: 1,
	__resizeWithBrowserSize: !1,
	_isAdjustViewPort: !0,
	_targetDensityDPI: null,
	ctor: function() {
		var a = document,
			b = cc.ContainerStrategy,
			c = cc.ContentStrategy;
		this._frame = cc.container.parentNode === a.body ? a.documentElement : cc.container.parentNode;
		this._frameSize = cc.size(0, 0);
		this._initFrameSize();
		var a = cc._canvas.width,
			d = cc._canvas.height;
		this._designResolutionSize = cc.size(a, d);
		this._originalDesignResolutionSize = cc.size(a, d);
		this._viewPortRect = cc.rect(0, 0, a, d);
		this._visibleRect = cc.rect(0, 0, a, d);
		this._contentTranslateLeftTop = {
			left: 0,
			top: 0
		};
		this._viewName = "Cocos2dHTML5";
		a = cc.sys;
		this.enableRetina(a.os == a.OS_IOS || a.os == a.OS_OSX);
		cc.visibleRect && cc.visibleRect.init(this._visibleRect);
		this._rpExactFit = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.EXACT_FIT);
		this._rpShowAll = new cc.ResolutionPolicy(b.PROPORTION_TO_FRAME, c.SHOW_ALL);
		this._rpNoBorder = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.NO_BORDER);
		this._rpFixedHeight = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.FIXED_HEIGHT);
		this._rpFixedWidth = new cc.ResolutionPolicy(b.EQUAL_TO_FRAME, c.FIXED_WIDTH);
		this._hDC = cc._canvas;
		this._hRC = cc._renderContext;
		this._targetDensityDPI = cc.DENSITYDPI_HIGH
	},
	_resizeEvent: function() {
		var a = this._originalDesignResolutionSize.width,
			b = this._originalDesignResolutionSize.height;
		this._resizeCallback && (this._initFrameSize(), this._resizeCallback.call());
		0 < a && this.setDesignResolutionSize(a, b, this._resolutionPolicy)
	},
	setTargetDensityDPI: function(a) {
		this._targetDensityDPI = a;
		this._setViewPortMeta()
	},
	getTargetDensityDPI: function() {
		return this._targetDensityDPI
	},
	resizeWithBrowserSize: function(a) {
		a ? this.__resizeWithBrowserSize || (this.__resizeWithBrowserSize = !0, a = this._resizeEvent.bind(this), cc._addEventListener(window, "resize", a, !1)) : this.__resizeWithBrowserSize && (this.__resizeWithBrowserSize = !0, a = this._resizeEvent.bind(this), window.removeEventListener("resize", a, !1))
	},
	setResizeCallback: function(a) {
		if (cc.isFunction(a) || null == a) this._resizeCallback = a
	},
	_initFrameSize: function() {
		var a = this._frameSize,
			b = Math.min(window.screen.availWidth, window.screen.width) * window.devicePixelRatio,
			c = Math.min(window.screen.availHeight, window.screen.height) * window.devicePixelRatio;
		a.width = cc.sys.isMobile && this._frame.clientWidth >= 0.8 * b ? b / window.devicePixelRatio : this._frame.clientWidth;
		a.height = cc.sys.isMobile && this._frame.clientWidth >= 0.8 * c ? c / window.devicePixelRatio : this._frame.clientHeight
	},
	_adjustSizeKeepCanvasSize: function() {
		var a = this._originalDesignResolutionSize.width,
			b = this._originalDesignResolutionSize.height;
		0 < a && this.setDesignResolutionSize(a, b, this._resolutionPolicy)
	},
	_setViewPortMeta: function(a, b) {
		if (this._isAdjustViewPort) {
			var c = document.getElementById("cocosMetaElement");
			c && document.head.removeChild(c);
			var d, e = document.getElementsByName("viewport"),
				f, c = cc.newElement("meta");
			c.id = "cocosMetaElement";
			c.name = "viewport";
			c.content = "";
			d = cc.sys.isMobile && cc.sys.browserType == cc.sys.BROWSER_TYPE_FIREFOX ? {
				width: "device-width",
				"initial-scale": "1.0"
			} : {
				width: "device-width",
				"user-scalable": "no",
				"maximum-scale": "1.0",
				"initial-scale": "1.0"
			};
			cc.sys.isMobile && (d["target-densitydpi"] = this._targetDensityDPI);
			f = e && 0 < e.length ? e[0].content : "";
			for (var g in d) RegExp(g).test(f) || (f += "," + g + "\x3d" + d[g]);
			e || "" == f || (f = f.substr(1));
			c.content = f;
			document.head.appendChild(c)
		}
	},
	_setScaleXYForRenderTexture: function() {
		var a = cc.contentScaleFactor();
		this._scaleY = this._scaleX = a
	},
	_resetScale: function() {
		this._scaleX = this._originalScaleX;
		this._scaleY = this._originalScaleY
	},
	_adjustSizeToBrowser: function() {},
	initialize: function() {
		this._initialized = !0
	},
	adjustViewPort: function(a) {
		this._isAdjustViewPort = a
	},
	enableRetina: function(a) {
		this._retinaEnabled = a ? !0 : !1
	},
	isRetinaEnabled: function() {
		return this._retinaEnabled
	},
	enableAutoFullScreen: function(a) {
		this._autoFullScreen = a ? !0 : !1
	},
	isAutoFullScreenEnabled: function() {
		return this._autoFullScreen
	},
	end: function() {},
	isOpenGLReady: function() {
		return null != this._hDC && null != this._hRC
	},
	setFrameZoomFactor: function(a) {
		this._frameZoomFactor = a;
		this.centerWindow();
		cc.director.setProjection(cc.director.getProjection())
	},
	swapBuffers: function() {},
	setIMEKeyboardState: function(a) {},
	setContentTranslateLeftTop: function(a, b) {
		this._contentTranslateLeftTop = {
			left: a,
			top: b
		}
	},
	getContentTranslateLeftTop: function() {
		return this._contentTranslateLeftTop
	},
	getFrameSize: function() {
		return cc.size(this._frameSize.width, this._frameSize.height)
	},
	setFrameSize: function(a, b) {
		this._frameSize.width = a;
		this._frameSize.height = b;
		this._frame.style.width = a + "px";
		this._frame.style.height = b + "px";
		this._resizeEvent();
		cc.director.setProjection(cc.director.getProjection())
	},
	centerWindow: function() {},
	getVisibleSize: function() {
		return cc.size(this._visibleRect.width, this._visibleRect.height)
	},
	getVisibleOrigin: function() {
		return cc.p(this._visibleRect.x, this._visibleRect.y)
	},
	canSetContentScaleFactor: function() {
		return !0
	},
	getResolutionPolicy: function() {
		return this._resolutionPolicy
	},
	setResolutionPolicy: function(a) {
		if (a instanceof cc.ResolutionPolicy) this._resolutionPolicy = a;
		else {
			var b = cc.ResolutionPolicy;
			a === b.EXACT_FIT && (this._resolutionPolicy = this._rpExactFit);
			a === b.SHOW_ALL && (this._resolutionPolicy = this._rpShowAll);
			a === b.NO_BORDER && (this._resolutionPolicy = this._rpNoBorder);
			a === b.FIXED_HEIGHT && (this._resolutionPolicy = this._rpFixedHeight);
			a === b.FIXED_WIDTH && (this._resolutionPolicy = this._rpFixedWidth)
		}
	},
	setDesignResolutionSize: function(a, b, c) {
		if (isNaN(a) || 0 == a || isNaN(b) || 0 == b) cc.log(cc._LogInfos.EGLView_setDesignResolutionSize);
		else {
			var d = this._resolutionPolicy;
			this.setResolutionPolicy(c);
			if (c = this._resolutionPolicy) {
				c.preApply(this);
				var e = this._frameSize.width,
					f = this._frameSize.height;
				cc.sys.isMobile && this._setViewPortMeta(this._frameSize.width, this._frameSize.height);
				this._initFrameSize();
				if (d != this._resolutionPolicy || a != this._originalDesignResolutionSize.width || b != this._originalDesignResolutionSize.height || e != this._frameSize.width || f != this._frameSize.height) this._designResolutionSize = cc.size(a, b), this._originalDesignResolutionSize = cc.size(a, b), a = c.apply(this, this._designResolutionSize), a.scale && 2 == a.scale.length && (this._scaleX = a.scale[0], this._scaleY = a.scale[1]), a.viewport && (a = this._viewPortRect = a.viewport, b = this._visibleRect, b.width = cc._canvas.width / this._scaleX, b.height = cc._canvas.height / this._scaleY, b.x = -a.x / this._scaleX, b.y = -a.y / this._scaleY), a = cc.director, a._winSizeInPoints.width = this._designResolutionSize.width, a._winSizeInPoints.height = this._designResolutionSize.height, cc.winSize.width = a._winSizeInPoints.width, cc.winSize.height = a._winSizeInPoints.height, c.postApply(this), cc._renderType == cc._RENDER_TYPE_WEBGL && (a._createStatsLabel(), a.setGLDefaultValues()), this._originalScaleX = this._scaleX, this._originalScaleY = this._scaleY, cc.DOM && cc.DOM._resetEGLViewDiv(), cc.visibleRect && cc.visibleRect.init(this._visibleRect)
			} else cc.log(cc._LogInfos.EGLView_setDesignResolutionSize_2)
		}
	},
	getDesignResolutionSize: function() {
		return cc.size(this._designResolutionSize.width, this._designResolutionSize.height)
	},
	setViewPortInPoints: function(a, b, c, d) {
		var e = this._frameZoomFactor,
			f = this._scaleX,
			g = this._scaleY;
		cc._renderContext.viewport(a * f * e + this._viewPortRect.x * e, b * g * e + this._viewPortRect.y * e, c * f * e, d * g * e)
	},
	setScissorInPoints: function(a, b, c, d) {
		var e = this._frameZoomFactor,
			f = this._scaleX,
			g = this._scaleY;
		cc._renderContext.scissor(a * f * e + this._viewPortRect.x * e, b * g * e + this._viewPortRect.y * e, c * f * e, d * g * e)
	},
	isScissorEnabled: function() {
		var a = cc._renderContext;
		return a.isEnabled(a.SCISSOR_TEST)
	},
	getScissorRect: function() {
		var a = cc._renderContext,
			b = this._scaleX,
			c = this._scaleY,
			a = a.getParameter(a.SCISSOR_BOX);
		return cc.rect((a[0] - this._viewPortRect.x) / b, (a[1] - this._viewPortRect.y) / c, a[2] / b, a[3] / c)
	},
	setViewName: function(a) {
		null != a && 0 < a.length && (this._viewName = a)
	},
	getViewName: function() {
		return this._viewName
	},
	getViewPortRect: function() {
		return this._viewPortRect
	},
	getScaleX: function() {
		return this._scaleX
	},
	getScaleY: function() {
		return this._scaleY
	},
	getDevicePixelRatio: function() {
		return this._devicePixelRatio
	},
	convertToLocationInView: function(a, b, c) {
		return {
			x: this._devicePixelRatio * (a - c.left),
			y: this._devicePixelRatio * (c.top + c.height - b)
		}
	},
	_convertMouseToLocationInView: function(a, b) {
		var c = this._viewPortRect;
		a.x = (this._devicePixelRatio * (a.x - b.left) - c.x) / this._scaleX;
		a.y = (this._devicePixelRatio * (b.top + b.height - a.y) - c.y) / this._scaleY
	},
	_convertTouchesWithScale: function(a) {
		for (var b = this._viewPortRect, c = this._scaleX, d = this._scaleY, e, f, g, h = 0; h < a.length; h++) e = a[h], f = e._point, g = e._prevPoint, e._setPoint((f.x - b.x) / c, (f.y - b.y) / d), e._setPrevPoint((g.x - b.x) / c, (g.y - b.y) / d)
	}
});
cc.EGLView._getInstance = function() {
	this._instance || (this._instance = this._instance || new cc.EGLView, this._instance.initialize());
	return this._instance
};
cc.ContainerStrategy = cc.Class.extend({
	preApply: function(a) {},
	apply: function(a, b) {},
	postApply: function(a) {},
	_setupContainer: function(a, b, c) {
		var d = a._frame;
		cc.view._autoFullScreen && cc.sys.isMobile && d == document.documentElement && cc.screen.autoFullScreen(d);
		var d = cc._canvas,
			e = cc.container;
		e.style.width = d.style.width = b + "px";
		e.style.height = d.style.height = c + "px";
		e = a._devicePixelRatio = 1;
		a.isRetinaEnabled() && (e = a._devicePixelRatio = window.devicePixelRatio || 1);
		d.width = b * e;
		d.height = c * e;
		a = document.body;
		var f;
		a && (f = a.style) && (f.paddingTop = f.paddingTop || "0px", f.paddingRight = f.paddingRight || "0px", f.paddingBottom = f.paddingBottom || "0px", f.paddingLeft = f.paddingLeft || "0px", f.borderTop = f.borderTop || "0px", f.borderRight = f.borderRight || "0px", f.borderBottom = f.borderBottom || "0px", f.borderLeft = f.borderLeft || "0px", f.marginTop = f.marginTop || "0px", f.marginRight = f.marginRight || "0px", f.marginBottom = f.marginBottom || "0px", f.marginLeft = f.marginLeft || "0px")
	},
	_fixContainer: function() {
		document.body.insertBefore(cc.container, document.body.firstChild);
		var a = document.body.style;
		a.width = window.innerWidth + "px";
		a.height = window.innerHeight + "px";
		a.overflow = "hidden";
		a = cc.container.style;
		a.position = "fixed";
		a.left = a.top = "0px";
		document.body.scrollTop = 0
	}
});
cc.ContentStrategy = cc.Class.extend({
	_result: {
		scale: [1, 1],
		viewport: null
	},
	_buildResult: function(a, b, c, d, e, f) {
		2 > Math.abs(a - c) && (c = a);
		2 > Math.abs(b - d) && (d = b);
		a = cc.rect(Math.round((a - c) / 2), Math.round((b - d) / 2), c, d);
		cc._renderType == cc._RENDER_TYPE_CANVAS && cc._renderContext.translate(a.x, a.y + d);
		this._result.scale = [e, f];
		this._result.viewport = a;
		return this._result
	},
	preApply: function(a) {},
	apply: function(a, b) {
		return {
			scale: [1, 1]
		}
	},
	postApply: function(a) {}
});
(function() {
	var a = cc.ContainerStrategy.extend({
			apply: function(a) {
				this._setupContainer(a, a._frameSize.width, a._frameSize.height)
			}
		}),
		b = cc.ContainerStrategy.extend({
			apply: function(a, b) {
				var c = a._frameSize.width,
					d = a._frameSize.height,
					e = cc.container.style,
					n = b.width,
					q = b.height,
					s = c / n,
					r = d / q,
					t, u;
				s < r ? (t = c, u = q * s) : (t = n * r, u = d);
				n = Math.round((c - t) / 2);
				u = Math.round((d - u) / 2);
				this._setupContainer(a, c - 2 * n, d - 2 * u);
				e.marginLeft = n + "px";
				e.marginRight = n + "px";
				e.marginTop = u + "px";
				e.marginBottom = u + "px"
			}
		});
	a.extend({
		preApply: function(a) {
			this._super(a);
			a._frame = document.documentElement
		},
		apply: function(a) {
			this._super(a);
			this._fixContainer()
		}
	});
	b.extend({
		preApply: function(a) {
			this._super(a);
			a._frame = document.documentElement
		},
		apply: function(a, b) {
			this._super(a, b);
			this._fixContainer()
		}
	});
	var c = cc.ContainerStrategy.extend({
		apply: function(a) {
			this._setupContainer(a, cc._canvas.width, cc._canvas.height)
		}
	});
	cc.ContainerStrategy.EQUAL_TO_FRAME = new a;
	cc.ContainerStrategy.PROPORTION_TO_FRAME = new b;
	cc.ContainerStrategy.ORIGINAL_CONTAINER = new c;
	var a = cc.ContentStrategy.extend({
			apply: function(a, b) {
				var c = cc._canvas.width,
					d = cc._canvas.height;
				return this._buildResult(c, d, c, d, c / b.width, d / b.height)
			}
		}),
		b = cc.ContentStrategy.extend({
			apply: function(a, b) {
				var c = cc._canvas.width,
					d = cc._canvas.height,
					e = b.width,
					n = b.height,
					q = c / e,
					s = d / n,
					r = 0,
					t, u;
				q < s ? (r = q, t = c, u = n * r) : (r = s, t = e * r, u = d);
				return this._buildResult(c, d, t, u, r, r)
			}
		}),
		c = cc.ContentStrategy.extend({
			apply: function(a, b) {
				var c = cc._canvas.width,
					d = cc._canvas.height,
					e = c / b.width,
					n = d / b.height,
					q;
				e < n ? q = n : q = e;
				return this._buildResult(c, d, c, d, q, q)
			}
		}),
		d = cc.ContentStrategy.extend({
			apply: function(a, b) {
				var c = cc._canvas.width,
					d = cc._canvas.height,
					e = d / b.height;
				return this._buildResult(c, d, c, d, e, e)
			},
			postApply: function(a) {
				cc.director._winSizeInPoints = a.getVisibleSize()
			}
		}),
		e = cc.ContentStrategy.extend({
			apply: function(a, b) {
				var c = cc._canvas.width,
					d = cc._canvas.height,
					e = c / b.width;
				return this._buildResult(c, d, c, d, e, e)
			},
			postApply: function(a) {
				cc.director._winSizeInPoints = a.getVisibleSize()
			}
		});
	cc.ContentStrategy.EXACT_FIT = new a;
	cc.ContentStrategy.SHOW_ALL = new b;
	cc.ContentStrategy.NO_BORDER = new c;
	cc.ContentStrategy.FIXED_HEIGHT = new d;
	cc.ContentStrategy.FIXED_WIDTH = new e
})();
cc.ResolutionPolicy = cc.Class.extend({
	_containerStrategy: null,
	_contentStrategy: null,
	ctor: function(a, b) {
		this.setContainerStrategy(a);
		this.setContentStrategy(b)
	},
	preApply: function(a) {
		this._containerStrategy.preApply(a);
		this._contentStrategy.preApply(a)
	},
	apply: function(a, b) {
		this._containerStrategy.apply(a, b);
		return this._contentStrategy.apply(a, b)
	},
	postApply: function(a) {
		this._containerStrategy.postApply(a);
		this._contentStrategy.postApply(a)
	},
	setContainerStrategy: function(a) {
		a instanceof cc.ContainerStrategy && (this._containerStrategy = a)
	},
	setContentStrategy: function(a) {
		a instanceof cc.ContentStrategy && (this._contentStrategy = a)
	}
});
cc.ResolutionPolicy.EXACT_FIT = 0;
cc.ResolutionPolicy.NO_BORDER = 1;
cc.ResolutionPolicy.SHOW_ALL = 2;
cc.ResolutionPolicy.FIXED_HEIGHT = 3;
cc.ResolutionPolicy.FIXED_WIDTH = 4;
cc.ResolutionPolicy.UNKNOWN = 5;
cc.screen = {
	_supportsFullScreen: !1,
	_preOnFullScreenChange: null,
	_touchEvent: "",
	_fn: null,
	_fnMap: [
		["requestFullscreen", "exitFullscreen", "fullscreenchange", "fullscreenEnabled", "fullscreenElement"],
		["requestFullScreen", "exitFullScreen", "fullScreenchange", "fullScreenEnabled", "fullScreenElement"],
		["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitIsFullScreen", "webkitCurrentFullScreenElement"],
		["mozRequestFullScreen", "mozCancelFullScreen", "mozfullscreenchange", "mozFullScreen", "mozFullScreenElement"],
		["msRequestFullscreen", "msExitFullscreen", "MSFullscreenChange", "msFullscreenEnabled", "msFullscreenElement"]
	],
	init: function() {
		this._fn = {};
		var a, b, c = this._fnMap,
			d;
		a = 0;
		for (l = c.length; a < l; a++)
			if ((b = c[a]) && b[1] in document) {
				a = 0;
				for (d = b.length; a < d; a++) this._fn[c[0][a]] = b[a];
				break
			}
		this._supportsFullScreen = void 0 != this._fn.requestFullscreen;
		this._touchEvent = "ontouchstart" in window ? "touchstart" : "mousedown"
	},
	fullScreen: function() {
		return this._supportsFullScreen && document[this._fn.fullscreenEnabled]
	},
	requestFullScreen: function(a, b) {
		if (this._supportsFullScreen) {
			a = a || document.documentElement;
			a[this._fn.requestFullscreen]();
			if (b) {
				var c = this._fn.fullscreenchange;
				this._preOnFullScreenChange && document.removeEventListener(c, this._preOnFullScreenChange);
				this._preOnFullScreenChange = b;
				cc._addEventListener(document, c, b, !1)
			}
			return a[this._fn.requestFullscreen]()
		}
	},
	exitFullScreen: function() {
		return this._supportsFullScreen ? document[this._fn.exitFullscreen]() : !0
	},
	autoFullScreen: function(a, b) {
		function c() {
			e.requestFullScreen(a, b);
			d.removeEventListener(e._touchEvent, c)
		}
		a = a || document.body;
		var d = cc._canvas || a,
			e = this;
		this.requestFullScreen(a, b);
		cc._addEventListener(d, this._touchEvent, c)
	}
};
cc.screen.init();
cc.visibleRect = {
	topLeft: cc.p(0, 0),
	topRight: cc.p(0, 0),
	top: cc.p(0, 0),
	bottomLeft: cc.p(0, 0),
	bottomRight: cc.p(0, 0),
	bottom: cc.p(0, 0),
	center: cc.p(0, 0),
	left: cc.p(0, 0),
	right: cc.p(0, 0),
	width: 0,
	height: 0,
	init: function(a) {
		var b = this.width = a.width,
			c = this.height = a.height,
			d = a.x;
		a = a.y;
		var e = a + c,
			f = d + b;
		this.topLeft.x = d;
		this.topLeft.y = e;
		this.topRight.x = f;
		this.topRight.y = e;
		this.top.x = d + b / 2;
		this.top.y = e;
		this.bottomLeft.x = d;
		this.bottomLeft.y = a;
		this.bottomRight.x = f;
		this.bottomRight.y = a;
		this.bottom.x = d + b / 2;
		this.bottom.y = a;
		this.center.x = d + b / 2;
		this.center.y = a + c / 2;
		this.left.x = d;
		this.left.y = a + c / 2;
		this.right.x = f;
		this.right.y = a + c / 2
	}
};
cc.UIInterfaceOrientationLandscapeLeft = -90;
cc.UIInterfaceOrientationLandscapeRight = 90;
cc.UIInterfaceOrientationPortraitUpsideDown = 180;
cc.UIInterfaceOrientationPortrait = 0;
cc.inputManager = {
	_mousePressed: !1,
	_isRegisterEvent: !1,
	_preTouchPoint: cc.p(0, 0),
	_prevMousePoint: cc.p(0, 0),
	_preTouchPool: [],
	_preTouchPoolPointer: 0,
	_touches: [],
	_touchesIntegerDict: {},
	_indexBitsUsed: 0,
	_maxTouches: 5,
	_accelEnabled: !1,
	_accelInterval: 1 / 30,
	_accelMinus: 1,
	_accelCurTime: 0,
	_acceleration: null,
	_accelDeviceEvent: null,
	_getUnUsedIndex: function() {
		for (var a = this._indexBitsUsed, b = 0; b < this._maxTouches; b++) {
			if (!(a & 1)) return this._indexBitsUsed |= 1 << b, b;
			a >>= 1
		}
		return -1
	},
	_removeUsedIndexBit: function(a) {
		0 > a || a >= this._maxTouches || (a = ~(1 << a), this._indexBitsUsed &= a)
	},
	_glView: null,
	handleTouchesBegin: function(a) {
		for (var b, c, d, e = [], f = this._touchesIntegerDict, g = 0, h = a.length; g < h; g++)
			if (b = a[g], d = b.getID(), c = f[d], null == c) {
				var k = this._getUnUsedIndex(); - 1 == k ? cc.log(cc._LogInfos.inputManager_handleTouchesBegin, k) : (c = this._touches[k] = new cc.Touch(b._point.x, b._point.y, b.getID()), c._setPrevPoint(b._prevPoint), f[d] = k, e.push(c))
			}
		0 < e.length && (this._glView._convertTouchesWithScale(e), a = new cc.EventTouch(e), a._eventCode = cc.EventTouch.EventCode.BEGAN, cc.eventManager.dispatchEvent(a))
	},
	handleTouchesMove: function(a) {
		for (var b, c, d = [], e = this._touches, f = 0, g = a.length; f < g; f++) b = a[f], c = b.getID(), c = this._touchesIntegerDict[c], null != c && e[c] && (e[c]._setPoint(b._point), e[c]._setPrevPoint(b._prevPoint), d.push(e[c]));
		0 < d.length && (this._glView._convertTouchesWithScale(d), a = new cc.EventTouch(d), a._eventCode = cc.EventTouch.EventCode.MOVED, cc.eventManager.dispatchEvent(a))
	},
	handleTouchesEnd: function(a) {
		a = this.getSetOfTouchesEndOrCancel(a);
		0 < a.length && (this._glView._convertTouchesWithScale(a), a = new cc.EventTouch(a), a._eventCode = cc.EventTouch.EventCode.ENDED, cc.eventManager.dispatchEvent(a))
	},
	handleTouchesCancel: function(a) {
		a = this.getSetOfTouchesEndOrCancel(a);
		0 < a.length && (this._glView._convertTouchesWithScale(a), a = new cc.EventTouch(a), a._eventCode = cc.EventTouch.EventCode.CANCELLED, cc.eventManager.dispatchEvent(a))
	},
	getSetOfTouchesEndOrCancel: function(a) {
		for (var b, c, d, e = [], f = this._touches, g = this._touchesIntegerDict, h = 0, k = a.length; h < k; h++) b = a[h], d = b.getID(), c = g[d], null != c && f[c] && (f[c]._setPoint(b._point), f[c]._setPrevPoint(b._prevPoint), e.push(f[c]), this._removeUsedIndexBit(c), delete g[d]);
		return e
	},
	getHTMLElementPosition: function(a) {
		var b = document.documentElement,
			c = window,
			d = null,
			d = cc.isFunction(a.getBoundingClientRect) ? a.getBoundingClientRect() : a instanceof HTMLCanvasElement ? {
				left: 0,
				top: 0,
				width: a.width,
				height: a.height
			} : {
				left: 0,
				top: 0,
				width: parseInt(a.style.width),
				height: parseInt(a.style.height)
			};
		return {
			left: d.left + c.pageXOffset -
				b.clientLeft,
			top: d.top + c.pageYOffset - b.clientTop,
			width: d.width,
			height: d.height
		}
	},
	getPreTouch: function(a) {
		for (var b = null, c = this._preTouchPool, d = a.getID(), e = c.length - 1; 0 <= e; e--)
			if (c[e].getID() == d) {
				b = c[e];
				break
			}
		b || (b = a);
		return b
	},
	setPreTouch: function(a) {
		for (var b = !1, c = this._preTouchPool, d = a.getID(), e = c.length - 1; 0 <= e; e--)
			if (c[e].getID() == d) {
				c[e] = a;
				b = !0;
				break
			}
		b || (50 >= c.length ? c.push(a) : (c[this._preTouchPoolPointer] = a, this._preTouchPoolPointer = (this._preTouchPoolPointer + 1) % 50))
	},
	getTouchByXY: function(a, b, c) {
		var d = this._preTouchPoint;
		a = this._glView.convertToLocationInView(a, b, c);
		b = new cc.Touch(a.x, a.y);
		b._setPrevPoint(d.x, d.y);
		d.x = a.x;
		d.y = a.y;
		return b
	},
	getMouseEvent: function(a, b, c) {
		var d = this._prevMousePoint;
		this._glView._convertMouseToLocationInView(a, b);
		b = new cc.EventMouse(c);
		b.setLocation(a.x, a.y);
		b._setPrevCursor(d.x, d.y);
		d.x = a.x;
		d.y = a.y;
		return b
	},
	getPointByEvent: function(a, b) {
		if (null != a.pageX) return {
			x: a.pageX,
			y: a.pageY
		};
		b.left -= document.body.scrollLeft;
		b.top -= document.body.scrollTop;
		return {
			x: a.clientX,
			y: a.clientY
		}
	},
	getTouchesByEvent: function(a, b) {
		for (var c = [], d = this._glView, e, f, g = this._preTouchPoint, h = a.changedTouches.length, k = 0; k < h; k++)
			if (e = a.changedTouches[k]) {
				var m;
				m = cc.sys.BROWSER_TYPE_FIREFOX === cc.sys.browserType ? d.convertToLocationInView(e.pageX, e.pageY, b) : d.convertToLocationInView(e.clientX, e.clientY, b);
				null != e.identifier ? (e = new cc.Touch(m.x, m.y, e.identifier), f = this.getPreTouch(e).getLocation(), e._setPrevPoint(f.x, f.y), this.setPreTouch(e)) : (e = new cc.Touch(m.x, m.y), e._setPrevPoint(g.x, g.y));
				g.x = m.x;
				g.y = m.y;
				c.push(e)
			}
		return c
	},
	registerSystemEvent: function(a) {
		if (!this._isRegisterEvent) {
			var b = this._glView = cc.view,
				c = this,
				d = "touches" in cc.sys.capabilities;
			"mouse" in cc.sys.capabilities && (cc._addEventListener(window, "mousedown", function() {
				c._mousePressed = !0
			}, !1), cc._addEventListener(window, "mouseup", function(b) {
				var e = c._mousePressed;
				c._mousePressed = !1;
				if (e) {
					var e = c.getHTMLElementPosition(a),
						f = c.getPointByEvent(b, e);
					cc.rectContainsPoint(new cc.Rect(e.left, e.top, e.width, e.height), f) || (d || c.handleTouchesEnd([c.getTouchByXY(f.x, f.y, e)]), e = c.getMouseEvent(f, e, cc.EventMouse.UP), e.setButton(b.button), cc.eventManager.dispatchEvent(e))
				}
			}, !1), cc._addEventListener(a, "mousedown", function(b) {
				c._mousePressed = !0;
				var e = c.getHTMLElementPosition(a),
					f = c.getPointByEvent(b, e);
				d || c.handleTouchesBegin([c.getTouchByXY(f.x, f.y, e)]);
				e = c.getMouseEvent(f, e, cc.EventMouse.DOWN);
				e.setButton(b.button);
				cc.eventManager.dispatchEvent(e);
				b.stopPropagation();
				b.preventDefault();
				a.focus()
			}, !1), cc._addEventListener(a, "mouseup", function(b) {
				c._mousePressed = !1;
				var e = c.getHTMLElementPosition(a),
					f = c.getPointByEvent(b, e);
				d || c.handleTouchesEnd([c.getTouchByXY(f.x, f.y, e)]);
				e = c.getMouseEvent(f, e, cc.EventMouse.UP);
				e.setButton(b.button);
				cc.eventManager.dispatchEvent(e);
				b.stopPropagation();
				b.preventDefault()
			}, !1), cc._addEventListener(a, "mousemove", function(b) {
				var e = c.getHTMLElementPosition(a),
					f = c.getPointByEvent(b, e);
				d || c.handleTouchesMove([c.getTouchByXY(f.x, f.y, e)]);
				e = c.getMouseEvent(f, e, cc.EventMouse.MOVE);
				c._mousePressed ? e.setButton(b.button) : e.setButton(null);
				cc.eventManager.dispatchEvent(e);
				b.stopPropagation();
				b.preventDefault()
			}, !1), cc._addEventListener(a, "mousewheel", function(b) {
				var d = c.getHTMLElementPosition(a),
					e = c.getPointByEvent(b, d),
					d = c.getMouseEvent(e, d, cc.EventMouse.SCROLL);
				d.setButton(b.button);
				d.setScrollData(0, b.wheelDelta);
				cc.eventManager.dispatchEvent(d);
				b.stopPropagation();
				b.preventDefault()
			}, !1), cc._addEventListener(a, "DOMMouseScroll", function(b) {
				var d = c.getHTMLElementPosition(a),
					e = c.getPointByEvent(b, d),
					d = c.getMouseEvent(e, d, cc.EventMouse.SCROLL);
				d.setButton(b.button);
				d.setScrollData(0, -120 * b.detail);
				cc.eventManager.dispatchEvent(d);
				b.stopPropagation();
				b.preventDefault()
			}, !1));
			if (window.navigator.msPointerEnabled) {
				var e = {
						MSPointerDown: c.handleTouchesBegin,
						MSPointerMove: c.handleTouchesMove,
						MSPointerUp: c.handleTouchesEnd,
						MSPointerCancel: c.handleTouchesCancel
					},
					f;
				for (f in e)(function(b, d) {
					cc._addEventListener(a, b, function(b) {
						var e = c.getHTMLElementPosition(a);
						e.left -= document.documentElement.scrollLeft;
						e.top -= document.documentElement.scrollTop;
						d.call(c, [c.getTouchByXY(b.clientX, b.clientY, e)]);
						b.stopPropagation()
					}, !1)
				})(f, e[f])
			}
			d && (cc._addEventListener(a, "touchstart", function(b) {
				if (b.changedTouches) {
					var d = c.getHTMLElementPosition(a);
					d.left -= document.body.scrollLeft;
					d.top -= document.body.scrollTop;
					c.handleTouchesBegin(c.getTouchesByEvent(b, d));
					b.stopPropagation();
					b.preventDefault();
					a.focus()
				}
			}, !1), cc._addEventListener(a, "touchmove", function(b) {
				if (b.changedTouches) {
					var d = c.getHTMLElementPosition(a);
					d.left -= document.body.scrollLeft;
					d.top -= document.body.scrollTop;
					c.handleTouchesMove(c.getTouchesByEvent(b, d));
					b.stopPropagation();
					b.preventDefault()
				}
			}, !1), cc._addEventListener(a, "touchend", function(b) {
				if (b.changedTouches) {
					var d = c.getHTMLElementPosition(a);
					d.left -= document.body.scrollLeft;
					d.top -= document.body.scrollTop;
					c.handleTouchesEnd(c.getTouchesByEvent(b, d));
					b.stopPropagation();
					b.preventDefault()
				}
			}, !1), cc._addEventListener(a, "touchcancel", function(d) {
				if (d.changedTouches) {
					var e = c.getHTMLElementPosition(a);
					e.left -= document.body.scrollLeft;
					e.top -= document.body.scrollTop;
					b.handleTouchesCancel(c.getTouchesByEvent(d, e));
					d.stopPropagation();
					d.preventDefault()
				}
			}, !1));
			this._registerKeyboardEvent();
			this._registerAccelerometerEvent();
			this._isRegisterEvent = !0
		}
	},
	_registerKeyboardEvent: function() {},
	_registerAccelerometerEvent: function() {},
	update: function(a) {
		this._accelCurTime > this._accelInterval && (this._accelCurTime -= this._accelInterval, cc.eventManager.dispatchEvent(new cc.EventAcceleration(this._acceleration)));
		this._accelCurTime += a
	}
};
var _p = cc.inputManager;
_p.setAccelerometerEnabled = function(a) {
	this._accelEnabled !== a && (this._accelEnabled = a, a = cc.director.getScheduler(), this._accelEnabled ? (this._accelCurTime = 0, a.scheduleUpdateForTarget(this)) : (this._accelCurTime = 0, a.unscheduleUpdateForTarget(this)))
};
_p.setAccelerometerInterval = function(a) {
	this._accelInterval !== a && (this._accelInterval = a)
};
_p._registerKeyboardEvent = function() {
	cc._addEventListener(cc._canvas, "keydown", function(a) {
		cc.eventManager.dispatchEvent(new cc.EventKeyboard(a.keyCode, !0));
		a.stopPropagation();
		a.preventDefault()
	}, !1);
	cc._addEventListener(cc._canvas, "keyup", function(a) {
		cc.eventManager.dispatchEvent(new cc.EventKeyboard(a.keyCode, !1));
		a.stopPropagation();
		a.preventDefault()
	}, !1)
};
_p._registerAccelerometerEvent = function() {
	var a = window;
	this._acceleration = new cc.Acceleration;
	this._accelDeviceEvent = a.DeviceMotionEvent || a.DeviceOrientationEvent;
	cc.sys.browserType == cc.sys.BROWSER_TYPE_MOBILE_QQ && (this._accelDeviceEvent = window.DeviceOrientationEvent);
	var b = this._accelDeviceEvent == a.DeviceMotionEvent ? "devicemotion" : "deviceorientation",
		c = navigator.userAgent;
	if (/Android/.test(c) || /Adr/.test(c) && cc.sys.browserType == cc.BROWSER_TYPE_UC) this._minus = -1;
	cc._addEventListener(a, b, this.didAccelerate.bind(this), !1)
};
_p.didAccelerate = function(a) {
	var b = window;
	if (this._accelEnabled) {
		var c = this._acceleration,
			d, e, f;
		this._accelDeviceEvent == window.DeviceMotionEvent ? (f = a.accelerationIncludingGravity, d = this._accelMinus * f.x * 0.1, e = this._accelMinus * f.y * 0.1, f = 0.1 * f.z) : (d = a.gamma / 90 * 0.981, e = 0.981 * -(a.beta / 90), f = a.alpha / 90 * 0.981);
		cc.sys.os === cc.sys.OS_ANDROID ? (c.x = -d, c.y = -e) : (c.x = d, c.y = e);
		c.z = f;
		c.timestamp = a.timeStamp || Date.now();
		a = c.x;
		b.orientation === cc.UIInterfaceOrientationLandscapeRight ? (c.x = -c.y, c.y = a) : b.orientation === cc.UIInterfaceOrientationLandscapeLeft ? (c.x = c.y, c.y = -a) : b.orientation === cc.UIInterfaceOrientationPortraitUpsideDown && (c.x = -c.x, c.y = -c.y)
	}
};
delete _p;
cc.AffineTransform = function(a, b, c, d, e, f) {
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.tx = e;
	this.ty = f
};
cc.affineTransformMake = function(a, b, c, d, e, f) {
	return {
		a: a,
		b: b,
		c: c,
		d: d,
		tx: e,
		ty: f
	}
};
cc.pointApplyAffineTransform = function(a, b) {
	return {
		x: b.a * a.x + b.c * a.y + b.tx,
		y: b.b * a.x + b.d * a.y + b.ty
	}
};
cc._pointApplyAffineTransform = function(a, b, c) {
	return {
		x: c.a * a + c.c * b + c.tx,
		y: c.b * a + c.d * b + c.ty
	}
};
cc.sizeApplyAffineTransform = function(a, b) {
	return {
		width: b.a * a.width + b.c * a.height,
		height: b.b * a.width + b.d * a.height
	}
};
cc.affineTransformMakeIdentity = function() {
	return {
		a: 1,
		b: 0,
		c: 0,
		d: 1,
		tx: 0,
		ty: 0
	}
};
cc.affineTransformIdentity = function() {
	return {
		a: 1,
		b: 0,
		c: 0,
		d: 1,
		tx: 0,
		ty: 0
	}
};
cc.rectApplyAffineTransform = function(a, b) {
	var c = cc.rectGetMinY(a),
		d = cc.rectGetMinX(a),
		e = cc.rectGetMaxX(a),
		f = cc.rectGetMaxY(a),
		g = cc._pointApplyAffineTransform(d, c, b),
		c = cc._pointApplyAffineTransform(e, c, b),
		d = cc._pointApplyAffineTransform(d, f, b),
		h = cc._pointApplyAffineTransform(e, f, b),
		e = Math.min(g.x, c.x, d.x, h.x),
		f = Math.max(g.x, c.x, d.x, h.x),
		k = Math.min(g.y, c.y, d.y, h.y),
		g = Math.max(g.y, c.y, d.y, h.y);
	return cc.rect(e, k, f - e, g - k)
};
cc._rectApplyAffineTransformIn = function(a, b) {
	var c = cc.rectGetMinY(a),
		d = cc.rectGetMinX(a),
		e = cc.rectGetMaxX(a),
		f = cc.rectGetMaxY(a),
		g = cc._pointApplyAffineTransform(d, c, b),
		c = cc._pointApplyAffineTransform(e, c, b),
		d = cc._pointApplyAffineTransform(d, f, b),
		h = cc._pointApplyAffineTransform(e, f, b),
		e = Math.min(g.x, c.x, d.x, h.x),
		f = Math.max(g.x, c.x, d.x, h.x),
		k = Math.min(g.y, c.y, d.y, h.y),
		g = Math.max(g.y, c.y, d.y, h.y);
	a.x = e;
	a.y = k;
	a.width = f - e;
	a.height = g - k;
	return a
};
cc.affineTransformTranslate = function(a, b, c) {
	return {
		a: a.a,
		b: a.b,
		c: a.c,
		d: a.d,
		tx: a.tx + a.a * b + a.c * c,
		ty: a.ty + a.b * b + a.d * c
	}
};
cc.affineTransformScale = function(a, b, c) {
	return {
		a: a.a * b,
		b: a.b * b,
		c: a.c * c,
		d: a.d * c,
		tx: a.tx,
		ty: a.ty
	}
};
cc.affineTransformRotate = function(a, b) {
	var c = Math.sin(b),
		d = Math.cos(b);
	return {
		a: a.a * d + a.c * c,
		b: a.b * d + a.d * c,
		c: a.c * d - a.a * c,
		d: a.d * d - a.b * c,
		tx: a.tx,
		ty: a.ty
	}
};
cc.affineTransformConcat = function(a, b) {
	return {
		a: a.a * b.a + a.b * b.c,
		b: a.a * b.b + a.b * b.d,
		c: a.c * b.a + a.d * b.c,
		d: a.c * b.b + a.d * b.d,
		tx: a.tx * b.a + a.ty * b.c + b.tx,
		ty: a.tx * b.b + a.ty * b.d + b.ty
	}
};
cc.affineTransformEqualToTransform = function(a, b) {
	return a.a === b.a && a.b === b.b && a.c === b.c && a.d === b.d && a.tx === b.tx && a.ty === b.ty
};
cc.affineTransformInvert = function(a) {
	var b = 1 / (a.a * a.d - a.b * a.c);
	return {
		a: b * a.d,
		b: -b * a.b,
		c: -b * a.c,
		d: b * a.a,
		tx: b * (a.c * a.ty - a.d * a.tx),
		ty: b * (a.b * a.tx - a.a * a.ty)
	}
};
cc.POINT_EPSILON = parseFloat("1.192092896e-07F");
cc.pNeg = function(a) {
	return cc.p(-a.x, -a.y)
};
cc.pAdd = function(a, b) {
	return cc.p(a.x + b.x, a.y + b.y)
};
cc.pSub = function(a, b) {
	return cc.p(a.x - b.x, a.y - b.y)
};
cc.pMult = function(a, b) {
	return cc.p(a.x * b, a.y * b)
};
cc.pMidpoint = function(a, b) {
	return cc.pMult(cc.pAdd(a, b), 0.5)
};
cc.pDot = function(a, b) {
	return a.x * b.x + a.y * b.y
};
cc.pCross = function(a, b) {
	return a.x * b.y - a.y * b.x
};
cc.pPerp = function(a) {
	return cc.p(-a.y, a.x)
};
cc.pRPerp = function(a) {
	return cc.p(a.y, -a.x)
};
cc.pProject = function(a, b) {
	return cc.pMult(b, cc.pDot(a, b) / cc.pDot(b, b))
};
cc.pRotate = function(a, b) {
	return cc.p(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x)
};
cc.pUnrotate = function(a, b) {
	return cc.p(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y)
};
cc.pLengthSQ = function(a) {
	return cc.pDot(a, a)
};
cc.pDistanceSQ = function(a, b) {
	return cc.pLengthSQ(cc.pSub(a, b))
};
cc.pLength = function(a) {
	return Math.sqrt(cc.pLengthSQ(a))
};
cc.pDistance = function(a, b) {
	return cc.pLength(cc.pSub(a, b))
};
cc.pNormalize = function(a) {
	return cc.pMult(a, 1 / cc.pLength(a))
};
cc.pForAngle = function(a) {
	return cc.p(Math.cos(a), Math.sin(a))
};
cc.pToAngle = function(a) {
	return Math.atan2(a.y, a.x)
};
cc.clampf = function(a, b, c) {
	if (b > c) {
		var d = b;
		b = c;
		c = d
	}
	return a < b ? b : a < c ? a : c
};
cc.pClamp = function(a, b, c) {
	return cc.p(cc.clampf(a.x, b.x, c.x), cc.clampf(a.y, b.y, c.y))
};
cc.pFromSize = function(a) {
	return cc.p(a.width, a.height)
};
cc.pCompOp = function(a, b) {
	return cc.p(b(a.x), b(a.y))
};
cc.pLerp = function(a, b, c) {
	return cc.pAdd(cc.pMult(a, 1 - c), cc.pMult(b, c))
};
cc.pFuzzyEqual = function(a, b, c) {
	return a.x - c <= b.x && b.x <= a.x + c && a.y - c <= b.y && b.y <= a.y + c ? !0 : !1
};
cc.pCompMult = function(a, b) {
	return cc.p(a.x * b.x, a.y * b.y)
};
cc.pAngleSigned = function(a, b) {
	var c = cc.pNormalize(a),
		d = cc.pNormalize(b),
		c = Math.atan2(c.x * d.y - c.y * d.x, cc.pDot(c, d));
	return Math.abs(c) < cc.POINT_EPSILON ? 0 : c
};
cc.pAngle = function(a, b) {
	var c = Math.acos(cc.pDot(cc.pNormalize(a), cc.pNormalize(b)));
	return Math.abs(c) < cc.POINT_EPSILON ? 0 : c
};
cc.pRotateByAngle = function(a, b, c) {
	a = cc.pSub(a, b);
	var d = Math.cos(c);
	c = Math.sin(c);
	var e = a.x;
	a.x = e * d - a.y * c + b.x;
	a.y = e * c + a.y * d + b.y;
	return a
};
cc.pLineIntersect = function(a, b, c, d, e) {
	if (a.x == b.x && a.y == b.y || c.x == d.x && c.y == d.y) return !1;
	var f = b.x - a.x;
	b = b.y - a.y;
	var g = d.x - c.x;
	d = d.y - c.y;
	var h = a.x - c.x;
	a = a.y - c.y;
	c = d * f - g * b;
	e.x = g * a - d * h;
	e.y = f * a - b * h;
	if (0 == c) return 0 == e.x || 0 == e.y ? !0 : !1;
	e.x /= c;
	e.y /= c;
	return !0
};
cc.pSegmentIntersect = function(a, b, c, d) {
	var e = cc.p(0, 0);
	return cc.pLineIntersect(a, b, c, d, e) && 0 <= e.x && 1 >= e.x && 0 <= e.y && 1 >= e.y ? !0 : !1
};
cc.pIntersectPoint = function(a, b, c, d) {
	var e = cc.p(0, 0);
	return cc.pLineIntersect(a, b, c, d, e) ? (c = cc.p(0, 0), c.x = a.x + e.x * (b.x - a.x), c.y = a.y + e.x * (b.y - a.y), c) : cc.p(0, 0)
};
cc.pSameAs = function(a, b) {
	return null != a && null != b ? a.x == b.x && a.y == b.y : !1
};
cc.pZeroIn = function(a) {
	a.x = 0;
	a.y = 0
};
cc.pIn = function(a, b) {
	a.x = b.x;
	a.y = b.y
};
cc.pMultIn = function(a, b) {
	a.x *= b;
	a.y *= b
};
cc.pSubIn = function(a, b) {
	a.x -= b.x;
	a.y -= b.y
};
cc.pAddIn = function(a, b) {
	a.x += b.x;
	a.y += b.y
};
cc.pNormalizeIn = function(a) {
	cc.pMultIn(a, 1 / Math.sqrt(a.x * a.x + a.y * a.y))
};
cc.vertexLineToPolygon = function(a, b, c, d, e) {
	e += d;
	if (!(1 >= e)) {
		b *= 0.5;
		for (var f, g = e - 1, h = d; h < e; h++) {
			f = 2 * h;
			var k = cc.p(a[2 * h], a[2 * h + 1]),
				m;
			if (0 === h) m = cc.pPerp(cc.pNormalize(cc.pSub(k, cc.p(a[2 * (h + 1)], a[2 * (h + 1) + 1]))));
			else if (h === g) m = cc.pPerp(cc.pNormalize(cc.pSub(cc.p(a[2 * (h - 1)], a[2 * (h - 1) + 1]), k)));
			else {
				m = cc.p(a[2 * (h - 1)], a[2 * (h - 1) + 1]);
				var n = cc.p(a[2 * (h + 1)], a[2 * (h + 1) + 1]),
					q = cc.pNormalize(cc.pSub(n, k)),
					s = cc.pNormalize(cc.pSub(m, k)),
					r = Math.acos(cc.pDot(q, s));
				m = r < cc.degreesToRadians(70) ? cc.pPerp(cc.pNormalize(cc.pMidpoint(q, s))) : r < cc.degreesToRadians(170) ? cc.pNormalize(cc.pMidpoint(q, s)) : cc.pPerp(cc.pNormalize(cc.pSub(n, m)))
			}
			m = cc.pMult(m, b);
			c[2 * f] = k.x + m.x;
			c[2 * f + 1] = k.y + m.y;
			c[2 * (f + 1)] = k.x - m.x;
			c[2 * (f + 1) + 1] = k.y - m.y
		}
		for (h = 0 == d ? 0 : d - 1; h < g; h++) f = 2 * h, a = f + 2, b = cc.vertex2(c[2 * f], c[2 * f + 1]), e = cc.vertex2(c[2 * (f + 1)], c[2 * (f + 1) + 1]), f = cc.vertex2(c[2 * a], c[2 * a]), d = cc.vertex2(c[2 * (a + 1)], c[2 * (a + 1) + 1]), b = !cc.vertexLineIntersect(b.x, b.y, d.x, d.y, e.x, e.y, f.x, f.y), !b.isSuccess && (0 > b.value || 1 < b.value) && (b.isSuccess = !0), b.isSuccess && (c[2 * a] = d.x, c[2 * a + 1] = d.y, c[2 * (a + 1)] = f.x, c[2 * (a + 1) + 1] = f.y)
	}
};
cc.vertexLineIntersect = function(a, b, c, d, e, f, g, h) {
	if (a == c && b == d || e == g && f == h) return {
		isSuccess: !1,
		value: 0
	};
	c -= a;
	d -= b;
	e -= a;
	f -= b;
	g -= a;
	h -= b;
	a = Math.sqrt(c * c + d * d);
	c /= a;
	d /= a;
	b = e * c + f * d;
	f = f * c - e * d;
	e = b;
	b = g * c + h * d;
	h = h * c - g * d;
	g = b;
	return f == h ? {
		isSuccess: !1,
		value: 0
	} : {
		isSuccess: !0,
		value: (g + (e - g) * h / (h - f)) / a
	}
};
cc.vertexListIsClockwise = function(a) {
	for (var b = 0, c = a.length; b < c; b++) {
		var d = a[(b + 1) % c],
			e = a[(b + 2) % c];
		if (0 < cc.pCross(cc.pSub(d, a[b]), cc.pSub(e, d))) return !1
	}
	return !0
};
cc.CGAffineToGL = function(a, b) {
	b[2] = b[3] = b[6] = b[7] = b[8] = b[9] = b[11] = b[14] = 0;
	b[10] = b[15] = 1;
	b[0] = a.a;
	b[4] = a.c;
	b[12] = a.tx;
	b[1] = a.b;
	b[5] = a.d;
	b[13] = a.ty
};
cc.GLToCGAffine = function(a, b) {
	b.a = a[0];
	b.c = a[4];
	b.tx = a[12];
	b.b = a[1];
	b.d = a[5];
	b.ty = a[13]
};
cc.Touch = cc.Class.extend({
	_point: null,
	_prevPoint: null,
	_id: 0,
	_startPointCaptured: !1,
	_startPoint: null,
	ctor: function(a, b, c) {
		this._point = cc.p(a || 0, b || 0);
		this._id = c || 0
	},
	getLocation: function() {
		return {
			x: this._point.x,
			y: this._point.y
		}
	},
	getLocationX: function() {
		return this._point.x
	},
	getLocationY: function() {
		return this._point.y
	},
	getPreviousLocation: function() {
		return {
			x: this._prevPoint.x,
			y: this._prevPoint.y
		}
	},
	getStartLocation: function() {
		return {
			x: this._startPoint.x,
			y: this._startPoint.y
		}
	},
	getDelta: function() {
		return cc.pSub(this._point, this._prevPoint)
	},
	getLocationInView: function() {
		return {
			x: this._point.x,
			y: this._point.y
		}
	},
	getPreviousLocationInView: function() {
		return {
			x: this._prevPoint.x,
			y: this._prevPoint.y
		}
	},
	getStartLocationInView: function() {
		return {
			x: this._startPoint.x,
			y: this._startPoint.y
		}
	},
	getID: function() {
		return this._id
	},
	getId: function() {
		cc.log("getId is deprecated. Please use getID instead.");
		return this._id
	},
	setTouchInfo: function(a, b, c) {
		this._prevPoint = this._point;
		this._point = cc.p(b || 0, c || 0);
		this._id = a;
		this._startPointCaptured || (this._startPoint = cc.p(this._point), this._startPointCaptured = !0)
	},
	_setPoint: function(a, b) {
		void 0 === b ? (this._point.x = a.x, this._point.y = a.y) : (this._point.x = a, this._point.y = b)
	},
	_setPrevPoint: function(a, b) {
		this._prevPoint = void 0 === b ? cc.p(a.x, a.y) : cc.p(a || 0, b || 0)
	}
});
cc.Event = cc.Class.extend({
	_type: 0,
	_isStopped: !1,
	_currentTarget: null,
	_setCurrentTarget: function(a) {
		this._currentTarget = a
	},
	ctor: function(a) {
		this._type = a
	},
	getType: function() {
		return this._type
	},
	stopPropagation: function() {
		this._isStopped = !0
	},
	isStopped: function() {
		return this._isStopped
	},
	getCurrentTarget: function() {
		return this._currentTarget
	}
});
cc.Event.TOUCH = 0;
cc.Event.KEYBOARD = 1;
cc.Event.ACCELERATION = 2;
cc.Event.MOUSE = 3;
cc.Event.CUSTOM = 4;
cc.EventCustom = cc.Event.extend({
	_eventName: null,
	_userData: null,
	ctor: function(a) {
		cc.Event.prototype.ctor.call(this, cc.Event.CUSTOM);
		this._eventName = a
	},
	setUserData: function(a) {
		this._userData = a
	},
	getUserData: function() {
		return this._userData
	},
	getEventName: function() {
		return this._eventName
	}
});
cc.EventMouse = cc.Event.extend({
	_eventType: 0,
	_button: 0,
	_x: 0,
	_y: 0,
	_prevX: 0,
	_prevY: 0,
	_scrollX: 0,
	_scrollY: 0,
	ctor: function(a) {
		cc.Event.prototype.ctor.call(this, cc.Event.MOUSE);
		this._eventType = a
	},
	setScrollData: function(a, b) {
		this._scrollX = a;
		this._scrollY = b
	},
	getScrollX: function() {
		return this._scrollX
	},
	getScrollY: function() {
		return this._scrollY
	},
	setLocation: function(a, b) {
		this._x = a;
		this._y = b
	},
	getLocation: function() {
		return {
			x: this._x,
			y: this._y
		}
	},
	getLocationInView: function() {
		return {
			x: this._x,
			y: cc.view._designResolutionSize.height -
				this._y
		}
	},
	_setPrevCursor: function(a, b) {
		this._prevX = a;
		this._prevY = b
	},
	getDelta: function() {
		return {
			x: this._x - this._prevX,
			y: this._y - this._prevY
		}
	},
	getDeltaX: function() {
		return this._x - this._prevX
	},
	getDeltaY: function() {
		return this._y - this._prevY
	},
	setButton: function(a) {
		this._button = a
	},
	getButton: function() {
		return this._button
	},
	getLocationX: function() {
		return this._x
	},
	getLocationY: function() {
		return this._y
	}
});
cc.EventMouse.NONE = 0;
cc.EventMouse.DOWN = 1;
cc.EventMouse.UP = 2;
cc.EventMouse.MOVE = 3;
cc.EventMouse.SCROLL = 4;
cc.EventMouse.BUTTON_LEFT = 0;
cc.EventMouse.BUTTON_RIGHT = 2;
cc.EventMouse.BUTTON_MIDDLE = 1;
cc.EventMouse.BUTTON_4 = 3;
cc.EventMouse.BUTTON_5 = 4;
cc.EventMouse.BUTTON_6 = 5;
cc.EventMouse.BUTTON_7 = 6;
cc.EventMouse.BUTTON_8 = 7;
cc.EventTouch = cc.Event.extend({
	_eventCode: 0,
	_touches: null,
	ctor: function(a) {
		cc.Event.prototype.ctor.call(this, cc.Event.TOUCH);
		this._touches = a || []
	},
	getEventCode: function() {
		return this._eventCode
	},
	getTouches: function() {
		return this._touches
	},
	_setEventCode: function(a) {
		this._eventCode = a
	},
	_setTouches: function(a) {
		this._touches = a
	}
});
cc.EventTouch.MAX_TOUCHES = 5;
cc.EventTouch.EventCode = {
	BEGAN: 0,
	MOVED: 1,
	ENDED: 2,
	CANCELLED: 3
};
cc.EventListener = cc.Class.extend({
	_onEvent: null,
	_type: 0,
	_listenerID: null,
	_registered: !1,
	_fixedPriority: 0,
	_node: null,
	_paused: !1,
	_isEnabled: !0,
	ctor: function(a, b, c) {
		this._onEvent = c;
		this._type = a || 0;
		this._listenerID = b || ""
	},
	_setPaused: function(a) {
		this._paused = a
	},
	_isPaused: function() {
		return this._paused
	},
	_setRegistered: function(a) {
		this._registered = a
	},
	_isRegistered: function() {
		return this._registered
	},
	_getType: function() {
		return this._type
	},
	_getListenerID: function() {
		return this._listenerID
	},
	_setFixedPriority: function(a) {
		this._fixedPriority = a
	},
	_getFixedPriority: function() {
		return this._fixedPriority
	},
	_setSceneGraphPriority: function(a) {
		this._node = a
	},
	_getSceneGraphPriority: function() {
		return this._node
	},
	checkAvailable: function() {
		return null != this._onEvent
	},
	clone: function() {
		return null
	},
	setEnabled: function(a) {
		this._isEnabled = a
	},
	isEnabled: function() {
		return this._isEnabled
	},
	retain: function() {},
	release: function() {}
});
cc.EventListener.UNKNOWN = 0;
cc.EventListener.TOUCH_ONE_BY_ONE = 1;
cc.EventListener.TOUCH_ALL_AT_ONCE = 2;
cc.EventListener.KEYBOARD = 3;
cc.EventListener.MOUSE = 4;
cc.EventListener.ACCELERATION = 5;
cc.EventListener.CUSTOM = 6;
cc._EventListenerCustom = cc.EventListener.extend({
	_onCustomEvent: null,
	ctor: function(a, b) {
		this._onCustomEvent = b;
		var c = this;
		cc.EventListener.prototype.ctor.call(this, cc.EventListener.CUSTOM, a, function(a) {
			null != c._onCustomEvent && c._onCustomEvent(a)
		})
	},
	checkAvailable: function() {
		return cc.EventListener.prototype.checkAvailable.call(this) && null != this._onCustomEvent
	},
	clone: function() {
		return new cc._EventListenerCustom(this._listenerID, this._onCustomEvent)
	}
});
cc._EventListenerCustom.create = function(a, b) {
	return new cc._EventListenerCustom(a, b)
};
cc._EventListenerMouse = cc.EventListener.extend({
	onMouseDown: null,
	onMouseUp: null,
	onMouseMove: null,
	onMouseScroll: null,
	ctor: function() {
		var a = this;
		cc.EventListener.prototype.ctor.call(this, cc.EventListener.MOUSE, cc._EventListenerMouse.LISTENER_ID, function(b) {
			var c = cc.EventMouse;
			switch (b._eventType) {
				case c.DOWN:
					if (a.onMouseDown) a.onMouseDown(b);
					break;
				case c.UP:
					if (a.onMouseUp) a.onMouseUp(b);
					break;
				case c.MOVE:
					if (a.onMouseMove) a.onMouseMove(b);
					break;
				case c.SCROLL:
					if (a.onMouseScroll) a.onMouseScroll(b)
			}
		})
	},
	clone: function() {
		var a = new cc._EventListenerMouse;
		a.onMouseDown = this.onMouseDown;
		a.onMouseUp = this.onMouseUp;
		a.onMouseMove = this.onMouseMove;
		a.onMouseScroll = this.onMouseScroll;
		return a
	},
	checkAvailable: function() {
		return !0
	}
});
cc._EventListenerMouse.LISTENER_ID = "__cc_mouse";
cc._EventListenerMouse.create = function() {
	return new cc._EventListenerMouse
};
cc._EventListenerTouchOneByOne = cc.EventListener.extend({
	_claimedTouches: null,
	swallowTouches: !1,
	onTouchBegan: null,
	onTouchMoved: null,
	onTouchEnded: null,
	onTouchCancelled: null,
	ctor: function() {
		cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ONE_BY_ONE, cc._EventListenerTouchOneByOne.LISTENER_ID, null);
		this._claimedTouches = []
	},
	setSwallowTouches: function(a) {
		this.swallowTouches = a
	},
	clone: function() {
		var a = new cc._EventListenerTouchOneByOne;
		a.onTouchBegan = this.onTouchBegan;
		a.onTouchMoved = this.onTouchMoved;
		a.onTouchEnded = this.onTouchEnded;
		a.onTouchCancelled = this.onTouchCancelled;
		a.swallowTouches = this.swallowTouches;
		return a
	},
	checkAvailable: function() {
		return this.onTouchBegan ? !0 : (cc.log(cc._LogInfos._EventListenerTouchOneByOne_checkAvailable), !1)
	}
});
cc._EventListenerTouchOneByOne.LISTENER_ID = "__cc_touch_one_by_one";
cc._EventListenerTouchOneByOne.create = function() {
	return new cc._EventListenerTouchOneByOne
};
cc._EventListenerTouchAllAtOnce = cc.EventListener.extend({
	onTouchesBegan: null,
	onTouchesMoved: null,
	onTouchesEnded: null,
	onTouchesCancelled: null,
	ctor: function() {
		cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ALL_AT_ONCE, cc._EventListenerTouchAllAtOnce.LISTENER_ID, null)
	},
	clone: function() {
		var a = new cc._EventListenerTouchAllAtOnce;
		a.onTouchesBegan = this.onTouchesBegan;
		a.onTouchesMoved = this.onTouchesMoved;
		a.onTouchesEnded = this.onTouchesEnded;
		a.onTouchesCancelled = this.onTouchesCancelled;
		return a
	},
	checkAvailable: function() {
		return null == this.onTouchesBegan && null == this.onTouchesMoved && null == this.onTouchesEnded && null == this.onTouchesCancelled ? (cc.log(cc._LogInfos._EventListenerTouchAllAtOnce_checkAvailable), !1) : !0
	}
});
cc._EventListenerTouchAllAtOnce.LISTENER_ID = "__cc_touch_all_at_once";
cc._EventListenerTouchAllAtOnce.create = function() {
	return new cc._EventListenerTouchAllAtOnce
};
cc.EventListener.create = function(a) {
	cc.assert(a && a.event, cc._LogInfos.EventListener_create);
	var b = a.event;
	delete a.event;
	var c = null;
	b === cc.EventListener.TOUCH_ONE_BY_ONE ? c = new cc._EventListenerTouchOneByOne : b === cc.EventListener.TOUCH_ALL_AT_ONCE ? c = new cc._EventListenerTouchAllAtOnce : b === cc.EventListener.MOUSE ? c = new cc._EventListenerMouse : b === cc.EventListener.CUSTOM ? (c = new cc._EventListenerCustom(a.eventName, a.callback), delete a.eventName, delete a.callback) : b === cc.EventListener.KEYBOARD ? c = new cc._EventListenerKeyboard : b === cc.EventListener.ACCELERATION && (c = new cc._EventListenerAcceleration(a.callback), delete a.callback);
	for (var d in a) c[d] = a[d];
	return c
};
cc._EventListenerVector = cc.Class.extend({
	_fixedListeners: null,
	_sceneGraphListeners: null,
	gt0Index: 0,
	ctor: function() {
		this._fixedListeners = [];
		this._sceneGraphListeners = []
	},
	size: function() {
		return this._fixedListeners.length + this._sceneGraphListeners.length
	},
	empty: function() {
		return 0 === this._fixedListeners.length && 0 === this._sceneGraphListeners.length
	},
	push: function(a) {
		0 == a._getFixedPriority() ? this._sceneGraphListeners.push(a) : this._fixedListeners.push(a)
	},
	clearSceneGraphListeners: function() {
		this._sceneGraphListeners.length = 0
	},
	clearFixedListeners: function() {
		this._fixedListeners.length = 0
	},
	clear: function() {
		this._sceneGraphListeners.length = 0;
		this._fixedListeners.length = 0
	},
	getFixedPriorityListeners: function() {
		return this._fixedListeners
	},
	getSceneGraphPriorityListeners: function() {
		return this._sceneGraphListeners
	}
});
cc.__getListenerID = function(a) {
	var b = cc.Event,
		c = a.getType();
	if (c === b.ACCELERATION) return cc._EventListenerAcceleration.LISTENER_ID;
	if (c === b.CUSTOM) return a.getEventName();
	if (c === b.KEYBOARD) return cc._EventListenerKeyboard.LISTENER_ID;
	if (c === b.MOUSE) return cc._EventListenerMouse.LISTENER_ID;
	c === b.TOUCH && cc.log(cc._LogInfos.__getListenerID);
	return ""
};
cc.eventManager = {
	DIRTY_NONE: 0,
	DIRTY_FIXED_PRIORITY: 1,
	DIRTY_SCENE_GRAPH_PRIORITY: 2,
	DIRTY_ALL: 3,
	_listenersMap: {},
	_priorityDirtyFlagMap: {},
	_nodeListenersMap: {},
	_nodePriorityMap: {},
	_globalZOrderNodeMap: {},
	_toAddedListeners: [],
	_dirtyNodes: [],
	_inDispatch: 0,
	_isEnabled: !1,
	_nodePriorityIndex: 0,
	_internalCustomListenerIDs: [cc.game.EVENT_HIDE, cc.game.EVENT_SHOW],
	_setDirtyForNode: function(a) {
		null != this._nodeListenersMap[a.__instanceId] && this._dirtyNodes.push(a);
		a = a.getChildren();
		for (var b = 0, c = a.length; b < c; b++) this._setDirtyForNode(a[b])
	},
	pauseTarget: function(a, b) {
		var c = this._nodeListenersMap[a.__instanceId],
			d, e;
		if (c)
			for (d = 0, e = c.length; d < e; d++) c[d]._setPaused(!0);
		if (!0 === b)
			for (c = a.getChildren(), d = 0, e = c.length; d < e; d++) this.pauseTarget(c[d], !0)
	},
	resumeTarget: function(a, b) {
		var c = this._nodeListenersMap[a.__instanceId],
			d, e;
		if (c)
			for (d = 0, e = c.length; d < e; d++) c[d]._setPaused(!1);
		this._setDirtyForNode(a);
		if (!0 === b)
			for (c = a.getChildren(), d = 0, e = c.length; d < e; d++) this.resumeTarget(c[d], !0)
	},
	_addListener: function(a) {
		0 === this._inDispatch ? this._forceAddEventListener(a) : this._toAddedListeners.push(a)
	},
	_forceAddEventListener: function(a) {
		var b = a._getListenerID(),
			c = this._listenersMap[b];
		c || (c = new cc._EventListenerVector, this._listenersMap[b] = c);
		c.push(a);
		0 == a._getFixedPriority() ? (this._setDirty(b, this.DIRTY_SCENE_GRAPH_PRIORITY), b = a._getSceneGraphPriority(), null == b && cc.log(cc._LogInfos.eventManager__forceAddEventListener), this._associateNodeAndEventListener(b, a), b.isRunning() && this.resumeTarget(b)) : this._setDirty(b, this.DIRTY_FIXED_PRIORITY)
	},
	_getListeners: function(a) {
		return this._listenersMap[a]
	},
	_updateDirtyFlagForSceneGraph: function() {
		if (0 != this._dirtyNodes.length) {
			for (var a = this._dirtyNodes, b, c, d = this._nodeListenersMap, e = 0, f = a.length; e < f; e++)
				if (b = d[a[e].__instanceId])
					for (var g = 0, h = b.length; g < h; g++)(c = b[g]) && this._setDirty(c._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY);
			this._dirtyNodes.length = 0
		}
	},
	_removeAllListenersInVector: function(a) {
		if (a)
			for (var b, c = 0; c < a.length;) b = a[c], b._setRegistered(!1), null != b._getSceneGraphPriority() && (this._dissociateNodeAndEventListener(b._getSceneGraphPriority(), b), b._setSceneGraphPriority(null)), 0 === this._inDispatch ? cc.arrayRemoveObject(a, b) : ++c
	},
	_removeListenersForListenerID: function(a) {
		var b = this._listenersMap[a];
		if (b) {
			var c = b.getFixedPriorityListeners(),
				d = b.getSceneGraphPriorityListeners();
			this._removeAllListenersInVector(d);
			this._removeAllListenersInVector(c);
			delete this._priorityDirtyFlagMap[a];
			this._inDispatch || (b.clear(), delete this._listenersMap[a])
		}
		c = this._toAddedListeners;
		for (b = 0; b < c.length;)(d = c[b]) && d._getListenerID() == a ? cc.arrayRemoveObject(c, d) : ++b
	},
	_sortEventListeners: function(a) {
		var b = this.DIRTY_NONE,
			c = this._priorityDirtyFlagMap;
		c[a] && (b = c[a]);
		b != this.DIRTY_NONE && (c[a] = this.DIRTY_NONE, b & this.DIRTY_FIXED_PRIORITY && this._sortListenersOfFixedPriority(a), b & this.DIRTY_SCENE_GRAPH_PRIORITY && ((b = cc.director.getRunningScene()) ? this._sortListenersOfSceneGraphPriority(a, b) : c[a] = this.DIRTY_SCENE_GRAPH_PRIORITY))
	},
	_sortListenersOfSceneGraphPriority: function(a, b) {
		var c = this._getListeners(a);
		if (c) {
			var d = c.getSceneGraphPriorityListeners();
			d && 0 !== d.length && (this._nodePriorityIndex = 0, this._nodePriorityMap = {}, this._visitTarget(b, !0), c.getSceneGraphPriorityListeners().sort(this._sortEventListenersOfSceneGraphPriorityDes))
		}
	},
	_sortEventListenersOfSceneGraphPriorityDes: function(a, b) {
		var c = cc.eventManager._nodePriorityMap;
		return a && b && a._getSceneGraphPriority() && b._getSceneGraphPriority() ? c[b._getSceneGraphPriority().__instanceId] - c[a._getSceneGraphPriority().__instanceId] : -1
	},
	_sortListenersOfFixedPriority: function(a) {
		if (a = this._listenersMap[a]) {
			var b = a.getFixedPriorityListeners();
			if (b && 0 !== b.length) {
				b.sort(this._sortListenersOfFixedPriorityAsc);
				for (var c = 0, d = b.length; c < d && !(0 <= b[c]._getFixedPriority());) ++c;
				a.gt0Index = c
			}
		}
	},
	_sortListenersOfFixedPriorityAsc: function(a, b) {
		return a._getFixedPriority() - b._getFixedPriority()
	},
	_onUpdateListeners: function(a) {
		if (a = this._listenersMap[a]) {
			var b = a.getFixedPriorityListeners(),
				c = a.getSceneGraphPriorityListeners(),
				d, e;
			if (c)
				for (d = 0; d < c.length;) e = c[d], e._isRegistered() ? ++d : cc.arrayRemoveObject(c, e);
			if (b)
				for (d = 0; d < b.length;) e = b[d], e._isRegistered() ? ++d : cc.arrayRemoveObject(b, e);
			c && 0 === c.length && a.clearSceneGraphListeners();
			b && 0 === b.length && a.clearFixedListeners()
		}
	},
	_updateListeners: function(a) {
		var b = this._inDispatch;
		cc.assert(0 < b, cc._LogInfos.EventManager__updateListeners);
		a.getType() == cc.Event.TOUCH ? (this._onUpdateListeners(cc._EventListenerTouchOneByOne.LISTENER_ID), this._onUpdateListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID)) : this._onUpdateListeners(cc.__getListenerID(a));
		if (!(1 < b)) {
			cc.assert(1 == b, cc._LogInfos.EventManager__updateListeners_2);
			a = this._listenersMap;
			var b = this._priorityDirtyFlagMap,
				c;
			for (c in a) a[c].empty() && (delete b[c], delete a[c]);
			c = this._toAddedListeners;
			if (0 !== c.length) {
				a = 0;
				for (b = c.length; a < b; a++) this._forceAddEventListener(c[a]);
				this._toAddedListeners.length = 0
			}
		}
	},
	_onTouchEventCallback: function(a, b) {
		if (!a._isRegistered) return !1;
		var c = b.event,
			d = b.selTouch;
		c._setCurrentTarget(a._node);
		var e = !1,
			f, g = c.getEventCode(),
			h = cc.EventTouch.EventCode;
		if (g == h.BEGAN) a.onTouchBegan && (e = a.onTouchBegan(d, c)) && a._registered && a._claimedTouches.push(d);
		else if (0 < a._claimedTouches.length && -1 != (f = a._claimedTouches.indexOf(d)))
			if (e = !0, g === h.MOVED && a.onTouchMoved) a.onTouchMoved(d, c);
			else if (g === h.ENDED) {
			if (a.onTouchEnded) a.onTouchEnded(d, c);
			a._registered && a._claimedTouches.splice(f, 1)
		} else if (g === h.CANCELLED) {
			if (a.onTouchCancelled) a.onTouchCancelled(d, c);
			a._registered && a._claimedTouches.splice(f, 1)
		}
		return c.isStopped() ? (cc.eventManager._updateListeners(c), !0) : e && a._registered && a.swallowTouches ? (b.needsMutableSet && b.touches.splice(d, 1), !0) : !1
	},
	_dispatchTouchEvent: function(a) {
		this._sortEventListeners(cc._EventListenerTouchOneByOne.LISTENER_ID);
		this._sortEventListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
		var b = this._getListeners(cc._EventListenerTouchOneByOne.LISTENER_ID),
			c = this._getListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
		if (null != b || null != c) {
			var d = a.getTouches(),
				e = cc.copyArray(d),
				f = {
					event: a,
					needsMutableSet: b && c,
					touches: e,
					selTouch: null
				};
			if (b)
				for (var g = 0; g < d.length; g++)
					if (f.selTouch = d[g], this._dispatchEventToListeners(b, this._onTouchEventCallback, f), a.isStopped()) return;
			if (c && 0 < e.length && (this._dispatchEventToListeners(c, this._onTouchesEventCallback, {
					event: a,
					touches: e
				}), a.isStopped())) return;
			this._updateListeners(a)
		}
	},
	_onTouchesEventCallback: function(a, b) {
		if (!a._registered) return !1;
		var c = cc.EventTouch.EventCode,
			d = b.event,
			e = b.touches,
			f = d.getEventCode();
		d._setCurrentTarget(a._node);
		if (f == c.BEGAN && a.onTouchesBegan) a.onTouchesBegan(e, d);
		else if (f == c.MOVED && a.onTouchesMoved) a.onTouchesMoved(e, d);
		else if (f == c.ENDED && a.onTouchesEnded) a.onTouchesEnded(e, d);
		else if (f == c.CANCELLED && a.onTouchesCancelled) a.onTouchesCancelled(e, d);
		return d.isStopped() ? (cc.eventManager._updateListeners(d), !0) : !1
	},
	_associateNodeAndEventListener: function(a, b) {
		var c = this._nodeListenersMap[a.__instanceId];
		c || (c = [], this._nodeListenersMap[a.__instanceId] = c);
		c.push(b)
	},
	_dissociateNodeAndEventListener: function(a, b) {
		var c = this._nodeListenersMap[a.__instanceId];
		c && (cc.arrayRemoveObject(c, b), 0 === c.length && delete this._nodeListenersMap[a.__instanceId])
	},
	_dispatchEventToListeners: function(a, b, c) {
		var d = !1,
			e = a.getFixedPriorityListeners(),
			f = a.getSceneGraphPriorityListeners(),
			g = 0,
			h;
		if (e && 0 !== e.length)
			for (; g < a.gt0Index; ++g)
				if (h = e[g], h.isEnabled() && !h._isPaused() && h._isRegistered() && b(h, c)) {
					d = !0;
					break
				}
		if (f && !d)
			for (a = 0; a < f.length; a++)
				if (h = f[a], h.isEnabled() && !h._isPaused() && h._isRegistered() && b(h, c)) {
					d = !0;
					break
				}
		if (e && !d)
			for (; g < e.length && (h = e[g], !h.isEnabled() || h._isPaused() || !h._isRegistered() || !b(h, c)); ++g);
	},
	_setDirty: function(a, b) {
		var c = this._priorityDirtyFlagMap;
		c[a] = null == c[a] ? b : b | c[a]
	},
	_visitTarget: function(a, b) {
		var c = a.getChildren(),
			d = 0,
			e = c.length,
			f = this._globalZOrderNodeMap,
			g = this._nodeListenersMap;
		if (0 < e) {
			for (var h; d < e; d++)
				if ((h = c[d]) && 0 > h.getLocalZOrder()) this._visitTarget(h, !1);
				else break;
			null != g[a.__instanceId] && (f[a.getGlobalZOrder()] || (f[a.getGlobalZOrder()] = []), f[a.getGlobalZOrder()].push(a.__instanceId));
			for (; d < e; d++)(h = c[d]) && this._visitTarget(h, !1)
		} else null != g[a.__instanceId] && (f[a.getGlobalZOrder()] || (f[a.getGlobalZOrder()] = []), f[a.getGlobalZOrder()].push(a.__instanceId));
		if (b) {
			var c = [],
				k;
			for (k in f) c.push(k);
			c.sort(this._sortNumberAsc);
			k = c.length;
			h = this._nodePriorityMap;
			for (d = 0; d < k; d++)
				for (e = f[c[d]], g = 0; g < e.length; g++) h[e[g]] = ++this._nodePriorityIndex;
			this._globalZOrderNodeMap = {}
		}
	},
	_sortNumberAsc: function(a, b) {
		return a - b
	},
	addListener: function(a, b) {
		cc.assert(a && b, cc._LogInfos.eventManager_addListener_2);
		if (!(a instanceof cc.EventListener)) cc.assert(!cc.isNumber(b), cc._LogInfos.eventManager_addListener_3), a = cc.EventListener.create(a);
		else if (a._isRegistered()) {
			cc.log(cc._LogInfos.eventManager_addListener_4);
			return
		}
		a.checkAvailable() && (cc.isNumber(b) ? 0 == b ? cc.log(cc._LogInfos.eventManager_addListener) : (a._setSceneGraphPriority(null), a._setFixedPriority(b), a._setRegistered(!0), a._setPaused(!1), this._addListener(a)) : (a._setSceneGraphPriority(b), a._setFixedPriority(0), a._setRegistered(!0), this._addListener(a)))
	},
	addCustomListener: function(a, b) {
		var c = cc._EventListenerCustom.create(a, b);
		this.addListener(c, 1);
		return c
	},
	removeListener: function(a) {
		if (null != a) {
			var b, c = this._listenersMap,
				d;
			for (d in c) {
				var e = c[d],
					f = e.getFixedPriorityListeners();
				b = e.getSceneGraphPriorityListeners();
				(b = this._removeListenerInVector(b, a)) ? this._setDirty(a._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY): (b = this._removeListenerInVector(f, a)) && this._setDirty(a._getListenerID(), this.DIRTY_FIXED_PRIORITY);
				e.empty() && (delete this._priorityDirtyFlagMap[a._getListenerID()], delete c[d]);
				if (b) break
			}
			if (!b)
				for (c = this._toAddedListeners, d = 0, e = c.length; d < e; d++)
					if (f = c[d], f == a) {
						cc.arrayRemoveObject(c, f);
						break
					}
		}
	},
	_removeListenerInVector: function(a, b) {
		if (null == a) return !1;
		for (var c = 0, d = a.length; c < d; c++) {
			var e = a[c];
			if (e == b) return e._setRegistered(!1), null != e._getSceneGraphPriority() && (this._dissociateNodeAndEventListener(e._getSceneGraphPriority(), e), e._setSceneGraphPriority(null)), 0 == this._inDispatch && cc.arrayRemoveObject(a, e), !0
		}
		return !1
	},
	removeListeners: function(a, b) {
		if (a instanceof cc.Node) {
			delete this._nodePriorityMap[a.__instanceId];
			cc.arrayRemoveObject(this._dirtyNodes, a);
			var c = this._nodeListenersMap[a.__instanceId];
			if (c) {
				for (var d = cc.copyArray(c), c = 0; c < d.length; c++) this.removeListener(d[c]);
				d.length = 0
			}
			d = this._toAddedListeners;
			for (c = 0; c < d.length;) {
				var e = d[c];
				e._getSceneGraphPriority() == a ? (e._setSceneGraphPriority(null), e._setRegistered(!1), d.splice(c, 1)) : ++c
			}
			if (!0 === b)
				for (d = a.getChildren(), c = 0, e = d.length; c < e; c++) this.removeListeners(d[c], !0)
		} else a == cc.EventListener.TOUCH_ONE_BY_ONE ? this._removeListenersForListenerID(cc._EventListenerTouchOneByOne.LISTENER_ID) : a == cc.EventListener.TOUCH_ALL_AT_ONCE ? this._removeListenersForListenerID(cc._EventListenerTouchAllAtOnce.LISTENER_ID) : a == cc.EventListener.MOUSE ? this._removeListenersForListenerID(cc._EventListenerMouse.LISTENER_ID) : a == cc.EventListener.ACCELERATION ? this._removeListenersForListenerID(cc._EventListenerAcceleration.LISTENER_ID) : a == cc.EventListener.KEYBOARD ? this._removeListenersForListenerID(cc._EventListenerKeyboard.LISTENER_ID) : cc.log(cc._LogInfos.eventManager_removeListeners)
	},
	removeCustomListeners: function(a) {
		this._removeListenersForListenerID(a)
	},
	removeAllListeners: function() {
		var a = this._listenersMap,
			b = this._internalCustomListenerIDs,
			c;
		for (c in a) - 1 === b.indexOf(c) && this._removeListenersForListenerID(c)
	},
	setPriority: function(a, b) {
		if (null != a) {
			var c = this._listenersMap,
				d;
			for (d in c) {
				var e = c[d].getFixedPriorityListeners();
				if (e && -1 != e.indexOf(a)) {
					null != a._getSceneGraphPriority() && cc.log(cc._LogInfos.eventManager_setPriority);
					a._getFixedPriority() !== b && (a._setFixedPriority(b), this._setDirty(a._getListenerID(), this.DIRTY_FIXED_PRIORITY));
					break
				}
			}
		}
	},
	setEnabled: function(a) {
		this._isEnabled = a
	},
	isEnabled: function() {
		return this._isEnabled
	},
	dispatchEvent: function(a) {
		if (this._isEnabled) {
			this._updateDirtyFlagForSceneGraph();
			this._inDispatch++;
			if (!a || !a.getType) throw "event is undefined";
			if (a.getType() == cc.Event.TOUCH) this._dispatchTouchEvent(a);
			else {
				var b = cc.__getListenerID(a);
				this._sortEventListeners(b);
				b = this._listenersMap[b];
				null != b && this._dispatchEventToListeners(b, this._onListenerCallback, a);
				this._updateListeners(a)
			}
			this._inDispatch--
		}
	},
	_onListenerCallback: function(a, b) {
		b._setCurrentTarget(a._getSceneGraphPriority());
		a._onEvent(b);
		return b.isStopped()
	},
	dispatchCustomEvent: function(a, b) {
		var c = new cc.EventCustom(a);
		c.setUserData(b);
		this.dispatchEvent(c)
	}
};
cc.EventAcceleration = cc.Event.extend({
	_acc: null,
	ctor: function(a) {
		cc.Event.prototype.ctor.call(this, cc.Event.ACCELERATION);
		this._acc = a
	}
});
cc.EventKeyboard = cc.Event.extend({
	_keyCode: 0,
	_isPressed: !1,
	ctor: function(a, b) {
		cc.Event.prototype.ctor.call(this, cc.Event.KEYBOARD);
		this._keyCode = a;
		this._isPressed = b
	}
});
cc._EventListenerAcceleration = cc.EventListener.extend({
	_onAccelerationEvent: null,
	ctor: function(a) {
		this._onAccelerationEvent = a;
		var b = this;
		cc.EventListener.prototype.ctor.call(this, cc.EventListener.ACCELERATION, cc._EventListenerAcceleration.LISTENER_ID, function(a) {
			b._onAccelerationEvent(a._acc, a)
		})
	},
	checkAvailable: function() {
		cc.assert(this._onAccelerationEvent, cc._LogInfos._EventListenerAcceleration_checkAvailable);
		return !0
	},
	clone: function() {
		return new cc._EventListenerAcceleration(this._onAccelerationEvent)
	}
});
cc._EventListenerAcceleration.LISTENER_ID = "__cc_acceleration";
cc._EventListenerAcceleration.create = function(a) {
	return new cc._EventListenerAcceleration(a)
};
cc._EventListenerKeyboard = cc.EventListener.extend({
	onKeyPressed: null,
	onKeyReleased: null,
	ctor: function() {
		var a = this;
		cc.EventListener.prototype.ctor.call(this, cc.EventListener.KEYBOARD, cc._EventListenerKeyboard.LISTENER_ID, function(b) {
			if (b._isPressed) {
				if (a.onKeyPressed) a.onKeyPressed(b._keyCode, b)
			} else if (a.onKeyReleased) a.onKeyReleased(b._keyCode, b)
		})
	},
	clone: function() {
		var a = new cc._EventListenerKeyboard;
		a.onKeyPressed = this.onKeyPressed;
		a.onKeyReleased = this.onKeyReleased;
		return a
	},
	checkAvailable: function() {
		return null == this.onKeyPressed && null == this.onKeyReleased ? (cc.log(cc._LogInfos._EventListenerKeyboard_checkAvailable), !1) : !0
	}
});
cc._EventListenerKeyboard.LISTENER_ID = "__cc_keyboard";
cc._EventListenerKeyboard.create = function() {
	return new cc._EventListenerKeyboard
};
cc._tmp.WebGLCCNode = function() {
	var a = cc.Node.prototype;
	a._transform4x4 = null;
	a._stackMatrix = null;
	a._glServerState = null;
	a._camera = null;
	a.ctor = function() {
		this._initNode();
		var a = new cc.kmMat4;
		a.mat[2] = a.mat[3] = a.mat[6] = a.mat[7] = a.mat[8] = a.mat[9] = a.mat[11] = a.mat[14] = 0;
		a.mat[10] = a.mat[15] = 1;
		this._transform4x4 = a;
		this._glServerState = 0;
		this._stackMatrix = new cc.kmMat4
	};
	a.setNodeDirty = function() {
		!1 === this._transformDirty && (this._transformDirty = this._inverseDirty = !0)
	};
	a.visit = function() {
		if (this._visible) {
			var a = cc._renderContext,
				c, d = cc.current_stack;
			d.stack.push(d.top);
			cc.kmMat4Assign(this._stackMatrix, d.top);
			d.top = this._stackMatrix;
			var e = this.grid;
			e && e._active && e.beforeDraw();
			this.transform();
			var f = this._children;
			if (f && 0 < f.length) {
				var g = f.length;
				this.sortAllChildren();
				for (c = 0; c < g; c++)
					if (f[c] && 0 > f[c]._localZOrder) f[c].visit();
					else break;
				for (this.draw(a); c < g; c++) f[c] && f[c].visit()
			} else this.draw(a);
			this.arrivalOrder = 0;
			e && e._active && e.afterDraw(this);
			d.top = d.stack.pop()
		}
	};
	a.transform = function() {
		var a = this._transform4x4,
			c = cc.current_stack.top,
			d = this.nodeToParentTransform(),
			e = a.mat;
		e[0] = d.a;
		e[4] = d.c;
		e[12] = d.tx;
		e[1] = d.b;
		e[5] = d.d;
		e[13] = d.ty;
		e[14] = this._vertexZ;
		cc.kmMat4Multiply(c, c, a);
		null == this._camera || null != this.grid && this.grid.isActive() || (a = this._anchorPointInPoints.x, c = this._anchorPointInPoints.y, 0 !== a || 0 !== c ? (cc.SPRITEBATCHNODE_RENDER_SUBPIXEL || (a |= 0, c |= 0), cc.kmGLTranslatef(a, c, 0), this._camera.locate(), cc.kmGLTranslatef(-a, -c, 0)) : this._camera.locate())
	};
	a.getNodeToParentTransform = a._getNodeToParentTransformForWebGL
};
cc._tmp.PrototypeCCNode = function() {
	var a = cc.Node.prototype;
	cc.defineGetterSetter(a, "x", a.getPositionX, a.setPositionX);
	cc.defineGetterSetter(a, "y", a.getPositionY, a.setPositionY);
	cc.defineGetterSetter(a, "width", a._getWidth, a._setWidth);
	cc.defineGetterSetter(a, "height", a._getHeight, a._setHeight);
	cc.defineGetterSetter(a, "anchorX", a._getAnchorX, a._setAnchorX);
	cc.defineGetterSetter(a, "anchorY", a._getAnchorY, a._setAnchorY);
	cc.defineGetterSetter(a, "skewX", a.getSkewX, a.setSkewX);
	cc.defineGetterSetter(a, "skewY", a.getSkewY, a.setSkewY);
	cc.defineGetterSetter(a, "zIndex", a.getLocalZOrder, a.setLocalZOrder);
	cc.defineGetterSetter(a, "vertexZ", a.getVertexZ, a.setVertexZ);
	cc.defineGetterSetter(a, "rotation", a.getRotation, a.setRotation);
	cc.defineGetterSetter(a, "rotationX", a.getRotationX, a.setRotationX);
	cc.defineGetterSetter(a, "rotationY", a.getRotationY, a.setRotationY);
	cc.defineGetterSetter(a, "scale", a.getScale, a.setScale);
	cc.defineGetterSetter(a, "scaleX", a.getScaleX, a.setScaleX);
	cc.defineGetterSetter(a, "scaleY", a.getScaleY, a.setScaleY);
	cc.defineGetterSetter(a, "children", a.getChildren);
	cc.defineGetterSetter(a, "childrenCount", a.getChildrenCount);
	cc.defineGetterSetter(a, "parent", a.getParent, a.setParent);
	cc.defineGetterSetter(a, "visible", a.isVisible, a.setVisible);
	cc.defineGetterSetter(a, "running", a.isRunning);
	cc.defineGetterSetter(a, "ignoreAnchor", a.isIgnoreAnchorPointForPosition, a.ignoreAnchorPointForPosition);
	cc.defineGetterSetter(a, "actionManager", a.getActionManager, a.setActionManager);
	cc.defineGetterSetter(a, "scheduler", a.getScheduler, a.setScheduler);
	cc.defineGetterSetter(a, "shaderProgram", a.getShaderProgram, a.setShaderProgram);
	cc.defineGetterSetter(a, "opacity", a.getOpacity, a.setOpacity);
	cc.defineGetterSetter(a, "opacityModifyRGB", a.isOpacityModifyRGB);
	cc.defineGetterSetter(a, "cascadeOpacity", a.isCascadeOpacityEnabled, a.setCascadeOpacityEnabled);
	cc.defineGetterSetter(a, "color", a.getColor, a.setColor);
	cc.defineGetterSetter(a, "cascadeColor", a.isCascadeColorEnabled, a.setCascadeColorEnabled)
};
cc.NODE_TAG_INVALID = -1;
cc.s_globalOrderOfArrival = 1;
cc.Node = cc.Class.extend({
	_localZOrder: 0,
	_globalZOrder: 0,
	_vertexZ: 0,
	_rotationX: 0,
	_rotationY: 0,
	_scaleX: 1,
	_scaleY: 1,
	_position: null,
	_skewX: 0,
	_skewY: 0,
	_children: null,
	_visible: !0,
	_anchorPoint: null,
	_anchorPointInPoints: null,
	_contentSize: null,
	_running: !1,
	_parent: null,
	_ignoreAnchorPointForPosition: !1,
	tag: cc.NODE_TAG_INVALID,
	userData: null,
	userObject: null,
	_transformDirty: !0,
	_inverseDirty: !0,
	_cacheDirty: !0,
	_cachedParent: null,
	_transformGLDirty: null,
	_transform: null,
	_inverse: null,
	_reorderChildDirty: !1,
	_shaderProgram: null,
	arrivalOrder: 0,
	_actionManager: null,
	_scheduler: null,
	_eventDispatcher: null,
	_initializedNode: !1,
	_additionalTransformDirty: !1,
	_additionalTransform: null,
	_componentContainer: null,
	_isTransitionFinished: !1,
	_rotationRadiansX: 0,
	_rotationRadiansY: 0,
	_className: "Node",
	_showNode: !1,
	_name: "",
	_displayedOpacity: 255,
	_realOpacity: 255,
	_displayedColor: null,
	_realColor: null,
	_cascadeColorEnabled: !1,
	_cascadeOpacityEnabled: !1,
	_usingNormalizedPosition: !1,
	_hashOfName: 0,
	_initNode: function() {
		this._anchorPoint = cc.p(0, 0);
		this._anchorPointInPoints = cc.p(0, 0);
		this._contentSize = cc.size(0, 0);
		this._position = cc.p(0, 0);
		this._children = [];
		this._transform = {
			a: 1,
			b: 0,
			c: 0,
			d: 1,
			tx: 0,
			ty: 0
		};
		var a = cc.director;
		this._actionManager = a.getActionManager();
		this._scheduler = a.getScheduler();
		this._initializedNode = !0;
		this._additionalTransform = cc.affineTransformMakeIdentity();
		cc.ComponentContainer && (this._componentContainer = new cc.ComponentContainer(this));
		this._realOpacity = this._displayedOpacity = 255;
		this._displayedColor = cc.color(255, 255, 255, 255);
		this._realColor = cc.color(255, 255, 255, 255);
		this._cascadeOpacityEnabled = this._cascadeColorEnabled = !1
	},
	init: function() {
		!1 === this._initializedNode && this._initNode();
		return !0
	},
	_arrayMakeObjectsPerformSelector: function(a, b) {
		if (a && 0 !== a.length) {
			var c, d = a.length,
				e;
			c = cc.Node._StateCallbackType;
			switch (b) {
				case c.onEnter:
					for (c = 0; c < d; c++)
						if (e = a[c]) e.onEnter();
					break;
				case c.onExit:
					for (c = 0; c < d; c++)
						if (e = a[c]) e.onExit();
					break;
				case c.onEnterTransitionDidFinish:
					for (c = 0; c < d; c++)
						if (e = a[c]) e.onEnterTransitionDidFinish();
					break;
				case c.cleanup:
					for (c = 0; c < d; c++)(e = a[c]) && e.cleanup();
					break;
				case c.updateTransform:
					for (c = 0; c < d; c++)(e = a[c]) && e.updateTransform();
					break;
				case c.onExitTransitionDidStart:
					for (c = 0; c < d; c++)
						if (e = a[c]) e.onExitTransitionDidStart();
					break;
				case c.sortAllChildren:
					for (c = 0; c < d; c++)(e = a[c]) && e.sortAllChildren();
					break;
				default:
					cc.assert(0, cc._LogInfos.Node__arrayMakeObjectsPerformSelector)
			}
		}
	},
	setNodeDirty: null,
	attr: function(a) {
		for (var b in a) this[b] = a[b]
	},
	getSkewX: function() {
		return this._skewX
	},
	setSkewX: function(a) {
		this._skewX = a;
		this.setNodeDirty()
	},
	getSkewY: function() {
		return this._skewY
	},
	setSkewY: function(a) {
		this._skewY = a;
		this.setNodeDirty()
	},
	setLocalZOrder: function(a) {
		this._localZOrder = a;
		this._parent && this._parent.reorderChild(this, a);
		cc.eventManager._setDirtyForNode(this)
	},
	_setLocalZOrder: function(a) {
		this._localZOrder = a
	},
	getLocalZOrder: function() {
		return this._localZOrder
	},
	getZOrder: function() {
		cc.log(cc._LogInfos.Node_getZOrder);
		return this.getLocalZOrder()
	},
	setZOrder: function(a) {
		cc.log(cc._LogInfos.Node_setZOrder);
		this.setLocalZOrder(a)
	},
	setGlobalZOrder: function(a) {
		this._globalZOrder != a && (this._globalZOrder = a, cc.eventManager._setDirtyForNode(this))
	},
	getGlobalZOrder: function() {
		return this._globalZOrder
	},
	getVertexZ: function() {
		return this._vertexZ
	},
	setVertexZ: function(a) {
		this._vertexZ = a
	},
	getRotation: function() {
		this._rotationX !== this._rotationY && cc.log(cc._LogInfos.Node_getRotation);
		return this._rotationX
	},
	setRotation: function(a) {
		this._rotationX = this._rotationY = a;
		this._rotationRadiansX = 0.017453292519943295 * this._rotationX;
		this._rotationRadiansY = 0.017453292519943295 * this._rotationY;
		this.setNodeDirty()
	},
	getRotationX: function() {
		return this._rotationX
	},
	setRotationX: function(a) {
		this._rotationX = a;
		this._rotationRadiansX = 0.017453292519943295 * this._rotationX;
		this.setNodeDirty()
	},
	getRotationY: function() {
		return this._rotationY
	},
	setRotationY: function(a) {
		this._rotationY = a;
		this._rotationRadiansY = 0.017453292519943295 * this._rotationY;
		this.setNodeDirty()
	},
	getScale: function() {
		this._scaleX !== this._scaleY && cc.log(cc._LogInfos.Node_getScale);
		return this._scaleX
	},
	setScale: function(a, b) {
		this._scaleX = a;
		this._scaleY = b || 0 === b ? b : a;
		this.setNodeDirty()
	},
	getScaleX: function() {
		return this._scaleX
	},
	setScaleX: function(a) {
		this._scaleX = a;
		this.setNodeDirty()
	},
	getScaleY: function() {
		return this._scaleY
	},
	setScaleY: function(a) {
		this._scaleY = a;
		this.setNodeDirty()
	},
	setPosition: function(a, b) {
		var c = this._position;
		void 0 === b ? (c.x = a.x, c.y = a.y) : (c.x = a, c.y = b);
		this.setNodeDirty()
	},
	getPosition: function() {
		return cc.p(this._position)
	},
	getPositionX: function() {
		return this._position.x
	},
	setPositionX: function(a) {
		this._position.x = a;
		this.setNodeDirty()
	},
	getPositionY: function() {
		return this._position.y
	},
	setPositionY: function(a) {
		this._position.y = a;
		this.setNodeDirty()
	},
	getChildrenCount: function() {
		return this._children.length
	},
	getChildren: function() {
		return this._children
	},
	isVisible: function() {
		return this._visible
	},
	setVisible: function(a) {
		this._visible != a && (this._visible = a) && this.setNodeDirty()
	},
	getAnchorPoint: function() {
		return cc.p(this._anchorPoint)
	},
	setAnchorPoint: function(a, b) {
		var c = this._anchorPoint;
		if (void 0 === b) {
			if (a.x === c.x && a.y === c.y) return;
			c.x = a.x;
			c.y = a.y
		} else {
			if (a === c.x && b === c.y) return;
			c.x = a;
			c.y = b
		}
		var d = this._anchorPointInPoints,
			e = this._contentSize;
		d.x = e.width * c.x;
		d.y = e.height * c.y;
		this.setNodeDirty()
	},
	_getAnchor: function() {
		return this._anchorPoint
	},
	_setAnchor: function(a) {
		var b = a.x;
		a = a.y;
		this._anchorPoint.x !== b && (this._anchorPoint.x = b, this._anchorPointInPoints.x = this._contentSize.width * b);
		this._anchorPoint.y !== a && (this._anchorPoint.y = a, this._anchorPointInPoints.y = this._contentSize.height * a);
		this.setNodeDirty()
	},
	_getAnchorX: function() {
		return this._anchorPoint.x
	},
	_setAnchorX: function(a) {
		this._anchorPoint.x !== a && (this._anchorPoint.x = a, this._anchorPointInPoints.x = this._contentSize.width * a, this.setNodeDirty())
	},
	_getAnchorY: function() {
		return this._anchorPoint.y
	},
	_setAnchorY: function(a) {
		this._anchorPoint.y !== a && (this._anchorPoint.y = a, this._anchorPointInPoints.y = this._contentSize.height * a, this.setNodeDirty())
	},
	getAnchorPointInPoints: function() {
		return cc.p(this._anchorPointInPoints)
	},
	_getWidth: function() {
		return this._contentSize.width
	},
	_setWidth: function(a) {
		this._contentSize.width = a;
		this._anchorPointInPoints.x = a * this._anchorPoint.x;
		this.setNodeDirty()
	},
	_getHeight: function() {
		return this._contentSize.height
	},
	_setHeight: function(a) {
		this._contentSize.height = a;
		this._anchorPointInPoints.y = a * this._anchorPoint.y;
		this.setNodeDirty()
	},
	getContentSize: function() {
		return cc.size(this._contentSize)
	},
	setContentSize: function(a, b) {
		var c = this._contentSize;
		if (void 0 === b) {
			if (a.width === c.width && a.height === c.height) return;
			c.width = a.width;
			c.height = a.height
		} else {
			if (a === c.width && b === c.height) return;
			c.width = a;
			c.height = b
		}
		var d = this._anchorPointInPoints,
			e = this._anchorPoint;
		d.x = c.width * e.x;
		d.y = c.height * e.y;
		this.setNodeDirty()
	},
	isRunning: function() {
		return this._running
	},
	getParent: function() {
		return this._parent
	},
	setParent: function(a) {
		this._parent = a
	},
	isIgnoreAnchorPointForPosition: function() {
		return this._ignoreAnchorPointForPosition
	},
	ignoreAnchorPointForPosition: function(a) {
		a != this._ignoreAnchorPointForPosition && (this._ignoreAnchorPointForPosition = a, this.setNodeDirty())
	},
	getTag: function() {
		return this.tag
	},
	setTag: function(a) {
		this.tag = a
	},
	setName: function(a) {
		this._name = a
	},
	getName: function() {
		return this._name
	},
	getUserData: function() {
		return this.userData
	},
	setUserData: function(a) {
		this.userData = a
	},
	getUserObject: function() {
		return this.userObject
	},
	setUserObject: function(a) {
		this.userObject != a && (this.userObject = a)
	},
	getOrderOfArrival: function() {
		return this.arrivalOrder
	},
	setOrderOfArrival: function(a) {
		this.arrivalOrder = a
	},
	getActionManager: function() {
		this._actionManager || (this._actionManager = cc.director.getActionManager());
		return this._actionManager
	},
	setActionManager: function(a) {
		this._actionManager != a && (this.stopAllActions(), this._actionManager = a)
	},
	getScheduler: function() {
		this._scheduler || (this._scheduler = cc.director.getScheduler());
		return this._scheduler
	},
	setScheduler: function(a) {
		this._scheduler != a && (this.unscheduleAllCallbacks(), this._scheduler = a)
	},
	boundingBox: function() {
		cc.log(cc._LogInfos.Node_boundingBox);
		return this.getBoundingBox()
	},
	getBoundingBox: function() {
		var a = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
		return cc._rectApplyAffineTransformIn(a, this.getNodeToParentTransform())
	},
	cleanup: function() {
		this.stopAllActions();
		this.unscheduleAllCallbacks();
		cc.eventManager.removeListeners(this);
		this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.cleanup)
	},
	getChildByTag: function(a) {
		var b = this._children;
		if (null != b)
			for (var c = 0; c < b.length; c++) {
				var d = b[c];
				if (d && d.tag == a) return d
			}
		return null
	},
	getChildByName: function(a) {
		if (!a) return cc.log("Invalid name"), null;
		for (var b = this._children, c = 0, d = b.length; c < d; c++)
			if (b[c]._name == a) return b[c];
		return null
	},
	addChild: function(a, b, c) {
		b = void 0 === b ? a._localZOrder : b;
		var d, e = !1;
		cc.isUndefined(c) ? (c = void 0, d = a._name) : cc.isString(c) ? (d = c, c = void 0) : cc.isNumber(c) && (e = !0, d = "");
		cc.assert(a, cc._LogInfos.Node_addChild_3);
		cc.assert(null === a._parent, "child already added. It can't be added again");
		this._addChildHelper(a, b, c, d, e)
	},
	_addChildHelper: function(a, b, c, d, e) {
		this._children || (this._children = []);
		this._insertChild(a, b);
		e ? a.setTag(c) : a.setName(d);
		a.setParent(this);
		a.setOrderOfArrival(cc.s_globalOrderOfArrival++);
		if (this._running && (a.onEnter(), this._isTransitionFinished)) a.onEnterTransitionDidFinish();
		this._cascadeColorEnabled && this._enableCascadeColor();
		this._cascadeOpacityEnabled && this._enableCascadeOpacity()
	},
	removeFromParent: function(a) {
		this._parent && (null == a && (a = !0), this._parent.removeChild(this, a))
	},
	removeFromParentAndCleanup: function(a) {
		cc.log(cc._LogInfos.Node_removeFromParentAndCleanup);
		this.removeFromParent(a)
	},
	removeChild: function(a, b) {
		0 !== this._children.length && (null == b && (b = !0), -1 < this._children.indexOf(a) && this._detachChild(a, b), this.setNodeDirty())
	},
	removeChildByTag: function(a, b) {
		a === cc.NODE_TAG_INVALID && cc.log(cc._LogInfos.Node_removeChildByTag);
		var c = this.getChildByTag(a);
		null == c ? cc.log(cc._LogInfos.Node_removeChildByTag_2, a) : this.removeChild(c, b)
	},
	removeAllChildrenWithCleanup: function(a) {
		this.removeAllChildren(a)
	},
	removeAllChildren: function(a) {
		var b = this._children;
		if (null != b) {
			null == a && (a = !0);
			for (var c = 0; c < b.length; c++) {
				var d = b[c];
				d && (this._running && (d.onExitTransitionDidStart(), d.onExit()), a && d.cleanup(), d.parent = null)
			}
			this._children.length = 0
		}
	},
	_detachChild: function(a, b) {
		this._running && (a.onExitTransitionDidStart(), a.onExit());
		b && a.cleanup();
		a.parent = null;
		cc.arrayRemoveObject(this._children, a)
	},
	_insertChild: function(a, b) {
		this._reorderChildDirty = !0;
		this._children.push(a);
		a._setLocalZOrder(b)
	},
	reorderChild: function(a, b) {
		cc.assert(a, cc._LogInfos.Node_reorderChild);
		this._reorderChildDirty = !0;
		a.arrivalOrder = cc.s_globalOrderOfArrival;
		cc.s_globalOrderOfArrival++;
		a._setLocalZOrder(b);
		this.setNodeDirty()
	},
	sortAllChildren: function() {
		if (this._reorderChildDirty) {
			var a = this._children,
				b = a.length,
				c, d, e;
			for (c = 1; c < b; c++) {
				e = a[c];
				for (d = c - 1; 0 <= d;) {
					if (e._localZOrder < a[d]._localZOrder) a[d + 1] = a[d];
					else if (e._localZOrder === a[d]._localZOrder && e.arrivalOrder < a[d].arrivalOrder) a[d + 1] = a[d];
					else break;
					d--
				}
				a[d + 1] = e
			}
			this._reorderChildDirty = !1
		}
	},
	draw: function(a) {},
	transformAncestors: function() {
		null != this._parent && (this._parent.transformAncestors(), this._parent.transform())
	},
	onEnter: function() {
		this._isTransitionFinished = !1;
		this._running = !0;
		this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.onEnter);
		this.resume()
	},
	onEnterTransitionDidFinish: function() {
		this._isTransitionFinished = !0;
		this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.onEnterTransitionDidFinish)
	},
	onExitTransitionDidStart: function() {
		this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.onExitTransitionDidStart)
	},
	onExit: function() {
		this._running = !1;
		this.pause();
		this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.onExit);
		this.removeAllComponents()
	},
	runAction: function(a) {
		cc.assert(a, cc._LogInfos.Node_runAction);
		this.actionManager.addAction(a, this, !this._running);
		return a
	},
	stopAllActions: function() {
		this.actionManager && this.actionManager.removeAllActionsFromTarget(this)
	},
	stopAction: function(a) {
		this.actionManager.removeAction(a)
	},
	stopActionByTag: function(a) {
		a === cc.ACTION_TAG_INVALID ? cc.log(cc._LogInfos.Node_stopActionByTag) : this.actionManager.removeActionByTag(a, this)
	},
	getActionByTag: function(a) {
		return a === cc.ACTION_TAG_INVALID ? (cc.log(cc._LogInfos.Node_getActionByTag), null) : this.actionManager.getActionByTag(a, this)
	},
	getNumberOfRunningActions: function() {
		return this.actionManager.numberOfRunningActionsInTarget(this)
	},
	scheduleUpdate: function() {
		this.scheduleUpdateWithPriority(0)
	},
	scheduleUpdateWithPriority: function(a) {
		this.scheduler.scheduleUpdateForTarget(this, a, !this._running)
	},
	unscheduleUpdate: function() {
		this.scheduler.unscheduleUpdateForTarget(this)
	},
	schedule: function(a, b, c, d) {
		b = b || 0;
		cc.assert(a, cc._LogInfos.Node_schedule);
		cc.assert(0 <= b, cc._LogInfos.Node_schedule_2);
		c = null == c ? cc.REPEAT_FOREVER : c;
		this.scheduler.scheduleCallbackForTarget(this, a, b, c, d || 0, !this._running)
	},
	scheduleOnce: function(a, b) {
		this.schedule(a, 0, 0, b)
	},
	unschedule: function(a) {
		a && this.scheduler.unscheduleCallbackForTarget(this, a)
	},
	unscheduleAllCallbacks: function() {
		this.scheduler.unscheduleAllCallbacksForTarget(this)
	},
	resumeSchedulerAndActions: function() {
		cc.log(cc._LogInfos.Node_resumeSchedulerAndActions);
		this.resume()
	},
	resume: function() {
		this.scheduler.resumeTarget(this);
		this.actionManager && this.actionManager.resumeTarget(this);
		cc.eventManager.resumeTarget(this)
	},
	pauseSchedulerAndActions: function() {
		cc.log(cc._LogInfos.Node_pauseSchedulerAndActions);
		this.pause()
	},
	pause: function() {
		this.scheduler.pauseTarget(this);
		this.actionManager && this.actionManager.pauseTarget(this);
		cc.eventManager.pauseTarget(this)
	},
	setAdditionalTransform: function(a) {
		this._additionalTransform = a;
		this._additionalTransformDirty = this._transformDirty = !0
	},
	getParentToNodeTransform: function() {
		this._inverseDirty && (this._inverse = cc.affineTransformInvert(this.getNodeToParentTransform()), this._inverseDirty = !1);
		return this._inverse
	},
	parentToNodeTransform: function() {
		return this.getParentToNodeTransform()
	},
	getNodeToWorldTransform: function() {
		for (var a = this.getNodeToParentTransform(), b = this._parent; null != b; b = b.parent) a = cc.affineTransformConcat(a, b.getNodeToParentTransform());
		return a
	},
	nodeToWorldTransform: function() {
		return this.getNodeToWorldTransform()
	},
	getWorldToNodeTransform: function() {
		return cc.affineTransformInvert(this.getNodeToWorldTransform())
	},
	worldToNodeTransform: function() {
		return this.getWorldToNodeTransform()
	},
	convertToNodeSpace: function(a) {
		return cc.pointApplyAffineTransform(a, this.getWorldToNodeTransform())
	},
	convertToWorldSpace: function(a) {
		a = a || cc.p(0, 0);
		return cc.pointApplyAffineTransform(a, this.getNodeToWorldTransform())
	},
	convertToNodeSpaceAR: function(a) {
		return cc.pSub(this.convertToNodeSpace(a), this._anchorPointInPoints)
	},
	convertToWorldSpaceAR: function(a) {
		a = a || cc.p(0, 0);
		a = cc.pAdd(a, this._anchorPointInPoints);
		return this.convertToWorldSpace(a)
	},
	_convertToWindowSpace: function(a) {
		a = this.convertToWorldSpace(a);
		return cc.director.convertToUI(a)
	},
	convertTouchToNodeSpace: function(a) {
		a = a.getLocation();
		return this.convertToNodeSpace(a)
	},
	convertTouchToNodeSpaceAR: function(a) {
		a = a.getLocation();
		a = cc.director.convertToGL(a);
		return this.convertToNodeSpaceAR(a)
	},
	update: function(a) {
		this._componentContainer && !this._componentContainer.isEmpty() && this._componentContainer.visit(a)
	},
	updateTransform: function() {
		this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.updateTransform)
	},
	retain: function() {},
	release: function() {},
	getComponent: function(a) {
		return this._componentContainer ? this._componentContainer.getComponent(a) : null
	},
	addComponent: function(a) {
		this._componentContainer && this._componentContainer.add(a)
	},
	removeComponent: function(a) {
		return this._componentContainer ? this._componentContainer.remove(a) : !1
	},
	removeAllComponents: function() {
		this._componentContainer && this._componentContainer.removeAll()
	},
	grid: null,
	ctor: null,
	visit: null,
	transform: null,
	nodeToParentTransform: function() {
		return this.getNodeToParentTransform()
	},
	getNodeToParentTransform: null,
	_setNodeDirtyForCache: function() {
		if (!1 === this._cacheDirty) {
			this._cacheDirty = !0;
			var a = this._cachedParent;
			a && a != this && a._setNodeDirtyForCache()
		}
	},
	_setCachedParent: function(a) {
		if (this._cachedParent != a) {
			this._cachedParent = a;
			for (var b = this._children, c = 0, d = b.length; c < d; c++) b[c]._setCachedParent(a)
		}
	},
	getCamera: function() {
		this._camera || (this._camera = new cc.Camera);
		return this._camera
	},
	getGrid: function() {
		return this.grid
	},
	setGrid: function(a) {
		this.grid = a
	},
	getShaderProgram: function() {
		return this._shaderProgram
	},
	setShaderProgram: function(a) {
		this._shaderProgram = a
	},
	getGLServerState: function() {
		return this._glServerState
	},
	setGLServerState: function(a) {
		this._glServerState = a
	},
	getBoundingBoxToWorld: function() {
		var a = cc.rect(0, 0, this._contentSize.width, this._contentSize.height),
			b = this.getNodeToWorldTransform(),
			a = cc.rectApplyAffineTransform(a, this.getNodeToWorldTransform());
		if (!this._children) return a;
		for (var c = this._children, d = 0; d < c.length; d++) {
			var e = c[d];
			e && e._visible && (e = e._getBoundingBoxToCurrentNode(b)) && (a = cc.rectUnion(a, e))
		}
		return a
	},
	_getBoundingBoxToCurrentNode: function(a) {
		var b = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
		a = null == a ? this.getNodeToParentTransform() : cc.affineTransformConcat(this.getNodeToParentTransform(), a);
		b = cc.rectApplyAffineTransform(b, a);
		if (!this._children) return b;
		for (var c = this._children, d = 0; d < c.length; d++) {
			var e = c[d];
			e && e._visible && (e = e._getBoundingBoxToCurrentNode(a)) && (b = cc.rectUnion(b, e))
		}
		return b
	},
	_getNodeToParentTransformForWebGL: function() {
		if (this._transformDirty) {
			var a = this._position.x,
				b = this._position.y,
				c = this._anchorPointInPoints.x,
				d = -c,
				e = this._anchorPointInPoints.y,
				f = -e,
				g = this._scaleX,
				h = this._scaleY;
			this._ignoreAnchorPointForPosition && (a += c, b += e);
			var k = 1,
				m = 0,
				n = 1,
				q = 0;
			if (0 !== this._rotationX || 0 !== this._rotationY) k = Math.cos(-this._rotationRadiansX), m = Math.sin(-this._rotationRadiansX), n = Math.cos(-this._rotationRadiansY), q = Math.sin(-this._rotationRadiansY);
			var s = this._skewX || this._skewY;
			s || 0 === c && 0 === e || (a += n * d * g + -m * f * h, b += q * d * g + k * f * h);
			var r = this._transform;
			r.a = n * g;
			r.b = q * g;
			r.c = -m * h;
			r.d = k * h;
			r.tx = a;
			r.ty = b;
			s && (r = cc.affineTransformConcat({
				a: 1,
				b: Math.tan(cc.degreesToRadians(this._skewY)),
				c: Math.tan(cc.degreesToRadians(this._skewX)),
				d: 1,
				tx: 0,
				ty: 0
			}, r), 0 !== c || 0 !== e) && (r = cc.affineTransformTranslate(r, d, f));
			this._additionalTransformDirty && (r = cc.affineTransformConcat(r, this._additionalTransform), this._additionalTransformDirty = !1);
			this._transform = r;
			this._transformDirty = !1
		}
		return this._transform
	},
	_updateColor: function() {},
	getOpacity: function() {
		return this._realOpacity
	},
	getDisplayedOpacity: function() {
		return this._displayedOpacity
	},
	setOpacity: function(a) {
		this._displayedOpacity = this._realOpacity = a;
		var b = 255,
			c = this._parent;
		c && c.cascadeOpacity && (b = c.getDisplayedOpacity());
		this.updateDisplayedOpacity(b);
		this._displayedColor.a = this._realColor.a = a
	},
	updateDisplayedOpacity: function(a) {
		this._displayedOpacity = this._realOpacity * a / 255;
		if (this._cascadeOpacityEnabled) {
			a = this._children;
			for (var b = 0; b < a.length; b++) {
				var c = a[b];
				c && c.updateDisplayedOpacity(this._displayedOpacity)
			}
		}
	},
	isCascadeOpacityEnabled: function() {
		return this._cascadeOpacityEnabled
	},
	setCascadeOpacityEnabled: function(a) {
		this._cascadeOpacityEnabled !== a && ((this._cascadeOpacityEnabled = a) ? this._enableCascadeOpacity() : this._disableCascadeOpacity())
	},
	_enableCascadeOpacity: function() {
		var a = 255,
			b = this._parent;
		b && b.cascadeOpacity && (a = b.getDisplayedOpacity());
		this.updateDisplayedOpacity(a)
	},
	_disableCascadeOpacity: function() {
		this._displayedOpacity = this._realOpacity;
		for (var a = this._children, b = 0; b < a.length; b++) {
			var c = a[b];
			c && c.updateDisplayedOpacity(255)
		}
	},
	getColor: function() {
		var a = this._realColor;
		return cc.color(a.r, a.g, a.b, a.a)
	},
	getDisplayedColor: function() {
		var a = this._displayedColor;
		return cc.color(a.r, a.g, a.b, a.a)
	},
	setColor: function(a) {
		var b = this._displayedColor,
			c = this._realColor;
		b.r = c.r = a.r;
		b.g = c.g = a.g;
		b.b = c.b = a.b;
		a = (a = this._parent) && a.cascadeColor ? a.getDisplayedColor() : cc.color.WHITE;
		this.updateDisplayedColor(a)
	},
	updateDisplayedColor: function(a) {
		var b = this._displayedColor,
			c = this._realColor;
		b.r = 0 | c.r * a.r / 255;
		b.g = 0 | c.g * a.g / 255;
		b.b = 0 | c.b * a.b / 255;
		if (this._cascadeColorEnabled)
			for (a = this._children, c = 0; c < a.length; c++) {
				var d = a[c];
				d && d.updateDisplayedColor(b)
			}
	},
	isCascadeColorEnabled: function() {
		return this._cascadeColorEnabled
	},
	setCascadeColorEnabled: function(a) {
		this._cascadeColorEnabled !== a && ((this._cascadeColorEnabled = a) ? this._enableCascadeColor() : this._disableCascadeColor())
	},
	_enableCascadeColor: function() {
		var a;
		a = (a = this._parent) && a.cascadeColor ? a.getDisplayedColor() : cc.color.WHITE;
		this.updateDisplayedColor(a)
	},
	_disableCascadeColor: function() {
		var a = this._displayedColor,
			b = this._realColor;
		a.r = b.r;
		a.g = b.g;
		a.b = b.b;
		for (var a = this._children, b = cc.color.WHITE, c = 0; c < a.length; c++) {
			var d = a[c];
			d && d.updateDisplayedColor(b)
		}
	},
	setOpacityModifyRGB: function(a) {},
	isOpacityModifyRGB: function() {
		return !1
	}
});
cc.Node.create = function() {
	return new cc.Node
};
cc.Node._StateCallbackType = {
	onEnter: 1,
	onExit: 2,
	cleanup: 3,
	onEnterTransitionDidFinish: 4,
	updateTransform: 5,
	onExitTransitionDidStart: 6,
	sortAllChildren: 7
};
cc._renderType === cc._RENDER_TYPE_CANVAS ? (_p = cc.Node.prototype, _p.ctor = function() {
	this._initNode()
}, _p.setNodeDirty = function() {
	this._setNodeDirtyForCache();
	!1 === this._transformDirty && (this._transformDirty = this._inverseDirty = !0)
}, _p.visit = function(a) {
	if (this._visible) {
		a = a || cc._renderContext;
		var b, c = this._children,
			d;
		a.save();
		this.transform(a);
		var e = c.length;
		if (0 < e) {
			this.sortAllChildren();
			for (b = 0; b < e; b++)
				if (d = c[b], 0 > d._localZOrder) d.visit(a);
				else break;
			for (this.draw(a); b < e; b++) c[b].visit(a)
		} else this.draw(a);
		this._cacheDirty = !1;
		this.arrivalOrder = 0;
		a.restore()
	}
}, _p.transform = function(a) {
	a = a || cc._renderContext;
	var b = cc.view,
		c = this.getNodeToParentTransform();
	a.transform(c.a, c.c, c.b, c.d, c.tx * b.getScaleX(), -c.ty * b.getScaleY())
}, _p.getNodeToParentTransform = function() {
	if (this._transformDirty) {
		var a = this._transform;
		a.tx = this._position.x;
		a.ty = this._position.y;
		var b = 1,
			c = 0;
		this._rotationX && (b = Math.cos(this._rotationRadiansX), c = Math.sin(this._rotationRadiansX));
		a.a = a.d = b;
		a.b = -c;
		a.c = c;
		var d = this._scaleX,
			e = this._scaleY,
			f = this._anchorPointInPoints.x,
			g = this._anchorPointInPoints.y,
			h = 1E-6 > d && -1E-6 < d ? 1E-6 : d,
			k = 1E-6 > e && -1E-6 < e ? 1E-6 : e;
		if (this._skewX || this._skewY) {
			var m = Math.tan(-this._skewX * Math.PI / 180),
				n = Math.tan(-this._skewY * Math.PI / 180);
			Infinity === m && (m = 99999999);
			Infinity === n && (n = 99999999);
			var q = g * m * h,
				s = f * n * k;
			a.a = b + -c * n;
			a.b = b * m + -c;
			a.c = c + b * n;
			a.d = c * m + b;
			a.tx += b * q + -c * s;
			a.ty += c * q + b * s
		}
		if (1 !== d || 1 !== e) a.a *= h, a.c *= h, a.b *= k, a.d *= k;
		a.tx += b * -f * h + -c * g * k;
		a.ty -= c * -f * h + b * g * k;
		this._ignoreAnchorPointForPosition && (a.tx += f, a.ty += g);
		this._additionalTransformDirty && (this._transform = cc.affineTransformConcat(a, this._additionalTransform), this._additionalTransformDirty = !1);
		this._transformDirty = !1
	}
	return this._transform
}, _p = null) : (cc.assert(cc.isFunction(cc._tmp.WebGLCCNode), cc._LogInfos.MissingFile, "BaseNodesWebGL.js"), cc._tmp.WebGLCCNode(), delete cc._tmp.WebGLCCNode);
cc.assert(cc.isFunction(cc._tmp.PrototypeCCNode), cc._LogInfos.MissingFile, "BaseNodesPropertyDefine.js");
cc._tmp.PrototypeCCNode();
delete cc._tmp.PrototypeCCNode;
cc.AtlasNode = cc.Node.extend({
	textureAtlas: null,
	quadsToDraw: 0,
	_itemsPerRow: 0,
	_itemsPerColumn: 0,
	_itemWidth: 0,
	_itemHeight: 0,
	_colorUnmodified: null,
	_opacityModifyRGB: !1,
	_blendFunc: null,
	_ignoreContentScaleFactor: !1,
	_className: "AtlasNode",
	ctor: function(a, b, c, d) {
		cc.Node.prototype.ctor.call(this);
		this._colorUnmodified = cc.color.WHITE;
		this._blendFunc = {
			src: cc.BLEND_SRC,
			dst: cc.BLEND_DST
		};
		this._ignoreContentScaleFactor = !1;
		void 0 !== d && this.initWithTileFile(a, b, c, d)
	},
	updateAtlasValues: function() {
		cc.log(cc._LogInfos.AtlasNode_updateAtlasValues)
	},
	getColor: function() {
		return this._opacityModifyRGB ? this._colorUnmodified : cc.Node.prototype.getColor.call(this)
	},
	setOpacityModifyRGB: function(a) {
		var b = this.color;
		this._opacityModifyRGB = a;
		this.color = b
	},
	isOpacityModifyRGB: function() {
		return this._opacityModifyRGB
	},
	getBlendFunc: function() {
		return this._blendFunc
	},
	setBlendFunc: function(a, b) {
		this._blendFunc = void 0 === b ? a : {
			src: a,
			dst: b
		}
	},
	setTextureAtlas: function(a) {
		this.textureAtlas = a
	},
	getTextureAtlas: function() {
		return this.textureAtlas
	},
	getQuadsToDraw: function() {
		return this.quadsToDraw
	},
	setQuadsToDraw: function(a) {
		this.quadsToDraw = a
	},
	_textureForCanvas: null,
	_originalTexture: null,
	_uniformColor: null,
	_colorF32Array: null,
	initWithTileFile: function(a, b, c, d) {
		if (!a) throw "cc.AtlasNode.initWithTileFile(): title should not be null";
		a = cc.textureCache.addImage(a);
		return this.initWithTexture(a, b, c, d)
	},
	initWithTexture: null,
	_initWithTextureForCanvas: function(a, b, c, d) {
		this._itemWidth = b;
		this._itemHeight = c;
		this._opacityModifyRGB = !0;
		this._originalTexture = a;
		if (!this._originalTexture) return cc.log(cc._LogInfos.AtlasNode__initWithTexture), !1;
		this._textureForCanvas = this._originalTexture;
		this._calculateMaxItems();
		this.quadsToDraw = d;
		return !0
	},
	_initWithTextureForWebGL: function(a, b, c, d) {
		this._itemWidth = b;
		this._itemHeight = c;
		this._colorUnmodified = cc.color.WHITE;
		this._opacityModifyRGB = !0;
		this._blendFunc.src = cc.BLEND_SRC;
		this._blendFunc.dst = cc.BLEND_DST;
		b = this._realColor;
		this._colorF32Array = new Float32Array([b.r / 255, b.g / 255, b.b / 255, this._realOpacity / 255]);
		this.textureAtlas = new cc.TextureAtlas;
		this.textureAtlas.initWithTexture(a, d);
		if (!this.textureAtlas) return cc.log(cc._LogInfos.AtlasNode__initWithTexture), !1;
		this._updateBlendFunc();
		this._updateOpacityModifyRGB();
		this._calculateMaxItems();
		this.quadsToDraw = d;
		this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
		this._uniformColor = cc._renderContext.getUniformLocation(this.shaderProgram.getProgram(), "u_color");
		return !0
	},
	draw: null,
	_drawForWebGL: function(a) {
		a = a || cc._renderContext;
		cc.nodeDrawSetup(this);
		cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
		this._uniformColor && this._colorF32Array && (a.uniform4fv(this._uniformColor, this._colorF32Array), this.textureAtlas.drawNumberOfQuads(this.quadsToDraw, 0))
	},
	setColor: null,
	_setColorForCanvas: function(a) {
		var b = this._realColor;
		if (b.r != a.r || b.g != a.g || b.b != a.b) {
			b = cc.color(a.r, a.g, a.b);
			this._colorUnmodified = a;
			if (this._opacityModifyRGB) {
				var c = this._displayedOpacity;
				b.r = b.r * c / 255;
				b.g = b.g * c / 255;
				b.b = b.b * c / 255
			}
			cc.Node.prototype.setColor.call(this, a);
			this._changeTextureColor()
		}
	},
	_changeTextureColor: function() {
		var a = this.getTexture();
		if (a && this._originalTexture) {
			var b = this._originalTexture.getHtmlElementObj();
			if (b) {
				var c = a.getHtmlElementObj(),
					a = cc.rect(0, 0, b.width, b.height);
				c instanceof HTMLCanvasElement ? cc.generateTintImageWithMultiply(b, this._displayedColor, a, c) : (c = cc.generateTintImageWithMultiply(b, this._displayedColor, a), a = new cc.Texture2D, a.initWithElement(c), a.handleLoadedTexture(), this.setTexture(a))
			}
		}
	},
	_setColorForWebGL: function(a) {
		var b = cc.color(a.r, a.g, a.b);
		this._colorUnmodified = a;
		var c = this._displayedOpacity;
		this._opacityModifyRGB && (b.r = b.r * c / 255, b.g = b.g * c / 255, b.b = b.b * c / 255);
		cc.Node.prototype.setColor.call(this, a);
		a = this._displayedColor;
		this._colorF32Array = new Float32Array([a.r / 255, a.g / 255, a.b / 255, c / 255])
	},
	setOpacity: function(a) {},
	_setOpacityForCanvas: function(a) {
		cc.Node.prototype.setOpacity.call(this, a);
		this._opacityModifyRGB && (this.color = this._colorUnmodified)
	},
	_setOpacityForWebGL: function(a) {
		cc.Node.prototype.setOpacity.call(this, a);
		this._opacityModifyRGB ? this.color = this._colorUnmodified : (a = this._displayedColor, this._colorF32Array = new Float32Array([a.r / 255, a.g / 255, a.b / 255, this._displayedOpacity / 255]))
	},
	getTexture: null,
	_getTextureForCanvas: function() {
		return this._textureForCanvas
	},
	_getTextureForWebGL: function() {
		return this.textureAtlas.texture
	},
	setTexture: null,
	_setTextureForCanvas: function(a) {
		this._textureForCanvas = a
	},
	_setTextureForWebGL: function(a) {
		this.textureAtlas.texture = a;
		this._updateBlendFunc();
		this._updateOpacityModifyRGB()
	},
	_calculateMaxItems: null,
	_calculateMaxItemsForCanvas: function() {
		var a = this.texture.getContentSize();
		this._itemsPerColumn = 0 | a.height / this._itemHeight;
		this._itemsPerRow = 0 | a.width / this._itemWidth
	},
	_calculateMaxItemsForWebGL: function() {
		var a = this.texture,
			b = a.getContentSize();
		this._ignoreContentScaleFactor && (b = a.getContentSizeInPixels());
		this._itemsPerColumn = 0 | b.height / this._itemHeight;
		this._itemsPerRow = 0 | b.width / this._itemWidth
	},
	_updateBlendFunc: function() {
		this.textureAtlas.texture.hasPremultipliedAlpha() || (this._blendFunc.src = cc.SRC_ALPHA, this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA)
	},
	_updateOpacityModifyRGB: function() {
		this._opacityModifyRGB = this.textureAtlas.texture.hasPremultipliedAlpha()
	},
	_setIgnoreContentScaleFactor: function(a) {
		this._ignoreContentScaleFactor = a
	}
});
_p = cc.AtlasNode.prototype;
cc._renderType === cc._RENDER_TYPE_WEBGL ? (_p.initWithTexture = _p._initWithTextureForWebGL, _p.draw = _p._drawForWebGL, _p.setColor = _p._setColorForWebGL, _p.setOpacity = _p._setOpacityForWebGL, _p.getTexture = _p._getTextureForWebGL, _p.setTexture = _p._setTextureForWebGL, _p._calculateMaxItems = _p._calculateMaxItemsForWebGL) : (_p.initWithTexture = _p._initWithTextureForCanvas, _p.draw = cc.Node.prototype.draw, _p.setColor = _p._setColorForCanvas, _p.setOpacity = _p._setOpacityForCanvas, _p.getTexture = _p._getTextureForCanvas, _p.setTexture = _p._setTextureForCanvas, _p._calculateMaxItems = _p._calculateMaxItemsForCanvas, cc.sys._supportCanvasNewBlendModes || (_p._changeTextureColor = function() {
	var a, b = this.getTexture();
	if (b && this._originalTexture && (a = b.getHtmlElementObj())) {
		var c = this._originalTexture.getHtmlElementObj();
		if (b = cc.textureCache.getTextureColors(c)) c = cc.rect(0, 0, c.width, c.height), a instanceof HTMLCanvasElement ? cc.generateTintImage(a, b, this._displayedColor, c, a) : (a = cc.generateTintImage(a, b, this._displayedColor, c), b = new cc.Texture2D, b.initWithElement(a), b.handleLoadedTexture(), this.setTexture(b))
	}
}));
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.AtlasNode.create = function(a, b, c, d) {
	return new cc.AtlasNode(a, b, c, d)
};
cc._tmp.WebGLTexture2D = function() {
	cc.Texture2D = cc.Class.extend({
		_pVRHaveAlphaPremultiplied: !0,
		_pixelFormat: null,
		_pixelsWide: 0,
		_pixelsHigh: 0,
		_name: "",
		_contentSize: null,
		maxS: 0,
		maxT: 0,
		_hasPremultipliedAlpha: !1,
		_hasMipmaps: !1,
		shaderProgram: null,
		_isLoaded: !1,
		_htmlElementObj: null,
		_webTextureObj: null,
		url: null,
		_loadedEventListeners: null,
		ctor: function() {
			this._contentSize = cc.size(0, 0);
			this._pixelFormat = cc.Texture2D.defaultPixelFormat
		},
		releaseTexture: function() {
			this._webTextureObj && cc._renderContext.deleteTexture(this._webTextureObj);
			cc.loader.release(this.url)
		},
		getPixelFormat: function() {
			return this._pixelFormat
		},
		getPixelsWide: function() {
			return this._pixelsWide
		},
		getPixelsHigh: function() {
			return this._pixelsHigh
		},
		getName: function() {
			return this._webTextureObj
		},
		getContentSize: function() {
			return cc.size(this._contentSize.width / cc.contentScaleFactor(), this._contentSize.height / cc.contentScaleFactor())
		},
		_getWidth: function() {
			return this._contentSize.width / cc.contentScaleFactor()
		},
		_getHeight: function() {
			return this._contentSize.height / cc.contentScaleFactor()
		},
		getContentSizeInPixels: function() {
			return this._contentSize
		},
		getMaxS: function() {
			return this.maxS
		},
		setMaxS: function(a) {
			this.maxS = a
		},
		getMaxT: function() {
			return this.maxT
		},
		setMaxT: function(a) {
			this.maxT = a
		},
		getShaderProgram: function() {
			return this.shaderProgram
		},
		setShaderProgram: function(a) {
			this.shaderProgram = a
		},
		hasPremultipliedAlpha: function() {
			return this._hasPremultipliedAlpha
		},
		hasMipmaps: function() {
			return this._hasMipmaps
		},
		description: function() {
			return "\x3ccc.Texture2D | Name \x3d " + this._name + " | Dimensions \x3d " +
				this._pixelsWide + " x " + this._pixelsHigh + " | Coordinates \x3d (" + this.maxS + ", " + this.maxT + ")\x3e"
		},
		releaseData: function(a) {},
		keepData: function(a, b) {
			return a
		},
		initWithData: function(a, b, c, d, e) {
			var f = cc.Texture2D,
				g = cc._renderContext,
				h = g.RGBA,
				k = g.UNSIGNED_BYTE,
				m = c * cc.Texture2D._B[b] / 8;
			0 === m % 8 ? g.pixelStorei(g.UNPACK_ALIGNMENT, 8) : 0 === m % 4 ? g.pixelStorei(g.UNPACK_ALIGNMENT, 4) : 0 === m % 2 ? g.pixelStorei(g.UNPACK_ALIGNMENT, 2) : g.pixelStorei(g.UNPACK_ALIGNMENT, 1);
			this._webTextureObj = g.createTexture();
			cc.glBindTexture2D(this);
			g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
			g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
			g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
			g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
			switch (b) {
				case f.PIXEL_FORMAT_RGBA8888:
					h = g.RGBA;
					break;
				case f.PIXEL_FORMAT_RGB888:
					h = g.RGB;
					break;
				case f.PIXEL_FORMAT_RGBA4444:
					k = g.UNSIGNED_SHORT_4_4_4_4;
					break;
				case f.PIXEL_FORMAT_RGB5A1:
					k = g.UNSIGNED_SHORT_5_5_5_1;
					break;
				case f.PIXEL_FORMAT_RGB565:
					k = g.UNSIGNED_SHORT_5_6_5;
					break;
				case f.PIXEL_FORMAT_AI88:
					h = g.LUMINANCE_ALPHA;
					break;
				case f.PIXEL_FORMAT_A8:
					h = g.ALPHA;
					break;
				case f.PIXEL_FORMAT_I8:
					h = g.LUMINANCE;
					break;
				default:
					cc.assert(0, cc._LogInfos.Texture2D_initWithData)
			}
			g.texImage2D(g.TEXTURE_2D, 0, h, c, d, 0, h, k, a);
			this._contentSize.width = e.width;
			this._contentSize.height = e.height;
			this._pixelsWide = c;
			this._pixelsHigh = d;
			this._pixelFormat = b;
			this.maxS = e.width / c;
			this.maxT = e.height / d;
			this._hasMipmaps = this._hasPremultipliedAlpha = !1;
			this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
			return this._isLoaded = !0
		},
		drawAtPoint: function(a) {
			var b = [0, this.maxT, this.maxS, this.maxT, 0, 0, this.maxS, 0],
				c = this._pixelsWide * this.maxS,
				d = this._pixelsHigh * this.maxT;
			a = [a.x, a.y, 0, c + a.x, a.y, 0, a.x, d + a.y, 0, c + a.x, d + a.y, 0];
			cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS);
			this._shaderProgram.use();
			this._shaderProgram.setUniformsForBuiltins();
			cc.glBindTexture2D(this);
			c = cc._renderContext;
			c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, a);
			c.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, c.FLOAT, !1, 0, b);
			c.drawArrays(c.TRIANGLE_STRIP, 0, 4)
		},
		drawInRect: function(a) {
			var b = [0, this.maxT, this.maxS, this.maxT, 0, 0, this.maxS, 0];
			a = [a.x, a.y, a.x + a.width, a.y, a.x, a.y + a.height, a.x + a.width, a.y + a.height];
			cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS);
			this._shaderProgram.use();
			this._shaderProgram.setUniformsForBuiltins();
			cc.glBindTexture2D(this);
			var c = cc._renderContext;
			c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, a);
			c.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, c.FLOAT, !1, 0, b);
			c.drawArrays(c.TRIANGLE_STRIP, 0, 4)
		},
		initWithImage: function(a) {
			if (null == a) return cc.log(cc._LogInfos.Texture2D_initWithImage), !1;
			var b = a.getWidth(),
				c = a.getHeight(),
				d = cc.configuration.getMaxTextureSize();
			if (b > d || c > d) return cc.log(cc._LogInfos.Texture2D_initWithImage_2, b, c, d, d), !1;
			this._isLoaded = !0;
			return this._initPremultipliedATextureWithImage(a, b, c)
		},
		initWithElement: function(a) {
			a && (this._webTextureObj = cc._renderContext.createTexture(), this._htmlElementObj = a)
		},
		getHtmlElementObj: function() {
			return this._htmlElementObj
		},
		isLoaded: function() {
			return this._isLoaded
		},
		handleLoadedTexture: function() {
			if (cc._rendererInitialized) {
				if (!this._htmlElementObj) {
					var a = cc.loader.getRes(this.url);
					if (!a) return;
					this.initWithElement(a)
				}
				this._htmlElementObj.width && this._htmlElementObj.height && (this._isLoaded = !0, a = cc._renderContext, cc.glBindTexture2D(this), a.pixelStorei(a.UNPACK_ALIGNMENT, 4), a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, a.RGBA, a.UNSIGNED_BYTE, this._htmlElementObj), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE), a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE), this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE), cc.glBindTexture2D(null), a = this._htmlElementObj.height, this._pixelsWide = this._contentSize.width = this._htmlElementObj.width, this._pixelsHigh = this._contentSize.height = a, this._pixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888, this.maxT = this.maxS = 1, this._hasMipmaps = this._hasPremultipliedAlpha = !1, this._callLoadedEventCallbacks())
			}
		},
		initWithString: function(a, b, c, d, e, f) {
			cc.log(cc._LogInfos.Texture2D_initWithString);
			return null
		},
		initWithETCFile: function(a) {
			cc.log(cc._LogInfos.Texture2D_initWithETCFile_2);
			return !1
		},
		initWithPVRFile: function(a) {
			cc.log(cc._LogInfos.Texture2D_initWithPVRFile_2);
			return !1
		},
		initWithPVRTCData: function(a, b, c, d, e, f) {
			cc.log(cc._LogInfos.Texture2D_initWithPVRTCData_2);
			return !1
		},
		setTexParameters: function(a, b, c, d) {
			var e = cc._renderContext;
			void 0 !== b && (a = {
				minFilter: a,
				magFilter: b,
				wrapS: c,
				wrapT: d
			});
			cc.assert(this._pixelsWide == cc.NextPOT(this._pixelsWide) && this._pixelsHigh == cc.NextPOT(this._pixelsHigh) || a.wrapS == e.CLAMP_TO_EDGE && a.wrapT == e.CLAMP_TO_EDGE, "WebGLRenderingContext.CLAMP_TO_EDGE should be used in NPOT textures");
			cc.glBindTexture2D(this);
			e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, a.minFilter);
			e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, a.magFilter);
			e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, a.wrapS);
			e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, a.wrapT)
		},
		setAntiAliasTexParameters: function() {
			var a = cc._renderContext;
			cc.glBindTexture2D(this);
			this._hasMipmaps ? a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR_MIPMAP_NEAREST) : a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
			a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.NEAREST)
		},
		setAliasTexParameters: function() {
			var a = cc._renderContext;
			cc.glBindTexture2D(this);
			this._hasMipmaps ? a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.NEAREST_MIPMAP_NEAREST) : a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.NEAREST);
			a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.NEAREST)
		},
		generateMipmap: function() {
			cc.assert(this._pixelsWide == cc.NextPOT(this._pixelsWide) && this._pixelsHigh == cc.NextPOT(this._pixelsHigh), "Mimpap texture only works in POT textures");
			cc.glBindTexture2D(this);
			cc._renderContext.generateMipmap(cc._renderContext.TEXTURE_2D);
			this._hasMipmaps = !0
		},
		stringForFormat: function() {
			return cc.Texture2D._M[this._pixelFormat]
		},
		bitsPerPixelForFormat: function(a) {
			a = a || this._pixelFormat;
			var b = cc.Texture2D._B[a];
			if (null != b) return b;
			cc.log(cc._LogInfos.Texture2D_bitsPerPixelForFormat, a);
			return -1
		},
		_initPremultipliedATextureWithImage: function(a, b, c) {
			var d = cc.Texture2D,
				e = a.getData(),
				f = null,
				f = null,
				g = a.hasAlpha(),
				h = cc.size(a.getWidth(), a.getHeight()),
				k = d.defaultPixelFormat,
				m = a.getBitsPerComponent();
			g || (8 <= m ? k = d.PIXEL_FORMAT_RGB888 : (cc.log(cc._LogInfos.Texture2D__initPremultipliedATextureWithImage), k = d.PIXEL_FORMAT_RGB565));
			var n = b * c;
			if (k == d.PIXEL_FORMAT_RGB565)
				if (g)
					for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = (f[m] >> 0 & 255) >> 3 << 11 | (f[m] >> 8 & 255) >> 2 << 5 | (f[m] >> 16 & 255) >> 3 << 0;
				else
					for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = (f[m] & 255) >> 3 << 11 | (f[m] & 255) >> 2 << 5 | (f[m] & 255) >> 3 << 0;
			else if (k == d.PIXEL_FORMAT_RGBA4444)
				for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = (f[m] >> 0 & 255) >> 4 << 12 | (f[m] >> 8 & 255) >> 4 << 8 | (f[m] >> 16 & 255) >> 4 << 4 | (f[m] >> 24 & 255) >> 4 << 0;
			else if (k == d.PIXEL_FORMAT_RGB5A1)
				for (e = new Uint16Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = (f[m] >> 0 & 255) >> 3 << 11 | (f[m] >> 8 & 255) >> 3 << 6 | (f[m] >> 16 & 255) >> 3 << 1 | (f[m] >> 24 & 255) >> 7 << 0;
			else if (k == d.PIXEL_FORMAT_A8)
				for (e = new Uint8Array(b * c), f = a.getData(), m = 0; m < n; ++m) e[m] = f >> 24 & 255;
			if (g && k == d.PIXEL_FORMAT_RGB888)
				for (f = a.getData(), e = new Uint8Array(b * c * 3), m = 0; m < n; ++m) e[3 * m] = f >> 0 & 255, e[3 * m + 1] = f >> 8 & 255, e[3 * m + 2] = f >> 16 & 255;
			this.initWithData(e, k, b, c, h);
			a.getData();
			this._hasPremultipliedAlpha = a.isPremultipliedAlpha();
			return !0
		},
		addLoadedEventListener: function(a, b) {
			this._loadedEventListeners || (this._loadedEventListeners = []);
			this._loadedEventListeners.push({
				eventCallback: a,
				eventTarget: b
			})
		},
		removeLoadedEventListener: function(a) {
			if (this._loadedEventListeners)
				for (var b = this._loadedEventListeners, c = 0; c < b.length; c++) b[c].eventTarget == a && b.splice(c, 1)
		},
		_callLoadedEventCallbacks: function() {
			if (this._loadedEventListeners) {
				for (var a = this._loadedEventListeners, b = 0, c = a.length; b < c; b++) {
					var d = a[b];
					d.eventCallback.call(d.eventTarget, this)
				}
				a.length = 0
			}
		}
	})
};
cc._tmp.WebGLTextureAtlas = function() {
	var a = cc.TextureAtlas.prototype;
	a._setupVBO = function() {
		var a = cc._renderContext;
		this._buffersVBO[0] = a.createBuffer();
		this._buffersVBO[1] = a.createBuffer();
		this._quadsWebBuffer = a.createBuffer();
		this._mapBuffers()
	};
	a._mapBuffers = function() {
		var a = cc._renderContext;
		a.bindBuffer(a.ARRAY_BUFFER, this._quadsWebBuffer);
		a.bufferData(a.ARRAY_BUFFER, this._quadsArrayBuffer, a.DYNAMIC_DRAW);
		a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
		a.bufferData(a.ELEMENT_ARRAY_BUFFER, this._indices, a.STATIC_DRAW)
	};
	a.drawNumberOfQuads = function(a, c) {
		c = c || 0;
		if (0 !== a && this.texture && this.texture.isLoaded()) {
			var d = cc._renderContext;
			cc.glBindTexture2D(this.texture);
			cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
			d.bindBuffer(d.ARRAY_BUFFER, this._quadsWebBuffer);
			this.dirty && d.bufferData(d.ARRAY_BUFFER, this._quadsArrayBuffer, d.DYNAMIC_DRAW);
			d.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, d.FLOAT, !1, 24, 0);
			d.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, d.UNSIGNED_BYTE, !0, 24, 12);
			d.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, d.FLOAT, !1, 24, 16);
			this.dirty && (this.dirty = !1);
			d.bindBuffer(d.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
			cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP ? d.drawElements(d.TRIANGLE_STRIP, 6 * a, d.UNSIGNED_SHORT, 6 * c * this._indices.BYTES_PER_ELEMENT) : d.drawElements(d.TRIANGLES, 6 * a, d.UNSIGNED_SHORT, 6 * c * this._indices.BYTES_PER_ELEMENT);
			cc.g_NumberOfDraws++
		}
	}
};
cc._tmp.WebGLTextureCache = function() {
	var a = cc.textureCache;
	a.handleLoadedTexture = function(a) {
		var c = this._textures;
		cc._rendererInitialized || (c = this._loadedTexturesBefore);
		var d = c[a];
		d || (d = c[a] = new cc.Texture2D, d.url = a);
		d.handleLoadedTexture()
	};
	a.addImage = function(a, c, d) {
		cc.assert(a, cc._LogInfos.Texture2D_addImage_2);
		var e = this._textures;
		cc._rendererInitialized || (e = this._loadedTexturesBefore);
		var f = e[a] || e[cc.loader._aliases[a]];
		if (f) return c && c.call(d, f), f;
		cc.loader.getRes(a) || (cc.loader._checkIsImageURL(a) ? cc.loader.load(a, function(a) {
			c && c.call(d)
		}) : cc.loader.loadImg(a, function(e, h) {
			if (e) return c ? c(e) : e;
			cc.loader.cache[a] = h;
			cc.textureCache.handleLoadedTexture(a);
			c && c.call(d, f)
		}));
		f = e[a] = new cc.Texture2D;
		f.url = a;
		return f
	};
	delete a
};
cc._tmp.PrototypeTexture2D = function() {
	var a = cc.Texture2D;
	a.PVRImagesHavePremultipliedAlpha = function(a) {
		cc.PVRHaveAlphaPremultiplied_ = a
	};
	a.PIXEL_FORMAT_RGBA8888 = 2;
	a.PIXEL_FORMAT_RGB888 = 3;
	a.PIXEL_FORMAT_RGB565 = 4;
	a.PIXEL_FORMAT_A8 = 5;
	a.PIXEL_FORMAT_I8 = 6;
	a.PIXEL_FORMAT_AI88 = 7;
	a.PIXEL_FORMAT_RGBA4444 = 8;
	a.PIXEL_FORMAT_RGB5A1 = 7;
	a.PIXEL_FORMAT_PVRTC4 = 9;
	a.PIXEL_FORMAT_PVRTC2 = 10;
	a.PIXEL_FORMAT_DEFAULT = a.PIXEL_FORMAT_RGBA8888;
	var b = cc.Texture2D._M = {};
	b[a.PIXEL_FORMAT_RGBA8888] = "RGBA8888";
	b[a.PIXEL_FORMAT_RGB888] = "RGB888";
	b[a.PIXEL_FORMAT_RGB565] = "RGB565";
	b[a.PIXEL_FORMAT_A8] = "A8";
	b[a.PIXEL_FORMAT_I8] = "I8";
	b[a.PIXEL_FORMAT_AI88] = "AI88";
	b[a.PIXEL_FORMAT_RGBA4444] = "RGBA4444";
	b[a.PIXEL_FORMAT_RGB5A1] = "RGB5A1";
	b[a.PIXEL_FORMAT_PVRTC4] = "PVRTC4";
	b[a.PIXEL_FORMAT_PVRTC2] = "PVRTC2";
	b = cc.Texture2D._B = {};
	b[a.PIXEL_FORMAT_RGBA8888] = 32;
	b[a.PIXEL_FORMAT_RGB888] = 24;
	b[a.PIXEL_FORMAT_RGB565] = 16;
	b[a.PIXEL_FORMAT_A8] = 8;
	b[a.PIXEL_FORMAT_I8] = 8;
	b[a.PIXEL_FORMAT_AI88] = 16;
	b[a.PIXEL_FORMAT_RGBA4444] = 16;
	b[a.PIXEL_FORMAT_RGB5A1] = 16;
	b[a.PIXEL_FORMAT_PVRTC4] = 4;
	b[a.PIXEL_FORMAT_PVRTC2] = 3;
	b = cc.Texture2D.prototype;
	cc.defineGetterSetter(b, "name", b.getName);
	cc.defineGetterSetter(b, "pixelFormat", b.getPixelFormat);
	cc.defineGetterSetter(b, "pixelsWidth", b.getPixelsWide);
	cc.defineGetterSetter(b, "pixelsHeight", b.getPixelsHigh);
	cc.defineGetterSetter(b, "width", b._getWidth);
	cc.defineGetterSetter(b, "height", b._getHeight);
	a.defaultPixelFormat = a.PIXEL_FORMAT_DEFAULT
};
cc._tmp.PrototypeTextureAtlas = function() {
	var a = cc.TextureAtlas.prototype;
	cc.defineGetterSetter(a, "totalQuads", a.getTotalQuads);
	cc.defineGetterSetter(a, "capacity", a.getCapacity);
	cc.defineGetterSetter(a, "quads", a.getQuads, a.setQuads)
};
cc.ALIGN_CENTER = 51;
cc.ALIGN_TOP = 19;
cc.ALIGN_TOP_RIGHT = 18;
cc.ALIGN_RIGHT = 50;
cc.ALIGN_BOTTOM_RIGHT = 34;
cc.ALIGN_BOTTOM = 35;
cc.ALIGN_BOTTOM_LEFT = 33;
cc.ALIGN_LEFT = 49;
cc.ALIGN_TOP_LEFT = 17;
cc.PVRHaveAlphaPremultiplied_ = !1;
cc._renderType === cc._RENDER_TYPE_CANVAS ? cc.Texture2D = cc.Class.extend({
	_contentSize: null,
	_isLoaded: !1,
	_htmlElementObj: null,
	_loadedEventListeners: null,
	url: null,
	ctor: function() {
		this._contentSize = cc.size(0, 0);
		this._isLoaded = !1;
		this._htmlElementObj = null
	},
	getPixelsWide: function() {
		return this._contentSize.width
	},
	getPixelsHigh: function() {
		return this._contentSize.height
	},
	getContentSize: function() {
		var a = cc.contentScaleFactor();
		return cc.size(this._contentSize.width / a, this._contentSize.height / a)
	},
	_getWidth: function() {
		return this._contentSize.width / cc.contentScaleFactor()
	},
	_getHeight: function() {
		return this._contentSize.height / cc.contentScaleFactor()
	},
	getContentSizeInPixels: function() {
		return this._contentSize
	},
	initWithElement: function(a) {
		a && (this._htmlElementObj = a)
	},
	getHtmlElementObj: function() {
		return this._htmlElementObj
	},
	isLoaded: function() {
		return this._isLoaded
	},
	handleLoadedTexture: function() {
		if (!this._isLoaded) {
			if (!this._htmlElementObj) {
				var a = cc.loader.getRes(this.url);
				if (!a) return;
				this.initWithElement(a)
			}
			this._isLoaded = !0;
			a = this._htmlElementObj;
			this._contentSize.width = a.width;
			this._contentSize.height = a.height;
			this._callLoadedEventCallbacks()
		}
	},
	description: function() {
		return "\x3ccc.Texture2D | width \x3d " + this._contentSize.width + " height " + this._contentSize.height + "\x3e"
	},
	initWithData: function(a, b, c, d, e) {
		return !1
	},
	initWithImage: function(a) {
		return !1
	},
	initWithString: function(a, b, c, d, e, f) {
		return !1
	},
	releaseTexture: function() {},
	getName: function() {
		return null
	},
	getMaxS: function() {
		return 1
	},
	setMaxS: function(a) {},
	getMaxT: function() {
		return 1
	},
	setMaxT: function(a) {},
	getPixelFormat: function() {
		return null
	},
	getShaderProgram: function() {
		return null
	},
	setShaderProgram: function(a) {},
	hasPremultipliedAlpha: function() {
		return !1
	},
	hasMipmaps: function() {
		return !1
	},
	releaseData: function(a) {},
	keepData: function(a, b) {
		return a
	},
	drawAtPoint: function(a) {},
	drawInRect: function(a) {},
	initWithETCFile: function(a) {
		cc.log(cc._LogInfos.Texture2D_initWithETCFile);
		return !1
	},
	initWithPVRFile: function(a) {
		cc.log(cc._LogInfos.Texture2D_initWithPVRFile);
		return !1
	},
	initWithPVRTCData: function(a, b, c, d, e, f) {
		cc.log(cc._LogInfos.Texture2D_initWithPVRTCData);
		return !1
	},
	setTexParameters: function(a) {},
	setAntiAliasTexParameters: function() {},
	setAliasTexParameters: function() {},
	generateMipmap: function() {},
	stringForFormat: function() {
		return ""
	},
	bitsPerPixelForFormat: function(a) {
		return -1
	},
	addLoadedEventListener: function(a, b) {
		this._loadedEventListeners || (this._loadedEventListeners = []);
		this._loadedEventListeners.push({
			eventCallback: a,
			eventTarget: b
		})
	},
	removeLoadedEventListener: function(a) {
		if (this._loadedEventListeners)
			for (var b = this._loadedEventListeners, c = 0; c < b.length; c++) b[c].eventTarget == a && b.splice(c, 1)
	},
	_callLoadedEventCallbacks: function() {
		if (this._loadedEventListeners) {
			for (var a = this._loadedEventListeners, b = 0, c = a.length; b < c; b++) {
				var d = a[b];
				d.eventCallback.call(d.eventTarget, this)
			}
			a.length = 0
		}
	}
}) : (cc.assert(cc.isFunction(cc._tmp.WebGLTexture2D), cc._LogInfos.MissingFile, "TexturesWebGL.js"), cc._tmp.WebGLTexture2D(), delete cc._tmp.WebGLTexture2D);
cc.assert(cc.isFunction(cc._tmp.PrototypeTexture2D), cc._LogInfos.MissingFile, "TexturesPropertyDefine.js");
cc._tmp.PrototypeTexture2D();
delete cc._tmp.PrototypeTexture2D;
cc.textureCache = {
	_textures: {},
	_textureColorsCache: {},
	_textureKeySeq: 0 | 1E3 * Math.random(),
	_loadedTexturesBefore: {},
	_initializingRenderer: function() {
		var a, b = this._loadedTexturesBefore,
			c = this._textures;
		for (a in b) {
			var d = b[a];
			d.handleLoadedTexture();
			c[a] = d
		}
		this._loadedTexturesBefore = {}
	},
	addPVRTCImage: function(a) {
		cc.log(cc._LogInfos.textureCache_addPVRTCImage)
	},
	addETCImage: function(a) {
		cc.log(cc._LogInfos.textureCache_addETCImage)
	},
	description: function() {
		return "\x3cTextureCache | Number of textures \x3d " +
			this._textures.length + "\x3e"
	},
	textureForKey: function(a) {
		cc.log(cc._LogInfos.textureCache_textureForKey);
		return this.getTextureForKey(a)
	},
	getTextureForKey: function(a) {
		return this._textures[a] || this._textures[cc.loader._aliases[a]]
	},
	getKeyByTexture: function(a) {
		for (var b in this._textures)
			if (this._textures[b] == a) return b;
		return null
	},
	_generalTextureKey: function() {
		this._textureKeySeq++;
		return "_textureKey_" + this._textureKeySeq
	},
	getTextureColors: function(a) {
		var b = this.getKeyByTexture(a);
		b || (b = a instanceof HTMLImageElement ? a.src : this._generalTextureKey());
		this._textureColorsCache[b] || (this._textureColorsCache[b] = cc.generateTextureCacheForColor(a));
		return this._textureColorsCache[b]
	},
	addPVRImage: function(a) {
		cc.log(cc._LogInfos.textureCache_addPVRImage)
	},
	removeAllTextures: function() {
		var a = this._textures,
			b;
		for (b in a) a[b] && a[b].releaseTexture();
		this._textures = {}
	},
	removeTexture: function(a) {
		if (a) {
			var b = this._textures,
				c;
			for (c in b) b[c] == a && (b[c].releaseTexture(), delete b[c])
		}
	},
	removeTextureForKey: function(a) {
		null != a && this._textures[a] && delete this._textures[a]
	},
	cacheImage: function(a, b) {
		if (b instanceof cc.Texture2D) this._textures[a] = b;
		else {
			var c = new cc.Texture2D;
			c.initWithElement(b);
			c.handleLoadedTexture();
			this._textures[a] = c
		}
	},
	addUIImage: function(a, b) {
		cc.assert(a, cc._LogInfos.textureCache_addUIImage_2);
		if (b && this._textures[b]) return this._textures[b];
		var c = new cc.Texture2D;
		c.initWithImage(a);
		null != b && null != c ? this._textures[b] = c : cc.log(cc._LogInfos.textureCache_addUIImage);
		return c
	},
	dumpCachedTextureInfo: function() {
		var a = 0,
			b = 0,
			c = this._textures,
			d;
		for (d in c) {
			var e = c[d];
			a++;
			e.getHtmlElementObj() instanceof HTMLImageElement ? cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo, d, e.getHtmlElementObj().src, e.pixelsWidth, e.pixelsHeight) : cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, d, e.pixelsWidth, e.pixelsHeight);
			b += e.pixelsWidth * e.pixelsHeight * 4
		}
		c = this._textureColorsCache;
		for (d in c) {
			var e = c[d],
				f;
			for (f in e) {
				var g = e[f];
				a++;
				cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, d, g.width, g.height);
				b += g.width * g.height * 4
			}
		}
		cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_3, a, b / 1024, (b / 1048576).toFixed(2))
	},
	_clear: function() {
		this._textures = {};
		this._textureColorsCache = {};
		this._textureKeySeq = 0 | 1E3 * Math.random();
		this._loadedTexturesBefore = {}
	}
};
cc._renderType === cc._RENDER_TYPE_CANVAS ? (_p = cc.textureCache, _p.handleLoadedTexture = function(a) {
	var b = this._textures,
		c = b[a];
	c || (c = b[a] = new cc.Texture2D, c.url = a);
	c.handleLoadedTexture()
}, _p.addImage = function(a, b, c) {
	cc.assert(a, cc._LogInfos.Texture2D_addImage);
	var d = this._textures,
		e = d[a] || d[cc.loader._aliases[a]];
	if (e) return b && b.call(c, e), e;
	e = d[a] = new cc.Texture2D;
	e.url = a;
	cc.loader.getRes(a) ? e.handleLoadedTexture() : cc.loader._checkIsImageURL(a) ? cc.loader.load(a, function(a) {
		b && b.call(c)
	}) : cc.loader.loadImg(a, function(d, g) {
		if (d) return b ? b(d) : d;
		cc.loader.cache[a] = g;
		cc.textureCache.handleLoadedTexture(a);
		b && b.call(c, e)
	});
	return e
}, _p = null) : (cc.assert(cc.isFunction(cc._tmp.WebGLTextureCache), cc._LogInfos.MissingFile, "TexturesWebGL.js"), cc._tmp.WebGLTextureCache(), delete cc._tmp.WebGLTextureCache);
cc.TextureAtlas = cc.Class.extend({
	dirty: !1,
	texture: null,
	_indices: null,
	_buffersVBO: null,
	_capacity: 0,
	_quads: null,
	_quadsArrayBuffer: null,
	_quadsWebBuffer: null,
	_quadsReader: null,
	ctor: function(a, b) {
		this._buffersVBO = [];
		cc.isString(a) ? this.initWithFile(a, b) : a instanceof cc.Texture2D && this.initWithTexture(a, b)
	},
	getTotalQuads: function() {
		return this._totalQuads
	},
	getCapacity: function() {
		return this._capacity
	},
	getTexture: function() {
		return this.texture
	},
	setTexture: function(a) {
		this.texture = a
	},
	setDirty: function(a) {
		this.dirty = a
	},
	isDirty: function() {
		return this.dirty
	},
	getQuads: function() {
		return this._quads
	},
	setQuads: function(a) {
		this._quads = a
	},
	_copyQuadsToTextureAtlas: function(a, b) {
		if (a)
			for (var c = 0; c < a.length; c++) this._setQuadToArray(a[c], b + c)
	},
	_setQuadToArray: function(a, b) {
		var c = this._quads;
		c[b] ? (c[b].bl = a.bl, c[b].br = a.br, c[b].tl = a.tl, c[b].tr = a.tr) : c[b] = new cc.V3F_C4B_T2F_Quad(a.tl, a.bl, a.tr, a.br, this._quadsArrayBuffer, b * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT)
	},
	description: function() {
		return "\x3ccc.TextureAtlas | totalQuads \x3d" +
			this._totalQuads + "\x3e"
	},
	_setupIndices: function() {
		if (0 !== this._capacity)
			for (var a = this._indices, b = this._capacity, c = 0; c < b; c++) cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP ? (a[6 * c + 0] = 4 * c + 0, a[6 * c + 1] = 4 * c + 0, a[6 * c + 2] = 4 * c + 2, a[6 * c + 3] = 4 * c + 1, a[6 * c + 4] = 4 * c + 3, a[6 * c + 5] = 4 * c + 3) : (a[6 * c + 0] = 4 * c + 0, a[6 * c + 1] = 4 * c + 1, a[6 * c + 2] = 4 * c + 2, a[6 * c + 3] = 4 * c + 3, a[6 * c + 4] = 4 * c + 2, a[6 * c + 5] = 4 * c + 1)
	},
	_setupVBO: function() {
		var a = cc._renderContext;
		this._buffersVBO[0] = a.createBuffer();
		this._buffersVBO[1] = a.createBuffer();
		this._quadsWebBuffer = a.createBuffer();
		this._mapBuffers()
	},
	_mapBuffers: function() {
		var a = cc._renderContext;
		a.bindBuffer(a.ARRAY_BUFFER, this._quadsWebBuffer);
		a.bufferData(a.ARRAY_BUFFER, this._quadsArrayBuffer, a.DYNAMIC_DRAW);
		a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
		a.bufferData(a.ELEMENT_ARRAY_BUFFER, this._indices, a.STATIC_DRAW)
	},
	initWithFile: function(a, b) {
		var c = cc.textureCache.addImage(a);
		if (c) return this.initWithTexture(c, b);
		cc.log(cc._LogInfos.TextureAtlas_initWithFile, a);
		return !1
	},
	initWithTexture: function(a, b) {
		cc.assert(a, cc._LogInfos.TextureAtlas_initWithTexture);
		this._capacity = b |= 0;
		this._totalQuads = 0;
		this.texture = a;
		this._quads = [];
		this._indices = new Uint16Array(6 * b);
		var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
		this._quadsArrayBuffer = new ArrayBuffer(c * b);
		this._quadsReader = new Uint8Array(this._quadsArrayBuffer);
		if ((!this._quads || !this._indices) && 0 < b) return !1;
		for (var d = this._quads, e = 0; e < b; e++) d[e] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, e * c);
		this._setupIndices();
		this._setupVBO();
		return this.dirty = !0
	},
	updateQuad: function(a, b) {
		cc.assert(a, cc._LogInfos.TextureAtlas_updateQuad);
		cc.assert(0 <= b && b < this._capacity, cc._LogInfos.TextureAtlas_updateQuad_2);
		this._totalQuads = Math.max(b + 1, this._totalQuads);
		this._setQuadToArray(a, b);
		this.dirty = !0
	},
	insertQuad: function(a, b) {
		cc.assert(b < this._capacity, cc._LogInfos.TextureAtlas_insertQuad_2);
		this._totalQuads++;
		if (this._totalQuads > this._capacity) cc.log(cc._LogInfos.TextureAtlas_insertQuad);
		else {
			var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
				d = b * c,
				e = (this._totalQuads -
					1 - b) * c;
			this._quads[this._totalQuads - 1] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads - 1) * c);
			this._quadsReader.set(this._quadsReader.subarray(d, d + e), d + c);
			this._setQuadToArray(a, b);
			this.dirty = !0
		}
	},
	insertQuads: function(a, b, c) {
		c = c || a.length;
		cc.assert(b + c <= this._capacity, cc._LogInfos.TextureAtlas_insertQuads);
		var d = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
		this._totalQuads += c;
		if (this._totalQuads > this._capacity) cc.log(cc._LogInfos.TextureAtlas_insertQuad);
		else {
			var e = b * d,
				f = (this._totalQuads - 1 - b - c) * d,
				g = this._totalQuads - 1 - c,
				h;
			for (h = 0; h < c; h++) this._quads[g + h] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, (this._totalQuads - 1) * d);
			this._quadsReader.set(this._quadsReader.subarray(e, e + f), e + d * c);
			for (h = 0; h < c; h++) this._setQuadToArray(a[h], b + h);
			this.dirty = !0
		}
	},
	insertQuadFromIndex: function(a, b) {
		if (a !== b) {
			cc.assert(0 <= b || b < this._totalQuads, cc._LogInfos.TextureAtlas_insertQuadFromIndex);
			cc.assert(0 <= a || a < this._totalQuads, cc._LogInfos.TextureAtlas_insertQuadFromIndex_2);
			var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
				d = this._quadsReader,
				e = d.subarray(a * c, c),
				f;
			a > b ? (f = b * c, d.set(d.subarray(f, f + (a - b) * c), f + c), d.set(e, f)) : (f = (a + 1) * c, d.set(d.subarray(f, f + (b - a) * c), f - c), d.set(e, b * c));
			this.dirty = !0
		}
	},
	removeQuadAtIndex: function(a) {
		cc.assert(a < this._totalQuads, cc._LogInfos.TextureAtlas_removeQuadAtIndex);
		var b = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
		this._totalQuads--;
		this._quads.length = this._totalQuads;
		if (a !== this._totalQuads) {
			var c = (a + 1) * b;
			this._quadsReader.set(this._quadsReader.subarray(c, c + (this._totalQuads - a) * b), c - b)
		}
		this.dirty = !0
	},
	removeQuadsAtIndex: function(a, b) {
		cc.assert(a + b <= this._totalQuads, cc._LogInfos.TextureAtlas_removeQuadsAtIndex);
		this._totalQuads -= b;
		if (a !== this._totalQuads) {
			var c = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
				d = (a + b) * c,
				e = a * c;
			this._quadsReader.set(this._quadsReader.subarray(d, d + (this._totalQuads - a) * c), e)
		}
		this.dirty = !0
	},
	removeAllQuads: function() {
		this._totalQuads = this._quads.length = 0
	},
	_setDirty: function(a) {
		this.dirty = a
	},
	resizeCapacity: function(a) {
		if (a == this._capacity) return !0;
		var b = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
			c = this._capacity;
		this._totalQuads = Math.min(this._totalQuads, a);
		var d = this._capacity = 0 | a,
			e = this._totalQuads;
		if (null == this._quads)
			for (this._quads = [], this._quadsArrayBuffer = new ArrayBuffer(b * d), this._quadsReader = new Uint8Array(this._quadsArrayBuffer), a = 0; a < d; a++) this._quads = new cc.V3F_C4B_T2F_Quad(null, null, null, null, this._quadsArrayBuffer, a * b);
		else {
			var f, g, h = this._quads;
			if (d > c) {
				f = [];
				g = new ArrayBuffer(b * d);
				for (a = 0; a < e; a++) f[a] = new cc.V3F_C4B_T2F_Quad(h[a].tl, h[a].bl, h[a].tr, h[a].br, g, a * b);
				for (; a < d; a++) f[a] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, g, a * b)
			} else
				for (e = Math.max(e, d), f = [], g = new ArrayBuffer(b * d), a = 0; a < e; a++) f[a] = new cc.V3F_C4B_T2F_Quad(h[a].tl, h[a].bl, h[a].tr, h[a].br, g, a * b);
			this._quadsReader = new Uint8Array(g);
			this._quads = f;
			this._quadsArrayBuffer = g
		}
		null == this._indices ? this._indices = new Uint16Array(6 * d) : d > c ? (b = new Uint16Array(6 * d), b.set(this._indices, 0), this._indices = b) : this._indices = this._indices.subarray(0, 6 * d);
		this._setupIndices();
		this._mapBuffers();
		return this.dirty = !0
	},
	increaseTotalQuadsWith: function(a) {
		this._totalQuads += a
	},
	moveQuadsFromIndex: function(a, b, c) {
		if (void 0 === c) {
			if (c = b, b = this._totalQuads - a, cc.assert(c + (this._totalQuads - a) <= this._capacity, cc._LogInfos.TextureAtlas_moveQuadsFromIndex), 0 === b) return
		} else if (cc.assert(c + b <= this._totalQuads, cc._LogInfos.TextureAtlas_moveQuadsFromIndex_2), cc.assert(a < this._totalQuads, cc._LogInfos.TextureAtlas_moveQuadsFromIndex_3), a == c) return;
		var d = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
			e = a * d,
			f = b * d,
			g = this._quadsReader,
			h = g.subarray(e, e + f),
			k = c * d;
		c < a ? (b = c * d, g.set(g.subarray(b, b + (a - c) * d), b + f)) : (b = (a + b) * d, g.set(g.subarray(b, b + (c - a) * d), e));
		g.set(h, k);
		this.dirty = !0
	},
	fillWithEmptyQuadsFromIndex: function(a, b) {
		for (var c = b * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, d = new Uint8Array(this._quadsArrayBuffer, a * cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT, c), e = 0; e < c; e++) d[e] = 0
	},
	drawQuads: function() {
		this.drawNumberOfQuads(this._totalQuads, 0)
	},
	_releaseBuffer: function() {
		var a = cc._renderContext;
		this._buffersVBO && (this._buffersVBO[0] && a.deleteBuffer(this._buffersVBO[0]), this._buffersVBO[1] && a.deleteBuffer(this._buffersVBO[1]));
		this._quadsWebBuffer && a.deleteBuffer(this._quadsWebBuffer)
	}
});
_p = cc.TextureAtlas.prototype;
cc.defineGetterSetter(_p, "totalQuads", _p.getTotalQuads);
cc.defineGetterSetter(_p, "capacity", _p.getCapacity);
cc.defineGetterSetter(_p, "quads", _p.getQuads, _p.setQuads);
cc.TextureAtlas.create = function(a, b) {
	return new cc.TextureAtlas(a, b)
};
cc.TextureAtlas.createWithTexture = cc.TextureAtlas.create;
cc._renderType === cc._RENDER_TYPE_WEBGL && (cc.assert(cc.isFunction(cc._tmp.WebGLTextureAtlas), cc._LogInfos.MissingFile, "TexturesWebGL.js"), cc._tmp.WebGLTextureAtlas(), delete cc._tmp.WebGLTextureAtlas);
cc.assert(cc.isFunction(cc._tmp.PrototypeTextureAtlas), cc._LogInfos.MissingFile, "TexturesPropertyDefine.js");
cc._tmp.PrototypeTextureAtlas();
delete cc._tmp.PrototypeTextureAtlas;
cc.Scene = cc.Node.extend({
	_className: "Scene",
	ctor: function() {
		cc.Node.prototype.ctor.call(this);
		this._ignoreAnchorPointForPosition = !0;
		this.setAnchorPoint(0.5, 0.5);
		this.setContentSize(cc.director.getWinSize())
	}
});
cc.Scene.create = function() {
	return new cc.Scene
};
cc.LoaderScene = cc.Scene.extend({
	_interval: null,
	_label: null,
	_className: "LoaderScene",
	init: function() {
		var a = this,
			b = 200,
			c = a._bgLayer = new cc.LayerColor(cc.color(32, 32, 32, 255));
		c.setPosition(cc.visibleRect.bottomLeft);
		a.addChild(c, 0);
		var d = 24,
			e = -b / 2 + 100;
		cc._loaderImage && (cc.loader.loadImg(cc._loaderImage, {
			isCrossOrigin: !1
		}, function(c, d) {
			b = d.height;
			a._initStage(d, cc.visibleRect.center)
		}), d = 14, e = -b / 2 - 10);
		d = a._label = cc.LabelTTF.create("Loading... 0%", "Arial", d);
		d.setPosition(cc.pAdd(cc.visibleRect.center, cc.p(0, e)));
		d.setColor(cc.color(180, 180, 180));
		c.addChild(this._label, 10);
		return !0
	},
	_initStage: function(a, b) {
		var c = this._texture2d = new cc.Texture2D;
		c.initWithElement(a);
		c.handleLoadedTexture();
		c = this._logo = cc.Sprite.create(c);
		c.setScale(cc.contentScaleFactor());
		c.x = b.x;
		c.y = b.y;
		this._bgLayer.addChild(c, 10)
	},
	onEnter: function() {
		cc.Node.prototype.onEnter.call(this);
		this.schedule(this._startLoading, 0.3)
	},
	onExit: function() {
		cc.Node.prototype.onExit.call(this);
		this._label.setString("Loading... 0%")
	},
	initWithResources: function(a, b) {
		cc.isString(a) && (a = [a]);
		this.resources = a || [];
		this.cb = b
	},
	_startLoading: function() {
		var a = this;
		a.unschedule(a._startLoading);
		cc.loader.load(a.resources, function(b, c, d) {
			b = Math.min(d / c * 100 | 0, 100);
			a._label.setString("Loading... " + b + "%")
		}, function() {
			a.cb && a.cb()
		})
	}
});
cc.LoaderScene.preload = function(a, b) {
	var c = cc;
	c.loaderScene || (c.loaderScene = new cc.LoaderScene, c.loaderScene.init());
	c.loaderScene.initWithResources(a, b);
	cc.director.runScene(c.loaderScene);
	return c.loaderScene
};
cc._tmp.LayerDefineForWebGL = function() {
	var a = cc.Layer.prototype;
	a.bake = function() {};
	a.unbake = function() {};
	a.visit = cc.Node.prototype.visit
};
cc._tmp.WebGLLayerColor = function() {
	var a = cc.LayerColor.prototype;
	a._squareVertices = null;
	a._squareColors = null;
	a._verticesFloat32Buffer = null;
	a._colorsUint8Buffer = null;
	a._squareVerticesAB = null;
	a._squareColorsAB = null;
	a.ctor = function(a, c, d) {
		this._squareVerticesAB = new ArrayBuffer(32);
		this._squareColorsAB = new ArrayBuffer(16);
		var e = this._squareVerticesAB,
			f = this._squareColorsAB,
			g = cc.Vertex2F.BYTES_PER_ELEMENT,
			h = cc.Color.BYTES_PER_ELEMENT;
		this._squareVertices = [new cc.Vertex2F(0, 0, e, 0), new cc.Vertex2F(0, 0, e, g), new cc.Vertex2F(0, 0, e, 2 * g), new cc.Vertex2F(0, 0, e, 3 * g)];
		this._squareColors = [cc.color(0, 0, 0, 255, f, 0), cc.color(0, 0, 0, 255, f, h), cc.color(0, 0, 0, 255, f, 2 * h), cc.color(0, 0, 0, 255, f, 3 * h)];
		this._verticesFloat32Buffer = cc._renderContext.createBuffer();
		this._colorsUint8Buffer = cc._renderContext.createBuffer();
		cc.Layer.prototype.ctor.call(this);
		this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
		cc.LayerColor.prototype.init.call(this, a, c, d)
	};
	a.setContentSize = function(a, c) {
		var d = this._squareVertices;
		void 0 === c ? (d[1].x = a.width, d[2].y = a.height, d[3].x = a.width, d[3].y = a.height) : (d[1].x = a, d[2].y = c, d[3].x = a, d[3].y = c);
		this._bindLayerVerticesBufferData();
		cc.Layer.prototype.setContentSize.call(this, a, c)
	};
	a._setWidth = function(a) {
		var c = this._squareVertices;
		c[1].x = a;
		c[3].x = a;
		this._bindLayerVerticesBufferData();
		cc.Layer.prototype._setWidth.call(this, a)
	};
	a._setHeight = function(a) {
		var c = this._squareVertices;
		c[2].y = a;
		c[3].y = a;
		this._bindLayerVerticesBufferData();
		cc.Layer.prototype._setHeight.call(this, a)
	};
	a._updateColor = function() {
		for (var a = this._displayedColor, c = this._displayedOpacity, d = this._squareColors, e = 0; 4 > e; e++) d[e].r = a.r, d[e].g = a.g, d[e].b = a.b, d[e].a = c;
		this._bindLayerColorsBufferData()
	};
	a.draw = function(a) {
		a = a || cc._renderContext;
		cc.nodeDrawSetup(this);
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR);
		a.bindBuffer(a.ARRAY_BUFFER, this._verticesFloat32Buffer);
		a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
		a.bindBuffer(a.ARRAY_BUFFER, this._colorsUint8Buffer);
		a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, 0, 0);
		cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
		a.drawArrays(a.TRIANGLE_STRIP, 0, 4)
	};
	a._bindLayerVerticesBufferData = function() {
		var a = cc._renderContext;
		a.bindBuffer(a.ARRAY_BUFFER, this._verticesFloat32Buffer);
		a.bufferData(a.ARRAY_BUFFER, this._squareVerticesAB, a.STATIC_DRAW)
	};
	a._bindLayerColorsBufferData = function() {
		var a = cc._renderContext;
		a.bindBuffer(a.ARRAY_BUFFER, this._colorsUint8Buffer);
		a.bufferData(a.ARRAY_BUFFER, this._squareColorsAB, a.STATIC_DRAW)
	}
};
cc._tmp.WebGLLayerGradient = function() {
	var a = cc.LayerGradient.prototype;
	a.draw = cc.LayerColor.prototype.draw;
	a._updateColor = function() {
		var a = this._alongVector,
			c = cc.pLength(a);
		if (0 !== c) {
			var d = Math.sqrt(2),
				a = cc.p(a.x / c, a.y / c);
			this._compressedInterpolation && (c = 1 / (Math.abs(a.x) + Math.abs(a.y)), a = cc.pMult(a, c * d));
			var e = this._displayedOpacity / 255,
				c = this._displayedColor,
				f = this._endColor,
				c = {
					r: c.r,
					g: c.g,
					b: c.b,
					a: this._startOpacity * e
				},
				e = {
					r: f.r,
					g: f.g,
					b: f.b,
					a: this._endOpacity * e
				},
				g = this._squareColors,
				f = g[0],
				h = g[1],
				k = g[2],
				g = g[3];
			f.r = e.r + (d + a.x + a.y) / (2 * d) * (c.r - e.r);
			f.g = e.g + (d + a.x + a.y) / (2 * d) * (c.g - e.g);
			f.b = e.b + (d + a.x + a.y) / (2 * d) * (c.b - e.b);
			f.a = e.a + (d + a.x + a.y) / (2 * d) * (c.a - e.a);
			h.r = e.r + (d - a.x + a.y) / (2 * d) * (c.r - e.r);
			h.g = e.g + (d - a.x + a.y) / (2 * d) * (c.g - e.g);
			h.b = e.b + (d - a.x + a.y) / (2 * d) * (c.b - e.b);
			h.a = e.a + (d - a.x + a.y) / (2 * d) * (c.a - e.a);
			k.r = e.r + (d + a.x - a.y) / (2 * d) * (c.r - e.r);
			k.g = e.g + (d + a.x - a.y) / (2 * d) * (c.g - e.g);
			k.b = e.b + (d + a.x - a.y) / (2 * d) * (c.b - e.b);
			k.a = e.a + (d + a.x - a.y) / (2 * d) * (c.a - e.a);
			g.r = e.r + (d - a.x - a.y) / (2 * d) * (c.r - e.r);
			g.g = e.g + (d - a.x - a.y) / (2 * d) * (c.g - e.g);
			g.b = e.b + (d - a.x - a.y) / (2 * d) * (c.b - e.b);
			g.a = e.a + (d - a.x - a.y) / (2 * d) * (c.a - e.a);
			this._bindLayerColorsBufferData()
		}
	}
};
cc._tmp.PrototypeLayerColor = function() {
	var a = cc.LayerColor.prototype;
	cc.defineGetterSetter(a, "width", a._getWidth, a._setWidth);
	cc.defineGetterSetter(a, "height", a._getHeight, a._setHeight)
};
cc._tmp.PrototypeLayerGradient = function() {
	var a = cc.LayerGradient.prototype;
	cc.defineGetterSetter(a, "startColor", a.getStartColor, a.setStartColor);
	cc.defineGetterSetter(a, "endColor", a.getEndColor, a.setEndColor);
	cc.defineGetterSetter(a, "startOpacity", a.getStartOpacity, a.setStartOpacity);
	cc.defineGetterSetter(a, "endOpacity", a.getEndOpacity, a.setEndOpacity);
	cc.defineGetterSetter(a, "vector", a.getVector, a.setVector)
};
cc.Layer = cc.Node.extend({
	_isBaked: !1,
	_bakeSprite: null,
	_className: "Layer",
	ctor: function() {
		var a = cc.Node.prototype;
		a.ctor.call(this);
		this._ignoreAnchorPointForPosition = !0;
		a.setAnchorPoint.call(this, 0.5, 0.5);
		a.setContentSize.call(this, cc.winSize)
	},
	init: function() {
		this._ignoreAnchorPointForPosition = !0;
		this.setAnchorPoint(0.5, 0.5);
		this.setContentSize(cc.winSize);
		this.cascadeColor = this.cascadeOpacity = !1;
		return !0
	},
	bake: null,
	unbake: null,
	isBaked: function() {
		return this._isBaked
	},
	visit: null
});
cc.Layer.create = function() {
	return new cc.Layer
};
if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
	var p = cc.Layer.prototype;
	p.bake = function() {
		if (!this._isBaked) {
			this._isBaked = this._cacheDirty = !0;
			this._cachedParent = this;
			for (var a = this._children, b = 0, c = a.length; b < c; b++) a[b]._setCachedParent(this);
			this._bakeSprite || (this._bakeSprite = new cc.BakeSprite)
		}
	};
	p.unbake = function() {
		if (this._isBaked) {
			this._isBaked = !1;
			this._cacheDirty = !0;
			this._cachedParent = null;
			for (var a = this._children, b = 0, c = a.length; b < c; b++) a[b]._setCachedParent(null)
		}
	};
	p.addChild = function(a, b, c) {
		cc.Node.prototype.addChild.call(this, a, b, c);
		a._parent == this && this._isBaked && a._setCachedParent(this)
	};
	p.visit = function(a) {
		if (this._isBaked) {
			a = a || cc._renderContext;
			var b, c = this._children,
				d = c.length;
			if (this._visible && 0 !== d) {
				var e = this._bakeSprite;
				a.save();
				this.transform(a);
				if (this._cacheDirty) {
					b = this._getBoundingBoxForBake();
					b.width |= 0;
					b.height |= 0;
					var f = e.getCacheContext();
					e.resetCanvasSize(b.width, b.height);
					f.translate(0 - b.x, b.height + b.y);
					var g = e.getAnchorPointInPoints();
					e.setPosition(g.x + b.x, g.y + b.y);
					this.sortAllChildren();
					cc.view._setScaleXYForRenderTexture();
					for (b = 0; b < d; b++) c[b].visit(f);
					cc.view._resetScale();
					this._cacheDirty = !1
				}
				e.visit(a);
				this.arrivalOrder = 0;
				a.restore()
			}
		} else cc.Node.prototype.visit.call(this, a)
	};
	p._getBoundingBoxForBake = function() {
		var a = null;
		if (!this._children || 0 === this._children.length) return cc.rect(0, 0, 10, 10);
		for (var b = this._children, c = 0; c < b.length; c++) {
			var d = b[c];
			d && d._visible && (a ? (d = d._getBoundingBoxToCurrentNode()) && (a = cc.rectUnion(a, d)) : a = d._getBoundingBoxToCurrentNode())
		}
		return a
	};
	p = null
} else cc.assert(cc.isFunction(cc._tmp.LayerDefineForWebGL), cc._LogInfos.MissingFile, "CCLayerWebGL.js"), cc._tmp.LayerDefineForWebGL(), delete cc._tmp.LayerDefineForWebGL;
cc.LayerColor = cc.Layer.extend({
	_blendFunc: null,
	_className: "LayerColor",
	getBlendFunc: function() {
		return this._blendFunc
	},
	changeWidthAndHeight: function(a, b) {
		this.width = a;
		this.height = b
	},
	changeWidth: function(a) {
		this.width = a
	},
	changeHeight: function(a) {
		this.height = a
	},
	setOpacityModifyRGB: function(a) {},
	isOpacityModifyRGB: function() {
		return !1
	},
	setColor: function(a) {
		cc.Layer.prototype.setColor.call(this, a);
		this._updateColor()
	},
	setOpacity: function(a) {
		cc.Layer.prototype.setOpacity.call(this, a);
		this._updateColor()
	},
	_blendFuncStr: "source",
	ctor: null,
	init: function(a, b, c) {
		cc._renderType !== cc._RENDER_TYPE_CANVAS && (this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR));
		var d = cc.director.getWinSize();
		a = a || cc.color(0, 0, 0, 255);
		b = void 0 === b ? d.width : b;
		c = void 0 === c ? d.height : c;
		d = this._displayedColor;
		d.r = a.r;
		d.g = a.g;
		d.b = a.b;
		d = this._realColor;
		d.r = a.r;
		d.g = a.g;
		d.b = a.b;
		this._realOpacity = this._displayedOpacity = a.a;
		a = cc.LayerColor.prototype;
		a.setContentSize.call(this, b, c);
		a._updateColor.call(this);
		return !0
	},
	setBlendFunc: function(a, b) {
		var c = this._blendFunc;
		void 0 === b ? (c.src = a.src, c.dst = a.dst) : (c.src = a, c.dst = b);
		cc._renderType === cc._RENDER_TYPE_CANVAS && (this._blendFuncStr = cc._getCompositeOperationByBlendFunc(c))
	},
	_setWidth: null,
	_setHeight: null,
	_updateColor: null,
	updateDisplayedColor: function(a) {
		cc.Layer.prototype.updateDisplayedColor.call(this, a);
		this._updateColor()
	},
	updateDisplayedOpacity: function(a) {
		cc.Layer.prototype.updateDisplayedOpacity.call(this, a);
		this._updateColor()
	},
	draw: null
});
cc.LayerColor.create = function(a, b, c) {
	return new cc.LayerColor(a, b, c)
};
cc._renderType === cc._RENDER_TYPE_CANVAS ? (_p = cc.LayerColor.prototype, _p.ctor = function(a, b, c) {
	cc.Layer.prototype.ctor.call(this);
	this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
	cc.LayerColor.prototype.init.call(this, a, b, c)
}, _p._setWidth = cc.Layer.prototype._setWidth, _p._setHeight = cc.Layer.prototype._setHeight, _p._updateColor = function() {}, _p.draw = function(a) {
	a = a || cc._renderContext;
	var b = cc.view,
		c = this._displayedColor;
	a.fillStyle = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b) + "," + this._displayedOpacity / 255 + ")";
	a.fillRect(0, 0, this.width * b.getScaleX(), -this.height * b.getScaleY());
	cc.g_NumberOfDraws++
}, _p.visit = function(a) {
	if (this._isBaked) {
		a = a || cc._renderContext;
		var b, c = this._children,
			d = c.length;
		if (this._visible) {
			var e = this._bakeSprite;
			a.save();
			this.transform(a);
			if (this._cacheDirty) {
				b = this._getBoundingBoxForBake();
				b.width |= 0;
				b.height |= 0;
				var f = e.getCacheContext();
				e.resetCanvasSize(b.width, b.height);
				var g = e.getAnchorPointInPoints(),
					h = this._position;
				if (this._ignoreAnchorPointForPosition) f.translate(0 -
					b.x + h.x, b.height + b.y - h.y), e.setPosition(g.x + b.x - h.x, g.y + b.y - h.y);
				else {
					var k = this.getAnchorPointInPoints(),
						m = h.x - k.x,
						h = h.y - k.y;
					f.translate(0 - b.x + m, b.height + b.y - h);
					e.setPosition(g.x + b.x - m, g.y + b.y - h)
				}
				cc.view._setScaleXYForRenderTexture();
				if (0 < d) {
					this.sortAllChildren();
					for (b = 0; b < d; b++)
						if (g = c[b], 0 > g._localZOrder) g.visit(f);
						else break;
					for (this.draw(f); b < d; b++) c[b].visit(f)
				} else this.draw(f);
				cc.view._resetScale();
				this._cacheDirty = !1
			}
			e.visit(a);
			this.arrivalOrder = 0;
			a.restore()
		}
	} else cc.Node.prototype.visit.call(this, a)
}, _p._getBoundingBoxForBake = function() {
	var a = cc.rect(0, 0, this._contentSize.width, this._contentSize.height),
		b = this.nodeToWorldTransform(),
		a = cc.rectApplyAffineTransform(a, this.nodeToWorldTransform());
	if (!this._children || 0 === this._children.length) return a;
	for (var c = this._children, d = 0; d < c.length; d++) {
		var e = c[d];
		e && e._visible && (e = e._getBoundingBoxToCurrentNode(b), a = cc.rectUnion(a, e))
	}
	return a
}, _p = null) : (cc.assert(cc.isFunction(cc._tmp.WebGLLayerColor), cc._LogInfos.MissingFile, "CCLayerWebGL.js"), cc._tmp.WebGLLayerColor(), delete cc._tmp.WebGLLayerColor);
cc.assert(cc.isFunction(cc._tmp.PrototypeLayerColor), cc._LogInfos.MissingFile, "CCLayerPropertyDefine.js");
cc._tmp.PrototypeLayerColor();
delete cc._tmp.PrototypeLayerColor;
cc.LayerGradient = cc.LayerColor.extend({
	_startColor: null,
	_endColor: null,
	_startOpacity: 255,
	_endOpacity: 255,
	_alongVector: null,
	_compressedInterpolation: !1,
	_gradientStartPoint: null,
	_gradientEndPoint: null,
	_className: "LayerGradient",
	ctor: function(a, b, c) {
		cc.LayerColor.prototype.ctor.call(this);
		this._startColor = cc.color(0, 0, 0, 255);
		this._endColor = cc.color(0, 0, 0, 255);
		this._alongVector = cc.p(0, -1);
		this._endOpacity = this._startOpacity = 255;
		this._gradientStartPoint = cc.p(0, 0);
		this._gradientEndPoint = cc.p(0, 0);
		cc.LayerGradient.prototype.init.call(this, a, b, c)
	},
	init: function(a, b, c) {
		a = a || cc.color(0, 0, 0, 255);
		b = b || cc.color(0, 0, 0, 255);
		c = c || cc.p(0, -1);
		var d = this._startColor,
			e = this._endColor;
		d.r = a.r;
		d.g = a.g;
		d.b = a.b;
		this._startOpacity = a.a;
		e.r = b.r;
		e.g = b.g;
		e.b = b.b;
		this._endOpacity = b.a;
		this._alongVector = c;
		this._compressedInterpolation = !0;
		this._gradientStartPoint = cc.p(0, 0);
		this._gradientEndPoint = cc.p(0, 0);
		cc.LayerColor.prototype.init.call(this, cc.color(a.r, a.g, a.b, 255));
		cc.LayerGradient.prototype._updateColor.call(this);
		return !0
	},
	setContentSize: function(a, b) {
		cc.LayerColor.prototype.setContentSize.call(this, a, b);
		this._updateColor()
	},
	_setWidth: function(a) {
		cc.LayerColor.prototype._setWidth.call(this, a);
		this._updateColor()
	},
	_setHeight: function(a) {
		cc.LayerColor.prototype._setHeight.call(this, a);
		this._updateColor()
	},
	getStartColor: function() {
		return this._realColor
	},
	setStartColor: function(a) {
		this.color = a
	},
	setEndColor: function(a) {
		this._endColor = a;
		this._updateColor()
	},
	getEndColor: function() {
		return this._endColor
	},
	setStartOpacity: function(a) {
		this._startOpacity = a;
		this._updateColor()
	},
	getStartOpacity: function() {
		return this._startOpacity
	},
	setEndOpacity: function(a) {
		this._endOpacity = a;
		this._updateColor()
	},
	getEndOpacity: function() {
		return this._endOpacity
	},
	setVector: function(a) {
		this._alongVector.x = a.x;
		this._alongVector.y = a.y;
		this._updateColor()
	},
	getVector: function() {
		return cc.p(this._alongVector.x, this._alongVector.y)
	},
	isCompressedInterpolation: function() {
		return this._compressedInterpolation
	},
	setCompressedInterpolation: function(a) {
		this._compressedInterpolation = a;
		this._updateColor()
	},
	_draw: null,
	_updateColor: null
});
cc.LayerGradient.create = function(a, b, c) {
	return new cc.LayerGradient(a, b, c)
};
cc._renderType === cc._RENDER_TYPE_CANVAS ? (_p = cc.LayerGradient.prototype, _p.draw = function(a) {
	a = a || cc._renderContext;
	"source" != this._blendFuncStr && (a.globalCompositeOperation = this._blendFuncStr);
	a.save();
	var b = this._displayedOpacity / 255,
		c = cc.view.getScaleX(),
		d = cc.view.getScaleY(),
		e = this.width * c,
		f = this.height * d,
		c = a.createLinearGradient(this._gradientStartPoint.x * c, this._gradientStartPoint.y * d, this._gradientEndPoint.x * c, this._gradientEndPoint.y * d),
		d = this._displayedColor,
		g = this._endColor;
	c.addColorStop(0, "rgba(" + Math.round(d.r) + "," + Math.round(d.g) + "," + Math.round(d.b) + "," + (this._startOpacity / 255 * b).toFixed(4) + ")");
	c.addColorStop(1, "rgba(" + Math.round(g.r) + "," + Math.round(g.g) + "," + Math.round(g.b) + "," + (this._endOpacity / 255 * b).toFixed(4) + ")");
	a.fillStyle = c;
	a.fillRect(0, 0, e, -f);
	0 != this._rotation && a.rotate(this._rotationRadians);
	a.restore();
	cc.g_NumberOfDraws++
}, _p._updateColor = function() {
	var a = this._alongVector,
		b = 0.5 * this.width,
		c = 0.5 * this.height;
	this._gradientStartPoint.x = b * -a.x + b;
	this._gradientStartPoint.y = c * a.y - c;
	this._gradientEndPoint.x = b * a.x + b;
	this._gradientEndPoint.y = c * -a.y - c
}, _p = null) : (cc.assert(cc.isFunction(cc._tmp.WebGLLayerGradient), cc._LogInfos.MissingFile, "CCLayerWebGL.js"), cc._tmp.WebGLLayerGradient(), delete cc._tmp.WebGLLayerGradient);
cc.assert(cc.isFunction(cc._tmp.PrototypeLayerGradient), cc._LogInfos.MissingFile, "CCLayerPropertyDefine.js");
cc._tmp.PrototypeLayerGradient();
delete cc._tmp.PrototypeLayerGradient;
cc.LayerMultiplex = cc.Layer.extend({
	_enabledLayer: 0,
	_layers: null,
	_className: "LayerMultiplex",
	ctor: function(a) {
		cc.Layer.prototype.ctor.call(this);
		a instanceof Array ? cc.LayerMultiplex.prototype.initWithLayers.call(this, a) : cc.LayerMultiplex.prototype.initWithLayers.call(this, Array.prototype.slice.call(arguments))
	},
	initWithLayers: function(a) {
		0 < a.length && null == a[a.length - 1] && cc.log(cc._LogInfos.LayerMultiplex_initWithLayers);
		this._layers = a;
		this._enabledLayer = 0;
		this.addChild(this._layers[this._enabledLayer]);
		return !0
	},
	switchTo: function(a) {
		a >= this._layers.length ? cc.log(cc._LogInfos.LayerMultiplex_switchTo) : (this.removeChild(this._layers[this._enabledLayer], !0), this._enabledLayer = a, this.addChild(this._layers[a]))
	},
	switchToAndReleaseMe: function(a) {
		a >= this._layers.length ? cc.log(cc._LogInfos.LayerMultiplex_switchToAndReleaseMe) : (this.removeChild(this._layers[this._enabledLayer], !0), this._layers[this._enabledLayer] = null, this._enabledLayer = a, this.addChild(this._layers[a]))
	},
	addLayer: function(a) {
		a ? this._layers.push(a) : cc.log(cc._LogInfos.LayerMultiplex_addLayer)
	}
});
cc.LayerMultiplex.create = function() {
	return new cc.LayerMultiplex(Array.prototype.slice.call(arguments))
};
cc._tmp.WebGLSprite = function() {
	var a = cc.Sprite.prototype;
	a._spriteFrameLoadedCallback = function(a) {
		this.setNodeDirty(!0);
		this.setTextureRect(a.getRect(), a.isRotated(), a.getOriginalSize());
		this._callLoadedEventCallbacks()
	};
	a.setOpacityModifyRGB = function(a) {
		this._opacityModifyRGB !== a && (this._opacityModifyRGB = a, this.updateColor())
	};
	a.updateDisplayedOpacity = function(a) {
		cc.Node.prototype.updateDisplayedOpacity.call(this, a);
		this.updateColor()
	};
	a.ctor = function(a, c, d) {
		cc.Node.prototype.ctor.call(this);
		this._shouldBeHidden = !1;
		this._offsetPosition = cc.p(0, 0);
		this._unflippedOffsetPositionFromCenter = cc.p(0, 0);
		this._blendFunc = {
			src: cc.BLEND_SRC,
			dst: cc.BLEND_DST
		};
		this._rect = cc.rect(0, 0, 0, 0);
		this._quad = new cc.V3F_C4B_T2F_Quad;
		this._quadWebBuffer = cc._renderContext.createBuffer();
		this._textureLoaded = this._quadDirty = !0;
		this._softInit(a, c, d)
	};
	a.setBlendFunc = function(a, c) {
		var d = this._blendFunc;
		void 0 === c ? (d.src = a.src, d.dst = a.dst) : (d.src = a, d.dst = c)
	};
	a.init = function() {
		if (0 < arguments.length) return this.initWithFile(arguments[0], arguments[1]);
		cc.Node.prototype.init.call(this);
		this.dirty = this._recursiveDirty = !1;
		this._opacityModifyRGB = !0;
		this._blendFunc.src = cc.BLEND_SRC;
		this._blendFunc.dst = cc.BLEND_DST;
		this.texture = null;
		this._textureLoaded = !0;
		this._flippedX = this._flippedY = !1;
		this.anchorY = this.anchorX = 0.5;
		this._offsetPosition.x = 0;
		this._offsetPosition.y = 0;
		this._hasChildren = !1;
		var a = {
			r: 255,
			g: 255,
			b: 255,
			a: 255
		};
		this._quad.bl.colors = a;
		this._quad.br.colors = a;
		this._quad.tl.colors = a;
		this._quad.tr.colors = a;
		this._quadDirty = !0;
		this.setTextureRect(cc.rect(0, 0, 0, 0), !1, cc.size(0, 0));
		return !0
	};
	a.initWithTexture = function(a, c, d) {
		cc.assert(0 != arguments.length, cc._LogInfos.Sprite_initWithTexture);
		d = d || !1;
		if (!cc.Node.prototype.init.call(this)) return !1;
		this._batchNode = null;
		this.dirty = this._recursiveDirty = !1;
		this._opacityModifyRGB = !0;
		this._blendFunc.src = cc.BLEND_SRC;
		this._blendFunc.dst = cc.BLEND_DST;
		this._flippedX = this._flippedY = !1;
		this.anchorY = this.anchorX = 0.5;
		this._offsetPosition.x = 0;
		this._offsetPosition.y = 0;
		this._hasChildren = !1;
		var e = cc.color(255, 255, 255, 255),
			f = this._quad;
		f.bl.colors = e;
		f.br.colors = e;
		f.tl.colors = e;
		f.tr.colors = e;
		this._textureLoaded = e = a.isLoaded();
		if (!e) return this._rectRotated = d || !1, c && (e = this._rect, e.x = c.x, e.y = c.y, e.width = c.width, e.height = c.height), a.addLoadedEventListener(this._textureLoadedCallback, this), !0;
		c || (c = cc.rect(0, 0, a.width, a.height));
		a && a.url && (d ? (e = c.x + c.height, f = c.y + c.width) : (e = c.x + c.width, f = c.y + c.height), e > a.width && cc.error(cc._LogInfos.RectWidth, a.url), f > a.height && cc.error(cc._LogInfos.RectHeight, a.url));
		this.texture = a;
		this.setTextureRect(c, d);
		this.batchNode = null;
		return this._quadDirty = !0
	};
	a._textureLoadedCallback = function(a) {
		if (!this._textureLoaded) {
			this._textureLoaded = !0;
			var c = this._rect;
			c ? cc._rectEqualToZero(c) && (c.width = a.width, c.height = a.height) : c = cc.rect(0, 0, a.width, a.height);
			this.texture = a;
			this.setTextureRect(c, this._rectRotated);
			this.batchNode = this._batchNode;
			this._quadDirty = !0;
			this._callLoadedEventCallbacks()
		}
	};
	a.setTextureRect = function(a, c, d) {
		this._rectRotated = c || !1;
		this.setContentSize(d || a);
		this.setVertexRect(a);
		this._setTextureCoords(a);
		a = this._unflippedOffsetPositionFromCenter;
		this._flippedX && (a.x = -a.x);
		this._flippedY && (a.y = -a.y);
		var e = this._rect;
		this._offsetPosition.x = a.x + (this._contentSize.width - e.width) / 2;
		this._offsetPosition.y = a.y + (this._contentSize.height - e.height) / 2;
		if (this._batchNode) this.dirty = !0;
		else {
			a = 0 + this._offsetPosition.x;
			c = 0 + this._offsetPosition.y;
			d = a + e.width;
			var e = c + e.height,
				f = this._quad;
			f.bl.vertices = {
				x: a,
				y: c,
				z: 0
			};
			f.br.vertices = {
				x: d,
				y: c,
				z: 0
			};
			f.tl.vertices = {
				x: a,
				y: e,
				z: 0
			};
			f.tr.vertices = {
				x: d,
				y: e,
				z: 0
			};
			this._quadDirty = !0
		}
	};
	a.updateTransform = function() {
		if (this.dirty) {
			var a = this._quad,
				c = this._parent;
			if (!this._visible || c && c != this._batchNode && c._shouldBeHidden) a.br.vertices = a.tl.vertices = a.tr.vertices = a.bl.vertices = {
				x: 0,
				y: 0,
				z: 0
			}, this._shouldBeHidden = !0;
			else {
				this._shouldBeHidden = !1;
				var d = this._transformToBatch = c && c != this._batchNode ? cc.affineTransformConcat(this.nodeToParentTransform(), c._transformToBatch) : this.nodeToParentTransform(),
					e = this._rect,
					c = this._offsetPosition.x,
					f = this._offsetPosition.y,
					g = c + e.width,
					h = f + e.height,
					k = d.tx,
					m = d.ty,
					n = d.a,
					q = d.b,
					s = d.d,
					r = -d.c,
					d = c * n - f * r + k,
					e = c * q + f * s + m,
					t = g * n - f * r + k,
					f = g * q + f * s + m,
					u = g * n - h * r + k,
					g = g * q + h * s + m,
					k = c * n - h * r + k,
					c = c * q + h * s + m,
					h = this._vertexZ;
				cc.SPRITEBATCHNODE_RENDER_SUBPIXEL || (d |= 0, e |= 0, t |= 0, f |= 0, u |= 0, g |= 0, k |= 0, c |= 0);
				a.bl.vertices = {
					x: d,
					y: e,
					z: h
				};
				a.br.vertices = {
					x: t,
					y: f,
					z: h
				};
				a.tl.vertices = {
					x: k,
					y: c,
					z: h
				};
				a.tr.vertices = {
					x: u,
					y: g,
					z: h
				}
			}
			this.textureAtlas.updateQuad(a, this.atlasIndex);
			this.dirty = this._recursiveDirty = !1
		}
		this._hasChildren && this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.updateTransform);
		cc.SPRITE_DEBUG_DRAW && (a = [cc.p(this._quad.bl.vertices.x, this._quad.bl.vertices.y), cc.p(this._quad.br.vertices.x, this._quad.br.vertices.y), cc.p(this._quad.tr.vertices.x, this._quad.tr.vertices.y), cc.p(this._quad.tl.vertices.x, this._quad.tl.vertices.y)], cc._drawingUtil.drawPoly(a, 4, !0))
	};
	a.addChild = function(a, c, d) {
		cc.assert(a, cc._LogInfos.Sprite_addChild_3);
		null == c && (c = a._localZOrder);
		null == d && (d = a.tag);
		if (this._batchNode) {
			if (!(a instanceof cc.Sprite)) {
				cc.log(cc._LogInfos.Sprite_addChild);
				return
			}
			a.texture._webTextureObj !== this.textureAtlas.texture._webTextureObj && cc.log(cc._LogInfos.Sprite_addChild_2);
			this._batchNode.appendChild(a);
			this._reorderChildDirty || this._setReorderChildDirtyRecursively()
		}
		cc.Node.prototype.addChild.call(this, a, c, d);
		this._hasChildren = !0
	};
	a.setOpacity = function(a) {
		cc.Node.prototype.setOpacity.call(this, a);
		this.updateColor()
	};
	a.setColor = function(a) {
		cc.Node.prototype.setColor.call(this, a);
		this.updateColor()
	};
	a.updateDisplayedColor = function(a) {
		cc.Node.prototype.updateDisplayedColor.call(this, a);
		this.updateColor()
	};
	a.setSpriteFrame = function(a) {
		var c = this;
		cc.isString(a) && (a = cc.spriteFrameCache.getSpriteFrame(a), cc.assert(a, cc._LogInfos.Sprite_setSpriteFrame));
		c.setNodeDirty(!0);
		var d = a.getOffset();
		c._unflippedOffsetPositionFromCenter.x = d.x;
		c._unflippedOffsetPositionFromCenter.y = d.y;
		d = a.getTexture();
		a.textureLoaded() || (c._textureLoaded = !1, a.addLoadedEventListener(function(a) {
			c._textureLoaded = !0;
			var b = a.getTexture();
			b != c._texture && (c.texture = b);
			c.setTextureRect(a.getRect(), a.isRotated(), a.getOriginalSize());
			c._callLoadedEventCallbacks()
		}, c));
		d != c._texture && (c.texture = d);
		c._rectRotated = a.isRotated();
		c.setTextureRect(a.getRect(), c._rectRotated, a.getOriginalSize())
	};
	a.isFrameDisplayed = function(a) {
		return cc.rectEqualToRect(a.getRect(), this._rect) && a.getTexture().getName() == this._texture.getName() && cc.pointEqualToPoint(a.getOffset(), this._unflippedOffsetPositionFromCenter)
	};
	a.setBatchNode = function(a) {
		if (this._batchNode = a) this._transformToBatch = cc.affineTransformIdentity(), this.textureAtlas = this._batchNode.textureAtlas;
		else {
			this.atlasIndex = cc.Sprite.INDEX_NOT_INITIALIZED;
			this.textureAtlas = null;
			this.dirty = this._recursiveDirty = !1;
			a = this._offsetPosition.x;
			var c = this._offsetPosition.y,
				d = a + this._rect.width,
				e = c + this._rect.height,
				f = this._quad;
			f.bl.vertices = {
				x: a,
				y: c,
				z: 0
			};
			f.br.vertices = {
				x: d,
				y: c,
				z: 0
			};
			f.tl.vertices = {
				x: a,
				y: e,
				z: 0
			};
			f.tr.vertices = {
				x: d,
				y: e,
				z: 0
			};
			this._quadDirty = !0
		}
	};
	a.setTexture = function(a) {
		a && cc.isString(a) ? (a = cc.textureCache.addImage(a), this.setTexture(a), a = a.getContentSize(), this.setTextureRect(cc.rect(0, 0, a.width, a.height))) : (cc.assert(!a || a instanceof cc.Texture2D, cc._LogInfos.Sprite_setTexture_2), this._batchNode && this._batchNode.texture != a ? cc.log(cc._LogInfos.Sprite_setTexture) : (this.shaderProgram = a ? cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR) : cc.shaderCache.programForKey(cc.SHADER_POSITION_COLOR), this._batchNode || this._texture == a || (this._texture = a, this._updateBlendFunc())))
	};
	a.draw = function() {
		if (this._textureLoaded) {
			var a = cc._renderContext,
				c = this._texture;
			c ? c._isLoaded && (this._shaderProgram.use(), this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4(), cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst), cc.glBindTexture2DN(0, c), cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX), a.bindBuffer(a.ARRAY_BUFFER, this._quadWebBuffer), this._quadDirty && (a.bufferData(a.ARRAY_BUFFER, this._quad.arrayBuffer, a.DYNAMIC_DRAW), this._quadDirty = !1), a.vertexAttribPointer(0, 3, a.FLOAT, !1, 24, 0), a.vertexAttribPointer(1, 4, a.UNSIGNED_BYTE, !0, 24, 12), a.vertexAttribPointer(2, 2, a.FLOAT, !1, 24, 16), a.drawArrays(a.TRIANGLE_STRIP, 0, 4)) : (this._shaderProgram.use(), this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4(), cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst), cc.glBindTexture2D(null), cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR), a.bindBuffer(a.ARRAY_BUFFER, this._quadWebBuffer), this._quadDirty && (cc._renderContext.bufferData(cc._renderContext.ARRAY_BUFFER, this._quad.arrayBuffer, cc._renderContext.STATIC_DRAW), this._quadDirty = !1), a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, a.FLOAT, !1, 24, 0), a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, 24, 12), a.drawArrays(a.TRIANGLE_STRIP, 0, 4));
			cc.g_NumberOfDraws++;
			if (0 !== cc.SPRITE_DEBUG_DRAW || this._showNode) 1 === cc.SPRITE_DEBUG_DRAW || this._showNode ? (a = this._quad, a = [cc.p(a.tl.vertices.x, a.tl.vertices.y), cc.p(a.bl.vertices.x, a.bl.vertices.y), cc.p(a.br.vertices.x, a.br.vertices.y), cc.p(a.tr.vertices.x, a.tr.vertices.y)], cc._drawingUtil.drawPoly(a, 4, !0)) : 2 === cc.SPRITE_DEBUG_DRAW && (a = this.getTextureRect(), c = this.getOffsetPosition(), a = [cc.p(c.x, c.y), cc.p(c.x + a.width, c.y), cc.p(c.x + a.width, c.y + a.height), cc.p(c.x, c.y + a.height)], cc._drawingUtil.drawPoly(a, 4, !0))
		}
	};
	delete a
};
cc._tmp.PrototypeSprite = function() {
	var a = cc.Sprite.prototype;
	cc.defineGetterSetter(a, "opacityModifyRGB", a.isOpacityModifyRGB, a.setOpacityModifyRGB);
	cc.defineGetterSetter(a, "opacity", a.getOpacity, a.setOpacity);
	cc.defineGetterSetter(a, "color", a.getColor, a.setColor);
	cc.defineGetterSetter(a, "flippedX", a.isFlippedX, a.setFlippedX);
	cc.defineGetterSetter(a, "flippedY", a.isFlippedY, a.setFlippedY);
	cc.defineGetterSetter(a, "offsetX", a._getOffsetX);
	cc.defineGetterSetter(a, "offsetY", a._getOffsetY);
	cc.defineGetterSetter(a, "texture", a.getTexture, a.setTexture);
	cc.defineGetterSetter(a, "textureRectRotated", a.isTextureRectRotated);
	cc.defineGetterSetter(a, "batchNode", a.getBatchNode, a.setBatchNode);
	cc.defineGetterSetter(a, "quad", a.getQuad)
};
cc.generateTintImageWithMultiply = function(a, b, c, d) {
	d = d || cc.newElement("canvas");
	c = c || cc.rect(0, 0, a.width, a.height);
	var e = d.getContext("2d");
	d.width != c.width || d.height != c.height ? (d.width = c.width, d.height = c.height) : e.globalCompositeOperation = "source-over";
	e.fillStyle = "rgb(" + (0 | b.r) + "," + (0 | b.g) + "," + (0 | b.b) + ")";
	e.fillRect(0, 0, c.width, c.height);
	e.globalCompositeOperation = "multiply";
	e.drawImage(a, c.x, c.y, c.width, c.height, 0, 0, c.width, c.height);
	e.globalCompositeOperation = "destination-atop";
	e.drawImage(a, c.x, c.y, c.width, c.height, 0, 0, c.width, c.height);
	return d
};
cc.generateTintImage = function(a, b, c, d, e) {
	d || (d = cc.rect(0, 0, a.width, a.height));
	a = c.r / 255;
	var f = c.g / 255;
	c = c.b / 255;
	var g = Math.min(d.width, b[0].width),
		h = Math.min(d.height, b[0].height),
		k;
	e ? (k = e.getContext("2d"), k.clearRect(0, 0, g, h)) : (e = cc.newElement("canvas"), e.width = g, e.height = h, k = e.getContext("2d"));
	k.save();
	k.globalCompositeOperation = "lighter";
	var m = k.globalAlpha;
	0 < a && (k.globalAlpha = a * m, k.drawImage(b[0], d.x, d.y, g, h, 0, 0, g, h));
	0 < f && (k.globalAlpha = f * m, k.drawImage(b[1], d.x, d.y, g, h, 0, 0, g, h));
	0 < c && (k.globalAlpha = c * m, k.drawImage(b[2], d.x, d.y, g, h, 0, 0, g, h));
	1 > a + f + c && (k.globalAlpha = m, k.drawImage(b[3], d.x, d.y, g, h, 0, 0, g, h));
	k.restore();
	return e
};
cc.generateTextureCacheForColor = function(a) {
	function b() {
		var b = cc.generateTextureCacheForColor,
			d = a.width,
			g = a.height;
		c[0].width = d;
		c[0].height = g;
		c[1].width = d;
		c[1].height = g;
		c[2].width = d;
		c[2].height = g;
		c[3].width = d;
		c[3].height = g;
		b.canvas.width = d;
		b.canvas.height = g;
		var h = b.canvas.getContext("2d");
		h.drawImage(a, 0, 0);
		b.tempCanvas.width = d;
		b.tempCanvas.height = g;
		for (var h = h.getImageData(0, 0, d, g).data, k = 0; 4 > k; k++) {
			var m = c[k].getContext("2d");
			m.getImageData(0, 0, d, g).data;
			b.tempCtx.drawImage(a, 0, 0);
			for (var n = b.tempCtx.getImageData(0, 0, d, g), q = n.data, s = 0; s < h.length; s += 4) q[s] = 0 === k ? h[s] : 0, q[s + 1] = 1 === k ? h[s + 1] : 0, q[s + 2] = 2 === k ? h[s + 2] : 0, q[s + 3] = h[s + 3];
			m.putImageData(n, 0, 0)
		}
		a.onload = null
	}
	if (a.channelCache) return a.channelCache;
	var c = [cc.newElement("canvas"), cc.newElement("canvas"), cc.newElement("canvas"), cc.newElement("canvas")];
	try {
		b()
	} catch (d) {
		a.onload = b
	}
	return a.channelCache = c
};
cc.generateTextureCacheForColor.canvas = cc.newElement("canvas");
cc.generateTextureCacheForColor.tempCanvas = cc.newElement("canvas");
cc.generateTextureCacheForColor.tempCtx = cc.generateTextureCacheForColor.tempCanvas.getContext("2d");
cc.cutRotateImageToCanvas = function(a, b) {
	if (!a) return null;
	if (!b) return a;
	var c = cc.newElement("canvas");
	c.width = b.width;
	c.height = b.height;
	var d = c.getContext("2d");
	d.translate(c.width / 2, c.height / 2);
	d.rotate(-1.5707963267948966);
	d.drawImage(a, b.x, b.y, b.height, b.width, -b.height / 2, -b.width / 2, b.height, b.width);
	return c
};
cc._getCompositeOperationByBlendFunc = function(a) {
	return a ? a.src == cc.SRC_ALPHA && a.dst == cc.ONE || a.src == cc.ONE && a.dst == cc.ONE ? "lighter" : a.src == cc.ZERO && a.dst == cc.SRC_ALPHA ? "destination-in" : a.src == cc.ZERO && a.dst == cc.ONE_MINUS_SRC_ALPHA ? "destination-out" : "source" : "source"
};
cc.Sprite = cc.Node.extend({
	dirty: !1,
	atlasIndex: 0,
	textureAtlas: null,
	_batchNode: null,
	_recursiveDirty: null,
	_hasChildren: null,
	_shouldBeHidden: !1,
	_transformToBatch: null,
	_blendFunc: null,
	_texture: null,
	_rect: null,
	_rectRotated: !1,
	_offsetPosition: null,
	_unflippedOffsetPositionFromCenter: null,
	_opacityModifyRGB: !1,
	_flippedX: !1,
	_flippedY: !1,
	_textureLoaded: !1,
	_loadedEventListeners: null,
	_newTextureWhenChangeColor: null,
	_className: "Sprite",
	_oldDisplayColor: cc.color.WHITE,
	textureLoaded: function() {
		return this._textureLoaded
	},
	addLoadedEventListener: function(a, b) {
		this._loadedEventListeners || (this._loadedEventListeners = []);
		this._loadedEventListeners.push({
			eventCallback: a,
			eventTarget: b
		})
	},
	_callLoadedEventCallbacks: function() {
		if (this._loadedEventListeners) {
			for (var a = this._loadedEventListeners, b = 0, c = a.length; b < c; b++) {
				var d = a[b];
				d.eventCallback.call(d.eventTarget, this)
			}
			a.length = 0
		}
	},
	isDirty: function() {
		return this.dirty
	},
	setDirty: function(a) {
		this.dirty = a
	},
	isTextureRectRotated: function() {
		return this._rectRotated
	},
	getAtlasIndex: function() {
		return this.atlasIndex
	},
	setAtlasIndex: function(a) {
		this.atlasIndex = a
	},
	getTextureRect: function() {
		return cc.rect(this._rect.x, this._rect.y, this._rect.width, this._rect.height)
	},
	getTextureAtlas: function() {
		return this.textureAtlas
	},
	setTextureAtlas: function(a) {
		this.textureAtlas = a
	},
	getOffsetPosition: function() {
		return cc.p(this._offsetPosition)
	},
	_getOffsetX: function() {
		return this._offsetPosition.x
	},
	_getOffsetY: function() {
		return this._offsetPosition.y
	},
	getBlendFunc: function() {
		return this._blendFunc
	},
	initWithSpriteFrame: function(a) {
		cc.assert(a, cc._LogInfos.Sprite_initWithSpriteFrame);
		a.textureLoaded() || (this._textureLoaded = !1, a.addLoadedEventListener(this._spriteFrameLoadedCallback, this));
		var b = cc._renderType === cc._RENDER_TYPE_CANVAS ? !1 : a._rotated,
			b = this.initWithTexture(a.getTexture(), a.getRect(), b);
		this.setSpriteFrame(a);
		return b
	},
	_spriteFrameLoadedCallback: null,
	initWithSpriteFrameName: function(a) {
		cc.assert(a, cc._LogInfos.Sprite_initWithSpriteFrameName);
		var b = cc.spriteFrameCache.getSpriteFrame(a);
		cc.assert(b, a + cc._LogInfos.Sprite_initWithSpriteFrameName1);
		return this.initWithSpriteFrame(b)
	},
	useBatchNode: function(a) {
		this.textureAtlas = a.textureAtlas;
		this._batchNode = a
	},
	setVertexRect: function(a) {
		this._rect.x = a.x;
		this._rect.y = a.y;
		this._rect.width = a.width;
		this._rect.height = a.height
	},
	sortAllChildren: function() {
		if (this._reorderChildDirty) {
			var a = this._children,
				b = a.length,
				c, d, e;
			for (c = 1; c < b; c++) {
				e = a[c];
				for (d = c - 1; 0 <= d;) {
					if (e._localZOrder < a[d]._localZOrder) a[d + 1] = a[d];
					else if (e._localZOrder === a[d]._localZOrder && e.arrivalOrder < a[d].arrivalOrder) a[d + 1] = a[d];
					else break;
					d--
				}
				a[d + 1] = e
			}
			this._batchNode && this._arrayMakeObjectsPerformSelector(a, cc.Node._StateCallbackType.sortAllChildren);
			this._reorderChildDirty = !1
		}
	},
	reorderChild: function(a, b) {
		cc.assert(a, cc._LogInfos.Sprite_reorderChild_2); - 1 === this._children.indexOf(a) ? cc.log(cc._LogInfos.Sprite_reorderChild) : b !== a.zIndex && (this._batchNode && !this._reorderChildDirty && (this._setReorderChildDirtyRecursively(), this._batchNode.reorderBatch(!0)), cc.Node.prototype.reorderChild.call(this, a, b))
	},
	removeChild: function(a, b) {
		this._batchNode && this._batchNode.removeSpriteFromAtlas(a);
		cc.Node.prototype.removeChild.call(this, a, b)
	},
	setVisible: function(a) {
		cc.Node.prototype.setVisible.call(this, a);
		this.setDirtyRecursively(!0)
	},
	removeAllChildren: function(a) {
		var b = this._children,
			c = this._batchNode;
		if (c && null != b)
			for (var d = 0, e = b.length; d < e; d++) c.removeSpriteFromAtlas(b[d]);
		cc.Node.prototype.removeAllChildren.call(this, a);
		this._hasChildren = !1
	},
	setDirtyRecursively: function(a) {
		this.dirty = this._recursiveDirty = a;
		a = this._children;
		for (var b, c = a ? a.length : 0, d = 0; d < c; d++) b = a[d], b instanceof cc.Sprite && b.setDirtyRecursively(!0)
	},
	setNodeDirty: function(a) {
		cc.Node.prototype.setNodeDirty.call(this);
		a || !this._batchNode || this._recursiveDirty || (this._hasChildren ? this.setDirtyRecursively(!0) : this.dirty = this._recursiveDirty = !0)
	},
	ignoreAnchorPointForPosition: function(a) {
		this._batchNode ? cc.log(cc._LogInfos.Sprite_ignoreAnchorPointForPosition) : cc.Node.prototype.ignoreAnchorPointForPosition.call(this, a)
	},
	setFlippedX: function(a) {
		this._flippedX != a && (this._flippedX = a, this.setTextureRect(this._rect, this._rectRotated, this._contentSize), this.setNodeDirty(!0))
	},
	setFlippedY: function(a) {
		this._flippedY != a && (this._flippedY = a, this.setTextureRect(this._rect, this._rectRotated, this._contentSize), this.setNodeDirty(!0))
	},
	isFlippedX: function() {
		return this._flippedX
	},
	isFlippedY: function() {
		return this._flippedY
	},
	setOpacityModifyRGB: null,
	isOpacityModifyRGB: function() {
		return this._opacityModifyRGB
	},
	updateDisplayedOpacity: null,
	setDisplayFrameWithAnimationName: function(a, b) {
		cc.assert(a, cc._LogInfos.Sprite_setDisplayFrameWithAnimationName_3);
		var c = cc.animationCache.getAnimation(a);
		c ? (c = c.getFrames()[b]) ? this.setSpriteFrame(c.getSpriteFrame()) : cc.log(cc._LogInfos.Sprite_setDisplayFrameWithAnimationName_2) : cc.log(cc._LogInfos.Sprite_setDisplayFrameWithAnimationName)
	},
	getBatchNode: function() {
		return this._batchNode
	},
	_setReorderChildDirtyRecursively: function() {
		if (!this._reorderChildDirty) {
			this._reorderChildDirty = !0;
			for (var a = this._parent; a && a != this._batchNode;) a._setReorderChildDirtyRecursively(), a = a.parent
		}
	},
	getTexture: function() {
		return this._texture
	},
	_quad: null,
	_quadWebBuffer: null,
	_quadDirty: !1,
	_colorized: !1,
	_blendFuncStr: "source",
	_originalTexture: null,
	_textureRect_Canvas: null,
	_drawSize_Canvas: null,
	ctor: null,
	_softInit: function(a, b, c) {
		if (void 0 === a) cc.Sprite.prototype.init.call(this);
		else if (cc.isString(a)) "#" === a[0] ? (a = a.substr(1, a.length - 1), a = cc.spriteFrameCache.getSpriteFrame(a), this.initWithSpriteFrame(a)) : cc.Sprite.prototype.init.call(this, a, b);
		else if (cc.isObject(a))
			if (a instanceof cc.Texture2D) this.initWithTexture(a, b, c);
			else if (a instanceof cc.SpriteFrame) this.initWithSpriteFrame(a);
		else if (a instanceof HTMLImageElement || a instanceof HTMLCanvasElement) b = new cc.Texture2D, b.initWithElement(a), b.handleLoadedTexture(), this.initWithTexture(b)
	},
	getQuad: function() {
		return this._quad
	},
	setBlendFunc: null,
	init: null,
	initWithFile: function(a, b) {
		cc.assert(a, cc._LogInfos.Sprite_initWithFile);
		var c = cc.textureCache.getTextureForKey(a);
		if (c) {
			if (!b) {
				var d = c.getContentSize();
				b = cc.rect(0, 0, d.width, d.height)
			}
			return this.initWithTexture(c, b)
		}
		c = cc.textureCache.addImage(a);
		return this.initWithTexture(c, b || cc.rect(0, 0, c._contentSize.width, c._contentSize.height))
	},
	initWithTexture: null,
	_textureLoadedCallback: null,
	setTextureRect: null,
	updateTransform: null,
	addChild: null,
	updateColor: function() {
		var a = this._displayedColor,
			b = this._displayedOpacity,
			a = {
				r: a.r,
				g: a.g,
				b: a.b,
				a: b
			};
		this._opacityModifyRGB && (a.r *= b / 255, a.g *= b / 255, a.b *= b / 255);
		b = this._quad;
		b.bl.colors = a;
		b.br.colors = a;
		b.tl.colors = a;
		b.tr.colors = a;
		this._batchNode && (this.atlasIndex != cc.Sprite.INDEX_NOT_INITIALIZED ? this.textureAtlas.updateQuad(b, this.atlasIndex) : this.dirty = !0);
		this._quadDirty = !0
	},
	setOpacity: null,
	setColor: null,
	updateDisplayedColor: null,
	setSpriteFrame: null,
	setDisplayFrame: function(a) {
		cc.log(cc._LogInfos.Sprite_setDisplayFrame);
		this.setSpriteFrame(a)
	},
	isFrameDisplayed: null,
	displayFrame: function() {
		return cc.SpriteFrame.create(this._texture, cc.rectPointsToPixels(this._rect), this._rectRotated, cc.pointPointsToPixels(this._unflippedOffsetPositionFromCenter), cc.sizePointsToPixels(this._contentSize))
	},
	setBatchNode: null,
	setTexture: null,
	_updateBlendFunc: function() {
		this._batchNode ? cc.log(cc._LogInfos.Sprite__updateBlendFunc) : this._texture && this._texture.hasPremultipliedAlpha() ? (this._blendFunc.src = cc.BLEND_SRC, this._blendFunc.dst = cc.BLEND_DST, this.opacityModifyRGB = !0) : (this._blendFunc.src = cc.SRC_ALPHA, this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA, this.opacityModifyRGB = !1)
	},
	_changeTextureColor: function() {
		var a, b = this._texture,
			c = this._textureRect_Canvas;
		b && c.validRect && this._originalTexture && (a = b.getHtmlElementObj()) && (this._colorized = !0, a instanceof HTMLCanvasElement && !this._rectRotated && !this._newTextureWhenChangeColor && this._originalTexture._htmlElementObj != a ? cc.generateTintImageWithMultiply(this._originalTexture._htmlElementObj, this._displayedColor, c, a) : (a = cc.generateTintImageWithMultiply(this._originalTexture._htmlElementObj, this._displayedColor, c), b = new cc.Texture2D, b.initWithElement(a), b.handleLoadedTexture(), this.texture = b))
	},
	_setTextureCoords: function(a) {
		a = cc.rectPointsToPixels(a);
		var b = this._batchNode ? this.textureAtlas.texture : this._texture;
		if (b) {
			var c = b.pixelsWidth,
				d = b.pixelsHeight,
				e, f = this._quad;
			this._rectRotated ? (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (b = (2 * a.x + 1) / (2 * c), c = b + (2 * a.height - 2) / (2 * c), e = (2 * a.y + 1) / (2 * d), a = e + (2 * a.width - 2) / (2 * d)) : (b = a.x / c, c = (a.x + a.height) / c, e = a.y / d, a = (a.y + a.width) / d), this._flippedX && (d = e, e = a, a = d), this._flippedY && (d = b, b = c, c = d), f.bl.texCoords.u = b, f.bl.texCoords.v = e, f.br.texCoords.u = b, f.br.texCoords.v = a, f.tl.texCoords.u = c, f.tl.texCoords.v = e, f.tr.texCoords.u = c, f.tr.texCoords.v = a) : (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (b = (2 * a.x + 1) / (2 * c), c = b + (2 * a.width - 2) / (2 * c), e = (2 * a.y + 1) / (2 * d), a = e + (2 * a.height - 2) / (2 * d)) : (b = a.x / c, c = (a.x + a.width) / c, e = a.y / d, a = (a.y + a.height) / d), this._flippedX && (d = b, b = c, c = d), this._flippedY && (d = e, e = a, a = d), f.bl.texCoords.u = b, f.bl.texCoords.v = a, f.br.texCoords.u = c, f.br.texCoords.v = a, f.tl.texCoords.u = b, f.tl.texCoords.v = e, f.tr.texCoords.u = c, f.tr.texCoords.v = e);
			this._quadDirty = !0
		}
	},
	draw: null
});
cc.Sprite.create = function(a, b, c) {
	return new cc.Sprite(a, b, c)
};
cc.Sprite.createWithTexture = cc.Sprite.create;
cc.Sprite.createWithSpriteFrameName = cc.Sprite.create;
cc.Sprite.createWithSpriteFrame = cc.Sprite.create;
cc.Sprite.INDEX_NOT_INITIALIZED = -1;
cc._renderType === cc._RENDER_TYPE_CANVAS ? (_p = cc.Sprite.prototype, _p._spriteFrameLoadedCallback = function(a) {
	this.setNodeDirty(!0);
	this.setTextureRect(a.getRect(), a.isRotated(), a.getOriginalSize());
	a = this.color;
	255 === a.r && 255 === a.g && 255 === a.b || this._changeTextureColor();
	this._callLoadedEventCallbacks()
}, _p.setOpacityModifyRGB = function(a) {
	this._opacityModifyRGB !== a && (this._opacityModifyRGB = a, this.setNodeDirty(!0))
}, _p.updateDisplayedOpacity = function(a) {
	cc.Node.prototype.updateDisplayedOpacity.call(this, a);
	this._setNodeDirtyForCache()
}, _p.ctor = function(a, b, c) {
	cc.Node.prototype.ctor.call(this);
	this._shouldBeHidden = !1;
	this._offsetPosition = cc.p(0, 0);
	this._unflippedOffsetPositionFromCenter = cc.p(0, 0);
	this._blendFunc = {
		src: cc.BLEND_SRC,
		dst: cc.BLEND_DST
	};
	this._rect = cc.rect(0, 0, 0, 0);
	this._newTextureWhenChangeColor = !1;
	this._textureLoaded = !0;
	this._textureRect_Canvas = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		validRect: !1
	};
	this._drawSize_Canvas = cc.size(0, 0);
	this._softInit(a, b, c)
}, _p.setBlendFunc = function(a, b) {
	var c = this._blendFunc;
	void 0 === b ? (c.src = a.src, c.dst = a.dst) : (c.src = a, c.dst = b);
	cc._renderType === cc._RENDER_TYPE_CANVAS && (this._blendFuncStr = cc._getCompositeOperationByBlendFunc(c))
}, _p.init = function() {
	if (0 < arguments.length) return this.initWithFile(arguments[0], arguments[1]);
	cc.Node.prototype.init.call(this);
	this.dirty = this._recursiveDirty = !1;
	this._opacityModifyRGB = !0;
	this._blendFunc.src = cc.BLEND_SRC;
	this._blendFunc.dst = cc.BLEND_DST;
	this.texture = null;
	this._textureLoaded = !0;
	this._flippedX = this._flippedY = !1;
	this.anchorY = this.anchorX = 0.5;
	this._offsetPosition.x = 0;
	this._offsetPosition.y = 0;
	this._hasChildren = !1;
	this.setTextureRect(cc.rect(0, 0, 0, 0), !1, cc.size(0, 0));
	return !0
}, _p.initWithTexture = function(a, b, c) {
	cc.assert(0 != arguments.length, cc._LogInfos.CCSpriteBatchNode_initWithTexture);
	if ((c = c || !1) && a.isLoaded()) {
		var d = a.getHtmlElementObj(),
			d = cc.cutRotateImageToCanvas(d, b),
			e = new cc.Texture2D;
		e.initWithElement(d);
		e.handleLoadedTexture();
		a = e;
		this._rect = cc.rect(0, 0, b.width, b.height)
	}
	if (!cc.Node.prototype.init.call(this)) return !1;
	this._batchNode = null;
	this.dirty = this._recursiveDirty = !1;
	this._opacityModifyRGB = !0;
	this._blendFunc.src = cc.BLEND_SRC;
	this._blendFunc.dst = cc.BLEND_DST;
	this._flippedX = this._flippedY = !1;
	this.anchorY = this.anchorX = 0.5;
	this._offsetPosition.x = 0;
	this._offsetPosition.y = 0;
	this._hasChildren = !1;
	this._textureLoaded = d = a.isLoaded();
	if (!d) return this._rectRotated = c, b && (this._rect.x = b.x, this._rect.y = b.y, this._rect.width = b.width, this._rect.height = b.height), this.texture && this.texture.removeLoadedEventListener(this), a.addLoadedEventListener(this._textureLoadedCallback, this), this.texture = a, !0;
	b || (b = cc.rect(0, 0, a.width, a.height));
	a && a.url && (d = b.y + b.height, b.x + b.width > a.width && cc.error(cc._LogInfos.RectWidth, a.url), d > a.height && cc.error(cc._LogInfos.RectHeight, a.url));
	this.texture = this._originalTexture = a;
	this.setTextureRect(b, c);
	this.batchNode = null;
	return !0
}, _p._textureLoadedCallback = function(a) {
	if (!this._textureLoaded) {
		this._textureLoaded = !0;
		var b = this._rect;
		b ? cc._rectEqualToZero(b) && (b.width = a.width, b.height = a.height) : b = cc.rect(0, 0, a.width, a.height);
		this.texture = this._originalTexture = a;
		this.setTextureRect(b, this._rectRotated);
		a = this._displayedColor;
		255 == a.r && 255 == a.g && 255 == a.b || this._changeTextureColor();
		this.batchNode = this._batchNode;
		this._callLoadedEventCallbacks()
	}
}, _p.setTextureRect = function(a, b, c) {
	this._rectRotated = b || !1;
	this.setContentSize(c || a);
	this.setVertexRect(a);
	b = this._textureRect_Canvas;
	c = cc.contentScaleFactor();
	b.x = 0 | a.x * c;
	b.y = 0 | a.y * c;
	b.width = 0 | a.width * c;
	b.height = 0 | a.height * c;
	b.validRect = !(0 === b.width || 0 === b.height || 0 > b.x || 0 > b.y);
	a = this._unflippedOffsetPositionFromCenter;
	this._flippedX && (a.x = -a.x);
	this._flippedY && (a.y = -a.y);
	this._offsetPosition.x = a.x + (this._contentSize.width - this._rect.width) / 2;
	this._offsetPosition.y = a.y + (this._contentSize.height - this._rect.height) / 2;
	this._batchNode && (this.dirty = !0)
}, _p.updateTransform = function() {
	if (this.dirty) {
		var a = this._parent;
		!this._visible || a && a != this._batchNode && a._shouldBeHidden ? this._shouldBeHidden = !0 : (this._shouldBeHidden = !1, this._transformToBatch = a && a != this._batchNode ? cc.affineTransformConcat(this.nodeToParentTransform(), a._transformToBatch) : this.nodeToParentTransform());
		this.dirty = this._recursiveDirty = !1
	}
	this._hasChildren && this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.updateTransform)
}, _p.addChild = function(a, b, c) {
	cc.assert(a, cc._LogInfos.CCSpriteBatchNode_addChild_2);
	null == b && (b = a._localZOrder);
	null == c && (c = a.tag);
	cc.Node.prototype.addChild.call(this, a, b, c);
	this._hasChildren = !0
}, _p.setOpacity = function(a) {
	cc.Node.prototype.setOpacity.call(this, a);
	this._setNodeDirtyForCache()
}, _p.setColor = function(a) {
	var b = this.color;
	this._oldDisplayColor = b;
	b.r === a.r && b.g === a.g && b.b === a.b || cc.Node.prototype.setColor.call(this, a)
}, _p.updateDisplayedColor = function(a) {
	cc.Node.prototype.updateDisplayedColor.call(this, a);
	a = this._oldDisplayColor;
	var b = this._displayedColor;
	if (a.r !== b.r || a.g !== b.g || a.b !== b.b) this._changeTextureColor(), this._setNodeDirtyForCache()
}, _p.setSpriteFrame = function(a) {
	var b = this;
	cc.isString(a) && (a = cc.spriteFrameCache.getSpriteFrame(a), cc.assert(a, cc._LogInfos.CCSpriteBatchNode_setSpriteFrame));
	b.setNodeDirty(!0);
	var c = a.getOffset();
	b._unflippedOffsetPositionFromCenter.x = c.x;
	b._unflippedOffsetPositionFromCenter.y = c.y;
	b._rectRotated = a.isRotated();
	var c = a.getTexture(),
		d = a.textureLoaded();
	d || (b._textureLoaded = !1, a.addLoadedEventListener(function(a) {
		b._textureLoaded = !0;
		var c = a.getTexture();
		c != b._texture && (b.texture = c);
		b.setTextureRect(a.getRect(), a.isRotated(), a.getOriginalSize());
		b._callLoadedEventCallbacks()
	}, b));
	c != b._texture && (b.texture = c);
	b._rectRotated && (b._originalTexture = c);
	b.setTextureRect(a.getRect(), b._rectRotated, a.getOriginalSize());
	b._colorized = !1;
	d && (a = b.color, 255 === a.r && 255 === a.g && 255 === a.b || b._changeTextureColor())
}, _p.isFrameDisplayed = function(a) {
	return a.getTexture() != this._texture ? !1 : cc.rectEqualToRect(a.getRect(), this._rect)
}, _p.setBatchNode = function(a) {
	(this._batchNode = a) ? (this._transformToBatch = cc.affineTransformIdentity(), this.textureAtlas = this._batchNode.textureAtlas) : (this.atlasIndex = cc.Sprite.INDEX_NOT_INITIALIZED, this.textureAtlas = null, this.dirty = this._recursiveDirty = !1)
}, _p.setTexture = function(a) {
	a && cc.isString(a) ? (a = cc.textureCache.addImage(a), this.setTexture(a), a = a.getContentSize(), this.setTextureRect(cc.rect(0, 0, a.width, a.height))) : (cc.assert(!a || a instanceof cc.Texture2D, cc._LogInfos.CCSpriteBatchNode_setTexture), this._texture != a && (a && a.getHtmlElementObj() instanceof HTMLImageElement && (this._originalTexture = a), this._texture = a))
}, _p.draw = function(a) {
	if (this._textureLoaded) {
		a = a || cc._renderContext;
		"source" != this._blendFuncStr && (a.globalCompositeOperation = this._blendFuncStr);
		var b = cc.view.getScaleX(),
			c = cc.view.getScaleY();
		a.globalAlpha = this._displayedOpacity / 255;
		var d = this._rect,
			e = this._contentSize,
			f = this._offsetPosition,
			g = this._drawSize_Canvas,
			h = 0 | f.x,
			k = -f.y - d.height,
			m = this._textureRect_Canvas;
		g.width = d.width * b;
		g.height = d.height * c;
		if (this._flippedX || this._flippedY) a.save(), this._flippedX && (h = -f.x - d.width, a.scale(-1, 1)), this._flippedY && (k = f.y, a.scale(1, -1));
		h *= b;
		k *= c;
		this._texture && m.validRect ? (e = this._texture.getHtmlElementObj(), this._colorized ? a.drawImage(e, 0, 0, m.width, m.height, h, k, g.width, g.height) : a.drawImage(e, m.x, m.y, m.width, m.height, h, k, g.width, g.height)) : !this._texture && m.validRect && (g = this.color, a.fillStyle = "rgba(" + g.r + "," + g.g + "," + g.b + ",1)", a.fillRect(h, k, e.width * b, e.height * c));
		1 === cc.SPRITE_DEBUG_DRAW || this._showNode ? (a.strokeStyle = "rgba(0,255,0,1)", h /= b, k = -(k / c), h = [cc.p(h, k), cc.p(h + d.width, k), cc.p(h + d.width, k - d.height), cc.p(h, k - d.height)], cc._drawingUtil.drawPoly(h, 4, !0)) : 2 === cc.SPRITE_DEBUG_DRAW && (a.strokeStyle = "rgba(0,255,0,1)", b = this._rect, k = -k, h = [cc.p(h, k), cc.p(h + b.width, k), cc.p(h + b.width, k - b.height), cc.p(h, k - b.height)], cc._drawingUtil.drawPoly(h, 4, !0));
		(this._flippedX || this._flippedY) && a.restore();
		cc.g_NumberOfDraws++
	}
}, cc.sys._supportCanvasNewBlendModes || (_p._changeTextureColor = function() {
	var a, b = this._texture,
		c = this._textureRect_Canvas;
	b && c.validRect && this._originalTexture && (a = b.getHtmlElementObj()) && (b = cc.textureCache.getTextureColors(this._originalTexture.getHtmlElementObj())) && (this._colorized = !0, a instanceof HTMLCanvasElement && !this._rectRotated && !this._newTextureWhenChangeColor ? cc.generateTintImage(a, b, this._displayedColor, c, a) : (a = cc.generateTintImage(a, b, this._displayedColor, c), b = new cc.Texture2D, b.initWithElement(a), b.handleLoadedTexture(), this.texture = b))
}), delete _p) : (cc.assert(cc.isFunction(cc._tmp.WebGLSprite), cc._LogInfos.MissingFile, "SpritesWebGL.js"), cc._tmp.WebGLSprite(), delete cc._tmp.WebGLSprite);
cc.assert(cc.isFunction(cc._tmp.PrototypeSprite), cc._LogInfos.MissingFile, "SpritesPropertyDefine.js");
cc._tmp.PrototypeSprite();
delete cc._tmp.PrototypeSprite;
cc.DEFAULT_SPRITE_BATCH_CAPACITY = 29;
cc.SpriteBatchNode = cc.Node.extend({
	textureAtlas: null,
	_blendFunc: null,
	_descendants: null,
	_className: "SpriteBatchNode",
	addSpriteWithoutQuad: function(a, b, c) {
		cc.assert(a, cc._LogInfos.SpriteBatchNode_addSpriteWithoutQuad_2);
		if (!(a instanceof cc.Sprite)) return cc.log(cc._LogInfos.SpriteBatchNode_addSpriteWithoutQuad), null;
		a.atlasIndex = b;
		var d = 0,
			e = this._descendants;
		if (e && 0 < e.length)
			for (var f = 0; f < e.length; f++) {
				var g = e[f];
				g && g.atlasIndex >= b && ++d
			}
		e.splice(d, 0, a);
		cc.Node.prototype.addChild.call(this, a, b, c);
		this.reorderBatch(!1);
		return this
	},
	getTextureAtlas: function() {
		return this.textureAtlas
	},
	setTextureAtlas: function(a) {
		a != this.textureAtlas && (this.textureAtlas = a)
	},
	getDescendants: function() {
		return this._descendants
	},
	initWithFile: function(a, b) {
		var c = cc.textureCache.getTextureForKey(a);
		c || (c = cc.textureCache.addImage(a));
		return this.initWithTexture(c, b)
	},
	_setNodeDirtyForCache: function() {
		this._cacheDirty = !0
	},
	init: function(a, b) {
		var c = cc.textureCache.getTextureForKey(a);
		c || (c = cc.textureCache.addImage(a));
		return this.initWithTexture(c, b)
	},
	increaseAtlasCapacity: function() {
		var a = this.textureAtlas.capacity,
			b = Math.floor(4 * (a + 1) / 3);
		cc.log(cc._LogInfos.SpriteBatchNode_increaseAtlasCapacity, a, b);
		this.textureAtlas.resizeCapacity(b) || cc.log(cc._LogInfos.SpriteBatchNode_increaseAtlasCapacity_2)
	},
	removeChildAtIndex: function(a, b) {
		this.removeChild(this._children[a], b)
	},
	rebuildIndexInOrder: function(a, b) {
		var c = a.children;
		if (c && 0 < c.length)
			for (var d = 0; d < c.length; d++) {
				var e = c[d];
				e && 0 > e.zIndex && (b = this.rebuildIndexInOrder(e, b))
			}!a == this && (a.atlasIndex = b, b++);
		if (c && 0 < c.length)
			for (d = 0; d < c.length; d++)(e = c[d]) && 0 <= e.zIndex && (b = this.rebuildIndexInOrder(e, b));
		return b
	},
	highestAtlasIndexInChild: function(a) {
		var b = a.children;
		return b && 0 != b.length ? this.highestAtlasIndexInChild(b[b.length - 1]) : a.atlasIndex
	},
	lowestAtlasIndexInChild: function(a) {
		var b = a.children;
		return b && 0 != b.length ? this.lowestAtlasIndexInChild(b[b.length - 1]) : a.atlasIndex
	},
	atlasIndexForChild: function(a, b) {
		var c = a.parent,
			d = c.children,
			e = d.indexOf(a),
			f = null;
		0 < e && e < cc.UINT_MAX && (f = d[e - 1]);
		return c == this ? 0 == e ? 0 : this.highestAtlasIndexInChild(f) + 1 : 0 == e ? 0 > b ? c.atlasIndex : c.atlasIndex + 1 : 0 > f.zIndex && 0 > b || 0 <= f.zIndex && 0 <= b ? this.highestAtlasIndexInChild(f) + 1 : c.atlasIndex + 1
	},
	reorderBatch: function(a) {
		this._reorderChildDirty = a
	},
	setBlendFunc: function(a, b) {
		this._blendFunc = void 0 === b ? a : {
			src: a,
			dst: b
		}
	},
	getBlendFunc: function() {
		return this._blendFunc
	},
	reorderChild: function(a, b) {
		cc.assert(a, cc._LogInfos.SpriteBatchNode_reorderChild_2); - 1 === this._children.indexOf(a) ? cc.log(cc._LogInfos.SpriteBatchNode_reorderChild) : b !== a.zIndex && (cc.Node.prototype.reorderChild.call(this, a, b), this.setNodeDirty())
	},
	removeChild: function(a, b) {
		null != a && (-1 === this._children.indexOf(a) ? cc.log(cc._LogInfos.SpriteBatchNode_removeChild) : (this.removeSpriteFromAtlas(a), cc.Node.prototype.removeChild.call(this, a, b)))
	},
	_mvpMatrix: null,
	_textureForCanvas: null,
	_useCache: !1,
	_originalTexture: null,
	ctor: null,
	_ctorForCanvas: function(a, b) {
		cc.Node.prototype.ctor.call(this);
		var c;
		b = b || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
		cc.isString(a) ? (c = cc.textureCache.getTextureForKey(a)) || (c = cc.textureCache.addImage(a)) : a instanceof cc.Texture2D && (c = a);
		c && this.initWithTexture(c, b)
	},
	_ctorForWebGL: function(a, b) {
		cc.Node.prototype.ctor.call(this);
		this._mvpMatrix = new cc.kmMat4;
		var c;
		b = b || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
		cc.isString(a) ? (c = cc.textureCache.getTextureForKey(a)) || (c = cc.textureCache.addImage(a)) : a instanceof cc.Texture2D && (c = a);
		c && this.initWithTexture(c, b)
	},
	updateQuadFromSprite: null,
	_updateQuadFromSpriteForCanvas: function(a, b) {
		cc.assert(a, cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite_2);
		a instanceof cc.Sprite ? (a.batchNode = this, a.atlasIndex = b, a.dirty = !0, a.updateTransform()) : cc.log(cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite)
	},
	_updateQuadFromSpriteForWebGL: function(a, b) {
		cc.assert(a, cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite);
		if (a instanceof cc.Sprite) {
			for (var c = this.textureAtlas.capacity; b >= c || c == this.textureAtlas.totalQuads;) this.increaseAtlasCapacity();
			a.batchNode = this;
			a.atlasIndex = b;
			a.dirty = !0;
			a.updateTransform()
		} else cc.log(cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite)
	},
	_swap: function(a, b) {
		var c = this._descendants,
			d = this.textureAtlas,
			e = d.quads,
			f = c[a],
			g = cc.V3F_C4B_T2F_QuadCopy(e[a]);
		c[b].atlasIndex = a;
		c[a] = c[b];
		d.updateQuad(e[b], a);
		c[b] = f;
		d.updateQuad(g, b)
	},
	insertQuadFromSprite: null,
	_insertQuadFromSpriteForCanvas: function(a, b) {
		cc.assert(a, cc._LogInfos.CCSpriteBatchNode_insertQuadFromSprite_2);
		a instanceof cc.Sprite ? (a.batchNode = this, a.atlasIndex = b, a.dirty = !0, a.updateTransform(), a._setCachedParent(this), this._children.splice(b, 0, a)) : cc.log(cc._LogInfos.CCSpriteBatchNode_insertQuadFromSprite)
	},
	_insertQuadFromSpriteForWebGL: function(a, b) {
		cc.assert(a, cc._LogInfos.Sprite_insertQuadFromSprite_2);
		if (a instanceof cc.Sprite) {
			for (var c = this.textureAtlas; b >= c.capacity || c.capacity === c.totalQuads;) this.increaseAtlasCapacity();
			a.batchNode = this;
			a.atlasIndex = b;
			c.insertQuad(a.quad, b);
			a.dirty = !0;
			a.updateTransform()
		} else cc.log(cc._LogInfos.Sprite_insertQuadFromSprite)
	},
	_updateAtlasIndex: function(a, b) {
		var c = 0,
			d = a.children;
		d && (c = d.length);
		var e = 0;
		if (0 === c) e = a.atlasIndex, a.atlasIndex = b, a.arrivalOrder = 0, e != b && this._swap(e, b), b++;
		else {
			e = !0;
			0 <= d[0].zIndex && (e = a.atlasIndex, a.atlasIndex = b, a.arrivalOrder = 0, e != b && this._swap(e, b), b++, e = !1);
			for (c = 0; c < d.length; c++) {
				var f = d[c];
				e && 0 <= f.zIndex && (e = a.atlasIndex, a.atlasIndex = b, a.arrivalOrder = 0, e != b && this._swap(e, b), b++, e = !1);
				b = this._updateAtlasIndex(f, b)
			}
			e && (e = a.atlasIndex, a.atlasIndex = b, a.arrivalOrder = 0, e != b && this._swap(e, b), b++)
		}
		return b
	},
	_updateBlendFunc: function() {
		this.textureAtlas.texture.hasPremultipliedAlpha() || (this._blendFunc.src = cc.SRC_ALPHA, this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA)
	},
	initWithTexture: null,
	_initWithTextureForCanvas: function(a, b) {
		this._children = [];
		this._descendants = [];
		this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
		this._textureForCanvas = this._originalTexture = a;
		return !0
	},
	_initWithTextureForWebGL: function(a, b) {
		this._children = [];
		this._descendants = [];
		this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
		b = b || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
		this.textureAtlas = new cc.TextureAtlas;
		this.textureAtlas.initWithTexture(a, b);
		this._updateBlendFunc();
		this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
		return !0
	},
	insertChild: function(a, b) {
		a.batchNode = this;
		a.atlasIndex = b;
		a.dirty = !0;
		var c = this.textureAtlas;
		c.totalQuads >= c.capacity && this.increaseAtlasCapacity();
		c.insertQuad(a.quad, b);
		this._descendants.splice(b, 0, a);
		var c = b + 1,
			d = this._descendants;
		if (d && 0 < d.length)
			for (; c < d.length; c++) d[c].atlasIndex++;
		var d = a.children,
			e;
		if (d)
			for (c = 0, l = d.length || 0; c < l; c++)
				if (e = d[c]) {
					var f = this.atlasIndexForChild(e, e.zIndex);
					this.insertChild(e, f)
				}
	},
	appendChild: null,
	_appendChildForCanvas: function(a) {
		this._reorderChildDirty = !0;
		a.batchNode = this;
		a.dirty = !0;
		this._descendants.push(a);
		a.atlasIndex = this._descendants.length - 1;
		a = a.children;
		for (var b = 0, c = a.length || 0; b < c; b++) this.appendChild(a[b])
	},
	_appendChildForWebGL: function(a) {
		this._reorderChildDirty = !0;
		a.batchNode = this;
		a.dirty = !0;
		this._descendants.push(a);
		var b = this._descendants.length - 1;
		a.atlasIndex = b;
		var c = this.textureAtlas;
		c.totalQuads == c.capacity && this.increaseAtlasCapacity();
		c.insertQuad(a.quad, b);
		a = a.children;
		b = 0;
		for (c = a.length || 0; b < c; b++) this.appendChild(a[b])
	},
	removeSpriteFromAtlas: null,
	_removeSpriteFromAtlasForCanvas: function(a) {
		a.batchNode = null;
		var b = this._descendants,
			c = b.indexOf(a);
		if (-1 != c) {
			b.splice(c, 1);
			for (var d = b.length; c < d; ++c) b[c].atlasIndex--
		}
		if (a = a.children)
			for (b = 0, c = a.length || 0; b < c; b++) a[b] && this.removeSpriteFromAtlas(a[b])
	},
	_removeSpriteFromAtlasForWebGL: function(a) {
		this.textureAtlas.removeQuadAtIndex(a.atlasIndex);
		a.batchNode = null;
		var b = this._descendants,
			c = b.indexOf(a);
		if (-1 != c) {
			b.splice(c, 1);
			for (var d = b.length; c < d; ++c) b[c].atlasIndex--
		}
		if (a = a.children)
			for (b = 0, c = a.length || 0; b < c; b++) a[b] && this.removeSpriteFromAtlas(a[b])
	},
	getTexture: null,
	_getTextureForCanvas: function() {
		return this._textureForCanvas
	},
	_getTextureForWebGL: function() {
		return this.textureAtlas.texture
	},
	setTexture: null,
	_setTextureForCanvas: function(a) {
		this._textureForCanvas = a;
		for (var b = this._children, c = 0; c < b.length; c++) b[c].texture = a
	},
	_setTextureForWebGL: function(a) {
		this.textureAtlas.texture = a;
		this._updateBlendFunc()
	},
	visit: null,
	_visitForCanvas: function(a) {
		var b = a || cc._renderContext;
		if (this._visible) {
			b.save();
			this.transform(a);
			var c = this._children;
			if (c)
				for (this.sortAllChildren(), a = 0; a < c.length; a++) c[a] && c[a].visit(b);
			b.restore()
		}
	},
	_visitForWebGL: function(a) {
		a = a || cc._renderContext;
		if (this._visible) {
			cc.kmGLPushMatrix();
			var b = this.grid;
			b && b.isActive() && (b.beforeDraw(), this.transformAncestors());
			this.sortAllChildren();
			this.transform(a);
			this.draw(a);
			b && b.isActive() && b.afterDraw(this);
			cc.kmGLPopMatrix();
			this.arrivalOrder = 0
		}
	},
	addChild: null,
	_addChildForCanvas: function(a, b, c) {
		cc.assert(null != a, cc._LogInfos.CCSpriteBatchNode_addChild_3);
		a instanceof cc.Sprite ? (b = null == b ? a.zIndex : b, c = null == c ? a.tag : c, cc.Node.prototype.addChild.call(this, a, b, c), this.appendChild(a), this.setNodeDirty()) : cc.log(cc._LogInfos.CCSpriteBatchNode_addChild)
	},
	_addChildForWebGL: function(a, b, c) {
		cc.assert(null != a, cc._LogInfos.Sprite_addChild_6);
		a instanceof cc.Sprite ? a.texture != this.textureAtlas.texture ? cc.log(cc._LogInfos.Sprite_addChild_5) : (b = null == b ? a.zIndex : b, c = null == c ? a.tag : c, cc.Node.prototype.addChild.call(this, a, b, c), this.appendChild(a), this.setNodeDirty()) : cc.log(cc._LogInfos.Sprite_addChild_4)
	},
	removeAllChildren: null,
	_removeAllChildrenForCanvas: function(a) {
		var b = this._descendants;
		if (b && 0 < b.length)
			for (var c = 0, d = b.length; c < d; c++) b[c] && (b[c].batchNode = null);
		cc.Node.prototype.removeAllChildren.call(this, a);
		this._descendants.length = 0
	},
	_removeAllChildrenForWebGL: function(a) {
		var b = this._descendants;
		if (b && 0 < b.length)
			for (var c = 0, d = b.length; c < d; c++) b[c] && (b[c].batchNode = null);
		cc.Node.prototype.removeAllChildren.call(this, a);
		this._descendants.length = 0;
		this.textureAtlas.removeAllQuads()
	},
	sortAllChildren: null,
	_sortAllChildrenForCanvas: function() {
		if (this._reorderChildDirty) {
			var a, b = 0,
				c = this._children,
				d = c.length,
				e;
			for (a = 1; a < d; a++) {
				var f = c[a],
					b = a - 1;
				for (e = c[b]; 0 <= b && (f._localZOrder < e._localZOrder || f._localZOrder == e._localZOrder && f.arrivalOrder < e.arrivalOrder);) c[b + 1] = e, b -= 1, e = c[b];
				c[b + 1] = f
			}
			0 < c.length && this._arrayMakeObjectsPerformSelector(c, cc.Node._StateCallbackType.sortAllChildren);
			this._reorderChildDirty = !1
		}
	},
	_sortAllChildrenForWebGL: function() {
		if (this._reorderChildDirty) {
			var a = this._children,
				b, c = 0,
				d = a.length,
				e;
			for (b = 1; b < d; b++) {
				var f = a[b],
					c = b - 1;
				for (e = a[c]; 0 <= c && (f._localZOrder < e._localZOrder || f._localZOrder == e._localZOrder && f.arrivalOrder < e.arrivalOrder);) a[c + 1] = e, c -= 1, e = a[c];
				a[c + 1] = f
			}
			if (0 < a.length)
				for (this._arrayMakeObjectsPerformSelector(a, cc.Node._StateCallbackType.sortAllChildren), b = c = 0; b < a.length; b++) c = this._updateAtlasIndex(a[b], c);
			this._reorderChildDirty = !1
		}
	},
	draw: null,
	_drawForWebGL: function() {
		0 !== this.textureAtlas.totalQuads && (this._shaderProgram.use(), this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4(), this._arrayMakeObjectsPerformSelector(this._children, cc.Node._StateCallbackType.updateTransform), cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst), this.textureAtlas.drawQuads())
	}
});
_p = cc.SpriteBatchNode.prototype;
cc._renderType === cc._RENDER_TYPE_WEBGL ? (_p.ctor = _p._ctorForWebGL, _p.updateQuadFromSprite = _p._updateQuadFromSpriteForWebGL, _p.insertQuadFromSprite = _p._insertQuadFromSpriteForWebGL, _p.initWithTexture = _p._initWithTextureForWebGL, _p.appendChild = _p._appendChildForWebGL, _p.removeSpriteFromAtlas = _p._removeSpriteFromAtlasForWebGL, _p.getTexture = _p._getTextureForWebGL, _p.setTexture = _p._setTextureForWebGL, _p.visit = _p._visitForWebGL, _p.addChild = _p._addChildForWebGL, _p.removeAllChildren = _p._removeAllChildrenForWebGL, _p.sortAllChildren = _p._sortAllChildrenForWebGL, _p.draw = _p._drawForWebGL) : (_p.ctor = _p._ctorForCanvas, _p.updateQuadFromSprite = _p._updateQuadFromSpriteForCanvas, _p.insertQuadFromSprite = _p._insertQuadFromSpriteForCanvas, _p.initWithTexture = _p._initWithTextureForCanvas, _p.appendChild = _p._appendChildForCanvas, _p.removeSpriteFromAtlas = _p._removeSpriteFromAtlasForCanvas, _p.getTexture = _p._getTextureForCanvas, _p.setTexture = _p._setTextureForCanvas, _p.visit = _p._visitForCanvas, _p.removeAllChildren = _p._removeAllChildrenForCanvas, _p.addChild = _p._addChildForCanvas, _p.sortAllChildren = _p._sortAllChildrenForCanvas, _p.draw = cc.Node.prototype.draw);
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.defineGetterSetter(_p, "descendants", _p.getDescendants);
cc.SpriteBatchNode.create = function(a, b) {
	return new cc.SpriteBatchNode(a, b)
};
cc.SpriteBatchNode.createWithTexture = cc.SpriteBatchNode.create;
cc.BakeSprite = cc.Sprite.extend({
	_cacheCanvas: null,
	_cacheContext: null,
	ctor: function() {
		cc.Sprite.prototype.ctor.call(this);
		var a = document.createElement("canvas");
		a.width = a.height = 10;
		this._cacheCanvas = a;
		this._cacheContext = a.getContext("2d");
		var b = new cc.Texture2D;
		b.initWithElement(a);
		b.handleLoadedTexture();
		this.setTexture(b)
	},
	getCacheContext: function() {
		return this._cacheContext
	},
	getCacheCanvas: function() {
		return this._cacheCanvas
	},
	resetCanvasSize: function(a, b) {
		void 0 === b && (b = a.height, a = a.width);
		var c = this._cacheCanvas;
		c.width = a;
		c.height = b;
		this.getTexture().handleLoadedTexture();
		this.setTextureRect(cc.rect(0, 0, a, b), !1)
	}
});
cc.AnimationFrame = cc.Class.extend({
	_spriteFrame: null,
	_delayPerUnit: 0,
	_userInfo: null,
	ctor: function(a, b, c) {
		this._spriteFrame = a || null;
		this._delayPerUnit = b || 0;
		this._userInfo = c || null
	},
	clone: function() {
		var a = new cc.AnimationFrame;
		a.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
		return a
	},
	copyWithZone: function(a) {
		return cc.clone(this)
	},
	copy: function(a) {
		a = new cc.AnimationFrame;
		a.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
		return a
	},
	initWithSpriteFrame: function(a, b, c) {
		this._spriteFrame = a;
		this._delayPerUnit = b;
		this._userInfo = c;
		return !0
	},
	getSpriteFrame: function() {
		return this._spriteFrame
	},
	setSpriteFrame: function(a) {
		this._spriteFrame = a
	},
	getDelayUnits: function() {
		return this._delayPerUnit
	},
	setDelayUnits: function(a) {
		this._delayPerUnit = a
	},
	getUserInfo: function() {
		return this._userInfo
	},
	setUserInfo: function(a) {
		this._userInfo = a
	}
});
cc.AnimationFrame.create = function(a, b, c) {
	return new cc.AnimationFrame(a, b, c)
};
cc.Animation = cc.Class.extend({
	_frames: null,
	_loops: 0,
	_restoreOriginalFrame: !1,
	_duration: 0,
	_delayPerUnit: 0,
	_totalDelayUnits: 0,
	ctor: function(a, b, c) {
		this._frames = [];
		if (void 0 === a) this.initWithSpriteFrames(null, 0);
		else {
			var d = a[0];
			d && (d instanceof cc.SpriteFrame ? this.initWithSpriteFrames(a, b, c) : d instanceof cc.AnimationFrame && this.initWithAnimationFrames(a, b, c))
		}
	},
	getFrames: function() {
		return this._frames
	},
	setFrames: function(a) {
		this._frames = a
	},
	addSpriteFrame: function(a) {
		var b = new cc.AnimationFrame;
		b.initWithSpriteFrame(a, 1, null);
		this._frames.push(b);
		this._totalDelayUnits++
	},
	addSpriteFrameWithFile: function(a) {
		a = cc.textureCache.addImage(a);
		var b = cc.rect(0, 0, 0, 0);
		b.width = a.width;
		b.height = a.height;
		a = cc.SpriteFrame.create(a, b);
		this.addSpriteFrame(a)
	},
	addSpriteFrameWithTexture: function(a, b) {
		var c = cc.SpriteFrame.create(a, b);
		this.addSpriteFrame(c)
	},
	initWithAnimationFrames: function(a, b, c) {
		cc.arrayVerifyType(a, cc.AnimationFrame);
		this._delayPerUnit = b;
		this._loops = void 0 === c ? 1 : c;
		this._totalDelayUnits = 0;
		b = this._frames;
		for (c = b.length = 0; c < a.length; c++) {
			var d = a[c];
			b.push(d);
			this._totalDelayUnits += d.getDelayUnits()
		}
		return !0
	},
	clone: function() {
		var a = new cc.Animation;
		a.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
		a.setRestoreOriginalFrame(this._restoreOriginalFrame);
		return a
	},
	copyWithZone: function(a) {
		a = new cc.Animation;
		a.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
		a.setRestoreOriginalFrame(this._restoreOriginalFrame);
		return a
	},
	_copyFrames: function() {
		for (var a = [], b = 0; b < this._frames.length; b++) a.push(this._frames[b].clone());
		return a
	},
	copy: function(a) {
		return this.copyWithZone(null)
	},
	getLoops: function() {
		return this._loops
	},
	setLoops: function(a) {
		this._loops = a
	},
	setRestoreOriginalFrame: function(a) {
		this._restoreOriginalFrame = a
	},
	getRestoreOriginalFrame: function() {
		return this._restoreOriginalFrame
	},
	getDuration: function() {
		return this._totalDelayUnits * this._delayPerUnit
	},
	getDelayPerUnit: function() {
		return this._delayPerUnit
	},
	setDelayPerUnit: function(a) {
		this._delayPerUnit = a
	},
	getTotalDelayUnits: function() {
		return this._totalDelayUnits
	},
	initWithSpriteFrames: function(a, b, c) {
		cc.arrayVerifyType(a, cc.SpriteFrame);
		this._loops = void 0 === c ? 1 : c;
		this._delayPerUnit = b || 0;
		this._totalDelayUnits = 0;
		b = this._frames;
		b.length = 0;
		if (a) {
			for (c = 0; c < a.length; c++) {
				var d = a[c],
					e = new cc.AnimationFrame;
				e.initWithSpriteFrame(d, 1, null);
				b.push(e)
			}
			this._totalDelayUnits += a.length
		}
		return !0
	},
	retain: function() {},
	release: function() {}
});
cc.Animation.create = function(a, b, c) {
	return new cc.Animation(a, b, c)
};
cc.Animation.createWithAnimationFrames = cc.Animation.create;
cc.animationCache = {
	_animations: {},
	addAnimation: function(a, b) {
		this._animations[b] = a
	},
	removeAnimation: function(a) {
		a && this._animations[a] && delete this._animations[a]
	},
	getAnimation: function(a) {
		return this._animations[a] ? this._animations[a] : null
	},
	_addAnimationsWithDictionary: function(a, b) {
		var c = a.animations;
		if (c) {
			var d = 1,
				e = a.properties;
			if (e)
				for (var d = null != e.format ? parseInt(e.format) : d, e = e.spritesheets, f = cc.spriteFrameCache, g = cc.path, h = 0; h < e.length; h++) f.addSpriteFrames(g.changeBasename(b, e[h]));
			switch (d) {
				case 1:
					this._parseVersion1(c);
					break;
				case 2:
					this._parseVersion2(c);
					break;
				default:
					cc.log(cc._LogInfos.animationCache__addAnimationsWithDictionary_2)
			}
		} else cc.log(cc._LogInfos.animationCache__addAnimationsWithDictionary)
	},
	addAnimations: function(a) {
		cc.assert(a, cc._LogInfos.animationCache_addAnimations_2);
		var b = cc.loader.getRes(a);
		b ? this._addAnimationsWithDictionary(b, a) : cc.log(cc._LogInfos.animationCache_addAnimations)
	},
	_parseVersion1: function(a) {
		var b = cc.spriteFrameCache,
			c;
		for (c in a) {
			var d = a[c],
				e = d.frames,
				d = parseFloat(d.delay) || 0,
				f = null;
			if (e) {
				for (var f = [], g = 0; g < e.length; g++) {
					var h = b.getSpriteFrame(e[g]);
					if (h) {
						var k = new cc.AnimationFrame;
						k.initWithSpriteFrame(h, 1, null);
						f.push(k)
					} else cc.log(cc._LogInfos.animationCache__parseVersion1_2, c, e[g])
				}
				0 === f.length ? cc.log(cc._LogInfos.animationCache__parseVersion1_3, c) : (f.length != e.length && cc.log(cc._LogInfos.animationCache__parseVersion1_4, c), f = cc.Animation.create(f, d, 1), cc.animationCache.addAnimation(f, c))
			} else cc.log(cc._LogInfos.animationCache__parseVersion1, c)
		}
	},
	_parseVersion2: function(a) {
		var b = cc.spriteFrameCache,
			c;
		for (c in a) {
			var d = a[c],
				e = d.loop,
				f = parseInt(d.loops),
				e = e ? cc.REPEAT_FOREVER : isNaN(f) ? 1 : f,
				f = d.restoreOriginalFrame && !0 == d.restoreOriginalFrame ? !0 : !1,
				g = d.frames;
			if (g) {
				for (var h = [], k = 0; k < g.length; k++) {
					var m = g[k],
						n = m.spriteframe,
						q = b.getSpriteFrame(n);
					if (q) {
						var n = parseFloat(m.delayUnits) || 0,
							m = m.notification,
							s = new cc.AnimationFrame;
						s.initWithSpriteFrame(q, n, m);
						h.push(s)
					} else cc.log(cc._LogInfos.animationCache__parseVersion2_2, c, n)
				}
				d = parseFloat(d.delayPerUnit) || 0;
				g = new cc.Animation;
				g.initWithAnimationFrames(h, d, e);
				g.setRestoreOriginalFrame(f);
				cc.animationCache.addAnimation(g, c)
			} else cc.log(cc._LogInfos.animationCache__parseVersion2, c)
		}
	},
	_clear: function() {
		this._animations = {}
	}
};
cc.SpriteFrame = cc.Class.extend({
	_offset: null,
	_originalSize: null,
	_rectInPixels: null,
	_rotated: !1,
	_rect: null,
	_offsetInPixels: null,
	_originalSizeInPixels: null,
	_texture: null,
	_textureFilename: "",
	_textureLoaded: !1,
	_eventListeners: null,
	ctor: function(a, b, c, d, e) {
		this._offset = cc.p(0, 0);
		this._offsetInPixels = cc.p(0, 0);
		this._originalSize = cc.size(0, 0);
		this._rotated = !1;
		this._originalSizeInPixels = cc.size(0, 0);
		this._textureFilename = "";
		this._texture = null;
		this._textureLoaded = !1;
		void 0 !== a && void 0 !== b && (void 0 === c || void 0 === d || void 0 === e ? this.initWithTexture(a, b) : this.initWithTexture(a, b, c, d, e))
	},
	textureLoaded: function() {
		return this._textureLoaded
	},
	addLoadedEventListener: function(a, b) {
		null == this._eventListeners && (this._eventListeners = []);
		this._eventListeners.push({
			eventCallback: a,
			eventTarget: b
		})
	},
	_callLoadedEventCallbacks: function() {
		var a = this._eventListeners;
		if (a) {
			for (var b = 0, c = a.length; b < c; b++) {
				var d = a[b];
				d.eventCallback.call(d.eventTarget, this)
			}
			a.length = 0
		}
	},
	getRectInPixels: function() {
		var a = this._rectInPixels;
		return cc.rect(a.x, a.y, a.width, a.height)
	},
	setRectInPixels: function(a) {
		this._rectInPixels || (this._rectInPixels = cc.rect(0, 0, 0, 0));
		this._rectInPixels.x = a.x;
		this._rectInPixels.y = a.y;
		this._rectInPixels.width = a.width;
		this._rectInPixels.height = a.height;
		this._rect = cc.rectPixelsToPoints(a)
	},
	isRotated: function() {
		return this._rotated
	},
	setRotated: function(a) {
		this._rotated = a
	},
	getRect: function() {
		var a = this._rect;
		return cc.rect(a.x, a.y, a.width, a.height)
	},
	setRect: function(a) {
		this._rect || (this._rect = cc.rect(0, 0, 0, 0));
		this._rect.x = a.x;
		this._rect.y = a.y;
		this._rect.width = a.width;
		this._rect.height = a.height;
		this._rectInPixels = cc.rectPointsToPixels(this._rect)
	},
	getOffsetInPixels: function() {
		return cc.p(this._offsetInPixels)
	},
	setOffsetInPixels: function(a) {
		this._offsetInPixels.x = a.x;
		this._offsetInPixels.y = a.y;
		cc._pointPixelsToPointsOut(this._offsetInPixels, this._offset)
	},
	getOriginalSizeInPixels: function() {
		return cc.size(this._originalSizeInPixels)
	},
	setOriginalSizeInPixels: function(a) {
		this._originalSizeInPixels.width = a.width;
		this._originalSizeInPixels.height = a.height
	},
	getOriginalSize: function() {
		return cc.size(this._originalSize)
	},
	setOriginalSize: function(a) {
		this._originalSize.width = a.width;
		this._originalSize.height = a.height
	},
	getTexture: function() {
		if (this._texture) return this._texture;
		if ("" !== this._textureFilename) {
			var a = cc.textureCache.addImage(this._textureFilename);
			a && (this._textureLoaded = a.isLoaded());
			return a
		}
		return null
	},
	setTexture: function(a) {
		if (this._texture != a) {
			var b = a.isLoaded();
			this._textureLoaded = b;
			this._texture = a;
			b || a.addLoadedEventListener(function(a) {
				this._textureLoaded = !0;
				if (this._rotated && cc._renderType === cc._RENDER_TYPE_CANVAS) {
					var b = a.getHtmlElementObj(),
						b = cc.cutRotateImageToCanvas(b, this.getRect()),
						e = new cc.Texture2D;
					e.initWithElement(b);
					e.handleLoadedTexture();
					this.setTexture(e);
					b = this.getRect();
					this.setRect(cc.rect(0, 0, b.width, b.height))
				}
				b = this._rect;
				0 === b.width && 0 === b.height && (b = a.width, a = a.height, this._rect.width = b, this._rect.height = a, this._rectInPixels = cc.rectPointsToPixels(this._rect), this._originalSizeInPixels.width = this._rectInPixels.width, this._originalSizeInPixels.height = this._rectInPixels.height, this._originalSize.width = b, this._originalSize.height = a);
				this._callLoadedEventCallbacks()
			}, this)
		}
	},
	getOffset: function() {
		return cc.p(this._offset)
	},
	setOffset: function(a) {
		this._offset.x = a.x;
		this._offset.y = a.y
	},
	clone: function() {
		var a = new cc.SpriteFrame;
		a.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
		a.setTexture(this._texture);
		return a
	},
	copyWithZone: function() {
		var a = new cc.SpriteFrame;
		a.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
		a.setTexture(this._texture);
		return a
	},
	copy: function() {
		return this.copyWithZone()
	},
	initWithTexture: function(a, b, c, d, e) {
		2 === arguments.length && (b = cc.rectPointsToPixels(b));
		d = d || cc.p(0, 0);
		e = e || b;
		c = c || !1;
		cc.isString(a) ? (this._texture = null, this._textureFilename = a) : a instanceof cc.Texture2D && this.setTexture(a);
		a = this.getTexture();
		this._rectInPixels = b;
		b = this._rect = cc.rectPixelsToPoints(b);
		if (a && a.url && a.isLoaded()) {
			var f, g;
			c ? (f = b.x + b.height, g = b.y + b.width) : (f = b.x + b.width, g = b.y + b.height);
			f > a.getPixelsWide() && cc.error(cc._LogInfos.RectWidth, a.url);
			g > a.getPixelsHigh() && cc.error(cc._LogInfos.RectHeight, a.url)
		}
		this._offsetInPixels.x = d.x;
		this._offsetInPixels.y = d.y;
		cc._pointPixelsToPointsOut(d, this._offset);
		this._originalSizeInPixels.width = e.width;
		this._originalSizeInPixels.height = e.height;
		cc._sizePixelsToPointsOut(e, this._originalSize);
		this._rotated = c;
		return !0
	}
});
cc.SpriteFrame.create = function(a, b, c, d, e) {
	return new cc.SpriteFrame(a, b, c, d, e)
};
cc.SpriteFrame.createWithTexture = cc.SpriteFrame.create;
cc.SpriteFrame._frameWithTextureForCanvas = function(a, b, c, d, e) {
	var f = new cc.SpriteFrame;
	f._texture = a;
	f._rectInPixels = b;
	f._rect = cc.rectPixelsToPoints(b);
	f._offsetInPixels.x = d.x;
	f._offsetInPixels.y = d.y;
	cc._pointPixelsToPointsOut(f._offsetInPixels, f._offset);
	f._originalSizeInPixels.width = e.width;
	f._originalSizeInPixels.height = e.height;
	cc._sizePixelsToPointsOut(f._originalSizeInPixels, f._originalSize);
	f._rotated = c;
	return f
};
cc.spriteFrameCache = {
	_CCNS_REG1: /^\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*$/,
	_CCNS_REG2: /^\s*\{\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*,\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*\}\s*$/,
	_spriteFrames: {},
	_spriteFramesAliases: {},
	_frameConfigCache: {},
	_rectFromString: function(a) {
		return (a = this._CCNS_REG2.exec(a)) ? cc.rect(parseFloat(a[1]), parseFloat(a[2]), parseFloat(a[3]), parseFloat(a[4])) : cc.rect(0, 0, 0, 0)
	},
	_pointFromString: function(a) {
		return (a = this._CCNS_REG1.exec(a)) ? cc.p(parseFloat(a[1]), parseFloat(a[2])) : cc.p(0, 0)
	},
	_sizeFromString: function(a) {
		return (a = this._CCNS_REG1.exec(a)) ? cc.size(parseFloat(a[1]), parseFloat(a[2])) : cc.size(0, 0)
	},
	_getFrameConfig: function(a) {
		var b = cc.loader.getRes(a);
		cc.assert(b, cc._LogInfos.spriteFrameCache__getFrameConfig_2, a);
		cc.loader.release(a);
		if (b._inited) return this._frameConfigCache[a] = b;
		var c = b.frames,
			d = b.metadata || b.meta,
			b = {},
			e = {},
			f = 0;
		d && (f = d.format, f = 1 >= f.length ? parseInt(f) : f, e.image = d.textureFileName || d.textureFileName || d.image);
		for (var g in c) {
			var h = c[g];
			if (h) {
				d = {};
				if (0 == f) {
					d.rect = cc.rect(h.x, h.y, h.width, h.height);
					d.rotated = !1;
					d.offset = cc.p(h.offsetX, h.offsetY);
					var k = h.originalWidth,
						h = h.originalHeight;
					k && h || cc.log(cc._LogInfos.spriteFrameCache__getFrameConfig);
					k = Math.abs(k);
					h = Math.abs(h);
					d.size = cc.size(k, h)
				} else if (1 == f || 2 == f) d.rect = this._rectFromString(h.frame), d.rotated = h.rotated || !1, d.offset = this._pointFromString(h.offset), d.size = this._sizeFromString(h.sourceSize);
				else if (3 == f) {
					var k = this._sizeFromString(h.spriteSize),
						m = this._rectFromString(h.textureRect);
					k && (m = cc.rect(m.x, m.y, k.width, k.height));
					d.rect = m;
					d.rotated = h.textureRotated || !1;
					d.offset = this._pointFromString(h.spriteOffset);
					d.size = this._sizeFromString(h.spriteSourceSize);
					d.aliases = h.aliases
				} else k = h.frame, m = h.sourceSize, g = h.filename || g, d.rect = cc.rect(k.x, k.y, k.w, k.h), d.rotated = h.rotated || !1, d.offset = cc.p(0, 0), d.size = cc.size(m.w, m.h);
				b[g] = d
			}
		}
		return this._frameConfigCache[a] = {
			_inited: !0,
			frames: b,
			meta: e
		}
	},
	addSpriteFrames: function(a, b) {
		cc.assert(a, cc._LogInfos.spriteFrameCache_addSpriteFrames_2);
		var c = this._frameConfigCache[a] || cc.loader.getRes(a);
		if (c && c.frames) {
			var d = this._frameConfigCache[a] || this._getFrameConfig(a),
				c = d.frames,
				d = d.meta;
			b ? b instanceof cc.Texture2D || (cc.isString(b) ? b = cc.textureCache.addImage(b) : cc.assert(0, cc._LogInfos.spriteFrameCache_addSpriteFrames_3)) : (d = cc.path.changeBasename(a, d.image || ".png"), b = cc.textureCache.addImage(d));
			var d = this._spriteFramesAliases,
				e = this._spriteFrames,
				f;
			for (f in c) {
				var g = c[f],
					h = e[f];
				if (!h) {
					h = cc.SpriteFrame.create(b, g.rect, g.rotated, g.offset, g.size);
					if (g = g.aliases)
						for (var k = 0, m = g.length; k < m; k++) {
							var n = g[k];
							d[n] && cc.log(cc._LogInfos.spriteFrameCache_addSpriteFrames, n);
							d[n] = f
						}
					cc._renderType === cc._RENDER_TYPE_CANVAS && h.isRotated() && h.getTexture().isLoaded() && (g = h.getTexture().getHtmlElementObj(), g = cc.cutRotateImageToCanvas(g, h.getRectInPixels()), k = new cc.Texture2D, k.initWithElement(g), k.handleLoadedTexture(), h.setTexture(k), g = h._rect, h.setRect(cc.rect(0, 0, g.width, g.height)));
					e[f] = h
				}
			}
		}
	},
	_checkConflict: function(a) {
		a = a.frames;
		for (var b in a) this._spriteFrames[b] && cc.log(cc._LogInfos.spriteFrameCache__checkConflict, b)
	},
	addSpriteFrame: function(a, b) {
		this._spriteFrames[b] = a
	},
	removeSpriteFrames: function() {
		this._spriteFrames = {};
		this._spriteFramesAliases = {}
	},
	removeSpriteFrameByName: function(a) {
		a && (this._spriteFramesAliases[a] && delete this._spriteFramesAliases[a], this._spriteFrames[a] && delete this._spriteFrames[a])
	},
	removeSpriteFramesFromFile: function(a) {
		var b = this._spriteFrames,
			c = this._spriteFramesAliases;
		if (a = this._frameConfigCache[a]) {
			a = a.frames;
			for (var d in a)
				if (b[d]) {
					delete b[d];
					for (var e in c) c[e] == d && delete c[e]
				}
		}
	},
	removeSpriteFramesFromTexture: function(a) {
		var b = this._spriteFrames,
			c = this._spriteFramesAliases,
			d;
		for (d in b) {
			var e = b[d];
			if (e && e.getTexture() == a) {
				delete b[d];
				for (var f in c) c[f] == d && delete c[f]
			}
		}
	},
	getSpriteFrame: function(a) {
		var b = this._spriteFrames[a];
		if (!b) {
			var c = this._spriteFramesAliases[a];
			c && ((b = this._spriteFrames[c.toString()]) || delete this._spriteFramesAliases[a])
		}
		b || cc.log(cc._LogInfos.spriteFrameCache_getSpriteFrame, a);
		return b
	},
	_clear: function() {
		this._spriteFrames = {};
		this._spriteFramesAliases = {};
		this._frameConfigCache = {}
	}
};
cc.configuration = {
	ERROR: 0,
	STRING: 1,
	INT: 2,
	DOUBLE: 3,
	BOOLEAN: 4,
	_maxTextureSize: 0,
	_maxModelviewStackDepth: 0,
	_supportsPVRTC: !1,
	_supportsNPOT: !1,
	_supportsBGRA8888: !1,
	_supportsDiscardFramebuffer: !1,
	_supportsShareableVAO: !1,
	_maxSamplesAllowed: 0,
	_maxTextureUnits: 0,
	_GlExtensions: "",
	_valueDict: {},
	_inited: !1,
	_init: function() {
		var a = this._valueDict;
		a["cocos2d.x.version"] = cc.ENGINE_VERSION;
		a["cocos2d.x.compiled_with_profiler"] = !1;
		a["cocos2d.x.compiled_with_gl_state_cache"] = cc.ENABLE_GL_STATE_CACHE;
		this._inited = !0
	},
	getMaxTextureSize: function() {
		return this._maxTextureSize
	},
	getMaxModelviewStackDepth: function() {
		return this._maxModelviewStackDepth
	},
	getMaxTextureUnits: function() {
		return this._maxTextureUnits
	},
	supportsNPOT: function() {
		return this._supportsNPOT
	},
	supportsPVRTC: function() {
		return this._supportsPVRTC
	},
	supportsETC: function() {
		return !1
	},
	supportsS3TC: function() {
		return !1
	},
	supportsATITC: function() {
		return !1
	},
	supportsBGRA8888: function() {
		return this._supportsBGRA8888
	},
	supportsDiscardFramebuffer: function() {
		return this._supportsDiscardFramebuffer
	},
	supportsShareableVAO: function() {
		return this._supportsShareableVAO
	},
	checkForGLExtension: function(a) {
		return -1 < this._GlExtensions.indexOf(a)
	},
	getValue: function(a, b) {
		this._inited || this._init();
		var c = this._valueDict;
		return c[a] ? c[a] : b
	},
	setValue: function(a, b) {
		this._valueDict[a] = b
	},
	dumpInfo: function() {
		0 === cc.ENABLE_GL_STATE_CACHE && (cc.log(""), cc.log(cc._LogInfos.configuration_dumpInfo), cc.log(""))
	},
	gatherGPUInfo: function() {
		if (cc._renderType !== cc._RENDER_TYPE_CANVAS) {
			this._inited || this._init();
			var a = cc._renderContext,
				b = this._valueDict;
			b["gl.vendor"] = a.getParameter(a.VENDOR);
			b["gl.renderer"] = a.getParameter(a.RENDERER);
			b["gl.version"] = a.getParameter(a.VERSION);
			this._GlExtensions = "";
			for (var c = a.getSupportedExtensions(), d = 0; d < c.length; d++) this._GlExtensions += c[d] + " ";
			this._maxTextureSize = a.getParameter(a.MAX_TEXTURE_SIZE);
			b["gl.max_texture_size"] = this._maxTextureSize;
			this._maxTextureUnits = a.getParameter(a.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
			b["gl.max_texture_units"] = this._maxTextureUnits;
			this._supportsPVRTC = this.checkForGLExtension("GL_IMG_texture_compression_pvrtc");
			b["gl.supports_PVRTC"] = this._supportsPVRTC;
			this._supportsNPOT = !1;
			b["gl.supports_NPOT"] = this._supportsNPOT;
			this._supportsBGRA8888 = this.checkForGLExtension("GL_IMG_texture_format_BGRA888");
			b["gl.supports_BGRA8888"] = this._supportsBGRA8888;
			this._supportsDiscardFramebuffer = this.checkForGLExtension("GL_EXT_discard_framebuffer");
			b["gl.supports_discard_framebuffer"] = this._supportsDiscardFramebuffer;
			this._supportsShareableVAO = this.checkForGLExtension("vertex_array_object");
			b["gl.supports_vertex_array_object"] = this._supportsShareableVAO;
			cc.checkGLErrorDebug()
		}
	},
	loadConfigFile: function(a) {
		this._inited || this._init();
		var b = cc.loader.getRes(a);
		if (!b) throw "Please load the resource first : " + a;
		cc.assert(b, cc._LogInfos.configuration_loadConfigFile_2, a);
		if (b = b.data)
			for (var c in b) this._valueDict[c] = b[c];
		else cc.log(cc._LogInfos.configuration_loadConfigFile, a)
	}
};
cc._tmp.DirectorWebGL = function() {
	cc.DirectorDelegate = cc.Class.extend({
		updateProjection: function() {}
	});
	var a = cc.Director.prototype;
	a.setProjection = function(a) {
		var c = this._winSizeInPoints;
		this.setViewport();
		var d = this._openGLView,
			e = d._viewPortRect.x / d._scaleX,
			f = d._viewPortRect.y / d._scaleY;
		switch (a) {
			case cc.Director.PROJECTION_2D:
				cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
				cc.kmGLLoadIdentity();
				d = new cc.kmMat4;
				cc.kmMat4OrthographicProjection(d, 0, c.width, 0, c.height, -1024, 1024);
				cc.kmGLMultMatrix(d);
				cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
				cc.kmGLLoadIdentity();
				break;
			case cc.Director.PROJECTION_3D:
				var g = this.getZEye(),
					h = new cc.kmMat4,
					d = new cc.kmMat4;
				cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
				cc.kmGLLoadIdentity();
				cc.kmMat4PerspectiveProjection(h, 60, c.width / c.height, 0.1, 2 * g);
				cc.kmGLMultMatrix(h);
				cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
				cc.kmGLLoadIdentity();
				g = cc.kmVec3Fill(null, -e + c.width / 2, -f + c.height / 2, g);
				c = cc.kmVec3Fill(null, -e + c.width / 2, -f + c.height / 2, 0);
				e = cc.kmVec3Fill(null, 0, 1, 0);
				cc.kmMat4LookAt(d, g, c, e);
				cc.kmGLMultMatrix(d);
				break;
			case cc.Director.PROJECTION_CUSTOM:
				this._projectionDelegate && this._projectionDelegate.updateProjection();
				break;
			default:
				cc.log(cc._LogInfos.Director_setProjection)
		}
		this._projection = a;
		cc.eventManager.dispatchEvent(this._eventProjectionChanged);
		cc.setProjectionMatrixDirty()
	};
	a.setDepthTest = function(a) {
		var c = cc._renderContext;
		a ? (c.clearDepth(1), c.enable(c.DEPTH_TEST), c.depthFunc(c.LEQUAL)) : c.disable(c.DEPTH_TEST)
	};
	a.setOpenGLView = function(a) {
		this._winSizeInPoints.width = cc._canvas.width;
		this._winSizeInPoints.height = cc._canvas.height;
		this._openGLView = a || cc.view;
		a = cc.configuration;
		a.gatherGPUInfo();
		a.dumpInfo();
		this._createStatsLabel();
		this.setGLDefaultValues();
		cc.eventManager && cc.eventManager.setEnabled(!0)
	};
	a._clear = function() {
		var a = cc._renderContext;
		a.clear(a.COLOR_BUFFER_BIT | a.DEPTH_BUFFER_BIT)
	};
	a._beforeVisitScene = function() {
		cc.kmGLPushMatrix()
	};
	a._afterVisitScene = function() {
		cc.kmGLPopMatrix()
	};
	a._createStatsLabel = function() {
		if (!cc.LabelAtlas) this._createStatsLabelForCanvas();
		else if (null != cc.Director._fpsImageLoaded && !1 != cc.Director._fpsImageLoaded) {
			var a = new cc.Texture2D;
			a.initWithElement(cc.Director._fpsImage);
			a.handleLoadedTexture();
			var c = cc.view.getDesignResolutionSize().height / 320;
			0 === c && (c = this._winSizeInPoints.height / 320);
			var d = new cc.LabelAtlas;
			d._setIgnoreContentScaleFactor(!0);
			d.initWithString("00.0", a, 12, 32, ".");
			d.scale = c;
			this._FPSLabel = d;
			d = new cc.LabelAtlas;
			d._setIgnoreContentScaleFactor(!0);
			d.initWithString("0.000", a, 12, 32, ".");
			d.scale = c;
			this._SPFLabel = d;
			d = new cc.LabelAtlas;
			d._setIgnoreContentScaleFactor(!0);
			d.initWithString("000", a, 12, 32, ".");
			d.scale = c;
			this._drawsLabel = d;
			a = cc.DIRECTOR_STATS_POSITION;
			this._drawsLabel.setPosition(a.x, 34 * c + a.y);
			this._SPFLabel.setPosition(a.x, 17 * c + a.y);
			this._FPSLabel.setPosition(a)
		}
	};
	a._createStatsLabelForCanvas = function() {
		var a = 0,
			a = this._winSizeInPoints.width > this._winSizeInPoints.height ? 0 | this._winSizeInPoints.height / 320 * 24 : 0 | this._winSizeInPoints.width / 320 * 24;
		this._FPSLabel = cc.LabelTTF.create("000.0", "Arial", a);
		this._SPFLabel = cc.LabelTTF.create("0.000", "Arial", a);
		this._drawsLabel = cc.LabelTTF.create("0000", "Arial", a);
		a = cc.DIRECTOR_STATS_POSITION;
		this._drawsLabel.setPosition(this._drawsLabel.width / 2 + a.x, 5 * this._drawsLabel.height / 2 + a.y);
		this._SPFLabel.setPosition(this._SPFLabel.width / 2 + a.x, 3 * this._SPFLabel.height / 2 + a.y);
		this._FPSLabel.setPosition(this._FPSLabel.width / 2 + a.x, this._FPSLabel.height / 2 + a.y)
	};
	a.convertToGL = function(a) {
		var c = new cc.kmMat4;
		cc.GLToClipTransform(c);
		var d = new cc.kmMat4;
		cc.kmMat4Inverse(d, c);
		var c = c.mat[14] / c.mat[15],
			e = this._openGLView.getDesignResolutionSize();
		a = new cc.kmVec3(2 * a.x / e.width - 1, 1 - 2 * a.y / e.height, c);
		c = new cc.kmVec3;
		cc.kmVec3TransformCoord(c, a, d);
		return cc.p(c.x, c.y)
	};
	a.convertToUI = function(a) {
		var c = new cc.kmMat4;
		cc.GLToClipTransform(c);
		var d = new cc.kmVec3;
		a = new cc.kmVec3(a.x, a.y, 0);
		cc.kmVec3TransformCoord(d, a, c);
		c = this._openGLView.getDesignResolutionSize();
		return cc.p(c.width * (0.5 * d.x + 0.5), c.height * (0.5 * -d.y + 0.5))
	};
	a.getVisibleSize = function() {
		return this._openGLView.getVisibleSize()
	};
	a.getVisibleOrigin = function() {
		return this._openGLView.getVisibleOrigin()
	};
	a.getZEye = function() {
		return this._winSizeInPoints.height / 1.1566
	};
	a.setViewport = function() {
		var a = this._openGLView;
		if (a) {
			var c = this._winSizeInPoints;
			a.setViewPortInPoints(-a._viewPortRect.x / a._scaleX, -a._viewPortRect.y / a._scaleY, c.width, c.height)
		}
	};
	a.getOpenGLView = function() {
		return this._openGLView
	};
	a.getProjection = function() {
		return this._projection
	};
	a.setAlphaBlending = function(a) {
		a ? cc.glBlendFunc(cc.BLEND_SRC, cc.BLEND_DST) : cc.glBlendFunc(cc._renderContext.ONE, cc._renderContext.ZERO)
	};
	a.setGLDefaultValues = function() {
		this.setAlphaBlending(!0);
		this.setDepthTest(!1);
		this.setProjection(this._projection);
		cc._renderContext.clearColor(0, 0, 0, 1)
	}
};
cc.g_NumberOfDraws = 0;
cc.GLToClipTransform = function(a) {
	var b = new cc.kmMat4;
	cc.kmGLGetMatrix(cc.KM_GL_PROJECTION, b);
	var c = new cc.kmMat4;
	cc.kmGLGetMatrix(cc.KM_GL_MODELVIEW, c);
	cc.kmMat4Multiply(a, b, c)
};
cc.Director = cc.Class.extend({
	_landscape: !1,
	_nextDeltaTimeZero: !1,
	_paused: !1,
	_purgeDirectorInNextLoop: !1,
	_sendCleanupToScene: !1,
	_animationInterval: 0,
	_oldAnimationInterval: 0,
	_projection: 0,
	_accumDt: 0,
	_contentScaleFactor: 1,
	_displayStats: !1,
	_deltaTime: 0,
	_frameRate: 0,
	_FPSLabel: null,
	_SPFLabel: null,
	_drawsLabel: null,
	_winSizeInPoints: null,
	_lastUpdate: null,
	_nextScene: null,
	_notificationNode: null,
	_openGLView: null,
	_scenesStack: null,
	_projectionDelegate: null,
	_runningScene: null,
	_frames: 0,
	_totalFrames: 0,
	_secondsPerFrame: 0,
	_dirtyRegion: null,
	_scheduler: null,
	_actionManager: null,
	_eventProjectionChanged: null,
	_eventAfterDraw: null,
	_eventAfterVisit: null,
	_eventAfterUpdate: null,
	ctor: function() {
		var a = this;
		a._lastUpdate = Date.now();
		cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function() {
			a._lastUpdate = Date.now()
		})
	},
	init: function() {
		this._oldAnimationInterval = this._animationInterval = 1 / cc.defaultFPS;
		this._scenesStack = [];
		this._projection = cc.Director.PROJECTION_DEFAULT;
		this._projectionDelegate = null;
		this._frameRate = this._accumDt = 0;
		this._displayStats = !1;
		this._totalFrames = this._frames = 0;
		this._lastUpdate = Date.now();
		this._purgeDirectorInNextLoop = this._paused = !1;
		this._winSizeInPoints = cc.size(0, 0);
		this._openGLView = null;
		this._contentScaleFactor = 1;
		this._scheduler = new cc.Scheduler;
		this._actionManager = cc.ActionManager ? new cc.ActionManager : null;
		this._scheduler.scheduleUpdateForTarget(this._actionManager, cc.Scheduler.PRIORITY_SYSTEM, !1);
		this._eventAfterDraw = new cc.EventCustom(cc.Director.EVENT_AFTER_DRAW);
		this._eventAfterDraw.setUserData(this);
		this._eventAfterVisit = new cc.EventCustom(cc.Director.EVENT_AFTER_VISIT);
		this._eventAfterVisit.setUserData(this);
		this._eventAfterUpdate = new cc.EventCustom(cc.Director.EVENT_AFTER_UPDATE);
		this._eventAfterUpdate.setUserData(this);
		this._eventProjectionChanged = new cc.EventCustom(cc.Director.EVENT_PROJECTION_CHANGED);
		this._eventProjectionChanged.setUserData(this);
		return !0
	},
	calculateDeltaTime: function() {
		var a = Date.now();
		this._nextDeltaTimeZero ? (this._deltaTime = 0, this._nextDeltaTimeZero = !1) : this._deltaTime = (a - this._lastUpdate) / 1E3;
		0 < cc.game.config[cc.game.CONFIG_KEY.debugMode] && 0.2 < this._deltaTime && (this._deltaTime = 1 / 60);
		this._lastUpdate = a
	},
	convertToGL: null,
	convertToUI: null,
	drawScene: function() {
		this.calculateDeltaTime();
		this._paused || (this._scheduler.update(this._deltaTime), cc.eventManager.dispatchEvent(this._eventAfterUpdate));
		this._clear();
		this._nextScene && this.setNextScene();
		this._beforeVisitScene && this._beforeVisitScene();
		this._runningScene && (this._runningScene.visit(), cc.eventManager.dispatchEvent(this._eventAfterVisit));
		this._notificationNode && this._notificationNode.visit();
		this._displayStats && this._showStats();
		this._afterVisitScene && this._afterVisitScene();
		cc.eventManager.dispatchEvent(this._eventAfterDraw);
		this._totalFrames++;
		this._displayStats && this._calculateMPF()
	},
	_beforeVisitScene: null,
	_afterVisitScene: null,
	end: function() {
		this._purgeDirectorInNextLoop = !0
	},
	getContentScaleFactor: function() {
		return this._contentScaleFactor
	},
	getNotificationNode: function() {
		return this._notificationNode
	},
	getWinSize: function() {
		return cc.size(this._winSizeInPoints)
	},
	getWinSizeInPixels: function() {
		return cc.size(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor)
	},
	getVisibleSize: null,
	getVisibleOrigin: null,
	getZEye: null,
	pause: function() {
		this._paused || (this._oldAnimationInterval = this._animationInterval, this.setAnimationInterval(0.25), this._paused = !0)
	},
	popScene: function() {
		cc.assert(this._runningScene, cc._LogInfos.Director_popScene);
		this._scenesStack.pop();
		var a = this._scenesStack.length;
		0 == a ? this.end() : (this._sendCleanupToScene = !0, this._nextScene = this._scenesStack[a - 1])
	},
	purgeCachedData: function() {
		cc.animationCache._clear();
		cc.spriteFrameCache._clear();
		cc.textureCache._clear()
	},
	purgeDirector: function() {
		this.getScheduler().unscheduleAllCallbacks();
		cc.eventManager && cc.eventManager.setEnabled(!1);
		this._runningScene && (this._runningScene.onExitTransitionDidStart(), this._runningScene.onExit(), this._runningScene.cleanup());
		this._nextScene = this._runningScene = null;
		this._scenesStack.length = 0;
		this.stopAnimation();
		this.purgeCachedData();
		cc.checkGLErrorDebug()
	},
	pushScene: function(a) {
		cc.assert(a, cc._LogInfos.Director_pushScene);
		this._sendCleanupToScene = !1;
		this._scenesStack.push(a);
		this._nextScene = a
	},
	runScene: function(a) {
		cc.assert(a, cc._LogInfos.Director_pushScene);
		if (this._runningScene) {
			var b = this._scenesStack.length;
			0 === b ? (this._sendCleanupToScene = !0, this._scenesStack[b] = a) : (this._sendCleanupToScene = !0, this._scenesStack[b - 1] = a);
			this._nextScene = a
		} else this.pushScene(a), this.startAnimation()
	},
	resume: function() {
		this._paused && (this.setAnimationInterval(this._oldAnimationInterval), (this._lastUpdate = Date.now()) || cc.log(cc._LogInfos.Director_resume), this._paused = !1, this._deltaTime = 0)
	},
	setContentScaleFactor: function(a) {
		a != this._contentScaleFactor && (this._contentScaleFactor = a, this._createStatsLabel())
	},
	setDepthTest: null,
	setDefaultValues: function() {},
	setNextDeltaTimeZero: function(a) {
		this._nextDeltaTimeZero = a
	},
	setNextScene: function() {
		var a = !1,
			b = !1;
		cc.TransitionScene && (a = this._runningScene ? this._runningScene instanceof cc.TransitionScene : !1, b = this._nextScene ? this._nextScene instanceof cc.TransitionScene : !1);
		if (!b) {
			if (b = this._runningScene) b.onExitTransitionDidStart(), b.onExit();
			this._sendCleanupToScene && b && b.cleanup()
		}
		this._runningScene = this._nextScene;
		this._nextScene = null;
		a || null == this._runningScene || (this._runningScene.onEnter(), this._runningScene.onEnterTransitionDidFinish())
	},
	setNotificationNode: function(a) {
		this._notificationNode = a
	},
	getDelegate: function() {
		return this._projectionDelegate
	},
	setDelegate: function(a) {
		this._projectionDelegate = a
	},
	setOpenGLView: null,
	setProjection: null,
	setViewport: null,
	getOpenGLView: null,
	getProjection: null,
	setAlphaBlending: null,
	_showStats: function() {
		this._frames++;
		this._accumDt += this._deltaTime;
		this._FPSLabel && this._SPFLabel && this._drawsLabel ? (this._accumDt > cc.DIRECTOR_FPS_INTERVAL && (this._SPFLabel.string = this._secondsPerFrame.toFixed(3), this._frameRate = this._frames / this._accumDt, this._accumDt = this._frames = 0, this._FPSLabel.string = this._frameRate.toFixed(1), this._drawsLabel.string = (0 | cc.g_NumberOfDraws).toString()), this._FPSLabel.visit(), this._SPFLabel.visit(), this._drawsLabel.visit()) : this._createStatsLabel();
		cc.g_NumberOfDraws = 0
	},
	isSendCleanupToScene: function() {
		return this._sendCleanupToScene
	},
	getRunningScene: function() {
		return this._runningScene
	},
	getAnimationInterval: function() {
		return this._animationInterval
	},
	isDisplayStats: function() {
		return this._displayStats
	},
	setDisplayStats: function(a) {
		this._displayStats = a
	},
	getSecondsPerFrame: function() {
		return this._secondsPerFrame
	},
	isNextDeltaTimeZero: function() {
		return this._nextDeltaTimeZero
	},
	isPaused: function() {
		return this._paused
	},
	getTotalFrames: function() {
		return this._totalFrames
	},
	popToRootScene: function() {
		this.popToSceneStackLevel(1)
	},
	popToSceneStackLevel: function(a) {
		cc.assert(this._runningScene, cc._LogInfos.Director_popToSceneStackLevel_2);
		var b = this._scenesStack,
			c = b.length;
		if (0 == c) this.end();
		else if (!(a > c)) {
			for (; c > a;) {
				var d = b.pop();
				d.running && (d.onExitTransitionDidStart(), d.onExit());
				d.cleanup();
				c--
			}
			this._nextScene = b[b.length - 1];
			this._sendCleanupToScene = !1
		}
	},
	getScheduler: function() {
		return this._scheduler
	},
	setScheduler: function(a) {
		this._scheduler != a && (this._scheduler = a)
	},
	getActionManager: function() {
		return this._actionManager
	},
	setActionManager: function(a) {
		this._actionManager != a && (this._actionManager = a)
	},
	getDeltaTime: function() {
		return this._deltaTime
	},
	_createStatsLabel: null,
	_calculateMPF: function() {
		this._secondsPerFrame = (Date.now() - this._lastUpdate) / 1E3
	}
});
cc.Director.EVENT_PROJECTION_CHANGED = "director_projection_changed";
cc.Director.EVENT_AFTER_DRAW = "director_after_draw";
cc.Director.EVENT_AFTER_VISIT = "director_after_visit";
cc.Director.EVENT_AFTER_UPDATE = "director_after_update";
cc.DisplayLinkDirector = cc.Director.extend({
	invalid: !1,
	startAnimation: function() {
		this._nextDeltaTimeZero = !0;
		this.invalid = !1
	},
	mainLoop: function() {
		this._purgeDirectorInNextLoop ? (this._purgeDirectorInNextLoop = !1, this.purgeDirector()) : this.invalid || this.drawScene()
	},
	stopAnimation: function() {
		this.invalid = !0
	},
	setAnimationInterval: function(a) {
		this._animationInterval = a;
		this.invalid || (this.stopAnimation(), this.startAnimation())
	}
});
cc.Director.sharedDirector = null;
cc.Director.firstUseDirector = !0;
cc.Director._getInstance = function() {
	cc.Director.firstUseDirector && (cc.Director.firstUseDirector = !1, cc.Director.sharedDirector = new cc.DisplayLinkDirector, cc.Director.sharedDirector.init());
	return cc.Director.sharedDirector
};
cc.defaultFPS = 60;
cc.Director.PROJECTION_2D = 0;
cc.Director.PROJECTION_3D = 1;
cc.Director.PROJECTION_CUSTOM = 3;
cc.Director.PROJECTION_DEFAULT = cc.Director.PROJECTION_3D;
cc._renderType === cc._RENDER_TYPE_CANVAS ? (_p = cc.Director.prototype, _p.setProjection = function(a) {
	this._projection = a;
	cc.eventManager.dispatchEvent(this._eventProjectionChanged)
}, _p.setDepthTest = function() {}, _p.setOpenGLView = function(a) {
	this._winSizeInPoints.width = cc._canvas.width;
	this._winSizeInPoints.height = cc._canvas.height;
	this._openGLView = a || cc.view;
	cc.eventManager && cc.eventManager.setEnabled(!0)
}, _p._clear = function() {
	var a = this._openGLView.getViewPortRect();
	cc._renderContext.clearRect(-a.x, a.y, a.width, -a.height)
}, _p._createStatsLabel = function() {
	var a = 0,
		a = this._winSizeInPoints.width > this._winSizeInPoints.height ? 0 | this._winSizeInPoints.height / 320 * 24 : 0 | this._winSizeInPoints.width / 320 * 24;
	this._FPSLabel = cc.LabelTTF.create("000.0", "Arial", a);
	this._SPFLabel = cc.LabelTTF.create("0.000", "Arial", a);
	this._drawsLabel = cc.LabelTTF.create("0000", "Arial", a);
	a = cc.DIRECTOR_STATS_POSITION;
	this._drawsLabel.setPosition(this._drawsLabel.width / 2 + a.x, 5 * this._drawsLabel.height / 2 + a.y);
	this._SPFLabel.setPosition(this._SPFLabel.width / 2 + a.x, 3 * this._SPFLabel.height / 2 + a.y);
	this._FPSLabel.setPosition(this._FPSLabel.width / 2 + a.x, this._FPSLabel.height / 2 + a.y)
}, _p.getVisibleSize = function() {
	return this.getWinSize()
}, _p.getVisibleOrigin = function() {
	return cc.p(0, 0)
}) : (cc.Director._fpsImage = new Image, cc._addEventListener(cc.Director._fpsImage, "load", function() {
	cc.Director._fpsImageLoaded = !0
}), cc._fpsImage && (cc.Director._fpsImage.src = cc._fpsImage), cc.assert(cc.isFunction(cc._tmp.DirectorWebGL), cc._LogInfos.MissingFile, "CCDirectorWebGL.js"), cc._tmp.DirectorWebGL(), delete cc._tmp.DirectorWebGL);
cc.Camera = cc.Class.extend({
	_eyeX: null,
	_eyeY: null,
	_eyeZ: null,
	_centerX: null,
	_centerY: null,
	_centerZ: null,
	_upX: null,
	_upY: null,
	_upZ: null,
	_dirty: null,
	_lookupMatrix: null,
	ctor: function() {
		this._lookupMatrix = new cc.kmMat4;
		this.restore()
	},
	description: function() {
		return "\x3cCCCamera | center \x3d(" + this._centerX + "," + this._centerY + "," + this._centerZ + ")\x3e"
	},
	setDirty: function(a) {
		this._dirty = a
	},
	isDirty: function() {
		return this._dirty
	},
	restore: function() {
		this._eyeX = this._eyeY = 0;
		this._eyeZ = cc.Camera.getZEye();
		this._upX = this._centerX = this._centerY = this._centerZ = 0;
		this._upY = 1;
		this._upZ = 0;
		cc.kmMat4Identity(this._lookupMatrix);
		this._dirty = !1
	},
	locate: function() {
		if (this._dirty) {
			var a = new cc.kmVec3,
				b = new cc.kmVec3,
				c = new cc.kmVec3;
			cc.kmVec3Fill(a, this._eyeX, this._eyeY, this._eyeZ);
			cc.kmVec3Fill(b, this._centerX, this._centerY, this._centerZ);
			cc.kmVec3Fill(c, this._upX, this._upY, this._upZ);
			cc.kmMat4LookAt(this._lookupMatrix, a, b, c);
			this._dirty = !1
		}
		cc.kmGLMultMatrix(this._lookupMatrix)
	},
	setEyeXYZ: function(a, b, c) {
		this.setEye(a, b, c)
	},
	setEye: function(a, b, c) {
		this._eyeX = a;
		this._eyeY = b;
		this._eyeZ = c;
		this._dirty = !0
	},
	setCenterXYZ: function(a, b, c) {
		this.setCenter(a, b, c)
	},
	setCenter: function(a, b, c) {
		this._centerX = a;
		this._centerY = b;
		this._centerZ = c;
		this._dirty = !0
	},
	setUpXYZ: function(a, b, c) {
		this.setUp(a, b, c)
	},
	setUp: function(a, b, c) {
		this._upX = a;
		this._upY = b;
		this._upZ = c;
		this._dirty = !0
	},
	getEyeXYZ: function(a, b, c) {
		return {
			x: this._eyeX,
			y: this._eyeY,
			z: this._eyeZ
		}
	},
	getEye: function() {
		return {
			x: this._eyeX,
			y: this._eyeY,
			z: this._eyeZ
		}
	},
	getCenterXYZ: function(a, b, c) {
		return {
			x: this._centerX,
			y: this._centerY,
			z: this._centerZ
		}
	},
	getCenter: function() {
		return {
			x: this._centerX,
			y: this._centerY,
			z: this._centerZ
		}
	},
	getUpXYZ: function(a, b, c) {
		return {
			x: this._upX,
			y: this._upY,
			z: this._upZ
		}
	},
	getUp: function() {
		return {
			x: this._upX,
			y: this._upY,
			z: this._upZ
		}
	},
	_DISALLOW_COPY_AND_ASSIGN: function(a) {}
});
cc.Camera.getZEye = function() {
	return cc.FLT_EPSILON
};
cc.PRIORITY_NON_SYSTEM = cc.PRIORITY_SYSTEM + 1;
cc.ListEntry = function(a, b, c, d, e, f) {
	this.prev = a;
	this.next = b;
	this.target = c;
	this.priority = d;
	this.paused = e;
	this.markedForDeletion = f
};
cc.HashUpdateEntry = function(a, b, c, d) {
	this.list = a;
	this.entry = b;
	this.target = c;
	this.hh = d
};
cc.HashTimerEntry = function(a, b, c, d, e, f, g) {
	this.timers = a;
	this.target = b;
	this.timerIndex = c;
	this.currentTimer = d;
	this.currentTimerSalvaged = e;
	this.paused = f;
	this.hh = g
};
cc.Timer = cc.Class.extend({
	_interval: 0,
	_callback: null,
	_target: null,
	_elapsed: 0,
	_runForever: !1,
	_useDelay: !1,
	_timesExecuted: 0,
	_repeat: 0,
	_delay: 0,
	getInterval: function() {
		return this._interval
	},
	setInterval: function(a) {
		this._interval = a
	},
	getCallback: function() {
		return this._callback
	},
	ctor: function(a, b, c, d, e) {
		this._target = a;
		this._callback = b;
		this._elapsed = -1;
		this._interval = c || 0;
		this._delay = e || 0;
		this._useDelay = 0 < this._delay;
		this._repeat = null == d ? cc.REPEAT_FOREVER : d;
		this._runForever = this._repeat == cc.REPEAT_FOREVER
	},
	_doCallback: function() {
		if (cc.isString(this._callback)) this._target[this._callback](this._elapsed);
		else this._callback.call(this._target, this._elapsed)
	},
	update: function(a) {
		if (-1 == this._elapsed) this._timesExecuted = this._elapsed = 0;
		else {
			var b = this._target,
				c = this._callback;
			this._elapsed += a;
			this._runForever && !this._useDelay ? this._elapsed >= this._interval && (b && c && this._doCallback(), this._elapsed = 0) : (this._useDelay ? this._elapsed >= this._delay && (b && c && this._doCallback(), this._elapsed -= this._delay, this._timesExecuted += 1, this._useDelay = !1) : this._elapsed >= this._interval && (b && c && this._doCallback(), this._elapsed = 0, this._timesExecuted += 1), this._timesExecuted > this._repeat && cc.director.getScheduler().unscheduleCallbackForTarget(b, c))
		}
	}
});
cc.Scheduler = cc.Class.extend({
	_timeScale: 1,
	_updates: null,
	_hashForUpdates: null,
	_arrayForUpdates: null,
	_hashForTimers: null,
	_arrayForTimes: null,
	_currentTarget: null,
	_currentTargetSalvaged: !1,
	_updateHashLocked: !1,
	ctor: function() {
		this._timeScale = 1;
		this._updates = [
			[],
			[],
			[]
		];
		this._hashForUpdates = {};
		this._arrayForUpdates = [];
		this._hashForTimers = {};
		this._arrayForTimers = [];
		this._currentTarget = null;
		this._updateHashLocked = this._currentTargetSalvaged = !1
	},
	_removeHashElement: function(a) {
		delete this._hashForTimers[a.target.__instanceId];
		cc.arrayRemoveObject(this._arrayForTimers, a);
		a.Timer = null;
		a.target = null
	},
	_removeUpdateFromHash: function(a) {
		if (a = this._hashForUpdates[a.target.__instanceId]) cc.arrayRemoveObject(a.list, a.entry), delete this._hashForUpdates[a.target.__instanceId], cc.arrayRemoveObject(this._arrayForUpdates, a), a.entry = null, a.target = null
	},
	_priorityIn: function(a, b, c, d) {
		d = new cc.ListEntry(null, null, b, c, d, !1);
		if (a) {
			for (var e = a.length - 1, f = 0; f <= e && !(c < a[f].priority); f++);
			a.splice(f, 0, d)
		} else a = [], a.push(d);
		c = new cc.HashUpdateEntry(a, d, b, null);
		this._arrayForUpdates.push(c);
		this._hashForUpdates[b.__instanceId] = c;
		return a
	},
	_appendIn: function(a, b, c) {
		c = new cc.ListEntry(null, null, b, 0, c, !1);
		a.push(c);
		a = new cc.HashUpdateEntry(a, c, b, null);
		this._arrayForUpdates.push(a);
		this._hashForUpdates[b.__instanceId] = a
	},
	setTimeScale: function(a) {
		this._timeScale = a
	},
	getTimeScale: function() {
		return this._timeScale
	},
	update: function(a) {
		var b = this._updates,
			c = this._arrayForTimers,
			d, e, f;
		this._updateHashLocked = !0;
		1 != this._timeScale && (a *= this._timeScale);
		e = 0;
		for (f = b.length; e < f && 0 <= e; e++)
			for (var g = this._updates[e], h = 0, k = g.length; h < k; h++) d = g[h], d.paused || d.markedForDeletion || d.target.update(a);
		e = 0;
		for (f = c.length; e < f; e++) {
			d = c[e];
			if (!d) break;
			this._currentTarget = d;
			this._currentTargetSalvaged = !1;
			if (!d.paused)
				for (d.timerIndex = 0; d.timerIndex < d.timers.length; d.timerIndex++) d.currentTimer = d.timers[d.timerIndex], d.currentTimerSalvaged = !1, d.currentTimer.update(a), d.currentTimer = null;
			this._currentTargetSalvaged && 0 == d.timers.length && (this._removeHashElement(d), e--)
		}
		e = 0;
		for (f = b.length; e < f; e++)
			for (g = this._updates[e], h = 0, k = g.length; h < k;) {
				d = g[h];
				if (!d) break;
				d.markedForDeletion ? this._removeUpdateFromHash(d) : h++
			}
		this._updateHashLocked = !1;
		this._currentTarget = null
	},
	scheduleCallbackForTarget: function(a, b, c, d, e, f) {
		cc.assert(b, cc._LogInfos.Scheduler_scheduleCallbackForTarget_2);
		cc.assert(a, cc._LogInfos.Scheduler_scheduleCallbackForTarget_3);
		c = c || 0;
		d = null == d ? cc.REPEAT_FOREVER : d;
		e = e || 0;
		f = f || !1;
		var g = this._hashForTimers[a.__instanceId];
		g || (g = new cc.HashTimerEntry(null, a, 0, null, null, f, null), this._arrayForTimers.push(g), this._hashForTimers[a.__instanceId] = g);
		if (null == g.timers) g.timers = [];
		else
			for (var h = 0; h < g.timers.length; h++)
				if (f = g.timers[h], b == f._callback) {
					cc.log(cc._LogInfos.Scheduler_scheduleCallbackForTarget, f.getInterval().toFixed(4), c.toFixed(4));
					f._interval = c;
					return
				}
		f = new cc.Timer(a, b, c, d, e);
		g.timers.push(f)
	},
	scheduleUpdateForTarget: function(a, b, c) {
		if (null !== a) {
			var d = this._updates,
				e = this._hashForUpdates[a.__instanceId];
			e ? e.entry.markedForDeletion = !1 : 0 == b ? this._appendIn(d[1], a, c) : 0 > b ? d[0] = this._priorityIn(d[0], a, b, c) : d[2] = this._priorityIn(d[2], a, b, c)
		}
	},
	unscheduleCallbackForTarget: function(a, b) {
		if (null != a && null != b) {
			var c = this._hashForTimers[a.__instanceId];
			if (c)
				for (var d = c.timers, e = 0, f = d.length; e < f; e++) {
					var g = d[e];
					if (b == g._callback) {
						g != c.currentTimer || c.currentTimerSalvaged || (c.currentTimerSalvaged = !0);
						d.splice(e, 1);
						c.timerIndex >= e && c.timerIndex--;
						0 == d.length && (this._currentTarget == c ? this._currentTargetSalvaged = !0 : this._removeHashElement(c));
						break
					}
				}
		}
	},
	unscheduleUpdateForTarget: function(a) {
		null != a && (a = this._hashForUpdates[a.__instanceId], null != a && (this._updateHashLocked ? a.entry.markedForDeletion = !0 : this._removeUpdateFromHash(a.entry)))
	},
	unscheduleAllCallbacksForTarget: function(a) {
		if (null != a) {
			var b = this._hashForTimers[a.__instanceId];
			if (b) {
				var c = b.timers;
				!b.currentTimerSalvaged && 0 <= c.indexOf(b.currentTimer) && (b.currentTimerSalvaged = !0);
				c.length = 0;
				this._currentTarget == b ? this._currentTargetSalvaged = !0 : this._removeHashElement(b)
			}
			this.unscheduleUpdateForTarget(a)
		}
	},
	unscheduleAllCallbacks: function() {
		this.unscheduleAllCallbacksWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM)
	},
	unscheduleAllCallbacksWithMinPriority: function(a) {
		for (var b = this._arrayForTimers, c = this._updates, d = 0, e = b.length; d < e; d++) this.unscheduleAllCallbacksForTarget(b[d].target);
		for (d = 2; 0 <= d; d--)
			if (!(1 == d && 0 < a || 0 == d && 0 <= a))
				for (var b = c[d], e = 0, f = b.length; e < f; e++) this.unscheduleUpdateForTarget(b[e].target)
	},
	pauseAllTargets: function() {
		return this.pauseAllTargetsWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM)
	},
	pauseAllTargetsWithMinPriority: function(a) {
		a = [];
		for (var b, c = this._arrayForTimers, d = this._updates, e = 0, f = c.length; e < f; e++)
			if (b = c[e]) b.paused = !0, a.push(b.target);
		e = 0;
		for (f = d.length; e < f; e++)
			for (var c = d[e], g = 0, h = c.length; g < h; g++)
				if (b = c[g]) b.paused = !0, a.push(b.target);
		return a
	},
	resumeTargets: function(a) {
		if (a)
			for (var b = 0; b < a.length; b++) this.resumeTarget(a[b])
	},
	pauseTarget: function(a) {
		cc.assert(a, cc._LogInfos.Scheduler_pauseTarget);
		var b = this._hashForTimers[a.__instanceId];
		b && (b.paused = !0);
		(a = this._hashForUpdates[a.__instanceId]) && (a.entry.paused = !0)
	},
	resumeTarget: function(a) {
		cc.assert(a, cc._LogInfos.Scheduler_resumeTarget);
		var b = this._hashForTimers[a.__instanceId];
		b && (b.paused = !1);
		(a = this._hashForUpdates[a.__instanceId]) && (a.entry.paused = !1)
	},
	isTargetPaused: function(a) {
		cc.assert(a, cc._LogInfos.Scheduler_isTargetPaused);
		return (a = this._hashForTimers[a.__instanceId]) ? a.paused : !1
	}
});
cc.Scheduler.PRIORITY_SYSTEM = -2147483648;
cc.PI2 = 2 * Math.PI;
cc.DrawingPrimitiveCanvas = cc.Class.extend({
	_cacheArray: [],
	_renderContext: null,
	ctor: function(a) {
		this._renderContext = a
	},
	drawPoint: function(a, b) {
		b || (b = 1);
		var c = cc.view.getScaleX(),
			d = cc.view.getScaleY(),
			d = cc.p(a.x * c, a.y * d);
		this._renderContext.beginPath();
		this._renderContext.arc(d.x, -d.y, b * c, 0, 2 * Math.PI, !1);
		this._renderContext.closePath();
		this._renderContext.fill()
	},
	drawPoints: function(a, b, c) {
		if (null != a) {
			c || (c = 1);
			b = this._renderContext;
			var d = cc.view.getScaleX(),
				e = cc.view.getScaleY();
			b.beginPath();
			for (var f = 0, g = a.length; f < g; f++) b.arc(a[f].x * d, -a[f].y * e, c * d, 0, 2 * Math.PI, !1);
			b.closePath();
			b.fill()
		}
	},
	drawLine: function(a, b) {
		var c = this._renderContext,
			d = cc.view.getScaleX(),
			e = cc.view.getScaleY();
		c.beginPath();
		c.moveTo(a.x * d, -a.y * e);
		c.lineTo(b.x * d, -b.y * e);
		c.closePath();
		c.stroke()
	},
	drawRect: function(a, b) {
		this.drawLine(cc.p(a.x, a.y), cc.p(b.x, a.y));
		this.drawLine(cc.p(b.x, a.y), cc.p(b.x, b.y));
		this.drawLine(cc.p(b.x, b.y), cc.p(a.x, b.y));
		this.drawLine(cc.p(a.x, b.y), cc.p(a.x, a.y))
	},
	drawSolidRect: function(a, b, c) {
		a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
		this.drawSolidPoly(a, 4, c)
	},
	drawPoly: function(a, b, c, d) {
		d = d || !1;
		if (null != a) {
			if (3 > a.length) throw Error("Polygon's point must greater than 2");
			var e = a[0];
			b = this._renderContext;
			var f = cc.view.getScaleX(),
				g = cc.view.getScaleY();
			b.beginPath();
			b.moveTo(e.x * f, -e.y * g);
			for (var e = 1, h = a.length; e < h; e++) b.lineTo(a[e].x * f, -a[e].y * g);
			c && b.closePath();
			d ? b.fill() : b.stroke()
		}
	},
	drawSolidPoly: function(a, b, c) {
		this.setDrawColor(c.r, c.g, c.b, c.a);
		this.drawPoly(a, b, !0, !0)
	},
	drawCircle: function(a, b, c, d, e) {
		e = e || !1;
		d = this._renderContext;
		var f = cc.view.getScaleX(),
			g = cc.view.getScaleY();
		d.beginPath();
		d.arc(0 | a.x * f, 0 | -(a.y * g), b * f, -c, -(c - 2 * Math.PI), !1);
		e && d.lineTo(0 | a.x * f, 0 | -(a.y * g));
		d.stroke()
	},
	drawQuadBezier: function(a, b, c, d) {
		for (var e = this._cacheArray, f = e.length = 0, g = 0; g < d; g++) {
			var h = Math.pow(1 - f, 2) * a.x + 2 * (1 - f) * f * b.x + f * f * c.x,
				k = Math.pow(1 - f, 2) * a.y + 2 * (1 - f) * f * b.y + f * f * c.y;
			e.push(cc.p(h, k));
			f += 1 / d
		}
		e.push(cc.p(c.x, c.y));
		this.drawPoly(e, d + 1, !1, !1)
	},
	drawCubicBezier: function(a, b, c, d, e) {
		for (var f = this._cacheArray, g = f.length = 0, h = 0; h < e; h++) {
			var k = Math.pow(1 - g, 3) * a.x + 3 * Math.pow(1 - g, 2) * g * b.x + 3 * (1 - g) * g * g * c.x + g * g * g * d.x,
				m = Math.pow(1 - g, 3) * a.y + 3 * Math.pow(1 - g, 2) * g * b.y + 3 * (1 - g) * g * g * c.y + g * g * g * d.y;
			f.push(cc.p(k, m));
			g += 1 / e
		}
		f.push(cc.p(d.x, d.y));
		this.drawPoly(f, e + 1, !1, !1)
	},
	drawCatmullRom: function(a, b) {
		this.drawCardinalSpline(a, 0.5, b)
	},
	drawCardinalSpline: function(a, b, c) {
		cc._renderContext.strokeStyle = "rgba(255,255,255,1)";
		var d = this._cacheArray;
		d.length = 0;
		for (var e, f, g = 1 / a.length, h = 0; h < c + 1; h++) f = h / c, 1 == f ? (e = a.length - 1, f = 1) : (e = 0 | f / g, f = (f - g * e) / g), e = cc.CardinalSplineAt(cc.getControlPointAt(a, e - 1), cc.getControlPointAt(a, e - 0), cc.getControlPointAt(a, e + 1), cc.getControlPointAt(a, e + 2), b, f), d.push(e);
		this.drawPoly(d, c + 1, !1, !1)
	},
	drawImage: function(a, b, c, d, e) {
		switch (arguments.length) {
			case 2:
				this._renderContext.drawImage(a, b.x, -(b.y + a.height));
				break;
			case 3:
				this._renderContext.drawImage(a, b.x, -(b.y + c.height), c.width, c.height);
				break;
			case 5:
				this._renderContext.drawImage(a, b.x, b.y, c.width, c.height, d.x, -(d.y + e.height), e.width, e.height);
				break;
			default:
				throw Error("Argument must be non-nil");
		}
	},
	drawStar: function(a, b, c) {
		a = a || this._renderContext;
		b *= cc.view.getScaleX();
		c = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b);
		a.fillStyle = c + ",1)";
		var d = b / 10;
		a.beginPath();
		a.moveTo(-b, b);
		a.lineTo(0, d);
		a.lineTo(b, b);
		a.lineTo(d, 0);
		a.lineTo(b, -b);
		a.lineTo(0, -d);
		a.lineTo(-b, -b);
		a.lineTo(-d, 0);
		a.lineTo(-b, b);
		a.closePath();
		a.fill();
		var e = a.createRadialGradient(0, 0, d, 0, 0, b);
		e.addColorStop(0, c + ", 1)");
		e.addColorStop(0.3, c + ", 0.8)");
		e.addColorStop(1, c + ", 0.0)");
		a.fillStyle = e;
		a.beginPath();
		a.arc(0, 0, b - d, 0, cc.PI2, !1);
		a.closePath();
		a.fill()
	},
	drawColorBall: function(a, b, c) {
		a = a || this._renderContext;
		b *= cc.view.getScaleX();
		c = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b);
		var d = a.createRadialGradient(0, 0, b / 10, 0, 0, b);
		d.addColorStop(0, c + ", 1)");
		d.addColorStop(0.3, c + ", 0.8)");
		d.addColorStop(0.6, c + ", 0.4)");
		d.addColorStop(1, c + ", 0.0)");
		a.fillStyle = d;
		a.beginPath();
		a.arc(0, 0, b, 0, cc.PI2, !1);
		a.closePath();
		a.fill()
	},
	fillText: function(a, b, c) {
		this._renderContext.fillText(a, b, -c)
	},
	setDrawColor: function(a, b, c, d) {
		this._renderContext.fillStyle = "rgba(" + a + "," + b + "," + c + "," + d / 255 + ")";
		this._renderContext.strokeStyle = "rgba(" + a + "," + b + "," + c + "," + d / 255 + ")"
	},
	setPointSize: function(a) {},
	setLineWidth: function(a) {
		this._renderContext.lineWidth = a * cc.view.getScaleX()
	}
});
cc.DrawingPrimitiveWebGL = cc.Class.extend({
	_renderContext: null,
	_initialized: !1,
	_shader: null,
	_colorLocation: -1,
	_colorArray: null,
	_pointSizeLocation: -1,
	_pointSize: -1,
	ctor: function(a) {
		null == a && (a = cc._renderContext);
		if (!a instanceof WebGLRenderingContext) throw "Can't initialise DrawingPrimitiveWebGL. context need is WebGLRenderingContext";
		this._renderContext = a;
		this._colorArray = new Float32Array([1, 1, 1, 1])
	},
	lazy_init: function() {
		this._initialized || (this._shader = cc.shaderCache.programForKey(cc.SHADER_POSITION_UCOLOR), this._colorLocation = this._renderContext.getUniformLocation(this._shader.getProgram(), "u_color"), this._pointSizeLocation = this._renderContext.getUniformLocation(this._shader.getProgram(), "u_pointSize"), this._initialized = !0)
	},
	drawInit: function() {
		this._initialized = !1
	},
	drawPoint: function(a) {
		this.lazy_init();
		var b = this._renderContext;
		this._shader.use();
		this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
		b.uniform4fv(this._colorLocation, this._colorArray);
		this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);
		var c = b.createBuffer();
		b.bindBuffer(b.ARRAY_BUFFER, c);
		b.bufferData(b.ARRAY_BUFFER, new Float32Array([a.x, a.y]), b.STATIC_DRAW);
		b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, b.FLOAT, !1, 0, 0);
		b.drawArrays(b.POINTS, 0, 1);
		b.deleteBuffer(c);
		cc.incrementGLDraws(1)
	},
	drawPoints: function(a, b) {
		if (a && 0 != a.length) {
			this.lazy_init();
			var c = this._renderContext;
			this._shader.use();
			this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
			cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
			c.uniform4fv(this._colorLocation, this._colorArray);
			this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);
			var d = c.createBuffer();
			c.bindBuffer(c.ARRAY_BUFFER, d);
			c.bufferData(c.ARRAY_BUFFER, this._pointsToTypeArray(a), c.STATIC_DRAW);
			c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, 0);
			c.drawArrays(c.POINTS, 0, a.length);
			c.deleteBuffer(d);
			cc.incrementGLDraws(1)
		}
	},
	_pointsToTypeArray: function(a) {
		for (var b = new Float32Array(2 * a.length), c = 0; c < a.length; c++) b[2 * c] = a[c].x, b[2 * c + 1] = a[c].y;
		return b
	},
	drawLine: function(a, b) {
		this.lazy_init();
		var c = this._renderContext;
		this._shader.use();
		this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
		c.uniform4fv(this._colorLocation, this._colorArray);
		var d = c.createBuffer();
		c.bindBuffer(c.ARRAY_BUFFER, d);
		c.bufferData(c.ARRAY_BUFFER, this._pointsToTypeArray([a, b]), c.STATIC_DRAW);
		c.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, c.FLOAT, !1, 0, 0);
		c.drawArrays(c.LINES, 0, 2);
		c.deleteBuffer(d);
		cc.incrementGLDraws(1)
	},
	drawRect: function(a, b) {
		this.drawLine(cc.p(a.x, a.y), cc.p(b.x, a.y));
		this.drawLine(cc.p(b.x, a.y), cc.p(b.x, b.y));
		this.drawLine(cc.p(b.x, b.y), cc.p(a.x, b.y));
		this.drawLine(cc.p(a.x, b.y), cc.p(a.x, a.y))
	},
	drawSolidRect: function(a, b, c) {
		a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
		this.drawSolidPoly(a, 4, c)
	},
	drawPoly: function(a, b, c) {
		this.lazy_init();
		b = this._renderContext;
		this._shader.use();
		this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
		b.uniform4fv(this._colorLocation, this._colorArray);
		var d = b.createBuffer();
		b.bindBuffer(b.ARRAY_BUFFER, d);
		b.bufferData(b.ARRAY_BUFFER, this._pointsToTypeArray(a), b.STATIC_DRAW);
		b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, b.FLOAT, !1, 0, 0);
		c ? b.drawArrays(b.LINE_LOOP, 0, a.length) : b.drawArrays(b.LINE_STRIP, 0, a.length);
		b.deleteBuffer(d);
		cc.incrementGLDraws(1)
	},
	drawSolidPoly: function(a, b, c) {
		this.lazy_init();
		c && this.setDrawColor(c.r, c.g, c.b, c.a);
		b = this._renderContext;
		this._shader.use();
		this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
		b.uniform4fv(this._colorLocation, this._colorArray);
		c = b.createBuffer();
		b.bindBuffer(b.ARRAY_BUFFER, c);
		b.bufferData(b.ARRAY_BUFFER, this._pointsToTypeArray(a), b.STATIC_DRAW);
		b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, b.FLOAT, !1, 0, 0);
		b.drawArrays(b.TRIANGLE_FAN, 0, a.length);
		b.deleteBuffer(c);
		cc.incrementGLDraws(1)
	},
	drawCircle: function(a, b, c, d, e) {
		this.lazy_init();
		var f = 1;
		e && f++;
		var g = 2 * Math.PI / d;
		if (e = new Float32Array(2 * (d + 2))) {
			for (var h = 0; h <= d; h++) {
				var k = h * g,
					m = b * Math.cos(k + c) + a.x,
					k = b * Math.sin(k + c) + a.y;
				e[2 * h] = m;
				e[2 * h + 1] = k
			}
			e[2 * (d + 1)] = a.x;
			e[2 * (d + 1) + 1] = a.y;
			a = this._renderContext;
			this._shader.use();
			this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
			cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
			a.uniform4fv(this._colorLocation, this._colorArray);
			b = a.createBuffer();
			a.bindBuffer(a.ARRAY_BUFFER, b);
			a.bufferData(a.ARRAY_BUFFER, e, a.STATIC_DRAW);
			a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
			a.drawArrays(a.LINE_STRIP, 0, d + f);
			a.deleteBuffer(b);
			cc.incrementGLDraws(1)
		}
	},
	drawQuadBezier: function(a, b, c, d) {
		this.lazy_init();
		for (var e = new Float32Array(2 * (d + 1)), f = 0, g = 0; g < d; g++) e[2 * g] = Math.pow(1 - f, 2) * a.x + 2 * (1 - f) * f * b.x + f * f * c.x, e[2 * g + 1] = Math.pow(1 - f, 2) * a.y + 2 * (1 - f) * f * b.y + f * f * c.y, f += 1 / d;
		e[2 * d] = c.x;
		e[2 * d + 1] = c.y;
		a = this._renderContext;
		this._shader.use();
		this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
		a.uniform4fv(this._colorLocation, this._colorArray);
		b = a.createBuffer();
		a.bindBuffer(a.ARRAY_BUFFER, b);
		a.bufferData(a.ARRAY_BUFFER, e, a.STATIC_DRAW);
		a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
		a.drawArrays(a.LINE_STRIP, 0, d + 1);
		a.deleteBuffer(b);
		cc.incrementGLDraws(1)
	},
	drawCubicBezier: function(a, b, c, d, e) {
		this.lazy_init();
		for (var f = new Float32Array(2 * (e + 1)), g = 0, h = 0; h < e; h++) f[2 * h] = Math.pow(1 - g, 3) * a.x + 3 * Math.pow(1 - g, 2) * g * b.x + 3 * (1 - g) * g * g * c.x + g * g * g * d.x, f[2 * h + 1] = Math.pow(1 - g, 3) * a.y + 3 * Math.pow(1 -
			g, 2) * g * b.y + 3 * (1 - g) * g * g * c.y + g * g * g * d.y, g += 1 / e;
		f[2 * e] = d.x;
		f[2 * e + 1] = d.y;
		a = this._renderContext;
		this._shader.use();
		this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
		a.uniform4fv(this._colorLocation, this._colorArray);
		b = a.createBuffer();
		a.bindBuffer(a.ARRAY_BUFFER, b);
		a.bufferData(a.ARRAY_BUFFER, f, a.STATIC_DRAW);
		a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
		a.drawArrays(a.LINE_STRIP, 0, e + 1);
		a.deleteBuffer(b);
		cc.incrementGLDraws(1)
	},
	drawCatmullRom: function(a, b) {
		this.drawCardinalSpline(a, 0.5, b)
	},
	drawCardinalSpline: function(a, b, c) {
		this.lazy_init();
		for (var d = new Float32Array(2 * (c + 1)), e, f, g = 1 / a.length, h = 0; h < c + 1; h++) f = h / c, 1 == f ? (e = a.length - 1, f = 1) : (e = 0 | f / g, f = (f - g * e) / g), e = cc.CardinalSplineAt(cc.getControlPointAt(a, e - 1), cc.getControlPointAt(a, e), cc.getControlPointAt(a, e + 1), cc.getControlPointAt(a, e + 2), b, f), d[2 * h] = e.x, d[2 * h + 1] = e.y;
		a = this._renderContext;
		this._shader.use();
		this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
		a.uniform4fv(this._colorLocation, this._colorArray);
		b = a.createBuffer();
		a.bindBuffer(a.ARRAY_BUFFER, b);
		a.bufferData(a.ARRAY_BUFFER, d, a.STATIC_DRAW);
		a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0);
		a.drawArrays(a.LINE_STRIP, 0, c + 1);
		a.deleteBuffer(b);
		cc.incrementGLDraws(1)
	},
	setDrawColor: function(a, b, c, d) {
		this._colorArray[0] = a / 255;
		this._colorArray[1] = b / 255;
		this._colorArray[2] = c / 255;
		this._colorArray[3] = d / 255
	},
	setPointSize: function(a) {
		this._pointSize = a * cc.contentScaleFactor()
	},
	setLineWidth: function(a) {
		this._renderContext.lineWidth && this._renderContext.lineWidth(a)
	}
});
cc._tmp.WebGLLabelTTF = function() {
	var a = cc.LabelTTF.prototype;
	a.setColor = cc.Sprite.prototype.setColor;
	a._setColorsString = function() {
		this._needUpdateTexture = !0;
		var a = this._strokeColor,
			c = this._textFillColor;
		this._shadowColorStr = "rgba(128,128,128," + this._shadowOpacity + ")";
		this._fillColorStr = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b) + ", 1)";
		this._strokeColorStr = "rgba(" + (0 | a.r) + "," + (0 | a.g) + "," + (0 | a.b) + ", 1)"
	};
	a.updateDisplayedColor = cc.Sprite.prototype.updateDisplayedColor;
	a.setOpacity = cc.Sprite.prototype.setOpacity;
	a.updateDisplayedOpacity = cc.Sprite.prototype.updateDisplayedOpacity;
	a.initWithStringAndTextDefinition = function(a, c) {
		if (!cc.Sprite.prototype.init.call(this)) return !1;
		this.shaderProgram = cc.shaderCache.programForKey(cc.LabelTTF._SHADER_PROGRAM);
		this._updateWithTextDefinition(c, !1);
		this.string = a;
		return !0
	};
	a.setFontFillColor = function(a) {
		var c = this._textFillColor;
		if (c.r != a.r || c.g != a.g || c.b != a.b) c.r = a.r, c.g = a.g, c.b = a.b, this._setColorsString(), this._needUpdateTexture = !0
	};
	a.draw = function(a) {
		if (this._string && "" != this._string) {
			a = a || cc._renderContext;
			var c = this._texture;
			c && c._isLoaded && (this._shaderProgram.use(), this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4(), cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst), cc.glBindTexture2D(c), cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX), a.bindBuffer(a.ARRAY_BUFFER, this._quadWebBuffer), this._quadDirty && (a.bufferData(a.ARRAY_BUFFER, this._quad.arrayBuffer, a.STATIC_DRAW), this._quadDirty = !1), a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, a.FLOAT, !1, 24, 0), a.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, a.FLOAT, !1, 24, 16), a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, 24, 12), a.drawArrays(a.TRIANGLE_STRIP, 0, 4));
			if (1 === cc.SPRITE_DEBUG_DRAW) a = this._quad, a = [cc.p(a.tl.vertices.x, a.tl.vertices.y), cc.p(a.bl.vertices.x, a.bl.vertices.y), cc.p(a.br.vertices.x, a.br.vertices.y), cc.p(a.tr.vertices.x, a.tr.vertices.y)], cc._drawingUtil.drawPoly(a, 4, !0);
			else if (2 === cc.SPRITE_DEBUG_DRAW) {
				a = this.getTextureRect();
				var c = this.offsetX,
					d = this.offsetY;
				a = [cc.p(c, d), cc.p(c + a.width, d), cc.p(c + a.width, d + a.height), cc.p(c, d + a.height)];
				cc._drawingUtil.drawPoly(a, 4, !0)
			}
			cc.g_NumberOfDraws++
		}
	};
	a.setTextureRect = cc.Sprite.prototype.setTextureRect
};
cc._tmp.PrototypeLabelTTF = function() {
	var a = cc.LabelTTF.prototype;
	cc.defineGetterSetter(a, "color", a.getColor, a.setColor);
	cc.defineGetterSetter(a, "opacity", a.getOpacity, a.setOpacity);
	cc.defineGetterSetter(a, "string", a.getString, a.setString);
	cc.defineGetterSetter(a, "textAlign", a.getHorizontalAlignment, a.setHorizontalAlignment);
	cc.defineGetterSetter(a, "verticalAlign", a.getVerticalAlignment, a.setVerticalAlignment);
	cc.defineGetterSetter(a, "fontSize", a.getFontSize, a.setFontSize);
	cc.defineGetterSetter(a, "fontName", a.getFontName, a.setFontName);
	cc.defineGetterSetter(a, "font", a._getFont, a._setFont);
	cc.defineGetterSetter(a, "boundingWidth", a._getBoundingWidth, a._setBoundingWidth);
	cc.defineGetterSetter(a, "boundingHeight", a._getBoundingHeight, a._setBoundingHeight);
	cc.defineGetterSetter(a, "fillStyle", a._getFillStyle, a.setFontFillColor);
	cc.defineGetterSetter(a, "strokeStyle", a._getStrokeStyle, a._setStrokeStyle);
	cc.defineGetterSetter(a, "lineWidth", a._getLineWidth, a._setLineWidth);
	cc.defineGetterSetter(a, "shadowOffsetX", a._getShadowOffsetX, a._setShadowOffsetX);
	cc.defineGetterSetter(a, "shadowOffsetY", a._getShadowOffsetY, a._setShadowOffsetY);
	cc.defineGetterSetter(a, "shadowOpacity", a._getShadowOpacity, a._setShadowOpacity);
	cc.defineGetterSetter(a, "shadowBlur", a._getShadowBlur, a._setShadowBlur)
};
cc.LabelTTF = cc.Sprite.extend({
	_dimensions: null,
	_hAlignment: cc.TEXT_ALIGNMENT_CENTER,
	_vAlignment: cc.VERTICAL_TEXT_ALIGNMENT_TOP,
	_fontName: null,
	_fontSize: 0,
	_string: "",
	_originalText: null,
	_isMultiLine: !1,
	_fontStyleStr: null,
	_shadowEnabled: !1,
	_shadowOffset: null,
	_shadowOpacity: 0,
	_shadowBlur: 0,
	_shadowColorStr: null,
	_strokeEnabled: !1,
	_strokeColor: null,
	_strokeSize: 0,
	_strokeColorStr: null,
	_textFillColor: null,
	_fillColorStr: null,
	_strokeShadowOffsetX: 0,
	_strokeShadowOffsetY: 0,
	_needUpdateTexture: !1,
	_labelCanvas: null,
	_labelContext: null,
	_lineWidths: null,
	_className: "LabelTTF",
	initWithString: function(a, b, c, d, e, f) {
		a = a ? a + "" : "";
		c = c || 16;
		d = d || cc.size(0, 0);
		e = e || cc.TEXT_ALIGNMENT_LEFT;
		f = f || cc.VERTICAL_TEXT_ALIGNMENT_TOP;
		this._opacityModifyRGB = !1;
		this._dimensions = cc.size(d.width, d.height);
		this._fontName = b || "Arial";
		this._hAlignment = e;
		this._vAlignment = f;
		this._fontSize = c;
		this._fontStyleStr = this._fontSize + "px '" + b + "'";
		this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(b, this._fontSize);
		this.string = a;
		this._setColorsString();
		this._updateTexture();
		this._needUpdateTexture = !1;
		return !0
	},
	ctor: function(a, b, c, d, e, f) {
		cc.Sprite.prototype.ctor.call(this);
		this._dimensions = cc.size(0, 0);
		this._hAlignment = cc.TEXT_ALIGNMENT_LEFT;
		this._vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
		this._opacityModifyRGB = !1;
		this._fontStyleStr = "";
		this._fontName = "Arial";
		this._shadowEnabled = this._isMultiLine = !1;
		this._shadowOffset = cc.p(0, 0);
		this._shadowBlur = this._shadowOpacity = 0;
		this._shadowColorStr = "rgba(128, 128, 128, 0.5)";
		this._strokeEnabled = !1;
		this._strokeColor = cc.color(255, 255, 255, 255);
		this._strokeSize = 0;
		this._strokeColorStr = "";
		this._textFillColor = cc.color(255, 255, 255, 255);
		this._fillColorStr = "rgba(255,255,255,1)";
		this._strokeShadowOffsetY = this._strokeShadowOffsetX = 0;
		this._needUpdateTexture = !1;
		this._lineWidths = [];
		this._setColorsString();
		b && b instanceof cc.FontDefinition ? this.initWithStringAndTextDefinition(a, b) : cc.LabelTTF.prototype.initWithString.call(this, a, b, c, d, e, f)
	},
	init: function() {
		return this.initWithString(" ", this._fontName, this._fontSize)
	},
	_measureConfig: function() {
		this._getLabelContext().font = this._fontStyleStr
	},
	_measure: function(a) {
		return this._getLabelContext().measureText(a).width
	},
	description: function() {
		return "\x3ccc.LabelTTF | FontName \x3d" + this._fontName + " FontSize \x3d " + this._fontSize.toFixed(1) + "\x3e"
	},
	setColor: null,
	_setColorsString: null,
	updateDisplayedColor: null,
	setOpacity: null,
	updateDisplayedOpacity: null,
	updateDisplayedOpacityForCanvas: function(a) {
		cc.Node.prototype.updateDisplayedOpacity.call(this, a);
		this._setColorsString()
	},
	getString: function() {
		return this._string
	},
	getHorizontalAlignment: function() {
		return this._hAlignment
	},
	getVerticalAlignment: function() {
		return this._vAlignment
	},
	getDimensions: function() {
		return cc.size(this._dimensions)
	},
	getFontSize: function() {
		return this._fontSize
	},
	getFontName: function() {
		return this._fontName
	},
	initWithStringAndTextDefinition: null,
	setTextDefinition: function(a) {
		a && this._updateWithTextDefinition(a, !0)
	},
	getTextDefinition: function() {
		return this._prepareTextDefinition(!1)
	},
	enableShadow: function(a, b, c, d) {
		c = c || 0.5;
		!1 === this._shadowEnabled && (this._shadowEnabled = !0);
		var e = this._shadowOffset;
		if (e && e.x != a || e._y != b) e.x = a, e.y = b;
		this._shadowOpacity != c && (this._shadowOpacity = c);
		this._setColorsString();
		this._shadowBlur != d && (this._shadowBlur = d);
		this._needUpdateTexture = !0
	},
	_getShadowOffsetX: function() {
		return this._shadowOffset.x
	},
	_setShadowOffsetX: function(a) {
		!1 === this._shadowEnabled && (this._shadowEnabled = !0);
		this._shadowOffset.x != a && (this._shadowOffset.x = a, this._needUpdateTexture = !0)
	},
	_getShadowOffsetY: function() {
		return this._shadowOffset._y
	},
	_setShadowOffsetY: function(a) {
		!1 === this._shadowEnabled && (this._shadowEnabled = !0);
		this._shadowOffset._y != a && (this._shadowOffset._y = a, this._needUpdateTexture = !0)
	},
	_getShadowOffset: function() {
		return cc.p(this._shadowOffset.x, this._shadowOffset.y)
	},
	_setShadowOffset: function(a) {
		!1 === this._shadowEnabled && (this._shadowEnabled = !0);
		if (this._shadowOffset.x != a.x || this._shadowOffset.y != a.y) this._shadowOffset.x = a.x, this._shadowOffset.y = a.y, this._needUpdateTexture = !0
	},
	_getShadowOpacity: function() {
		return this._shadowOpacity
	},
	_setShadowOpacity: function(a) {
		!1 === this._shadowEnabled && (this._shadowEnabled = !0);
		this._shadowOpacity != a && (this._shadowOpacity = a, this._setColorsString(), this._needUpdateTexture = !0)
	},
	_getShadowBlur: function() {
		return this._shadowBlur
	},
	_setShadowBlur: function(a) {
		!1 === this._shadowEnabled && (this._shadowEnabled = !0);
		this._shadowBlur != a && (this._shadowBlur = a, this._needUpdateTexture = !0)
	},
	disableShadow: function() {
		this._shadowEnabled && (this._shadowEnabled = !1, this._needUpdateTexture = !0)
	},
	enableStroke: function(a, b) {
		!1 === this._strokeEnabled && (this._strokeEnabled = !0);
		var c = this._strokeColor;
		if (c.r !== a.r || c.g !== a.g || c.b !== a.b) c.r = a.r, c.g = a.g, c.b = a.b, this._setColorsString();
		this._strokeSize !== b && (this._strokeSize = b || 0);
		this._needUpdateTexture = !0
	},
	_getStrokeStyle: function() {
		return this._strokeColor
	},
	_setStrokeStyle: function(a) {
		!1 === this._strokeEnabled && (this._strokeEnabled = !0);
		var b = this._strokeColor;
		if (b.r !== a.r || b.g !== a.g || b.b !== a.b) b.r = a.r, b.g = a.g, b.b = a.b, this._setColorsString(), this._needUpdateTexture = !0
	},
	_getLineWidth: function() {
		return this._strokeSize
	},
	_setLineWidth: function(a) {
		!1 === this._strokeEnabled && (this._strokeEnabled = !0);
		this._strokeSize !== a && (this._strokeSize = a || 0, this._needUpdateTexture = !0)
	},
	disableStroke: function() {
		this._strokeEnabled && (this._strokeEnabled = !1, this._needUpdateTexture = !0)
	},
	setFontFillColor: null,
	_getFillStyle: function() {
		return this._textFillColor
	},
	_updateWithTextDefinition: function(a, b) {
		a.fontDimensions ? (this._dimensions.width = a.boundingWidth, this._dimensions.height = a.boundingHeight) : (this._dimensions.width = 0, this._dimensions.height = 0);
		this._hAlignment = a.textAlign;
		this._vAlignment = a.verticalAlign;
		this._fontName = a.fontName;
		this._fontSize = a.fontSize || 12;
		this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
		this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, this._fontSize);
		a.shadowEnabled && this.enableShadow(a.shadowOffsetX, a.shadowOffsetY, a.shadowOpacity, a.shadowBlur);
		a.strokeEnabled && this.enableStroke(a.strokeStyle, a.lineWidth);
		this.setFontFillColor(a.fillStyle);
		b && this._updateTexture()
	},
	_prepareTextDefinition: function(a) {
		var b = new cc.FontDefinition;
		a ? (b.fontSize = this._fontSize, b.boundingWidth = cc.contentScaleFactor() * this._dimensions.width, b.boundingHeight = cc.contentScaleFactor() * this._dimensions.height) : (b.fontSize = this._fontSize, b.boundingWidth = this._dimensions.width, b.boundingHeight = this._dimensions.height);
		b.fontName = this._fontName;
		b.textAlign = this._hAlignment;
		b.verticalAlign = this._vAlignment;
		if (this._strokeEnabled) {
			b.strokeEnabled = !0;
			var c = this._strokeColor;
			b.strokeStyle = cc.color(c.r, c.g, c.b);
			b.lineWidth = this._strokeSize
		} else b.strokeEnabled = !1;
		this._shadowEnabled ? (b.shadowEnabled = !0, b.shadowBlur = this._shadowBlur, b.shadowOpacity = this._shadowOpacity, b.shadowOffsetX = (a ? cc.contentScaleFactor() : 1) * this._shadowOffset.x, b.shadowOffsetY = (a ? cc.contentScaleFactor() : 1) * this._shadowOffset.y) : b._shadowEnabled = !1;
		a = this._textFillColor;
		b.fillStyle = cc.color(a.r, a.g, a.b);
		return b
	},
	_fontClientHeight: 18,
	setString: function(a) {
		a = String(a);
		this._originalText != a && (this._originalText = a + "", this._updateString(), this._needUpdateTexture = !0)
	},
	_updateString: function() {
		this._string = this._originalText
	},
	setHorizontalAlignment: function(a) {
		a !== this._hAlignment && (this._hAlignment = a, this._needUpdateTexture = !0)
	},
	setVerticalAlignment: function(a) {
		a != this._vAlignment && (this._vAlignment = a, this._needUpdateTexture = !0)
	},
	setDimensions: function(a, b) {
		var c;
		void 0 === b ? (c = a.width, b = a.height) : c = a;
		if (c != this._dimensions.width || b != this._dimensions.height) this._dimensions.width = c, this._dimensions.height = b, this._updateString(), this._needUpdateTexture = !0
	},
	_getBoundingWidth: function() {
		return this._dimensions.width
	},
	_setBoundingWidth: function(a) {
		a != this._dimensions.width && (this._dimensions.width = a, this._updateString(), this._needUpdateTexture = !0)
	},
	_getBoundingHeight: function() {
		return this._dimensions.height
	},
	_setBoundingHeight: function(a) {
		a != this._dimensions.height && (this._dimensions.height = a, this._updateString(), this._needUpdateTexture = !0)
	},
	setFontSize: function(a) {
		this._fontSize !== a && (this._fontSize = a, this._fontStyleStr = a + "px '" + this._fontName + "'", this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, a), this._needUpdateTexture = !0)
	},
	setFontName: function(a) {
		this._fontName && this._fontName != a && (this._fontName = a, this._fontStyleStr = this._fontSize + "px '" + a + "'", this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(a, this._fontSize), this._needUpdateTexture = !0)
	},
	_getFont: function() {
		return this._fontStyleStr
	},
	_setFont: function(a) {
		var b = cc.LabelTTF._fontStyleRE.exec(a);
		b && (this._fontSize = parseInt(b[1]), this._fontName = b[2], this._fontStyleStr = a, this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, this._fontSize), this._needUpdateTexture = !0)
	},
	_drawTTFInCanvas: function(a) {
		if (a) {
			var b = this._strokeShadowOffsetX,
				c = this._strokeShadowOffsetY,
				d = this._contentSize.height - c,
				e = this._vAlignment,
				f = this._hAlignment,
				g = this._fontClientHeight,
				h = this._strokeSize;
			a.setTransform(1, 0, 0, 1, 0 + 0.5 * b, d + 0.5 * c);
			a.font != this._fontStyleStr && (a.font = this._fontStyleStr);
			a.fillStyle = this._fillColorStr;
			var k = c = 0,
				m = this._strokeEnabled;
			m && (a.lineWidth = 2 * h, a.strokeStyle = this._strokeColorStr);
			this._shadowEnabled && (h = this._shadowOffset, a.shadowColor = this._shadowColorStr, a.shadowOffsetX = h.x, a.shadowOffsetY = -h.y, a.shadowBlur = this._shadowBlur);
			a.textBaseline = cc.LabelTTF._textBaseline[e];
			a.textAlign = cc.LabelTTF._textAlign[f];
			b = this._contentSize.width - b;
			c = f === cc.TEXT_ALIGNMENT_RIGHT ? c + b : f === cc.TEXT_ALIGNMENT_CENTER ? c + b / 2 : c + 0;
			if (this._isMultiLine)
				for (f = this._strings.length, e === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM ? k = g + d - g * f : e === cc.VERTICAL_TEXT_ALIGNMENT_CENTER && (k = g / 2 + (d - g * f) / 2), e = 0; e < f; e++) b = this._strings[e], h = -d + g * e + k, m && a.strokeText(b, c, h), a.fillText(b, c, h);
			else e !== cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM && (k = e === cc.VERTICAL_TEXT_ALIGNMENT_TOP ? k - d : k - 0.5 * d), m && a.strokeText(this._string, c, k), a.fillText(this._string, c, k)
		}
	},
	_getLabelContext: function() {
		if (this._labelContext) return this._labelContext;
		if (!this._labelCanvas) {
			var a = cc.newElement("canvas"),
				b = new cc.Texture2D;
			b.initWithElement(a);
			this.texture = b;
			this._labelCanvas = a
		}
		return this._labelContext = this._labelCanvas.getContext("2d")
	},
	_checkWarp: function(a, b, c) {
		var d = a[b],
			e = this._measure(d);
		if (e > c && 1 < d.length) {
			for (var f = c / e * d.length | 0, g = d.substr(f), h = e - this._measure(g), k, m = 0, n = 0; h > c && 100 > n++;) f *= c / h, f |= 0, g = d.substr(f), h = e - this._measure(g);
			for (n = 0; h < c && 100 > n++;) g && (m = (k = cc.LabelTTF._wordRex.exec(g)) ? k[0].length : 1, k = g), f += m, g = d.substr(f), h = e - this._measure(g);
			f -= m;
			c = d.substr(0, f);
			cc.LabelTTF.wrapInspection && cc.LabelTTF._symbolRex.test(k || g) && (e = cc.LabelTTF._lastWordRex.exec(c), f -= e ? e[0].length : 0, k = d.substr(f), c = d.substr(0, f));
			cc.LabelTTF._firsrEnglish.test(k) && (e = cc.LabelTTF._lastEnglish.exec(c)) && c !== e[0] && (f -= e[0].length, k = d.substr(f), c = d.substr(0, f));
			a[b] = k || g;
			a.splice(b, 0, c)
		}
	},
	_updateTTF: function() {
		var a = this._dimensions.width,
			b, c, d = this._lineWidths;
		d.length = 0;
		this._isMultiLine = !1;
		this._measureConfig();
		if (0 !== a)
			for (this._strings = this._string.split("\n"), b = 0; b < this._strings.length; b++) this._checkWarp(this._strings, b, a);
		else
			for (this._strings = this._string.split("\n"), b = 0, c = this._strings.length; b < c; b++) d.push(this._measure(this._strings[b]));
		0 < this._strings.length && (this._isMultiLine = !0);
		c = b = 0;
		this._strokeEnabled && (b = c = 2 * this._strokeSize);
		if (this._shadowEnabled) {
			var e = this._shadowOffset;
			b += 2 * Math.abs(e.x);
			c += 2 * Math.abs(e.y)
		}
		a = 0 === a ? this._isMultiLine ? cc.size(0 | Math.max.apply(Math, d) + b, 0 | this._fontClientHeight * this._strings.length + c) : cc.size(0 | this._measure(this._string) + b, 0 | this._fontClientHeight + c) : 0 === this._dimensions.height ? this._isMultiLine ? cc.size(0 | a + b, 0 | this._fontClientHeight * this._strings.length + c) : cc.size(0 | a + b, 0 | this._fontClientHeight + c) : cc.size(0 | a + b, 0 | this._dimensions.height +
			c);
		this.setContentSize(a);
		this._strokeShadowOffsetX = b;
		this._strokeShadowOffsetY = c;
		d = this._anchorPoint;
		this._anchorPointInPoints.x = 0.5 * b + (a.width - b) * d.x;
		this._anchorPointInPoints.y = 0.5 * c + (a.height - c) * d.y
	},
	getContentSize: function() {
		this._needUpdateTexture && this._updateTTF();
		return cc.Sprite.prototype.getContentSize.call(this)
	},
	_getWidth: function() {
		this._needUpdateTexture && this._updateTTF();
		return cc.Sprite.prototype._getWidth.call(this)
	},
	_getHeight: function() {
		this._needUpdateTexture && this._updateTTF();
		return cc.Sprite.prototype._getHeight.call(this)
	},
	_updateTexture: function() {
		var a = this._getLabelContext(),
			b = this._labelCanvas,
			c = this._contentSize;
		if (0 === this._string.length) return b.width = 1, b.height = c.height || 1, this._texture && this._texture.handleLoadedTexture(), this.setTextureRect(cc.rect(0, 0, 1, c.height)), !0;
		a.font = this._fontStyleStr;
		this._updateTTF();
		var d = c.width,
			c = c.height,
			e = b.width == d && b.height == c;
		b.width = d;
		b.height = c;
		e && a.clearRect(0, 0, d, c);
		this._drawTTFInCanvas(a);
		this._texture && this._texture.handleLoadedTexture();
		this.setTextureRect(cc.rect(0, 0, d, c));
		return !0
	},
	visit: function(a) {
		this._string && "" != this._string && (this._needUpdateTexture && (this._needUpdateTexture = !1, this._updateTexture()), cc.Sprite.prototype.visit.call(this, a || cc._renderContext))
	},
	draw: null,
	_setTextureCoords: function(a) {
		var b = this._batchNode ? this.textureAtlas.texture : this._texture;
		if (b) {
			var c = b.pixelsWidth,
				d = b.pixelsHeight,
				e, f = this._quad;
			this._rectRotated ? (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (b = (2 * a.x + 1) / (2 * c), c = b + (2 * a.height - 2) / (2 * c), e = (2 * a.y +
				1) / (2 * d), a = e + (2 * a.width - 2) / (2 * d)) : (b = a.x / c, c = (a.x + a.height) / c, e = a.y / d, a = (a.y + a.width) / d), this._flippedX && (d = e, e = a, a = d), this._flippedY && (d = b, b = c, c = d), f.bl.texCoords.u = b, f.bl.texCoords.v = e, f.br.texCoords.u = b, f.br.texCoords.v = a, f.tl.texCoords.u = c, f.tl.texCoords.v = e, f.tr.texCoords.u = c, f.tr.texCoords.v = a) : (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (b = (2 * a.x + 1) / (2 * c), c = b + (2 * a.width - 2) / (2 * c), e = (2 * a.y + 1) / (2 * d), a = e + (2 * a.height - 2) / (2 * d)) : (b = a.x / c, c = (a.x + a.width) / c, e = a.y / d, a = (a.y + a.height) / d), this._flippedX && (d = b, b = c, c = d), this._flippedY && (d = e, e = a, a = d), f.bl.texCoords.u = b, f.bl.texCoords.v = a, f.br.texCoords.u = c, f.br.texCoords.v = a, f.tl.texCoords.u = b, f.tl.texCoords.v = e, f.tr.texCoords.u = c, f.tr.texCoords.v = e);
			this._quadDirty = !0
		}
	}
});
cc._renderType === cc._RENDER_TYPE_CANVAS ? (_p = cc.LabelTTF.prototype, _p.setColor = function(a) {
	cc.Node.prototype.setColor.call(this, a);
	this._setColorsString()
}, _p._setColorsString = function() {
	this._needUpdateTexture = !0;
	var a = this._displayedColor,
		b = this._displayedOpacity,
		c = this._strokeColor,
		d = this._textFillColor;
	this._shadowColorStr = "rgba(" + (0 | 0.5 * a.r) + "," + (0 | 0.5 * a.g) + "," + (0 | 0.5 * a.b) + "," + this._shadowOpacity + ")";
	this._fillColorStr = "rgba(" + (0 | a.r / 255 * d.r) + "," + (0 | a.g / 255 * d.g) + "," + (0 | a.b / 255 * d.b) + ", " + b / 255 + ")";
	this._strokeColorStr = "rgba(" + (0 | a.r / 255 * c.r) + "," + (0 | a.g / 255 * c.g) + "," + (0 | a.b / 255 * c.b) + ", " + b / 255 + ")"
}, _p.updateDisplayedColor = function(a) {
	cc.Node.prototype.updateDisplayedColor.call(this, a);
	this._setColorsString()
}, _p.setOpacity = function(a) {
	this._opacity !== a && (cc.Sprite.prototype.setOpacity.call(this, a), this._setColorsString(), this._needUpdateTexture = !0)
}, _p.updateDisplayedOpacity = cc.Sprite.prototype.updateDisplayedOpacity, _p.initWithStringAndTextDefinition = function(a, b) {
	this._updateWithTextDefinition(b, !1);
	this.string = a;
	return !0
}, _p.setFontFillColor = function(a) {
	var b = this._textFillColor;
	if (b.r != a.r || b.g != a.g || b.b != a.b) b.r = a.r, b.g = a.g, b.b = a.b, this._setColorsString(), this._needUpdateTexture = !0
}, _p.draw = cc.Sprite.prototype.draw, _p.setTextureRect = function(a, b, c) {
	this._rectRotated = b || !1;
	this.setContentSize(c || a);
	this.setVertexRect(a);
	b = this._textureRect_Canvas;
	b.x = a.x;
	b.y = a.y;
	b.width = a.width;
	b.height = a.height;
	b.validRect = !(0 === b.width || 0 === b.height || 0 > b.x || 0 > b.y);
	a = this._unflippedOffsetPositionFromCenter;
	this._flippedX && (a.x = -a.x);
	this._flippedY && (a.y = -a.y);
	this._offsetPosition.x = a.x + (this._contentSize.width - this._rect.width) / 2;
	this._offsetPosition.y = a.y + (this._contentSize.height - this._rect.height) / 2;
	this._batchNode && (this.dirty = !0)
}, _p = null) : (cc.assert(cc.isFunction(cc._tmp.WebGLLabelTTF), cc._LogInfos.MissingFile, "LabelTTFWebGL.js"), cc._tmp.WebGLLabelTTF(), delete cc._tmp.WebGLLabelTTF);
cc.assert(cc.isFunction(cc._tmp.PrototypeLabelTTF), cc._LogInfos.MissingFile, "LabelTTFPropertyDefine.js");
cc._tmp.PrototypeLabelTTF();
delete cc._tmp.PrototypeLabelTTF;
cc.LabelTTF._textAlign = ["left", "center", "right"];
cc.LabelTTF._textBaseline = ["top", "middle", "bottom"];
cc.LabelTTF.wrapInspection = !0;
cc.LabelTTF._wordRex = /([a-zA-Z0-9\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u00e9\u00e8\u00e7\u00e0\u00f9\u00ea\u00e2\u00ee\u00f4\u00fb]+|\S)/;
cc.LabelTTF._symbolRex = /^[!,.:;}\]%\?>\u3001\u2018\u201c\u300b\uff1f\u3002\uff0c\uff01]/;
cc.LabelTTF._lastWordRex = /([a-zA-Z0-9\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u00e9\u00e8\u00e7\u00e0\u00f9\u00ea\u00e2\u00ee\u00f4\u00fb]+|\S)$/;
cc.LabelTTF._lastEnglish = /[a-zA-Z0-9\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u00e9\u00e8\u00e7\u00e0\u00f9\u00ea\u00e2\u00ee\u00f4\u00fb]+$/;
cc.LabelTTF._firsrEnglish = /^[a-zA-Z0-9\u00c4\u00d6\u00dc\u00e4\u00f6\u00fc\u00df\u00e9\u00e8\u00e7\u00e0\u00f9\u00ea\u00e2\u00ee\u00f4\u00fb]/;
cc.LabelTTF._fontStyleRE = /^(\d+)px\s+['"]?([\w\s\d]+)['"]?$/;
cc.LabelTTF.create = function(a, b, c, d, e, f) {
	return new cc.LabelTTF(a, b, c, d, e, f)
};
cc.LabelTTF.createWithFontDefinition = cc.LabelTTF.create;
cc.LabelTTF._SHADER_PROGRAM = cc.USE_LA88_LABELS ? cc.SHADER_POSITION_TEXTURECOLOR : cc.SHADER_POSITION_TEXTUREA8COLOR;
cc.LabelTTF.__labelHeightDiv = cc.newElement("div");
cc.LabelTTF.__labelHeightDiv.style.fontFamily = "Arial";
cc.LabelTTF.__labelHeightDiv.style.position = "absolute";
cc.LabelTTF.__labelHeightDiv.style.left = "-100px";
cc.LabelTTF.__labelHeightDiv.style.top = "-100px";
cc.LabelTTF.__labelHeightDiv.style.lineHeight = "normal";
document.body ? document.body.appendChild(cc.LabelTTF.__labelHeightDiv) : cc._addEventListener(window, "load", function() {
	this.removeEventListener("load", arguments.callee, !1);
	document.body.appendChild(cc.LabelTTF.__labelHeightDiv)
}, !1);
cc.LabelTTF.__getFontHeightByDiv = function(a, b) {
	var c = cc.LabelTTF.__fontHeightCache[a + "." + b];
	if (0 < c) return c;
	var d = cc.LabelTTF.__labelHeightDiv;
	d.innerHTML = "ajghl~!";
	d.style.fontFamily = a;
	d.style.fontSize = b + "px";
	c = d.clientHeight;
	cc.LabelTTF.__fontHeightCache[a + "." + b] = c;
	d.innerHTML = "";
	return c
};
cc.LabelTTF.__fontHeightCache = {};
cc.HashElement = cc.Class.extend({
	actions: null,
	target: null,
	actionIndex: 0,
	currentAction: null,
	currentActionSalvaged: !1,
	paused: !1,
	hh: null,
	ctor: function() {
		this.actions = [];
		this.target = null;
		this.actionIndex = 0;
		this.currentAction = null;
		this.paused = this.currentActionSalvaged = !1;
		this.hh = null
	}
});
cc.ActionManager = cc.Class.extend({
	_hashTargets: null,
	_arrayTargets: null,
	_currentTarget: null,
	_currentTargetSalvaged: !1,
	_searchElementByTarget: function(a, b) {
		for (var c = 0; c < a.length; c++)
			if (b == a[c].target) return a[c];
		return null
	},
	ctor: function() {
		this._hashTargets = {};
		this._arrayTargets = [];
		this._currentTarget = null;
		this._currentTargetSalvaged = !1
	},
	addAction: function(a, b, c) {
		if (!a) throw "cc.ActionManager.addAction(): action must be non-null";
		if (!b) throw "cc.ActionManager.addAction(): action must be non-null";
		var d = this._hashTargets[b.__instanceId];
		d || (d = new cc.HashElement, d.paused = c, d.target = b, this._hashTargets[b.__instanceId] = d, this._arrayTargets.push(d));
		this._actionAllocWithHashElement(d);
		d.actions.push(a);
		a.startWithTarget(b)
	},
	removeAllActions: function() {
		for (var a = this._arrayTargets, b = 0; b < a.length; b++) {
			var c = a[b];
			c && this.removeAllActionsFromTarget(c.target, !0)
		}
	},
	removeAllActionsFromTarget: function(a, b) {
		if (null != a) {
			var c = this._hashTargets[a.__instanceId];
			c && (-1 === c.actions.indexOf(c.currentAction) || c.currentActionSalvaged || (c.currentActionSalvaged = !0), c.actions.length = 0, this._currentTarget != c || b ? this._deleteHashElement(c) : this._currentTargetSalvaged = !0)
		}
	},
	removeAction: function(a) {
		if (null != a) {
			var b = a.getOriginalTarget();
			if (b = this._hashTargets[b.__instanceId])
				for (var c = 0; c < b.actions.length; c++) {
					if (b.actions[c] == a) {
						b.actions.splice(c, 1);
						break
					}
				} else cc.log(cc._LogInfos.ActionManager_removeAction)
		}
	},
	removeActionByTag: function(a, b) {
		a == cc.ACTION_TAG_INVALID && cc.log(cc._LogInfos.ActionManager_addAction);
		cc.assert(b, cc._LogInfos.ActionManager_addAction);
		var c = this._hashTargets[b.__instanceId];
		if (c)
			for (var d = c.actions.length, e = 0; e < d; ++e) {
				var f = c.actions[e];
				if (f && f.getTag() === a && f.getOriginalTarget() == b) {
					this._removeActionAtIndex(e, c);
					break
				}
			}
	},
	getActionByTag: function(a, b) {
		a == cc.ACTION_TAG_INVALID && cc.log(cc._LogInfos.ActionManager_getActionByTag);
		var c = this._hashTargets[b.__instanceId];
		if (c) {
			if (null != c.actions)
				for (var d = 0; d < c.actions.length; ++d) {
					var e = c.actions[d];
					if (e && e.getTag() === a) return e
				}
			cc.log(cc._LogInfos.ActionManager_getActionByTag_2, a)
		}
		return null
	},
	numberOfRunningActionsInTarget: function(a) {
		return (a = this._hashTargets[a.__instanceId]) ? a.actions ? a.actions.length : 0 : 0
	},
	pauseTarget: function(a) {
		(a = this._hashTargets[a.__instanceId]) && (a.paused = !0)
	},
	resumeTarget: function(a) {
		(a = this._hashTargets[a.__instanceId]) && (a.paused = !1)
	},
	pauseAllRunningActions: function() {
		for (var a = [], b = this._arrayTargets, c = 0; c < b.length; c++) {
			var d = b[c];
			d && !d.paused && (d.paused = !0, a.push(d.target))
		}
		return a
	},
	resumeTargets: function(a) {
		if (a)
			for (var b = 0; b < a.length; b++) a[b] && this.resumeTarget(a[b])
	},
	purgeSharedManager: function() {
		cc.director.getScheduler().unscheduleUpdateForTarget(this)
	},
	_removeActionAtIndex: function(a, b) {
		b.actions[a] != b.currentAction || b.currentActionSalvaged || (b.currentActionSalvaged = !0);
		b.actions.splice(a, 1);
		b.actionIndex >= a && b.actionIndex--;
		0 == b.actions.length && (this._currentTarget == b ? this._currentTargetSalvaged = !0 : this._deleteHashElement(b))
	},
	_deleteHashElement: function(a) {
		a && (delete this._hashTargets[a.target.__instanceId], cc.arrayRemoveObject(this._arrayTargets, a), a.actions = null, a.target = null)
	},
	_actionAllocWithHashElement: function(a) {
		null == a.actions && (a.actions = [])
	},
	update: function(a) {
		for (var b = this._arrayTargets, c, d = 0; d < b.length; d++) {
			c = this._currentTarget = b[d];
			if (!c.paused)
				for (c.actionIndex = 0; c.actionIndex < c.actions.length; c.actionIndex++)
					if (c.currentAction = c.actions[c.actionIndex], c.currentAction) {
						c.currentActionSalvaged = !1;
						c.currentAction.step(a * (c.currentAction._speedMethod ? c.currentAction._speed : 1));
						if (c.currentActionSalvaged) c.currentAction = null;
						else if (c.currentAction.isDone()) {
							c.currentAction.stop();
							var e = c.currentAction;
							c.currentAction = null;
							this.removeAction(e)
						}
						c.currentAction = null
					}
			this._currentTargetSalvaged && 0 === c.actions.length && this._deleteHashElement(c)
		}
	}
});
cc.kmScalar = Number;
cc.kmBool = Number;
cc.kmEnum = Number;
cc.KM_FALSE = 0;
cc.KM_TRUE = 1;
cc.kmPI = 3.141592;
cc.kmPIOver180 = 0.017453;
cc.kmPIUnder180 = 57.295779;
cc.kmEpsilon = 0.015625;
cc.kmSQR = function(a) {
	return a * a
};
cc.kmDegreesToRadians = function(a) {
	return a * cc.kmPIOver180
};
cc.kmRadiansToDegrees = function(a) {
	return a * cc.kmPIUnder180
};
cc.kmMin = function(a, b) {
	return a < b ? a : b
};
cc.kmMax = function(a, b) {
	return a > b ? a : b
};
cc.kmAlmostEqual = function(a, b) {
	return a + cc.kmEpsilon > b && a - cc.kmEpsilon < b
};
cc.kmVec2 = function(a, b) {
	this.x = a || 0;
	this.y = b || 0
};
cc.kmVec2Fill = function(a, b, c) {
	a.x = b;
	a.y = c;
	return a
};
cc.kmVec2Length = function(a) {
	return Math.sqrt(cc.kmSQR(a.x) + cc.kmSQR(a.y))
};
cc.kmVec2LengthSq = function(a) {
	return cc.kmSQR(a.x) + cc.kmSQR(a.y)
};
cc.kmVec2Normalize = function(a, b) {
	var c = 1 / cc.kmVec2Length(b),
		d = new cc.kmVec2;
	d.x = b.x * c;
	d.y = b.y * c;
	a.x = d.x;
	a.y = d.y;
	return a
};
cc.kmVec2Add = function(a, b, c) {
	a.x = b.x + c.x;
	a.y = b.y + c.y;
	return a
};
cc.kmVec2Dot = function(a, b) {
	return a.x * b.x + a.y * b.y
};
cc.kmVec2Subtract = function(a, b, c) {
	a.x = b.x - c.x;
	a.y = b.y - c.y;
	return a
};
cc.kmVec2Transform = function(a, b, c) {
	var d = new cc.kmVec2;
	d.x = b.x * c.mat[0] + b.y * c.mat[3] + c.mat[6];
	d.y = b.x * c.mat[1] + b.y * c.mat[4] + c.mat[7];
	a.x = d.x;
	a.y = d.y;
	return a
};
cc.kmVec2TransformCoord = function(a, b, c) {
	return null
};
cc.kmVec2Scale = function(a, b, c) {
	a.x = b.x * c;
	a.y = b.y * c;
	return a
};
cc.kmVec2AreEqual = function(a, b) {
	return a.x < b.x + cc.kmEpsilon && a.x > b.x - cc.kmEpsilon && a.y < b.y + cc.kmEpsilon && a.y > b.y - cc.kmEpsilon
};
cc.kmVec3 = function(a, b, c) {
	this.x = a || 0;
	this.y = b || 0;
	this.z = c || 0
};
cc.kmVec3Fill = function(a, b, c, d) {
	if (!a) return new cc.kmVec3(b, c, d);
	a.x = b;
	a.y = c;
	a.z = d;
	return a
};
cc.kmVec3Length = function(a) {
	return Math.sqrt(cc.kmSQR(a.x) + cc.kmSQR(a.y) + cc.kmSQR(a.z))
};
cc.kmVec3LengthSq = function(a) {
	return cc.kmSQR(a.x) + cc.kmSQR(a.y) + cc.kmSQR(a.z)
};
cc.kmVec3Normalize = function(a, b) {
	var c = 1 / cc.kmVec3Length(b);
	a.x = b.x * c;
	a.y = b.y * c;
	a.z = b.z * c;
	return a
};
cc.kmVec3Cross = function(a, b, c) {
	a.x = b.y * c.z - b.z * c.y;
	a.y = b.z * c.x - b.x * c.z;
	a.z = b.x * c.y - b.y * c.x;
	return a
};
cc.kmVec3Dot = function(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z
};
cc.kmVec3Add = function(a, b, c) {
	a.x = b.x + c.x;
	a.y = b.y + c.y;
	a.z = b.z + c.z;
	return a
};
cc.kmVec3Subtract = function(a, b, c) {
	a.x = b.x - c.x;
	a.y = b.y - c.y;
	a.z = b.z - c.z;
	return a
};
cc.kmVec3Transform = function(a, b, c) {
	a.x = b.x * c.mat[0] + b.y * c.mat[4] + b.z * c.mat[8] + c.mat[12];
	a.y = b.x * c.mat[1] + b.y * c.mat[5] + b.z * c.mat[9] + c.mat[13];
	a.z = b.x * c.mat[2] + b.y * c.mat[6] + b.z * c.mat[10] + c.mat[14];
	return a
};
cc.kmVec3TransformNormal = function(a, b, c) {
	a.x = b.x * c.mat[0] + b.y * c.mat[4] + b.z * c.mat[8];
	a.y = b.x * c.mat[1] + b.y * c.mat[5] + b.z * c.mat[9];
	a.z = b.x * c.mat[2] + b.y * c.mat[6] + b.z * c.mat[10];
	return a
};
cc.kmVec3TransformCoord = function(a, b, c) {
	var d = new cc.kmVec4,
		e = new cc.kmVec4;
	cc.kmVec4Fill(e, b.x, b.y, b.z, 1);
	cc.kmVec4Transform(d, e, c);
	a.x = d.x / d.w;
	a.y = d.y / d.w;
	a.z = d.z / d.w;
	return a
};
cc.kmVec3Scale = function(a, b, c) {
	a.x = b.x * c;
	a.y = b.y * c;
	a.z = b.z * c;
	return a
};
cc.kmVec3AreEqual = function(a, b) {
	return a.x < b.x + cc.kmEpsilon && a.x > b.x - cc.kmEpsilon && a.y < b.y + cc.kmEpsilon && a.y > b.y - cc.kmEpsilon && a.z < b.z + cc.kmEpsilon && a.z > b.z - cc.kmEpsilon ? 1 : 0
};
cc.kmVec3InverseTransform = function(a, b, c) {
	b = new cc.kmVec3(b.x - c.mat[12], b.y - c.mat[13], b.z - c.mat[14]);
	a.x = b.x * c.mat[0] + b.y * c.mat[1] + b.z * c.mat[2];
	a.y = b.x * c.mat[4] + b.y * c.mat[5] + b.z * c.mat[6];
	a.z = b.x * c.mat[8] + b.y * c.mat[9] + b.z * c.mat[10];
	return a
};
cc.kmVec3InverseTransformNormal = function(a, b, c) {
	a.x = b.x * c.mat[0] + b.y * c.mat[1] + b.z * c.mat[2];
	a.y = b.x * c.mat[4] + b.y * c.mat[5] + b.z * c.mat[6];
	a.z = b.x * c.mat[8] + b.y * c.mat[9] + b.z * c.mat[10];
	return a
};
cc.kmVec3Assign = function(a, b) {
	if (a == b) return a;
	a.x = b.x;
	a.y = b.y;
	a.z = b.z;
	return a
};
cc.kmVec3Zero = function(a) {
	a.x = 0;
	a.y = 0;
	a.z = 0;
	return a
};
cc.kmVec3ToTypeArray = function(a) {
	if (!a) return null;
	var b = new Float32Array(3);
	b[0] = a.x;
	b[1] = a.y;
	b[2] = a.z;
	return b
};
cc.kmVec4 = function(a, b, c, d) {
	this.x = a || 0;
	this.y = b || 0;
	this.z = c || 0;
	this.w = d || 0
};
cc.kmVec4Fill = function(a, b, c, d, e) {
	a.x = b;
	a.y = c;
	a.z = d;
	a.w = e;
	return a
};
cc.kmVec4Add = function(a, b, c) {
	a.x = b.x + c.x;
	a.y = b.y + c.y;
	a.z = b.z + c.z;
	a.w = b.w + c.w;
	return a
};
cc.kmVec4Dot = function(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w
};
cc.kmVec4Length = function(a) {
	return Math.sqrt(cc.kmSQR(a.x) + cc.kmSQR(a.y) + cc.kmSQR(a.z) + cc.kmSQR(a.w))
};
cc.kmVec4LengthSq = function(a) {
	return cc.kmSQR(a.x) + cc.kmSQR(a.y) + cc.kmSQR(a.z) + cc.kmSQR(a.w)
};
cc.kmVec4Lerp = function(a, b, c, d) {
	return a
};
cc.kmVec4Normalize = function(a, b) {
	var c = 1 / cc.kmVec4Length(b);
	a.x *= c;
	a.y *= c;
	a.z *= c;
	a.w *= c;
	return a
};
cc.kmVec4Scale = function(a, b, c) {
	cc.kmVec4Normalize(a, b);
	a.x *= c;
	a.y *= c;
	a.z *= c;
	a.w *= c;
	return a
};
cc.kmVec4Subtract = function(a, b, c) {
	a.x = b.x - c.x;
	a.y = b.y - c.y;
	a.z = b.z - c.z;
	a.w = b.w - c.w;
	return a
};
cc.kmVec4Transform = function(a, b, c) {
	a.x = b.x * c.mat[0] + b.y * c.mat[4] + b.z * c.mat[8] + b.w * c.mat[12];
	a.y = b.x * c.mat[1] + b.y * c.mat[5] + b.z * c.mat[9] + b.w * c.mat[13];
	a.z = b.x * c.mat[2] + b.y * c.mat[6] + b.z * c.mat[10] + b.w * c.mat[14];
	a.w = b.x * c.mat[3] + b.y * c.mat[7] + b.z * c.mat[11] + b.w * c.mat[15];
	return a
};
cc.kmVec4TransformArray = function(a, b, c, d, e, f) {
	for (var g = 0; g < f;) cc.kmVec4Transform(a + g * b, c + g * d, e), ++g;
	return a
};
cc.kmVec4AreEqual = function(a, b) {
	return a.x < b.x + cc.kmEpsilon && a.x > b.x - cc.kmEpsilon && a.y < b.y + cc.kmEpsilon && a.y > b.y - cc.kmEpsilon && a.z < b.z + cc.kmEpsilon && a.z > b.z - cc.kmEpsilon && a.w < b.w + cc.kmEpsilon && a.w > b.w - cc.kmEpsilon
};
cc.kmVec4Assign = function(a, b) {
	if (a == b) return cc.log("destVec and srcVec are same object"), a;
	a.x = b.x;
	a.y = b.y;
	a.z = b.z;
	a.w = b.w;
	return a
};
cc.kmVec4ToTypeArray = function(a) {
	if (!a) return null;
	var b = new Float32Array(4);
	b[0] = a.x;
	b[1] = a.y;
	b[2] = a.z;
	b[3] = a.w;
	return b
};
cc.kmRay2 = function(a, b) {
	this.start = a || new cc.kmVec2;
	this.start = a || new cc.kmVec2
};
cc.kmRay2Fill = function(a, b, c, d, e) {
	a.start.x = b;
	a.start.y = c;
	a.dir.x = d;
	a.dir.y = e
};
cc.kmRay2IntersectLineSegment = function(a, b, c, d) {
	var e = a.start.x,
		f = a.start.y,
		g = a.start.x + a.dir.x;
	a = a.start.y + a.dir.y;
	var h = b.x,
		k = b.y,
		m = c.x,
		n = c.y,
		q = (n - k) * (g - e) - (m - h) * (a - f);
	if (q > -cc.kmEpsilon && q < cc.kmEpsilon) return cc.KM_FALSE;
	k = ((m - h) * (f - k) - (n - k) * (e - h)) / q;
	h = e + k * (g - e);
	k = f + k * (a - f);
	if (h < cc.kmMin(b.x, c.x) - cc.kmEpsilon || h > cc.kmMax(b.x, c.x) + cc.kmEpsilon || k < cc.kmMin(b.y, c.y) - cc.kmEpsilon || k > cc.kmMax(b.y, c.y) + cc.kmEpsilon || h < cc.kmMin(e, g) - cc.kmEpsilon || h > cc.kmMax(e, g) + cc.kmEpsilon || k < cc.kmMin(f, a) - cc.kmEpsilon || k > cc.kmMax(f, a) + cc.kmEpsilon) return cc.KM_FALSE;
	d.x = h;
	d.y = k;
	return cc.KM_TRUE
};
cc.calculate_line_normal = function(a, b, c) {
	var d = new cc.kmVec2;
	cc.kmVec2Subtract(d, b, a);
	c.x = -d.y;
	c.y = d.x;
	cc.kmVec2Normalize(c, c)
};
cc.kmRay2IntersectTriangle = function(a, b, c, d, e, f) {
	var g = new cc.kmVec2,
		h = new cc.kmVec2,
		k = new cc.kmVec2,
		m = 1E4,
		n = cc.KM_FALSE,
		q;
	cc.kmRay2IntersectLineSegment(a, b, c, g) && (q = new cc.kmVec2, n = cc.KM_TRUE, q = cc.kmVec2Length(cc.kmVec2Subtract(q, g, a.start)), q < m && (h.x = g.x, h.y = g.y, m = q, cc.calculate_line_normal(b, c, k)));
	cc.kmRay2IntersectLineSegment(a, c, d, g) && (q = new cc.kmVec2, n = cc.KM_TRUE, q = cc.kmVec2Length(cc.kmVec2Subtract(q, g, a.start)), q < m && (h.x = g.x, h.y = g.y, m = q, cc.calculate_line_normal(c, d, k)));
	cc.kmRay2IntersectLineSegment(a, d, b, g) && (q = new cc.kmVec2, n = cc.KM_TRUE, q = cc.kmVec2Length(cc.kmVec2Subtract(q, g, a.start)), q < m && (h.x = g.x, h.y = g.y, cc.calculate_line_normal(d, b, k)));
	n && (e.x = h.x, e.y = h.y, f && (f.x = k.x, f.y = k.y));
	return n
};
cc.kmRay2IntersectCircle = function(a, b, c, d) {
	cc.log("cc.kmRay2IntersectCircle() has not been implemented.")
};
var Float32Array = Float32Array || Array;
cc.kmMat3 = function() {
	this.mat = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0])
};
cc.kmMat3Fill = function(a, b) {
	for (var c = 0; 9 > c; c++) a.mat[c] = b;
	return a
};
cc.kmMat3Adjugate = function(a, b) {
	a.mat[0] = b.mat[4] * b.mat[8] - b.mat[5] * b.mat[7];
	a.mat[1] = b.mat[2] * b.mat[7] - b.mat[1] * b.mat[8];
	a.mat[2] = b.mat[1] * b.mat[5] - b.mat[2] * b.mat[4];
	a.mat[3] = b.mat[5] * b.mat[6] - b.mat[3] * b.mat[8];
	a.mat[4] = b.mat[0] * b.mat[8] - b.mat[2] * b.mat[6];
	a.mat[5] = b.mat[2] * b.mat[3] - b.mat[0] * b.mat[5];
	a.mat[6] = b.mat[3] * b.mat[7] - b.mat[4] * b.mat[6];
	a.mat[8] = b.mat[0] * b.mat[4] - b.mat[1] * b.mat[3];
	return a
};
cc.kmMat3Identity = function(a) {
	a.mat[1] = a.mat[2] = a.mat[3] = a.mat[5] = a.mat[6] = a.mat[7] = 0;
	a.mat[0] = a.mat[4] = a.mat[8] = 1;
	return a
};
cc.kmMat3Inverse = function(a, b, c) {
	var d = new cc.kmMat3;
	if (0 === b) return null;
	b = 1 / b;
	cc.kmMat3Adjugate(d, c);
	cc.kmMat3ScalarMultiply(a, d, b);
	return a
};
cc.kmMat3._identity = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
cc.kmMat3IsIdentity = function(a) {
	for (var b = 0; 9 > b; b++)
		if (cc.kmMat3._identity[b] !== a.mat[b]) return !1;
	return !0
};
cc.kmMat3Transpose = function(a, b) {
	var c, d;
	for (c = 0; 3 > c; ++c)
		for (d = 0; 3 > d; ++d) a.mat[3 * c + d] = b.mat[3 * d + c];
	return a
};
cc.kmMat3Determinant = function(a) {
	var b;
	b = a.mat[0] * a.mat[4] * a.mat[8] + a.mat[1] * a.mat[5] * a.mat[6] + a.mat[2] * a.mat[3] * a.mat[7];
	return b -= a.mat[2] * a.mat[4] * a.mat[6] + a.mat[0] * a.mat[5] * a.mat[7] + a.mat[1] * a.mat[3] * a.mat[8]
};
cc.kmMat3Multiply = function(a, b, c) {
	b = b.mat;
	c = c.mat;
	a.mat[0] = b[0] * c[0] + b[3] * c[1] + b[6] * c[2];
	a.mat[1] = b[1] * c[0] + b[4] * c[1] + b[7] * c[2];
	a.mat[2] = b[2] * c[0] + b[5] * c[1] + b[8] * c[2];
	a.mat[3] = b[0] * c[3] + b[3] * c[4] + b[6] * c[5];
	a.mat[4] = b[1] * c[3] + b[4] * c[4] + b[7] * c[5];
	a.mat[5] = b[2] * c[3] + b[5] * c[4] + b[8] * c[5];
	a.mat[6] = b[0] * c[6] + b[3] * c[7] + b[6] * c[8];
	a.mat[7] = b[1] * c[6] + b[4] * c[7] + b[7] * c[8];
	a.mat[8] = b[2] * c[6] + b[5] * c[7] + b[8] * c[8];
	return a
};
cc.kmMat3ScalarMultiply = function(a, b, c) {
	for (var d = 0; 9 > d; d++) a.mat[d] = b.mat[d] * c;
	return a
};
cc.kmMat3RotationAxisAngle = function(a, b, c) {
	var d = Math.cos(c);
	c = Math.sin(c);
	a.mat[0] = d + b.x * b.x * (1 - d);
	a.mat[1] = b.z * c + b.y * b.x * (1 - d);
	a.mat[2] = -b.y * c + b.z * b.x * (1 - d);
	a.mat[3] = -b.z * c + b.x * b.y * (1 - d);
	a.mat[4] = d + b.y * b.y * (1 - d);
	a.mat[5] = b.x * c + b.z * b.y * (1 - d);
	a.mat[6] = b.y * c + b.x * b.z * (1 - d);
	a.mat[7] = -b.x * c + b.y * b.z * (1 - d);
	a.mat[8] = d + b.z * b.z * (1 - d);
	return a
};
cc.kmMat3Assign = function(a, b) {
	if (a == b) return cc.log("cc.kmMat3Assign(): pOut equals pIn"), a;
	for (var c = 0; 9 > c; c++) a.mat[c] = b.mat[c];
	return a
};
cc.kmMat3AreEqual = function(a, b) {
	if (a == b) return !0;
	for (var c = 0; 9 > c; ++c)
		if (!(a.mat[c] + cc.kmEpsilon > b.mat[c] && a.mat[c] - cc.kmEpsilon < b.mat[c])) return !1;
	return !0
};
cc.kmMat3RotationX = function(a, b) {
	a.mat[0] = 1;
	a.mat[1] = 0;
	a.mat[2] = 0;
	a.mat[3] = 0;
	a.mat[4] = Math.cos(b);
	a.mat[5] = Math.sin(b);
	a.mat[6] = 0;
	a.mat[7] = -Math.sin(b);
	a.mat[8] = Math.cos(b);
	return a
};
cc.kmMat3RotationY = function(a, b) {
	a.mat[0] = Math.cos(b);
	a.mat[1] = 0;
	a.mat[2] = -Math.sin(b);
	a.mat[3] = 0;
	a.mat[4] = 1;
	a.mat[5] = 0;
	a.mat[6] = Math.sin(b);
	a.mat[7] = 0;
	a.mat[8] = Math.cos(b);
	return a
};
cc.kmMat3RotationZ = function(a, b) {
	a.mat[0] = Math.cos(b);
	a.mat[1] = -Math.sin(b);
	a.mat[2] = 0;
	a.mat[3] = Math.sin(b);
	a.mat[4] = Math.cos(b);
	a.mat[5] = 0;
	a.mat[6] = 0;
	a.mat[7] = 0;
	a.mat[8] = 1;
	return a
};
cc.kmMat3Rotation = function(a, b) {
	a.mat[0] = Math.cos(b);
	a.mat[1] = Math.sin(b);
	a.mat[2] = 0;
	a.mat[3] = -Math.sin(b);
	a.mat[4] = Math.cos(b);
	a.mat[5] = 0;
	a.mat[6] = 0;
	a.mat[7] = 0;
	a.mat[8] = 1;
	return a
};
cc.kmMat3Scaling = function(a, b, c) {
	cc.kmMat3Identity(a);
	a.mat[0] = b;
	a.mat[4] = c;
	return a
};
cc.kmMat3Translation = function(a, b, c) {
	cc.kmMat3Identity(a);
	a.mat[6] = b;
	a.mat[7] = c;
	return a
};
cc.kmMat3RotationQuaternion = function(a, b) {
	if (!b || !a) return null;
	a.mat[0] = 1 - 2 * (b.y * b.y + b.z * b.z);
	a.mat[1] = 2 * (b.x * b.y - b.w * b.z);
	a.mat[2] = 2 * (b.x * b.z + b.w * b.y);
	a.mat[3] = 2 * (b.x * b.y + b.w * b.z);
	a.mat[4] = 1 - 2 * (b.x * b.x + b.z * b.z);
	a.mat[5] = 2 * (b.y * b.z - b.w * b.x);
	a.mat[6] = 2 * (b.x * b.z - b.w * b.y);
	a.mat[7] = 2 * (b.y * b.z + b.w * b.x);
	a.mat[8] = 1 - 2 * (b.x * b.x + b.y * b.y);
	return a
};
cc.kmMat3RotationToAxisAngle = function(a, b, c) {
	cc.kmQuaternionRotationMatrix(void 0, c);
	cc.kmQuaternionToAxisAngle(void 0, a, b);
	return a
};
cc.kmMat4 = function() {
	this.mat = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
};
cc.kmMat4Fill = function(a, b) {
	a.mat[0] = a.mat[1] = a.mat[2] = a.mat[3] = a.mat[4] = a.mat[5] = a.mat[6] = a.mat[7] = a.mat[8] = a.mat[9] = a.mat[10] = a.mat[11] = a.mat[12] = a.mat[13] = a.mat[14] = a.mat[15] = b
};
cc.kmMat4Identity = function(a) {
	a.mat[1] = a.mat[2] = a.mat[3] = a.mat[4] = a.mat[6] = a.mat[7] = a.mat[8] = a.mat[9] = a.mat[11] = a.mat[12] = a.mat[13] = a.mat[14] = 0;
	a.mat[0] = a.mat[5] = a.mat[10] = a.mat[15] = 1;
	return a
};
cc.kmMat4._get = function(a, b, c) {
	return a.mat[b + 4 * c]
};
cc.kmMat4._set = function(a, b, c, d) {
	a.mat[b + 4 * c] = d
};
cc.kmMat4._swap = function(a, b, c, d, e) {
	var f = cc.kmMat4._get(a, b, c);
	cc.kmMat4._set(a, b, c, cc.kmMat4._get(a, d, e));
	cc.kmMat4._set(a, d, e, f)
};
cc.kmMat4._gaussj = function(a, b) {
	var c, d = 0,
		e = 0,
		f, g, h, k = [0, 0, 0, 0],
		m = [0, 0, 0, 0],
		n = [0, 0, 0, 0];
	for (c = 0; 4 > c; c++) {
		for (f = h = 0; 4 > f; f++)
			if (1 != n[f])
				for (g = 0; 4 > g; g++) 0 == n[g] && Math.abs(cc.kmMat4._get(a, f, g)) >= h && (h = Math.abs(cc.kmMat4._get(a, f, g)), e = f, d = g);++n[d];
		if (e != d) {
			for (f = 0; 4 > f; f++) cc.kmMat4._swap(a, e, f, d, f);
			for (f = 0; 4 > f; f++) cc.kmMat4._swap(b, e, f, d, f)
		}
		m[c] = e;
		k[c] = d;
		if (0 == cc.kmMat4._get(a, d, d)) return cc.KM_FALSE;
		g = 1 / cc.kmMat4._get(a, d, d);
		cc.kmMat4._set(a, d, d, 1);
		for (f = 0; 4 > f; f++) cc.kmMat4._set(a, d, f, cc.kmMat4._get(a, d, f) * g);
		for (f = 0; 4 > f; f++) cc.kmMat4._set(b, d, f, cc.kmMat4._get(b, d, f) * g);
		for (g = 0; 4 > g; g++)
			if (g != d) {
				h = cc.kmMat4._get(a, g, d);
				cc.kmMat4._set(a, g, d, 0);
				for (f = 0; 4 > f; f++) cc.kmMat4._set(a, g, f, cc.kmMat4._get(a, g, f) - cc.kmMat4._get(a, d, f) * h);
				for (f = 0; 4 > f; f++) cc.kmMat4._set(b, g, f, cc.kmMat4._get(a, g, f) - cc.kmMat4._get(b, d, f) * h)
			}
	}
	for (f = 3; 0 <= f; f--)
		if (m[f] != k[f])
			for (g = 0; 4 > g; g++) cc.kmMat4._swap(a, g, m[f], g, k[f]);
	return cc.KM_TRUE
};
cc.kmMat4._identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
cc.kmMat4Inverse = function(a, b) {
	var c = new cc.kmMat4,
		d = new cc.kmMat4;
	cc.kmMat4Assign(c, b);
	cc.kmMat4Identity(d);
	if (cc.kmMat4._gaussj(c, d) == cc.KM_FALSE) return null;
	cc.kmMat4Assign(a, c);
	return a
};
cc.kmMat4IsIdentity = function(a) {
	for (var b = 0; 16 > b; b++)
		if (cc.kmMat4._identity[b] != a.mat[b]) return !1;
	return !0
};
cc.kmMat4Transpose = function(a, b) {
	var c, d, e = a.mat,
		f = b.mat;
	for (d = 0; 4 > d; ++d)
		for (c = 0; 4 > c; ++c) e[4 * d + c] = f[4 * c + d];
	return a
};
cc.kmMat4Multiply = function(a, b, c) {
	var d = a.mat,
		e = b.mat[0],
		f = b.mat[1],
		g = b.mat[2],
		h = b.mat[3],
		k = b.mat[4],
		m = b.mat[5],
		n = b.mat[6],
		q = b.mat[7],
		s = b.mat[8],
		r = b.mat[9],
		t = b.mat[10],
		u = b.mat[11],
		y = b.mat[12],
		v = b.mat[13],
		C = b.mat[14];
	b = b.mat[15];
	var E = c.mat[0],
		A = c.mat[1],
		x = c.mat[2],
		z = c.mat[3],
		w = c.mat[4],
		B = c.mat[5],
		G = c.mat[6],
		H = c.mat[7],
		F = c.mat[8],
		J = c.mat[9],
		L = c.mat[10],
		K = c.mat[11],
		M = c.mat[12],
		I = c.mat[13],
		N = c.mat[14];
	c = c.mat[15];
	d[0] = E * e + A * k + x * s + z * y;
	d[1] = E * f + A * m + x * r + z * v;
	d[2] = E * g + A * n + x * t + z * C;
	d[3] = E * h + A * q + x * u + z * b;
	d[4] = w * e + B * k + G * s + H * y;
	d[5] = w * f + B * m + G * r + H * v;
	d[6] = w * g + B * n + G * t + H * C;
	d[7] = w * h + B * q + G * u + H * b;
	d[8] = F * e + J * k + L * s + K * y;
	d[9] = F * f + J * m + L * r + K * v;
	d[10] = F * g + J * n + L * t + K * C;
	d[11] = F * h + J * q + L * u + K * b;
	d[12] = M * e + I * k + N * s + c * y;
	d[13] = M * f + I * m + N * r + c * v;
	d[14] = M * g + I * n + N * t + c * C;
	d[15] = M * h + I * q + N * u + c * b;
	return a
};
cc.getMat4MultiplyValue = function(a, b) {
	var c = a.mat,
		d = b.mat,
		e = new Float32Array(16);
	e[0] = c[0] * d[0] + c[4] * d[1] + c[8] * d[2] + c[12] * d[3];
	e[1] = c[1] * d[0] + c[5] * d[1] + c[9] * d[2] + c[13] * d[3];
	e[2] = c[2] * d[0] + c[6] * d[1] + c[10] * d[2] + c[14] * d[3];
	e[3] = c[3] * d[0] + c[7] * d[1] + c[11] * d[2] + c[15] * d[3];
	e[4] = c[0] * d[4] + c[4] * d[5] + c[8] * d[6] + c[12] * d[7];
	e[5] = c[1] * d[4] + c[5] * d[5] + c[9] * d[6] + c[13] * d[7];
	e[6] = c[2] * d[4] + c[6] * d[5] + c[10] * d[6] + c[14] * d[7];
	e[7] = c[3] * d[4] + c[7] * d[5] + c[11] * d[6] + c[15] * d[7];
	e[8] = c[0] * d[8] + c[4] * d[9] + c[8] * d[10] + c[12] * d[11];
	e[9] = c[1] * d[8] + c[5] * d[9] + c[9] * d[10] + c[13] * d[11];
	e[10] = c[2] * d[8] + c[6] * d[9] + c[10] * d[10] + c[14] * d[11];
	e[11] = c[3] * d[8] + c[7] * d[9] + c[11] * d[10] + c[15] * d[11];
	e[12] = c[0] * d[12] + c[4] * d[13] + c[8] * d[14] + c[12] * d[15];
	e[13] = c[1] * d[12] + c[5] * d[13] + c[9] * d[14] + c[13] * d[15];
	e[14] = c[2] * d[12] + c[6] * d[13] + c[10] * d[14] + c[14] * d[15];
	e[15] = c[3] * d[12] + c[7] * d[13] + c[11] * d[14] + c[15] * d[15];
	return e
};
cc.getMat4MultiplyWithMat4 = function(a, b, c) {
	a = a.mat;
	b = b.mat;
	var d = c.mat;
	d[0] = a[0] * b[0] + a[4] * b[1] + a[8] * b[2] + a[12] * b[3];
	d[1] = a[1] * b[0] + a[5] * b[1] + a[9] * b[2] + a[13] * b[3];
	d[2] = a[2] * b[0] + a[6] * b[1] + a[10] * b[2] + a[14] * b[3];
	d[3] = a[3] * b[0] + a[7] * b[1] + a[11] * b[2] + a[15] * b[3];
	d[4] = a[0] * b[4] + a[4] * b[5] + a[8] * b[6] + a[12] * b[7];
	d[5] = a[1] * b[4] + a[5] * b[5] + a[9] * b[6] + a[13] * b[7];
	d[6] = a[2] * b[4] + a[6] * b[5] + a[10] * b[6] + a[14] * b[7];
	d[7] = a[3] * b[4] + a[7] * b[5] + a[11] * b[6] + a[15] * b[7];
	d[8] = a[0] * b[8] + a[4] * b[9] + a[8] * b[10] + a[12] * b[11];
	d[9] = a[1] * b[8] + a[5] * b[9] + a[9] * b[10] + a[13] * b[11];
	d[10] = a[2] * b[8] + a[6] * b[9] + a[10] * b[10] + a[14] * b[11];
	d[11] = a[3] * b[8] + a[7] * b[9] + a[11] * b[10] + a[15] * b[11];
	d[12] = a[0] * b[12] + a[4] * b[13] + a[8] * b[14] + a[12] * b[15];
	d[13] = a[1] * b[12] + a[5] * b[13] + a[9] * b[14] + a[13] * b[15];
	d[14] = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];
	d[15] = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];
	return c.mat
};
cc.kmMat4Assign = function(a, b) {
	if (a == b) return cc.log("cc.kmMat4Assign(): pOut equals pIn"), a;
	var c = a.mat,
		d = b.mat;
	c[0] = d[0];
	c[1] = d[1];
	c[2] = d[2];
	c[3] = d[3];
	c[4] = d[4];
	c[5] = d[5];
	c[6] = d[6];
	c[7] = d[7];
	c[8] = d[8];
	c[9] = d[9];
	c[10] = d[10];
	c[11] = d[11];
	c[12] = d[12];
	c[13] = d[13];
	c[14] = d[14];
	c[15] = d[15];
	return a
};
cc.kmMat4AreEqual = function(a, b) {
	if (a == b) return cc.log("cc.kmMat4AreEqual(): pMat1 and pMat2 are same object."), !0;
	for (var c = 0; 16 > c; c++)
		if (!(a.mat[c] + cc.kmEpsilon > b.mat[c] && a.mat[c] - cc.kmEpsilon < b.mat[c])) return !1;
	return !0
};
cc.kmMat4RotationX = function(a, b) {
	a.mat[0] = 1;
	a.mat[1] = 0;
	a.mat[2] = 0;
	a.mat[3] = 0;
	a.mat[4] = 0;
	a.mat[5] = Math.cos(b);
	a.mat[6] = Math.sin(b);
	a.mat[7] = 0;
	a.mat[8] = 0;
	a.mat[9] = -Math.sin(b);
	a.mat[10] = Math.cos(b);
	a.mat[11] = 0;
	a.mat[12] = 0;
	a.mat[13] = 0;
	a.mat[14] = 0;
	a.mat[15] = 1;
	return a
};
cc.kmMat4RotationY = function(a, b) {
	a.mat[0] = Math.cos(b);
	a.mat[1] = 0;
	a.mat[2] = -Math.sin(b);
	a.mat[3] = 0;
	a.mat[4] = 0;
	a.mat[5] = 1;
	a.mat[6] = 0;
	a.mat[7] = 0;
	a.mat[8] = Math.sin(b);
	a.mat[9] = 0;
	a.mat[10] = Math.cos(b);
	a.mat[11] = 0;
	a.mat[12] = 0;
	a.mat[13] = 0;
	a.mat[14] = 0;
	a.mat[15] = 1;
	return a
};
cc.kmMat4RotationZ = function(a, b) {
	a.mat[0] = Math.cos(b);
	a.mat[1] = Math.sin(b);
	a.mat[2] = 0;
	a.mat[3] = 0;
	a.mat[4] = -Math.sin(b);
	a.mat[5] = Math.cos(b);
	a.mat[6] = 0;
	a.mat[7] = 0;
	a.mat[8] = 0;
	a.mat[9] = 0;
	a.mat[10] = 1;
	a.mat[11] = 0;
	a.mat[12] = 0;
	a.mat[13] = 0;
	a.mat[14] = 0;
	a.mat[15] = 1;
	return a
};
cc.kmMat4RotationPitchYawRoll = function(a, b, c, d) {
	var e = Math.cos(b);
	b = Math.sin(b);
	var f = Math.cos(c);
	c = Math.sin(c);
	var g = Math.cos(d);
	d = Math.sin(d);
	var h = b * c,
		k = e * c;
	a.mat[0] = f * g;
	a.mat[4] = f * d;
	a.mat[8] = -c;
	a.mat[1] = h * g - e * d;
	a.mat[5] = h * d + e * g;
	a.mat[9] = b * f;
	a.mat[2] = k * g + b * d;
	a.mat[6] = k * d - b * g;
	a.mat[10] = e * f;
	a.mat[3] = a.mat[7] = a.mat[11] = 0;
	a.mat[15] = 1;
	return a
};
cc.kmMat4RotationQuaternion = function(a, b) {
	a.mat[0] = 1 - 2 * (b.y * b.y + b.z * b.z);
	a.mat[1] = 2 * (b.x * b.y + b.z * b.w);
	a.mat[2] = 2 * (b.x * b.z - b.y * b.w);
	a.mat[3] = 0;
	a.mat[4] = 2 * (b.x * b.y - b.z * b.w);
	a.mat[5] = 1 - 2 * (b.x * b.x + b.z * b.z);
	a.mat[6] = 2 * (b.z * b.y + b.x * b.w);
	a.mat[7] = 0;
	a.mat[8] = 2 * (b.x * b.z + b.y * b.w);
	a.mat[9] = 2 * (b.y * b.z - b.x * b.w);
	a.mat[10] = 1 - 2 * (b.x * b.x + b.y * b.y);
	a.mat[11] = 0;
	a.mat[12] = 0;
	a.mat[13] = 0;
	a.mat[14] = 0;
	a.mat[15] = 1;
	return a
};
cc.kmMat4RotationTranslation = function(a, b, c) {
	a.mat[0] = b.mat[0];
	a.mat[1] = b.mat[1];
	a.mat[2] = b.mat[2];
	a.mat[3] = 0;
	a.mat[4] = b.mat[3];
	a.mat[5] = b.mat[4];
	a.mat[6] = b.mat[5];
	a.mat[7] = 0;
	a.mat[8] = b.mat[6];
	a.mat[9] = b.mat[7];
	a.mat[10] = b.mat[8];
	a.mat[11] = 0;
	a.mat[12] = c.x;
	a.mat[13] = c.y;
	a.mat[14] = c.z;
	a.mat[15] = 1;
	return a
};
cc.kmMat4Scaling = function(a, b, c, d) {
	a.mat[0] = b;
	a.mat[5] = c;
	a.mat[10] = d;
	a.mat[15] = 1;
	a.mat[1] = a.mat[2] = a.mat[3] = a.mat[4] = a.mat[6] = a.mat[7] = a.mat[8] = a.mat[9] = a.mat[11] = a.mat[12] = a.mat[13] = a.mat[14] = 0;
	return a
};
cc.kmMat4Translation = function(a, b, c, d) {
	a.mat[0] = a.mat[5] = a.mat[10] = a.mat[15] = 1;
	a.mat[1] = a.mat[2] = a.mat[3] = a.mat[4] = a.mat[6] = a.mat[7] = a.mat[8] = a.mat[9] = a.mat[11] = 0;
	a.mat[12] = b;
	a.mat[13] = c;
	a.mat[14] = d;
	return a
};
cc.kmMat4GetUpVec3 = function(a, b) {
	a.x = b.mat[4];
	a.y = b.mat[5];
	a.z = b.mat[6];
	cc.kmVec3Normalize(a, a);
	return a
};
cc.kmMat4GetRightVec3 = function(a, b) {
	a.x = b.mat[0];
	a.y = b.mat[1];
	a.z = b.mat[2];
	cc.kmVec3Normalize(a, a);
	return a
};
cc.kmMat4GetForwardVec3 = function(a, b) {
	a.x = b.mat[8];
	a.y = b.mat[9];
	a.z = b.mat[10];
	cc.kmVec3Normalize(a, a);
	return a
};
cc.kmMat4PerspectiveProjection = function(a, b, c, d, e) {
	var f = cc.kmDegreesToRadians(b / 2);
	b = e - d;
	var g = Math.sin(f);
	if (0 == b || 0 == g || 0 == c) return null;
	f = Math.cos(f) / g;
	cc.kmMat4Identity(a);
	a.mat[0] = f / c;
	a.mat[5] = f;
	a.mat[10] = -(e + d) / b;
	a.mat[11] = -1;
	a.mat[14] = -2 * d * e / b;
	a.mat[15] = 0;
	return a
};
cc.kmMat4OrthographicProjection = function(a, b, c, d, e, f, g) {
	cc.kmMat4Identity(a);
	a.mat[0] = 2 / (c - b);
	a.mat[5] = 2 / (e - d);
	a.mat[10] = -2 / (g - f);
	a.mat[12] = -((c + b) / (c - b));
	a.mat[13] = -((e + d) / (e - d));
	a.mat[14] = -((g + f) / (g - f));
	return a
};
cc.kmMat4LookAt = function(a, b, c, d) {
	var e = new cc.kmVec3,
		f = new cc.kmVec3,
		g = new cc.kmVec3,
		h = new cc.kmVec3,
		k = new cc.kmMat4;
	cc.kmVec3Subtract(e, c, b);
	cc.kmVec3Normalize(e, e);
	cc.kmVec3Assign(f, d);
	cc.kmVec3Normalize(f, f);
	cc.kmVec3Cross(g, e, f);
	cc.kmVec3Normalize(g, g);
	cc.kmVec3Cross(h, g, e);
	cc.kmVec3Normalize(g, g);
	cc.kmMat4Identity(a);
	a.mat[0] = g.x;
	a.mat[4] = g.y;
	a.mat[8] = g.z;
	a.mat[1] = h.x;
	a.mat[5] = h.y;
	a.mat[9] = h.z;
	a.mat[2] = -e.x;
	a.mat[6] = -e.y;
	a.mat[10] = -e.z;
	cc.kmMat4Translation(k, -b.x, -b.y, -b.z);
	cc.kmMat4Multiply(a, a, k);
	return a
};
cc.kmMat4RotationAxisAngle = function(a, b, c) {
	var d = Math.cos(c);
	c = Math.sin(c);
	var e = new cc.kmVec3;
	cc.kmVec3Normalize(e, b);
	a.mat[0] = d + e.x * e.x * (1 - d);
	a.mat[1] = e.z * c + e.y * e.x * (1 - d);
	a.mat[2] = -e.y * c + e.z * e.x * (1 - d);
	a.mat[3] = 0;
	a.mat[4] = -e.z * c + e.x * e.y * (1 - d);
	a.mat[5] = d + e.y * e.y * (1 - d);
	a.mat[6] = e.x * c + e.z * e.y * (1 - d);
	a.mat[7] = 0;
	a.mat[8] = e.y * c + e.x * e.z * (1 - d);
	a.mat[9] = -e.x * c + e.y * e.z * (1 - d);
	a.mat[10] = d + e.z * e.z * (1 - d);
	a.mat[11] = 0;
	a.mat[12] = 0;
	a.mat[13] = 0;
	a.mat[14] = 0;
	a.mat[15] = 1;
	return a
};
cc.kmMat4ExtractRotation = function(a, b) {
	a.mat[0] = b.mat[0];
	a.mat[1] = b.mat[1];
	a.mat[2] = b.mat[2];
	a.mat[3] = b.mat[4];
	a.mat[4] = b.mat[5];
	a.mat[5] = b.mat[6];
	a.mat[6] = b.mat[8];
	a.mat[7] = b.mat[9];
	a.mat[8] = b.mat[10];
	return a
};
cc.kmMat4ExtractPlane = function(a, b, c) {
	switch (c) {
		case cc.KM_PLANE_RIGHT:
			a.a = b.mat[3] - b.mat[0];
			a.b = b.mat[7] - b.mat[4];
			a.c = b.mat[11] - b.mat[8];
			a.d = b.mat[15] - b.mat[12];
			break;
		case cc.KM_PLANE_LEFT:
			a.a = b.mat[3] + b.mat[0];
			a.b = b.mat[7] + b.mat[4];
			a.c = b.mat[11] + b.mat[8];
			a.d = b.mat[15] + b.mat[12];
			break;
		case cc.KM_PLANE_BOTTOM:
			a.a = b.mat[3] + b.mat[1];
			a.b = b.mat[7] + b.mat[5];
			a.c = b.mat[11] + b.mat[9];
			a.d = b.mat[15] + b.mat[13];
			break;
		case cc.KM_PLANE_TOP:
			a.a = b.mat[3] - b.mat[1];
			a.b = b.mat[7] - b.mat[5];
			a.c = b.mat[11] - b.mat[9];
			a.d = b.mat[15] -
				b.mat[13];
			break;
		case cc.KM_PLANE_FAR:
			a.a = b.mat[3] - b.mat[2];
			a.b = b.mat[7] - b.mat[6];
			a.c = b.mat[11] - b.mat[10];
			a.d = b.mat[15] - b.mat[14];
			break;
		case cc.KM_PLANE_NEAR:
			a.a = b.mat[3] + b.mat[2];
			a.b = b.mat[7] + b.mat[6];
			a.c = b.mat[11] + b.mat[10];
			a.d = b.mat[15] + b.mat[14];
			break;
		default:
			cc.log("cc.kmMat4ExtractPlane(): Invalid plane index")
	}
	b = Math.sqrt(a.a * a.a + a.b * a.b + a.c * a.c);
	a.a /= b;
	a.b /= b;
	a.c /= b;
	a.d /= b;
	return a
};
cc.kmMat4RotationToAxisAngle = function(a, b, c) {
	var d = new cc.kmQuaternion,
		e = new cc.kmMat3;
	cc.kmMat4ExtractRotation(e, c);
	cc.kmQuaternionRotationMatrix(d, e);
	cc.kmQuaternionToAxisAngle(d, a, b);
	return a
};
cc.KM_PLANE_LEFT = 0;
cc.KM_PLANE_RIGHT = 1;
cc.KM_PLANE_BOTTOM = 2;
cc.KM_PLANE_TOP = 3;
cc.KM_PLANE_NEAR = 4;
cc.KM_PLANE_FAR = 5;
cc.kmPlane = function(a, b, c, d) {
	this.a = a || 0;
	this.b = b || 0;
	this.c = c || 0;
	this.d = d || 0
};
cc.POINT_INFRONT_OF_PLANE = 0;
cc.POINT_BEHIND_PLANE = 1;
cc.POINT_ON_PLANE = 2;
cc.kmPlaneDot = function(a, b) {
	return a.a * b.x + a.b * b.y + a.c * b.z + a.d * b.w
};
cc.kmPlaneDotCoord = function(a, b) {
	return a.a * b.x + a.b * b.y + a.c * b.z + a.d
};
cc.kmPlaneDotNormal = function(a, b) {
	return a.a * b.x + a.b * b.y + a.c * b.z
};
cc.kmPlaneFromPointNormal = function(a, b, c) {
	a.a = c.x;
	a.b = c.y;
	a.c = c.z;
	a.d = -cc.kmVec3Dot(c, b);
	return a
};
cc.kmPlaneFromPoints = function(a, b, c, d) {
	var e = new cc.kmVec3,
		f = new cc.kmVec3,
		g = new cc.kmVec3;
	cc.kmVec3Subtract(f, c, b);
	cc.kmVec3Subtract(g, d, b);
	cc.kmVec3Cross(e, f, g);
	cc.kmVec3Normalize(e, e);
	a.a = e.x;
	a.b = e.y;
	a.c = e.z;
	a.d = cc.kmVec3Dot(cc.kmVec3Scale(e, e, -1), b);
	return a
};
cc.kmPlaneIntersectLine = function(a, b, c, d) {
	throw "cc.kmPlaneIntersectLine() hasn't been implemented.";
};
cc.kmPlaneNormalize = function(a, b) {
	var c = new cc.kmVec3;
	c.x = b.a;
	c.y = b.b;
	c.z = b.c;
	var d = 1 / cc.kmVec3Length(c);
	cc.kmVec3Normalize(c, c);
	a.a = c.x;
	a.b = c.y;
	a.c = c.z;
	a.d = b.d * d;
	return a
};
cc.kmPlaneScale = function(a, b, c) {
	cc.log("cc.kmPlaneScale() has not been implemented.")
};
cc.kmPlaneClassifyPoint = function(a, b) {
	var c = a.a * b.x + a.b * b.y + a.c * b.z + a.d;
	return 0.001 < c ? cc.POINT_INFRONT_OF_PLANE : -0.001 > c ? cc.POINT_BEHIND_PLANE : cc.POINT_ON_PLANE
};
cc.kmQuaternion = function(a, b, c, d) {
	this.x = a || 0;
	this.y = b || 0;
	this.z = c || 0;
	this.w = d || 0
};
cc.kmQuaternionConjugate = function(a, b) {
	a.x = -b.x;
	a.y = -b.y;
	a.z = -b.z;
	a.w = b.w;
	return a
};
cc.kmQuaternionDot = function(a, b) {
	return a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z
};
cc.kmQuaternionExp = function(a, b) {
	return a
};
cc.kmQuaternionIdentity = function(a) {
	a.x = 0;
	a.y = 0;
	a.z = 0;
	a.w = 1;
	return a
};
cc.kmQuaternionInverse = function(a, b) {
	var c = cc.kmQuaternionLength(b),
		d = new cc.kmQuaternion;
	if (Math.abs(c) > cc.kmEpsilon) return a.x = 0, a.y = 0, a.z = 0, a.w = 0, a;
	cc.kmQuaternionScale(a, cc.kmQuaternionConjugate(d, b), 1 / c);
	return a
};
cc.kmQuaternionIsIdentity = function(a) {
	return 0 == a.x && 0 == a.y && 0 == a.z && 1 == a.w
};
cc.kmQuaternionLength = function(a) {
	return Math.sqrt(cc.kmQuaternionLengthSq(a))
};
cc.kmQuaternionLengthSq = function(a) {
	return a.x * a.x + a.y * a.y + a.z * a.z + a.w * a.w
};
cc.kmQuaternionLn = function(a, b) {
	return a
};
cc.kmQuaternionMultiply = function(a, b, c) {
	a.w = b.w * c.w - b.x * c.x - b.y * c.y - b.z * c.z;
	a.x = b.w * c.x + b.x * c.w + b.y * c.z - b.z * c.y;
	a.y = b.w * c.y + b.y * c.w + b.z * c.x - b.x * c.z;
	a.z = b.w * c.z + b.z * c.w + b.x * c.y - b.y * c.x;
	return a
};
cc.kmQuaternionNormalize = function(a, b) {
	var c = cc.kmQuaternionLength(b);
	if (Math.abs(c) <= cc.kmEpsilon) throw "cc.kmQuaternionNormalize(): pIn is an invalid value";
	cc.kmQuaternionScale(a, b, 1 / c);
	return a
};
cc.kmQuaternionRotationAxis = function(a, b, c) {
	c *= 0.5;
	var d = Math.sin(c);
	a.w = Math.cos(c);
	a.x = b.x * d;
	a.y = b.y * d;
	a.z = b.z * d;
	return a
};
cc.kmQuaternionRotationMatrix = function(a, b) {
	var c, d, e, f;
	c = [];
	d = f = 0;
	if (!b) return null;
	c[0] = b.mat[0];
	c[1] = b.mat[3];
	c[2] = b.mat[6];
	c[4] = b.mat[1];
	c[5] = b.mat[4];
	c[6] = b.mat[7];
	c[8] = b.mat[2];
	c[9] = b.mat[5];
	c[10] = b.mat[8];
	c[15] = 1;
	var g = c[0];
	d = g[0] + g[5] + g[10] + 1;
	d > cc.kmEpsilon ? (f = 2 * Math.sqrt(d), c = (g[9] - g[6]) / f, d = (g[2] - g[8]) / f, e = (g[4] - g[1]) / f, f *= 0.25) : g[0] > g[5] && g[0] > g[10] ? (f = 2 * Math.sqrt(1 + g[0] - g[5] - g[10]), c = 0.25 * f, d = (g[4] + g[1]) / f, e = (g[2] + g[8]) / f, f = (g[9] - g[6]) / f) : g[5] > g[10] ? (f = 2 * Math.sqrt(1 + g[5] - g[0] - g[10]), c = (g[4] + g[1]) / f, d = 0.25 * f, e = (g[9] + g[6]) / f, f = (g[2] - g[8]) / f) : (f = 2 * Math.sqrt(1 + g[10] - g[0] - g[5]), c = (g[2] + g[8]) / f, d = (g[9] + g[6]) / f, e = 0.25 * f, f = (g[4] - g[1]) / f);
	a.x = c;
	a.y = d;
	a.z = e;
	a.w = f;
	return a
};
cc.kmQuaternionRotationYawPitchRoll = function(a, b, c, d) {
	var e, f, g, h, k;
	e = cc.kmDegreesToRadians(c) / 2;
	f = cc.kmDegreesToRadians(b) / 2;
	g = cc.kmDegreesToRadians(d) / 2;
	d = Math.cos(e);
	b = Math.cos(f);
	c = Math.cos(g);
	e = Math.sin(e);
	f = Math.sin(f);
	g = Math.sin(g);
	h = b * c;
	k = f * g;
	a.w = d * h + e * k;
	a.x = e * h - d * k;
	a.y = d * f * c + e * b * g;
	a.z = d * b * g - e * f * c;
	cc.kmQuaternionNormalize(a, a);
	return a
};
cc.kmQuaternionSlerp = function(a, b, c, d) {
	if (b.x == c.x && b.y == c.y && b.z == c.z && b.w == c.w) return a.x = b.x, a.y = b.y, a.z = b.z, a.w = b.w, a;
	var e = cc.kmQuaternionDot(b, c),
		f = Math.acos(e),
		g = Math.sqrt(1 - cc.kmSQR(e)),
		e = Math.sin(d * f) / g;
	d = Math.sin((1 - d) * f) / g;
	f = new cc.kmQuaternion;
	g = new cc.kmQuaternion;
	cc.kmQuaternionScale(f, b, d);
	cc.kmQuaternionScale(g, c, e);
	cc.kmQuaternionAdd(a, f, g);
	return a
};
cc.kmQuaternionToAxisAngle = function(a, b, c) {
	Math.acos(a.w);
	c = Math.sqrt(cc.kmSQR(a.x) + cc.kmSQR(a.y) + cc.kmSQR(a.z));
	c > -cc.kmEpsilon && c < cc.kmEpsilon || c < 2 * cc.kmPI + cc.kmEpsilon && c > 2 * cc.kmPI - cc.kmEpsilon ? (b.x = 0, b.y = 0, b.z = 1) : (b.x = a.x / c, b.y = a.y / c, b.z = a.z / c, cc.kmVec3Normalize(b, b))
};
cc.kmQuaternionScale = function(a, b, c) {
	a.x = b.x * c;
	a.y = b.y * c;
	a.z = b.z * c;
	a.w = b.w * c;
	return a
};
cc.kmQuaternionAssign = function(a, b) {
	a.x = b.x;
	a.y = b.y;
	a.z = b.z;
	a.w = b.w;
	return a
};
cc.kmQuaternionAdd = function(a, b, c) {
	a.x = b.x + c.x;
	a.y = b.y + c.y;
	a.z = b.z + c.z;
	a.w = b.w + c.w;
	return a
};
cc.kmQuaternionRotationBetweenVec3 = function(a, b, c, d) {
	var e = new cc.kmVec3,
		f = new cc.kmVec3;
	cc.kmVec3Assign(e, b);
	cc.kmVec3Assign(f, c);
	cc.kmVec3Normalize(e, e);
	cc.kmVec3Normalize(f, f);
	c = cc.kmVec3Dot(e, f);
	if (1 <= c) return cc.kmQuaternionIdentity(a), a; - 0.999999 > c ? Math.abs(cc.kmVec3LengthSq(d)) < cc.kmEpsilon ? cc.kmQuaternionRotationAxis(a, d, cc.kmPI) : (e = new cc.kmVec3, f = new cc.kmVec3, f.x = 1, f.y = 0, f.z = 0, cc.kmVec3Cross(e, f, b), Math.abs(cc.kmVec3LengthSq(e)) < cc.kmEpsilon && (f = new cc.kmVec3, f.x = 0, f.y = 1, f.z = 0, cc.kmVec3Cross(e, f, b)), cc.kmVec3Normalize(e, e), cc.kmQuaternionRotationAxis(a, e, cc.kmPI)) : (b = Math.sqrt(2 * (1 + c)), d = 1 / b, c = new cc.kmVec3, cc.kmVec3Cross(c, e, f), a.x = c.x * d, a.y = c.y * d, a.z = c.z * d, a.w = 0.5 * b, cc.kmQuaternionNormalize(a, a));
	return a
};
cc.kmQuaternionMultiplyVec3 = function(a, b, c) {
	var d = new cc.kmVec3,
		e = new cc.kmVec3,
		f = new cc.kmVec3;
	f.x = b.x;
	f.y = b.y;
	f.z = b.z;
	cc.kmVec3Cross(d, f, c);
	cc.kmVec3Cross(e, f, d);
	cc.kmVec3Scale(d, d, 2 * b.w);
	cc.kmVec3Scale(e, e, 2);
	cc.kmVec3Add(a, c, d);
	cc.kmVec3Add(a, a, e);
	return a
};
cc.kmAABB = function(a, b) {
	this.min = a || new cc.kmVec3;
	this.max = b || new cc.kmVec3
};
cc.kmAABBContainsPoint = function(a, b) {
	return a.x >= b.min.x && a.x <= b.max.x && a.y >= b.min.y && a.y <= b.max.y && a.z >= b.min.z && a.z <= b.max.z ? cc.KM_TRUE : cc.KM_FALSE
};
cc.kmAABBAssign = function(a, b) {
	cc.kmVec3Assign(a.min, b.min);
	cc.kmVec3Assign(a.max, b.max);
	return a
};
cc.kmAABBScale = function(a, b, c) {
	cc.log("cc.kmAABBScale hasn't been supported.")
};
cc.km_mat4_stack = function(a, b, c, d) {
	this.top = c;
	this.stack = d
};
cc.km_mat4_stack.INITIAL_SIZE = 30;
cc.km_mat4_stack_initialize = function(a) {
	a.stack = [];
	a.top = null
};
cc.km_mat4_stack_push = function(a, b) {
	a.stack.push(a.top);
	a.top = new cc.kmMat4;
	cc.kmMat4Assign(a.top, b)
};
cc.km_mat4_stack_pop = function(a, b) {
	a.top = a.stack.pop()
};
cc.km_mat4_stack_release = function(a) {
	a.stack = null;
	a.top = null
};
cc.KM_GL_MODELVIEW = 5888;
cc.KM_GL_PROJECTION = 5889;
cc.KM_GL_TEXTURE = 5890;
cc.modelview_matrix_stack = new cc.km_mat4_stack;
cc.projection_matrix_stack = new cc.km_mat4_stack;
cc.texture_matrix_stack = new cc.km_mat4_stack;
cc.current_stack = null;
cc.initialized = !1;
cc.lazyInitialize = function() {
	if (!cc.initialized) {
		var a = new cc.kmMat4;
		cc.km_mat4_stack_initialize(cc.modelview_matrix_stack);
		cc.km_mat4_stack_initialize(cc.projection_matrix_stack);
		cc.km_mat4_stack_initialize(cc.texture_matrix_stack);
		cc.current_stack = cc.modelview_matrix_stack;
		cc.initialized = !0;
		cc.kmMat4Identity(a);
		cc.km_mat4_stack_push(cc.modelview_matrix_stack, a);
		cc.km_mat4_stack_push(cc.projection_matrix_stack, a);
		cc.km_mat4_stack_push(cc.texture_matrix_stack, a)
	}
};
cc.lazyInitialize();
cc.kmGLFreeAll = function() {
	cc.km_mat4_stack_release(cc.modelview_matrix_stack);
	cc.km_mat4_stack_release(cc.projection_matrix_stack);
	cc.km_mat4_stack_release(cc.texture_matrix_stack);
	cc.initialized = !1;
	cc.current_stack = null
};
cc.kmGLPushMatrix = function() {
	cc.km_mat4_stack_push(cc.current_stack, cc.current_stack.top)
};
cc.kmGLPushMatrixWitMat4 = function(a) {
	cc.current_stack.stack.push(cc.current_stack.top);
	cc.kmMat4Assign(a, cc.current_stack.top);
	cc.current_stack.top = a
};
cc.kmGLPopMatrix = function() {
	cc.current_stack.top = cc.current_stack.stack.pop()
};
cc.kmGLMatrixMode = function(a) {
	switch (a) {
		case cc.KM_GL_MODELVIEW:
			cc.current_stack = cc.modelview_matrix_stack;
			break;
		case cc.KM_GL_PROJECTION:
			cc.current_stack = cc.projection_matrix_stack;
			break;
		case cc.KM_GL_TEXTURE:
			cc.current_stack = cc.texture_matrix_stack;
			break;
		default:
			throw "Invalid matrix mode specified";
	}
};
cc.kmGLLoadIdentity = function() {
	cc.kmMat4Identity(cc.current_stack.top)
};
cc.kmGLLoadMatrix = function(a) {
	cc.kmMat4Assign(cc.current_stack.top, a)
};
cc.kmGLMultMatrix = function(a) {
	cc.kmMat4Multiply(cc.current_stack.top, cc.current_stack.top, a)
};
cc.kmGLTranslatef = function(a, b, c) {
	var d = new cc.kmMat4;
	cc.kmMat4Translation(d, a, b, c);
	cc.kmMat4Multiply(cc.current_stack.top, cc.current_stack.top, d)
};
cc.kmGLRotatef = function(a, b, c, d) {
	b = new cc.kmVec3(b, c, d);
	c = new cc.kmMat4;
	cc.kmMat4RotationAxisAngle(c, b, cc.kmDegreesToRadians(a));
	cc.kmMat4Multiply(cc.current_stack.top, cc.current_stack.top, c)
};
cc.kmGLScalef = function(a, b, c) {
	var d = new cc.kmMat4;
	cc.kmMat4Scaling(d, a, b, c);
	cc.kmMat4Multiply(cc.current_stack.top, cc.current_stack.top, d)
};
cc.kmGLGetMatrix = function(a, b) {
	switch (a) {
		case cc.KM_GL_MODELVIEW:
			cc.kmMat4Assign(b, cc.modelview_matrix_stack.top);
			break;
		case cc.KM_GL_PROJECTION:
			cc.kmMat4Assign(b, cc.projection_matrix_stack.top);
			break;
		case cc.KM_GL_TEXTURE:
			cc.kmMat4Assign(b, cc.texture_matrix_stack.top);
			break;
		default:
			throw "Invalid matrix mode specified";
	}
};
cc.SHADER_POSITION_UCOLOR_FRAG = "precision lowp float;\nvarying vec4 v_fragmentColor;\nvoid main()                              \n{ \n    gl_FragColor \x3d v_fragmentColor;      \n}\n";
cc.SHADER_POSITION_UCOLOR_VERT = "attribute vec4 a_position;\nuniform    vec4 u_color;\nuniform float u_pointSize;\nvarying lowp vec4 v_fragmentColor; \nvoid main(void)   \n{\n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    gl_PointSize \x3d u_pointSize;          \n    v_fragmentColor \x3d u_color;           \n}";
cc.SHADER_POSITION_COLOR_FRAG = "precision lowp float; \nvarying vec4 v_fragmentColor; \nvoid main() \n{ \n     gl_FragColor \x3d v_fragmentColor; \n} ";
cc.SHADER_POSITION_COLOR_VERT = "attribute vec4 a_position;\nattribute vec4 a_color;\nvarying lowp vec4 v_fragmentColor;\nvoid main()\n{\n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_fragmentColor \x3d a_color;             \n}";
cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_FRAG = "// #extension GL_OES_standard_derivatives : enable\nvarying mediump vec4 v_color;\nvarying mediump vec2 v_texcoord;\nvoid main()\t\n{ \n// #if defined GL_OES_standard_derivatives\t\n// gl_FragColor \x3d v_color*smoothstep(0.0, length(fwidth(v_texcoord)), 1.0 - length(v_texcoord)); \n// #else\t\ngl_FragColor \x3d v_color * step(0.0, 1.0 - length(v_texcoord)); \n// #endif \n}";
cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_VERT = "attribute mediump vec4 a_position; \nattribute mediump vec2 a_texcoord; \nattribute mediump vec4 a_color;\t\nvarying mediump vec4 v_color; \nvarying mediump vec2 v_texcoord;\t\nvoid main() \n{ \n     v_color \x3d a_color;//vec4(a_color.rgb * a_color.a, a_color.a); \n     v_texcoord \x3d a_texcoord; \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n}";
cc.SHADER_POSITION_TEXTURE_FRAG = "precision lowp float;   \nvarying vec2 v_texCoord;  \nuniform sampler2D CC_Texture0; \nvoid main() \n{  \n    gl_FragColor \x3d  texture2D(CC_Texture0, v_texCoord);   \n}";
cc.SHADER_POSITION_TEXTURE_VERT = "attribute vec4 a_position; \nattribute vec2 a_texCoord; \nvarying mediump vec2 v_texCoord; \nvoid main() \n{ \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_texCoord \x3d a_texCoord;               \n}";
cc.SHADER_POSITION_TEXTURE_UCOLOR_FRAG = "precision lowp float;  \nuniform vec4 u_color; \nvarying vec2 v_texCoord; \nuniform sampler2D CC_Texture0;  \nvoid main() \n{  \n    gl_FragColor \x3d  texture2D(CC_Texture0, v_texCoord) * u_color;    \n}";
cc.SHADER_POSITION_TEXTURE_UCOLOR_VERT = "attribute vec4 a_position;\nattribute vec2 a_texCoord; \nvarying mediump vec2 v_texCoord; \nvoid main() \n{ \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_texCoord \x3d a_texCoord;                 \n}";
cc.SHADER_POSITION_TEXTURE_A8COLOR_FRAG = "precision lowp float;  \nvarying vec4 v_fragmentColor; \nvarying vec2 v_texCoord; \nuniform sampler2D CC_Texture0; \nvoid main() \n{ \n    gl_FragColor \x3d vec4( v_fragmentColor.rgb,         \n        v_fragmentColor.a * texture2D(CC_Texture0, v_texCoord).a   \n    ); \n}";
cc.SHADER_POSITION_TEXTURE_A8COLOR_VERT = "attribute vec4 a_position; \nattribute vec2 a_texCoord; \nattribute vec4 a_color;  \nvarying lowp vec4 v_fragmentColor; \nvarying mediump vec2 v_texCoord; \nvoid main() \n{ \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_fragmentColor \x3d a_color; \n    v_texCoord \x3d a_texCoord; \n}";
cc.SHADER_POSITION_TEXTURE_COLOR_FRAG = "precision lowp float;\nvarying vec4 v_fragmentColor; \nvarying vec2 v_texCoord; \nuniform sampler2D CC_Texture0; \nvoid main() \n{ \n    gl_FragColor \x3d v_fragmentColor * texture2D(CC_Texture0, v_texCoord); \n}";
cc.SHADER_POSITION_TEXTURE_COLOR_VERT = "attribute vec4 a_position; \nattribute vec2 a_texCoord; \nattribute vec4 a_color;  \nvarying lowp vec4 v_fragmentColor; \nvarying mediump vec2 v_texCoord; \nvoid main() \n{ \n    gl_Position \x3d (CC_PMatrix * CC_MVMatrix) * a_position;  \n    v_fragmentColor \x3d a_color; \n    v_texCoord \x3d a_texCoord; \n}";
cc.SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG = "precision lowp float;   \nvarying vec4 v_fragmentColor; \nvarying vec2 v_texCoord;   \nuniform sampler2D CC_Texture0; \nuniform float CC_alpha_value; \nvoid main() \n{  \n    vec4 texColor \x3d texture2D(CC_Texture0, v_texCoord);  \n    if ( texColor.a \x3c\x3d CC_alpha_value )          \n        discard; \n    gl_FragColor \x3d texColor * v_fragmentColor;  \n}";
cc.SHADEREX_SWITCHMASK_FRAG = "precision lowp float; \nvarying vec4 v_fragmentColor; \nvarying vec2 v_texCoord; \nuniform sampler2D u_texture;  \nuniform sampler2D   u_mask;   \nvoid main()  \n{  \n    vec4 texColor   \x3d texture2D(u_texture, v_texCoord);  \n    vec4 maskColor  \x3d texture2D(u_mask, v_texCoord); \n    vec4 finalColor \x3d vec4(texColor.r, texColor.g, texColor.b, maskColor.a * texColor.a);        \n    gl_FragColor    \x3d v_fragmentColor * finalColor; \n}";
cc.shaderCache = {
	TYPE_POSITION_TEXTURECOLOR: 0,
	TYPE_POSITION_TEXTURECOLOR_ALPHATEST: 1,
	TYPE_POSITION_COLOR: 2,
	TYPE_POSITION_TEXTURE: 3,
	TYPE_POSITION_TEXTURE_UCOLOR: 4,
	TYPE_POSITION_TEXTURE_A8COLOR: 5,
	TYPE_POSITION_UCOLOR: 6,
	TYPE_POSITION_LENGTH_TEXTURECOLOR: 7,
	TYPE_MAX: 8,
	_programs: {},
	_init: function() {
		this.loadDefaultShaders();
		return !0
	},
	_loadDefaultShader: function(a, b) {
		switch (b) {
			case this.TYPE_POSITION_TEXTURECOLOR:
				a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_FRAG);
				a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
				a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
				a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
				break;
			case this.TYPE_POSITION_TEXTURECOLOR_ALPHATEST:
				a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_COLOR_VERT, cc.SHADER_POSITION_TEXTURE_COLOR_ALPHATEST_FRAG);
				a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
				a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
				a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
				break;
			case this.TYPE_POSITION_COLOR:
				a.initWithVertexShaderByteArray(cc.SHADER_POSITION_COLOR_VERT, cc.SHADER_POSITION_COLOR_FRAG);
				a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
				a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
				break;
			case this.TYPE_POSITION_TEXTURE:
				a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_VERT, cc.SHADER_POSITION_TEXTURE_FRAG);
				a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
				a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
				break;
			case this.TYPE_POSITION_TEXTURE_UCOLOR:
				a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_UCOLOR_VERT, cc.SHADER_POSITION_TEXTURE_UCOLOR_FRAG);
				a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
				a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
				break;
			case this.TYPE_POSITION_TEXTURE_A8COLOR:
				a.initWithVertexShaderByteArray(cc.SHADER_POSITION_TEXTURE_A8COLOR_VERT, cc.SHADER_POSITION_TEXTURE_A8COLOR_FRAG);
				a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
				a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
				a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
				break;
			case this.TYPE_POSITION_UCOLOR:
				a.initWithVertexShaderByteArray(cc.SHADER_POSITION_UCOLOR_VERT, cc.SHADER_POSITION_UCOLOR_FRAG);
				a.addAttribute("aVertex", cc.VERTEX_ATTRIB_POSITION);
				break;
			case this.TYPE_POSITION_LENGTH_TEXTURECOLOR:
				a.initWithVertexShaderByteArray(cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_VERT, cc.SHADER_POSITION_COLOR_LENGTH_TEXTURE_FRAG);
				a.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
				a.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
				a.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
				break;
			default:
				cc.log("cocos2d: cc.shaderCache._loadDefaultShader, error shader type");
				return
		}
		a.link();
		a.updateUniforms()
	},
	loadDefaultShaders: function() {
		var a = new cc.GLProgram;
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURECOLOR);
		this._programs[cc.SHADER_POSITION_TEXTURECOLOR] = a;
		this._programs.ShaderPositionTextureColor = a;
		a = new cc.GLProgram;
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURECOLOR_ALPHATEST);
		this._programs[cc.SHADER_POSITION_TEXTURECOLORALPHATEST] = a;
		this._programs.ShaderPositionTextureColorAlphaTest = a;
		a = new cc.GLProgram;
		this._loadDefaultShader(a, this.TYPE_POSITION_COLOR);
		this._programs[cc.SHADER_POSITION_COLOR] = a;
		this._programs.ShaderPositionColor = a;
		a = new cc.GLProgram;
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE);
		this._programs[cc.SHADER_POSITION_TEXTURE] = a;
		this._programs.ShaderPositionTexture = a;
		a = new cc.GLProgram;
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE_UCOLOR);
		this._programs[cc.SHADER_POSITION_TEXTURE_UCOLOR] = a;
		this._programs.ShaderPositionTextureUColor = a;
		a = new cc.GLProgram;
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE_A8COLOR);
		this._programs[cc.SHADER_POSITION_TEXTUREA8COLOR] = a;
		this._programs.ShaderPositionTextureA8Color = a;
		a = new cc.GLProgram;
		this._loadDefaultShader(a, this.TYPE_POSITION_UCOLOR);
		this._programs[cc.SHADER_POSITION_UCOLOR] = a;
		this._programs.ShaderPositionUColor = a;
		a = new cc.GLProgram;
		this._loadDefaultShader(a, this.TYPE_POSITION_LENGTH_TEXTURECOLOR);
		this._programs[cc.SHADER_POSITION_LENGTHTEXTURECOLOR] = a;
		this._programs.ShaderPositionLengthTextureColor = a
	},
	reloadDefaultShaders: function() {
		var a = this.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
		a.reset();
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURECOLOR);
		a = this.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
		a.reset();
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURECOLOR_ALPHATEST);
		a = this.programForKey(cc.SHADER_POSITION_COLOR);
		a.reset();
		this._loadDefaultShader(a, this.TYPE_POSITION_COLOR);
		a = this.programForKey(cc.SHADER_POSITION_TEXTURE);
		a.reset();
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE);
		a = this.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
		a.reset();
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE_UCOLOR);
		a = this.programForKey(cc.SHADER_POSITION_TEXTUREA8COLOR);
		a.reset();
		this._loadDefaultShader(a, this.TYPE_POSITION_TEXTURE_A8COLOR);
		a = this.programForKey(cc.SHADER_POSITION_UCOLOR);
		a.reset();
		this._loadDefaultShader(a, this.TYPE_POSITION_UCOLOR)
	},
	programForKey: function(a) {
		return this._programs[a]
	},
	getProgram: function(a) {
		return this._programs[a]
	},
	addProgram: function(a, b) {
		this._programs[b] = a
	}
};
cc.HashUniformEntry = function(a, b, c) {
	this.value = a;
	this.location = b;
	this.hh = c || {}
};
cc.GLProgram = cc.Class.extend({
	_glContext: null,
	_programObj: null,
	_vertShader: null,
	_fragShader: null,
	_uniforms: null,
	_hashForUniforms: null,
	_usesTime: !1,
	_updateUniformLocation: function(a, b, c) {
		if (null == a) return !1;
		c = !0;
		for (var d = null, e = 0; e < this._hashForUniforms.length; e++) this._hashForUniforms[e].location == a && (d = this._hashForUniforms[e]);
		d ? d.value == b ? c = !1 : d.value = b : (d = new cc.HashUniformEntry, d.location = a, d.value = b, this._hashForUniforms.push(d));
		return c
	},
	_description: function() {
		return "\x3cCCGLProgram \x3d " +
			this.toString() + " | Program \x3d " + this._programObj.toString() + ", VertexShader \x3d " + this._vertShader.toString() + ", FragmentShader \x3d " + this._fragShader.toString() + "\x3e"
	},
	_compileShader: function(a, b, c) {
		if (!c || !a) return !1;
		this._glContext.shaderSource(a, "precision highp float;        \nuniform mat4 CC_PMatrix;         \nuniform mat4 CC_MVMatrix;        \nuniform mat4 CC_MVPMatrix;       \nuniform vec4 CC_Time;            \nuniform vec4 CC_SinTime;         \nuniform vec4 CC_CosTime;         \nuniform vec4 CC_Random01;        \n//CC INCLUDES END                \n" +
			c);
		this._glContext.compileShader(a);
		c = this._glContext.getShaderParameter(a, this._glContext.COMPILE_STATUS);
		c || (cc.log("cocos2d: ERROR: Failed to compile shader:\n" + this._glContext.getShaderSource(a)), b == this._glContext.VERTEX_SHADER ? cc.log("cocos2d: \n" + this.vertexShaderLog()) : cc.log("cocos2d: \n" + this.fragmentShaderLog()));
		return 1 == c
	},
	ctor: function(a, b, c) {
		this._uniforms = [];
		this._hashForUniforms = [];
		this._glContext = c || cc._renderContext;
		a && b && this.init(a, b)
	},
	destroyProgram: function() {
		this._hashForUniforms = this._uniforms = this._fragShader = this._vertShader = null;
		this._glContext.deleteProgram(this._programObj)
	},
	initWithVertexShaderByteArray: function(a, b) {
		var c = this._glContext;
		this._programObj = c.createProgram();
		this._fragShader = this._vertShader = null;
		a && (this._vertShader = c.createShader(c.VERTEX_SHADER), this._compileShader(this._vertShader, c.VERTEX_SHADER, a) || cc.log("cocos2d: ERROR: Failed to compile vertex shader"));
		b && (this._fragShader = c.createShader(c.FRAGMENT_SHADER), this._compileShader(this._fragShader, c.FRAGMENT_SHADER, b) || cc.log("cocos2d: ERROR: Failed to compile fragment shader"));
		this._vertShader && c.attachShader(this._programObj, this._vertShader);
		cc.checkGLErrorDebug();
		this._fragShader && c.attachShader(this._programObj, this._fragShader);
		this._hashForUniforms.length = 0;
		cc.checkGLErrorDebug();
		return !0
	},
	initWithString: function(a, b) {
		return this.initWithVertexShaderByteArray(a, b)
	},
	initWithVertexShaderFilename: function(a, b) {
		var c = cc.loader.getRes(a);
		if (!c) throw "Please load the resource firset : " + a;
		var d = cc.loader.getRes(b);
		if (!d) throw "Please load the resource firset : " + b;
		return this.initWithVertexShaderByteArray(c, d)
	},
	init: function(a, b) {
		return this.initWithVertexShaderFilename(a, b)
	},
	addAttribute: function(a, b) {
		this._glContext.bindAttribLocation(this._programObj, b, a)
	},
	link: function() {
		if (!this._programObj) return cc.log("cc.GLProgram.link(): Cannot link invalid program"), !1;
		this._glContext.linkProgram(this._programObj);
		this._vertShader && this._glContext.deleteShader(this._vertShader);
		this._fragShader && this._glContext.deleteShader(this._fragShader);
		this._fragShader = this._vertShader = null;
		return cc.game.config[cc.game.CONFIG_KEY.debugMode] && !this._glContext.getProgramParameter(this._programObj, this._glContext.LINK_STATUS) ? (cc.log("cocos2d: ERROR: Failed to link program: " + this._glContext.getProgramInfoLog(this._programObj)), cc.glDeleteProgram(this._programObj), this._programObj = null, !1) : !0
	},
	use: function() {
		cc.glUseProgram(this._programObj)
	},
	updateUniforms: function() {
		this._uniforms[cc.UNIFORM_PMATRIX] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_PMATRIX_S);
		this._uniforms[cc.UNIFORM_MVMATRIX] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_MVMATRIX_S);
		this._uniforms[cc.UNIFORM_MVPMATRIX] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_MVPMATRIX_S);
		this._uniforms[cc.UNIFORM_TIME] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_TIME_S);
		this._uniforms[cc.UNIFORM_SINTIME] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_SINTIME_S);
		this._uniforms[cc.UNIFORM_COSTIME] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_COSTIME_S);
		this._usesTime = null != this._uniforms[cc.UNIFORM_TIME] || null != this._uniforms[cc.UNIFORM_SINTIME] || null != this._uniforms[cc.UNIFORM_COSTIME];
		this._uniforms[cc.UNIFORM_RANDOM01] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_RANDOM01_S);
		this._uniforms[cc.UNIFORM_SAMPLER] = this._glContext.getUniformLocation(this._programObj, cc.UNIFORM_SAMPLER_S);
		this.use();
		this.setUniformLocationWith1i(this._uniforms[cc.UNIFORM_SAMPLER], 0)
	},
	getUniformLocationForName: function(a) {
		if (!a) throw "cc.GLProgram.getUniformLocationForName(): uniform name should be non-null";
		if (!this._programObj) throw "cc.GLProgram.getUniformLocationForName(): Invalid operation. Cannot get uniform location when program is not initialized";
		return this._glContext.getUniformLocation(this._programObj, a)
	},
	getUniformMVPMatrix: function() {
		return this._uniforms[cc.UNIFORM_MVPMATRIX]
	},
	getUniformSampler: function() {
		return this._uniforms[cc.UNIFORM_SAMPLER]
	},
	setUniformLocationWith1i: function(a, b) {
		this._updateUniformLocation(a, b) && this._glContext.uniform1i(a, b)
	},
	setUniformLocationWith2i: function(a, b, c) {
		this._updateUniformLocation(a, [b, c]) && this._glContext.uniform2i(a, b, c)
	},
	setUniformLocationWith3i: function(a, b, c, d) {
		this._updateUniformLocation(a, [b, c, d]) && this._glContext.uniform3i(a, b, c, d)
	},
	setUniformLocationWith4i: function(a, b, c, d, e) {
		this._updateUniformLocation(a, [b, c, d, e]) && this._glContext.uniform4i(a, b, c, d, e)
	},
	setUniformLocationWith2iv: function(a, b, c) {
		this._updateUniformLocation(a, b) && this._glContext.uniform2iv(a, b)
	},
	setUniformLocationWith3iv: function(a, b, c) {
		this._updateUniformLocation(a, b) && this._glContext.uniform3iv(a, b)
	},
	setUniformLocationWith4iv: function(a, b, c) {
		this._updateUniformLocation(a, b) && this._glContext.uniform4iv(a, b)
	},
	setUniformLocationI32: function(a, b) {
		this.setUniformLocationWith1i(a, b)
	},
	setUniformLocationWith1f: function(a, b) {
		this._updateUniformLocation(a, b) && this._glContext.uniform1f(a, b)
	},
	setUniformLocationWith2f: function(a, b, c) {
		this._updateUniformLocation(a, [b, c]) && this._glContext.uniform2f(a, b, c)
	},
	setUniformLocationWith3f: function(a, b, c, d) {
		this._updateUniformLocation(a, [b, c, d]) && this._glContext.uniform3f(a, b, c, d)
	},
	setUniformLocationWith4f: function(a, b, c, d, e) {
		this._updateUniformLocation(a, [b, c, d, e]) && this._glContext.uniform4f(a, b, c, d, e)
	},
	setUniformLocationWith2fv: function(a, b, c) {
		this._updateUniformLocation(a, b) && this._glContext.uniform2fv(a, b)
	},
	setUniformLocationWith3fv: function(a, b, c) {
		this._updateUniformLocation(a, b) && this._glContext.uniform3fv(a, b)
	},
	setUniformLocationWith4fv: function(a, b, c) {
		this._updateUniformLocation(a, b) && this._glContext.uniform4fv(a, b)
	},
	setUniformLocationWithMatrix4fv: function(a, b, c) {
		this._updateUniformLocation(a, b) && this._glContext.uniformMatrix4fv(a, !1, b)
	},
	setUniformLocationF32: function() {
		if (!(2 > arguments.length)) switch (arguments.length) {
			case 2:
				this.setUniformLocationWith1f(arguments[0], arguments[1]);
				break;
			case 3:
				this.setUniformLocationWith2f(arguments[0], arguments[1], arguments[2]);
				break;
			case 4:
				this.setUniformLocationWith3f(arguments[0], arguments[1], arguments[2], arguments[3]);
				break;
			case 5:
				this.setUniformLocationWith4f(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4])
		}
	},
	setUniformsForBuiltins: function() {
		var a = new cc.kmMat4,
			b = new cc.kmMat4,
			c = new cc.kmMat4;
		cc.kmGLGetMatrix(cc.KM_GL_PROJECTION, a);
		cc.kmGLGetMatrix(cc.KM_GL_MODELVIEW, b);
		cc.kmMat4Multiply(c, a, b);
		this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_PMATRIX], a.mat, 1);
		this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVMATRIX], b.mat, 1);
		this.setUniformLocationWithMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], c.mat, 1);
		this._usesTime && (a = cc.director, a = a.getTotalFrames() * a.getAnimationInterval(), this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_TIME], a / 10, a, 2 * a, 4 * a), this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_SINTIME], a / 8, a / 4, a / 2, Math.sin(a)), this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_COSTIME], a / 8, a / 4, a / 2, Math.cos(a))); - 1 != this._uniforms[cc.UNIFORM_RANDOM01] && this.setUniformLocationWith4f(this._uniforms[cc.UNIFORM_RANDOM01], Math.random(), Math.random(), Math.random(), Math.random())
	},
	setUniformForModelViewProjectionMatrix: function() {
		this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], !1, cc.getMat4MultiplyValue(cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top))
	},
	setUniformForModelViewProjectionMatrixWithMat4: function(a) {
		cc.kmMat4Multiply(a, cc.projection_matrix_stack.top, cc.modelview_matrix_stack.top);
		this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVPMATRIX], !1, a.mat)
	},
	setUniformForModelViewAndProjectionMatrixWithMat4: function() {
		this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_MVMATRIX], !1, cc.modelview_matrix_stack.top.mat);
		this._glContext.uniformMatrix4fv(this._uniforms[cc.UNIFORM_PMATRIX], !1, cc.projection_matrix_stack.top.mat)
	},
	vertexShaderLog: function() {
		return this._glContext.getShaderInfoLog(this._vertShader)
	},
	getVertexShaderLog: function() {
		return this._glContext.getShaderInfoLog(this._vertShader)
	},
	getFragmentShaderLog: function() {
		return this._glContext.getShaderInfoLog(this._vertShader)
	},
	fragmentShaderLog: function() {
		return this._glContext.getShaderInfoLog(this._fragShader)
	},
	programLog: function() {
		return this._glContext.getProgramInfoLog(this._programObj)
	},
	getProgramLog: function() {
		return this._glContext.getProgramInfoLog(this._programObj)
	},
	reset: function() {
		this._fragShader = this._vertShader = null;
		this._uniforms.length = 0;
		this._glContext.deleteProgram(this._programObj);
		this._programObj = null;
		for (var a = 0; a < this._hashForUniforms.length; a++) this._hashForUniforms[a].value = null, this._hashForUniforms[a] = null;
		this._hashForUniforms.length = 0
	},
	getProgram: function() {
		return this._programObj
	},
	retain: function() {},
	release: function() {}
});
cc.GLProgram.create = function(a, b) {
	return new cc.GLProgram(a, b)
};
cc._currentProjectionMatrix = -1;
cc._vertexAttribPosition = !1;
cc._vertexAttribColor = !1;
cc._vertexAttribTexCoords = !1;
cc.ENABLE_GL_STATE_CACHE && (cc.MAX_ACTIVETEXTURE = 16, cc._currentShaderProgram = -1, cc._currentBoundTexture = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], cc._blendingSource = -1, cc._blendingDest = -1, cc._GLServerState = 0, cc.TEXTURE_ATLAS_USE_VAO && (cc._uVAO = 0));
cc.glInvalidateStateCache = function() {
	cc.kmGLFreeAll();
	cc._currentProjectionMatrix = -1;
	cc._vertexAttribPosition = !1;
	cc._vertexAttribColor = !1;
	cc._vertexAttribTexCoords = !1;
	if (cc.ENABLE_GL_STATE_CACHE) {
		cc._currentShaderProgram = -1;
		for (var a = 0; a < cc.MAX_ACTIVETEXTURE; a++) cc._currentBoundTexture[a] = -1;
		cc._blendingSource = -1;
		cc._blendingDest = -1;
		cc._GLServerState = 0
	}
};
cc.glUseProgram = function(a) {
	a !== cc._currentShaderProgram && (cc._currentShaderProgram = a, cc._renderContext.useProgram(a))
};
cc.ENABLE_GL_STATE_CACHE || (cc.glUseProgram = function(a) {
	cc._renderContext.useProgram(a)
});
cc.glDeleteProgram = function(a) {
	cc.ENABLE_GL_STATE_CACHE && a === cc._currentShaderProgram && (cc._currentShaderProgram = -1);
	gl.deleteProgram(a)
};
cc.glBlendFunc = function(a, b) {
	if (a !== cc._blendingSource || b !== cc._blendingDest) cc._blendingSource = a, cc._blendingDest = b, cc.setBlending(a, b)
};
cc.setBlending = function(a, b) {
	var c = cc._renderContext;
	a === c.ONE && b === c.ZERO ? c.disable(c.BLEND) : (c.enable(c.BLEND), cc._renderContext.blendFunc(a, b))
};
cc.glBlendFuncForParticle = function(a, b) {
	if (a !== cc._blendingSource || b !== cc._blendingDest) {
		cc._blendingSource = a;
		cc._blendingDest = b;
		var c = cc._renderContext;
		a === c.ONE && b === c.ZERO ? c.disable(c.BLEND) : (c.enable(c.BLEND), c.blendFuncSeparate(c.SRC_ALPHA, b, a, b))
	}
};
cc.ENABLE_GL_STATE_CACHE || (cc.glBlendFunc = cc.setBlending);
cc.glBlendResetToCache = function() {
	var a = cc._renderContext;
	a.blendEquation(a.FUNC_ADD);
	cc.ENABLE_GL_STATE_CACHE ? cc.setBlending(cc._blendingSource, cc._blendingDest) : cc.setBlending(a.BLEND_SRC, a.BLEND_DST)
};
cc.setProjectionMatrixDirty = function() {
	cc._currentProjectionMatrix = -1
};
cc.glEnableVertexAttribs = function(a) {
	var b = cc._renderContext,
		c = a & cc.VERTEX_ATTRIB_FLAG_POSITION;
	c !== cc._vertexAttribPosition && (c ? b.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION) : b.disableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION), cc._vertexAttribPosition = c);
	c = a & cc.VERTEX_ATTRIB_FLAG_COLOR;
	c !== cc._vertexAttribColor && (c ? b.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR) : b.disableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR), cc._vertexAttribColor = c);
	a &= cc.VERTEX_ATTRIB_FLAG_TEX_COORDS;
	a !== cc._vertexAttribTexCoords && (a ? b.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS) : b.disableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS), cc._vertexAttribTexCoords = a)
};
cc.glBindTexture2D = function(a) {
	cc.glBindTexture2DN(0, a)
};
cc.glBindTexture2DN = function(a, b) {
	if (cc._currentBoundTexture[a] != b) {
		cc._currentBoundTexture[a] = b;
		var c = cc._renderContext;
		c.activeTexture(c.TEXTURE0 + a);
		b ? c.bindTexture(c.TEXTURE_2D, b._webTextureObj) : c.bindTexture(c.TEXTURE_2D, null)
	}
};
cc.ENABLE_GL_STATE_CACHE || (cc.glBindTexture2DN = function(a, b) {
	var c = cc._renderContext;
	c.activeTexture(c.TEXTURE0 + a);
	b ? c.bindTexture(c.TEXTURE_2D, b._webTextureObj) : c.bindTexture(c.TEXTURE_2D, null)
});
cc.glDeleteTexture = function(a) {
	cc.glDeleteTextureN(0, a)
};
cc.glDeleteTextureN = function(a, b) {
	cc.ENABLE_GL_STATE_CACHE && b == cc._currentBoundTexture[a] && (cc._currentBoundTexture[a] = -1);
	cc._renderContext.deleteTexture(b)
};
cc.glBindVAO = function(a) {
	cc.TEXTURE_ATLAS_USE_VAO && cc.ENABLE_GL_STATE_CACHE && cc._uVAO != a && (cc._uVAO = a)
};
cc.glEnable = function(a) {};
cc.IMAGE_FORMAT_JPEG = 0;
cc.IMAGE_FORMAT_PNG = 1;
cc.IMAGE_FORMAT_RAWDATA = 9;
cc.NextPOT = function(a) {
	a -= 1;
	a |= a >> 1;
	a |= a >> 2;
	a |= a >> 4;
	a |= a >> 8;
	return (a | a >> 16) + 1
};
cc.RenderTexture = cc.Node.extend({
	sprite: null,
	clearFlags: 0,
	clearDepthVal: 0,
	autoDraw: !1,
	_cacheCanvas: null,
	_cacheContext: null,
	_fBO: 0,
	_depthRenderBuffer: 0,
	_oldFBO: 0,
	_texture: null,
	_textureCopy: null,
	_uITextureImage: null,
	_pixelFormat: cc.Texture2D.PIXEL_FORMAT_RGBA8888,
	_clearColor: null,
	clearStencilVal: 0,
	_clearColorStr: null,
	_className: "RenderTexture",
	ctor: null,
	_ctorForCanvas: function(a, b, c, d) {
		cc.Node.prototype.ctor.call(this);
		this._cascadeOpacityEnabled = this._cascadeColorEnabled = !0;
		this._clearColor = cc.color(255, 255, 255, 255);
		this._clearColorStr = "rgba(255,255,255,1)";
		this._cacheCanvas = cc.newElement("canvas");
		this._cacheContext = this._cacheCanvas.getContext("2d");
		this.anchorY = this.anchorX = 0;
		void 0 !== a && void 0 !== b && (c = c || cc.Texture2D.PIXEL_FORMAT_RGBA8888, this.initWithWidthAndHeight(a, b, c, d || 0))
	},
	_ctorForWebGL: function(a, b, c, d) {
		cc.Node.prototype.ctor.call(this);
		this._cascadeOpacityEnabled = this._cascadeColorEnabled = !0;
		this._clearColor = cc.color(0, 0, 0, 0);
		void 0 !== a && void 0 !== b && (c = c || cc.Texture2D.PIXEL_FORMAT_RGBA8888, this.initWithWidthAndHeight(a, b, c, d || 0))
	},
	cleanup: null,
	_cleanupForCanvas: function() {
		cc.Node.prototype.onExit.call(this);
		this._cacheCanvas = this._cacheContext = null
	},
	_cleanupForWebGL: function() {
		cc.Node.prototype.onExit.call(this);
		this._textureCopy = null;
		var a = cc._renderContext;
		a.deleteFramebuffer(this._fBO);
		this._depthRenderBuffer && a.deleteRenderbuffer(this._depthRenderBuffer);
		this._uITextureImage = null
	},
	getSprite: function() {
		return this.sprite
	},
	setSprite: function(a) {
		this.sprite = a
	},
	initWithWidthAndHeight: null,
	_initWithWidthAndHeightForCanvas: function(a, b, c, d) {
		c = this._cacheCanvas;
		d = cc.contentScaleFactor();
		c.width = 0 | a * d;
		c.height = 0 | b * d;
		this._cacheContext.translate(0, c.height);
		a = new cc.Texture2D;
		a.initWithElement(c);
		a.handleLoadedTexture();
		a = this.sprite = cc.Sprite.create(a);
		a.setBlendFunc(cc.ONE, cc.ONE_MINUS_SRC_ALPHA);
		this.autoDraw = !1;
		this.addChild(a);
		return !0
	},
	_initWithWidthAndHeightForWebGL: function(a, b, c, d) {
		c == cc.Texture2D.PIXEL_FORMAT_A8 && cc.log("cc.RenderTexture._initWithWidthAndHeightForWebGL() : only RGB and RGBA formats are valid for a render texture;");
		var e = cc._renderContext,
			f = cc.contentScaleFactor();
		a = 0 | a * f;
		b = 0 | b * f;
		this._oldFBO = e.getParameter(e.FRAMEBUFFER_BINDING);
		var g;
		cc.configuration.supportsNPOT() ? (f = a, g = b) : (f = cc.NextPOT(a), g = cc.NextPOT(b));
		for (var h = new Uint8Array(f * g * 4), k = 0; k < f * g * 4; k++) h[k] = 0;
		this._pixelFormat = c;
		this._texture = new cc.Texture2D;
		if (!this._texture) return !1;
		k = this._texture;
		k.initWithData(h, this._pixelFormat, f, g, cc.size(a, b));
		c = e.getParameter(e.RENDERBUFFER_BINDING);
		if (cc.configuration.checkForGLExtension("GL_QCOM")) {
			this._textureCopy = new cc.Texture2D;
			if (!this._textureCopy) return !1;
			this._textureCopy.initWithData(h, this._pixelFormat, f, g, cc.size(a, b))
		}
		this._fBO = e.createFramebuffer();
		e.bindFramebuffer(e.FRAMEBUFFER, this._fBO);
		e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, k._webTextureObj, 0);
		0 != d && (this._depthRenderBuffer = e.createRenderbuffer(), e.bindRenderbuffer(e.RENDERBUFFER, this._depthRenderBuffer), e.renderbufferStorage(e.RENDERBUFFER, d, f, g), d == e.DEPTH_STENCIL ? e.framebufferRenderbuffer(e.FRAMEBUFFER, e.DEPTH_STENCIL_ATTACHMENT, e.RENDERBUFFER, this._depthRenderBuffer) : d == e.STENCIL_INDEX || d == e.STENCIL_INDEX8 ? e.framebufferRenderbuffer(e.FRAMEBUFFER, e.STENCIL_ATTACHMENT, e.RENDERBUFFER, this._depthRenderBuffer) : d == e.DEPTH_COMPONENT16 && e.framebufferRenderbuffer(e.FRAMEBUFFER, e.DEPTH_ATTACHMENT, e.RENDERBUFFER, this._depthRenderBuffer));
		e.checkFramebufferStatus(e.FRAMEBUFFER) !== e.FRAMEBUFFER_COMPLETE && cc.log("Could not attach texture to the framebuffer");
		k.setAliasTexParameters();
		a = this.sprite = cc.Sprite.create(k);
		a.scaleY = -1;
		a.setBlendFunc(e.ONE, e.ONE_MINUS_SRC_ALPHA);
		e.bindRenderbuffer(e.RENDERBUFFER, c);
		e.bindFramebuffer(e.FRAMEBUFFER, this._oldFBO);
		this.autoDraw = !1;
		this.addChild(a);
		return !0
	},
	begin: null,
	_beginForCanvas: function() {
		cc._renderContext = this._cacheContext;
		cc.view._setScaleXYForRenderTexture()
	},
	_beginForWebGL: function() {
		cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
		cc.kmGLPushMatrix();
		cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
		cc.kmGLPushMatrix();
		var a = cc.director;
		a.setProjection(a.getProjection());
		var b = this._texture.getContentSizeInPixels(),
			c = cc.director.getWinSizeInPixels(),
			a = c.width / b.width,
			c = c.height / b.height,
			d = cc._renderContext;
		d.viewport(0, 0, b.width, b.height);
		b = new cc.kmMat4;
		cc.kmMat4OrthographicProjection(b, -1 / a, 1 / a, -1 / c, 1 / c, -1, 1);
		cc.kmGLMultMatrix(b);
		this._oldFBO = d.getParameter(d.FRAMEBUFFER_BINDING);
		d.bindFramebuffer(d.FRAMEBUFFER, this._fBO);
		cc.configuration.checkForGLExtension("GL_QCOM") && (d.framebufferTexture2D(d.FRAMEBUFFER, d.COLOR_ATTACHMENT0, d.TEXTURE_2D, this._textureCopy._webTextureObj, 0), d.clear(d.COLOR_BUFFER_BIT | d.DEPTH_BUFFER_BIT), d.framebufferTexture2D(d.FRAMEBUFFER, d.COLOR_ATTACHMENT0, d.TEXTURE_2D, this._texture._webTextureObj, 0))
	},
	beginWithClear: function(a, b, c, d, e, f) {
		var g = cc._renderContext;
		e = e || g.COLOR_BUFFER_BIT;
		f = f || g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT;
		this._beginWithClear(a, b, c, d, e, f, g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT | g.STENCIL_BUFFER_BIT)
	},
	_beginWithClear: null,
	_beginWithClearForCanvas: function(a, b, c, d, e, f, g) {
		this.begin();
		a = a || 0;
		b = b || 0;
		c = c || 0;
		d = isNaN(d) ? 1 : d;
		e = this._cacheContext;
		f = this._cacheCanvas;
		e.save();
		e.fillStyle = "rgba(" + (0 | a) + "," + (0 | b) + "," + (0 | c) + "," + d / 255 + ")";
		e.clearRect(0, 0, f.width, -f.height);
		e.fillRect(0, 0, f.width, -f.height);
		e.restore()
	},
	_beginWithClearForWebGL: function(a, b, c, d, e, f, g) {
		a /= 255;
		b /= 255;
		c /= 255;
		d /= 255;
		this.begin();
		var h = cc._renderContext,
			k = [0, 0, 0, 0],
			m = 0,
			n = 0;
		g & h.COLOR_BUFFER_BIT && (k = h.getParameter(h.COLOR_CLEAR_VALUE), h.clearColor(a, b, c, d));
		g & h.DEPTH_BUFFER_BIT && (m = h.getParameter(h.DEPTH_CLEAR_VALUE), h.clearDepth(e));
		g & h.STENCIL_BUFFER_BIT && (n = h.getParameter(h.STENCIL_CLEAR_VALUE), h.clearStencil(f));
		h.clear(g);
		g & h.COLOR_BUFFER_BIT && h.clearColor(k[0], k[1], k[2], k[3]);
		g & h.DEPTH_BUFFER_BIT && h.clearDepth(m);
		g & h.STENCIL_BUFFER_BIT && h.clearStencil(n)
	},
	end: null,
	_endForCanvas: function() {
		cc._renderContext = cc._mainRenderContextBackup;
		cc.view._resetScale()
	},
	_endForWebGL: function() {
		var a = cc._renderContext,
			b = cc.director;
		a.bindFramebuffer(a.FRAMEBUFFER, this._oldFBO);
		b.setViewport();
		cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
		cc.kmGLPopMatrix();
		cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
		cc.kmGLPopMatrix()
	},
	clear: function(a, b, c, d) {
		this.beginWithClear(a, b, c, d);
		this.end()
	},
	clearRect: null,
	_clearRectForCanvas: function(a, b, c, d) {
		this._cacheContext.clearRect(a, b, c, -d)
	},
	_clearRectForWebGL: function(a, b, c, d) {},
	clearDepth: null,
	_clearDepthForCanvas: function(a) {
		cc.log("clearDepth isn't supported on Cocos2d-Html5")
	},
	_clearDepthForWebGL: function(a) {
		this.begin();
		var b = cc._renderContext,
			c = b.getParameter(b.DEPTH_CLEAR_VALUE);
		b.clearDepth(a);
		b.clear(b.DEPTH_BUFFER_BIT);
		b.clearDepth(c);
		this.end()
	},
	clearStencil: null,
	_clearStencilForCanvas: function(a) {
		cc.log("clearDepth isn't supported on Cocos2d-Html5")
	},
	_clearStencilForWebGL: function(a) {
		var b = cc._renderContext,
			c = b.getParameter(b.STENCIL_CLEAR_VALUE);
		b.clearStencil(a);
		b.clear(b.STENCIL_BUFFER_BIT);
		b.clearStencil(c)
	},
	visit: null,
	_visitForCanvas: function(a) {
		this._visible && (a = a || cc._renderContext, a.save(), this.draw(a), this.transform(a), this.sprite.visit(), a.restore(), this.arrivalOrder = 0)
	},
	_visitForWebGL: function(a) {
		if (this._visible) {
			cc.kmGLPushMatrix();
			var b = this.grid;
			b && b.isActive() && (b.beforeDraw(), this.transformAncestors());
			this.transform(a);
			this.sprite.visit();
			this.draw(a);
			b && b.isActive() && b.afterDraw(this);
			cc.kmGLPopMatrix();
			this.arrivalOrder = 0
		}
	},
	draw: null,
	_drawForCanvas: function(a) {
		a = a || cc._renderContext;
		if (this.autoDraw) {
			this.begin();
			if (this.clearFlags) {
				var b = this._cacheCanvas;
				a.save();
				a.fillStyle = this._clearColorStr;
				a.clearRect(0, 0, b.width, -b.height);
				a.fillRect(0, 0, b.width, -b.height);
				a.restore()
			}
			this.sortAllChildren();
			a = this._children;
			for (var b = a.length, c = this.sprite, d = 0; d < b; d++) {
				var e = a[d];
				e != c && e.visit()
			}
			this.end()
		}
	},
	_drawForWebGL: function(a) {
		a = cc._renderContext;
		if (this.autoDraw) {
			this.begin();
			var b = this.clearFlags;
			if (b) {
				var c = [0, 0, 0, 0],
					d = 0,
					e = 0;
				b & a.COLOR_BUFFER_BIT && (c = a.getParameter(a.COLOR_CLEAR_VALUE), a.clearColor(this._clearColor.r / 255, this._clearColor.g / 255, this._clearColor.b / 255, this._clearColor.a / 255));
				b & a.DEPTH_BUFFER_BIT && (d = a.getParameter(a.DEPTH_CLEAR_VALUE), a.clearDepth(this.clearDepthVal));
				b & a.STENCIL_BUFFER_BIT && (e = a.getParameter(a.STENCIL_CLEAR_VALUE), a.clearStencil(this.clearStencilVal));
				a.clear(b);
				b & a.COLOR_BUFFER_BIT && a.clearColor(c[0], c[1], c[2], c[3]);
				b & a.DEPTH_BUFFER_BIT && a.clearDepth(d);
				b & a.STENCIL_BUFFER_BIT && a.clearStencil(e)
			}
			this.sortAllChildren();
			a = this._children;
			for (b = 0; b < a.length; b++) c = a[b], c != this.sprite && c.visit();
			this.end()
		}
	},
	newCCImage: function(a) {
		cc.log("saveToFile isn't supported on cocos2d-html5");
		return null
	},
	_memcpy: function(a, b, c, d, e) {
		for (var f = 0; f < e; f++) a[b + f] = c[d + f]
	},
	saveToFile: function(a, b) {
		cc.log("saveToFile isn't supported on Cocos2d-Html5")
	},
	listenToBackground: function(a) {
		cc.log("listenToBackground isn't supported on Cocos2d-Html5")
	},
	listenToForeground: function(a) {
		cc.log("listenToForeground isn't supported on Cocos2d-Html5")
	},
	getClearFlags: function() {
		return this.clearFlags
	},
	setClearFlags: function(a) {
		this.clearFlags = a
	},
	getClearColor: function() {
		return this._clearColor
	},
	setClearColor: null,
	_setClearColorForCanvas: function(a) {
		var b = this._clearColor;
		b.r = a.r;
		b.g = a.g;
		b.b = a.b;
		b.a = a.a;
		this._clearColorStr = "rgba(" + (0 | a.r) + "," + (0 | a.g) + "," + (0 | a.b) + "," + a.a / 255 + ")"
	},
	_setClearColorForWebGL: function(a) {
		var b = this._clearColor;
		b.r = a.r;
		b.g = a.g;
		b.b = a.b;
		b.a = a.a
	},
	getClearDepth: function() {
		return this.clearDepthVal
	},
	setClearDepth: function(a) {
		this.clearDepthVal = a
	},
	getClearStencil: function() {
		return this.clearStencilVal
	},
	setClearStencil: function(a) {
		this.clearStencilVal = a
	},
	isAutoDraw: function() {
		return this.autoDraw
	},
	setAutoDraw: function(a) {
		this.autoDraw = a
	}
});
_p = cc.RenderTexture.prototype;
cc._renderType == cc._RENDER_TYPE_WEBGL ? (_p.ctor = _p._ctorForWebGL, _p.cleanup = _p._cleanupForWebGL, _p.initWithWidthAndHeight = _p._initWithWidthAndHeightForWebGL, _p.begin = _p._beginForWebGL, _p._beginWithClear = _p._beginWithClearForWebGL, _p.end = _p._endForWebGL, _p.clearRect = _p._clearRectForWebGL, _p.clearDepth = _p._clearDepthForWebGL, _p.clearStencil = _p._clearStencilForWebGL, _p.visit = _p._visitForWebGL, _p.draw = _p._drawForWebGL, _p.setClearColor = _p._setClearColorForWebGL) : (_p.ctor = _p._ctorForCanvas, _p.cleanup = _p._cleanupForCanvas, _p.initWithWidthAndHeight = _p._initWithWidthAndHeightForCanvas, _p.begin = _p._beginForCanvas, _p._beginWithClear = _p._beginWithClearForCanvas, _p.end = _p._endForCanvas, _p.clearRect = _p._clearRectForCanvas, _p.clearDepth = _p._clearDepthForCanvas, _p.clearStencil = _p._clearStencilForCanvas, _p.visit = _p._visitForCanvas, _p.draw = _p._drawForCanvas, _p.setClearColor = _p._setClearColorForCanvas);
cc.defineGetterSetter(_p, "clearColorVal", _p.getClearColor, _p.setClearColor);
cc.RenderTexture.create = function(a, b, c, d) {
	return new cc.RenderTexture(a, b, c, d)
};
cc.LabelAtlas = cc.AtlasNode.extend({
	_string: null,
	_mapStartChar: null,
	_textureLoaded: !1,
	_loadedEventListeners: null,
	_className: "LabelAtlas",
	ctor: function(a, b, c, d, e) {
		cc.AtlasNode.prototype.ctor.call(this);
		b && cc.LabelAtlas.prototype.initWithString.call(this, a, b, c, d, e)
	},
	textureLoaded: function() {
		return this._textureLoaded
	},
	addLoadedEventListener: function(a, b) {
		this._loadedEventListeners || (this._loadedEventListeners = []);
		this._loadedEventListeners.push({
			eventCallback: a,
			eventTarget: b
		})
	},
	_callLoadedEventCallbacks: function() {
		if (this._loadedEventListeners) {
			this._textureLoaded = !0;
			for (var a = this._loadedEventListeners, b = 0, c = a.length; b < c; b++) {
				var d = a[b];
				d.eventCallback.call(d.eventTarget, this)
			}
			a.length = 0
		}
	},
	initWithString: function(a, b, c, d, e) {
		var f = a + "",
			g, h;
		if (void 0 === c) {
			c = cc.loader.getRes(b);
			if (1 !== parseInt(c.version, 10)) return cc.log("cc.LabelAtlas.initWithString(): Unsupported version. Upgrade cocos2d version"), !1;
			b = cc.path.changeBasename(b, c.textureFilename);
			d = cc.contentScaleFactor();
			g = parseInt(c.itemWidth, 10) / d;
			h = parseInt(c.itemHeight, 10) / d;
			c = String.fromCharCode(parseInt(c.firstChar, 10))
		} else g = c || 0, h = d || 0, c = e || " ";
		var k = null,
			k = b instanceof cc.Texture2D ? b : cc.textureCache.addImage(b);
		(this._textureLoaded = b = k.isLoaded()) || k.addLoadedEventListener(function(a) {
			this.initWithTexture(k, g, h, f.length);
			this.string = f;
			this._callLoadedEventCallbacks()
		}, this);
		return this.initWithTexture(k, g, h, f.length) ? (this._mapStartChar = c, this.string = f, !0) : !1
	},
	setColor: function(a) {
		cc.AtlasNode.prototype.setColor.call(this, a);
		this.updateAtlasValues()
	},
	getString: function() {
		return this._string
	},
	draw: function(a) {
		cc.AtlasNode.prototype.draw.call(this, a);
		cc.LABELATLAS_DEBUG_DRAW && (a = this.size, a = [cc.p(0, 0), cc.p(a.width, 0), cc.p(a.width, a.height), cc.p(0, a.height)], cc._drawingUtil.drawPoly(a, 4, !0))
	},
	_addChildForCanvas: function(a, b, c) {
		a._lateChild = !0;
		cc.Node.prototype.addChild.call(this, a, b, c)
	},
	updateAtlasValues: null,
	_updateAtlasValuesForCanvas: function() {
		for (var a = this._string || "", b = a.length, c = this.texture, d = this._itemWidth, e = this._itemHeight, f = 0; f < b; f++) {
			var g = a.charCodeAt(f) - this._mapStartChar.charCodeAt(0),
				h = parseInt(g % this._itemsPerRow, 10),
				g = parseInt(g / this._itemsPerRow, 10),
				h = cc.rect(h * d, g * e, d, e),
				g = a.charCodeAt(f),
				k = this.getChildByTag(f);
			k ? 32 == g ? (k.init(), k.setTextureRect(cc.rect(0, 0, 10, 10), !1, cc.size(0, 0))) : (k.initWithTexture(c, h), k.visible = !0, k.opacity = this._displayedOpacity) : (k = new cc.Sprite, 32 == g ? (k.init(), k.setTextureRect(cc.rect(0, 0, 10, 10), !1, cc.size(0, 0))) : k.initWithTexture(c, h), cc.Node.prototype.addChild.call(this, k, 0, f));
			k.setPosition(f * d + d / 2, e / 2)
		}
	},
	_updateAtlasValuesForWebGL: function() {
		var a = this._string,
			b = a.length,
			c = this.textureAtlas,
			d = c.texture,
			e = d.pixelsWidth,
			d = d.pixelsHeight,
			f = this._itemWidth,
			g = this._itemHeight;
		this._ignoreContentScaleFactor || (f = this._itemWidth * cc.contentScaleFactor(), g = this._itemHeight * cc.contentScaleFactor());
		b > c.getCapacity() && cc.log("cc.LabelAtlas._updateAtlasValues(): Invalid String length");
		for (var h = c.quads, k = this._displayedColor, k = {
				r: k.r,
				g: k.g,
				b: k.b,
				a: this._displayedOpacity
			}, m = this._itemWidth, n = 0; n < b; n++) {
			var q = a.charCodeAt(n) - this._mapStartChar.charCodeAt(0),
				s = q % this._itemsPerRow,
				r = 0 | q / this._itemsPerRow,
				t;
			cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (s = (2 * s * f + 1) / (2 * e), q = s + (2 * f - 2) / (2 * e), r = (2 * r * g + 1) / (2 * d), t = r + (2 * g - 2) / (2 * d)) : (s = s * f / e, q = s + f / e, r = r * g / d, t = r + g / d);
			var u = h[n],
				y = u.tl,
				v = u.tr,
				C = u.bl,
				u = u.br;
			y.texCoords.u = s;
			y.texCoords.v = r;
			v.texCoords.u = q;
			v.texCoords.v = r;
			C.texCoords.u = s;
			C.texCoords.v = t;
			u.texCoords.u = q;
			u.texCoords.v = t;
			C.vertices.x = n * m;
			C.vertices.y = 0;
			C.vertices.z = 0;
			u.vertices.x = n * m + m;
			u.vertices.y = 0;
			u.vertices.z = 0;
			y.vertices.x = n * m;
			y.vertices.y = this._itemHeight;
			y.vertices.z = 0;
			v.vertices.x = n * m + m;
			v.vertices.y = this._itemHeight;
			v.vertices.z = 0;
			y.colors = k;
			v.colors = k;
			C.colors = k;
			u.colors = k
		}
		0 < b && (c.dirty = !0, a = c.totalQuads, b > a && c.increaseTotalQuadsWith(b - a))
	},
	setString: null,
	_setStringForCanvas: function(a) {
		a = String(a);
		var b = a.length;
		this._string = a;
		this.width = b * this._itemWidth;
		this.height = this._itemHeight;
		if (this._children) {
			a = this._children;
			for (var b = a.length, c = 0; c < b; c++) {
				var d = a[c];
				d && !d._lateChild && (d.visible = !1)
			}
		}
		this.updateAtlasValues();
		this.quadsToDraw = b
	},
	_setStringForWebGL: function(a) {
		a = String(a);
		var b = a.length;
		b > this.textureAtlas.totalQuads && this.textureAtlas.resizeCapacity(b);
		this._string = a;
		this.width = b * this._itemWidth;
		this.height = this._itemHeight;
		this.updateAtlasValues();
		this.quadsToDraw = b
	},
	setOpacity: null,
	_setOpacityForCanvas: function(a) {
		if (this._displayedOpacity !== a) {
			cc.AtlasNode.prototype.setOpacity.call(this, a);
			for (var b = this._children, c = 0, d = b.length; c < d; c++) b[c] && (b[c].opacity = a)
		}
	},
	_setOpacityForWebGL: function(a) {
		this._opacity !== a && cc.AtlasNode.prototype.setOpacity.call(this, a)
	}
});
_p = cc.LabelAtlas.prototype;
cc._renderType === cc._RENDER_TYPE_WEBGL ? (_p.updateAtlasValues = _p._updateAtlasValuesForWebGL, _p.setString = _p._setStringForWebGL, _p.setOpacity = _p._setOpacityForWebGL) : (_p.updateAtlasValues = _p._updateAtlasValuesForCanvas, _p.setString = _p._setStringForCanvas, _p.setOpacity = _p._setOpacityForCanvas, _p.addChild = _p._addChildForCanvas);
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "string", _p.getString, _p.setString);
cc.LabelAtlas.create = function(a, b, c, d, e) {
	return new cc.LabelAtlas(a, b, c, d, e)
};
cc.LABEL_AUTOMATIC_WIDTH = -1;
cc.LabelBMFont = cc.SpriteBatchNode.extend({
	_opacityModifyRGB: !1,
	_string: "",
	_config: null,
	_fntFile: "",
	_initialString: "",
	_alignment: cc.TEXT_ALIGNMENT_CENTER,
	_width: -1,
	_lineBreakWithoutSpaces: !1,
	_imageOffset: null,
	_reusedChar: null,
	_displayedOpacity: 255,
	_realOpacity: 255,
	_displayedColor: null,
	_realColor: null,
	_cascadeColorEnabled: !0,
	_cascadeOpacityEnabled: !0,
	_textureLoaded: !1,
	_loadedEventListeners: null,
	_className: "LabelBMFont",
	_setString: function(a, b) {
		b ? this._initialString = a : this._string = a;
		var c = this._children;
		if (c)
			for (var d = 0; d < c.length; d++) {
				var e = c[d];
				e && e.setVisible(!1)
			}
		this._textureLoaded && (this.createFontChars(), b && this.updateLabel())
	},
	ctor: function(a, b, c, d, e) {
		cc.SpriteBatchNode.prototype.ctor.call(this);
		this._imageOffset = cc.p(0, 0);
		this._displayedColor = cc.color(255, 255, 255, 255);
		this._realColor = cc.color(255, 255, 255, 255);
		this._reusedChar = [];
		this.initWithString(a, b, c, d, e)
	},
	textureLoaded: function() {
		return this._textureLoaded
	},
	addLoadedEventListener: function(a, b) {
		this._loadedEventListeners || (this._loadedEventListeners = []);
		this._loadedEventListeners.push({
			eventCallback: a,
			eventTarget: b
		})
	},
	_callLoadedEventCallbacks: function() {
		if (this._loadedEventListeners) {
			for (var a = this._loadedEventListeners, b = 0, c = a.length; b < c; b++) {
				var d = a[b];
				d.eventCallback.call(d.eventTarget, this)
			}
			a.length = 0
		}
	},
	draw: function(a) {
		cc.SpriteBatchNode.prototype.draw.call(this, a);
		if (cc.LABELBMFONT_DEBUG_DRAW) {
			a = this.getContentSize();
			var b = cc.p(0 | -this._anchorPointInPoints.x, 0 | -this._anchorPointInPoints.y);
			a = [cc.p(b.x, b.y), cc.p(b.x + a.width, b.y), cc.p(b.x +
				a.width, b.y + a.height), cc.p(b.x, b.y + a.height)];
			cc._drawingUtil.setDrawColor(0, 255, 0, 255);
			cc._drawingUtil.drawPoly(a, 4, !0)
		}
	},
	setColor: function(a) {
		var b = this._displayedColor,
			c = this._realColor;
		if (c.r != a.r || c.g != a.g || c.b != a.b || c.a != a.a) b.r = c.r = a.r, b.g = c.g = a.g, b.b = c.b = a.b, this._textureLoaded && this._cascadeColorEnabled && (a = cc.color.WHITE, (b = this._parent) && b.cascadeColor && (a = b.getDisplayedColor()), this.updateDisplayedColor(a))
	},
	isOpacityModifyRGB: function() {
		return this._opacityModifyRGB
	},
	setOpacityModifyRGB: function(a) {
		this._opacityModifyRGB = a;
		if (a = this._children)
			for (var b = 0; b < a.length; b++) {
				var c = a[b];
				c && (c.opacityModifyRGB = this._opacityModifyRGB)
			}
	},
	getOpacity: function() {
		return this._realOpacity
	},
	getDisplayedOpacity: function() {
		return this._displayedOpacity
	},
	setOpacity: function(a) {
		this._displayedOpacity = this._realOpacity = a;
		if (this._cascadeOpacityEnabled) {
			var b = 255,
				c = this._parent;
			c && c.cascadeOpacity && (b = c.getDisplayedOpacity());
			this.updateDisplayedOpacity(b)
		}
		this._displayedColor.a = this._realColor.a = a
	},
	updateDisplayedOpacity: function(a) {
		this._displayedOpacity = this._realOpacity * a / 255;
		a = this._children;
		for (var b = 0; b < a.length; b++) {
			var c = a[b];
			cc._renderType == cc._RENDER_TYPE_WEBGL ? c.updateDisplayedOpacity(this._displayedOpacity) : (cc.Node.prototype.updateDisplayedOpacity.call(c, this._displayedOpacity), c.setNodeDirty())
		}
		this._changeTextureColor()
	},
	isCascadeOpacityEnabled: function() {
		return !1
	},
	setCascadeOpacityEnabled: function(a) {
		this._cascadeOpacityEnabled = a
	},
	getColor: function() {
		var a = this._realColor;
		return cc.color(a.r, a.g, a.b, a.a)
	},
	getDisplayedColor: function() {
		var a = this._displayedColor;
		return cc.color(a.r, a.g, a.b, a.a)
	},
	updateDisplayedColor: function(a) {
		var b = this._displayedColor,
			c = this._realColor;
		b.r = c.r * a.r / 255;
		b.g = c.g * a.g / 255;
		b.b = c.b * a.b / 255;
		a = this._children;
		for (b = 0; b < a.length; b++) c = a[b], cc._renderType == cc._RENDER_TYPE_WEBGL ? c.updateDisplayedColor(this._displayedColor) : (cc.Node.prototype.updateDisplayedColor.call(c, this._displayedColor), c.setNodeDirty());
		this._changeTextureColor()
	},
	_changeTextureColor: function() {
		if (cc._renderType != cc._RENDER_TYPE_WEBGL) {
			var a = this.getTexture();
			if (a && 0 < a.getContentSize().width) {
				var b = this._originalTexture.getHtmlElementObj();
				if (b) {
					var c = a.getHtmlElementObj(),
						d = cc.rect(0, 0, b.width, b.height);
					c instanceof HTMLCanvasElement && !this._rectRotated ? cc.generateTintImageWithMultiply(b, this._displayedColor, d, c) : (c = cc.generateTintImageWithMultiply(b, this._displayedColor, d), a = new cc.Texture2D, a.initWithElement(c), a.handleLoadedTexture());
					this.setTexture(a)
				}
			}
		}
	},
	isCascadeColorEnabled: function() {
		return !1
	},
	setCascadeColorEnabled: function(a) {
		this._cascadeColorEnabled = a
	},
	init: function() {
		return this.initWithString(null, null, null, null, null)
	},
	initWithString: function(a, b, c, d, e) {
		a = a || "";
		this._config && cc.log("cc.LabelBMFont.initWithString(): re-init is no longer supported");
		if (b) {
			var f = cc.loader.getRes(b);
			if (!f) return cc.log("cc.LabelBMFont.initWithString(): Impossible to create font. Please check file"), !1;
			this._config = f;
			this._fntFile = b;
			b = cc.textureCache.addImage(f.atlasName);
			(this._textureLoaded = f = b.isLoaded()) || b.addLoadedEventListener(function(a) {
				this._textureLoaded = !0;
				this.initWithTexture(a, this._initialString.length);
				this.setString(this._initialString, !0);
				this._callLoadedEventCallbacks()
			}, this)
		} else b = new cc.Texture2D, f = new Image, b.initWithElement(f), this._textureLoaded = !1;
		return this.initWithTexture(b, a.length) ? (this._alignment = d || cc.TEXT_ALIGNMENT_LEFT, this._imageOffset = e || cc.p(0, 0), this._width = null == c ? -1 : c, this._displayedOpacity = this._realOpacity = 255, this._displayedColor = cc.color(255, 255, 255, 255), this._realColor = cc.color(255, 255, 255, 255), this._cascadeColorEnabled = this._cascadeOpacityEnabled = !0, this._contentSize.width = 0, this._contentSize.height = 0, this.setAnchorPoint(0.5, 0.5), cc._renderType === cc._RENDER_TYPE_WEBGL && (c = this.textureAtlas.texture, this._opacityModifyRGB = c.hasPremultipliedAlpha(), d = this._reusedChar = new cc.Sprite, d.initWithTexture(c, cc.rect(0, 0, 0, 0), !1), d.batchNode = this), this.setString(a, !0), !0) : !1
	},
	createFontChars: function() {
		var a = cc._renderType,
			b = a === cc._RENDER_TYPE_CANVAS ? this.texture : this.textureAtlas.texture,
			c = 0,
			d = cc.size(0, 0),
			e = 0,
			f = 1,
			g = this._string,
			h = g ? g.length : 0;
		if (0 !== h) {
			var k, m = this._config,
				n = m.kerningDict,
				q = m.commonHeight,
				s = m.fontDefDictionary;
			for (k = 0; k < h - 1; k++) 10 == g.charCodeAt(k) && f++;
			var r = q * f,
				f = -(q - q * f),
				t = -1;
			for (k = 0; k < h; k++)
				if (q = g.charCodeAt(k), 0 != q)
					if (10 === q) c = 0, f -= m.commonHeight;
					else {
						var u = n[t << 16 | q & 65535] || 0,
							y = s[q];
						if (y) {
							var v = cc.rect(y.rect.x, y.rect.y, y.rect.width, y.rect.height),
								v = cc.rectPixelsToPoints(v);
							v.x += this._imageOffset.x;
							v.y += this._imageOffset.y;
							(t = this.getChildByTag(k)) ? 32 === q && a === cc._RENDER_TYPE_CANVAS ? t.setTextureRect(v, !1, cc.size(0, 0)) : (t.setTextureRect(v, !1), t.visible = !0): (t = new cc.Sprite, 32 === q && a === cc._RENDER_TYPE_CANVAS && (v = cc.rect(0, 0, 0, 0)), t.initWithTexture(b, v, !1), t._newTextureWhenChangeColor = !0, this.addChild(t, 0, k));
							t.opacityModifyRGB = this._opacityModifyRGB;
							cc._renderType == cc._RENDER_TYPE_WEBGL ? (t.updateDisplayedColor(this._displayedColor), t.updateDisplayedOpacity(this._displayedOpacity)) : (cc.Node.prototype.updateDisplayedColor.call(t, this._displayedColor), cc.Node.prototype.updateDisplayedOpacity.call(t, this._displayedOpacity), t.setNodeDirty());
							v = cc.p(c + y.xOffset + 0.5 * y.rect.width + u, f + (m.commonHeight - y.yOffset) - 0.5 * v.height * cc.contentScaleFactor());
							t.setPosition(cc.pointPixelsToPoints(v));
							c += y.xAdvance + u;
							t = q;
							e < c && (e = c)
						} else cc.log("cocos2d: LabelBMFont: character not found " + g[k])
					}
			d.width = y && y.xAdvance < y.rect.width ? e - y.xAdvance + y.rect.width : e;
			d.height = r;
			this.setContentSize(cc.sizePixelsToPoints(d))
		}
	},
	updateString: function(a) {
		var b = this._children;
		if (b)
			for (var c = 0, d = b.length; c < d; c++) {
				var e = b[c];
				e && (e.visible = !1)
			}
		this._config && this.createFontChars();
		a || this.updateLabel()
	},
	getString: function() {
		return this._initialString
	},
	setString: function(a, b) {
		a = String(a);
		null == b && (b = !0);
		null != a && cc.isString(a) || (a += "");
		this._initialString = a;
		this._setString(a, b)
	},
	_setStringForSetter: function(a) {
		this.setString(a, !1)
	},
	setCString: function(a) {
		this.setString(a, !0)
	},
	updateLabel: function() {
		this.string = this._initialString;
		if (0 < this._width) {
			for (var a = this._string.length, b = [], c = [], d = 1, e = 0, f = !1, g = !1, h = -1, k = -1, m = 0, n, q = 0, s = this._children.length; q < s; q++) {
				for (var r = 0; !(n = this.getChildByTag(q + m + r));) r++;
				m += r;
				if (e >= a) break;
				var t = this._string[e];
				g || (k = this._getLetterPosXLeft(n), g = !0);
				f || (h = k, f = !0);
				if (10 == t.charCodeAt(0)) {
					c.push("\n");
					b = b.concat(c);
					c.length = 0;
					f = g = !1;
					h = k = -1;
					q--;
					m -= r;
					d++;
					if (e >= a) break;
					k || (k = this._getLetterPosXLeft(n), g = !0);
					h || (h = k, f = !0);
					e++
				} else if (this._isspace_unicode(t)) c.push(t), b = b.concat(c), c.length = 0, g = !1, k = -1, e++;
				else if (this._getLetterPosXRight(n) - h > this._width)
					if (this._lineBreakWithoutSpaces) {
						this._utf8_trim_ws(c);
						c.push("\n");
						b = b.concat(c);
						c.length = 0;
						f = g = !1;
						h = k = -1;
						d++;
						if (e >= a) break;
						k || (k = this._getLetterPosXLeft(n), g = !0);
						h || (h = k, f = !0);
						q--
					} else c.push(t), -1 != b.lastIndexOf(" ") ? this._utf8_trim_ws(b) : b = [], 0 < b.length && b.push("\n"), d++, f = !1, h = -1, e++;
				else c.push(t), e++
			}
			b = b.concat(c);
			q = b.length;
			n = "";
			for (e = 0; e < q; ++e) n += b[e];
			n += String.fromCharCode(0);
			this._setString(n, !1)
		}
		if (this._alignment != cc.TEXT_ALIGNMENT_LEFT)
			for (b = e = 0, a = this._string.length, c = [], d = 0; d < a; d++)
				if (10 == this._string[d].charCodeAt(0) || 0 == this._string[d].charCodeAt(0))
					if (q = 0, f = c.length, 0 == f) b++;
					else {
						if (n = e + f - 1 + b, !(0 > n) && (q = this.getChildByTag(n), null != q)) {
							q = q.getPositionX() + q._getWidth() / 2;
							g = 0;
							switch (this._alignment) {
								case cc.TEXT_ALIGNMENT_CENTER:
									g = this.width / 2 - q / 2;
									break;
								case cc.TEXT_ALIGNMENT_RIGHT:
									g = this.width - q
							}
							if (0 != g)
								for (q = 0; q < f; q++)(n = e + q + b, 0 > n || !(n = this.getChildByTag(n))) || (n.x += g);
							e += f;
							b++;
							c.length = 0
						}
					} else c.push(this._string[e])
	},
	setAlignment: function(a) {
		this._alignment = a;
		this.updateLabel()
	},
	_getAlignment: function() {
		return this._alignment
	},
	setBoundingWidth: function(a) {
		this._width = a;
		this.updateLabel()
	},
	_getBoundingWidth: function() {
		return this._width
	},
	setLineBreakWithoutSpace: function(a) {
		this._lineBreakWithoutSpaces = a;
		this.updateLabel()
	},
	setScale: function(a, b) {
		cc.Node.prototype.setScale.call(this, a, b);
		this.updateLabel()
	},
	setScaleX: function(a) {
		cc.Node.prototype.setScaleX.call(this, a);
		this.updateLabel()
	},
	setScaleY: function(a) {
		cc.Node.prototype.setScaleY.call(this, a);
		this.updateLabel()
	},
	setFntFile: function(a) {
		if (null != a && a != this._fntFile) {
			var b = cc.loader.getRes(a);
			b ? (this._fntFile = a, this._config = b, a = cc.textureCache.addImage(b.atlasName), this._textureLoaded = b = a.isLoaded(), this.texture = a, cc._renderType === cc._RENDER_TYPE_CANVAS && (this._originalTexture = this.texture), b ? this.createFontChars() : a.addLoadedEventListener(function(a) {
				this._textureLoaded = !0;
				this.texture = a;
				this.createFontChars();
				this._changeTextureColor();
				this.updateLabel();
				this._callLoadedEventCallbacks()
			}, this)) : cc.log("cc.LabelBMFont.setFntFile() : Impossible to create font. Please check file")
		}
	},
	getFntFile: function() {
		return this._fntFile
	},
	setAnchorPoint: function(a, b) {
		cc.Node.prototype.setAnchorPoint.call(this, a, b);
		this.updateLabel()
	},
	_setAnchor: function(a) {
		cc.Node.prototype._setAnchor.call(this, a);
		this.updateLabel()
	},
	_setAnchorX: function(a) {
		cc.Node.prototype._setAnchorX.call(this, a);
		this.updateLabel()
	},
	_setAnchorY: function(a) {
		cc.Node.prototype._setAnchorY.call(this, a);
		this.updateLabel()
	},
	_atlasNameFromFntFile: function(a) {},
	_kerningAmountForFirst: function(a, b) {
		var c = 0;
		if (this._configuration.kerningDictionary) {
			var d = this._configuration.kerningDictionary[(a << 16 | b & 65535).toString()];
			d && (c = d.amount)
		}
		return c
	},
	_getLetterPosXLeft: function(a) {
		return a.getPositionX() * this._scaleX - a._getWidth() * this._scaleX * a._getAnchorX()
	},
	_getLetterPosXRight: function(a) {
		return a.getPositionX() * this._scaleX + a._getWidth() * this._scaleX * a._getAnchorX()
	},
	_isspace_unicode: function(a) {
		a = a.charCodeAt(0);
		return 9 <= a && 13 >= a || 32 == a || 133 == a || 160 == a || 5760 == a || 8192 <= a && 8202 >= a || 8232 == a || 8233 == a || 8239 == a || 8287 == a || 12288 == a
	},
	_utf8_trim_ws: function(a) {
		var b = a.length;
		if (!(0 >= b) && (b -= 1, this._isspace_unicode(a[b]))) {
			for (var c = b - 1; 0 <= c; --c)
				if (this._isspace_unicode(a[c])) b = c;
				else break;
			this._utf8_trim_from(a, b)
		}
	},
	_utf8_trim_from: function(a, b) {
		var c = a.length;
		b >= c || 0 > b || a.splice(b, c)
	}
});
_p = cc.LabelBMFont.prototype;
cc._renderType === cc._RENDER_TYPE_CANVAS && (cc.sys._supportCanvasNewBlendModes || (_p._changeTextureColor = function() {
	if (cc._renderType != cc._RENDER_TYPE_WEBGL) {
		var a, b = this.getTexture();
		if (b && 0 < b.getContentSize().width && (a = b.getHtmlElementObj())) {
			var c = cc.textureCache.getTextureColors(this._originalTexture.getHtmlElementObj());
			c && (a instanceof HTMLCanvasElement && !this._rectRotated ? cc.generateTintImage(a, c, this._displayedColor, null, a) : (a = cc.generateTintImage(a, c, this._displayedColor), b = new cc.Texture2D, b.initWithElement(a), b.handleLoadedTexture()), this.setTexture(b))
		}
	}
}), _p.setTexture = function(a) {
	for (var b = this._children, c = this._displayedColor, d = 0; d < b.length; d++) {
		var e = b[d],
			f = e._displayedColor;
		if (this._textureForCanvas == e._texture || f.r === c.r && f.g === c.g && f.b === c.b) e.texture = a
	}
	this._textureForCanvas = a
});
cc.defineGetterSetter(_p, "string", _p.getString, _p._setStringForSetter);
cc.defineGetterSetter(_p, "boundingWidth", _p._getBoundingWidth, _p.setBoundingWidth);
cc.defineGetterSetter(_p, "textAlign", _p._getAlignment, _p.setAlignment);
cc.LabelBMFont.create = function(a, b, c, d, e) {
	return new cc.LabelBMFont(a, b, c, d, e)
};
cc._fntLoader = {
	INFO_EXP: /info [^\n]*(\n|$)/gi,
	COMMON_EXP: /common [^\n]*(\n|$)/gi,
	PAGE_EXP: /page [^\n]*(\n|$)/gi,
	CHAR_EXP: /char [^\n]*(\n|$)/gi,
	KERNING_EXP: /kerning [^\n]*(\n|$)/gi,
	ITEM_EXP: /\w+=[^ \r\n]+/gi,
	INT_EXP: /^[\-]?\d+$/,
	_parseStrToObj: function(a) {
		a = a.match(this.ITEM_EXP);
		var b = {};
		if (a)
			for (var c = 0, d = a.length; c < d; c++) {
				var e = a[c],
					f = e.indexOf("\x3d"),
					g = e.substring(0, f),
					e = e.substring(f + 1);
				e.match(this.INT_EXP) ? e = parseInt(e) : '"' == e[0] && (e = e.substring(1, e.length - 1));
				b[g] = e
			}
		return b
	},
	parseFnt: function(a, b) {
		var c = {},
			d = this._parseStrToObj(a.match(this.INFO_EXP)[0]).padding.split(",");
		parseInt(d[0]);
		parseInt(d[1]);
		parseInt(d[2]);
		parseInt(d[3]);
		d = this._parseStrToObj(a.match(this.COMMON_EXP)[0]);
		c.commonHeight = d.lineHeight;
		if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
			var e = cc.configuration.getMaxTextureSize();
			(d.scaleW > e.width || d.scaleH > e.height) && cc.log("cc.LabelBMFont._parseCommonArguments(): page can't be larger than supported")
		}
		1 !== d.pages && cc.log("cc.LabelBMFont._parseCommonArguments(): only supports 1 page");
		d = this._parseStrToObj(a.match(this.PAGE_EXP)[0]);
		0 !== d.id && cc.log("cc.LabelBMFont._parseImageFileName() : file could not be found");
		c.atlasName = cc.path.changeBasename(b, d.file);
		for (var f = a.match(this.CHAR_EXP), g = c.fontDefDictionary = {}, d = 0, e = f.length; d < e; d++) {
			var h = this._parseStrToObj(f[d]);
			g[h.id] = {
				rect: {
					x: h.x,
					y: h.y,
					width: h.width,
					height: h.height
				},
				xOffset: h.xoffset,
				yOffset: h.yoffset,
				xAdvance: h.xadvance
			}
		}
		f = c.kerningDict = {};
		if (g = a.match(this.KERNING_EXP))
			for (d = 0, e = g.length; d < e; d++) h = this._parseStrToObj(g[d]), f[h.first << 16 | h.second & 65535] = h.amount;
		return c
	},
	load: function(a, b, c, d) {
		var e = this;
		cc.loader.loadTxt(a, function(a, c) {
			if (a) return d(a);
			d(null, e.parseFnt(c, b))
		})
	}
};
cc.loader.register(["fnt"], cc._fntLoader);
cc.MotionStreak = cc.Node.extend({
	texture: null,
	fastMode: !1,
	startingPositionInitialized: !1,
	_blendFunc: null,
	_stroke: 0,
	_fadeDelta: 0,
	_minSeg: 0,
	_maxPoints: 0,
	_nuPoints: 0,
	_previousNuPoints: 0,
	_pointVertexes: null,
	_pointState: null,
	_vertices: null,
	_colorPointer: null,
	_texCoords: null,
	_verticesBuffer: null,
	_colorPointerBuffer: null,
	_texCoordsBuffer: null,
	_className: "MotionStreak",
	ctor: function(a, b, c, d, e) {
		cc.Node.prototype.ctor.call(this);
		this._positionR = cc.p(0, 0);
		this._blendFunc = new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
		this._vertexWebGLBuffer = cc._renderContext.createBuffer();
		this.startingPositionInitialized = this.fastMode = !1;
		this.texture = null;
		this._previousNuPoints = this._nuPoints = this._maxPoints = this._minSeg = this._fadeDelta = this._stroke = 0;
		this._texCoordsBuffer = this._colorPointerBuffer = this._verticesBuffer = this._texCoords = this._colorPointer = this._vertices = this._pointState = this._pointVertexes = null;
		void 0 !== e && this.initWithFade(a, b, c, d, e)
	},
	getTexture: function() {
		return this.texture
	},
	setTexture: function(a) {
		this.texture != a && (this.texture = a)
	},
	getBlendFunc: function() {
		return this._blendFunc
	},
	setBlendFunc: function(a, b) {
		void 0 === b ? this._blendFunc = a : (this._blendFunc.src = a, this._blendFunc.dst = b)
	},
	getOpacity: function() {
		cc.log("cc.MotionStreak.getOpacity has not been supported.");
		return 0
	},
	setOpacity: function(a) {
		cc.log("cc.MotionStreak.setOpacity has not been supported.")
	},
	setOpacityModifyRGB: function(a) {},
	isOpacityModifyRGB: function() {
		return !1
	},
	onExit: function() {
		cc.Node.prototype.onExit.call(this);
		this._verticesBuffer && cc._renderContext.deleteBuffer(this._verticesBuffer);
		this._texCoordsBuffer && cc._renderContext.deleteBuffer(this._texCoordsBuffer);
		this._colorPointerBuffer && cc._renderContext.deleteBuffer(this._colorPointerBuffer)
	},
	isFastMode: function() {
		return this.fastMode
	},
	setFastMode: function(a) {
		this.fastMode = a
	},
	isStartingPositionInitialized: function() {
		return this.startingPositionInitialized
	},
	setStartingPositionInitialized: function(a) {
		this.startingPositionInitialized = a
	},
	initWithFade: function(a, b, c, d, e) {
		if (!e) throw "cc.MotionStreak.initWithFade(): Invalid filename or texture";
		cc.isString(e) && (e = cc.textureCache.addImage(e));
		cc.Node.prototype.setPosition.call(this, cc.p(0, 0));
		this.anchorY = this.anchorX = 0;
		this.ignoreAnchor = !0;
		this.startingPositionInitialized = !1;
		this.fastMode = !0;
		this._minSeg = -1 == b ? c / 5 : b;
		this._minSeg *= this._minSeg;
		this._stroke = c;
		this._fadeDelta = 1 / a;
		a = (0 | 60 * a) + 2;
		this._nuPoints = 0;
		this._pointState = new Float32Array(a);
		this._pointVertexes = new Float32Array(2 * a);
		this._vertices = new Float32Array(4 * a);
		this._texCoords = new Float32Array(4 * a);
		this._colorPointer = new Uint8Array(8 * a);
		this._maxPoints = a;
		a = cc._renderContext;
		this._verticesBuffer = a.createBuffer();
		this._texCoordsBuffer = a.createBuffer();
		this._colorPointerBuffer = a.createBuffer();
		this._blendFunc.src = a.SRC_ALPHA;
		this._blendFunc.dst = a.ONE_MINUS_SRC_ALPHA;
		this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
		this.texture = e;
		this.color = d;
		this.scheduleUpdate();
		a.bindBuffer(a.ARRAY_BUFFER, this._verticesBuffer);
		a.bufferData(a.ARRAY_BUFFER, this._vertices, a.DYNAMIC_DRAW);
		a.bindBuffer(a.ARRAY_BUFFER, this._texCoordsBuffer);
		a.bufferData(a.ARRAY_BUFFER, this._texCoords, a.DYNAMIC_DRAW);
		a.bindBuffer(a.ARRAY_BUFFER, this._colorPointerBuffer);
		a.bufferData(a.ARRAY_BUFFER, this._colorPointer, a.DYNAMIC_DRAW);
		return !0
	},
	tintWithColor: function(a) {
		this.color = a;
		for (var b = this._colorPointer, c = 0, d = 2 * this._nuPoints; c < d; c++) b[4 * c] = a.r, b[4 * c + 1] = a.g, b[4 * c + 2] = a.b
	},
	reset: function() {
		this._nuPoints = 0
	},
	setPosition: function(a, b) {
		this.startingPositionInitialized = !0;
		void 0 === b ? (this._positionR.x = a.x, this._positionR.y = a.y) : (this._positionR.x = a, this._positionR.y = b)
	},
	getPositionX: function() {
		return this._positionR.x
	},
	setPositionX: function(a) {
		this._positionR.x = a;
		this.startingPositionInitialized || (this.startingPositionInitialized = !0)
	},
	getPositionY: function() {
		return this._positionR.y
	},
	setPositionY: function(a) {
		this._positionR.y = a;
		this.startingPositionInitialized || (this.startingPositionInitialized = !0)
	},
	draw: function(a) {
		1 >= this._nuPoints || !this.texture || !this.texture.isLoaded() || (a = a || cc._renderContext, cc.nodeDrawSetup(this), cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX), cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst), cc.glBindTexture2D(this.texture), a.bindBuffer(a.ARRAY_BUFFER, this._verticesBuffer), a.bufferData(a.ARRAY_BUFFER, this._vertices, a.DYNAMIC_DRAW), a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, 0, 0), a.bindBuffer(a.ARRAY_BUFFER, this._texCoordsBuffer), a.bufferData(a.ARRAY_BUFFER, this._texCoords, a.DYNAMIC_DRAW), a.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, a.FLOAT, !1, 0, 0), a.bindBuffer(a.ARRAY_BUFFER, this._colorPointerBuffer), a.bufferData(a.ARRAY_BUFFER, this._colorPointer, a.DYNAMIC_DRAW), a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, 0, 0), a.drawArrays(a.TRIANGLE_STRIP, 0, 2 * this._nuPoints), cc.g_NumberOfDraws++)
	},
	update: function(a) {
		if (this.startingPositionInitialized) {
			a *= this._fadeDelta;
			var b, c, d, e, f = 0,
				g = this._nuPoints,
				h = this._pointState,
				k = this._pointVertexes,
				m = this._vertices,
				n = this._colorPointer;
			for (d = 0; d < g; d++) h[d] -= a, 0 >= h[d] ? f++ : (b = d - f, 0 < f ? (h[b] = h[d], k[2 * b] = k[2 * d], k[2 * b + 1] = k[2 * d + 1], e = 2 * d, c = 2 * b, m[2 * c] = m[2 * e], m[2 * c + 1] = m[2 * e + 1], m[2 * (c + 1)] = m[2 * (e + 1)], m[2 * (c + 1) + 1] = m[2 * (e + 1) + 1], e *= 4, c *= 4, n[c + 0] = n[e + 0], n[c + 1] = n[e + 1], n[c + 2] = n[e + 2], n[c + 4] = n[e + 4], n[c + 5] = n[e + 5], n[c + 6] = n[e + 6]) : c = 8 * b, b = 255 * h[b], n[c + 3] = b, n[c + 7] = b);
			g -= f;
			d = !0;
			g >= this._maxPoints ? d = !1 : 0 < g && (a = cc.pDistanceSQ(cc.p(k[2 * (g - 1)], k[2 * (g - 1) + 1]), this._positionR) < this._minSeg, c = 1 == g ? !1 : cc.pDistanceSQ(cc.p(k[2 * (g - 2)], k[2 * (g - 2) + 1]), this._positionR) < 2 * this._minSeg, a || c) && (d = !1);
			d && (k[2 * g] = this._positionR.x, k[2 * g + 1] = this._positionR.y, h[g] = 1, h = 8 * g, d = this._displayedColor, n[h] = d.r, n[h + 1] = d.g, n[h + 2] = d.b, n[h + 4] = d.r, n[h + 5] = d.g, n[h + 6] = d.b, n[h + 3] = 255, n[h + 7] = 255, 0 < g && this.fastMode && (1 < g ? cc.vertexLineToPolygon(k, this._stroke, this._vertices, g, 1) : cc.vertexLineToPolygon(k, this._stroke, this._vertices, 0, 2)), g++);
			this.fastMode || cc.vertexLineToPolygon(k, this._stroke, this._vertices, 0, g);
			if (g && this._previousNuPoints != g) {
				k = 1 / g;
				n = this._texCoords;
				for (d = 0; d < g; d++) n[4 * d] = 0, n[4 * d + 1] = k * d, n[2 * (2 * d + 1)] = 1, n[2 * (2 * d + 1) + 1] = k * d;
				this._previousNuPoints = g
			}
			this._nuPoints = g
		}
	}
});
cc.MotionStreak.create = function(a, b, c, d, e) {
	return new cc.MotionStreak(a, b, c, d, e)
};
cc.NodeGrid = cc.Node.extend({
	grid: null,
	_target: null,
	getGrid: function() {
		return this.grid
	},
	setGrid: function(a) {
		this.grid = a
	},
	setTarget: function(a) {
		this._target = a
	},
	addChild: function(a, b, c) {
		cc.Node.prototype.addChild.call(this, a, b, c);
		a && !this._target && (this._target = a)
	},
	visit: function() {
		if (this._visible) {
			var a = cc._renderType == cc._RENDER_TYPE_WEBGL,
				b = this.grid;
			a && b && b._active && b.beforeDraw();
			this.transform();
			var c = this._children;
			if (c && 0 < c.length) {
				var d = c.length;
				this.sortAllChildren();
				for (i = 0; i < d; i++) {
					var e = c[i];
					e && e.visit()
				}
			}
			a && b && b._active && b.afterDraw(this._target)
		}
	},
	_transformForWebGL: function() {
		var a = this._transform4x4,
			b = cc.current_stack.top,
			c = this.nodeToParentTransform(),
			d = a.mat;
		d[0] = c.a;
		d[4] = c.c;
		d[12] = c.tx;
		d[1] = c.b;
		d[5] = c.d;
		d[13] = c.ty;
		d[14] = this._vertexZ;
		cc.kmMat4Multiply(b, b, a);
		null == this._camera || this.grid && this.grid.isActive() || (a = this._anchorPointInPoints.x, b = this._anchorPointInPoints.y, 0 !== a || 0 !== b ? (cc.SPRITEBATCHNODE_RENDER_SUBPIXEL || (a |= 0, b |= 0), cc.kmGLTranslatef(a, b, 0), this._camera.locate(), cc.kmGLTranslatef(-a, -b, 0)) : this._camera.locate())
	}
});
_p = cc.NodeGrid.prototype;
cc._renderType === cc._RENDER_TYPE_WEBGL && (_p.transform = _p._transformForWebGL);
cc.defineGetterSetter(_p, "target", null, _p.setTarget);
cc.NodeGrid.create = function() {
	return new cc.NodeGrid
};
cc.v2fzero = function() {
	return {
		x: 0,
		y: 0
	}
};
cc.v2f = function(a, b) {
	return {
		x: a,
		y: b
	}
};
cc.v2fadd = function(a, b) {
	return cc.v2f(a.x + b.x, a.y + b.y)
};
cc.v2fsub = function(a, b) {
	return cc.v2f(a.x - b.x, a.y - b.y)
};
cc.v2fmult = function(a, b) {
	return cc.v2f(a.x * b, a.y * b)
};
cc.v2fperp = function(a) {
	return cc.v2f(-a.y, a.x)
};
cc.v2fneg = function(a) {
	return cc.v2f(-a.x, -a.y)
};
cc.v2fdot = function(a, b) {
	return a.x * b.x + a.y * b.y
};
cc.v2fforangle = function(a) {
	return cc.v2f(Math.cos(a), Math.sin(a))
};
cc.v2fnormalize = function(a) {
	a = cc.pNormalize(cc.p(a.x, a.y));
	return cc.v2f(a.x, a.y)
};
cc.__v2f = function(a) {
	return cc.v2f(a.x, a.y)
};
cc.__t = function(a) {
	return {
		u: a.x,
		v: a.y
	}
};
cc.DrawNodeCanvas = cc.Node.extend({
	_buffer: null,
	_blendFunc: null,
	_lineWidth: 1,
	_drawColor: null,
	_className: "DrawNodeCanvas",
	ctor: function() {
		cc.Node.prototype.ctor.call(this);
		this._buffer = [];
		this._drawColor = cc.color(255, 255, 255, 255);
		this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
		this.init()
	},
	getBlendFunc: function() {
		return this._blendFunc
	},
	setBlendFunc: function(a, b) {
		void 0 === b ? (this._blendFunc.src = a.src, this._blendFunc.dst = a.dst) : (this._blendFunc.src = a, this._blendFunc.dst = b)
	},
	setLineWidth: function(a) {
		this._lineWidth = a
	},
	getLineWidth: function() {
		return this._lineWidth
	},
	setDrawColor: function(a) {
		var b = this._drawColor;
		b.r = a.r;
		b.g = a.g;
		b.b = a.b;
		b.a = null == a.a ? 255 : a.a
	},
	getDrawColor: function() {
		return cc.color(this._drawColor.r, this._drawColor.g, this._drawColor.b, this._drawColor.a)
	},
	drawRect: function(a, b, c, d, e) {
		d = d || this._lineWidth;
		e = e || this.getDrawColor();
		null == e.a && (e.a = 255);
		a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
		b = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
		b.verts = a;
		b.lineWidth = d;
		b.lineColor = e;
		b.isClosePolygon = !0;
		b.isStroke = !0;
		b.lineCap = "butt";
		if (b.fillColor = c) null == c.a && (c.a = 255), b.isFill = !0;
		this._buffer.push(b)
	},
	drawCircle: function(a, b, c, d, e, f, g) {
		f = f || this._lineWidth;
		g = g || this.getDrawColor();
		null == g.a && (g.a = 255);
		for (var h = 2 * Math.PI / d, k = [], m = 0; m <= d; m++) {
			var n = m * h,
				q = b * Math.cos(n + c) + a.x,
				n = b * Math.sin(n + c) + a.y;
			k.push(cc.p(q, n))
		}
		e && k.push(cc.p(a.x, a.y));
		a = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
		a.verts = k;
		a.lineWidth = f;
		a.lineColor = g;
		a.isClosePolygon = !0;
		a.isStroke = !0;
		this._buffer.push(a)
	},
	drawQuadBezier: function(a, b, c, d, e, f) {
		e = e || this._lineWidth;
		f = f || this.getDrawColor();
		null == f.a && (f.a = 255);
		for (var g = [], h = 0, k = 0; k < d; k++) {
			var m = Math.pow(1 - h, 2) * a.x + 2 * (1 - h) * h * b.x + h * h * c.x,
				n = Math.pow(1 - h, 2) * a.y + 2 * (1 - h) * h * b.y + h * h * c.y;
			g.push(cc.p(m, n));
			h += 1 / d
		}
		g.push(cc.p(c.x, c.y));
		a = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
		a.verts = g;
		a.lineWidth = e;
		a.lineColor = f;
		a.isStroke = !0;
		a.lineCap = "round";
		this._buffer.push(a)
	},
	drawCubicBezier: function(a, b, c, d, e, f, g) {
		f = f || this._lineWidth;
		g = g || this.getDrawColor();
		null == g.a && (g.a = 255);
		for (var h = [], k = 0, m = 0; m < e; m++) {
			var n = Math.pow(1 - k, 3) * a.x + 3 * Math.pow(1 - k, 2) * k * b.x + 3 * (1 - k) * k * k * c.x + k * k * k * d.x,
				q = Math.pow(1 - k, 3) * a.y + 3 * Math.pow(1 - k, 2) * k * b.y + 3 * (1 - k) * k * k * c.y + k * k * k * d.y;
			h.push(cc.p(n, q));
			k += 1 / e
		}
		h.push(cc.p(d.x, d.y));
		a = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
		a.verts = h;
		a.lineWidth = f;
		a.lineColor = g;
		a.isStroke = !0;
		a.lineCap = "round";
		this._buffer.push(a)
	},
	drawCatmullRom: function(a, b, c, d) {
		this.drawCardinalSpline(a, 0.5, b, c, d)
	},
	drawCardinalSpline: function(a, b, c, d, e) {
		d = d || this._lineWidth;
		e = e || this.getDrawColor();
		null == e.a && (e.a = 255);
		for (var f = [], g, h, k = 1 / a.length, m = 0; m < c + 1; m++) h = m / c, 1 == h ? (g = a.length - 1, h = 1) : (g = 0 | h / k, h = (h - k * g) / k), g = cc.cardinalSplineAt(cc.getControlPointAt(a, g - 1), cc.getControlPointAt(a, g - 0), cc.getControlPointAt(a, g + 1), cc.getControlPointAt(a, g + 2), b, h), f.push(g);
		a = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
		a.verts = f;
		a.lineWidth = d;
		a.lineColor = e;
		a.isStroke = !0;
		a.lineCap = "round";
		this._buffer.push(a)
	},
	drawDot: function(a, b, c) {
		c = c || this.getDrawColor();
		null == c.a && (c.a = 255);
		var d = new cc._DrawNodeElement(cc.DrawNode.TYPE_DOT);
		d.verts = [a];
		d.lineWidth = b;
		d.fillColor = c;
		this._buffer.push(d)
	},
	drawDots: function(a, b, c) {
		if (a && 0 != a.length) {
			c = c || this.getDrawColor();
			null == c.a && (c.a = 255);
			for (var d = 0, e = a.length; d < e; d++) this.drawDot(a[d], b, c)
		}
	},
	drawSegment: function(a, b, c, d) {
		c = c || this._lineWidth;
		d = d || this.getDrawColor();
		null == d.a && (d.a = 255);
		var e = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
		e.verts = [a, b];
		e.lineWidth = 2 * c;
		e.lineColor = d;
		e.isStroke = !0;
		e.lineCap = "round";
		this._buffer.push(e)
	},
	drawPoly_: function(a, b, c, d) {
		c = c || this._lineWidth;
		d = d || this.getDrawColor();
		null == d.a && (d.a = 255);
		var e = new cc._DrawNodeElement(cc.DrawNode.TYPE_POLY);
		e.verts = a;
		e.fillColor = b;
		e.lineWidth = c;
		e.lineColor = d;
		e.isClosePolygon = !0;
		e.isStroke = !0;
		e.lineCap = "round";
		b && (e.isFill = !0);
		this._buffer.push(e)
	},
	drawPoly: function(a, b, c, d) {
		for (var e = [], f = 0; f < a.length; f++) e.push(cc.p(a[f].x, a[f].y));
		return this.drawPoly_(e, b, c, d)
	},
	draw: function(a) {
		a = a || cc._renderContext;
		this._blendFunc && this._blendFunc.src == cc.SRC_ALPHA && this._blendFunc.dst == cc.ONE && (a.globalCompositeOperation = "lighter");
		for (var b = 0; b < this._buffer.length; b++) {
			var c = this._buffer[b];
			switch (c.type) {
				case cc.DrawNode.TYPE_DOT:
					this._drawDot(a, c);
					break;
				case cc.DrawNode.TYPE_SEGMENT:
					this._drawSegment(a, c);
					break;
				case cc.DrawNode.TYPE_POLY:
					this._drawPoly(a, c)
			}
		}
	},
	_drawDot: function(a, b) {
		var c = b.fillColor,
			d = b.verts[0],
			e = b.lineWidth,
			f = cc.view.getScaleX(),
			g = cc.view.getScaleY();
		a.fillStyle = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b) + "," + c.a / 255 + ")";
		a.beginPath();
		a.arc(d.x * f, -d.y * g, e * f, 0, 2 * Math.PI, !1);
		a.closePath();
		a.fill()
	},
	_drawSegment: function(a, b) {
		var c = b.lineColor,
			d = b.verts[0],
			e = b.verts[1],
			f = b.lineWidth,
			g = b.lineCap,
			h = cc.view.getScaleX(),
			k = cc.view.getScaleY();
		a.strokeStyle = "rgba(" + (0 | c.r) + "," + (0 | c.g) + "," + (0 | c.b) + "," + c.a / 255 + ")";
		a.lineWidth = f * h;
		a.beginPath();
		a.lineCap = g;
		a.moveTo(d.x * h, -d.y * k);
		a.lineTo(e.x * h, -e.y * k);
		a.stroke()
	},
	_drawPoly: function(a, b) {
		var c = b.verts,
			d = b.lineCap,
			e = b.fillColor,
			f = b.lineWidth,
			g = b.lineColor,
			h = b.isClosePolygon,
			k = b.isFill,
			m = b.isStroke;
		if (null != c) {
			var n = c[0],
				q = cc.view.getScaleX(),
				s = cc.view.getScaleY();
			a.lineCap = d;
			e && (a.fillStyle = "rgba(" + (0 | e.r) + "," + (0 | e.g) + "," + (0 | e.b) + "," + e.a / 255 + ")");
			f && (a.lineWidth = f * q);
			g && (a.strokeStyle = "rgba(" + (0 | g.r) + "," + (0 | g.g) + "," + (0 | g.b) + "," + g.a / 255 + ")");
			a.beginPath();
			a.moveTo(n.x * q, -n.y * s);
			d = 1;
			for (e = c.length; d < e; d++) a.lineTo(c[d].x * q, -c[d].y * s);
			h && a.closePath();
			k && a.fill();
			m && a.stroke()
		}
	},
	clear: function() {
		this._buffer.length = 0
	}
});
cc.DrawNodeWebGL = cc.Node.extend({
	_bufferCapacity: 0,
	_buffer: null,
	_trianglesArrayBuffer: null,
	_trianglesWebBuffer: null,
	_trianglesReader: null,
	_lineWidth: 1,
	_drawColor: null,
	_blendFunc: null,
	_dirty: !1,
	_className: "DrawNodeWebGL",
	getBlendFunc: function() {
		return this._blendFunc
	},
	setBlendFunc: function(a, b) {
		void 0 === b ? (this._blendFunc.src = a.src, this._blendFunc.dst = a.dst) : (this._blendFunc.src = a, this._blendFunc.dst = b)
	},
	ctor: function() {
		cc.Node.prototype.ctor.call(this);
		this._buffer = [];
		this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
		this._drawColor = cc.color(255, 255, 255, 255);
		this.init()
	},
	init: function() {
		return cc.Node.prototype.init.call(this) ? (this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_LENGTHTEXTURECOLOR), this._ensureCapacity(64), this._trianglesWebBuffer = cc._renderContext.createBuffer(), this._dirty = !0) : !1
	},
	setLineWidth: function(a) {
		this._lineWidth = a
	},
	getLineWidth: function() {
		return this._lineWidth
	},
	setDrawColor: function(a) {
		var b = this._drawColor;
		b.r = a.r;
		b.g = a.g;
		b.b = a.b;
		b.a = a.a
	},
	getDrawColor: function() {
		return cc.color(this._drawColor.r, this._drawColor.g, this._drawColor.b, this._drawColor.a)
	},
	drawRect: function(a, b, c, d, e) {
		d = d || this._lineWidth;
		e = e || this.getDrawColor();
		null == e.a && (e.a = 255);
		a = [a, cc.p(b.x, a.y), b, cc.p(a.x, b.y)];
		null == c ? this._drawSegments(a, d, e, !0) : this.drawPoly(a, c, d, e)
	},
	drawCircle: function(a, b, c, d, e, f, g) {
		f = f || this._lineWidth;
		g = g || this.getDrawColor();
		null == g.a && (g.a = 255);
		var h = 2 * Math.PI / d,
			k = [],
			m;
		for (m = 0; m <= d; m++) {
			var n = m * h,
				q = b * Math.cos(n + c) + a.x,
				n = b * Math.sin(n + c) + a.y;
			k.push(cc.p(q, n))
		}
		e && k.push(cc.p(a.x, a.y));
		f *= 0.5;
		m = 0;
		for (a = k.length; m < a - 1; m++) this.drawSegment(k[m], k[m + 1], f, g)
	},
	drawQuadBezier: function(a, b, c, d, e, f) {
		e = e || this._lineWidth;
		f = f || this.getDrawColor();
		null == f.a && (f.a = 255);
		for (var g = [], h = 0, k = 0; k < d; k++) {
			var m = Math.pow(1 - h, 2) * a.x + 2 * (1 - h) * h * b.x + h * h * c.x,
				n = Math.pow(1 - h, 2) * a.y + 2 * (1 - h) * h * b.y + h * h * c.y;
			g.push(cc.p(m, n));
			h += 1 / d
		}
		g.push(cc.p(c.x, c.y));
		this._drawSegments(g, e, f, !1)
	},
	drawCubicBezier: function(a, b, c, d, e, f, g) {
		f = f || this._lineWidth;
		g = g || this.getDrawColor();
		null == g.a && (g.a = 255);
		for (var h = [], k = 0, m = 0; m < e; m++) {
			var n = Math.pow(1 - k, 3) * a.x + 3 * Math.pow(1 - k, 2) * k * b.x + 3 * (1 - k) * k * k * c.x + k * k * k * d.x,
				q = Math.pow(1 - k, 3) * a.y + 3 * Math.pow(1 - k, 2) * k * b.y + 3 * (1 - k) * k * k * c.y + k * k * k * d.y;
			h.push(cc.p(n, q));
			k += 1 / e
		}
		h.push(cc.p(d.x, d.y));
		this._drawSegments(h, f, g, !1)
	},
	drawCatmullRom: function(a, b, c, d) {
		this.drawCardinalSpline(a, 0.5, b, c, d)
	},
	drawCardinalSpline: function(a, b, c, d, e) {
		d = d || this._lineWidth;
		e = e || this.getDrawColor();
		null == e.a && (e.a = 255);
		for (var f = [], g, h, k = 1 / a.length, m = 0; m < c + 1; m++) h = m / c, 1 == h ? (g = a.length - 1, h = 1) : (g = 0 | h / k, h = (h - k * g) / k), g = cc.cardinalSplineAt(cc.getControlPointAt(a, g - 1), cc.getControlPointAt(a, g - 0), cc.getControlPointAt(a, g + 1), cc.getControlPointAt(a, g + 2), b, h), f.push(g);
		d *= 0.5;
		a = 0;
		for (b = f.length; a < b - 1; a++) this.drawSegment(f[a], f[a + 1], d, e)
	},
	_render: function() {
		var a = cc._renderContext;
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
		a.bindBuffer(a.ARRAY_BUFFER, this._trianglesWebBuffer);
		this._dirty && (a.bufferData(a.ARRAY_BUFFER, this._trianglesArrayBuffer, a.STREAM_DRAW), this._dirty = !1);
		var b = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
		a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, b, 0);
		a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, b, 8);
		a.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, a.FLOAT, !1, b, 12);
		a.drawArrays(a.TRIANGLES, 0, 3 * this._buffer.length);
		cc.incrementGLDraws(1)
	},
	_ensureCapacity: function(a) {
		var b = this._buffer;
		if (b.length + a > this._bufferCapacity) {
			var c = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT;
			this._bufferCapacity += Math.max(this._bufferCapacity, a);
			if (null == b || 0 === b.length) this._buffer = [], this._trianglesArrayBuffer = new ArrayBuffer(c * this._bufferCapacity), this._trianglesReader = new Uint8Array(this._trianglesArrayBuffer);
			else {
				a = [];
				for (var d = new ArrayBuffer(c * this._bufferCapacity), e = 0; e < b.length; e++) a[e] = new cc.V2F_C4B_T2F_Triangle(b[e].a, b[e].b, b[e].c, d, e * c);
				this._trianglesReader = new Uint8Array(d);
				this._trianglesArrayBuffer = d;
				this._buffer = a
			}
		}
	},
	draw: function() {
		cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
		this._shaderProgram.use();
		this._shaderProgram.setUniformsForBuiltins();
		this._render()
	},
	drawDot: function(a, b, c) {
		c = c || this.getDrawColor();
		null == c.a && (c.a = 255);
		var d = {
			r: 0 | c.r,
			g: 0 | c.g,
			b: 0 | c.b,
			a: 0 | c.a
		};
		c = {
			vertices: {
				x: a.x - b,
				y: a.y - b
			},
			colors: d,
			texCoords: {
				u: -1,
				v: -1
			}
		};
		var e = {
				vertices: {
					x: a.x - b,
					y: a.y + b
				},
				colors: d,
				texCoords: {
					u: -1,
					v: 1
				}
			},
			f = {
				vertices: {
					x: a.x + b,
					y: a.y + b
				},
				colors: d,
				texCoords: {
					u: 1,
					v: 1
				}
			};
		a = {
			vertices: {
				x: a.x + b,
				y: a.y - b
			},
			colors: d,
			texCoords: {
				u: 1,
				v: -1
			}
		};
		this._ensureCapacity(6);
		this._buffer.push(new cc.V2F_C4B_T2F_Triangle(c, e, f, this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
		this._buffer.push(new cc.V2F_C4B_T2F_Triangle(c, f, a, this._trianglesArrayBuffer, this._buffer.length * cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT));
		this._dirty = !0
	},
	drawDots: function(a, b, c) {
		if (a && 0 != a.length) {
			c = c || this.getDrawColor();
			null == c.a && (c.a = 255);
			for (var d = 0, e = a.length; d < e; d++) this.drawDot(a[d], b, c)
		}
	},
	drawSegment: function(a, b, c, d) {
		d = d || this.getDrawColor();
		null == d.a && (d.a = 255);
		c = c || 0.5 * this._lineWidth;
		this._ensureCapacity(18);
		d = {
			r: 0 | d.r,
			g: 0 | d.g,
			b: 0 | d.b,
			a: 0 | d.a
		};
		var e = cc.__v2f(a),
			f = cc.__v2f(b);
		b = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(f, e)));
		a = cc.v2fperp(b);
		var g = cc.v2fmult(b, c),
			h = cc.v2fmult(a, c);
		c = cc.v2fsub(f, cc.v2fadd(g, h));
		var k = cc.v2fadd(f, cc.v2fsub(g, h)),
			m = cc.v2fsub(f, g),
			f = cc.v2fadd(f, g),
			n = cc.v2fsub(e, g),
			q = cc.v2fadd(e, g),
			s = cc.v2fsub(e, cc.v2fsub(g, h)),
			e = cc.v2fadd(e, cc.v2fadd(g, h)),
			g = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT,
			h = this._trianglesArrayBuffer,
			r = this._buffer;
		r.push(new cc.V2F_C4B_T2F_Triangle({
			vertices: c,
			colors: d,
			texCoords: cc.__t(cc.v2fneg(cc.v2fadd(b, a)))
		}, {
			vertices: k,
			colors: d,
			texCoords: cc.__t(cc.v2fsub(b, a))
		}, {
			vertices: m,
			colors: d,
			texCoords: cc.__t(cc.v2fneg(b))
		}, h, r.length * g));
		r.push(new cc.V2F_C4B_T2F_Triangle({
			vertices: f,
			colors: d,
			texCoords: cc.__t(b)
		}, {
			vertices: k,
			colors: d,
			texCoords: cc.__t(cc.v2fsub(b, a))
		}, {
			vertices: m,
			colors: d,
			texCoords: cc.__t(cc.v2fneg(b))
		}, h, r.length * g));
		r.push(new cc.V2F_C4B_T2F_Triangle({
			vertices: f,
			colors: d,
			texCoords: cc.__t(b)
		}, {
			vertices: n,
			colors: d,
			texCoords: cc.__t(cc.v2fneg(b))
		}, {
			vertices: m,
			colors: d,
			texCoords: cc.__t(cc.v2fneg(b))
		}, h, r.length * g));
		r.push(new cc.V2F_C4B_T2F_Triangle({
			vertices: f,
			colors: d,
			texCoords: cc.__t(b)
		}, {
			vertices: n,
			colors: d,
			texCoords: cc.__t(cc.v2fneg(b))
		}, {
			vertices: q,
			colors: d,
			texCoords: cc.__t(b)
		}, h, r.length * g));
		r.push(new cc.V2F_C4B_T2F_Triangle({
			vertices: s,
			colors: d,
			texCoords: cc.__t(cc.v2fsub(a, b))
		}, {
			vertices: n,
			colors: d,
			texCoords: cc.__t(cc.v2fneg(b))
		}, {
			vertices: q,
			colors: d,
			texCoords: cc.__t(b)
		}, h, r.length * g));
		r.push(new cc.V2F_C4B_T2F_Triangle({
			vertices: s,
			colors: d,
			texCoords: cc.__t(cc.v2fsub(a, b))
		}, {
			vertices: e,
			colors: d,
			texCoords: cc.__t(cc.v2fadd(b, a))
		}, {
			vertices: q,
			colors: d,
			texCoords: cc.__t(b)
		}, h, r.length * g));
		this._dirty = !0
	},
	drawPoly: function(a, b, c, d) {
		if (null == b) this._drawSegments(a, c, d, !0);
		else {
			null == b.a && (b.a = 255);
			null == d.a && (d.a = 255);
			c = c || this._lineWidth;
			c *= 0.5;
			b = {
				r: 0 | b.r,
				g: 0 | b.g,
				b: 0 | b.b,
				a: 0 | b.a
			};
			d = {
				r: 0 | d.r,
				g: 0 | d.g,
				b: 0 | d.b,
				a: 0 | d.a
			};
			var e = [],
				f, g, h, k, m = a.length;
			for (f = 0; f < m; f++) {
				g = cc.__v2f(a[(f - 1 + m) % m]);
				h = cc.__v2f(a[f]);
				k = cc.__v2f(a[(f + 1) % m]);
				var n = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(h, g)));
				h = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(k, h)));
				n = cc.v2fmult(cc.v2fadd(n, h), 1 / (cc.v2fdot(n, h) + 1));
				e[f] = {
					offset: n,
					n: h
				}
			}
			n = 0 < c;
			this._ensureCapacity(3 * (3 * m - 2));
			var q = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT,
				s = this._trianglesArrayBuffer,
				r = this._buffer,
				t = !1 == n ? 0.5 : 0;
			for (f = 0; f < m - 2; f++) g = cc.v2fsub(cc.__v2f(a[0]), cc.v2fmult(e[0].offset, t)), h = cc.v2fsub(cc.__v2f(a[f + 1]), cc.v2fmult(e[f + 1].offset, t)), k = cc.v2fsub(cc.__v2f(a[f + 2]), cc.v2fmult(e[f + 2].offset, t)), r.push(new cc.V2F_C4B_T2F_Triangle({
				vertices: g,
				colors: b,
				texCoords: cc.__t(cc.v2fzero())
			}, {
				vertices: h,
				colors: b,
				texCoords: cc.__t(cc.v2fzero())
			}, {
				vertices: k,
				colors: b,
				texCoords: cc.__t(cc.v2fzero())
			}, s, r.length * q));
			for (f = 0; f < m; f++) {
				t = (f + 1) % m;
				g = cc.__v2f(a[f]);
				h = cc.__v2f(a[t]);
				k = e[f].n;
				var u = e[f].offset,
					y = e[t].offset,
					t = n ? cc.v2fsub(g, cc.v2fmult(u, c)) : cc.v2fsub(g, cc.v2fmult(u, 0.5)),
					v = n ? cc.v2fsub(h, cc.v2fmult(y, c)) : cc.v2fsub(h, cc.v2fmult(y, 0.5));
				g = n ? cc.v2fadd(g, cc.v2fmult(u, c)) : cc.v2fadd(g, cc.v2fmult(u, 0.5));
				h = n ? cc.v2fadd(h, cc.v2fmult(y, c)) : cc.v2fadd(h, cc.v2fmult(y, 0.5));
				n ? (r.push(new cc.V2F_C4B_T2F_Triangle({
					vertices: t,
					colors: d,
					texCoords: cc.__t(cc.v2fneg(k))
				}, {
					vertices: v,
					colors: d,
					texCoords: cc.__t(cc.v2fneg(k))
				}, {
					vertices: h,
					colors: d,
					texCoords: cc.__t(k)
				}, s, r.length * q)), r.push(new cc.V2F_C4B_T2F_Triangle({
					vertices: t,
					colors: d,
					texCoords: cc.__t(cc.v2fneg(k))
				}, {
					vertices: g,
					colors: d,
					texCoords: cc.__t(k)
				}, {
					vertices: h,
					colors: d,
					texCoords: cc.__t(k)
				}, s, r.length * q))) : (r.push(new cc.V2F_C4B_T2F_Triangle({
					vertices: t,
					colors: b,
					texCoords: cc.__t(cc.v2fzero())
				}, {
					vertices: v,
					colors: b,
					texCoords: cc.__t(cc.v2fzero())
				}, {
					vertices: h,
					colors: b,
					texCoords: cc.__t(k)
				}, s, r.length * q)), r.push(new cc.V2F_C4B_T2F_Triangle({
					vertices: t,
					colors: b,
					texCoords: cc.__t(cc.v2fzero())
				}, {
					vertices: g,
					colors: b,
					texCoords: cc.__t(k)
				}, {
					vertices: h,
					colors: b,
					texCoords: cc.__t(k)
				}, s, r.length * q)))
			}
			this._dirty = !0
		}
	},
	_drawSegments: function(a, b, c, d) {
		b = b || this._lineWidth;
		c = c || this._drawColor;
		null == c.a && (c.a = 255);
		b *= 0.5;
		if (!(0 >= b)) {
			c = {
				r: 0 | c.r,
				g: 0 | c.g,
				b: 0 | c.b,
				a: 0 | c.a
			};
			var e = [],
				f, g, h, k, m = a.length;
			for (f = 0; f < m; f++) {
				g = cc.__v2f(a[(f - 1 + m) % m]);
				h = cc.__v2f(a[f]);
				k = cc.__v2f(a[(f + 1) % m]);
				var n = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(h, g)));
				h = cc.v2fnormalize(cc.v2fperp(cc.v2fsub(k, h)));
				k = cc.v2fmult(cc.v2fadd(n, h), 1 / (cc.v2fdot(n, h) + 1));
				e[f] = {
					offset: k,
					n: h
				}
			}
			this._ensureCapacity(3 * (3 * m - 2));
			k = cc.V2F_C4B_T2F_Triangle.BYTES_PER_ELEMENT;
			var n = this._trianglesArrayBuffer,
				q = this._buffer;
			d = d ? m : m - 1;
			for (f = 0; f < d; f++) {
				var s = (f + 1) % m;
				g = cc.__v2f(a[f]);
				h = cc.__v2f(a[s]);
				var r = e[f].n,
					t = e[f].offset,
					u = e[s].offset,
					s = cc.v2fsub(g, cc.v2fmult(t, b)),
					y = cc.v2fsub(h, cc.v2fmult(u, b));
				g = cc.v2fadd(g, cc.v2fmult(t, b));
				h = cc.v2fadd(h, cc.v2fmult(u, b));
				q.push(new cc.V2F_C4B_T2F_Triangle({
					vertices: s,
					colors: c,
					texCoords: cc.__t(cc.v2fneg(r))
				}, {
					vertices: y,
					colors: c,
					texCoords: cc.__t(cc.v2fneg(r))
				}, {
					vertices: h,
					colors: c,
					texCoords: cc.__t(r)
				}, n, q.length * k));
				q.push(new cc.V2F_C4B_T2F_Triangle({
					vertices: s,
					colors: c,
					texCoords: cc.__t(cc.v2fneg(r))
				}, {
					vertices: g,
					colors: c,
					texCoords: cc.__t(r)
				}, {
					vertices: h,
					colors: c,
					texCoords: cc.__t(r)
				}, n, q.length * k))
			}
			this._dirty = !0
		}
	},
	clear: function() {
		this._buffer.length = 0;
		this._dirty = !0
	}
});
cc.DrawNode = cc._renderType == cc._RENDER_TYPE_WEBGL ? cc.DrawNodeWebGL : cc.DrawNodeCanvas;
cc.DrawNode.create = function() {
	return new cc.DrawNode
};
cc._DrawNodeElement = function(a, b, c, d, e, f, g, h, k) {
	this.type = a;
	this.verts = b || null;
	this.fillColor = c || null;
	this.lineWidth = d || 0;
	this.lineColor = e || null;
	this.lineCap = f || "butt";
	this.isClosePolygon = g || !1;
	this.isFill = h || !1;
	this.isStroke = k || !1
};
cc.DrawNode.TYPE_DOT = 0;
cc.DrawNode.TYPE_SEGMENT = 1;
cc.DrawNode.TYPE_POLY = 2;
cc.stencilBits = -1;
cc.setProgram = function(a, b) {
	a.shaderProgram = b;
	var c = a.children;
	if (c)
		for (var d = 0; d < c.length; d++) cc.setProgram(c[d], b)
};
cc.ClippingNode = cc.Node.extend({
	alphaThreshold: 0,
	inverted: !1,
	_stencil: null,
	_godhelpme: !1,
	ctor: function(a) {
		cc.Node.prototype.ctor.call(this);
		this._stencil = null;
		this.alphaThreshold = 0;
		this.inverted = !1;
		cc.ClippingNode.prototype.init.call(this, a || null)
	},
	init: null,
	_className: "ClippingNode",
	_initForWebGL: function(a) {
		this._stencil = a;
		this.alphaThreshold = 1;
		this.inverted = !1;
		cc.ClippingNode._init_once = !0;
		cc.ClippingNode._init_once && (cc.stencilBits = cc._renderContext.getParameter(cc._renderContext.STENCIL_BITS), 0 >= cc.stencilBits && cc.log("Stencil buffer is not enabled."), cc.ClippingNode._init_once = !1);
		return !0
	},
	_initForCanvas: function(a) {
		this._stencil = a;
		this.alphaThreshold = 1;
		this.inverted = !1
	},
	onEnter: function() {
		cc.Node.prototype.onEnter.call(this);
		this._stencil.onEnter()
	},
	onEnterTransitionDidFinish: function() {
		cc.Node.prototype.onEnterTransitionDidFinish.call(this);
		this._stencil.onEnterTransitionDidFinish()
	},
	onExitTransitionDidStart: function() {
		this._stencil.onExitTransitionDidStart();
		cc.Node.prototype.onExitTransitionDidStart.call(this)
	},
	onExit: function() {
		this._stencil.onExit();
		cc.Node.prototype.onExit.call(this)
	},
	visit: null,
	_visitForWebGL: function(a) {
		var b = a || cc._renderContext;
		if (1 > cc.stencilBits) cc.Node.prototype.visit.call(this, a);
		else if (this._stencil && this._stencil.visible)
			if (cc.ClippingNode._layer + 1 == cc.stencilBits) cc.ClippingNode._visit_once = !0, cc.ClippingNode._visit_once && (cc.log("Nesting more than " + cc.stencilBits + "stencils is not supported. Everything will be drawn without stencil for this node and its childs."), cc.ClippingNode._visit_once = !1), cc.Node.prototype.visit.call(this, a);
			else {
				cc.ClippingNode._layer++;
				var c = 1 << cc.ClippingNode._layer,
					d = c | c - 1,
					e = b.isEnabled(b.STENCIL_TEST),
					f = b.getParameter(b.STENCIL_WRITEMASK),
					g = b.getParameter(b.STENCIL_FUNC),
					h = b.getParameter(b.STENCIL_REF),
					k = b.getParameter(b.STENCIL_VALUE_MASK),
					m = b.getParameter(b.STENCIL_FAIL),
					n = b.getParameter(b.STENCIL_PASS_DEPTH_FAIL),
					q = b.getParameter(b.STENCIL_PASS_DEPTH_PASS);
				b.enable(b.STENCIL_TEST);
				b.stencilMask(c);
				var s = b.getParameter(b.DEPTH_WRITEMASK);
				b.depthMask(!1);
				b.stencilFunc(b.NEVER, c, c);
				b.stencilOp(this.inverted ? b.REPLACE : b.ZERO, b.KEEP, b.KEEP);
				cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
				cc.kmGLPushMatrix();
				cc.kmGLLoadIdentity();
				cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
				cc.kmGLPushMatrix();
				cc.kmGLLoadIdentity();
				cc._drawingUtil.drawSolidRect(cc.p(-1, -1), cc.p(1, 1), cc.color(255, 255, 255, 255));
				cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
				cc.kmGLPopMatrix();
				cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
				cc.kmGLPopMatrix();
				b.stencilFunc(b.NEVER, c, c);
				b.stencilOp(this.inverted ? b.ZERO : b.REPLACE, b.KEEP, b.KEEP);
				if (1 > this.alphaThreshold) {
					var c = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST),
						r = b.getUniformLocation(c.getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S);
					cc.glUseProgram(c.getProgram());
					c.setUniformLocationWith1f(r, this.alphaThreshold);
					cc.setProgram(this._stencil, c)
				}
				cc.kmGLPushMatrix();
				this.transform();
				this._stencil.visit();
				cc.kmGLPopMatrix();
				b.depthMask(s);
				b.stencilFunc(b.EQUAL, d, d);
				b.stencilOp(b.KEEP, b.KEEP, b.KEEP);
				cc.Node.prototype.visit.call(this, a);
				b.stencilFunc(g, h, k);
				b.stencilOp(m, n, q);
				b.stencilMask(f);
				e || b.disable(b.STENCIL_TEST);
				cc.ClippingNode._layer--
			} else this.inverted && cc.Node.prototype.visit.call(this, a)
	},
	_visitForCanvas: function(a) {
		if (this._stencil && this._stencil.visible) {
			a = a || cc._renderContext;
			var b = a.canvas;
			if (this._cangodhelpme() || this._stencil instanceof cc.Sprite) {
				var c = cc.ClippingNode._getSharedCache();
				c.width = b.width;
				c.height = b.height;
				c.getContext("2d").drawImage(b, 0, 0);
				a.save();
				cc.Node.prototype.visit.call(this, a);
				a.globalCompositeOperation = this.inverted ? "destination-out" : "destination-in";
				this.transform(a);
				this._stencil.visit();
				a.restore();
				a.save();
				a.setTransform(1, 0, 0, 1, 0, 0);
				a.globalCompositeOperation = "destination-over";
				a.drawImage(c, 0, 0)
			} else {
				var c = this._children,
					d;
				a.save();
				this.transform(a);
				this._stencil.visit(a);
				this.inverted && (a.save(), a.setTransform(1, 0, 0, 1, 0, 0), a.moveTo(0, 0), a.lineTo(0, b.height), a.lineTo(b.width, b.height), a.lineTo(b.width, 0), a.lineTo(0, 0), a.restore());
				a.clip();
				this._cangodhelpme(!0);
				var e = c.length;
				if (0 < e) {
					this.sortAllChildren();
					for (b = 0; b < e; b++)
						if (d = c[b], 0 > d._localZOrder) d.visit(a);
						else break;
					for (this.draw(a); b < e; b++) c[b].visit(a)
				} else this.draw(a);
				this._cangodhelpme(!1)
			}
			a.restore()
		} else this.inverted && cc.Node.prototype.visit.call(this, a)
	},
	getStencil: function() {
		return this._stencil
	},
	setStencil: null,
	_setStencilForWebGL: function(a) {
		this._stencil = a
	},
	_setStencilForCanvas: function(a) {
		this._stencil = a;
		var b = cc._renderContext;
		!(a instanceof cc.Sprite) && a instanceof cc.DrawNode && (a.draw = function() {
			var c = cc.view.getScaleX(),
				d = cc.view.getScaleY();
			b.beginPath();
			for (var e = 0; e < a._buffer.length; e++) {
				var f = a._buffer[e].verts,
					g = f[0];
				b.moveTo(g.x * c, -g.y * d);
				for (var g = 1, h = f.length; g < h; g++) b.lineTo(f[g].x * c, -f[g].y * d)
			}
		})
	},
	getAlphaThreshold: function() {
		return this.alphaThreshold
	},
	setAlphaThreshold: function(a) {
		this.alphaThreshold = a
	},
	isInverted: function() {
		return this.inverted
	},
	setInverted: function(a) {
		this.inverted = a
	},
	_cangodhelpme: function(a) {
		if (!0 === a || !1 === a) cc.ClippingNode.prototype._godhelpme = a;
		return cc.ClippingNode.prototype._godhelpme
	}
});
_p = cc.ClippingNode.prototype;
cc._renderType === cc._RENDER_TYPE_WEBGL ? (_p.init = _p._initForWebGL, _p.visit = _p._visitForWebGL, _p.setStencil = _p._setStencilForWebGL) : (_p.init = _p._initForCanvas, _p.visit = _p._visitForCanvas, _p.setStencil = _p._setStencilForCanvas);
cc.defineGetterSetter(_p, "stencil", _p.getStencil, _p.setStencil);
cc.ClippingNode._init_once = null;
cc.ClippingNode._visit_once = null;
cc.ClippingNode._layer = -1;
cc.ClippingNode._sharedCache = null;
cc.ClippingNode._getSharedCache = function() {
	return cc.ClippingNode._sharedCache || (cc.ClippingNode._sharedCache = document.createElement("canvas"))
};
cc.ClippingNode.create = function(a) {
	return new cc.ClippingNode(a)
};
cc.GridBase = cc.Class.extend({
	_active: !1,
	_reuseGrid: 0,
	_gridSize: null,
	_texture: null,
	_step: null,
	_grabber: null,
	_isTextureFlipped: !1,
	_shaderProgram: null,
	_directorProjection: 0,
	_dirty: !1,
	ctor: function(a, b, c) {
		cc._checkWebGLRenderMode();
		this._active = !1;
		this._reuseGrid = 0;
		this._texture = this._gridSize = null;
		this._step = cc.p(0, 0);
		this._grabber = null;
		this._isTextureFlipped = !1;
		this._shaderProgram = null;
		this._directorProjection = 0;
		this._dirty = !1;
		void 0 !== a && this.initWithSize(a, b, c)
	},
	isActive: function() {
		return this._active
	},
	setActive: function(a) {
		this._active = a;
		if (!a) {
			a = cc.director;
			var b = a.getProjection();
			a.setProjection(b)
		}
	},
	getReuseGrid: function() {
		return this._reuseGrid
	},
	setReuseGrid: function(a) {
		this._reuseGrid = a
	},
	getGridSize: function() {
		return cc.size(this._gridSize.width, this._gridSize.height)
	},
	setGridSize: function(a) {
		this._gridSize.width = parseInt(a.width);
		this._gridSize.height = parseInt(a.height)
	},
	getStep: function() {
		return cc.p(this._step.x, this._step.y)
	},
	setStep: function(a) {
		this._step.x = a.x;
		this._step.y = a.y
	},
	isTextureFlipped: function() {
		return this._isTextureFlipped
	},
	setTextureFlipped: function(a) {
		this._isTextureFlipped != a && (this._isTextureFlipped = a, this.calculateVertexPoints())
	},
	initWithSize: function(a, b, c) {
		if (!b) {
			var d = cc.director.getWinSizeInPixels(),
				e = cc.NextPOT(d.width),
				f = cc.NextPOT(d.height),
				g = new Uint8Array(e * f * 4);
			if (!g) return cc.log("cocos2d: CCGrid: not enough memory."), !1;
			b = new cc.Texture2D;
			b.initWithData(g, cc.Texture2D.PIXEL_FORMAT_RGBA8888, e, f, d);
			if (!b) return cc.log("cocos2d: CCGrid: error creating texture"), !1
		}
		this._active = !1;
		this._reuseGrid = 0;
		this._gridSize = a;
		this._texture = b;
		this._isTextureFlipped = c || !1;
		this._step.x = this._texture.width / a.width;
		this._step.y = this._texture.height / a.height;
		this._grabber = new cc.Grabber;
		if (!this._grabber) return !1;
		this._grabber.grab(this._texture);
		this._shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE);
		this.calculateVertexPoints();
		return !0
	},
	beforeDraw: function() {
		this._directorProjection = cc.director.getProjection();
		this.set2DProjection();
		this._grabber.beforeRender(this._texture)
	},
	afterDraw: function(a) {
		this._grabber.afterRender(this._texture);
		cc.director.setProjection(this._directorProjection);
		if (a.getCamera().isDirty()) {
			var b = a.getAnchorPointInPoints();
			cc.kmGLTranslatef(b.x, b.y, 0);
			a.getCamera().locate();
			cc.kmGLTranslatef(-b.x, -b.y, 0)
		}
		cc.glBindTexture2D(this._texture);
		this.blit()
	},
	blit: function() {
		cc.log("cc.GridBase.blit(): Shall be overridden in subclass.")
	},
	reuse: function() {
		cc.log("cc.GridBase.reuse(): Shall be overridden in subclass.")
	},
	calculateVertexPoints: function() {
		cc.log("cc.GridBase.calculateVertexPoints(): Shall be overridden in subclass.")
	},
	set2DProjection: function() {
		var a = cc.director.getWinSizeInPixels();
		cc._renderContext.viewport(0, 0, a.width, a.height);
		cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
		cc.kmGLLoadIdentity();
		var b = new cc.kmMat4;
		cc.kmMat4OrthographicProjection(b, 0, a.width, 0, a.height, -1, 1);
		cc.kmGLMultMatrix(b);
		cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
		cc.kmGLLoadIdentity();
		cc.setProjectionMatrixDirty()
	}
});
cc.GridBase.create = function(a, b, c) {
	return new cc.GridBase(a, b, c)
};
cc.Grid3D = cc.GridBase.extend({
	_texCoordinates: null,
	_vertices: null,
	_originalVertices: null,
	_indices: null,
	_texCoordinateBuffer: null,
	_verticesBuffer: null,
	_indicesBuffer: null,
	ctor: function(a, b, c) {
		cc.GridBase.prototype.ctor.call(this);
		this._indicesBuffer = this._verticesBuffer = this._texCoordinateBuffer = this._indices = this._originalVertices = this._vertices = this._texCoordinates = null;
		void 0 !== a && this.initWithSize(a, b, c)
	},
	vertex: function(a) {
		a.x === (0 | a.x) && a.y === (0 | a.y) || cc.log("cc.Grid3D.vertex() : Numbers must be integers");
		a = 0 | 3 * (a.x * (this._gridSize.height + 1) + a.y);
		var b = this._vertices;
		return new cc.Vertex3F(b[a], b[a + 1], b[a + 2])
	},
	originalVertex: function(a) {
		a.x === (0 | a.x) && a.y === (0 | a.y) || cc.log("cc.Grid3D.originalVertex() : Numbers must be integers");
		a = 0 | 3 * (a.x * (this._gridSize.height + 1) + a.y);
		var b = this._originalVertices;
		return new cc.Vertex3F(b[a], b[a + 1], b[a + 2])
	},
	setVertex: function(a, b) {
		a.x === (0 | a.x) && a.y === (0 | a.y) || cc.log("cc.Grid3D.setVertex() : Numbers must be integers");
		var c = 0 | 3 * (a.x * (this._gridSize.height + 1) + a.y),
			d = this._vertices;
		d[c] = b.x;
		d[c + 1] = b.y;
		d[c + 2] = b.z;
		this._dirty = !0
	},
	blit: function() {
		var a = this._gridSize.width * this._gridSize.height;
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS);
		this._shaderProgram.use();
		this._shaderProgram.setUniformsForBuiltins();
		var b = cc._renderContext,
			c = this._dirty;
		b.bindBuffer(b.ARRAY_BUFFER, this._verticesBuffer);
		c && b.bufferData(b.ARRAY_BUFFER, this._vertices, b.DYNAMIC_DRAW);
		b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, b.FLOAT, !1, 0, 0);
		b.bindBuffer(b.ARRAY_BUFFER, this._texCoordinateBuffer);
		c && b.bufferData(b.ARRAY_BUFFER, this._texCoordinates, b.DYNAMIC_DRAW);
		b.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, b.FLOAT, !1, 0, 0);
		b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
		c && b.bufferData(b.ELEMENT_ARRAY_BUFFER, this._indices, b.STATIC_DRAW);
		b.drawElements(b.TRIANGLES, 6 * a, b.UNSIGNED_SHORT, 0);
		c && (this._dirty = !1);
		cc.incrementGLDraws(1)
	},
	reuse: function() {
		if (0 < this._reuseGrid) {
			for (var a = this._originalVertices, b = this._vertices, c = 0, d = this._vertices.length; c < d; c++) a[c] = b[c];
			--this._reuseGrid
		}
	},
	calculateVertexPoints: function() {
		var a = cc._renderContext,
			b = this._texture.pixelsWidth,
			c = this._texture.pixelsHeight,
			d = this._texture.getContentSizeInPixels().height,
			e = this._gridSize,
			f = (e.width + 1) * (e.height + 1);
		this._vertices = new Float32Array(3 * f);
		this._texCoordinates = new Float32Array(2 * f);
		this._indices = new Uint16Array(e.width * e.height * 6);
		this._verticesBuffer && a.deleteBuffer(this._verticesBuffer);
		this._verticesBuffer = a.createBuffer();
		this._texCoordinateBuffer && a.deleteBuffer(this._texCoordinateBuffer);
		this._texCoordinateBuffer = a.createBuffer();
		this._indicesBuffer && a.deleteBuffer(this._indicesBuffer);
		this._indicesBuffer = a.createBuffer();
		for (var g, h, k = this._indices, m = this._texCoordinates, n = this._isTextureFlipped, q = this._vertices, f = 0; f < e.width; ++f)
			for (g = 0; g < e.height; ++g) {
				var s = g * e.width + f;
				h = f * this._step.x;
				var r = h + this._step.x,
					t = g * this._step.y,
					u = t + this._step.y,
					y = f * (e.height + 1) + g,
					v = (f + 1) * (e.height + 1) + g,
					C = (f + 1) * (e.height + 1) + (g + 1),
					E = f * (e.height + 1) + (g + 1);
				k[6 * s] = y;
				k[6 * s + 1] = v;
				k[6 * s + 2] = E;
				k[6 * s + 3] = v;
				k[6 * s + 4] = C;
				k[6 * s + 5] = E;
				var s = [3 * y, 3 * v, 3 * C, 3 * E],
					A = [{
						x: h,
						y: t,
						z: 0
					}, {
						x: r,
						y: t,
						z: 0
					}, {
						x: r,
						y: u,
						z: 0
					}, {
						x: h,
						y: u,
						z: 0
					}],
					y = [2 * y, 2 * v, 2 * C, 2 * E],
					r = [cc.p(h, t), cc.p(r, t), cc.p(r, u), cc.p(h, u)];
				for (h = 0; 4 > h; ++h) q[s[h]] = A[h].x, q[s[h] + 1] = A[h].y, q[s[h] + 2] = A[h].z, m[y[h]] = r[h].x / b, m[y[h] + 1] = n ? (d - r[h].y) / c : r[h].y / c
			}
		this._originalVertices = new Float32Array(this._vertices);
		a.bindBuffer(a.ARRAY_BUFFER, this._verticesBuffer);
		a.bufferData(a.ARRAY_BUFFER, this._vertices, a.DYNAMIC_DRAW);
		a.bindBuffer(a.ARRAY_BUFFER, this._texCoordinateBuffer);
		a.bufferData(a.ARRAY_BUFFER, this._texCoordinates, a.DYNAMIC_DRAW);
		a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
		a.bufferData(a.ELEMENT_ARRAY_BUFFER, this._indices, a.STATIC_DRAW);
		this._dirty = !0
	}
});
cc.Grid3D.create = function(a, b, c) {
	return new cc.Grid3D(a, b, c)
};
cc.TiledGrid3D = cc.GridBase.extend({
	_texCoordinates: null,
	_vertices: null,
	_originalVertices: null,
	_indices: null,
	_texCoordinateBuffer: null,
	_verticesBuffer: null,
	_indicesBuffer: null,
	ctor: function(a, b, c) {
		cc.GridBase.prototype.ctor.call(this);
		this._indicesBuffer = this._verticesBuffer = this._texCoordinateBuffer = this._indices = this._originalVertices = this._vertices = this._texCoordinates = null;
		void 0 !== a && this.initWithSize(a, b, c)
	},
	tile: function(a) {
		a.x === (0 | a.x) && a.y === (0 | a.y) || cc.log("cc.TiledGrid3D.tile() : Numbers must be integers");
		a = 12 * (this._gridSize.height * a.x + a.y);
		var b = this._vertices;
		return new cc.Quad3(new cc.Vertex3F(b[a], b[a + 1], b[a + 2]), new cc.Vertex3F(b[a + 3], b[a + 4], b[a + 5]), new cc.Vertex3F(b[a + 6], b[a + 7], b[a + 8]), new cc.Vertex3F(b[a + 9], b[a + 10], b[a + 11]))
	},
	originalTile: function(a) {
		a.x === (0 | a.x) && a.y === (0 | a.y) || cc.log("cc.TiledGrid3D.originalTile() : Numbers must be integers");
		a = 12 * (this._gridSize.height * a.x + a.y);
		var b = this._originalVertices;
		return new cc.Quad3(new cc.Vertex3F(b[a], b[a + 1], b[a + 2]), new cc.Vertex3F(b[a + 3], b[a +
			4], b[a + 5]), new cc.Vertex3F(b[a + 6], b[a + 7], b[a + 8]), new cc.Vertex3F(b[a + 9], b[a + 10], b[a + 11]))
	},
	setTile: function(a, b) {
		a.x === (0 | a.x) && a.y === (0 | a.y) || cc.log("cc.TiledGrid3D.setTile() : Numbers must be integers");
		var c = 12 * (this._gridSize.height * a.x + a.y),
			d = this._vertices;
		d[c] = b.bl.x;
		d[c + 1] = b.bl.y;
		d[c + 2] = b.bl.z;
		d[c + 3] = b.br.x;
		d[c + 4] = b.br.y;
		d[c + 5] = b.br.z;
		d[c + 6] = b.tl.x;
		d[c + 7] = b.tl.y;
		d[c + 8] = b.tl.z;
		d[c + 9] = b.tr.x;
		d[c + 10] = b.tr.y;
		d[c + 11] = b.tr.z;
		this._dirty = !0
	},
	blit: function() {
		var a = this._gridSize.width * this._gridSize.height;
		this._shaderProgram.use();
		this._shaderProgram.setUniformsForBuiltins();
		var b = cc._renderContext,
			c = this._dirty;
		cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_TEX_COORDS);
		b.bindBuffer(b.ARRAY_BUFFER, this._verticesBuffer);
		c && b.bufferData(b.ARRAY_BUFFER, this._vertices, b.DYNAMIC_DRAW);
		b.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, b.FLOAT, !1, 0, this._vertices);
		b.bindBuffer(b.ARRAY_BUFFER, this._texCoordinateBuffer);
		c && b.bufferData(b.ARRAY_BUFFER, this._texCoordinates, b.DYNAMIC_DRAW);
		b.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, b.FLOAT, !1, 0, this._texCoordinates);
		b.bindBuffer(b.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
		c && b.bufferData(b.ELEMENT_ARRAY_BUFFER, this._indices, b.STATIC_DRAW);
		b.drawElements(b.TRIANGLES, 6 * a, b.UNSIGNED_SHORT, 0);
		c && (this._dirty = !1);
		cc.incrementGLDraws(1)
	},
	reuse: function() {
		if (0 < this._reuseGrid) {
			for (var a = this._vertices, b = this._originalVertices, c = 0; c < a.length; c++) b[c] = a[c];
			--this._reuseGrid
		}
	},
	calculateVertexPoints: function() {
		var a = this._texture.pixelsWidth,
			b = this._texture.pixelsHeight,
			c = this._texture.getContentSizeInPixels().height,
			d = this._gridSize,
			e = d.width * d.height;
		this._vertices = new Float32Array(12 * e);
		this._texCoordinates = new Float32Array(8 * e);
		this._indices = new Uint16Array(6 * e);
		var f = cc._renderContext;
		this._verticesBuffer && f.deleteBuffer(this._verticesBuffer);
		this._verticesBuffer = f.createBuffer();
		this._texCoordinateBuffer && f.deleteBuffer(this._texCoordinateBuffer);
		this._texCoordinateBuffer = f.createBuffer();
		this._indicesBuffer && f.deleteBuffer(this._indicesBuffer);
		this._indicesBuffer = f.createBuffer();
		var g, h, k = 0,
			m = this._step,
			n = this._vertices,
			q = this._texCoordinates,
			s = this._isTextureFlipped;
		for (g = 0; g < d.width; g++)
			for (h = 0; h < d.height; h++) {
				var r = g * m.x,
					t = r + m.x,
					u = h * m.y,
					y = u + m.y;
				n[12 * k] = r;
				n[12 * k + 1] = u;
				n[12 * k + 2] = 0;
				n[12 * k + 3] = t;
				n[12 * k + 4] = u;
				n[12 * k + 5] = 0;
				n[12 * k + 6] = r;
				n[12 * k + 7] = y;
				n[12 * k + 8] = 0;
				n[12 * k + 9] = t;
				n[12 * k + 10] = y;
				n[12 * k + 11] = 0;
				var v = u,
					C = y;
				s && (v = c - u, C = c - y);
				q[8 * k] = r / a;
				q[8 * k + 1] = v / b;
				q[8 * k + 2] = t / a;
				q[8 * k + 3] = v / b;
				q[8 * k + 4] = r / a;
				q[8 * k + 5] = C / b;
				q[8 * k + 6] = t / a;
				q[8 * k + 7] = C / b;
				k++
			}
		a = this._indices;
		for (g = 0; g < e; g++) a[6 * g + 0] = 4 * g + 0, a[6 * g + 1] = 4 * g + 1, a[6 * g + 2] = 4 * g + 2, a[6 * g + 3] = 4 * g + 1, a[6 * g + 4] = 4 * g + 2, a[6 * g + 5] = 4 * g + 3;
		this._originalVertices = new Float32Array(this._vertices);
		f.bindBuffer(f.ARRAY_BUFFER, this._verticesBuffer);
		f.bufferData(f.ARRAY_BUFFER, this._vertices, f.DYNAMIC_DRAW);
		f.bindBuffer(f.ARRAY_BUFFER, this._texCoordinateBuffer);
		f.bufferData(f.ARRAY_BUFFER, this._texCoordinates, f.DYNAMIC_DRAW);
		f.bindBuffer(f.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
		f.bufferData(f.ELEMENT_ARRAY_BUFFER, this._indices, f.DYNAMIC_DRAW);
		this._dirty = !0
	}
});
cc.TiledGrid3D.create = function(a, b, c) {
	return new cc.TiledGrid3D(a, b, c)
};
cc.Grabber = cc.Class.extend({
	_FBO: null,
	_oldFBO: null,
	_oldClearColor: null,
	_gl: null,
	ctor: function() {
		cc._checkWebGLRenderMode();
		this._gl = cc._renderContext;
		this._oldClearColor = [0, 0, 0, 0];
		this._oldFBO = null;
		this._FBO = this._gl.createFramebuffer()
	},
	grab: function(a) {
		var b = this._gl;
		this._oldFBO = b.getParameter(b.FRAMEBUFFER_BINDING);
		b.bindFramebuffer(b.FRAMEBUFFER, this._FBO);
		b.framebufferTexture2D(b.FRAMEBUFFER, b.COLOR_ATTACHMENT0, b.TEXTURE_2D, a._webTextureObj, 0);
		b.checkFramebufferStatus(b.FRAMEBUFFER) != b.FRAMEBUFFER_COMPLETE && cc.log("Frame Grabber: could not attach texture to frmaebuffer");
		b.bindFramebuffer(b.FRAMEBUFFER, this._oldFBO)
	},
	beforeRender: function(a) {
		a = this._gl;
		this._oldFBO = a.getParameter(a.FRAMEBUFFER_BINDING);
		a.bindFramebuffer(a.FRAMEBUFFER, this._FBO);
		this._oldClearColor = a.getParameter(a.COLOR_CLEAR_VALUE);
		a.clearColor(0, 0, 0, 0);
		a.clear(a.COLOR_BUFFER_BIT | a.DEPTH_BUFFER_BIT)
	},
	afterRender: function(a) {
		a = this._gl;
		a.bindFramebuffer(a.FRAMEBUFFER, this._oldFBO);
		a.colorMask(!0, !0, !0, !0)
	},
	destroy: function() {
		this._gl.deleteFramebuffer(this._FBO)
	}
});
cc.ACTION_TAG_INVALID = -1;
cc.Action = cc.Class.extend({
	originalTarget: null,
	target: null,
	tag: cc.ACTION_TAG_INVALID,
	ctor: function() {
		this.target = this.originalTarget = null;
		this.tag = cc.ACTION_TAG_INVALID
	},
	copy: function() {
		cc.log("copy is deprecated. Please use clone instead.");
		return this.clone()
	},
	clone: function() {
		var a = new cc.Action;
		a.originalTarget = null;
		a.target = null;
		a.tag = this.tag;
		return a
	},
	isDone: function() {
		return !0
	},
	startWithTarget: function(a) {
		this.target = this.originalTarget = a
	},
	stop: function() {
		this.target = null
	},
	step: function(a) {
		cc.log("[Action step]. override me")
	},
	update: function(a) {
		cc.log("[Action update]. override me")
	},
	getTarget: function() {
		return this.target
	},
	setTarget: function(a) {
		this.target = a
	},
	getOriginalTarget: function() {
		return this.originalTarget
	},
	setOriginalTarget: function(a) {
		this.originalTarget = a
	},
	getTag: function() {
		return this.tag
	},
	setTag: function(a) {
		this.tag = a
	},
	retain: function() {},
	release: function() {}
});
cc.action = function() {
	return new cc.Action
};
cc.Action.create = cc.action;
cc.FiniteTimeAction = cc.Action.extend({
	_duration: 0,
	ctor: function() {
		cc.Action.prototype.ctor.call(this);
		this._duration = 0
	},
	getDuration: function() {
		return this._duration * (this._times || 1)
	},
	setDuration: function(a) {
		this._duration = a
	},
	reverse: function() {
		cc.log("cocos2d: FiniteTimeAction#reverse: Implement me");
		return null
	},
	clone: function() {
		return new cc.FiniteTimeAction
	}
});
cc.Speed = cc.Action.extend({
	_speed: 0,
	_innerAction: null,
	ctor: function(a, b) {
		cc.Action.prototype.ctor.call(this);
		this._speed = 0;
		this._innerAction = null;
		a && this.initWithAction(a, b)
	},
	getSpeed: function() {
		return this._speed
	},
	setSpeed: function(a) {
		this._speed = a
	},
	initWithAction: function(a, b) {
		if (!a) throw "cc.Speed.initWithAction(): action must be non nil";
		this._innerAction = a;
		this._speed = b;
		return !0
	},
	clone: function() {
		var a = new cc.Speed;
		a.initWithAction(this._innerAction.clone(), this._speed);
		return a
	},
	startWithTarget: function(a) {
		cc.Action.prototype.startWithTarget.call(this, a);
		this._innerAction.startWithTarget(a)
	},
	stop: function() {
		this._innerAction.stop();
		cc.Action.prototype.stop.call(this)
	},
	step: function(a) {
		this._innerAction.step(a * this._speed)
	},
	isDone: function() {
		return this._innerAction.isDone()
	},
	reverse: function() {
		return new cc.Speed(this._innerAction.reverse(), this._speed)
	},
	setInnerAction: function(a) {
		this._innerAction != a && (this._innerAction = a)
	},
	getInnerAction: function() {
		return this._innerAction
	}
});
cc.speed = function(a, b) {
	return new cc.Speed(a, b)
};
cc.Speed.create = cc.speed;
cc.Follow = cc.Action.extend({
	_followedNode: null,
	_boundarySet: !1,
	_boundaryFullyCovered: !1,
	_halfScreenSize: null,
	_fullScreenSize: null,
	_worldRect: null,
	leftBoundary: 0,
	rightBoundary: 0,
	topBoundary: 0,
	bottomBoundary: 0,
	ctor: function(a, b) {
		cc.Action.prototype.ctor.call(this);
		this._followedNode = null;
		this._boundaryFullyCovered = this._boundarySet = !1;
		this._fullScreenSize = this._halfScreenSize = null;
		this.bottomBoundary = this.topBoundary = this.rightBoundary = this.leftBoundary = 0;
		this._worldRect = cc.rect(0, 0, 0, 0);
		a && (b ? this.initWithTarget(a, b) : this.initWithTarget(a))
	},
	clone: function() {
		var a = new cc.Follow,
			b = this._worldRect,
			b = new cc.Rect(b.x, b.y, b.width, b.height);
		a.initWithTarget(this._followedNode, b);
		return a
	},
	isBoundarySet: function() {
		return this._boundarySet
	},
	setBoudarySet: function(a) {
		this._boundarySet = a
	},
	initWithTarget: function(a, b) {
		if (!a) throw "cc.Follow.initWithAction(): followedNode must be non nil";
		b = b || cc.rect(0, 0, 0, 0);
		this._followedNode = a;
		this._worldRect = b;
		this._boundarySet = !cc._rectEqualToZero(b);
		this._boundaryFullyCovered = !1;
		var c = cc.director.getWinSize();
		this._fullScreenSize = cc.p(c.width, c.height);
		this._halfScreenSize = cc.pMult(this._fullScreenSize, 0.5);
		this._boundarySet && (this.leftBoundary = -(b.x + b.width - this._fullScreenSize.x), this.rightBoundary = -b.x, this.topBoundary = -b.y, this.bottomBoundary = -(b.y + b.height - this._fullScreenSize.y), this.rightBoundary < this.leftBoundary && (this.rightBoundary = this.leftBoundary = (this.leftBoundary + this.rightBoundary) / 2), this.topBoundary < this.bottomBoundary && (this.topBoundary = this.bottomBoundary = (this.topBoundary + this.bottomBoundary) / 2), this.topBoundary == this.bottomBoundary && this.leftBoundary == this.rightBoundary && (this._boundaryFullyCovered = !0));
		return !0
	},
	step: function(a) {
		a = this._followedNode.x;
		var b = this._followedNode.y;
		a = this._halfScreenSize.x - a;
		b = this._halfScreenSize.y - b;
		this._boundarySet ? this._boundaryFullyCovered || this.target.setPosition(cc.clampf(a, this.leftBoundary, this.rightBoundary), cc.clampf(b, this.bottomBoundary, this.topBoundary)) : this.target.setPosition(a, b)
	},
	isDone: function() {
		return !this._followedNode.running
	},
	stop: function() {
		this.target = null;
		cc.Action.prototype.stop.call(this)
	}
});
cc.follow = function(a, b) {
	return new cc.Follow(a, b)
};
cc.Follow.create = cc.follow;
cc.ActionInterval = cc.FiniteTimeAction.extend({
	_elapsed: 0,
	_firstTick: !1,
	_easeList: null,
	_times: 1,
	_repeatForever: !1,
	_repeatMethod: !1,
	_speed: 1,
	_speedMethod: !1,
	ctor: function(a) {
		this._times = this._speed = 1;
		this._repeatForever = !1;
		this.MAX_VALUE = 2;
		this._speedMethod = this._repeatMethod = !1;
		cc.FiniteTimeAction.prototype.ctor.call(this);
		void 0 !== a && this.initWithDuration(a)
	},
	getElapsed: function() {
		return this._elapsed
	},
	initWithDuration: function(a) {
		this._duration = 0 === a ? cc.FLT_EPSILON : a;
		this._elapsed = 0;
		return this._firstTick = !0
	},
	isDone: function() {
		return this._elapsed >= this._duration
	},
	_cloneDecoration: function(a) {
		a._repeatForever = this._repeatForever;
		a._speed = this._speed;
		a._times = this._times;
		a._easeList = this._easeList;
		a._speedMethod = this._speedMethod;
		a._repeatMethod = this._repeatMethod
	},
	_reverseEaseList: function(a) {
		if (this._easeList) {
			a._easeList = [];
			for (var b = 0; b < this._easeList.length; b++) a._easeList.push(this._easeList[b].reverse())
		}
	},
	clone: function() {
		var a = new cc.ActionInterval(this._duration);
		this._cloneDecoration(a);
		return a
	},
	easing: function(a) {
		this._easeList ? this._easeList.length = 0 : this._easeList = [];
		for (var b = 0; b < arguments.length; b++) this._easeList.push(arguments[b]);
		return this
	},
	_computeEaseTime: function(a) {
		var b = this._easeList;
		if (!b || 0 === b.length) return a;
		for (var c = 0, d = b.length; c < d; c++) a = b[c].easing(a);
		return a
	},
	step: function(a) {
		this._firstTick ? (this._firstTick = !1, this._elapsed = 0) : this._elapsed += a;
		a = this._elapsed / (1.192092896E-7 < this._duration ? this._duration : 1.192092896E-7);
		a = 1 > a ? a : 1;
		this.update(0 < a ? a : 0);
		this._repeatMethod && 1 < this._times && this.isDone() && (this._repeatForever || this._times--, this.startWithTarget(this.target), this.step(this._elapsed - this._duration))
	},
	startWithTarget: function(a) {
		cc.Action.prototype.startWithTarget.call(this, a);
		this._elapsed = 0;
		this._firstTick = !0
	},
	reverse: function() {
		cc.log("cc.IntervalAction: reverse not implemented.");
		return null
	},
	setAmplitudeRate: function(a) {
		cc.log("cc.ActionInterval.setAmplitudeRate(): it should be overridden in subclass.")
	},
	getAmplitudeRate: function() {
		cc.log("cc.ActionInterval.getAmplitudeRate(): it should be overridden in subclass.");
		return 0
	},
	speed: function(a) {
		if (0 >= a) return cc.log("The speed parameter error"), this;
		this._speedMethod = !0;
		this._speed *= a;
		return this
	},
	getSpeed: function() {
		return this._speed
	},
	setSpeed: function(a) {
		this._speed = a;
		return this
	},
	repeat: function(a) {
		a = Math.round(a);
		if (isNaN(a) || 1 > a) return cc.log("The repeat parameter error"), this;
		this._repeatMethod = !0;
		this._times *= a;
		return this
	},
	repeatForever: function() {
		this._repeatMethod = !0;
		this._times = this.MAX_VALUE;
		this._repeatForever = !0;
		return this
	}
});
cc.actionInterval = function(a) {
	return new cc.ActionInterval(a)
};
cc.ActionInterval.create = cc.actionInterval;
cc.Sequence = cc.ActionInterval.extend({
	_actions: null,
	_split: null,
	_last: 0,
	ctor: function(a) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._actions = [];
		var b = a instanceof Array ? a : arguments,
			c = b.length - 1;
		0 <= c && null == b[c] && cc.log("parameters should not be ending with null in Javascript");
		if (0 <= c) {
			for (var d = b[0], e = 1; e < c; e++) b[e] && (d = cc.Sequence._actionOneTwo(d, b[e]));
			this.initWithTwoActions(d, b[c])
		}
	},
	initWithTwoActions: function(a, b) {
		if (!a || !b) throw "cc.Sequence.initWithTwoActions(): arguments must all be non nil";
		this.initWithDuration(a._duration + b._duration);
		this._actions[0] = a;
		this._actions[1] = b;
		return !0
	},
	clone: function() {
		var a = new cc.Sequence;
		this._cloneDecoration(a);
		a.initWithTwoActions(this._actions[0].clone(), this._actions[1].clone());
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._split = this._actions[0]._duration / this._duration;
		this._last = -1
	},
	stop: function() {
		-1 !== this._last && this._actions[this._last].stop();
		cc.Action.prototype.stop.call(this)
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		var b = 0,
			c = this._split,
			d = this._actions,
			e = this._last;
		a < c ? (a = 0 !== c ? a / c : 1, 0 === b && 1 === e && (d[1].update(0), d[1].stop())) : (b = 1, a = 1 === c ? 1 : (a - c) / (1 - c), -1 === e && (d[0].startWithTarget(this.target), d[0].update(1), d[0].stop()), e || (d[0].update(1), d[0].stop()));
		e === b && d[b].isDone() || (e !== b && d[b].startWithTarget(this.target), d[b].update(a), this._last = b)
	},
	reverse: function() {
		var a = cc.Sequence._actionOneTwo(this._actions[1].reverse(), this._actions[0].reverse());
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	}
});
cc.sequence = function(a) {
	var b = a instanceof Array ? a : arguments;
	0 < b.length && null == b[b.length - 1] && cc.log("parameters should not be ending with null in Javascript");
	for (var c = b[0], d = 1; d < b.length; d++) b[d] && (c = cc.Sequence._actionOneTwo(c, b[d]));
	return c
};
cc.Sequence.create = cc.sequence;
cc.Sequence._actionOneTwo = function(a, b) {
	var c = new cc.Sequence;
	c.initWithTwoActions(a, b);
	return c
};
cc.Repeat = cc.ActionInterval.extend({
	_times: 0,
	_total: 0,
	_nextDt: 0,
	_actionInstant: !1,
	_innerAction: null,
	ctor: function(a, b) {
		cc.ActionInterval.prototype.ctor.call(this);
		void 0 !== b && this.initWithAction(a, b)
	},
	initWithAction: function(a, b) {
		return this.initWithDuration(a._duration * b) ? (this._times = b, this._innerAction = a, a instanceof cc.ActionInstant && (this._actionInstant = !0, this._times -= 1), this._total = 0, !0) : !1
	},
	clone: function() {
		var a = new cc.Repeat;
		this._cloneDecoration(a);
		a.initWithAction(this._innerAction.clone(), this._times);
		return a
	},
	startWithTarget: function(a) {
		this._total = 0;
		this._nextDt = this._innerAction._duration / this._duration;
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._innerAction.startWithTarget(a)
	},
	stop: function() {
		this._innerAction.stop();
		cc.Action.prototype.stop.call(this)
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		var b = this._innerAction,
			c = this._duration,
			d = this._times,
			e = this._nextDt;
		if (a >= e) {
			for (; a > e && this._total < d;) b.update(1), this._total++, b.stop(), b.startWithTarget(this.target), this._nextDt = e += b._duration / c;
			1 <= a && this._total < d && this._total++;
			this._actionInstant || (this._total === d ? (b.update(1), b.stop()) : b.update(a - (e - b._duration / c)))
		} else b.update(a * d % 1)
	},
	isDone: function() {
		return this._total == this._times
	},
	reverse: function() {
		var a = new cc.Repeat(this._innerAction.reverse(), this._times);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	},
	setInnerAction: function(a) {
		this._innerAction != a && (this._innerAction = a)
	},
	getInnerAction: function() {
		return this._innerAction
	}
});
cc.repeat = function(a, b) {
	return new cc.Repeat(a, b)
};
cc.Repeat.create = cc.repeat;
cc.RepeatForever = cc.ActionInterval.extend({
	_innerAction: null,
	ctor: function(a) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._innerAction = null;
		a && this.initWithAction(a)
	},
	initWithAction: function(a) {
		if (!a) throw "cc.RepeatForever.initWithAction(): action must be non null";
		this._innerAction = a;
		return !0
	},
	clone: function() {
		var a = new cc.RepeatForever;
		this._cloneDecoration(a);
		a.initWithAction(this._innerAction.clone());
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._innerAction.startWithTarget(a)
	},
	step: function(a) {
		var b = this._innerAction;
		b.step(a);
		b.isDone() && (b.startWithTarget(this.target), b.step(b.getElapsed() - b._duration))
	},
	isDone: function() {
		return !1
	},
	reverse: function() {
		var a = new cc.RepeatForever(this._innerAction.reverse());
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	},
	setInnerAction: function(a) {
		this._innerAction != a && (this._innerAction = a)
	},
	getInnerAction: function() {
		return this._innerAction
	}
});
cc.repeatForever = function(a) {
	return new cc.RepeatForever(a)
};
cc.RepeatForever.create = cc.repeatForever;
cc.Spawn = cc.ActionInterval.extend({
	_one: null,
	_two: null,
	ctor: function(a) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._two = this._one = null;
		var b = a instanceof Array ? a : arguments,
			c = b.length - 1;
		0 <= c && null == b[c] && cc.log("parameters should not be ending with null in Javascript");
		if (0 <= c) {
			for (var d = b[0], e = 1; e < c; e++) b[e] && (d = cc.Spawn._actionOneTwo(d, b[e]));
			this.initWithTwoActions(d, b[c])
		}
	},
	initWithTwoActions: function(a, b) {
		if (!a || !b) throw "cc.Spawn.initWithTwoActions(): arguments must all be non null";
		var c = !1,
			d = a._duration,
			e = b._duration;
		this.initWithDuration(Math.max(d, e)) && (this._one = a, this._two = b, d > e ? this._two = cc.Sequence._actionOneTwo(b, cc.delayTime(d - e)) : d < e && (this._one = cc.Sequence._actionOneTwo(a, cc.delayTime(e - d))), c = !0);
		return c
	},
	clone: function() {
		var a = new cc.Spawn;
		this._cloneDecoration(a);
		a.initWithTwoActions(this._one.clone(), this._two.clone());
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._one.startWithTarget(a);
		this._two.startWithTarget(a)
	},
	stop: function() {
		this._one.stop();
		this._two.stop();
		cc.Action.prototype.stop.call(this)
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		this._one && this._one.update(a);
		this._two && this._two.update(a)
	},
	reverse: function() {
		var a = cc.Spawn._actionOneTwo(this._one.reverse(), this._two.reverse());
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	}
});
cc.spawn = function(a) {
	var b = a instanceof Array ? a : arguments;
	0 < b.length && null == b[b.length - 1] && cc.log("parameters should not be ending with null in Javascript");
	for (var c = b[0], d = 1; d < b.length; d++) null != b[d] && (c = cc.Spawn._actionOneTwo(c, b[d]));
	return c
};
cc.Spawn.create = cc.spawn;
cc.Spawn._actionOneTwo = function(a, b) {
	var c = new cc.Spawn;
	c.initWithTwoActions(a, b);
	return c
};
cc.RotateTo = cc.ActionInterval.extend({
	_dstAngleX: 0,
	_startAngleX: 0,
	_diffAngleX: 0,
	_dstAngleY: 0,
	_startAngleY: 0,
	_diffAngleY: 0,
	ctor: function(a, b, c) {
		cc.ActionInterval.prototype.ctor.call(this);
		void 0 !== b && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._dstAngleX = b || 0, this._dstAngleY = c || this._dstAngleX, !0) : !1
	},
	clone: function() {
		var a = new cc.RotateTo;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._dstAngleX, this._dstAngleY);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		var b = a.rotationX % 360,
			c = this._dstAngleX - b;
		180 < c && (c -= 360); - 180 > c && (c += 360);
		this._startAngleX = b;
		this._diffAngleX = c;
		this._startAngleY = a.rotationY % 360;
		a = this._dstAngleY - this._startAngleY;
		180 < a && (a -= 360); - 180 > a && (a += 360);
		this._diffAngleY = a
	},
	reverse: function() {
		cc.log("cc.RotateTo.reverse(): it should be overridden in subclass.")
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		this.target && (this.target.rotationX = this._startAngleX + this._diffAngleX * a, this.target.rotationY = this._startAngleY + this._diffAngleY * a)
	}
});
cc.rotateTo = function(a, b, c) {
	return new cc.RotateTo(a, b, c)
};
cc.RotateTo.create = cc.rotateTo;
cc.RotateBy = cc.ActionInterval.extend({
	_angleX: 0,
	_startAngleX: 0,
	_angleY: 0,
	_startAngleY: 0,
	ctor: function(a, b, c) {
		cc.ActionInterval.prototype.ctor.call(this);
		void 0 !== b && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._angleX = b || 0, this._angleY = c || this._angleX, !0) : !1
	},
	clone: function() {
		var a = new cc.RotateBy;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._angleX, this._angleY);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._startAngleX = a.rotationX;
		this._startAngleY = a.rotationY
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		this.target && (this.target.rotationX = this._startAngleX + this._angleX * a, this.target.rotationY = this._startAngleY + this._angleY * a)
	},
	reverse: function() {
		var a = new cc.RotateBy(this._duration, -this._angleX, -this._angleY);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	}
});
cc.rotateBy = function(a, b, c) {
	return new cc.RotateBy(a, b, c)
};
cc.RotateBy.create = cc.rotateBy;
cc.MoveBy = cc.ActionInterval.extend({
	_positionDelta: null,
	_startPosition: null,
	_previousPosition: null,
	ctor: function(a, b, c) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._positionDelta = cc.p(0, 0);
		this._startPosition = cc.p(0, 0);
		this._previousPosition = cc.p(0, 0);
		void 0 !== b && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (void 0 !== b.x && (c = b.y, b = b.x), this._positionDelta.x = b, this._positionDelta.y = c, !0) : !1
	},
	clone: function() {
		var a = new cc.MoveBy;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._positionDelta);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		var b = a.getPositionX();
		a = a.getPositionY();
		this._previousPosition.x = b;
		this._previousPosition.y = a;
		this._startPosition.x = b;
		this._startPosition.y = a
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		if (this.target) {
			var b = this._positionDelta.x * a;
			a *= this._positionDelta.y;
			var c = this._startPosition;
			if (cc.ENABLE_STACKABLE_ACTIONS) {
				var d = this.target.getPositionX(),
					e = this.target.getPositionY(),
					f = this._previousPosition;
				c.x = c.x + d - f.x;
				c.y = c.y + e - f.y;
				b += c.x;
				a += c.y;
				f.x = b;
				f.y = a;
				this.target.setPosition(b, a)
			} else this.target.setPosition(c.x + b, c.y + a)
		}
	},
	reverse: function() {
		var a = new cc.MoveBy(this._duration, cc.p(-this._positionDelta.x, -this._positionDelta.y));
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	}
});
cc.moveBy = function(a, b, c) {
	return new cc.MoveBy(a, b, c)
};
cc.MoveBy.create = cc.moveBy;
cc.MoveTo = cc.MoveBy.extend({
	_endPosition: null,
	ctor: function(a, b, c) {
		cc.MoveBy.prototype.ctor.call(this);
		this._endPosition = cc.p(0, 0);
		void 0 !== b && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		return cc.MoveBy.prototype.initWithDuration.call(this, a, b, c) ? (void 0 !== b.x && (c = b.y, b = b.x), this._endPosition.x = b, this._endPosition.y = c, !0) : !1
	},
	clone: function() {
		var a = new cc.MoveTo;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._endPosition);
		return a
	},
	startWithTarget: function(a) {
		cc.MoveBy.prototype.startWithTarget.call(this, a);
		this._positionDelta.x = this._endPosition.x - a.getPositionX();
		this._positionDelta.y = this._endPosition.y - a.getPositionY()
	}
});
cc.moveTo = function(a, b, c) {
	return new cc.MoveTo(a, b, c)
};
cc.MoveTo.create = cc.moveTo;
cc.SkewTo = cc.ActionInterval.extend({
	_skewX: 0,
	_skewY: 0,
	_startSkewX: 0,
	_startSkewY: 0,
	_endSkewX: 0,
	_endSkewY: 0,
	_deltaX: 0,
	_deltaY: 0,
	ctor: function(a, b, c) {
		cc.ActionInterval.prototype.ctor.call(this);
		void 0 !== c && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		var d = !1;
		cc.ActionInterval.prototype.initWithDuration.call(this, a) && (this._endSkewX = b, this._endSkewY = c, d = !0);
		return d
	},
	clone: function() {
		var a = new cc.SkewTo;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._endSkewX, this._endSkewY);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._startSkewX = a.skewX % 180;
		this._deltaX = this._endSkewX - this._startSkewX;
		180 < this._deltaX && (this._deltaX -= 360); - 180 > this._deltaX && (this._deltaX += 360);
		this._startSkewY = a.skewY % 360;
		this._deltaY = this._endSkewY - this._startSkewY;
		180 < this._deltaY && (this._deltaY -= 360); - 180 > this._deltaY && (this._deltaY += 360)
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		this.target.skewX = this._startSkewX + this._deltaX * a;
		this.target.skewY = this._startSkewY + this._deltaY * a
	}
});
cc.skewTo = function(a, b, c) {
	return new cc.SkewTo(a, b, c)
};
cc.SkewTo.create = cc.skewTo;
cc.SkewBy = cc.SkewTo.extend({
	ctor: function(a, b, c) {
		cc.SkewTo.prototype.ctor.call(this);
		void 0 !== c && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		var d = !1;
		cc.SkewTo.prototype.initWithDuration.call(this, a, b, c) && (this._skewX = b, this._skewY = c, d = !0);
		return d
	},
	clone: function() {
		var a = new cc.SkewBy;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._skewX, this._skewY);
		return a
	},
	startWithTarget: function(a) {
		cc.SkewTo.prototype.startWithTarget.call(this, a);
		this._deltaX = this._skewX;
		this._deltaY = this._skewY;
		this._endSkewX = this._startSkewX + this._deltaX;
		this._endSkewY = this._startSkewY + this._deltaY
	},
	reverse: function() {
		var a = new cc.SkewBy(this._duration, -this._skewX, -this._skewY);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	}
});
cc.skewBy = function(a, b, c) {
	return new cc.SkewBy(a, b, c)
};
cc.SkewBy.create = cc.skewBy;
cc.JumpBy = cc.ActionInterval.extend({
	_startPosition: null,
	_delta: null,
	_height: 0,
	_jumps: 0,
	_previousPosition: null,
	ctor: function(a, b, c, d, e) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._startPosition = cc.p(0, 0);
		this._previousPosition = cc.p(0, 0);
		this._delta = cc.p(0, 0);
		void 0 !== d && this.initWithDuration(a, b, c, d, e)
	},
	initWithDuration: function(a, b, c, d, e) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (void 0 === e && (e = d, d = c, c = b.y, b = b.x), this._delta.x = b, this._delta.y = c, this._height = d, this._jumps = e, !0) : !1
	},
	clone: function() {
		var a = new cc.JumpBy;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._delta, this._height, this._jumps);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		var b = a.getPositionX();
		a = a.getPositionY();
		this._previousPosition.x = b;
		this._previousPosition.y = a;
		this._startPosition.x = b;
		this._startPosition.y = a
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		if (this.target) {
			var b = a * this._jumps % 1,
				b = 4 * this._height * b * (1 - b),
				b = b + this._delta.y * a;
			a *= this._delta.x;
			var c = this._startPosition;
			if (cc.ENABLE_STACKABLE_ACTIONS) {
				var d = this.target.getPositionX(),
					e = this.target.getPositionY(),
					f = this._previousPosition;
				c.x = c.x + d - f.x;
				c.y = c.y + e - f.y;
				a += c.x;
				b += c.y;
				f.x = a;
				f.y = b;
				this.target.setPosition(a, b)
			} else this.target.setPosition(c.x + a, c.y + b)
		}
	},
	reverse: function() {
		var a = new cc.JumpBy(this._duration, cc.p(-this._delta.x, -this._delta.y), this._height, this._jumps);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	}
});
cc.jumpBy = function(a, b, c, d, e) {
	return new cc.JumpBy(a, b, c, d, e)
};
cc.JumpBy.create = cc.jumpBy;
cc.JumpTo = cc.JumpBy.extend({
	_endPosition: null,
	ctor: function(a, b, c, d, e) {
		cc.JumpBy.prototype.ctor.call(this);
		this._endPosition = cc.p(0, 0);
		void 0 !== d && this.initWithDuration(a, b, c, d, e)
	},
	initWithDuration: function(a, b, c, d, e) {
		return cc.JumpBy.prototype.initWithDuration.call(this, a, b, c, d, e) ? (void 0 === e && (c = b.y, b = b.x), this._endPosition.x = b, this._endPosition.y = c, !0) : !1
	},
	startWithTarget: function(a) {
		cc.JumpBy.prototype.startWithTarget.call(this, a);
		this._delta.x = this._endPosition.x - this._startPosition.x;
		this._delta.y = this._endPosition.y - this._startPosition.y
	},
	clone: function() {
		var a = new cc.JumpTo;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._endPosition, this._height, this._jumps);
		return a
	}
});
cc.jumpTo = function(a, b, c, d, e) {
	return new cc.JumpTo(a, b, c, d, e)
};
cc.JumpTo.create = cc.jumpTo;
cc.bezierAt = function(a, b, c, d, e) {
	return Math.pow(1 - e, 3) * a + 3 * e * Math.pow(1 - e, 2) * b + 3 * Math.pow(e, 2) * (1 - e) * c + Math.pow(e, 3) * d
};
cc.BezierBy = cc.ActionInterval.extend({
	_config: null,
	_startPosition: null,
	_previousPosition: null,
	ctor: function(a, b) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._config = [];
		this._startPosition = cc.p(0, 0);
		this._previousPosition = cc.p(0, 0);
		b && this.initWithDuration(a, b)
	},
	initWithDuration: function(a, b) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._config = b, !0) : !1
	},
	clone: function() {
		var a = new cc.BezierBy;
		this._cloneDecoration(a);
		for (var b = [], c = 0; c < this._config.length; c++) {
			var d = this._config[c];
			b.push(cc.p(d.x, d.y))
		}
		a.initWithDuration(this._duration, b);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		var b = a.getPositionX();
		a = a.getPositionY();
		this._previousPosition.x = b;
		this._previousPosition.y = a;
		this._startPosition.x = b;
		this._startPosition.y = a
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		if (this.target) {
			var b = this._config,
				c = b[0].y,
				d = b[1].y,
				e = b[2].y,
				b = cc.bezierAt(0, b[0].x, b[1].x, b[2].x, a);
			a = cc.bezierAt(0, c, d, e, a);
			c = this._startPosition;
			if (cc.ENABLE_STACKABLE_ACTIONS) {
				var d = this.target.getPositionX(),
					e = this.target.getPositionY(),
					f = this._previousPosition;
				c.x = c.x + d - f.x;
				c.y = c.y + e - f.y;
				b += c.x;
				a += c.y;
				f.x = b;
				f.y = a;
				this.target.setPosition(b, a)
			} else this.target.setPosition(c.x + b, c.y + a)
		}
	},
	reverse: function() {
		var a = this._config,
			a = [cc.pAdd(a[1], cc.pNeg(a[2])), cc.pAdd(a[0], cc.pNeg(a[2])), cc.pNeg(a[2])],
			a = new cc.BezierBy(this._duration, a);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	}
});
cc.bezierBy = function(a, b) {
	return new cc.BezierBy(a, b)
};
cc.BezierBy.create = cc.bezierBy;
cc.BezierTo = cc.BezierBy.extend({
	_toConfig: null,
	ctor: function(a, b) {
		cc.BezierBy.prototype.ctor.call(this);
		this._toConfig = [];
		b && this.initWithDuration(a, b)
	},
	initWithDuration: function(a, b) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._toConfig = b, !0) : !1
	},
	clone: function() {
		var a = new cc.BezierTo;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._toConfig);
		return a
	},
	startWithTarget: function(a) {
		cc.BezierBy.prototype.startWithTarget.call(this, a);
		a = this._startPosition;
		var b = this._toConfig,
			c = this._config;
		c[0] = cc.pSub(b[0], a);
		c[1] = cc.pSub(b[1], a);
		c[2] = cc.pSub(b[2], a)
	}
});
cc.bezierTo = function(a, b) {
	return new cc.BezierTo(a, b)
};
cc.BezierTo.create = cc.bezierTo;
cc.ScaleTo = cc.ActionInterval.extend({
	_scaleX: 1,
	_scaleY: 1,
	_startScaleX: 1,
	_startScaleY: 1,
	_endScaleX: 0,
	_endScaleY: 0,
	_deltaX: 0,
	_deltaY: 0,
	ctor: function(a, b, c) {
		cc.ActionInterval.prototype.ctor.call(this);
		void 0 !== b && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._endScaleX = b, this._endScaleY = null != c ? c : b, !0) : !1
	},
	clone: function() {
		var a = new cc.ScaleTo;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._endScaleX, this._endScaleY);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._startScaleX = a.scaleX;
		this._startScaleY = a.scaleY;
		this._deltaX = this._endScaleX - this._startScaleX;
		this._deltaY = this._endScaleY - this._startScaleY
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		this.target && (this.target.scaleX = this._startScaleX + this._deltaX * a, this.target.scaleY = this._startScaleY + this._deltaY * a)
	}
});
cc.scaleTo = function(a, b, c) {
	return new cc.ScaleTo(a, b, c)
};
cc.ScaleTo.create = cc.scaleTo;
cc.ScaleBy = cc.ScaleTo.extend({
	startWithTarget: function(a) {
		cc.ScaleTo.prototype.startWithTarget.call(this, a);
		this._deltaX = this._startScaleX * this._endScaleX - this._startScaleX;
		this._deltaY = this._startScaleY * this._endScaleY - this._startScaleY
	},
	reverse: function() {
		var a = new cc.ScaleBy(this._duration, 1 / this._endScaleX, 1 / this._endScaleY);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	},
	clone: function() {
		var a = new cc.ScaleBy;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._endScaleX, this._endScaleY);
		return a
	}
});
cc.scaleBy = function(a, b, c) {
	return new cc.ScaleBy(a, b, c)
};
cc.ScaleBy.create = cc.scaleBy;
cc.Blink = cc.ActionInterval.extend({
	_times: 0,
	_originalState: !1,
	ctor: function(a, b) {
		cc.ActionInterval.prototype.ctor.call(this);
		void 0 !== b && this.initWithDuration(a, b)
	},
	initWithDuration: function(a, b) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._times = b, !0) : !1
	},
	clone: function() {
		var a = new cc.Blink;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._times);
		return a
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		if (this.target && !this.isDone()) {
			var b = 1 / this._times;
			this.target.visible = a % b > b / 2
		}
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._originalState = a.visible
	},
	stop: function() {
		this.target.visible = this._originalState;
		cc.ActionInterval.prototype.stop.call(this)
	},
	reverse: function() {
		var a = new cc.Blink(this._duration, this._times);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	}
});
cc.blink = function(a, b) {
	return new cc.Blink(a, b)
};
cc.Blink.create = cc.blink;
cc.FadeTo = cc.ActionInterval.extend({
	_toOpacity: 0,
	_fromOpacity: 0,
	ctor: function(a, b) {
		cc.ActionInterval.prototype.ctor.call(this);
		void 0 !== b && this.initWithDuration(a, b)
	},
	initWithDuration: function(a, b) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._toOpacity = b, !0) : !1
	},
	clone: function() {
		var a = new cc.FadeTo;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._toOpacity);
		return a
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		var b = void 0 !== this._fromOpacity ? this._fromOpacity : 255;
		this.target.opacity = b + (this._toOpacity - b) * a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._fromOpacity = a.opacity
	}
});
cc.fadeTo = function(a, b) {
	return new cc.FadeTo(a, b)
};
cc.FadeTo.create = cc.fadeTo;
cc.FadeIn = cc.FadeTo.extend({
	_reverseAction: null,
	ctor: function(a) {
		cc.FadeTo.prototype.ctor.call(this);
		a && this.initWithDuration(a, 255)
	},
	reverse: function() {
		var a = new cc.FadeOut;
		a.initWithDuration(this._duration, 0);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	},
	clone: function() {
		var a = new cc.FadeIn;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._toOpacity);
		return a
	},
	startWithTarget: function(a) {
		this._reverseAction && (this._toOpacity = this._reverseAction._fromOpacity);
		cc.FadeTo.prototype.startWithTarget.call(this, a)
	}
});
cc.fadeIn = function(a) {
	return new cc.FadeIn(a)
};
cc.FadeIn.create = cc.fadeIn;
cc.FadeOut = cc.FadeTo.extend({
	ctor: function(a) {
		cc.FadeTo.prototype.ctor.call(this);
		a && this.initWithDuration(a, 0)
	},
	reverse: function() {
		var a = new cc.FadeIn;
		a._reverseAction = this;
		a.initWithDuration(this._duration, 255);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	},
	clone: function() {
		var a = new cc.FadeOut;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._toOpacity);
		return a
	}
});
cc.fadeOut = function(a) {
	return new cc.FadeOut(a)
};
cc.FadeOut.create = cc.fadeOut;
cc.TintTo = cc.ActionInterval.extend({
	_to: null,
	_from: null,
	ctor: function(a, b, c, d) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._to = cc.color(0, 0, 0);
		this._from = cc.color(0, 0, 0);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	initWithDuration: function(a, b, c, d) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._to = cc.color(b, c, d), !0) : !1
	},
	clone: function() {
		var a = new cc.TintTo;
		this._cloneDecoration(a);
		var b = this._to;
		a.initWithDuration(this._duration, b.r, b.g, b.b);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._from = this.target.color
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		var b = this._from,
			c = this._to;
		b && (this.target.color = cc.color(b.r + (c.r - b.r) * a, b.g + (c.g - b.g) * a, b.b + (c.b - b.b) * a))
	}
});
cc.tintTo = function(a, b, c, d) {
	return new cc.TintTo(a, b, c, d)
};
cc.TintTo.create = cc.tintTo;
cc.TintBy = cc.ActionInterval.extend({
	_deltaR: 0,
	_deltaG: 0,
	_deltaB: 0,
	_fromR: 0,
	_fromG: 0,
	_fromB: 0,
	ctor: function(a, b, c, d) {
		cc.ActionInterval.prototype.ctor.call(this);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	initWithDuration: function(a, b, c, d) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._deltaR = b, this._deltaG = c, this._deltaB = d, !0) : !1
	},
	clone: function() {
		var a = new cc.TintBy;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration, this._deltaR, this._deltaG, this._deltaB);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		a = a.color;
		this._fromR = a.r;
		this._fromG = a.g;
		this._fromB = a.b
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		this.target.color = cc.color(this._fromR + this._deltaR * a, this._fromG + this._deltaG * a, this._fromB + this._deltaB * a)
	},
	reverse: function() {
		var a = new cc.TintBy(this._duration, -this._deltaR, -this._deltaG, -this._deltaB);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	}
});
cc.tintBy = function(a, b, c, d) {
	return new cc.TintBy(a, b, c, d)
};
cc.TintBy.create = cc.tintBy;
cc.DelayTime = cc.ActionInterval.extend({
	update: function(a) {},
	reverse: function() {
		var a = new cc.DelayTime(this._duration);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	},
	clone: function() {
		var a = new cc.DelayTime;
		this._cloneDecoration(a);
		a.initWithDuration(this._duration);
		return a
	}
});
cc.delayTime = function(a) {
	return new cc.DelayTime(a)
};
cc.DelayTime.create = cc.delayTime;
cc.ReverseTime = cc.ActionInterval.extend({
	_other: null,
	ctor: function(a) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._other = null;
		a && this.initWithAction(a)
	},
	initWithAction: function(a) {
		if (!a) throw "cc.ReverseTime.initWithAction(): action must be non null";
		if (a == this._other) throw "cc.ReverseTime.initWithAction(): the action was already passed in.";
		return cc.ActionInterval.prototype.initWithDuration.call(this, a._duration) ? (this._other = a, !0) : !1
	},
	clone: function() {
		var a = new cc.ReverseTime;
		this._cloneDecoration(a);
		a.initWithAction(this._other.clone());
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._other.startWithTarget(a)
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		this._other && this._other.update(1 - a)
	},
	reverse: function() {
		return this._other.clone()
	},
	stop: function() {
		this._other.stop();
		cc.Action.prototype.stop.call(this)
	}
});
cc.reverseTime = function(a) {
	return new cc.ReverseTime(a)
};
cc.ReverseTime.create = cc.reverseTime;
cc.Animate = cc.ActionInterval.extend({
	_animation: null,
	_nextFrame: 0,
	_origFrame: null,
	_executedLoops: 0,
	_splitTimes: null,
	ctor: function(a) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._splitTimes = [];
		a && this.initWithAnimation(a)
	},
	getAnimation: function() {
		return this._animation
	},
	setAnimation: function(a) {
		this._animation = a
	},
	initWithAnimation: function(a) {
		if (!a) throw "cc.Animate.initWithAnimation(): animation must be non-NULL";
		var b = a.getDuration();
		if (this.initWithDuration(b * a.getLoops())) {
			this._nextFrame = 0;
			this.setAnimation(a);
			this._origFrame = null;
			this._executedLoops = 0;
			var c = this._splitTimes,
				d = c.length = 0,
				e = b / a.getTotalDelayUnits();
			a = a.getFrames();
			cc.arrayVerifyType(a, cc.AnimationFrame);
			for (var f = 0; f < a.length; f++) {
				var g = d * e / b,
					d = d + a[f].getDelayUnits();
				c.push(g)
			}
			return !0
		}
		return !1
	},
	clone: function() {
		var a = new cc.Animate;
		this._cloneDecoration(a);
		a.initWithAnimation(this._animation.clone());
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._animation.getRestoreOriginalFrame() && (this._origFrame = a.displayFrame());
		this._executedLoops = this._nextFrame = 0
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		1 > a && (a *= this._animation.getLoops(), (0 | a) > this._executedLoops && (this._nextFrame = 0, this._executedLoops++), a %= 1);
		for (var b = this._animation.getFrames(), c = b.length, d = this._splitTimes, e = this._nextFrame; e < c; e++)
			if (d[e] <= a) this.target.setSpriteFrame(b[e].getSpriteFrame()), this._nextFrame = e + 1;
			else break
	},
	reverse: function() {
		var a = this._animation,
			b = a.getFrames(),
			c = [];
		cc.arrayVerifyType(b, cc.AnimationFrame);
		if (0 < b.length)
			for (var d = b.length - 1; 0 <= d; d--) {
				var e = b[d];
				if (!e) break;
				c.push(e.clone())
			}
		b = new cc.Animation(c, a.getDelayPerUnit(), a.getLoops());
		b.setRestoreOriginalFrame(a.getRestoreOriginalFrame());
		a = new cc.Animate(b);
		this._cloneDecoration(a);
		this._reverseEaseList(a);
		return a
	},
	stop: function() {
		this._animation.getRestoreOriginalFrame() && this.target && this.target.setSpriteFrame(this._origFrame);
		cc.Action.prototype.stop.call(this)
	}
});
cc.animate = function(a) {
	return new cc.Animate(a)
};
cc.Animate.create = cc.animate;
cc.TargetedAction = cc.ActionInterval.extend({
	_action: null,
	_forcedTarget: null,
	ctor: function(a, b) {
		cc.ActionInterval.prototype.ctor.call(this);
		b && this.initWithTarget(a, b)
	},
	initWithTarget: function(a, b) {
		return this.initWithDuration(b._duration) ? (this._forcedTarget = a, this._action = b, !0) : !1
	},
	clone: function() {
		var a = new cc.TargetedAction;
		this._cloneDecoration(a);
		a.initWithTarget(this._forcedTarget, this._action.clone());
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._action.startWithTarget(this._forcedTarget)
	},
	stop: function() {
		this._action.stop()
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		this._action.update(a)
	},
	getForcedTarget: function() {
		return this._forcedTarget
	},
	setForcedTarget: function(a) {
		this._forcedTarget != a && (this._forcedTarget = a)
	}
});
cc.targetedAction = function(a, b) {
	return new cc.TargetedAction(a, b)
};
cc.TargetedAction.create = cc.targetedAction;
cc.ActionInstant = cc.FiniteTimeAction.extend({
	isDone: function() {
		return !0
	},
	step: function(a) {
		this.update(1)
	},
	update: function(a) {},
	reverse: function() {
		return this.clone()
	},
	clone: function() {
		return new cc.ActionInstant
	}
});
cc.Show = cc.ActionInstant.extend({
	update: function(a) {
		this.target.visible = !0
	},
	reverse: function() {
		return new cc.Hide
	},
	clone: function() {
		return new cc.Show
	}
});
cc.show = function() {
	return new cc.Show
};
cc.Show.create = cc.show;
cc.Hide = cc.ActionInstant.extend({
	update: function(a) {
		this.target.visible = !1
	},
	reverse: function() {
		return new cc.Show
	},
	clone: function() {
		return new cc.Hide
	}
});
cc.hide = function() {
	return new cc.Hide
};
cc.Hide.create = cc.hide;
cc.ToggleVisibility = cc.ActionInstant.extend({
	update: function(a) {
		this.target.visible = !this.target.visible
	},
	reverse: function() {
		return new cc.ToggleVisibility
	},
	clone: function() {
		return new cc.ToggleVisibility
	}
});
cc.toggleVisibility = function() {
	return new cc.ToggleVisibility
};
cc.ToggleVisibility.create = cc.toggleVisibility;
cc.RemoveSelf = cc.ActionInstant.extend({
	_isNeedCleanUp: !0,
	ctor: function(a) {
		cc.FiniteTimeAction.prototype.ctor.call(this);
		void 0 !== a && this.init(a)
	},
	update: function(a) {
		this.target.removeFromParent(this._isNeedCleanUp)
	},
	init: function(a) {
		this._isNeedCleanUp = a;
		return !0
	},
	reverse: function() {
		return new cc.RemoveSelf(this._isNeedCleanUp)
	},
	clone: function() {
		return new cc.RemoveSelf(this._isNeedCleanUp)
	}
});
cc.removeSelf = function(a) {
	return new cc.RemoveSelf(a)
};
cc.RemoveSelf.create = cc.removeSelf;
cc.FlipX = cc.ActionInstant.extend({
	_flippedX: !1,
	ctor: function(a) {
		cc.FiniteTimeAction.prototype.ctor.call(this);
		this._flippedX = !1;
		void 0 !== a && this.initWithFlipX(a)
	},
	initWithFlipX: function(a) {
		this._flippedX = a;
		return !0
	},
	update: function(a) {
		this.target.flippedX = this._flippedX
	},
	reverse: function() {
		return new cc.FlipX(!this._flippedX)
	},
	clone: function() {
		var a = new cc.FlipX;
		a.initWithFlipX(this._flippedX);
		return a
	}
});
cc.flipX = function(a) {
	return new cc.FlipX(a)
};
cc.FlipX.create = cc.flipX;
cc.FlipY = cc.ActionInstant.extend({
	_flippedY: !1,
	ctor: function(a) {
		cc.FiniteTimeAction.prototype.ctor.call(this);
		this._flippedY = !1;
		void 0 !== a && this.initWithFlipY(a)
	},
	initWithFlipY: function(a) {
		this._flippedY = a;
		return !0
	},
	update: function(a) {
		this.target.flippedY = this._flippedY
	},
	reverse: function() {
		return new cc.FlipY(!this._flippedY)
	},
	clone: function() {
		var a = new cc.FlipY;
		a.initWithFlipY(this._flippedY);
		return a
	}
});
cc.flipY = function(a) {
	return new cc.FlipY(a)
};
cc.FlipY.create = cc.flipY;
cc.Place = cc.ActionInstant.extend({
	_x: 0,
	_y: 0,
	ctor: function(a, b) {
		cc.FiniteTimeAction.prototype.ctor.call(this);
		this._y = this._x = 0;
		void 0 !== a && (void 0 !== a.x && (b = a.y, a = a.x), this.initWithPosition(a, b))
	},
	initWithPosition: function(a, b) {
		this._x = a;
		this._y = b;
		return !0
	},
	update: function(a) {
		this.target.setPosition(this._x, this._y)
	},
	clone: function() {
		var a = new cc.Place;
		a.initWithPosition(this._x, this._y);
		return a
	}
});
cc.place = function(a, b) {
	return new cc.Place(a, b)
};
cc.Place.create = cc.place;
cc.CallFunc = cc.ActionInstant.extend({
	_selectorTarget: null,
	_callFunc: null,
	_function: null,
	_data: null,
	ctor: function(a, b, c) {
		cc.FiniteTimeAction.prototype.ctor.call(this);
		void 0 !== a && (void 0 === b ? this.initWithFunction(a) : this.initWithFunction(a, b, c))
	},
	initWithFunction: function(a, b, c) {
		b ? (this._data = c, this._callFunc = a, this._selectorTarget = b) : a && (this._function = a);
		return !0
	},
	execute: function() {
		null != this._callFunc ? this._callFunc.call(this._selectorTarget, this.target, this._data) : this._function && this._function.call(null, this.target)
	},
	update: function(a) {
		this.execute()
	},
	getTargetCallback: function() {
		return this._selectorTarget
	},
	setTargetCallback: function(a) {
		a != this._selectorTarget && (this._selectorTarget && (this._selectorTarget = null), this._selectorTarget = a)
	},
	clone: function() {
		var a = new cc.CallFunc;
		this._selectorTarget ? a.initWithFunction(this._callFunc, this._selectorTarget, this._data) : this._function && a.initWithFunction(this._function);
		return a
	}
});
cc.callFunc = function(a, b, c) {
	return new cc.CallFunc(a, b, c)
};
cc.CallFunc.create = cc.callFunc;
cc.ActionCamera = cc.ActionInterval.extend({
	_centerXOrig: 0,
	_centerYOrig: 0,
	_centerZOrig: 0,
	_eyeXOrig: 0,
	_eyeYOrig: 0,
	_eyeZOrig: 0,
	_upXOrig: 0,
	_upYOrig: 0,
	_upZOrig: 0,
	ctor: function() {
		cc.ActionInterval.prototype.ctor.call(this);
		this._upZOrig = this._upYOrig = this._upXOrig = this._eyeZOrig = this._eyeYOrig = this._eyeXOrig = this._centerZOrig = this._centerYOrig = this._centerXOrig = 0
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		a = a.getCamera();
		var b = a.getCenter();
		this._centerXOrig = b.x;
		this._centerYOrig = b.y;
		this._centerZOrig = b.z;
		b = a.getEye();
		this._eyeXOrig = b.x;
		this._eyeYOrig = b.y;
		this._eyeZOrig = b.z;
		a = a.getUp();
		this._upXOrig = a.x;
		this._upYOrig = a.y;
		this._upZOrig = a.z
	},
	clone: function() {
		return new cc.ActionCamera
	},
	reverse: function() {
		return new cc.ReverseTime(this)
	}
});
cc.OrbitCamera = cc.ActionCamera.extend({
	_radius: 0,
	_deltaRadius: 0,
	_angleZ: 0,
	_deltaAngleZ: 0,
	_angleX: 0,
	_deltaAngleX: 0,
	_radZ: 0,
	_radDeltaZ: 0,
	_radX: 0,
	_radDeltaX: 0,
	ctor: function(a, b, c, d, e, f, g) {
		cc.ActionCamera.prototype.ctor.call(this);
		void 0 !== g && this.initWithDuration(a, b, c, d, e, f, g)
	},
	initWithDuration: function(a, b, c, d, e, f, g) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._radius = b, this._deltaRadius = c, this._angleZ = d, this._deltaAngleZ = e, this._angleX = f, this._deltaAngleX = g, this._radDeltaZ = cc.degreesToRadians(e), this._radDeltaX = cc.degreesToRadians(g), !0) : !1
	},
	sphericalRadius: function() {
		var a, b;
		b = this.target.getCamera();
		var c = b.getEye();
		a = b.getCenter();
		b = c.x - a.x;
		var d = c.y - a.y;
		a = c.z - a.z;
		var c = Math.sqrt(Math.pow(b, 2) + Math.pow(d, 2) + Math.pow(a, 2)),
			e = Math.sqrt(Math.pow(b, 2) + Math.pow(d, 2));
		0 === e && (e = cc.FLT_EPSILON);
		0 === c && (c = cc.FLT_EPSILON);
		a = Math.acos(a / c);
		b = 0 > b ? Math.PI - Math.asin(d / e) : Math.asin(d / e);
		return {
			newRadius: c / cc.Camera.getZEye(),
			zenith: a,
			azimuth: b
		}
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		a = this.sphericalRadius();
		isNaN(this._radius) && (this._radius = a.newRadius);
		isNaN(this._angleZ) && (this._angleZ = cc.radiansToDegrees(a.zenith));
		isNaN(this._angleX) && (this._angleX = cc.radiansToDegrees(a.azimuth));
		this._radZ = cc.degreesToRadians(this._angleZ);
		this._radX = cc.degreesToRadians(this._angleX)
	},
	clone: function() {
		var a = new cc.OrbitCamera;
		a.initWithDuration(this._duration, this._radius, this._deltaRadius, this._angleZ, this._deltaAngleZ, this._angleX, this._deltaAngleX);
		return a
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		var b = (this._radius + this._deltaRadius * a) * cc.Camera.getZEye(),
			c = this._radZ + this._radDeltaZ * a,
			d = this._radX + this._radDeltaX * a;
		a = Math.sin(c) * Math.cos(d) * b + this._centerXOrig;
		d = Math.sin(c) * Math.sin(d) * b + this._centerYOrig;
		b = Math.cos(c) * b + this._centerZOrig;
		this.target.getCamera().setEye(a, d, b)
	}
});
cc.orbitCamera = function(a, b, c, d, e, f, g) {
	return new cc.OrbitCamera(a, b, c, d, e, f, g)
};
cc.OrbitCamera.create = cc.orbitCamera;
cc.ActionEase = cc.ActionInterval.extend({
	_inner: null,
	ctor: function(a) {
		cc.ActionInterval.prototype.ctor.call(this);
		a && this.initWithAction(a)
	},
	initWithAction: function(a) {
		if (!a) throw "cc.ActionEase.initWithAction(): action must be non nil";
		return this.initWithDuration(a.getDuration()) ? (this._inner = a, !0) : !1
	},
	clone: function() {
		var a = new cc.ActionEase;
		a.initWithAction(this._inner.clone());
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._inner.startWithTarget(this.target)
	},
	stop: function() {
		this._inner.stop();
		cc.ActionInterval.prototype.stop.call(this)
	},
	update: function(a) {
		this._inner.update(a)
	},
	reverse: function() {
		return new cc.ActionEase(this._inner.reverse())
	},
	getInnerAction: function() {
		return this._inner
	}
});
cc.actionEase = function(a) {
	return new cc.ActionEase(a)
};
cc.ActionEase.create = cc.actionEase;
cc.EaseRateAction = cc.ActionEase.extend({
	_rate: 0,
	ctor: function(a, b) {
		cc.ActionEase.prototype.ctor.call(this);
		void 0 !== b && this.initWithAction(a, b)
	},
	setRate: function(a) {
		this._rate = a
	},
	getRate: function() {
		return this._rate
	},
	initWithAction: function(a, b) {
		return cc.ActionEase.prototype.initWithAction.call(this, a) ? (this._rate = b, !0) : !1
	},
	clone: function() {
		var a = new cc.EaseRateAction;
		a.initWithAction(this._inner.clone(), this._rate);
		return a
	},
	reverse: function() {
		return new cc.EaseRateAction(this._inner.reverse(), 1 / this._rate)
	}
});
cc.easeRateAction = function(a, b) {
	return new cc.EaseRateAction(a, b)
};
cc.EaseRateAction.create = cc.easeRateAction;
cc.EaseIn = cc.EaseRateAction.extend({
	update: function(a) {
		this._inner.update(Math.pow(a, this._rate))
	},
	reverse: function() {
		return new cc.EaseIn(this._inner.reverse(), 1 / this._rate)
	},
	clone: function() {
		var a = new cc.EaseIn;
		a.initWithAction(this._inner.clone(), this._rate);
		return a
	}
});
cc.EaseIn.create = function(a, b) {
	return new cc.EaseIn(a, b)
};
cc.easeIn = function(a) {
	return {
		_rate: a,
		easing: function(a) {
			return Math.pow(a, this._rate)
		},
		reverse: function() {
			return cc.easeIn(1 / this._rate)
		}
	}
};
cc.EaseOut = cc.EaseRateAction.extend({
	update: function(a) {
		this._inner.update(Math.pow(a, 1 / this._rate))
	},
	reverse: function() {
		return new cc.EaseOut(this._inner.reverse(), 1 / this._rate)
	},
	clone: function() {
		var a = new cc.EaseOut;
		a.initWithAction(this._inner.clone(), this._rate);
		return a
	}
});
cc.EaseOut.create = function(a, b) {
	return new cc.EaseOut(a, b)
};
cc.easeOut = function(a) {
	return {
		_rate: a,
		easing: function(a) {
			return Math.pow(a, 1 / this._rate)
		},
		reverse: function() {
			return cc.easeOut(1 / this._rate)
		}
	}
};
cc.EaseInOut = cc.EaseRateAction.extend({
	update: function(a) {
		a *= 2;
		1 > a ? this._inner.update(0.5 * Math.pow(a, this._rate)) : this._inner.update(1 - 0.5 * Math.pow(2 - a, this._rate))
	},
	clone: function() {
		var a = new cc.EaseInOut;
		a.initWithAction(this._inner.clone(), this._rate);
		return a
	},
	reverse: function() {
		return new cc.EaseInOut(this._inner.reverse(), this._rate)
	}
});
cc.EaseInOut.create = function(a, b) {
	return new cc.EaseInOut(a, b)
};
cc.easeInOut = function(a) {
	return {
		_rate: a,
		easing: function(a) {
			a *= 2;
			return 1 > a ? 0.5 * Math.pow(a, this._rate) : 1 - 0.5 * Math.pow(2 - a, this._rate)
		},
		reverse: function() {
			return cc.easeInOut(this._rate)
		}
	}
};
cc.EaseExponentialIn = cc.ActionEase.extend({
	update: function(a) {
		this._inner.update(0 === a ? 0 : Math.pow(2, 10 * (a - 1)))
	},
	reverse: function() {
		return new cc.EaseExponentialOut(this._inner.reverse())
	},
	clone: function() {
		var a = new cc.EaseExponentialIn;
		a.initWithAction(this._inner.clone());
		return a
	}
});
cc.EaseExponentialIn.create = function(a) {
	return new cc.EaseExponentialIn(a)
};
cc._easeExponentialInObj = {
	easing: function(a) {
		return 0 === a ? 0 : Math.pow(2, 10 * (a - 1))
	},
	reverse: function() {
		return cc._easeExponentialOutObj
	}
};
cc.easeExponentialIn = function() {
	return cc._easeExponentialInObj
};
cc.EaseExponentialOut = cc.ActionEase.extend({
	update: function(a) {
		this._inner.update(1 == a ? 1 : -Math.pow(2, -10 * a) + 1)
	},
	reverse: function() {
		return new cc.EaseExponentialIn(this._inner.reverse())
	},
	clone: function() {
		var a = new cc.EaseExponentialOut;
		a.initWithAction(this._inner.clone());
		return a
	}
});
cc.EaseExponentialOut.create = function(a) {
	return new cc.EaseExponentialOut(a)
};
cc._easeExponentialOutObj = {
	easing: function(a) {
		return 1 == a ? 1 : -Math.pow(2, -10 * a) + 1
	},
	reverse: function() {
		return cc._easeExponentialInObj
	}
};
cc.easeExponentialOut = function() {
	return cc._easeExponentialOutObj
};
cc.EaseExponentialInOut = cc.ActionEase.extend({
	update: function(a) {
		1 != a && 0 !== a && (a *= 2, a = 1 > a ? 0.5 * Math.pow(2, 10 * (a - 1)) : 0.5 * (-Math.pow(2, -10 * (a - 1)) + 2));
		this._inner.update(a)
	},
	reverse: function() {
		return new cc.EaseExponentialInOut(this._inner.reverse())
	},
	clone: function() {
		var a = new cc.EaseExponentialInOut;
		a.initWithAction(this._inner.clone());
		return a
	}
});
cc.EaseExponentialInOut.create = function(a) {
	return new cc.EaseExponentialInOut(a)
};
cc._easeExponentialInOutObj = {
	easing: function(a) {
		return 1 !== a && 0 !== a ? (a *= 2, 1 > a ? 0.5 * Math.pow(2, 10 * (a - 1)) : 0.5 * (-Math.pow(2, -10 * (a - 1)) + 2)) : a
	},
	reverse: function() {
		return cc._easeExponentialInOutObj
	}
};
cc.easeExponentialInOut = function() {
	return cc._easeExponentialInOutObj
};
cc.EaseSineIn = cc.ActionEase.extend({
	update: function(a) {
		a = 0 === a || 1 === a ? a : -1 * Math.cos(a * Math.PI / 2) + 1;
		this._inner.update(a)
	},
	reverse: function() {
		return new cc.EaseSineOut(this._inner.reverse())
	},
	clone: function() {
		var a = new cc.EaseSineIn;
		a.initWithAction(this._inner.clone());
		return a
	}
});
cc.EaseSineIn.create = function(a) {
	return new cc.EaseSineIn(a)
};
cc._easeSineInObj = {
	easing: function(a) {
		return 0 === a || 1 === a ? a : -1 * Math.cos(a * Math.PI / 2) + 1
	},
	reverse: function() {
		return cc._easeSineOutObj
	}
};
cc.easeSineIn = function() {
	return cc._easeSineInObj
};
cc.EaseSineOut = cc.ActionEase.extend({
	update: function(a) {
		a = 0 === a || 1 === a ? a : Math.sin(a * Math.PI / 2);
		this._inner.update(a)
	},
	reverse: function() {
		return new cc.EaseSineIn(this._inner.reverse())
	},
	clone: function() {
		var a = new cc.EaseSineOut;
		a.initWithAction(this._inner.clone());
		return a
	}
});
cc.EaseSineOut.create = function(a) {
	return new cc.EaseSineOut(a)
};
cc._easeSineOutObj = {
	easing: function(a) {
		return 0 === a || 1 == a ? a : Math.sin(a * Math.PI / 2)
	},
	reverse: function() {
		return cc._easeSineInObj
	}
};
cc.easeSineOut = function() {
	return cc._easeSineOutObj
};
cc.EaseSineInOut = cc.ActionEase.extend({
	update: function(a) {
		a = 0 === a || 1 === a ? a : -0.5 * (Math.cos(Math.PI * a) - 1);
		this._inner.update(a)
	},
	clone: function() {
		var a = new cc.EaseSineInOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseSineInOut(this._inner.reverse())
	}
});
cc.EaseSineInOut.create = function(a) {
	return new cc.EaseSineInOut(a)
};
cc._easeSineInOutObj = {
	easing: function(a) {
		return 0 === a || 1 === a ? a : -0.5 * (Math.cos(Math.PI * a) - 1)
	},
	reverse: function() {
		return cc._easeSineInOutObj
	}
};
cc.easeSineInOut = function() {
	return cc._easeSineInOutObj
};
cc.EaseElastic = cc.ActionEase.extend({
	_period: 0.3,
	ctor: function(a, b) {
		cc.ActionEase.prototype.ctor.call(this);
		a && this.initWithAction(a, b)
	},
	getPeriod: function() {
		return this._period
	},
	setPeriod: function(a) {
		this._period = a
	},
	initWithAction: function(a, b) {
		cc.ActionEase.prototype.initWithAction.call(this, a);
		this._period = null == b ? 0.3 : b;
		return !0
	},
	reverse: function() {
		cc.log("cc.EaseElastic.reverse(): it should be overridden in subclass.");
		return null
	},
	clone: function() {
		var a = new cc.EaseElastic;
		a.initWithAction(this._inner.clone(), this._period);
		return a
	}
});
cc.EaseElastic.create = function(a, b) {
	return new cc.EaseElastic(a, b)
};
cc.EaseElasticIn = cc.EaseElastic.extend({
	update: function(a) {
		var b = 0;
		0 === a || 1 === a ? b = a : (b = this._period / 4, a -= 1, b = -Math.pow(2, 10 * a) * Math.sin((a - b) * Math.PI * 2 / this._period));
		this._inner.update(b)
	},
	reverse: function() {
		return new cc.EaseElasticOut(this._inner.reverse(), this._period)
	},
	clone: function() {
		var a = new cc.EaseElasticIn;
		a.initWithAction(this._inner.clone(), this._period);
		return a
	}
});
cc.EaseElasticIn.create = function(a, b) {
	return new cc.EaseElasticIn(a, b)
};
cc._easeElasticInObj = {
	easing: function(a) {
		if (0 === a || 1 === a) return a;
		a -= 1;
		return -Math.pow(2, 10 * a) * Math.sin((a - 0.075) * Math.PI * 2 / 0.3)
	},
	reverse: function() {
		return cc._easeElasticOutObj
	}
};
cc.easeElasticIn = function(a) {
	return a && 0.3 !== a ? {
		_period: a,
		easing: function(a) {
			if (0 === a || 1 === a) return a;
			a -= 1;
			return -Math.pow(2, 10 * a) * Math.sin((a - this._period / 4) * Math.PI * 2 / this._period)
		},
		reverse: function() {
			return cc.easeElasticOut(this._period)
		}
	} : cc._easeElasticInObj
};
cc.EaseElasticOut = cc.EaseElastic.extend({
	update: function(a) {
		var b = 0;
		0 === a || 1 == a ? b = a : (b = this._period / 4, b = Math.pow(2, -10 * a) * Math.sin((a - b) * Math.PI * 2 / this._period) + 1);
		this._inner.update(b)
	},
	reverse: function() {
		return new cc.EaseElasticIn(this._inner.reverse(), this._period)
	},
	clone: function() {
		var a = new cc.EaseElasticOut;
		a.initWithAction(this._inner.clone(), this._period);
		return a
	}
});
cc.EaseElasticOut.create = function(a, b) {
	return new cc.EaseElasticOut(a, b)
};
cc._easeElasticOutObj = {
	easing: function(a) {
		return 0 === a || 1 === a ? a : Math.pow(2, -10 * a) * Math.sin((a - 0.075) * Math.PI * 2 / 0.3) + 1
	},
	reverse: function() {
		return cc._easeElasticInObj
	}
};
cc.easeElasticOut = function(a) {
	return a && 0.3 !== a ? {
		_period: a,
		easing: function(a) {
			return 0 === a || 1 === a ? a : Math.pow(2, -10 * a) * Math.sin((a - this._period / 4) * Math.PI * 2 / this._period) + 1
		},
		reverse: function() {
			return cc.easeElasticIn(this._period)
		}
	} : cc._easeElasticOutObj
};
cc.EaseElasticInOut = cc.EaseElastic.extend({
	update: function(a) {
		var b = 0,
			b = this._period;
		if (0 === a || 1 == a) b = a;
		else {
			b || (b = this._period = 0.3 * 1.5);
			var c = b / 4;
			a = 2 * a - 1;
			b = 0 > a ? -0.5 * Math.pow(2, 10 * a) * Math.sin((a - c) * Math.PI * 2 / b) : Math.pow(2, -10 * a) * Math.sin((a - c) * Math.PI * 2 / b) * 0.5 + 1
		}
		this._inner.update(b)
	},
	reverse: function() {
		return new cc.EaseElasticInOut(this._inner.reverse(), this._period)
	},
	clone: function() {
		var a = new cc.EaseElasticInOut;
		a.initWithAction(this._inner.clone(), this._period);
		return a
	}
});
cc.EaseElasticInOut.create = function(a, b) {
	return new cc.EaseElasticInOut(a, b)
};
cc.easeElasticInOut = function(a) {
	return {
		_period: a || 0.3,
		easing: function(a) {
			var c = 0,
				c = this._period;
			if (0 === a || 1 === a) c = a;
			else {
				c || (c = this._period = 0.3 * 1.5);
				var d = c / 4;
				a = 2 * a - 1;
				c = 0 > a ? -0.5 * Math.pow(2, 10 * a) * Math.sin((a - d) * Math.PI * 2 / c) : Math.pow(2, -10 * a) * Math.sin((a - d) * Math.PI * 2 / c) * 0.5 + 1
			}
			return c
		},
		reverse: function() {
			return cc.easeElasticInOut(this._period)
		}
	}
};
cc.EaseBounce = cc.ActionEase.extend({
	bounceTime: function(a) {
		if (a < 1 / 2.75) return 7.5625 * a * a;
		if (a < 2 / 2.75) return a -= 1.5 / 2.75, 7.5625 * a * a + 0.75;
		if (a < 2.5 / 2.75) return a -= 2.25 / 2.75, 7.5625 * a * a + 0.9375;
		a -= 2.625 / 2.75;
		return 7.5625 * a * a + 0.984375
	},
	clone: function() {
		var a = new cc.EaseBounce;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseBounce(this._inner.reverse())
	}
});
cc.EaseBounce.create = function(a) {
	return new cc.EaseBounce(a)
};
cc.EaseBounceIn = cc.EaseBounce.extend({
	update: function(a) {
		a = 1 - this.bounceTime(1 - a);
		this._inner.update(a)
	},
	reverse: function() {
		return new cc.EaseBounceOut(this._inner.reverse())
	},
	clone: function() {
		var a = new cc.EaseBounceIn;
		a.initWithAction(this._inner.clone());
		return a
	}
});
cc.EaseBounceIn.create = function(a) {
	return new cc.EaseBounceIn(a)
};
cc._bounceTime = function(a) {
	if (a < 1 / 2.75) return 7.5625 * a * a;
	if (a < 2 / 2.75) return a -= 1.5 / 2.75, 7.5625 * a * a + 0.75;
	if (a < 2.5 / 2.75) return a -= 2.25 / 2.75, 7.5625 * a * a + 0.9375;
	a -= 2.625 / 2.75;
	return 7.5625 * a * a + 0.984375
};
cc._easeBounceInObj = {
	easing: function(a) {
		return 1 - cc._bounceTime(1 - a)
	},
	reverse: function() {
		return cc._easeBounceOutObj
	}
};
cc.easeBounceIn = function() {
	return cc._easeBounceInObj
};
cc.EaseBounceOut = cc.EaseBounce.extend({
	update: function(a) {
		a = this.bounceTime(a);
		this._inner.update(a)
	},
	reverse: function() {
		return new cc.EaseBounceIn(this._inner.reverse())
	},
	clone: function() {
		var a = new cc.EaseBounceOut;
		a.initWithAction(this._inner.clone());
		return a
	}
});
cc.EaseBounceOut.create = function(a) {
	return new cc.EaseBounceOut(a)
};
cc._easeBounceOutObj = {
	easing: function(a) {
		return cc._bounceTime(a)
	},
	reverse: function() {
		return cc._easeBounceInObj
	}
};
cc.easeBounceOut = function() {
	return cc._easeBounceOutObj
};
cc.EaseBounceInOut = cc.EaseBounce.extend({
	update: function(a) {
		var b = 0,
			b = 0.5 > a ? 0.5 * (1 - this.bounceTime(1 - 2 * a)) : 0.5 * this.bounceTime(2 * a - 1) + 0.5;
		this._inner.update(b)
	},
	clone: function() {
		var a = new cc.EaseBounceInOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseBounceInOut(this._inner.reverse())
	}
});
cc.EaseBounceInOut.create = function(a) {
	return new cc.EaseBounceInOut(a)
};
cc._easeBounceInOutObj = {
	easing: function(a) {
		return a = 0.5 > a ? 0.5 * (1 - cc._bounceTime(1 - 2 * a)) : 0.5 * cc._bounceTime(2 * a - 1) + 0.5
	},
	reverse: function() {
		return cc._easeBounceInOutObj
	}
};
cc.easeBounceInOut = function() {
	return cc._easeBounceInOutObj
};
cc.EaseBackIn = cc.ActionEase.extend({
	update: function(a) {
		this._inner.update(0 === a || 1 == a ? a : a * a * (2.70158 * a - 1.70158))
	},
	reverse: function() {
		return new cc.EaseBackOut(this._inner.reverse())
	},
	clone: function() {
		var a = new cc.EaseBackIn;
		a.initWithAction(this._inner.clone());
		return a
	}
});
cc.EaseBackIn.create = function(a) {
	return new cc.EaseBackIn(a)
};
cc._easeBackInObj = {
	easing: function(a) {
		return 0 === a || 1 === a ? a : a * a * (2.70158 * a - 1.70158)
	},
	reverse: function() {
		return cc._easeBackOutObj
	}
};
cc.easeBackIn = function() {
	return cc._easeBackInObj
};
cc.EaseBackOut = cc.ActionEase.extend({
	update: function(a) {
		a -= 1;
		this._inner.update(a * a * (2.70158 * a + 1.70158) + 1)
	},
	reverse: function() {
		return new cc.EaseBackIn(this._inner.reverse())
	},
	clone: function() {
		var a = new cc.EaseBackOut;
		a.initWithAction(this._inner.clone());
		return a
	}
});
cc.EaseBackOut.create = function(a) {
	return new cc.EaseBackOut(a)
};
cc._easeBackOutObj = {
	easing: function(a) {
		a -= 1;
		return a * a * (2.70158 * a + 1.70158) + 1
	},
	reverse: function() {
		return cc._easeBackInObj
	}
};
cc.easeBackOut = function() {
	return cc._easeBackOutObj
};
cc.EaseBackInOut = cc.ActionEase.extend({
	update: function(a) {
		a *= 2;
		1 > a ? this._inner.update(a * a * (3.5949095 * a - 2.5949095) / 2) : (a -= 2, this._inner.update(a * a * (3.5949095 * a + 2.5949095) / 2 + 1))
	},
	clone: function() {
		var a = new cc.EaseBackInOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseBackInOut(this._inner.reverse())
	}
});
cc.EaseBackInOut.create = function(a) {
	return new cc.EaseBackInOut(a)
};
cc._easeBackInOutObj = {
	easing: function(a) {
		a *= 2;
		if (1 > a) return a * a * (3.5949095 * a - 2.5949095) / 2;
		a -= 2;
		return a * a * (3.5949095 * a + 2.5949095) / 2 + 1
	},
	reverse: function() {
		return cc._easeBackInOutObj
	}
};
cc.easeBackInOut = function() {
	return cc._easeBackInOutObj
};
cc.EaseBezierAction = cc.ActionEase.extend({
	_p0: null,
	_p1: null,
	_p2: null,
	_p3: null,
	ctor: function(a) {
		cc.ActionEase.prototype.ctor.call(this, a)
	},
	_updateTime: function(a, b, c, d, e) {
		return Math.pow(1 - e, 3) * a + 3 * e * Math.pow(1 - e, 2) * b + 3 * Math.pow(e, 2) * (1 - e) * c + Math.pow(e, 3) * d
	},
	update: function(a) {
		a = this._updateTime(this._p0, this._p1, this._p2, this._p3, a);
		this._inner.update(a)
	},
	clone: function() {
		var a = new cc.EaseBezierAction;
		a.initWithAction(this._inner.clone());
		a.setBezierParamer(this._p0, this._p1, this._p2, this._p3);
		return a
	},
	reverse: function() {
		var a = new cc.EaseBezierAction(this._inner.reverse());
		a.setBezierParamer(this._p3, this._p2, this._p1, this._p0);
		return a
	},
	setBezierParamer: function(a, b, c, d) {
		this._p0 = a || 0;
		this._p1 = b || 0;
		this._p2 = c || 0;
		this._p3 = d || 0
	}
});
cc.EaseBezierAction.create = function(a) {
	return new cc.EaseBezierAction(a)
};
cc.easeBezierAction = function(a, b, c, d) {
	return {
		easing: function(e) {
			return cc.EaseBezierAction.prototype._updateTime(a, b, c, d, e)
		},
		reverse: function() {
			return cc.easeBezierAction(d, c, b, a)
		}
	}
};
cc.EaseQuadraticActionIn = cc.ActionEase.extend({
	_updateTime: function(a) {
		return Math.pow(a, 2)
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseQuadraticActionIn;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseQuadraticActionIn(this._inner.reverse())
	}
});
cc.EaseQuadraticActionIn.create = function(a) {
	return new cc.EaseQuadraticActionIn(a)
};
cc._easeQuadraticActionIn = {
	easing: cc.EaseQuadraticActionIn.prototype._updateTime,
	reverse: function() {
		return cc._easeQuadraticActionIn
	}
};
cc.easeQuadraticActionIn = function() {
	return cc._easeQuadraticActionIn
};
cc.EaseQuadraticActionOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		return -a * (a - 2)
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseQuadraticActionOut;
		a.initWithAction();
		return a
	},
	reverse: function() {
		return new cc.EaseQuadraticActionOut(this._inner.reverse())
	}
});
cc.EaseQuadraticActionOut.create = function(a) {
	return new cc.EaseQuadraticActionOut(a)
};
cc._easeQuadraticActionOut = {
	easing: cc.EaseQuadraticActionOut.prototype._updateTime,
	reverse: function() {
		return cc._easeQuadraticActionOut
	}
};
cc.easeQuadraticActionOut = function() {
	return cc._easeQuadraticActionOut
};
cc.EaseQuadraticActionInOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		var b = a;
		a *= 2;
		1 > a ? b = a * a * 0.5 : (--a, b = -0.5 * (a * (a - 2) - 1));
		return b
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseQuadraticActionInOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseQuadraticActionInOut(this._inner.reverse())
	}
});
cc.EaseQuadraticActionInOut.create = function(a) {
	return new cc.EaseQuadraticActionInOut(a)
};
cc._easeQuadraticActionInOut = {
	easing: cc.EaseQuadraticActionInOut.prototype._updateTime,
	reverse: function() {
		return cc._easeQuadraticActionInOut
	}
};
cc.easeQuadraticActionInOut = function() {
	return cc._easeQuadraticActionInOut
};
cc.EaseQuarticActionIn = cc.ActionEase.extend({
	_updateTime: function(a) {
		return a * a * a * a
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseQuarticActionIn;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseQuarticActionIn(this._inner.reverse())
	}
});
cc.EaseQuarticActionIn.create = function(a) {
	return new cc.EaseQuarticActionIn(a)
};
cc._easeQuarticActionIn = {
	easing: cc.EaseQuarticActionIn.prototype._updateTime,
	reverse: function() {
		return cc._easeQuarticActionIn
	}
};
cc.easeQuarticActionIn = function() {
	return cc._easeQuarticActionIn
};
cc.EaseQuarticActionOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		a -= 1;
		return -(a * a * a * a - 1)
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseQuarticActionOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseQuarticActionOut(this._inner.reverse())
	}
});
cc.EaseQuarticActionOut.create = function(a) {
	return new cc.EaseQuarticActionOut(a)
};
cc._easeQuarticActionOut = {
	easing: cc.EaseQuarticActionOut.prototype._updateTime,
	reverse: function() {
		return cc._easeQuarticActionOut
	}
};
cc.easeQuarticActionOut = function() {
	return cc._easeQuarticActionOut
};
cc.EaseQuarticActionInOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		a *= 2;
		if (1 > a) return 0.5 * a * a * a * a;
		a -= 2;
		return -0.5 * (a * a * a * a - 2)
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseQuarticActionInOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseQuarticActionInOut(this._inner.reverse())
	}
});
cc.EaseQuarticActionInOut.create = function(a) {
	return new cc.EaseQuarticActionInOut(a)
};
cc._easeQuarticActionInOut = {
	easing: cc.EaseQuarticActionInOut.prototype._updateTime,
	reverse: function() {
		return cc._easeQuarticActionInOut
	}
};
cc.easeQuarticActionInOut = function() {
	return cc._easeQuarticActionInOut
};
cc.EaseQuinticActionIn = cc.ActionEase.extend({
	_updateTime: function(a) {
		return a * a * a * a * a
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseQuinticActionIn;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseQuinticActionIn(this._inner.reverse())
	}
});
cc.EaseQuinticActionIn.create = function(a) {
	return new cc.EaseQuinticActionIn(a)
};
cc._easeQuinticActionIn = {
	easing: cc.EaseQuinticActionIn.prototype._updateTime,
	reverse: function() {
		return cc._easeQuinticActionIn
	}
};
cc.easeQuinticActionIn = function() {
	return cc._easeQuinticActionIn
};
cc.EaseQuinticActionOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		a -= 1;
		return a * a * a * a * a + 1
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseQuinticActionOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseQuinticActionOut(this._inner.reverse())
	}
});
cc.EaseQuinticActionOut.create = function(a) {
	return new cc.EaseQuinticActionOut(a)
};
cc._easeQuinticActionOut = {
	easing: cc.EaseQuinticActionOut.prototype._updateTime,
	reverse: function() {
		return cc._easeQuinticActionOut
	}
};
cc.easeQuinticActionOut = function() {
	return cc._easeQuinticActionOut
};
cc.EaseQuinticActionInOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		a *= 2;
		if (1 > a) return 0.5 * a * a * a * a * a;
		a -= 2;
		return 0.5 * (a * a * a * a * a + 2)
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseQuinticActionInOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseQuinticActionInOut(this._inner.reverse())
	}
});
cc.EaseQuinticActionInOut.create = function(a) {
	return new cc.EaseQuinticActionInOut(a)
};
cc._easeQuinticActionInOut = {
	easing: cc.EaseQuinticActionInOut.prototype._updateTime,
	reverse: function() {
		return cc._easeQuinticActionInOut
	}
};
cc.easeQuinticActionInOut = function() {
	return cc._easeQuinticActionInOut
};
cc.EaseCircleActionIn = cc.ActionEase.extend({
	_updateTime: function(a) {
		return -1 * (Math.sqrt(1 - a * a) - 1)
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseCircleActionIn;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseCircleActionIn(this._inner.reverse())
	}
});
cc.EaseCircleActionIn.create = function(a) {
	return new cc.EaseCircleActionIn(a)
};
cc._easeCircleActionIn = {
	easing: cc.EaseCircleActionIn.prototype._updateTime,
	reverse: function() {
		return cc._easeCircleActionIn
	}
};
cc.easeCircleActionIn = function() {
	return cc._easeCircleActionIn
};
cc.EaseCircleActionOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		a -= 1;
		return Math.sqrt(1 - a * a)
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseCircleActionOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseCircleActionOut(this._inner.reverse())
	}
});
cc.EaseCircleActionOut.create = function(a) {
	return new cc.EaseCircleActionOut(a)
};
cc._easeCircleActionOut = {
	easing: cc.EaseCircleActionOut.prototype._updateTime,
	reverse: function() {
		return cc._easeCircleActionOut
	}
};
cc.easeCircleActionOut = function() {
	return cc._easeCircleActionOut
};
cc.EaseCircleActionInOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		a *= 2;
		if (1 > a) return -0.5 * (Math.sqrt(1 - a * a) - 1);
		a -= 2;
		return 0.5 * (Math.sqrt(1 - a * a) + 1)
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseCircleActionInOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseCircleActionInOut(this._inner.reverse())
	}
});
cc.EaseCircleActionInOut.create = function(a) {
	return new cc.EaseCircleActionInOut(a)
};
cc._easeCircleActionInOut = {
	easing: cc.EaseCircleActionInOut.prototype._updateTime,
	reverse: function() {
		return cc._easeCircleActionInOut
	}
};
cc.easeCircleActionInOut = function() {
	return cc._easeCircleActionInOut
};
cc.EaseCubicActionIn = cc.ActionEase.extend({
	_updateTime: function(a) {
		return a * a * a
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseCubicActionIn;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseCubicActionIn(this._inner.reverse())
	}
});
cc.EaseCubicActionIn.create = function(a) {
	return new cc.EaseCubicActionIn(a)
};
cc._easeCubicActionIn = {
	easing: cc.EaseCubicActionIn.prototype._updateTime,
	reverse: function() {
		return cc._easeCubicActionIn
	}
};
cc.easeCubicActionIn = function() {
	return cc._easeCubicActionIn
};
cc.EaseCubicActionOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		a -= 1;
		return a * a * a + 1
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseCubicActionOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseCubicActionOut(this._inner.reverse())
	}
});
cc.EaseCubicActionOut.create = function(a) {
	return new cc.EaseCubicActionOut(a)
};
cc._easeCubicActionOut = {
	easing: cc.EaseCubicActionOut.prototype._updateTime,
	reverse: function() {
		return cc._easeCubicActionOut
	}
};
cc.easeCubicActionOut = function() {
	return cc._easeCubicActionOut
};
cc.EaseCubicActionInOut = cc.ActionEase.extend({
	_updateTime: function(a) {
		a *= 2;
		if (1 > a) return 0.5 * a * a * a;
		a -= 2;
		return 0.5 * (a * a * a + 2)
	},
	update: function(a) {
		this._inner.update(this._updateTime(a))
	},
	clone: function() {
		var a = new cc.EaseCubicActionInOut;
		a.initWithAction(this._inner.clone());
		return a
	},
	reverse: function() {
		return new cc.EaseCubicActionInOut(this._inner.reverse())
	}
});
cc.EaseCubicActionInOut.create = function(a) {
	return new cc.EaseCubicActionInOut(a)
};
cc._easeCubicActionInOut = {
	easing: cc.EaseCubicActionInOut.prototype._updateTime,
	reverse: function() {
		return cc._easeCubicActionInOut
	}
};
cc.easeCubicActionInOut = function() {
	return cc._easeCubicActionInOut
};
cc.cardinalSplineAt = function(a, b, c, d, e, f) {
	var g = f * f,
		h = g * f,
		k = (1 - e) / 2;
	e = k * (-h + 2 * g - f);
	var m = k * (-h + g) + (2 * h - 3 * g + 1);
	f = k * (h - 2 * g + f) + (-2 * h + 3 * g);
	g = k * (h - g);
	return cc.p(a.x * e + b.x * m + c.x * f + d.x * g, a.y * e + b.y * m + c.y * f + d.y * g)
};
cc.reverseControlPoints = function(a) {
	for (var b = [], c = a.length - 1; 0 <= c; c--) b.push(cc.p(a[c].x, a[c].y));
	return b
};
cc.cloneControlPoints = function(a) {
	for (var b = [], c = 0; c < a.length; c++) b.push(cc.p(a[c].x, a[c].y));
	return b
};
cc.copyControlPoints = cc.cloneControlPoints;
cc.getControlPointAt = function(a, b) {
	var c = Math.min(a.length - 1, Math.max(b, 0));
	return a[c]
};
cc.reverseControlPointsInline = function(a) {
	for (var b = a.length, c = 0 | b / 2, d = 0; d < c; ++d) {
		var e = a[d];
		a[d] = a[b - d - 1];
		a[b - d - 1] = e
	}
};
cc.CardinalSplineTo = cc.ActionInterval.extend({
	_points: null,
	_deltaT: 0,
	_tension: 0,
	_previousPosition: null,
	_accumulatedDiff: null,
	ctor: function(a, b, c) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._points = [];
		void 0 !== c && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		if (!b || 0 == b.length) throw "Invalid configuration. It must at least have one control point";
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this.setPoints(b), this._tension = c, !0) : !1
	},
	clone: function() {
		var a = new cc.CardinalSplineTo;
		a.initWithDuration(this._duration, cc.copyControlPoints(this._points), this._tension);
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._deltaT = 1 / (this._points.length - 1);
		this._previousPosition = cc.p(this.target.getPositionX(), this.target.getPositionY());
		this._accumulatedDiff = cc.p(0, 0)
	},
	update: function(a) {
		a = this._computeEaseTime(a);
		var b, c = this._points;
		if (1 == a) b = c.length - 1, a = 1;
		else {
			var d = this._deltaT;
			b = 0 | a / d;
			a = (a - d * b) / d
		}
		b = cc.cardinalSplineAt(cc.getControlPointAt(c, b - 1), cc.getControlPointAt(c, b - 0), cc.getControlPointAt(c, b + 1), cc.getControlPointAt(c, b + 2), this._tension, a);
		cc.ENABLE_STACKABLE_ACTIONS && (c = this.target.getPositionX() - this._previousPosition.x, a = this.target.getPositionY() - this._previousPosition.y, 0 != c || 0 != a) && (d = this._accumulatedDiff, c = d.x + c, a = d.y + a, d.x = c, d.y = a, b.x += c, b.y += a);
		this.updatePosition(b)
	},
	reverse: function() {
		var a = cc.reverseControlPoints(this._points);
		return cc.cardinalSplineTo(this._duration, a, this._tension)
	},
	updatePosition: function(a) {
		this.target.setPosition(a);
		this._previousPosition = a
	},
	getPoints: function() {
		return this._points
	},
	setPoints: function(a) {
		this._points = a
	}
});
cc.cardinalSplineTo = function(a, b, c) {
	return new cc.CardinalSplineTo(a, b, c)
};
cc.CardinalSplineTo.create = cc.cardinalSplineTo;
cc.CardinalSplineBy = cc.CardinalSplineTo.extend({
	_startPosition: null,
	ctor: function(a, b, c) {
		cc.CardinalSplineTo.prototype.ctor.call(this);
		this._startPosition = cc.p(0, 0);
		void 0 !== c && this.initWithDuration(a, b, c)
	},
	startWithTarget: function(a) {
		cc.CardinalSplineTo.prototype.startWithTarget.call(this, a);
		this._startPosition.x = a.getPositionX();
		this._startPosition.y = a.getPositionY()
	},
	reverse: function() {
		for (var a = this._points.slice(), b, c = a[0], d = 1; d < a.length; ++d) b = a[d], a[d] = cc.pSub(b, c), c = b;
		a = cc.reverseControlPoints(a);
		c = a[a.length - 1];
		a.pop();
		c.x = -c.x;
		c.y = -c.y;
		a.unshift(c);
		for (d = 1; d < a.length; ++d) b = a[d], b.x = -b.x, b.y = -b.y, b.x += c.x, b.y += c.y, c = a[d] = b;
		return cc.cardinalSplineBy(this._duration, a, this._tension)
	},
	updatePosition: function(a) {
		var b = this._startPosition,
			c = a.x + b.x;
		a = a.y + b.y;
		this._previousPosition.x = c;
		this._previousPosition.y = a;
		this.target.setPosition(c, a)
	},
	clone: function() {
		var a = new cc.CardinalSplineBy;
		a.initWithDuration(this._duration, cc.copyControlPoints(this._points), this._tension);
		return a
	}
});
cc.cardinalSplineBy = function(a, b, c) {
	return new cc.CardinalSplineBy(a, b, c)
};
cc.CardinalSplineBy.create = cc.cardinalSplineBy;
cc.CatmullRomTo = cc.CardinalSplineTo.extend({
	ctor: function(a, b) {
		b && this.initWithDuration(a, b)
	},
	initWithDuration: function(a, b) {
		return cc.CardinalSplineTo.prototype.initWithDuration.call(this, a, b, 0.5)
	},
	clone: function() {
		var a = new cc.CatmullRomTo;
		a.initWithDuration(this._duration, cc.copyControlPoints(this._points));
		return a
	}
});
cc.catmullRomTo = function(a, b) {
	return new cc.CatmullRomTo(a, b)
};
cc.CatmullRomTo.create = cc.catmullRomTo;
cc.CatmullRomBy = cc.CardinalSplineBy.extend({
	ctor: function(a, b) {
		cc.CardinalSplineBy.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	initWithDuration: function(a, b) {
		return cc.CardinalSplineTo.prototype.initWithDuration.call(this, a, b, 0.5)
	},
	clone: function() {
		var a = new cc.CatmullRomBy;
		a.initWithDuration(this._duration, cc.copyControlPoints(this._points));
		return a
	}
});
cc.catmullRomBy = function(a, b) {
	return new cc.CatmullRomBy(a, b)
};
cc.CatmullRomBy.create = cc.catmullRomBy;
cc.ActionTweenDelegate = cc.Class.extend({
	updateTweenAction: function(a, b) {}
});
cc.ActionTween = cc.ActionInterval.extend({
	key: "",
	from: 0,
	to: 0,
	delta: 0,
	ctor: function(a, b, c, d) {
		cc.ActionInterval.prototype.ctor.call(this);
		this.key = "";
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	initWithDuration: function(a, b, c, d) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this.key = b, this.to = d, this.from = c, !0) : !1
	},
	startWithTarget: function(a) {
		if (!a || !a.updateTweenAction) throw "cc.ActionTween.startWithTarget(): target must be non-null, and target must implement updateTweenAction function";
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this.delta = this.to - this.from
	},
	update: function(a) {
		this.target.updateTweenAction(this.to - this.delta * (1 - a), this.key)
	},
	reverse: function() {
		return new cc.ActionTween(this.duration, this.key, this.to, this.from)
	},
	clone: function() {
		var a = new cc.ActionTween;
		a.initWithDuration(this._duration, this.key, this.from, this.to);
		return a
	}
});
cc.actionTween = function(a, b, c, d) {
	return new cc.ActionTween(a, b, c, d)
};
cc.ActionTween.create = cc.actionTween;
cc.GridAction = cc.ActionInterval.extend({
	_gridSize: null,
	ctor: function(a, b) {
		cc._checkWebGLRenderMode();
		cc.ActionInterval.prototype.ctor.call(this);
		this._gridSize = cc.size(0, 0);
		b && this.initWithDuration(a, b)
	},
	clone: function() {
		var a = new cc.GridAction,
			b = this._gridSize;
		a.initWithDuration(this._duration, cc.size(b.width, b.height));
		return a
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		var b = this.getGrid(),
			c = this.target;
		(a = c.grid) && 0 < a.getReuseGrid() ? (b = a.getGridSize(), a.isActive() && b.width == this._gridSize.width && b.height == this._gridSize.height && a.reuse()) : (a && a.isActive() && a.setActive(!1), c.grid = b, c.grid.setActive(!0))
	},
	reverse: function() {
		return new cc.ReverseTime(this)
	},
	initWithDuration: function(a, b) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._gridSize.width = b.width, this._gridSize.height = b.height, !0) : !1
	},
	getGrid: function() {
		cc.log("cc.GridAction.getGrid(): it should be overridden in subclass.")
	}
});
cc.gridAction = function(a, b) {
	return new cc.GridAction(a, b)
};
cc.GridAction.create = cc.gridAction;
cc.Grid3DAction = cc.GridAction.extend({
	getGrid: function() {
		return new cc.Grid3D(this._gridSize)
	},
	vertex: function(a) {
		return this.target.grid.vertex(a)
	},
	originalVertex: function(a) {
		return this.target.grid.originalVertex(a)
	},
	setVertex: function(a, b) {
		this.target.grid.setVertex(a, b)
	}
});
cc.grid3DAction = function(a, b) {
	return new cc.Grid3DAction(a, b)
};
cc.Grid3DAction.create = cc.grid3DAction;
cc.TiledGrid3DAction = cc.GridAction.extend({
	tile: function(a) {
		return this.target.grid.tile(a)
	},
	originalTile: function(a) {
		return this.target.grid.originalTile(a)
	},
	setTile: function(a, b) {
		this.target.grid.setTile(a, b)
	},
	getGrid: function() {
		return new cc.TiledGrid3D(this._gridSize)
	}
});
cc.tiledGrid3DAction = function(a, b) {
	return new cc.TiledGrid3DAction(a, b)
};
cc.TiledGrid3DAction.create = cc.tiledGrid3DAction;
cc.StopGrid = cc.ActionInstant.extend({
	startWithTarget: function(a) {
		cc.ActionInstant.prototype.startWithTarget.call(this, a);
		(a = this.target.grid) && a.isActive() && a.setActive(!1)
	}
});
cc.stopGrid = function() {
	return new cc.StopGrid
};
cc.StopGrid.create = cc.stopGrid;
cc.ReuseGrid = cc.ActionInstant.extend({
	_times: null,
	ctor: function(a) {
		cc.ActionInstant.prototype.ctor.call(this);
		void 0 !== a && this.initWithTimes(a)
	},
	initWithTimes: function(a) {
		this._times = a;
		return !0
	},
	startWithTarget: function(a) {
		cc.ActionInstant.prototype.startWithTarget.call(this, a);
		this.target.grid && this.target.grid.isActive() && this.target.grid.setReuseGrid(this.target.grid.getReuseGrid() + this._times)
	}
});
cc.reuseGrid = function(a) {
	return new cc.ReuseGrid(a)
};
cc.ReuseGrid.create = cc.reuseGrid;
cc.Waves3D = cc.Grid3DAction.extend({
	_waves: 0,
	_amplitude: 0,
	_amplitudeRate: 0,
	ctor: function(a, b, c, d) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	getAmplitude: function() {
		return this._amplitude
	},
	setAmplitude: function(a) {
		this._amplitude = a
	},
	getAmplitudeRate: function() {
		return this._amplitudeRate
	},
	setAmplitudeRate: function(a) {
		this._amplitudeRate = a
	},
	initWithDuration: function(a, b, c, d) {
		return cc.Grid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._waves = c, this._amplitude = d, this._amplitudeRate = 1, !0) : !1
	},
	update: function(a) {
		for (var b = this._gridSize, c = this._amplitude, d = cc.p(0, 0), e = this._amplitudeRate, f = this._waves, g = 0; g < b.width + 1; ++g)
			for (var h = 0; h < b.height + 1; ++h) {
				d.x = g;
				d.y = h;
				var k = this.originalVertex(d);
				k.z += Math.sin(Math.PI * a * f * 2 + 0.01 * (k.y + k.x)) * c * e;
				this.setVertex(d, k)
			}
	}
});
cc.waves3D = function(a, b, c, d) {
	return new cc.Waves3D(a, b, c, d)
};
cc.Waves3D.create = cc.waves3D;
cc.FlipX3D = cc.Grid3DAction.extend({
	ctor: function(a) {
		void 0 !== a ? cc.GridAction.prototype.ctor.call(this, a, cc.size(1, 1)) : cc.GridAction.prototype.ctor.call(this)
	},
	initWithDuration: function(a) {
		return cc.Grid3DAction.prototype.initWithDuration.call(this, a, cc.size(1, 1))
	},
	initWithSize: function(a, b) {
		return 1 != a.width || 1 != a.height ? (cc.log("Grid size must be (1,1)"), !1) : cc.Grid3DAction.prototype.initWithDuration.call(this, b, a)
	},
	update: function(a) {
		var b = Math.PI * a;
		a = Math.sin(b);
		var c = Math.cos(b / 2),
			b = new cc.Vertex3F,
			d = cc.p(0, 0);
		d.x = d.y = 1;
		var e = this.originalVertex(d);
		d.x = d.y = 0;
		var d = this.originalVertex(d),
			f = e.x,
			g = d.x,
			h, k;
		f > g ? (e = cc.p(0, 0), d = cc.p(0, 1), h = cc.p(1, 0), k = cc.p(1, 1)) : (h = cc.p(0, 0), k = cc.p(0, 1), e = cc.p(1, 0), d = cc.p(1, 1), f = g);
		b.x = f - f * c;
		b.z = Math.abs(parseFloat(f * a / 4));
		a = this.originalVertex(e);
		a.x = b.x;
		a.z += b.z;
		this.setVertex(e, a);
		a = this.originalVertex(d);
		a.x = b.x;
		a.z += b.z;
		this.setVertex(d, a);
		a = this.originalVertex(h);
		a.x -= b.x;
		a.z -= b.z;
		this.setVertex(h, a);
		a = this.originalVertex(k);
		a.x -= b.x;
		a.z -= b.z;
		this.setVertex(k, a)
	}
});
cc.flipX3D = function(a) {
	return new cc.FlipX3D(a)
};
cc.FlipX3D.create = cc.flipX3D;
cc.FlipY3D = cc.FlipX3D.extend({
	ctor: function(a) {
		void 0 !== a ? cc.GridAction.prototype.ctor.call(this, a, cc.size(1, 1)) : cc.GridAction.prototype.ctor.call(this)
	},
	update: function(a) {
		var b = Math.PI * a;
		a = Math.sin(b);
		var c = Math.cos(b / 2),
			b = new cc.Vertex3F,
			d = cc.p(0, 0);
		d.x = d.y = 1;
		var e = this.originalVertex(d);
		d.x = d.y = 0;
		var d = this.originalVertex(d),
			f = e.y,
			g = d.y,
			h, k;
		f > g ? (e = cc.p(0, 0), d = cc.p(0, 1), h = cc.p(1, 0), k = cc.p(1, 1)) : (d = cc.p(0, 0), e = cc.p(0, 1), k = cc.p(1, 0), h = cc.p(1, 1), f = g);
		b.y = f - f * c;
		b.z = Math.abs(parseFloat(f * a) / 4);
		a = this.originalVertex(e);
		a.y = b.y;
		a.z += b.z;
		this.setVertex(e, a);
		a = this.originalVertex(d);
		a.y -= b.y;
		a.z -= b.z;
		this.setVertex(d, a);
		a = this.originalVertex(h);
		a.y = b.y;
		a.z += b.z;
		this.setVertex(h, a);
		a = this.originalVertex(k);
		a.y -= b.y;
		a.z -= b.z;
		this.setVertex(k, a)
	}
});
cc.flipY3D = function(a) {
	return new cc.FlipY3D(a)
};
cc.FlipY3D.create = cc.flipY3D;
cc.Lens3D = cc.Grid3DAction.extend({
	_position: null,
	_radius: 0,
	_lensEffect: 0,
	_concave: !1,
	_dirty: !1,
	ctor: function(a, b, c, d) {
		cc.GridAction.prototype.ctor.call(this);
		this._position = cc.p(0, 0);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	getLensEffect: function() {
		return this._lensEffect
	},
	setLensEffect: function(a) {
		this._lensEffect = a
	},
	setConcave: function(a) {
		this._concave = a
	},
	getPosition: function() {
		return this._position
	},
	setPosition: function(a) {
		cc.pointEqualToPoint(a, this._position) || (this._position.x = a.x, this._position.y = a.y, this._dirty = !0)
	},
	initWithDuration: function(a, b, c, d) {
		return cc.Grid3DAction.prototype.initWithDuration.call(this, a, b) ? (this.setPosition(c), this._radius = d, this._lensEffect = 0.7, this._dirty = !0) : !1
	},
	update: function(a) {
		if (this._dirty) {
			a = this._gridSize.width;
			for (var b = this._gridSize.height, c = this._radius, d = this._lensEffect, e = cc.p(0, 0), f = cc.p(0, 0), g, h, k, m = 0; m < a + 1; ++m)
				for (var n = 0; n < b + 1; ++n) e.x = m, e.y = n, g = this.originalVertex(e), f.x = this._position.x - g.x, f.y = this._position.y - g.y, h = cc.pLength(f), h < c && (h = c -
					h, h /= c, 0 == h && (h = 0.001), h = Math.log(h) * d, k = Math.exp(h) * c, h = cc.pLength(f), 0 < h && (f.x /= h, f.y /= h, f.x *= k, f.y *= k, g.z += cc.pLength(f) * d)), this.setVertex(e, g);
			this._dirty = !1
		}
	}
});
cc.lens3D = function(a, b, c, d) {
	return new cc.Lens3D(a, b, c, d)
};
cc.Lens3D.create = cc.lens3D;
cc.Ripple3D = cc.Grid3DAction.extend({
	_position: null,
	_radius: 0,
	_waves: 0,
	_amplitude: 0,
	_amplitudeRate: 0,
	ctor: function(a, b, c, d, e, f) {
		cc.GridAction.prototype.ctor.call(this);
		this._position = cc.p(0, 0);
		void 0 !== f && this.initWithDuration(a, b, c, d, e, f)
	},
	getPosition: function() {
		return this._position
	},
	setPosition: function(a) {
		this._position.x = a.x;
		this._position.y = a.y
	},
	getAmplitude: function() {
		return this._amplitude
	},
	setAmplitude: function(a) {
		this._amplitude = a
	},
	getAmplitudeRate: function() {
		return this._amplitudeRate
	},
	setAmplitudeRate: function(a) {
		this._amplitudeRate = a
	},
	initWithDuration: function(a, b, c, d, e, f) {
		return cc.Grid3DAction.prototype.initWithDuration.call(this, a, b) ? (this.setPosition(c), this._radius = d, this._waves = e, this._amplitude = f, this._amplitudeRate = 1, !0) : !1
	},
	update: function(a) {
		for (var b = this._gridSize.width, c = this._gridSize.height, d = cc.p(0, 0), e = this._radius, f = this._waves, g = this._amplitude, h = this._amplitudeRate, k, m, n = cc.p(0, 0), q = 0; q < b + 1; ++q)
			for (var s = 0; s < c + 1; ++s) {
				d.x = q;
				d.y = s;
				k = this.originalVertex(d);
				n.x = this._position.x - k.x;
				n.y = this._position.y - k.y;
				m = cc.pLength(n);
				if (m < e) {
					m = e - m;
					var r = Math.pow(m / e, 2);
					k.z += Math.sin(a * Math.PI * f * 2 + 0.1 * m) * g * h * r
				}
				this.setVertex(d, k)
			}
	}
});
cc.ripple3D = function(a, b, c, d, e, f) {
	return new cc.Ripple3D(a, b, c, d, e, f)
};
cc.Ripple3D.create = cc.ripple3D;
cc.Shaky3D = cc.Grid3DAction.extend({
	_randRange: 0,
	_shakeZ: !1,
	ctor: function(a, b, c, d) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	initWithDuration: function(a, b, c, d) {
		return cc.Grid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._randRange = c, this._shakeZ = d, !0) : !1
	},
	update: function(a) {
		a = this._gridSize.width;
		for (var b = this._gridSize.height, c = this._randRange, d = this._shakeZ, e = cc.p(0, 0), f, g = 0; g < a + 1; ++g)
			for (var h = 0; h < b + 1; ++h) e.x = g, e.y = h, f = this.originalVertex(e), f.x += cc.rand() % (2 * c) - c, f.y += cc.rand() % (2 * c) - c, d && (f.z += cc.rand() % (2 * c) - c), this.setVertex(e, f)
	}
});
cc.shaky3D = function(a, b, c, d) {
	return new cc.Shaky3D(a, b, c, d)
};
cc.Shaky3D.create = cc.shaky3D;
cc.Liquid = cc.Grid3DAction.extend({
	_waves: 0,
	_amplitude: 0,
	_amplitudeRate: 0,
	ctor: function(a, b, c, d) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	getAmplitude: function() {
		return this._amplitude
	},
	setAmplitude: function(a) {
		this._amplitude = a
	},
	getAmplitudeRate: function() {
		return this._amplitudeRate
	},
	setAmplitudeRate: function(a) {
		this._amplitudeRate = a
	},
	initWithDuration: function(a, b, c, d) {
		return cc.Grid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._waves = c, this._amplitude = d, this._amplitudeRate = 1, !0) : !1
	},
	update: function(a) {
		for (var b = this._gridSize.width, c = this._gridSize.height, d = cc.p(0, 0), e = this._waves, f = this._amplitude, g = this._amplitudeRate, h, k = 1; k < b; ++k)
			for (var m = 1; m < c; ++m) d.x = k, d.y = m, h = this.originalVertex(d), h.x += Math.sin(a * Math.PI * e * 2 + 0.01 * h.x) * f * g, h.y += Math.sin(a * Math.PI * e * 2 + 0.01 * h.y) * f * g, this.setVertex(d, h)
	}
});
cc.liquid = function(a, b, c, d) {
	return new cc.Liquid(a, b, c, d)
};
cc.Liquid.create = cc.liquid;
cc.Waves = cc.Grid3DAction.extend({
	_waves: 0,
	_amplitude: 0,
	_amplitudeRate: 0,
	_vertical: !1,
	_horizontal: !1,
	ctor: function(a, b, c, d, e, f) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== f && this.initWithDuration(a, b, c, d, e, f)
	},
	getAmplitude: function() {
		return this._amplitude
	},
	setAmplitude: function(a) {
		this._amplitude = a
	},
	getAmplitudeRate: function() {
		return this._amplitudeRate
	},
	setAmplitudeRate: function(a) {
		this._amplitudeRate = a
	},
	initWithDuration: function(a, b, c, d, e, f) {
		return cc.Grid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._waves = c, this._amplitude = d, this._amplitudeRate = 1, this._horizontal = e, this._vertical = f, !0) : !1
	},
	update: function(a) {
		for (var b = this._gridSize.width, c = this._gridSize.height, d = cc.p(0, 0), e = this._vertical, f = this._horizontal, g = this._waves, h = this._amplitude, k = this._amplitudeRate, m, n = 0; n < b + 1; ++n)
			for (var q = 0; q < c + 1; ++q) d.x = n, d.y = q, m = this.originalVertex(d), e && (m.x += Math.sin(a * Math.PI * g * 2 + 0.01 * m.y) * h * k), f && (m.y += Math.sin(a * Math.PI * g * 2 + 0.01 * m.x) * h * k), this.setVertex(d, m)
	}
});
cc.waves = function(a, b, c, d, e, f) {
	return new cc.Waves(a, b, c, d, e, f)
};
cc.Waves.create = cc.waves;
cc.Twirl = cc.Grid3DAction.extend({
	_position: null,
	_twirls: 0,
	_amplitude: 0,
	_amplitudeRate: 0,
	ctor: function(a, b, c, d, e) {
		cc.GridAction.prototype.ctor.call(this);
		this._position = cc.p(0, 0);
		void 0 !== e && this.initWithDuration(a, b, c, d, e)
	},
	getPosition: function() {
		return this._position
	},
	setPosition: function(a) {
		this._position.x = a.x;
		this._position.y = a.y
	},
	getAmplitude: function() {
		return this._amplitude
	},
	setAmplitude: function(a) {
		this._amplitude = a
	},
	getAmplitudeRate: function() {
		return this._amplitudeRate
	},
	setAmplitudeRate: function(a) {
		this._amplitudeRate = a
	},
	initWithDuration: function(a, b, c, d, e) {
		return cc.Grid3DAction.prototype.initWithDuration.call(this, a, b) ? (this.setPosition(c), this._twirls = d, this._amplitude = e, this._amplitudeRate = 1, !0) : !1
	},
	update: function(a) {
		for (var b = this._position, c = this._gridSize.width, d = this._gridSize.height, e = cc.p(0, 0), f = 0.1 * this._amplitude * this._amplitudeRate, g = this._twirls, h, k, m, n = cc.p(0, 0), q = 0; q < c + 1; ++q)
			for (var s = 0; s < d + 1; ++s) e.x = q, e.y = s, h = this.originalVertex(e), n.x = q - c / 2, n.y = s - d / 2, k = cc.pLength(n) * Math.cos(Math.PI / 2 + a * Math.PI * g * 2) * f, m = Math.sin(k) * (h.y - b.y) + Math.cos(k) * (h.x - b.x), k = Math.cos(k) * (h.y - b.y) - Math.sin(k) * (h.x - b.x), h.x = b.x + m, h.y = b.y + k, this.setVertex(e, h)
	}
});
cc.twirl = function(a, b, c, d, e) {
	return new cc.Twirl(a, b, c, d, e)
};
cc.Twirl.create = cc.twirl;
cc.ShakyTiles3D = cc.TiledGrid3DAction.extend({
	_randRange: 0,
	_shakeZ: !1,
	ctor: function(a, b, c, d) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	initWithDuration: function(a, b, c, d) {
		return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._randRange = c, this._shakeZ = d, !0) : !1
	},
	update: function(a) {
		a = this._gridSize;
		for (var b = this._randRange, c = cc.p(0, 0), d = 0; d < a.width; ++d)
			for (var e = 0; e < a.height; ++e) {
				c.x = d;
				c.y = e;
				var f = this.originalTile(c);
				f.bl.x += cc.rand() % (2 * b) - b;
				f.br.x += cc.rand() % (2 * b) - b;
				f.tl.x += cc.rand() % (2 * b) - b;
				f.tr.x += cc.rand() % (2 * b) - b;
				f.bl.y += cc.rand() % (2 * b) - b;
				f.br.y += cc.rand() % (2 * b) - b;
				f.tl.y += cc.rand() % (2 * b) - b;
				f.tr.y += cc.rand() % (2 * b) - b;
				this._shakeZ && (f.bl.z += cc.rand() % (2 * b) - b, f.br.z += cc.rand() % (2 * b) - b, f.tl.z += cc.rand() % (2 * b) - b, f.tr.z += cc.rand() % (2 * b) - b);
				this.setTile(c, f)
			}
	}
});
cc.shakyTiles3D = function(a, b, c, d) {
	return new cc.ShakyTiles3D(a, b, c, d)
};
cc.ShakyTiles3D.create = cc.shakyTiles3D;
cc.ShatteredTiles3D = cc.TiledGrid3DAction.extend({
	_randRange: 0,
	_once: !1,
	_shatterZ: !1,
	ctor: function(a, b, c, d) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	initWithDuration: function(a, b, c, d) {
		return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._once = !1, this._randRange = c, this._shatterZ = d, !0) : !1
	},
	update: function(a) {
		if (!1 === this._once) {
			a = this._gridSize;
			for (var b = this._randRange, c, d = cc.p(0, 0), e = 0; e < a.width; ++e)
				for (var f = 0; f < a.height; ++f) d.x = e, d.y = f, c = this.originalTile(d), c.bl.x += cc.rand() % (2 * b) - b, c.br.x += cc.rand() % (2 * b) - b, c.tl.x += cc.rand() % (2 * b) - b, c.tr.x += cc.rand() % (2 * b) - b, c.bl.y += cc.rand() % (2 * b) - b, c.br.y += cc.rand() % (2 * b) - b, c.tl.y += cc.rand() % (2 * b) - b, c.tr.y += cc.rand() % (2 * b) - b, this._shatterZ && (c.bl.z += cc.rand() % (2 * b) - b, c.br.z += cc.rand() % (2 * b) - b, c.tl.z += cc.rand() % (2 * b) - b, c.tr.z += cc.rand() % (2 * b) - b), this.setTile(d, c);
			this._once = !0
		}
	}
});
cc.shatteredTiles3D = function(a, b, c, d) {
	return new cc.ShatteredTiles3D(a, b, c, d)
};
cc.ShatteredTiles3D.create = cc.shatteredTiles3D;
cc.Tile = function(a, b, c) {
	this.position = a || cc.p(0, 0);
	this.startPosition = b || cc.p(0, 0);
	this.delta = c || cc.p(0, 0)
};
cc.ShuffleTiles = cc.TiledGrid3DAction.extend({
	_seed: 0,
	_tilesCount: 0,
	_tilesOrder: null,
	_tiles: null,
	ctor: function(a, b, c) {
		cc.GridAction.prototype.ctor.call(this);
		this._tilesOrder = [];
		this._tiles = [];
		void 0 !== c && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._seed = c, this._tilesOrder.length = 0, this._tiles.length = 0, !0) : !1
	},
	shuffle: function(a, b) {
		for (var c = b - 1; 0 <= c; c--) {
			var d = 0 | cc.rand() % (c + 1),
				e = a[c];
			a[c] = a[d];
			a[d] = e
		}
	},
	getDelta: function(a) {
		var b = this._gridSize,
			c = a.width * b.height + a.height;
		return cc.size(this._tilesOrder[c] / b.height - a.width, this._tilesOrder[c] % b.height - a.height)
	},
	placeTile: function(a, b) {
		var c = this.originalTile(a),
			d = this.target.grid.getStep(),
			e = b.position;
		c.bl.x += e.x * d.x;
		c.bl.y += e.y * d.y;
		c.br.x += e.x * d.x;
		c.br.y += e.y * d.y;
		c.tl.x += e.x * d.x;
		c.tl.y += e.y * d.y;
		c.tr.x += e.x * d.x;
		c.tr.y += e.y * d.y;
		this.setTile(a, c)
	},
	startWithTarget: function(a) {
		cc.TiledGrid3DAction.prototype.startWithTarget.call(this, a);
		a = this._gridSize;
		this._tilesCount = a.width * a.height;
		for (var b = this._tilesOrder, c = b.length = 0; c < this._tilesCount; ++c) b[c] = c;
		this.shuffle(b, this._tilesCount);
		for (var b = this._tiles, c = b.length = 0, d = cc.size(0, 0), e = 0; e < a.width; ++e)
			for (var f = 0; f < a.height; ++f) b[c] = new cc.Tile, b[c].position = cc.p(e, f), b[c].startPosition = cc.p(e, f), d.width = e, d.height = f, b[c].delta = this.getDelta(d), ++c
	},
	update: function(a) {
		for (var b = 0, c = this._gridSize, d = this._tiles, e, f = cc.p(0, 0), g = 0; g < c.width; ++g)
			for (var h = 0; h < c.height; ++h) f.x = g, f.y = h, e = d[b], e.position.x = e.delta.width * a, e.position.y = e.delta.height * a, this.placeTile(f, e), ++b
	}
});
cc.shuffleTiles = function(a, b, c) {
	return new cc.ShuffleTiles(a, b, c)
};
cc.ShuffleTiles.create = cc.shuffleTiles;
cc.FadeOutTRTiles = cc.TiledGrid3DAction.extend({
	testFunc: function(a, b) {
		var c = this._gridSize.width * b,
			d = this._gridSize.height * b;
		return 0 == c + d ? 1 : Math.pow((a.width + a.height) / (c + d), 6)
	},
	turnOnTile: function(a) {
		this.setTile(a, this.originalTile(a))
	},
	turnOffTile: function(a) {
		this.setTile(a, new cc.Quad3)
	},
	transformTile: function(a, b) {
		var c = this.originalTile(a),
			d = this.target.grid.getStep();
		c.bl.x += d.x / 2 * (1 - b);
		c.bl.y += d.y / 2 * (1 - b);
		c.br.x -= d.x / 2 * (1 - b);
		c.br.y += d.y / 2 * (1 - b);
		c.tl.x += d.x / 2 * (1 - b);
		c.tl.y -= d.y / 2 * (1 - b);
		c.tr.x -= d.x / 2 * (1 - b);
		c.tr.y -= d.y / 2 * (1 - b);
		this.setTile(a, c)
	},
	update: function(a) {
		for (var b = this._gridSize, c = cc.p(0, 0), d = cc.size(0, 0), e, f = 0; f < b.width; ++f)
			for (var g = 0; g < b.height; ++g) c.x = f, c.y = g, d.width = f, d.height = g, e = this.testFunc(d, a), 0 == e ? this.turnOffTile(c) : 1 > e ? this.transformTile(c, e) : this.turnOnTile(c)
	}
});
cc.fadeOutTRTiles = function(a, b) {
	return new cc.FadeOutTRTiles(a, b)
};
cc.FadeOutTRTiles.create = cc.fadeOutTRTiles;
cc.FadeOutBLTiles = cc.FadeOutTRTiles.extend({
	testFunc: function(a, b) {
		return 0 == a.width + a.height ? 1 : Math.pow((this._gridSize.width * (1 - b) + this._gridSize.height * (1 - b)) / (a.width + a.height), 6)
	}
});
cc.fadeOutBLTiles = function(a, b) {
	return new cc.FadeOutBLTiles(a, b)
};
cc.FadeOutBLTiles.create = cc.fadeOutBLTiles;
cc.FadeOutUpTiles = cc.FadeOutTRTiles.extend({
	testFunc: function(a, b) {
		var c = this._gridSize.height * b;
		return 0 == c ? 1 : Math.pow(a.height / c, 6)
	},
	transformTile: function(a, b) {
		var c = this.originalTile(a),
			d = this.target.grid.getStep();
		c.bl.y += d.y / 2 * (1 - b);
		c.br.y += d.y / 2 * (1 - b);
		c.tl.y -= d.y / 2 * (1 - b);
		c.tr.y -= d.y / 2 * (1 - b);
		this.setTile(a, c)
	}
});
cc.fadeOutUpTiles = function(a, b) {
	return new cc.FadeOutUpTiles(a, b)
};
cc.FadeOutUpTiles.create = cc.fadeOutUpTiles;
cc.FadeOutDownTiles = cc.FadeOutUpTiles.extend({
	testFunc: function(a, b) {
		return 0 == a.height ? 1 : Math.pow(this._gridSize.height * (1 - b) / a.height, 6)
	}
});
cc.fadeOutDownTiles = function(a, b) {
	return new cc.FadeOutDownTiles(a, b)
};
cc.FadeOutDownTiles.create = cc.fadeOutDownTiles;
cc.TurnOffTiles = cc.TiledGrid3DAction.extend({
	_seed: null,
	_tilesCount: 0,
	_tilesOrder: null,
	ctor: function(a, b, c) {
		cc.GridAction.prototype.ctor.call(this);
		this._tilesOrder = [];
		void 0 !== b && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._seed = c || 0, this._tilesOrder.length = 0, !0) : !1
	},
	shuffle: function(a, b) {
		for (var c = b - 1; 0 <= c; c--) {
			var d = 0 | cc.rand() % (c + 1),
				e = a[c];
			a[c] = a[d];
			a[d] = e
		}
	},
	turnOnTile: function(a) {
		this.setTile(a, this.originalTile(a))
	},
	turnOffTile: function(a) {
		this.setTile(a, new cc.Quad3)
	},
	startWithTarget: function(a) {
		cc.TiledGrid3DAction.prototype.startWithTarget.call(this, a);
		this._tilesCount = this._gridSize.width * this._gridSize.height;
		a = this._tilesOrder;
		for (var b = a.length = 0; b < this._tilesCount; ++b) a[b] = b;
		this.shuffle(a, this._tilesCount)
	},
	update: function(a) {
		a = 0 | a * this._tilesCount;
		for (var b = this._gridSize, c, d = cc.p(0, 0), e = this._tilesOrder, f = 0; f < this._tilesCount; f++) c = e[f], d.x = 0 | c / b.height, d.y = c % (0 | b.height), f < a ? this.turnOffTile(d) : this.turnOnTile(d)
	}
});
cc.turnOffTiles = function(a, b, c) {
	return new cc.TurnOffTiles(a, b, c)
};
cc.TurnOffTiles.create = cc.turnOffTiles;
cc.WavesTiles3D = cc.TiledGrid3DAction.extend({
	_waves: 0,
	_amplitude: 0,
	_amplitudeRate: 0,
	ctor: function(a, b, c, d) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	getAmplitude: function() {
		return this._amplitude
	},
	setAmplitude: function(a) {
		this._amplitude = a
	},
	getAmplitudeRate: function() {
		return this._amplitudeRate
	},
	setAmplitudeRate: function(a) {
		this._amplitudeRate = a
	},
	initWithDuration: function(a, b, c, d) {
		return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._waves = c, this._amplitude = d, this._amplitudeRate = 1, !0) : !1
	},
	update: function(a) {
		for (var b = this._gridSize, c = this._waves, d = this._amplitude, e = this._amplitudeRate, f = cc.p(0, 0), g, h = 0; h < b.width; h++)
			for (var k = 0; k < b.height; k++) f.x = h, f.y = k, g = this.originalTile(f), g.bl.z = Math.sin(a * Math.PI * c * 2 + 0.01 * (g.bl.y + g.bl.x)) * d * e, g.br.z = g.bl.z, g.tl.z = g.bl.z, g.tr.z = g.bl.z, this.setTile(f, g)
	}
});
cc.wavesTiles3D = function(a, b, c, d) {
	return new cc.WavesTiles3D(a, b, c, d)
};
cc.WavesTiles3D.create = cc.wavesTiles3D;
cc.JumpTiles3D = cc.TiledGrid3DAction.extend({
	_jumps: 0,
	_amplitude: 0,
	_amplitudeRate: 0,
	ctor: function(a, b, c, d) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== d && this.initWithDuration(a, b, c, d)
	},
	getAmplitude: function() {
		return this._amplitude
	},
	setAmplitude: function(a) {
		this._amplitude = a
	},
	getAmplitudeRate: function() {
		return this._amplitudeRate
	},
	setAmplitudeRate: function(a) {
		this._amplitudeRate = a
	},
	initWithDuration: function(a, b, c, d) {
		return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, a, b) ? (this._jumps = c, this._amplitude = d, this._amplitudeRate = 1, !0) : !1
	},
	update: function(a) {
		var b = Math.sin(Math.PI * a * this._jumps * 2) * this._amplitude * this._amplitudeRate;
		a = Math.sin(Math.PI * (a * this._jumps * 2 + 1)) * this._amplitude * this._amplitudeRate;
		for (var c = this._gridSize, d = this.target.grid, e, f = cc.p(0, 0), g = 0; g < c.width; g++)
			for (var h = 0; h < c.height; h++) f.x = g, f.y = h, e = d.originalTile(f), 0 == (g + h) % 2 ? (e.bl.z += b, e.br.z += b, e.tl.z += b, e.tr.z += b) : (e.bl.z += a, e.br.z += a, e.tl.z += a, e.tr.z += a), d.setTile(f, e)
	}
});
cc.jumpTiles3D = function(a, b, c, d) {
	return new cc.JumpTiles3D(a, b, c, d)
};
cc.JumpTiles3D.create = cc.jumpTiles3D;
cc.SplitRows = cc.TiledGrid3DAction.extend({
	_rows: 0,
	_winSize: null,
	ctor: function(a, b) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== b && this.initWithDuration(a, b)
	},
	initWithDuration: function(a, b) {
		this._rows = b;
		return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, a, cc.size(1, b))
	},
	update: function(a) {
		for (var b = this._gridSize, c = this._winSize.width, d, e, f = cc.p(0, 0), g = 0; g < b.height; ++g) f.y = g, d = this.originalTile(f), e = 1, 0 == g % 2 && (e = -1), d.bl.x += e * c * a, d.br.x += e * c * a, d.tl.x += e * c * a, d.tr.x += e * c * a, this.setTile(f, d)
	},
	startWithTarget: function(a) {
		cc.TiledGrid3DAction.prototype.startWithTarget.call(this, a);
		this._winSize = cc.director.getWinSizeInPixels()
	}
});
cc.splitRows = function(a, b) {
	return new cc.SplitRows(a, b)
};
cc.SplitRows.create = cc.splitRows;
cc.SplitCols = cc.TiledGrid3DAction.extend({
	_cols: 0,
	_winSize: null,
	ctor: function(a, b) {
		cc.GridAction.prototype.ctor.call(this);
		void 0 !== b && this.initWithDuration(a, b)
	},
	initWithDuration: function(a, b) {
		this._cols = b;
		return cc.TiledGrid3DAction.prototype.initWithDuration.call(this, a, cc.size(b, 1))
	},
	update: function(a) {
		for (var b = this._gridSize.width, c = this._winSize.height, d, e, f = cc.p(0, 0), g = 0; g < b; ++g) f.x = g, d = this.originalTile(f), e = 1, 0 == g % 2 && (e = -1), d.bl.y += e * c * a, d.br.y += e * c * a, d.tl.y += e * c * a, d.tr.y += e * c * a, this.setTile(f, d)
	},
	startWithTarget: function(a) {
		cc.TiledGrid3DAction.prototype.startWithTarget.call(this, a);
		this._winSize = cc.director.getWinSizeInPixels()
	}
});
cc.splitCols = function(a, b) {
	return new cc.SplitCols(a, b)
};
cc.SplitCols.create = cc.splitCols;
cc.PageTurn3D = cc.Grid3DAction.extend({
	update: function(a) {
		var b = Math.max(0, a - 0.25),
			b = -100 - b * b * 500;
		a = -Math.PI / 2 * Math.sqrt(a);
		var c = +Math.PI / 2 + a;
		a = Math.sin(c);
		for (var c = Math.cos(c), d = this._gridSize, e = cc.p(0, 0), f = 0; f <= d.width; ++f)
			for (var g = 0; g <= d.height; ++g) {
				e.x = f;
				e.y = g;
				var h = this.originalVertex(e),
					k = Math.sqrt(h.x * h.x + (h.y - b) * (h.y - b)),
					m = k * a,
					n = Math.asin(h.x / k) / a,
					q = Math.cos(n);
				h.x = n <= Math.PI ? m * Math.sin(n) : 0;
				h.y = k + b - m * (1 - q) * a;
				h.z = m * (1 - q) * c / 7;
				0.5 > h.z && (h.z = 0.5);
				this.setVertex(e, h)
			}
	}
});
cc.pageTurn3D = function(a, b) {
	return new cc.PageTurn3D(a, b)
};
cc.PageTurn3D.create = cc.pageTurn3D;
cc.ProgressTimer = cc.Node.extend({
	_type: null,
	_percentage: 0,
	_sprite: null,
	_midPoint: null,
	_barChangeRate: null,
	_reverseDirection: !1,
	_className: "ProgressTimer",
	getMidpoint: function() {
		return cc.p(this._midPoint.x, this._midPoint.y)
	},
	setMidpoint: function(a) {
		this._midPoint = cc.pClamp(a, cc.p(0, 0), cc.p(1, 1))
	},
	getBarChangeRate: function() {
		return cc.p(this._barChangeRate.x, this._barChangeRate.y)
	},
	setBarChangeRate: function(a) {
		this._barChangeRate = cc.pClamp(a, cc.p(0, 0), cc.p(1, 1))
	},
	getType: function() {
		return this._type
	},
	getPercentage: function() {
		return this._percentage
	},
	getSprite: function() {
		return this._sprite
	},
	setPercentage: function(a) {
		this._percentage != a && (this._percentage = cc.clampf(a, 0, 100), this._updateProgress())
	},
	setOpacityModifyRGB: function(a) {},
	isOpacityModifyRGB: function() {
		return !1
	},
	isReverseDirection: function() {
		return this._reverseDirection
	},
	_boundaryTexCoord: function(a) {
		if (a < cc.ProgressTimer.TEXTURE_COORDS_COUNT) {
			var b = cc.ProgressTimer.TEXTURE_COORDS;
			return this._reverseDirection ? cc.p(b >> 7 - (a << 1) & 1, b >> 7 -
				((a << 1) + 1) & 1) : cc.p(b >> (a << 1) + 1 & 1, b >> (a << 1) & 1)
		}
		return cc.p(0, 0)
	},
	_origin: null,
	_startAngle: 270,
	_endAngle: 270,
	_radius: 0,
	_counterClockWise: !1,
	_barRect: null,
	_vertexDataCount: 0,
	_vertexData: null,
	_vertexArrayBuffer: null,
	_vertexWebGLBuffer: null,
	_vertexDataDirty: !1,
	ctor: null,
	_ctorForCanvas: function(a) {
		cc.Node.prototype.ctor.call(this);
		this._type = cc.ProgressTimer.TYPE_RADIAL;
		this._percentage = 0;
		this._midPoint = cc.p(0, 0);
		this._barChangeRate = cc.p(0, 0);
		this._reverseDirection = !1;
		this._sprite = null;
		this._origin = cc.p(0, 0);
		this._endAngle = this._startAngle = 270;
		this._radius = 0;
		this._counterClockWise = !1;
		this._barRect = cc.rect(0, 0, 0, 0);
		a && this._initWithSpriteForCanvas(a)
	},
	_ctorForWebGL: function(a) {
		cc.Node.prototype.ctor.call(this);
		this._type = cc.ProgressTimer.TYPE_RADIAL;
		this._percentage = 0;
		this._midPoint = cc.p(0, 0);
		this._barChangeRate = cc.p(0, 0);
		this._reverseDirection = !1;
		this._sprite = null;
		this._vertexWebGLBuffer = cc._renderContext.createBuffer();
		this._vertexDataCount = 0;
		this._vertexArrayBuffer = this._vertexData = null;
		this._vertexDataDirty = !1;
		a && this._initWithSpriteForWebGL(a)
	},
	setColor: function(a) {
		this._sprite.color = a;
		this._updateColor()
	},
	setOpacity: function(a) {
		this._sprite.opacity = a;
		this._updateColor()
	},
	getColor: function() {
		return this._sprite.color
	},
	getOpacity: function() {
		return this._sprite.opacity
	},
	setReverseProgress: null,
	_setReverseProgressForCanvas: function(a) {
		this._reverseDirection !== a && (this._reverseDirection = a)
	},
	_setReverseProgressForWebGL: function(a) {
		this._reverseDirection !== a && (this._reverseDirection = a, this._vertexArrayBuffer = this._vertexData = null, this._vertexDataCount = 0)
	},
	setSprite: null,
	_setSpriteForCanvas: function(a) {
		this._sprite != a && (this._sprite = a, this.width = this._sprite.width, this.height = this._sprite.height)
	},
	_setSpriteForWebGL: function(a) {
		a && this._sprite != a && (this._sprite = a, this.width = a.width, this.height = a.height, this._vertexData && (this._vertexArrayBuffer = this._vertexData = null, this._vertexDataCount = 0))
	},
	setType: null,
	_setTypeForCanvas: function(a) {
		a !== this._type && (this._type = a)
	},
	_setTypeForWebGL: function(a) {
		a !== this._type && (this._vertexData && (this._vertexArrayBuffer = this._vertexData = null, this._vertexDataCount = 0), this._type = a)
	},
	setReverseDirection: null,
	_setReverseDirectionForCanvas: function(a) {
		this._reverseDirection !== a && (this._reverseDirection = a)
	},
	_setReverseDirectionForWebGL: function(a) {
		this._reverseDirection !== a && (this._reverseDirection = a, this._vertexArrayBuffer = this._vertexData = null, this._vertexDataCount = 0)
	},
	_textureCoordFromAlphaPoint: function(a) {
		var b = this._sprite;
		if (!b) return {
			u: 0,
			v: 0
		};
		var c = b.quad,
			d = cc.p(c.bl.texCoords.u, c.bl.texCoords.v),
			c = cc.p(c.tr.texCoords.u, c.tr.texCoords.v);
		b.textureRectRotated && (b = a.x, a.x = a.y, a.y = b);
		return {
			u: d.x * (1 - a.x) + c.x * a.x,
			v: d.y * (1 - a.y) + c.y * a.y
		}
	},
	_vertexFromAlphaPoint: function(a) {
		if (!this._sprite) return {
			x: 0,
			y: 0
		};
		var b = this._sprite.quad,
			c = cc.p(b.bl.vertices.x, b.bl.vertices.y),
			b = cc.p(b.tr.vertices.x, b.tr.vertices.y);
		return {
			x: c.x * (1 - a.x) + b.x * a.x,
			y: c.y * (1 - a.y) + b.y * a.y
		}
	},
	initWithSprite: null,
	_initWithSpriteForCanvas: function(a) {
		this.percentage = 0;
		this.anchorY = this.anchorX = 0.5;
		this._type = cc.ProgressTimer.TYPE_RADIAL;
		this._reverseDirection = !1;
		this.midPoint = cc.p(0.5, 0.5);
		this.barChangeRate = cc.p(1, 1);
		this.sprite = a;
		return !0
	},
	_initWithSpriteForWebGL: function(a) {
		this.percentage = 0;
		this._vertexArrayBuffer = this._vertexData = null;
		this._vertexDataCount = 0;
		this.anchorY = this.anchorX = 0.5;
		this._type = cc.ProgressTimer.TYPE_RADIAL;
		this._reverseDirection = !1;
		this.midPoint = cc.p(0.5, 0.5);
		this.barChangeRate = cc.p(1, 1);
		this.sprite = a;
		this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
		return !0
	},
	draw: null,
	_drawForCanvas: function(a) {
		a = a || cc._renderContext;
		var b = this._sprite;
		"source" != b._blendFuncStr && (a.globalCompositeOperation = b._blendFuncStr);
		var c = cc.view.getScaleX(),
			d = cc.view.getScaleY();
		a.globalAlpha = b._displayedOpacity / 255;
		var e = b._rect,
			f = b._contentSize,
			g = b._offsetPosition,
			h = b._drawSize_Canvas,
			k = 0 | g.x,
			m = -g.y - e.height,
			n = b._textureRect_Canvas;
		h.width = e.width * c;
		h.height = e.height * d;
		a.save();
		b._flippedX && (k = -g.x - e.width, a.scale(-1, 1));
		b._flippedY && (m = g.y, a.scale(1, -1));
		k *= c;
		m *= d;
		this._type == cc.ProgressTimer.TYPE_BAR ? (e = this._barRect, a.beginPath(), a.rect(e.x * c, e.y * d, e.width * c, e.height * d), a.clip(), a.closePath()) : this._type == cc.ProgressTimer.TYPE_RADIAL && (e = this._origin.x * c, g = this._origin.y * d, a.beginPath(), a.arc(e, g, this._radius * d, Math.PI / 180 * this._startAngle, Math.PI / 180 * this._endAngle, this._counterClockWise), a.lineTo(e, g), a.clip(), a.closePath());
		b._texture && n.validRect ? (c = b._texture.getHtmlElementObj(), b._colorized ? a.drawImage(c, 0, 0, n.width, n.height, k, m, h.width, h.height) : a.drawImage(c, n.x, n.y, n.width, n.height, k, m, h.width, h.height)) : 0 !== f.width && (b = this.color, a.fillStyle = "rgba(" + b.r + "," + b.g + "," + b.b + ",1)", a.fillRect(k, m, f.width * c, f.height * d));
		a.restore();
		cc.incrementGLDraws(1)
	},
	_drawForWebGL: function(a) {
		a = a || cc._renderContext;
		if (this._vertexData && this._sprite) {
			cc.nodeDrawSetup(this);
			var b = this._sprite.getBlendFunc();
			cc.glBlendFunc(b.src, b.dst);
			cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
			cc.glBindTexture2D(this._sprite.texture);
			a.bindBuffer(a.ARRAY_BUFFER, this._vertexWebGLBuffer);
			this._vertexDataDirty && (a.bufferData(a.ARRAY_BUFFER, this._vertexArrayBuffer, a.DYNAMIC_DRAW), this._vertexDataDirty = !1);
			b = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
			a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, a.FLOAT, !1, b, 0);
			a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, b, 8);
			a.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, a.FLOAT, !1, b, 12);
			this._type === cc.ProgressTimer.TYPE_RADIAL ? a.drawArrays(a.TRIANGLE_FAN, 0, this._vertexDataCount) : this._type == cc.ProgressTimer.TYPE_BAR && (this._reverseDirection ? (a.drawArrays(a.TRIANGLE_STRIP, 0, this._vertexDataCount / 2), a.drawArrays(a.TRIANGLE_STRIP, 4, this._vertexDataCount / 2), cc.g_NumberOfDraws++) : a.drawArrays(a.TRIANGLE_STRIP, 0, this._vertexDataCount));
			cc.g_NumberOfDraws++
		}
	},
	_updateRadial: function() {
		if (this._sprite) {
			var a, b = this._midPoint;
			a = this._percentage / 100;
			var c = 2 * cc.PI * (this._reverseDirection ? a : 1 - a),
				d = cc.p(b.x, 1),
				e = cc.pRotateByAngle(d, b, c),
				c = 0;
			if (0 == a) e = d, c = 0;
			else if (1 == a) e = d, c = 4;
			else {
				var f = cc.FLT_MAX,
					g = cc.ProgressTimer.TEXTURE_COORDS_COUNT;
				for (a = 0; a <= g; ++a) {
					var h = (a + (g - 1)) % g,
						k = this._boundaryTexCoord(a % g),
						h = this._boundaryTexCoord(h);
					0 == a ? h = cc.pLerp(k, h, 1 - b.x) : 4 == a && (k = cc.pLerp(k, h, 1 - b.x));
					var m = cc.p(0, 0);
					cc.pLineIntersect(k, h, b, e, m) && (0 != a && 4 != a || 0 <= m.x && 1 >= m.x) && 0 <= m.y && m.y < f && (f = m.y, c = a)
				}
				e = cc.pAdd(b, cc.pMult(cc.pSub(e, b), f))
			}
			f = !0;
			this._vertexDataCount != c + 3 && (f = !1, this._vertexArrayBuffer = this._vertexData = null, this._vertexDataCount = 0);
			if (!this._vertexData) {
				g = this._vertexDataCount = c + 3;
				k = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
				this._vertexArrayBuffer = new ArrayBuffer(g * k);
				h = [];
				for (a = 0; a < g; a++) h[a] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, a * k);
				this._vertexData = h;
				if (!this._vertexData) {
					cc.log("cc.ProgressTimer._updateRadial() : Not enough memory");
					return
				}
			}
			this._updateColor();
			g = this._vertexData;
			if (!f)
				for (g[0].texCoords = this._textureCoordFromAlphaPoint(b), g[0].vertices = this._vertexFromAlphaPoint(b), g[1].texCoords = this._textureCoordFromAlphaPoint(d), g[1].vertices = this._vertexFromAlphaPoint(d), a = 0; a < c; a++) b = this._boundaryTexCoord(a), g[a + 2].texCoords = this._textureCoordFromAlphaPoint(b), g[a + 2].vertices = this._vertexFromAlphaPoint(b);
			g[this._vertexDataCount - 1].texCoords = this._textureCoordFromAlphaPoint(e);
			g[this._vertexDataCount - 1].vertices = this._vertexFromAlphaPoint(e)
		}
	},
	_updateBar: function() {
		if (this._sprite) {
			var a, b = this._percentage / 100,
				c = this._barChangeRate,
				c = cc.pMult(cc.p(1 - c.x + b * c.x, 1 - c.y + b * c.y), 0.5),
				b = cc.pSub(this._midPoint, c),
				c = cc.pAdd(this._midPoint, c);
			0 > b.x && (c.x += -b.x, b.x = 0);
			1 < c.x && (b.x -= c.x - 1, c.x = 1);
			0 > b.y && (c.y += -b.y, b.y = 0);
			1 < c.y && (b.y -= c.y - 1, c.y = 1);
			if (this._reverseDirection) {
				if (!this._vertexData) {
					this._vertexDataCount = 8;
					var d = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
					this._vertexArrayBuffer = new ArrayBuffer(8 * d);
					var e = [];
					for (a = 0; 8 > a; a++) e[a] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, a * d);
					e[0].texCoords = this._textureCoordFromAlphaPoint(cc.p(0, 1));
					e[0].vertices = this._vertexFromAlphaPoint(cc.p(0, 1));
					e[1].texCoords = this._textureCoordFromAlphaPoint(cc.p(0, 0));
					e[1].vertices = this._vertexFromAlphaPoint(cc.p(0, 0));
					e[6].texCoords = this._textureCoordFromAlphaPoint(cc.p(1, 1));
					e[6].vertices = this._vertexFromAlphaPoint(cc.p(1, 1));
					e[7].texCoords = this._textureCoordFromAlphaPoint(cc.p(1, 0));
					e[7].vertices = this._vertexFromAlphaPoint(cc.p(1, 0));
					this._vertexData = e
				}
				a = this._vertexData;
				a[2].texCoords = this._textureCoordFromAlphaPoint(cc.p(b.x, c.y));
				a[2].vertices = this._vertexFromAlphaPoint(cc.p(b.x, c.y));
				a[3].texCoords = this._textureCoordFromAlphaPoint(cc.p(b.x, b.y));
				a[3].vertices = this._vertexFromAlphaPoint(cc.p(b.x, b.y));
				a[4].texCoords = this._textureCoordFromAlphaPoint(cc.p(c.x, c.y));
				a[4].vertices = this._vertexFromAlphaPoint(cc.p(c.x, c.y));
				a[5].texCoords = this._textureCoordFromAlphaPoint(cc.p(c.x, b.y));
				a[5].vertices = this._vertexFromAlphaPoint(cc.p(c.x, b.y))
			} else {
				if (!this._vertexData)
					for (this._vertexDataCount = 4, d = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT, this._vertexArrayBuffer = new ArrayBuffer(4 * d), this._vertexData = [], a = 0; 4 > a; a++) this._vertexData[a] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, a * d);
				a = this._vertexData;
				a[0].texCoords = this._textureCoordFromAlphaPoint(cc.p(b.x, c.y));
				a[0].vertices = this._vertexFromAlphaPoint(cc.p(b.x, c.y));
				a[1].texCoords = this._textureCoordFromAlphaPoint(cc.p(b.x, b.y));
				a[1].vertices = this._vertexFromAlphaPoint(cc.p(b.x, b.y));
				a[2].texCoords = this._textureCoordFromAlphaPoint(cc.p(c.x, c.y));
				a[2].vertices = this._vertexFromAlphaPoint(cc.p(c.x, c.y));
				a[3].texCoords = this._textureCoordFromAlphaPoint(cc.p(c.x, b.y));
				a[3].vertices = this._vertexFromAlphaPoint(cc.p(c.x, b.y))
			}
			this._updateColor()
		}
	},
	_updateColor: function() {
		if (this._sprite && this._vertexData) {
			for (var a = this._sprite.quad.tl.colors, b = this._vertexData, c = 0, d = this._vertexDataCount; c < d; ++c) b[c].colors = a;
			this._vertexDataDirty = !0
		}
	},
	_updateProgress: null,
	_updateProgressForCanvas: function() {
		var a = this._sprite,
			b = a.width,
			c = a.height,
			d = this._midPoint;
		if (this._type == cc.ProgressTimer.TYPE_RADIAL) {
			this._radius = Math.round(Math.sqrt(b * b + c * c));
			var e, f = !1,
				g = this._origin;
			g.x = b * d.x;
			g.y = -c * d.y;
			this._reverseDirection ? (e = 270, d = 270 - 3.6 * this._percentage) : (d = -90, e = -90 + 3.6 * this._percentage);
			a._flippedX && (g.x -= 2 * b * this._midPoint.x, d = -d - 180, e = -e - 180, f = !f);
			a._flippedY && (g.y += 2 * c * this._midPoint.y, f = !f, d = -d, e = -e);
			this._startAngle = d;
			this._endAngle = e;
			this._counterClockWise = f
		} else {
			e = this._barChangeRate;
			g = this._percentage / 100;
			f = this._barRect;
			e = cc.size(b * (1 - e.x), c * (1 - e.y));
			var g = cc.size((b - e.width) * g, (c - e.height) * g),
				g = cc.size(e.width + g.width, e.height + g.height),
				h = cc.p(b * d.x, c * d.y);
			e = h.x - g.width / 2;
			0.5 < d.x && g.width / 2 >= b - h.x && (e = b - g.width);
			b = h.y - g.height / 2;
			0.5 < d.y && g.height / 2 >= c - h.y && (b = c - g.height);
			f.x = 0;
			c = 1;
			a._flippedX && (f.x -= g.width, c = -1);
			0 < e && (f.x += e * c);
			f.y = 0;
			c = 1;
			a._flippedY && (f.y += g.height, c = -1);
			0 < b && (f.y -= b * c);
			f.width = g.width;
			f.height = -g.height
		}
	},
	_updateProgressForWebGL: function() {
		var a = this._type;
		a === cc.ProgressTimer.TYPE_RADIAL ? this._updateRadial() : a === cc.ProgressTimer.TYPE_BAR && this._updateBar();
		this._vertexDataDirty = !0
	}
});
_p = cc.ProgressTimer.prototype;
cc._renderType == cc._RENDER_TYPE_WEBGL ? (_p.ctor = _p._ctorForWebGL, _p.setReverseProgress = _p._setReverseProgressForWebGL, _p.setSprite = _p._setSpriteForWebGL, _p.setType = _p._setTypeForWebGL, _p.setReverseDirection = _p._setReverseDirectionForWebGL, _p.initWithSprite = _p._initWithSpriteForWebGL, _p.draw = _p._drawForWebGL, _p._updateProgress = _p._updateProgressForWebGL) : (_p.ctor = _p._ctorForCanvas, _p.setReverseProgress = _p._setReverseProgressForCanvas, _p.setSprite = _p._setSpriteForCanvas, _p.setType = _p._setTypeForCanvas, _p.setReverseDirection = _p._setReverseDirectionForCanvas, _p.initWithSprite = _p._initWithSpriteForCanvas, _p.draw = _p._drawForCanvas, _p._updateProgress = cc.ProgressTimer.prototype._updateProgressForCanvas);
cc.defineGetterSetter(_p, "midPoint", _p.getMidpoint, _p.setMidpoint);
cc.defineGetterSetter(_p, "barChangeRate", _p.getBarChangeRate, _p.setBarChangeRate);
cc.defineGetterSetter(_p, "type", _p.getType, _p.setType);
cc.defineGetterSetter(_p, "percentage", _p.getPercentage, _p.setPercentage);
cc.defineGetterSetter(_p, "sprite", _p.getSprite, _p.setSprite);
cc.defineGetterSetter(_p, "reverseDir", _p.isReverseDirection, _p.setReverseDirection);
cc.ProgressTimer.create = function(a) {
	return new cc.ProgressTimer(a)
};
cc.ProgressTimer.TEXTURE_COORDS_COUNT = 4;
cc.ProgressTimer.TEXTURE_COORDS = 75;
cc.ProgressTimer.TYPE_RADIAL = 0;
cc.ProgressTimer.TYPE_BAR = 1;
cc.ProgressTo = cc.ActionInterval.extend({
	_to: 0,
	_from: 0,
	ctor: function(a, b) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._from = this._to = 0;
		void 0 !== b && this.initWithDuration(a, b)
	},
	initWithDuration: function(a, b) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._to = b, !0) : !1
	},
	clone: function() {
		var a = new cc.ProgressTo;
		a.initWithDuration(this._duration, this._to);
		return a
	},
	reverse: function() {
		cc.log("cc.ProgressTo.reverse(): reverse hasn't been supported.");
		return null
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a);
		this._from = a.percentage;
		100 == this._from && (this._from = 0)
	},
	update: function(a) {
		this.target instanceof cc.ProgressTimer && (this.target.percentage = this._from + (this._to - this._from) * a)
	}
});
cc.progressTo = function(a, b) {
	return new cc.ProgressTo(a, b)
};
cc.ProgressTo.create = cc.progressTo;
cc.ProgressFromTo = cc.ActionInterval.extend({
	_to: 0,
	_from: 0,
	ctor: function(a, b, c) {
		cc.ActionInterval.prototype.ctor.call(this);
		this._from = this._to = 0;
		void 0 !== c && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		return cc.ActionInterval.prototype.initWithDuration.call(this, a) ? (this._to = c, this._from = b, !0) : !1
	},
	clone: function() {
		var a = new cc.ProgressFromTo;
		a.initWithDuration(this._duration, this._from, this._to);
		return a
	},
	reverse: function() {
		return cc.progressFromTo(this._duration, this._to, this._from)
	},
	startWithTarget: function(a) {
		cc.ActionInterval.prototype.startWithTarget.call(this, a)
	},
	update: function(a) {
		this.target instanceof cc.ProgressTimer && (this.target.percentage = this._from + (this._to - this._from) * a)
	}
});
cc.progressFromTo = function(a, b, c) {
	return new cc.ProgressFromTo(a, b, c)
};
cc.ProgressFromTo.create = cc.progressFromTo;
cc.SCENE_FADE = 4208917214;
cc.TRANSITION_ORIENTATION_LEFT_OVER = 0;
cc.TRANSITION_ORIENTATION_RIGHT_OVER = 1;
cc.TRANSITION_ORIENTATION_UP_OVER = 0;
cc.TRANSITION_ORIENTATION_DOWN_OVER = 1;
cc.TransitionScene = cc.Scene.extend({
	_inScene: null,
	_outScene: null,
	_duration: null,
	_isInSceneOnTop: !1,
	_isSendCleanupToScene: !1,
	_className: "TransitionScene",
	ctor: function(a, b) {
		cc.Scene.prototype.ctor.call(this);
		void 0 !== a && void 0 !== b && this.initWithDuration(a, b)
	},
	_setNewScene: function(a) {
		this.unschedule(this._setNewScene);
		a = cc.director;
		this._isSendCleanupToScene = a.isSendCleanupToScene();
		a.runScene(this._inScene);
		cc.eventManager.setEnabled(!0);
		this._outScene.visible = !0
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = !0
	},
	draw: function() {
		this._isInSceneOnTop ? (this._outScene.visit(), this._inScene.visit()) : (this._inScene.visit(), this._outScene.visit())
	},
	onEnter: function() {
		cc.Node.prototype.onEnter.call(this);
		cc.eventManager.setEnabled(!1);
		this._outScene.onExitTransitionDidStart();
		this._inScene.onEnter()
	},
	onExit: function() {
		cc.Node.prototype.onExit.call(this);
		cc.eventManager.setEnabled(!0);
		this._outScene.onExit();
		this._inScene.onEnterTransitionDidFinish()
	},
	cleanup: function() {
		cc.Node.prototype.cleanup.call(this);
		this._isSendCleanupToScene && this._outScene.cleanup()
	},
	initWithDuration: function(a, b) {
		if (!b) throw "cc.TransitionScene.initWithDuration(): Argument scene must be non-nil";
		if (this.init()) {
			this._duration = a;
			this.attr({
				x: 0,
				y: 0,
				anchorX: 0,
				anchorY: 0
			});
			this._inScene = b;
			this._outScene = cc.director.getRunningScene();
			this._outScene || (this._outScene = cc.Scene.create(), this._outScene.init());
			if (this._inScene == this._outScene) throw "cc.TransitionScene.initWithDuration(): Incoming scene must be different from the outgoing scene";
			this._sceneOrder();
			return !0
		}
		return !1
	},
	finish: function() {
		this._inScene.attr({
			visible: !0,
			x: 0,
			y: 0,
			scale: 1,
			rotation: 0
		});
		cc._renderType === cc._RENDER_TYPE_WEBGL && this._inScene.getCamera().restore();
		this._outScene.attr({
			visible: !1,
			x: 0,
			y: 0,
			scale: 1,
			rotation: 0
		});
		cc._renderType === cc._RENDER_TYPE_WEBGL && this._outScene.getCamera().restore();
		this.schedule(this._setNewScene, 0)
	},
	hideOutShowIn: function() {
		this._inScene.visible = !0;
		this._outScene.visible = !1
	}
});
cc.TransitionScene.create = function(a, b) {
	return new cc.TransitionScene(a, b)
};
cc.TransitionSceneOriented = cc.TransitionScene.extend({
	_orientation: 0,
	ctor: function(a, b, c) {
		cc.TransitionScene.prototype.ctor.call(this);
		void 0 != c && this.initWithDuration(a, b, c)
	},
	initWithDuration: function(a, b, c) {
		cc.TransitionScene.prototype.initWithDuration.call(this, a, b) && (this._orientation = c);
		return !0
	}
});
cc.TransitionSceneOriented.create = function(a, b, c) {
	return new cc.TransitionSceneOriented(a, b, c)
};
cc.TransitionRotoZoom = cc.TransitionScene.extend({
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		this._inScene.attr({
			scale: 0.001,
			anchorX: 0.5,
			anchorY: 0.5
		});
		this._outScene.attr({
			scale: 1,
			anchorX: 0.5,
			anchorY: 0.5
		});
		var a = cc.sequence(cc.spawn(cc.scaleBy(this._duration / 2, 0.001), cc.rotateBy(this._duration / 2, 720)), cc.delayTime(this._duration / 2));
		this._outScene.runAction(a);
		this._inScene.runAction(cc.sequence(a.reverse(), cc.callFunc(this.finish, this)))
	}
});
cc.TransitionRotoZoom.create = function(a, b) {
	return new cc.TransitionRotoZoom(a, b)
};
cc.TransitionJumpZoom = cc.TransitionScene.extend({
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a = cc.director.getWinSize();
		this._inScene.attr({
			scale: 0.5,
			x: a.width,
			y: 0,
			anchorX: 0.5,
			anchorY: 0.5
		});
		this._outScene.anchorX = 0.5;
		this._outScene.anchorY = 0.5;
		var b = cc.jumpBy(this._duration / 4, cc.p(-a.width, 0), a.width / 4, 2),
			c = cc.scaleTo(this._duration / 4, 1),
			a = cc.scaleTo(this._duration / 4, 0.5),
			a = cc.sequence(a, b),
			b = cc.sequence(b, c),
			c = cc.delayTime(this._duration / 2);
		this._outScene.runAction(a);
		this._inScene.runAction(cc.sequence(c, b, cc.callFunc(this.finish, this)))
	}
});
cc.TransitionJumpZoom.create = function(a, b) {
	return new cc.TransitionJumpZoom(a, b)
};
cc.TransitionMoveInL = cc.TransitionScene.extend({
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		this.initScenes();
		var a = this.action();
		this._inScene.runAction(cc.sequence(this.easeActionWithAction(a), cc.callFunc(this.finish, this)))
	},
	initScenes: function() {
		this._inScene.setPosition(-cc.director.getWinSize().width, 0)
	},
	action: function() {
		return cc.moveTo(this._duration, cc.p(0, 0))
	},
	easeActionWithAction: function(a) {
		return new cc.EaseOut(a, 2)
	}
});
cc.TransitionMoveInL.create = function(a, b) {
	return new cc.TransitionMoveInL(a, b)
};
cc.TransitionMoveInR = cc.TransitionMoveInL.extend({
	ctor: function(a, b) {
		cc.TransitionMoveInL.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	initScenes: function() {
		this._inScene.setPosition(cc.director.getWinSize().width, 0)
	}
});
cc.TransitionMoveInR.create = function(a, b) {
	return new cc.TransitionMoveInR(a, b)
};
cc.TransitionMoveInT = cc.TransitionMoveInL.extend({
	ctor: function(a, b) {
		cc.TransitionMoveInL.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	initScenes: function() {
		this._inScene.setPosition(0, cc.director.getWinSize().height)
	}
});
cc.TransitionMoveInT.create = function(a, b) {
	return new cc.TransitionMoveInT(a, b)
};
cc.TransitionMoveInB = cc.TransitionMoveInL.extend({
	ctor: function(a, b) {
		cc.TransitionMoveInL.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	initScenes: function() {
		this._inScene.setPosition(0, -cc.director.getWinSize().height)
	}
});
cc.TransitionMoveInB.create = function(a, b) {
	return new cc.TransitionMoveInB(a, b)
};
cc.ADJUST_FACTOR = 0.5;
cc.TransitionSlideInL = cc.TransitionScene.extend({
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = !1
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		this.initScenes();
		var a = this.action(),
			b = this.action(),
			a = this.easeActionWithAction(a),
			b = cc.sequence(this.easeActionWithAction(b), cc.callFunc(this.finish, this));
		this._inScene.runAction(a);
		this._outScene.runAction(b)
	},
	initScenes: function() {
		this._inScene.setPosition(-cc.director.getWinSize().width +
			cc.ADJUST_FACTOR, 0)
	},
	action: function() {
		return cc.moveBy(this._duration, cc.p(cc.director.getWinSize().width - cc.ADJUST_FACTOR, 0))
	},
	easeActionWithAction: function(a) {
		return new cc.EaseInOut(a, 2)
	}
});
cc.TransitionSlideInL.create = function(a, b) {
	return new cc.TransitionSlideInL(a, b)
};
cc.TransitionSlideInR = cc.TransitionSlideInL.extend({
	ctor: function(a, b) {
		cc.TransitionSlideInL.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = !0
	},
	initScenes: function() {
		this._inScene.setPosition(cc.director.getWinSize().width - cc.ADJUST_FACTOR, 0)
	},
	action: function() {
		return cc.moveBy(this._duration, cc.p(-(cc.director.getWinSize().width - cc.ADJUST_FACTOR), 0))
	}
});
cc.TransitionSlideInR.create = function(a, b) {
	return new cc.TransitionSlideInR(a, b)
};
cc.TransitionSlideInB = cc.TransitionSlideInL.extend({
	ctor: function(a, b) {
		cc.TransitionSlideInL.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = !1
	},
	initScenes: function() {
		this._inScene.setPosition(0, -(cc.director.getWinSize().height - cc.ADJUST_FACTOR))
	},
	action: function() {
		return cc.moveBy(this._duration, cc.p(0, cc.director.getWinSize().height - cc.ADJUST_FACTOR))
	}
});
cc.TransitionSlideInB.create = function(a, b) {
	return new cc.TransitionSlideInB(a, b)
};
cc.TransitionSlideInT = cc.TransitionSlideInL.extend({
	ctor: function(a, b) {
		cc.TransitionSlideInL.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = !0
	},
	initScenes: function() {
		this._inScene.setPosition(0, cc.director.getWinSize().height - cc.ADJUST_FACTOR)
	},
	action: function() {
		return cc.moveBy(this._duration, cc.p(0, -(cc.director.getWinSize().height - cc.ADJUST_FACTOR)))
	}
});
cc.TransitionSlideInT.create = function(a, b) {
	return new cc.TransitionSlideInT(a, b)
};
cc.TransitionShrinkGrow = cc.TransitionScene.extend({
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		this._inScene.attr({
			scale: 0.001,
			anchorX: 2 / 3,
			anchorY: 0.5
		});
		this._outScene.attr({
			scale: 1,
			anchorX: 1 / 3,
			anchorY: 0.5
		});
		var a = cc.scaleTo(this._duration, 0.01),
			b = cc.scaleTo(this._duration, 1);
		this._inScene.runAction(this.easeActionWithAction(b));
		this._outScene.runAction(cc.sequence(this.easeActionWithAction(a), cc.callFunc(this.finish, this)))
	},
	easeActionWithAction: function(a) {
		return new cc.EaseOut(a, 2)
	}
});
cc.TransitionShrinkGrow.create = function(a, b) {
	return new cc.TransitionShrinkGrow(a, b)
};
cc.TransitionFlipX = cc.TransitionSceneOriented.extend({
	ctor: function(a, b, c) {
		cc.TransitionSceneOriented.prototype.ctor.call(this);
		c = c || cc.TRANSITION_ORIENTATION_RIGHT_OVER;
		b && this.initWithDuration(a, b, c)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a, b;
		this._inScene.visible = !1;
		var c;
		this._orientation === cc.TRANSITION_ORIENTATION_RIGHT_OVER ? (a = 90, c = 270, b = 90) : (a = -90, c = 90, b = -90);
		a = cc.sequence(cc.delayTime(this._duration / 2), cc.show(), cc.orbitCamera(this._duration / 2, 1, 0, c, a, 0, 0), cc.callFunc(this.finish, this));
		b = cc.sequence(cc.orbitCamera(this._duration / 2, 1, 0, 0, b, 0, 0), cc.hide(), cc.delayTime(this._duration / 2));
		this._inScene.runAction(a);
		this._outScene.runAction(b)
	}
});
cc.TransitionFlipX.create = function(a, b, c) {
	return new cc.TransitionFlipX(a, b, c)
};
cc.TransitionFlipY = cc.TransitionSceneOriented.extend({
	ctor: function(a, b, c) {
		cc.TransitionSceneOriented.prototype.ctor.call(this);
		c = c || cc.TRANSITION_ORIENTATION_UP_OVER;
		b && this.initWithDuration(a, b, c)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a, b;
		this._inScene.visible = !1;
		var c;
		this._orientation == cc.TRANSITION_ORIENTATION_UP_OVER ? (a = 90, c = 270, b = 90) : (a = -90, c = 90, b = -90);
		a = cc.Sequence.create(cc.DelayTime.create(this._duration / 2), cc.Show.create(), cc.OrbitCamera.create(this._duration / 2, 1, 0, c, a, 90, 0), cc.CallFunc.create(this.finish, this));
		b = cc.Sequence.create(cc.OrbitCamera.create(this._duration / 2, 1, 0, 0, b, 90, 0), cc.Hide.create(), cc.DelayTime.create(this._duration / 2));
		this._inScene.runAction(a);
		this._outScene.runAction(b)
	}
});
cc.TransitionFlipY.create = function(a, b, c) {
	return new cc.TransitionFlipY(a, b, c)
};
cc.TransitionFlipAngular = cc.TransitionSceneOriented.extend({
	ctor: function(a, b, c) {
		cc.TransitionSceneOriented.prototype.ctor.call(this);
		c = c || cc.TRANSITION_ORIENTATION_RIGHT_OVER;
		b && this.initWithDuration(a, b, c)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a, b;
		this._inScene.visible = !1;
		var c;
		this._orientation === cc.TRANSITION_ORIENTATION_RIGHT_OVER ? (a = 90, c = 270, b = 90) : (a = -90, c = 90, b = -90);
		a = cc.sequence(cc.delayTime(this._duration / 2), cc.show(), cc.orbitCamera(this._duration / 2, 1, 0, c, a, -45, 0), cc.callFunc(this.finish, this));
		b = cc.sequence(cc.orbitCamera(this._duration / 2, 1, 0, 0, b, 45, 0), cc.hide(), cc.delayTime(this._duration / 2));
		this._inScene.runAction(a);
		this._outScene.runAction(b)
	}
});
cc.TransitionFlipAngular.create = function(a, b, c) {
	return new cc.TransitionFlipAngular(a, b, c)
};
cc.TransitionZoomFlipX = cc.TransitionSceneOriented.extend({
	ctor: function(a, b, c) {
		cc.TransitionSceneOriented.prototype.ctor.call(this);
		c = c || cc.TRANSITION_ORIENTATION_RIGHT_OVER;
		b && this.initWithDuration(a, b, c)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a, b;
		this._inScene.visible = !1;
		var c;
		this._orientation === cc.TRANSITION_ORIENTATION_RIGHT_OVER ? (a = 90, c = 270, b = 90) : (a = -90, c = 90, b = -90);
		a = cc.sequence(cc.delayTime(this._duration / 2), cc.spawn(cc.orbitCamera(this._duration / 2, 1, 0, c, a, 0, 0), cc.scaleTo(this._duration / 2, 1), cc.show()), cc.callFunc(this.finish, this));
		b = cc.sequence(cc.spawn(cc.orbitCamera(this._duration / 2, 1, 0, 0, b, 0, 0), cc.scaleTo(this._duration / 2, 0.5)), cc.hide(), cc.delayTime(this._duration / 2));
		this._inScene.scale = 0.5;
		this._inScene.runAction(a);
		this._outScene.runAction(b)
	}
});
cc.TransitionZoomFlipX.create = function(a, b, c) {
	return new cc.TransitionZoomFlipX(a, b, c)
};
cc.TransitionZoomFlipY = cc.TransitionSceneOriented.extend({
	ctor: function(a, b, c) {
		cc.TransitionSceneOriented.prototype.ctor.call(this);
		c = c || cc.TRANSITION_ORIENTATION_UP_OVER;
		b && this.initWithDuration(a, b, c)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a, b;
		this._inScene.visible = !1;
		var c;
		this._orientation === cc.TRANSITION_ORIENTATION_UP_OVER ? (a = 90, c = 270, b = 90) : (a = -90, c = 90, b = -90);
		a = cc.sequence(cc.delayTime(this._duration / 2), cc.spawn(cc.orbitCamera(this._duration / 2, 1, 0, c, a, 90, 0), cc.scaleTo(this._duration / 2, 1), cc.show()), cc.callFunc(this.finish, this));
		b = cc.sequence(cc.spawn(cc.orbitCamera(this._duration / 2, 1, 0, 0, b, 90, 0), cc.scaleTo(this._duration / 2, 0.5)), cc.hide(), cc.delayTime(this._duration / 2));
		this._inScene.scale = 0.5;
		this._inScene.runAction(a);
		this._outScene.runAction(b)
	}
});
cc.TransitionZoomFlipY.create = function(a, b, c) {
	return new cc.TransitionZoomFlipY(a, b, c)
};
cc.TransitionZoomFlipAngular = cc.TransitionSceneOriented.extend({
	ctor: function(a, b, c) {
		cc.TransitionSceneOriented.prototype.ctor.call(this);
		c = c || cc.TRANSITION_ORIENTATION_RIGHT_OVER;
		b && this.initWithDuration(a, b, c)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a, b;
		this._inScene.visible = !1;
		var c;
		this._orientation === cc.TRANSITION_ORIENTATION_RIGHT_OVER ? (a = 90, c = 270, b = 90) : (a = -90, c = 90, b = -90);
		a = cc.sequence(cc.delayTime(this._duration / 2), cc.spawn(cc.orbitCamera(this._duration / 2, 1, 0, c, a, -45, 0), cc.scaleTo(this._duration / 2, 1), cc.show()), cc.show(), cc.callFunc(this.finish, this));
		b = cc.sequence(cc.spawn(cc.orbitCamera(this._duration / 2, 1, 0, 0, b, 45, 0), cc.scaleTo(this._duration / 2, 0.5)), cc.hide(), cc.delayTime(this._duration / 2));
		this._inScene.scale = 0.5;
		this._inScene.runAction(a);
		this._outScene.runAction(b)
	}
});
cc.TransitionZoomFlipAngular.create = function(a, b, c) {
	return new cc.TransitionZoomFlipAngular(a, b, c)
};
cc.TransitionFade = cc.TransitionScene.extend({
	_color: null,
	ctor: function(a, b, c) {
		cc.TransitionScene.prototype.ctor.call(this);
		this._color = cc.color();
		b && this.initWithDuration(a, b, c)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a = new cc.LayerColor(this._color);
		this._inScene.visible = !1;
		this.addChild(a, 2, cc.SCENE_FADE);
		var a = this.getChildByTag(cc.SCENE_FADE),
			b = cc.sequence(cc.fadeIn(this._duration / 2), cc.callFunc(this.hideOutShowIn, this), cc.fadeOut(this._duration / 2), cc.callFunc(this.finish, this));
		a.runAction(b)
	},
	onExit: function() {
		cc.TransitionScene.prototype.onExit.call(this);
		this.removeChildByTag(cc.SCENE_FADE, !1)
	},
	initWithDuration: function(a, b, c) {
		c = c || cc.color.BLACK;
		cc.TransitionScene.prototype.initWithDuration.call(this, a, b) && (this._color.r = c.r, this._color.g = c.g, this._color.b = c.b, this._color.a = 0);
		return !0
	}
});
cc.TransitionFade.create = function(a, b, c) {
	return new cc.TransitionFade(a, b, c)
};
cc.TransitionCrossFade = cc.TransitionScene.extend({
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a = cc.color(0, 0, 0, 0),
			b = cc.director.getWinSize(),
			a = cc.LayerColor.create(a),
			c = cc.RenderTexture.create(b.width, b.height);
		if (null != c) {
			c.sprite.anchorX = 0.5;
			c.sprite.anchorY = 0.5;
			c.attr({
				x: b.width / 2,
				y: b.height / 2,
				anchorX: 0.5,
				anchorY: 0.5
			});
			c.begin();
			this._inScene.visit();
			c.end();
			var d = cc.RenderTexture.create(b.width, b.height);
			d.setPosition(b.width / 2, b.height / 2);
			d.sprite.anchorX = d.anchorX = 0.5;
			d.sprite.anchorY = d.anchorY = 0.5;
			d.begin();
			this._outScene.visit();
			d.end();
			c.sprite.setBlendFunc(cc.ONE, cc.ONE);
			d.sprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
			a.addChild(c);
			a.addChild(d);
			c.sprite.opacity = 255;
			d.sprite.opacity = 255;
			b = cc.sequence(cc.fadeTo(this._duration, 0), cc.callFunc(this.hideOutShowIn, this), cc.callFunc(this.finish, this));
			d.sprite.runAction(b);
			this.addChild(a, 2, cc.SCENE_FADE)
		}
	},
	onExit: function() {
		this.removeChildByTag(cc.SCENE_FADE, !1);
		cc.TransitionScene.prototype.onExit.call(this)
	},
	draw: function() {}
});
cc.TransitionCrossFade.create = function(a, b) {
	return new cc.TransitionCrossFade(a, b)
};
cc.TransitionTurnOffTiles = cc.TransitionScene.extend({
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = !1
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a = cc.director.getWinSize(),
			a = cc.turnOffTiles(this._duration, cc.size(0 | a.width / a.height * 12, 12)),
			a = this.easeActionWithAction(a);
		this._outScene.runAction(cc.sequence(a, cc.callFunc(this.finish, this), cc.stopGrid()))
	},
	easeActionWithAction: function(a) {
		return a
	}
});
cc.TransitionTurnOffTiles.create = function(a, b) {
	return new cc.TransitionTurnOffTiles(a, b)
};
cc.TransitionSplitCols = cc.TransitionScene.extend({
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		this._inScene.visible = !1;
		var a = this.action(),
			a = cc.sequence(a, cc.callFunc(this.hideOutShowIn, this), a.reverse());
		this.runAction(cc.sequence(this.easeActionWithAction(a), cc.callFunc(this.finish, this), cc.stopGrid()))
	},
	easeActionWithAction: function(a) {
		return new cc.EaseInOut(a, 3)
	},
	action: function() {
		return cc.splitCols(this._duration / 2, 3)
	}
});
cc.TransitionSplitCols.create = function(a, b) {
	return new cc.TransitionSplitCols(a, b)
};
cc.TransitionSplitRows = cc.TransitionSplitCols.extend({
	ctor: function(a, b) {
		cc.TransitionSplitCols.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	action: function() {
		return cc.splitRows(this._duration / 2, 3)
	}
});
cc.TransitionSplitRows.create = function(a, b) {
	return new cc.TransitionSplitRows(a, b)
};
cc.TransitionFadeTR = cc.TransitionScene.extend({
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = !1
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a = cc.director.getWinSize(),
			a = this.actionWithSize(cc.size(0 | a.width / a.height * 12, 12));
		this._outScene.runAction(cc.Sequence.create(this.easeActionWithAction(a), cc.CallFunc.create(this.finish, this), cc.StopGrid.create()))
	},
	easeActionWithAction: function(a) {
		return a
	},
	actionWithSize: function(a) {
		return cc.fadeOutTRTiles(this._duration, a)
	}
});
cc.TransitionFadeTR.create = function(a, b) {
	return new cc.TransitionFadeTR(a, b)
};
cc.TransitionFadeBL = cc.TransitionFadeTR.extend({
	ctor: function(a, b) {
		cc.TransitionFadeTR.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	actionWithSize: function(a) {
		return cc.fadeOutBLTiles(this._duration, a)
	}
});
cc.TransitionFadeBL.create = function(a, b) {
	return new cc.TransitionFadeBL(a, b)
};
cc.TransitionFadeUp = cc.TransitionFadeTR.extend({
	ctor: function(a, b) {
		cc.TransitionFadeTR.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	actionWithSize: function(a) {
		return new cc.FadeOutUpTiles(this._duration, a)
	}
});
cc.TransitionFadeUp.create = function(a, b) {
	return new cc.TransitionFadeUp(a, b)
};
cc.TransitionFadeDown = cc.TransitionFadeTR.extend({
	ctor: function(a, b) {
		cc.TransitionFadeTR.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	actionWithSize: function(a) {
		return cc.fadeOutDownTiles(this._duration, a)
	}
});
cc.TransitionFadeDown.create = function(a, b) {
	return new cc.TransitionFadeDown(a, b)
};
cc.SCENE_RADIAL = 49153;
cc.TransitionProgress = cc.TransitionScene.extend({
	_to: 0,
	_from: 0,
	_sceneToBeModified: null,
	_className: "TransitionProgress",
	ctor: function(a, b) {
		cc.TransitionScene.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_setAttrs: function(a, b, c) {
		a.attr({
			x: b,
			y: c,
			anchorX: 0.5,
			anchorY: 0.5
		})
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		this._setupTransition();
		var a = cc.director.getWinSize(),
			b = cc.RenderTexture.create(a.width, a.height);
		b.sprite.anchorX = 0.5;
		b.sprite.anchorY = 0.5;
		this._setAttrs(b, a.width / 2, a.height / 2);
		b.clear(0, 0, 0, 1);
		b.begin();
		this._sceneToBeModified.visit();
		b.end();
		this._sceneToBeModified == this._outScene && this.hideOutShowIn();
		a = this._progressTimerNodeWithRenderTexture(b);
		b = cc.sequence(cc.progressFromTo(this._duration, this._from, this._to), cc.callFunc(this.finish, this));
		a.runAction(b);
		this.addChild(a, 2, cc.SCENE_RADIAL)
	},
	onExit: function() {
		this.removeChildByTag(cc.SCENE_RADIAL, !0);
		cc.TransitionScene.prototype.onExit.call(this)
	},
	_setupTransition: function() {
		this._sceneToBeModified = this._outScene;
		this._from = 100;
		this._to = 0
	},
	_progressTimerNodeWithRenderTexture: function(a) {
		cc.log("cc.TransitionProgress._progressTimerNodeWithRenderTexture(): should be overridden in subclass");
		return null
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = !1
	}
});
cc.TransitionProgress.create = function(a, b) {
	return new cc.TransitionProgress(a, b)
};
cc.TransitionProgressRadialCCW = cc.TransitionProgress.extend({
	ctor: function(a, b) {
		cc.TransitionProgress.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_progressTimerNodeWithRenderTexture: function(a) {
		var b = cc.director.getWinSize();
		a = cc.ProgressTimer.create(a.sprite);
		cc._renderType === cc._RENDER_TYPE_WEBGL && (a.sprite.flippedY = !0);
		a.type = cc.ProgressTimer.TYPE_RADIAL;
		a.reverseDir = !1;
		a.percentage = 100;
		this._setAttrs(a, b.width / 2, b.height / 2);
		return a
	}
});
cc.TransitionProgressRadialCCW.create = function(a, b) {
	return new cc.TransitionProgressRadialCCW(a, b)
};
cc.TransitionProgressRadialCW = cc.TransitionProgress.extend({
	ctor: function(a, b) {
		cc.TransitionProgress.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_progressTimerNodeWithRenderTexture: function(a) {
		var b = cc.director.getWinSize();
		a = cc.ProgressTimer.create(a.sprite);
		cc._renderType === cc._RENDER_TYPE_WEBGL && (a.sprite.flippedY = !0);
		a.type = cc.ProgressTimer.TYPE_RADIAL;
		a.reverseDir = !0;
		a.percentage = 100;
		this._setAttrs(a, b.width / 2, b.height / 2);
		return a
	}
});
cc.TransitionProgressRadialCW.create = function(a, b) {
	var c = new cc.TransitionProgressRadialCW;
	return null != c && c.initWithDuration(a, b) ? c : new cc.TransitionProgressRadialCW(a, b)
};
cc.TransitionProgressHorizontal = cc.TransitionProgress.extend({
	ctor: function(a, b) {
		cc.TransitionProgress.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_progressTimerNodeWithRenderTexture: function(a) {
		var b = cc.director.getWinSize();
		a = cc.ProgressTimer.create(a.sprite);
		cc._renderType === cc._RENDER_TYPE_WEBGL && (a.sprite.flippedY = !0);
		a.type = cc.ProgressTimer.TYPE_BAR;
		a.midPoint = cc.p(1, 0);
		a.barChangeRate = cc.p(1, 0);
		a.percentage = 100;
		this._setAttrs(a, b.width / 2, b.height / 2);
		return a
	}
});
cc.TransitionProgressHorizontal.create = function(a, b) {
	return new cc.TransitionProgressHorizontal(a, b)
};
cc.TransitionProgressVertical = cc.TransitionProgress.extend({
	ctor: function(a, b) {
		cc.TransitionProgress.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_progressTimerNodeWithRenderTexture: function(a) {
		var b = cc.director.getWinSize();
		a = cc.ProgressTimer.create(a.sprite);
		cc._renderType === cc._RENDER_TYPE_WEBGL && (a.sprite.flippedY = !0);
		a.type = cc.ProgressTimer.TYPE_BAR;
		a.midPoint = cc.p(0, 0);
		a.barChangeRate = cc.p(0, 1);
		a.percentage = 100;
		this._setAttrs(a, b.width / 2, b.height / 2);
		return a
	}
});
cc.TransitionProgressVertical.create = function(a, b) {
	return new cc.TransitionProgressVertical(a, b)
};
cc.TransitionProgressInOut = cc.TransitionProgress.extend({
	ctor: function(a, b) {
		cc.TransitionProgress.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_progressTimerNodeWithRenderTexture: function(a) {
		var b = cc.director.getWinSize();
		a = cc.ProgressTimer.create(a.sprite);
		cc._renderType === cc._RENDER_TYPE_WEBGL && (a.sprite.flippedY = !0);
		a.type = cc.ProgressTimer.TYPE_BAR;
		a.midPoint = cc.p(0.5, 0.5);
		a.barChangeRate = cc.p(1, 1);
		a.percentage = 0;
		this._setAttrs(a, b.width / 2, b.height / 2);
		return a
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = !1
	},
	_setupTransition: function() {
		this._sceneToBeModified = this._inScene;
		this._from = 0;
		this._to = 100
	}
});
cc.TransitionProgressInOut.create = function(a, b) {
	return new cc.TransitionProgressInOut(a, b)
};
cc.TransitionProgressOutIn = cc.TransitionProgress.extend({
	ctor: function(a, b) {
		cc.TransitionProgress.prototype.ctor.call(this);
		b && this.initWithDuration(a, b)
	},
	_progressTimerNodeWithRenderTexture: function(a) {
		var b = cc.director.getWinSize();
		a = cc.ProgressTimer.create(a.sprite);
		cc._renderType === cc._RENDER_TYPE_WEBGL && (a.sprite.flippedY = !0);
		a.type = cc.ProgressTimer.TYPE_BAR;
		a.midPoint = cc.p(0.5, 0.5);
		a.barChangeRate = cc.p(1, 1);
		a.percentage = 100;
		this._setAttrs(a, b.width / 2, b.height / 2);
		return a
	}
});
cc.TransitionProgressOutIn.create = function(a, b) {
	return new cc.TransitionProgressOutIn(a, b)
};
cc.TransitionPageTurn = cc.TransitionScene.extend({
	ctor: function(a, b, c) {
		cc.TransitionScene.prototype.ctor.call(this);
		this.initWithDuration(a, b, c)
	},
	_back: !0,
	_className: "TransitionPageTurn",
	initWithDuration: function(a, b, c) {
		this._back = c;
		cc.TransitionScene.prototype.initWithDuration.call(this, a, b);
		return !0
	},
	actionWithSize: function(a) {
		return this._back ? cc.reverseTime(cc.pageTurn3D(this._duration, a)) : cc.pageTurn3D(this._duration, a)
	},
	onEnter: function() {
		cc.TransitionScene.prototype.onEnter.call(this);
		var a = cc.director.getWinSize(),
			b;
		a.width > a.height ? (a = 16, b = 12) : (a = 12, b = 16);
		a = this.actionWithSize(cc.size(a, b));
		this._back ? (this._inScene.visible = !1, this._inScene.runAction(cc.sequence(cc.show(), a, cc.callFunc(this.finish, this), cc.stopGrid()))) : this._outScene.runAction(cc.sequence(a, cc.CallFunc.create(this.finish, this), cc.StopGrid.create()))
	},
	_sceneOrder: function() {
		this._isInSceneOnTop = this._back
	}
});
cc.TransitionPageTurn.create = function(a, b, c) {
	return new cc.TransitionPageTurn(a, b, c)
};
cc.Codec = {
	name: "Jacob__Codec"
};
cc.unzip = function() {
	return cc.Codec.GZip.gunzip.apply(cc.Codec.GZip, arguments)
};
cc.unzipBase64 = function() {
	var a = cc.Codec.Base64.decode.apply(cc.Codec.Base64, arguments);
	return cc.Codec.GZip.gunzip.apply(cc.Codec.GZip, [a])
};
cc.unzipBase64AsArray = function(a, b) {
	b = b || 1;
	var c = this.unzipBase64(a),
		d = [],
		e, f, g;
	e = 0;
	for (g = c.length / b; e < g; e++)
		for (d[e] = 0, f = b - 1; 0 <= f; --f) d[e] += c.charCodeAt(e * b + f) << 8 * f;
	return d
};
cc.unzipAsArray = function(a, b) {
	b = b || 1;
	var c = this.unzip(a),
		d = [],
		e, f, g;
	e = 0;
	for (g = c.length / b; e < g; e++)
		for (d[e] = 0, f = b - 1; 0 <= f; --f) d[e] += c.charCodeAt(e * b + f) << 8 * f;
	return d
};
cc.StringToArray = function(a) {
	a = a.split(",");
	var b = [],
		c;
	for (c = 0; c < a.length; c++) b.push(parseInt(a[c]));
	return b
};
cc.Codec.Base64 = {
	name: "Jacob__Codec__Base64"
};
cc.Codec.Base64._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d";
cc.Codec.Base64.decode = function(a) {
	var b = [],
		c, d, e, f, g, h = 0;
	for (a = a.replace(/[^A-Za-z0-9\+\/\=]/g, ""); h < a.length;) c = this._keyStr.indexOf(a.charAt(h++)), d = this._keyStr.indexOf(a.charAt(h++)), f = this._keyStr.indexOf(a.charAt(h++)), g = this._keyStr.indexOf(a.charAt(h++)), c = c << 2 | d >> 4, d = (d & 15) << 4 | f >> 2, e = (f & 3) << 6 | g, b.push(String.fromCharCode(c)), 64 != f && b.push(String.fromCharCode(d)), 64 != g && b.push(String.fromCharCode(e));
	return b = b.join("")
};
cc.Codec.Base64.decodeAsArray = function(a, b) {
	var c = this.decode(a),
		d = [],
		e, f, g;
	e = 0;
	for (g = c.length / b; e < g; e++)
		for (d[e] = 0, f = b - 1; 0 <= f; --f) d[e] += c.charCodeAt(e * b + f) << 8 * f;
	return d
};
cc.uint8ArrayToUint32Array = function(a) {
	if (0 != a.length % 4) return null;
	for (var b = a.length / 4, c = window.Uint32Array ? new Uint32Array(b) : [], d = 0; d < b; d++) {
		var e = 4 * d;
		c[d] = a[e] + 256 * a[e + 1] + 65536 * a[e + 2] + 16777216 * a[e + 3]
	}
	return c
};
cc.Codec.GZip = function(a) {
	this.data = a;
	this.debug = !1;
	this.gpflags = void 0;
	this.files = 0;
	this.unzipped = [];
	this.buf32k = Array(32768);
	this.bIdx = 0;
	this.modeZIP = !1;
	this.bytepos = 0;
	this.bb = 1;
	this.bits = 0;
	this.nameBuf = [];
	this.fileout = void 0;
	this.literalTree = Array(cc.Codec.GZip.LITERALS);
	this.distanceTree = Array(32);
	this.treepos = 0;
	this.Places = null;
	this.len = 0;
	this.fpos = Array(17);
	this.fpos[0] = 0;
	this.fmax = this.flens = void 0
};
cc.Codec.GZip.gunzip = function(a) {
	return (new cc.Codec.GZip(a)).gunzip()[0][0]
};
cc.Codec.GZip.HufNode = function() {
	this.b1 = this.b0 = 0;
	this.jump = null;
	this.jumppos = -1
};
cc.Codec.GZip.LITERALS = 288;
cc.Codec.GZip.NAMEMAX = 256;
cc.Codec.GZip.bitReverse = [0, 128, 64, 192, 32, 160, 96, 224, 16, 144, 80, 208, 48, 176, 112, 240, 8, 136, 72, 200, 40, 168, 104, 232, 24, 152, 88, 216, 56, 184, 120, 248, 4, 132, 68, 196, 36, 164, 100, 228, 20, 148, 84, 212, 52, 180, 116, 244, 12, 140, 76, 204, 44, 172, 108, 236, 28, 156, 92, 220, 60, 188, 124, 252, 2, 130, 66, 194, 34, 162, 98, 226, 18, 146, 82, 210, 50, 178, 114, 242, 10, 138, 74, 202, 42, 170, 106, 234, 26, 154, 90, 218, 58, 186, 122, 250, 6, 134, 70, 198, 38, 166, 102, 230, 22, 150, 86, 214, 54, 182, 118, 246, 14, 142, 78, 206, 46, 174, 110, 238, 30, 158, 94, 222, 62, 190, 126, 254, 1, 129, 65, 193, 33, 161, 97, 225, 17, 145, 81, 209, 49, 177, 113, 241, 9, 137, 73, 201, 41, 169, 105, 233, 25, 153, 89, 217, 57, 185, 121, 249, 5, 133, 69, 197, 37, 165, 101, 229, 21, 149, 85, 213, 53, 181, 117, 245, 13, 141, 77, 205, 45, 173, 109, 237, 29, 157, 93, 221, 61, 189, 125, 253, 3, 131, 67, 195, 35, 163, 99, 227, 19, 147, 83, 211, 51, 179, 115, 243, 11, 139, 75, 203, 43, 171, 107, 235, 27, 155, 91, 219, 59, 187, 123, 251, 7, 135, 71, 199, 39, 167, 103, 231, 23, 151, 87, 215, 55, 183, 119, 247, 15, 143, 79, 207, 47, 175, 111, 239, 31, 159, 95, 223, 63, 191, 127, 255];
cc.Codec.GZip.cplens = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0];
cc.Codec.GZip.cplext = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99];
cc.Codec.GZip.cpdist = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
cc.Codec.GZip.cpdext = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
cc.Codec.GZip.border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
cc.Codec.GZip.prototype.gunzip = function() {
	this.outputArr = [];
	this.nextFile();
	return this.unzipped
};
cc.Codec.GZip.prototype.readByte = function() {
	this.bits += 8;
	return this.bytepos < this.data.length ? this.data.charCodeAt(this.bytepos++) : -1
};
cc.Codec.GZip.prototype.byteAlign = function() {
	this.bb = 1
};
cc.Codec.GZip.prototype.readBit = function() {
	var a;
	this.bits++;
	a = this.bb & 1;
	this.bb >>= 1;
	0 == this.bb && (this.bb = this.readByte(), a = this.bb & 1, this.bb = this.bb >> 1 | 128);
	return a
};
cc.Codec.GZip.prototype.readBits = function(a) {
	for (var b = 0, c = a; c--;) b = b << 1 | this.readBit();
	a && (b = cc.Codec.GZip.bitReverse[b] >> 8 - a);
	return b
};
cc.Codec.GZip.prototype.flushBuffer = function() {
	this.bIdx = 0
};
cc.Codec.GZip.prototype.addBuffer = function(a) {
	this.buf32k[this.bIdx++] = a;
	this.outputArr.push(String.fromCharCode(a));
	32768 == this.bIdx && (this.bIdx = 0)
};
cc.Codec.GZip.prototype.IsPat = function() {
	for (;;) {
		if (this.fpos[this.len] >= this.fmax) return -1;
		if (this.flens[this.fpos[this.len]] == this.len) return this.fpos[this.len] ++;
		this.fpos[this.len] ++
	}
};
cc.Codec.GZip.prototype.Rec = function() {
	var a = this.Places[this.treepos],
		b;
	if (17 == this.len) return -1;
	this.treepos++;
	this.len++;
	b = this.IsPat();
	if (0 <= b) a.b0 = b;
	else if (a.b0 = 32768, this.Rec()) return -1;
	b = this.IsPat();
	if (0 <= b) a.b1 = b, a.jump = null;
	else if (a.b1 = 32768, a.jump = this.Places[this.treepos], a.jumppos = this.treepos, this.Rec()) return -1;
	this.len--;
	return 0
};
cc.Codec.GZip.prototype.CreateTree = function(a, b, c, d) {
	this.Places = a;
	this.treepos = 0;
	this.flens = c;
	this.fmax = b;
	for (a = 0; 17 > a; a++) this.fpos[a] = 0;
	this.len = 0;
	return this.Rec() ? -1 : 0
};
cc.Codec.GZip.prototype.DecodeValue = function(a) {
	for (var b, c, d = 0, e = a[d];;)
		if (b = this.readBit()) {
			if (!(e.b1 & 32768)) return e.b1;
			e = e.jump;
			b = a.length;
			for (c = 0; c < b; c++)
				if (a[c] === e) {
					d = c;
					break
				}
		} else {
			if (!(e.b0 & 32768)) return e.b0;
			d++;
			e = a[d]
		}
	return -1
};
cc.Codec.GZip.prototype.DeflateLoop = function() {
	var a, b, c, d, e;
	do
		if (a = this.readBit(), c = this.readBits(2), 0 == c)
			for (this.byteAlign(), c = this.readByte(), c |= this.readByte() << 8, b = this.readByte(), b |= this.readByte() << 8, (c ^ ~b) & 65535 && document.write("BlockLen checksum mismatch\n"); c--;) b = this.readByte(), this.addBuffer(b);
		else if (1 == c)
		for (;;)
			if (c = cc.Codec.GZip.bitReverse[this.readBits(7)] >> 1, 23 < c ? (c = c << 1 | this.readBit(), 199 < c ? (c -= 128, c = c << 1 | this.readBit()) : (c -= 48, 143 < c && (c += 136))) : c += 256, 256 > c) this.addBuffer(c);
			else if (256 == c) break;
	else {
		var f;
		c -= 257;
		e = this.readBits(cc.Codec.GZip.cplext[c]) + cc.Codec.GZip.cplens[c];
		c = cc.Codec.GZip.bitReverse[this.readBits(5)] >> 3;
		8 < cc.Codec.GZip.cpdext[c] ? (f = this.readBits(8), f |= this.readBits(cc.Codec.GZip.cpdext[c] - 8) << 8) : f = this.readBits(cc.Codec.GZip.cpdext[c]);
		f += cc.Codec.GZip.cpdist[c];
		for (c = 0; c < e; c++) b = this.buf32k[this.bIdx - f & 32767], this.addBuffer(b)
	} else if (2 == c) {
		var g = Array(320);
		b = 257 + this.readBits(5);
		f = 1 + this.readBits(5);
		d = 4 + this.readBits(4);
		for (c = 0; 19 > c; c++) g[c] = 0;
		for (c = 0; c < d; c++) g[cc.Codec.GZip.border[c]] = this.readBits(3);
		e = this.distanceTree.length;
		for (d = 0; d < e; d++) this.distanceTree[d] = new cc.Codec.GZip.HufNode;
		if (this.CreateTree(this.distanceTree, 19, g, 0)) return this.flushBuffer(), 1;
		e = b + f;
		d = 0;
		for (var h = -1; d < e;)
			if (h++, c = this.DecodeValue(this.distanceTree), 16 > c) g[d++] = c;
			else if (16 == c) {
			var k;
			c = 3 + this.readBits(2);
			if (d + c > e) return this.flushBuffer(), 1;
			for (k = d ? g[d - 1] : 0; c--;) g[d++] = k
		} else {
			c = 17 == c ? 3 + this.readBits(3) : 11 + this.readBits(7);
			if (d + c > e) return this.flushBuffer(), 1;
			for (; c--;) g[d++] = 0
		}
		e = this.literalTree.length;
		for (d = 0; d < e; d++) this.literalTree[d] = new cc.Codec.GZip.HufNode;
		if (this.CreateTree(this.literalTree, b, g, 0)) return this.flushBuffer(), 1;
		e = this.literalTree.length;
		for (d = 0; d < e; d++) this.distanceTree[d] = new cc.Codec.GZip.HufNode;
		c = [];
		for (d = b; d < g.length; d++) c[d - b] = g[d];
		if (this.CreateTree(this.distanceTree, f, c, 0)) return this.flushBuffer(), 1;
		for (;;)
			if (c = this.DecodeValue(this.literalTree), 256 <= c) {
				c -= 256;
				if (0 == c) break;
				c--;
				e = this.readBits(cc.Codec.GZip.cplext[c]) +
					cc.Codec.GZip.cplens[c];
				c = this.DecodeValue(this.distanceTree);
				8 < cc.Codec.GZip.cpdext[c] ? (f = this.readBits(8), f |= this.readBits(cc.Codec.GZip.cpdext[c] - 8) << 8) : f = this.readBits(cc.Codec.GZip.cpdext[c]);
				for (f += cc.Codec.GZip.cpdist[c]; e--;) b = this.buf32k[this.bIdx - f & 32767], this.addBuffer(b)
			} else this.addBuffer(c)
	}
	while (!a);
	this.flushBuffer();
	this.byteAlign();
	return 0
};
cc.Codec.GZip.prototype.unzipFile = function(a) {
	var b;
	this.gunzip();
	for (b = 0; b < this.unzipped.length; b++)
		if (this.unzipped[b][1] == a) return this.unzipped[b][0]
};
cc.Codec.GZip.prototype.nextFile = function() {
	this.outputArr = [];
	this.modeZIP = !1;
	var a = [];
	a[0] = this.readByte();
	a[1] = this.readByte();
	120 == a[0] && 218 == a[1] && (this.DeflateLoop(), this.unzipped[this.files] = [this.outputArr.join(""), "geonext.gxt"], this.files++);
	31 == a[0] && 139 == a[1] && (this.skipdir(), this.unzipped[this.files] = [this.outputArr.join(""), "file"], this.files++);
	if (80 == a[0] && 75 == a[1] && (this.modeZIP = !0, a[2] = this.readByte(), a[3] = this.readByte(), 3 == a[2] && 4 == a[3])) {
		a[0] = this.readByte();
		a[1] = this.readByte();
		this.gpflags = this.readByte();
		this.gpflags |= this.readByte() << 8;
		a = this.readByte();
		a |= this.readByte() << 8;
		this.readByte();
		this.readByte();
		this.readByte();
		this.readByte();
		this.readByte();
		this.readByte();
		this.readByte();
		this.readByte();
		this.readByte();
		this.readByte();
		this.readByte();
		this.readByte();
		var b = this.readByte(),
			b = b | this.readByte() << 8,
			c = this.readByte(),
			c = c | this.readByte() << 8,
			d = 0;
		for (this.nameBuf = []; b--;) {
			var e = this.readByte();
			"/" == e | ":" == e ? d = 0 : d < cc.Codec.GZip.NAMEMAX - 1 && (this.nameBuf[d++] = String.fromCharCode(e))
		}
		this.fileout || (this.fileout = this.nameBuf);
		for (var d = 0; d < c;) this.readByte(), d++;
		8 == a && (this.DeflateLoop(), this.unzipped[this.files] = [this.outputArr.join(""), this.nameBuf.join("")], this.files++);
		this.skipdir()
	}
};
cc.Codec.GZip.prototype.skipdir = function() {
	var a = [],
		b;
	this.gpflags & 8 && (a[0] = this.readByte(), a[1] = this.readByte(), a[2] = this.readByte(), a[3] = this.readByte(), this.readByte(), this.readByte(), this.readByte(), this.readByte(), this.readByte(), this.readByte(), this.readByte(), this.readByte());
	this.modeZIP && this.nextFile();
	a[0] = this.readByte();
	if (8 != a[0]) return 0;
	this.gpflags = this.readByte();
	this.readByte();
	this.readByte();
	this.readByte();
	this.readByte();
	this.readByte();
	this.readByte();
	if (this.gpflags & 4)
		for (a[0] = this.readByte(), a[2] = this.readByte(), this.len = a[0] + 256 * a[1], a = 0; a < this.len; a++) this.readByte();
	if (this.gpflags & 8)
		for (a = 0, this.nameBuf = []; b = this.readByte();) {
			if ("7" == b || ":" == b) a = 0;
			a < cc.Codec.GZip.NAMEMAX - 1 && (this.nameBuf[a++] = b)
		}
	if (this.gpflags & 16)
		for (; this.readByte(););
	this.gpflags & 2 && (this.readByte(), this.readByte());
	this.DeflateLoop();
	this.readByte();
	this.readByte();
	this.readByte();
	this.readByte();
	this.modeZIP && this.nextFile()
};
(function() {
	function a(a) {
		throw a;
	}

	function b(a, b) {
		var c = a.split("."),
			d = A;
		c[0] in d || !d.execScript || d.execScript("var " + c[0]);
		for (var e; c.length && (e = c.shift());) c.length || b === C ? d = d[e] ? d[e] : d[e] = {} : d[e] = b
	}

	function c(a) {
		if ("string" === typeof a) {
			a = a.split("");
			var b, c;
			b = 0;
			for (c = a.length; b < c; b++) a[b] = (a[b].charCodeAt(0) & 255) >>> 0
		}
		b = 1;
		c = 0;
		for (var d = a.length, e, f = 0; 0 < d;) {
			e = 1024 < d ? 1024 : d;
			d -= e;
			do b += a[f++], c += b; while (--e);
			b %= 65521;
			c %= 65521
		}
		return (c << 16 | b) >>> 0
	}

	function d(b, c) {
		this.index = "number" === typeof c ? c : 0;
		this.i = 0;
		this.buffer = b instanceof(x ? Uint8Array : Array) ? b : new(x ? Uint8Array : Array)(32768);
		2 * this.buffer.length <= this.index && a(Error("invalid index"));
		this.buffer.length <= this.index && this.f()
	}

	function e(a) {
		this.buffer = new(x ? Uint16Array : Array)(2 * a);
		this.length = 0
	}

	function f(a) {
		var b = a.length,
			c = 0,
			d = Number.POSITIVE_INFINITY,
			e, f, g, h, k, m, n, q, r;
		for (q = 0; q < b; ++q) a[q] > c && (c = a[q]), a[q] < d && (d = a[q]);
		e = 1 << c;
		f = new(x ? Uint32Array : Array)(e);
		g = 1;
		h = 0;
		for (k = 2; g <= c;) {
			for (q = 0; q < b; ++q)
				if (a[q] === g) {
					m = 0;
					n = h;
					for (r = 0; r < g; ++r) m = m << 1 | n & 1, n >>= 1;
					for (r = m; r < e; r += k) f[r] = g << 16 | q;
					++h
				}++g;
			h <<= 1;
			k <<= 1
		}
		return [f, c, d]
	}

	function g(a, b) {
		this.h = J;
		this.w = 0;
		this.input = a;
		this.b = 0;
		b && (b.lazy && (this.w = b.lazy), "number" === typeof b.compressionType && (this.h = b.compressionType), b.outputBuffer && (this.a = x && b.outputBuffer instanceof Array ? new Uint8Array(b.outputBuffer) : b.outputBuffer), "number" === typeof b.outputIndex && (this.b = b.outputIndex));
		this.a || (this.a = new(x ? Uint8Array : Array)(32768))
	}

	function h(a, b) {
		this.length = a;
		this.G = b
	}

	function k() {
		var b = K;
		switch (E) {
			case 3 === b:
				return [257, b - 3, 0];
			case 4 === b:
				return [258, b - 4, 0];
			case 5 === b:
				return [259, b - 5, 0];
			case 6 === b:
				return [260, b - 6, 0];
			case 7 === b:
				return [261, b - 7, 0];
			case 8 === b:
				return [262, b - 8, 0];
			case 9 === b:
				return [263, b - 9, 0];
			case 10 === b:
				return [264, b - 10, 0];
			case 12 >= b:
				return [265, b - 11, 1];
			case 14 >= b:
				return [266, b - 13, 1];
			case 16 >= b:
				return [267, b - 15, 1];
			case 18 >= b:
				return [268, b - 17, 1];
			case 22 >= b:
				return [269, b - 19, 2];
			case 26 >= b:
				return [270, b - 23, 2];
			case 30 >= b:
				return [271, b - 27, 2];
			case 34 >= b:
				return [272, b - 31, 2];
			case 42 >= b:
				return [273, b - 35, 3];
			case 50 >= b:
				return [274, b - 43, 3];
			case 58 >= b:
				return [275, b - 51, 3];
			case 66 >= b:
				return [276, b - 59, 3];
			case 82 >= b:
				return [277, b - 67, 4];
			case 98 >= b:
				return [278, b - 83, 4];
			case 114 >= b:
				return [279, b - 99, 4];
			case 130 >= b:
				return [280, b - 115, 4];
			case 162 >= b:
				return [281, b - 131, 5];
			case 194 >= b:
				return [282, b - 163, 5];
			case 226 >= b:
				return [283, b - 195, 5];
			case 257 >= b:
				return [284, b - 227, 5];
			case 258 === b:
				return [285, b - 258, 0];
			default:
				a("invalid length: " + b)
		}
	}

	function m(b, c) {
		function d(b, c) {
			var e = b.G,
				f = [],
				g = 0,
				h;
			h = M[b.length];
			f[g++] = h & 65535;
			f[g++] = h >> 16 & 255;
			f[g++] = h >> 24;
			var k;
			switch (E) {
				case 1 === e:
					k = [0, e - 1, 0];
					break;
				case 2 === e:
					k = [1, e - 2, 0];
					break;
				case 3 === e:
					k = [2, e - 3, 0];
					break;
				case 4 === e:
					k = [3, e - 4, 0];
					break;
				case 6 >= e:
					k = [4, e - 5, 1];
					break;
				case 8 >= e:
					k = [5, e - 7, 1];
					break;
				case 12 >= e:
					k = [6, e - 9, 2];
					break;
				case 16 >= e:
					k = [7, e - 13, 2];
					break;
				case 24 >= e:
					k = [8, e - 17, 3];
					break;
				case 32 >= e:
					k = [9, e - 25, 3];
					break;
				case 48 >= e:
					k = [10, e - 33, 4];
					break;
				case 64 >= e:
					k = [11, e - 49, 4];
					break;
				case 96 >= e:
					k = [12, e - 65, 5];
					break;
				case 128 >= e:
					k = [13, e - 97, 5];
					break;
				case 192 >= e:
					k = [14, e - 129, 6];
					break;
				case 256 >= e:
					k = [15, e - 193, 6];
					break;
				case 384 >= e:
					k = [16, e - 257, 7];
					break;
				case 512 >= e:
					k = [17, e - 385, 7];
					break;
				case 768 >= e:
					k = [18, e - 513, 8];
					break;
				case 1024 >= e:
					k = [19, e - 769, 8];
					break;
				case 1536 >= e:
					k = [20, e - 1025, 9];
					break;
				case 2048 >= e:
					k = [21, e - 1537, 9];
					break;
				case 3072 >= e:
					k = [22, e - 2049, 10];
					break;
				case 4096 >= e:
					k = [23, e - 3073, 10];
					break;
				case 6144 >= e:
					k = [24, e - 4097, 11];
					break;
				case 8192 >= e:
					k = [25, e - 6145, 11];
					break;
				case 12288 >= e:
					k = [26, e - 8193, 12];
					break;
				case 16384 >= e:
					k = [27, e - 12289, 12];
					break;
				case 24576 >= e:
					k = [28, e - 16385, 13];
					break;
				case 32768 >= e:
					k = [29, e - 24577, 13];
					break;
				default:
					a("invalid distance")
			}
			h = k;
			f[g++] = h[0];
			f[g++] = h[1];
			f[g++] = h[2];
			e = 0;
			for (g = f.length; e < g; ++e) r[s++] = f[e];
			u[f[0]] ++;
			w[f[3]] ++;
			t = b.length + c - 1;
			q = null
		}
		var e, f, g, k, m, n = {},
			q, r = x ? new Uint16Array(2 * c.length) : [],
			s = 0,
			t = 0,
			u = new(x ? Uint32Array : Array)(286),
			w = new(x ? Uint32Array : Array)(30),
			y = b.w,
			v;
		if (!x) {
			for (g = 0; 285 >= g;) u[g++] = 0;
			for (g = 0; 29 >= g;) w[g++] = 0
		}
		u[256] = 1;
		e = 0;
		for (f = c.length; e < f; ++e) {
			g = m = 0;
			for (k = 3; g < k && e + g !== f; ++g) m = m << 8 | c[e + g];
			n[m] === C && (n[m] = []);
			g = n[m];
			if (!(0 < t--)) {
				for (; 0 < g.length && 32768 < e - g[0];) g.shift();
				if (e + 3 >= f) {
					q && d(q, -1);
					g = 0;
					for (k = f - e; g < k; ++g) v = c[e + g], r[s++] = v, ++u[v];
					break
				}
				if (0 < g.length) {
					m = k = C;
					var z = 0,
						B = C,
						A = C,
						F = B = C,
						I = c.length,
						A = 0,
						F = g.length;
					a: for (; A < F; A++) {
						k = g[F - A - 1];
						B = 3;
						if (3 < z) {
							for (B = z; 3 < B; B--)
								if (c[k + B - 1] !== c[e + B - 1]) continue a;
							B = z
						}
						for (; 258 > B && e + B < I && c[k + B] === c[e + B];) ++B;
						B > z && (m = k, z = B);
						if (258 === B) break
					}
					k = new h(z, e - m);
					q ? q.length < k.length ? (v = c[e - 1], r[s++] = v, ++u[v], d(k, 0)) : d(q, -1) : k.length < y ? q = k : d(k, 0)
				} else q ? d(q, -1) : (v = c[e], r[s++] = v, ++u[v])
			}
			g.push(e)
		}
		r[s++] = 256;
		u[256] ++;
		b.L = u;
		b.K = w;
		return x ? r.subarray(0, s) : r
	}

	function n(a, b) {
		function c(a) {
			var b = r[a][s[a]];
			b === n ? (c(a + 1), c(a + 1)) : --q[b];
			++s[a]
		}
		var d = a.length,
			f = new e(572),
			g = new(x ? Uint8Array : Array)(d),
			h, k, m;
		if (!x)
			for (k = 0; k < d; k++) g[k] = 0;
		for (k = 0; k < d; ++k) 0 < a[k] && f.push(k, a[k]);
		d = Array(f.length / 2);
		h = new(x ? Uint32Array : Array)(f.length / 2);
		if (1 === d.length) return g[f.pop().index] = 1, g;
		k = 0;
		for (m = f.length / 2; k < m; ++k) d[k] = f.pop(), h[k] = d[k].value;
		var n = h.length;
		k = new(x ? Uint16Array : Array)(b);
		var f = new(x ? Uint8Array : Array)(b),
			q = new(x ? Uint8Array : Array)(n);
		m = Array(b);
		var r = Array(b),
			s = Array(b),
			t = (1 << b) - n,
			u = 1 << b - 1,
			v, w, y;
		k[b - 1] = n;
		for (v = 0; v < b; ++v) t < u ? f[v] = 0 : (f[v] = 1, t -= u), t <<= 1, k[b - 2 - v] = (k[b - 1 - v] / 2 | 0) + n;
		k[0] = f[0];
		m[0] = Array(k[0]);
		r[0] = Array(k[0]);
		for (v = 1; v < b; ++v) k[v] > 2 * k[v - 1] + f[v] && (k[v] = 2 * k[v - 1] + f[v]), m[v] = Array(k[v]), r[v] = Array(k[v]);
		for (t = 0; t < n; ++t) q[t] = b;
		for (u = 0; u < k[b - 1]; ++u) m[b - 1][u] = h[u], r[b - 1][u] = u;
		for (t = 0; t < b; ++t) s[t] = 0;
		1 === f[b - 1] && (--q[0], ++s[b - 1]);
		for (v = b - 2; 0 <= v; --v) {
			w = t = 0;
			y = s[v + 1];
			for (u = 0; u < k[v]; u++) w = m[v + 1][y] + m[v + 1][y + 1], w > h[t] ? (m[v][u] = w, r[v][u] = n, y += 2) : (m[v][u] = h[t], r[v][u] = t, ++t);
			s[v] = 0;
			1 === f[v] && c(v)
		}
		h = q;
		k = 0;
		for (m = d.length; k < m; ++k) g[d[k].index] = h[k];
		return g
	}

	function q(b) {
		var c = new(x ? Uint16Array : Array)(b.length),
			d = [],
			e = [],
			f = 0,
			g, h, k;
		g = 0;
		for (h = b.length; g < h; g++) d[b[g]] = (d[b[g]] | 0) + 1;
		g = 1;
		for (h = 16; g <= h; g++) e[g] = f, f += d[g] | 0, f > 1 << g && a("overcommitted"), f <<= 1;
		65536 > f && a("undercommitted");
		g = 0;
		for (h = b.length; g < h; g++)
			for (f = e[b[g]], e[b[g]] += 1, d = c[g] = 0, k = b[g]; d < k; d++) c[g] = c[g] << 1 | f & 1, f >>>= 1;
		return c
	}

	function s(a, b) {
		this.input = a;
		this.a = new(x ? Uint8Array : Array)(32768);
		this.h = I.j;
		var c = {},
			d;
		!b && (b = {}) || "number" !== typeof b.compressionType || (this.h = b.compressionType);
		for (d in b) c[d] = b[d];
		c.outputBuffer = this.a;
		this.z = new g(this.input, c)
	}

	function r(b, c) {
		this.k = [];
		this.l = 32768;
		this.e = this.g = this.c = this.q = 0;
		this.input = x ? new Uint8Array(b) : b;
		this.s = !1;
		this.m = P;
		this.B = !1;
		if (c || !(c = {})) c.index && (this.c = c.index), c.bufferSize && (this.l = c.bufferSize), c.bufferType && (this.m = c.bufferType), c.resize && (this.B = c.resize);
		switch (this.m) {
			case N:
				this.b = 32768;
				this.a = new(x ? Uint8Array : Array)(32768 +
					this.l + 258);
				break;
			case P:
				this.b = 0;
				this.a = new(x ? Uint8Array : Array)(this.l);
				this.f = this.J;
				this.t = this.H;
				this.o = this.I;
				break;
			default:
				a(Error("invalid inflate mode"))
		}
	}

	function t(b, c) {
		for (var d = b.g, e = b.e, f = b.input, g = b.c, h; e < c;) h = f[g++], h === C && a(Error("input buffer is broken")), d |= h << e, e += 8;
		b.g = d >>> c;
		b.e = e - c;
		b.c = g;
		return d & (1 << c) - 1
	}

	function u(b, c) {
		for (var d = b.g, e = b.e, f = b.input, g = b.c, h = c[0], k = c[1], m; e < k;) m = f[g++], m === C && a(Error("input buffer is broken")), d |= m << e, e += 8;
		f = h[d & (1 << k) - 1];
		h = f >>> 16;
		b.g = d >> h;
		b.e = e - h;
		b.c = g;
		return f & 65535
	}

	function y(a) {
		function b(a, c, d) {
			var e, f, g, h;
			for (h = 0; h < a;) switch (e = u(this, c), e) {
				case 16:
					for (g = 3 + t(this, 2); g--;) d[h++] = f;
					break;
				case 17:
					for (g = 3 + t(this, 3); g--;) d[h++] = 0;
					f = 0;
					break;
				case 18:
					for (g = 11 + t(this, 7); g--;) d[h++] = 0;
					f = 0;
					break;
				default:
					f = d[h++] = e
			}
			return d
		}
		var c = t(a, 5) + 257,
			d = t(a, 5) + 1,
			e = t(a, 4) + 4,
			g = new(x ? Uint8Array : Array)(S.length),
			h;
		for (h = 0; h < e; ++h) g[S[h]] = t(a, 3);
		e = f(g);
		g = new(x ? Uint8Array : Array)(c);
		h = new(x ? Uint8Array : Array)(d);
		a.o(f(b.call(a, c, e, g)), f(b.call(a, d, e, h)))
	}

	function v(b, c) {
		var d, e;
		this.input = b;
		this.c = 0;
		if (c || !(c = {})) c.index && (this.c = c.index), c.verify && (this.M = c.verify);
		d = b[this.c++];
		e = b[this.c++];
		switch (d & 15) {
			case O:
				this.method = O;
				break;
			default:
				a(Error("unsupported compression method"))
		}
		0 !== ((d << 8) + e) % 31 && a(Error("invalid fcheck flag:" + ((d << 8) + e) % 31));
		e & 32 && a(Error("fdict flag is not supported"));
		this.A = new r(b, {
			index: this.c,
			bufferSize: c.bufferSize,
			bufferType: c.bufferType,
			resize: c.resize
		})
	}
	var C = void 0,
		E = !0,
		A = this,
		x = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array;
	d.prototype.f = function() {
		var a = this.buffer,
			b, c = a.length,
			d = new(x ? Uint8Array : Array)(c << 1);
		if (x) d.set(a);
		else
			for (b = 0; b < c; ++b) d[b] = a[b];
		return this.buffer = d
	};
	d.prototype.d = function(a, b, c) {
		var d = this.buffer,
			e = this.index,
			f = this.i,
			g = d[e];
		c && 1 < b && (a = 8 < b ? (F[a & 255] << 24 | F[a >>> 8 & 255] << 16 | F[a >>> 16 & 255] << 8 | F[a >>> 24 & 255]) >> 32 - b : F[a] >> 8 - b);
		if (8 > b + f) g = g << b | a, f += b;
		else
			for (c = 0; c < b; ++c) g = g << 1 | a >> b - c - 1 & 1, 8 === ++f && (f = 0, d[e++] = F[g], g = 0, e === d.length && (d = this.f()));
		d[e] = g;
		this.buffer = d;
		this.i = f;
		this.index = e
	};
	d.prototype.finish = function() {
		var a = this.buffer,
			b = this.index,
			c;
		0 < this.i && (a[b] <<= 8 - this.i, a[b] = F[a[b]], b++);
		x ? c = a.subarray(0, b) : (a.length = b, c = a);
		return c
	};
	var z = new(x ? Uint8Array : Array)(256),
		w;
	for (w = 0; 256 > w; ++w) {
		for (var B = w, G = B, H = 7, B = B >>> 1; B; B >>>= 1) G <<= 1, G |= B & 1, --H;
		z[w] = (G << H & 255) >>> 0
	}
	var F = z,
		z = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918E3, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];
	x && new Uint32Array(z);
	e.prototype.getParent = function(a) {
		return 2 * ((a - 2) / 4 | 0)
	};
	e.prototype.push = function(a, b) {
		var c, d, e = this.buffer,
			f;
		c = this.length;
		e[this.length++] = b;
		for (e[this.length++] = a; 0 < c;)
			if (d = this.getParent(c), e[c] > e[d]) f = e[c], e[c] = e[d], e[d] = f, f = e[c + 1], e[c + 1] = e[d + 1], e[d + 1] = f, c = d;
			else break;
		return this.length
	};
	e.prototype.pop = function() {
		var a, b, c = this.buffer,
			d, e, f;
		b = c[0];
		a = c[1];
		this.length -= 2;
		c[0] = c[this.length];
		c[1] = c[this.length + 1];
		for (f = 0;;) {
			e = 2 * f + 2;
			if (e >= this.length) break;
			e + 2 < this.length && c[e + 2] > c[e] && (e += 2);
			if (c[e] > c[f]) d = c[f], c[f] = c[e], c[e] = d, d = c[f + 1], c[f + 1] = c[e + 1], c[e + 1] = d;
			else break;
			f = e
		}
		return {
			index: a,
			value: b,
			length: this.length
		}
	};
	var J = 2,
		z = {
			NONE: 0,
			r: 1,
			j: J,
			N: 3
		},
		L = [];
	for (w = 0; 288 > w; w++) switch (E) {
		case 143 >= w:
			L.push([w + 48, 8]);
			break;
		case 255 >= w:
			L.push([w - 144 + 400, 9]);
			break;
		case 279 >= w:
			L.push([w - 256 + 0, 7]);
			break;
		case 287 >= w:
			L.push([w - 280 + 192, 8]);
			break;
		default:
			a("invalid literal: " + w)
	}
	g.prototype.n = function() {
		var b, c, e, f, g = this.input;
		switch (this.h) {
			case 0:
				e = 0;
				for (f = g.length; e < f;) {
					c = x ? g.subarray(e, e + 65535) : g.slice(e, e + 65535);
					e += c.length;
					var h = e === f,
						k = C,
						r = k = C,
						r = k = C,
						s = this.a,
						t = this.b;
					if (x) {
						for (s = new Uint8Array(this.a.buffer); s.length <= t + c.length + 5;) s = new Uint8Array(s.length << 1);
						s.set(this.a)
					}
					k = h ? 1 : 0;
					s[t++] = k | 0;
					k = c.length;
					r = ~k + 65536 & 65535;
					s[t++] = k & 255;
					s[t++] = k >>> 8 & 255;
					s[t++] = r & 255;
					s[t++] = r >>> 8 & 255;
					if (x) s.set(c, t), t += c.length, s = s.subarray(0, t);
					else {
						k = 0;
						for (r = c.length; k < r; ++k) s[t++] = c[k];
						s.length = t
					}
					this.b = t;
					this.a = s
				}
				break;
			case 1:
				e = new d(new Uint8Array(this.a.buffer), this.b);
				e.d(1, 1, E);
				e.d(1, 2, E);
				g = m(this, g);
				c = 0;
				for (h = g.length; c < h; c++)
					if (f = g[c], d.prototype.d.apply(e, L[f]), 256 < f) e.d(g[++c], g[++c], E), e.d(g[++c], 5), e.d(g[++c], g[++c], E);
					else if (256 === f) break;
				this.a = e.finish();
				this.b = this.a.length;
				break;
			case J:
				f = new d(new Uint8Array(this.a), this.b);
				var u, v, w, y = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
					B, z, k = Array(19),
					D, s = J;
				f.d(1, 1, E);
				f.d(s, 2, E);
				g = m(this, g);
				r = n(this.L, 15);
				B = q(r);
				s = n(this.K, 7);
				t = q(s);
				for (u = 286; 257 < u && 0 === r[u -
						1]; u--);
				for (v = 30; 1 < v && 0 === s[v - 1]; v--);
				var A = u,
					F = v;
				b = new(x ? Uint32Array : Array)(A + F);
				var I = new(x ? Uint32Array : Array)(316),
					G, H;
				z = new(x ? Uint8Array : Array)(19);
				for (D = w = 0; D < A; D++) b[w++] = r[D];
				for (D = 0; D < F; D++) b[w++] = s[D];
				if (!x)
					for (D = 0, F = z.length; D < F; ++D) z[D] = 0;
				D = G = 0;
				for (F = b.length; D < F; D += w) {
					for (w = 1; D + w < F && b[D + w] === b[D]; ++w);
					A = w;
					if (0 === b[D])
						if (3 > A)
							for (; 0 < A--;) I[G++] = 0, z[0] ++;
						else
							for (; 0 < A;) H = 138 > A ? A : 138, H > A - 3 && H < A && (H = A - 3), 10 >= H ? (I[G++] = 17, I[G++] = H - 3, z[17] ++) : (I[G++] = 18, I[G++] = H - 11, z[18] ++), A -= H;
					else if (I[G++] = b[D], z[b[D]] ++, A--, 3 > A)
						for (; 0 < A--;) I[G++] = b[D], z[b[D]] ++;
					else
						for (; 0 < A;) H = 6 > A ? A : 6, H > A - 3 && H < A && (H = A - 3), I[G++] = 16, I[G++] = H - 3, z[16] ++, A -= H
				}
				b = x ? I.subarray(0, G) : I.slice(0, G);
				z = n(z, 7);
				for (D = 0; 19 > D; D++) k[D] = z[y[D]];
				for (w = 19; 4 < w && 0 === k[w - 1]; w--);
				y = q(z);
				f.d(u - 257, 5, E);
				f.d(v - 1, 5, E);
				f.d(w - 4, 4, E);
				for (D = 0; D < w; D++) f.d(k[D], 3, E);
				D = 0;
				for (k = b.length; D < k; D++)
					if (c = b[D], f.d(y[c], z[c], E), 16 <= c) {
						D++;
						switch (c) {
							case 16:
								h = 2;
								break;
							case 17:
								h = 3;
								break;
							case 18:
								h = 7;
								break;
							default:
								a("invalid code: " + c)
						}
						f.d(b[D], h, E)
					}
				h = [B, r];
				t = [t, s];
				c = h[0];
				h = h[1];
				s = t[0];
				B = t[1];
				t = 0;
				for (k = g.length; t < k; ++t)
					if (e = g[t], f.d(c[e], h[e], E), 256 < e) f.d(g[++t], g[++t], E), r = g[++t], f.d(s[r], B[r], E), f.d(g[++t], g[++t], E);
					else if (256 === e) break;
				this.a = f.finish();
				this.b = this.a.length;
				break;
			default:
				a("invalid compression type")
		}
		return this.a
	};
	w = [];
	var K;
	for (K = 3; 258 >= K; K++) B = k(), w[K] = B[2] << 24 | B[1] << 16 | B[0];
	var M = x ? new Uint32Array(w) : w,
		I = z;
	s.prototype.n = function() {
		var b, d, e, f, g = 0;
		f = this.a;
		b = O;
		switch (b) {
			case O:
				d = Math.LOG2E * Math.log(32768) - 8;
				break;
			default:
				a(Error("invalid compression method"))
		}
		d = d << 4 | b;
		f[g++] = d;
		switch (b) {
			case O:
				switch (this.h) {
					case I.NONE:
						e = 0;
						break;
					case I.r:
						e = 1;
						break;
					case I.j:
						e = 2;
						break;
					default:
						a(Error("unsupported compression type"))
				}
				break;
			default:
				a(Error("invalid compression method"))
		}
		b = e << 6 | 0;
		f[g++] = b | 31 - (256 * d + b) % 31;
		b = c(this.input);
		this.z.b = g;
		f = this.z.n();
		g = f.length;
		x && (f = new Uint8Array(f.buffer), f.length <= g + 4 && (this.a = new Uint8Array(f.length + 4), this.a.set(f), f = this.a), f = f.subarray(0, g + 4));
		f[g++] = b >> 24 & 255;
		f[g++] = b >> 16 & 255;
		f[g++] = b >> 8 & 255;
		f[g++] = b & 255;
		return f
	};
	b("Zlib.Deflate", s);
	b("Zlib.Deflate.compress", function(a, b) {
		return (new s(a, b)).n()
	});
	b("Zlib.Deflate.CompressionType", I);
	b("Zlib.Deflate.CompressionType.NONE", I.NONE);
	b("Zlib.Deflate.CompressionType.FIXED", I.r);
	b("Zlib.Deflate.CompressionType.DYNAMIC", I.j);
	var N = 0,
		P = 1,
		z = {
			D: N,
			C: P
		};
	r.prototype.p = function() {
		for (; !this.s;) {
			var b = t(this, 3);
			b & 1 && (this.s = E);
			b >>>= 1;
			switch (b) {
				case 0:
					var b = this.input,
						c = this.c,
						d = this.a,
						e = this.b,
						f = C,
						g = C,
						h = C,
						k = d.length,
						f = C;
					this.e = this.g = 0;
					f = b[c++];
					f === C && a(Error("invalid uncompressed block header: LEN (first byte)"));
					g = f;
					f = b[c++];
					f === C && a(Error("invalid uncompressed block header: LEN (second byte)"));
					g |= f << 8;
					f = b[c++];
					f === C && a(Error("invalid uncompressed block header: NLEN (first byte)"));
					h = f;
					f = b[c++];
					f === C && a(Error("invalid uncompressed block header: NLEN (second byte)"));
					h |= f << 8;
					g === ~h && a(Error("invalid uncompressed block header: length verify"));
					c + g > b.length && a(Error("input buffer is broken"));
					switch (this.m) {
						case N:
							for (; e + g > d.length;) {
								f = k - e;
								g -= f;
								if (x) d.set(b.subarray(c, c + f), e), e += f, c += f;
								else
									for (; f--;) d[e++] = b[c++];
								this.b = e;
								d = this.f();
								e = this.b
							}
							break;
						case P:
							for (; e + g > d.length;) d = this.f({
								v: 2
							});
							break;
						default:
							a(Error("invalid inflate mode"))
					}
					if (x) d.set(b.subarray(c, c + g), e), e += g, c += g;
					else
						for (; g--;) d[e++] = b[c++];
					this.c = c;
					this.b = e;
					this.a = d;
					break;
				case 1:
					this.o(V, W);
					break;
				case 2:
					y(this);
					break;
				default:
					a(Error("unknown BTYPE: " + b))
			}
		}
		return this.t()
	};
	w = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
	var S = x ? new Uint16Array(w) : w;
	w = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258];
	var T = x ? new Uint16Array(w) : w;
	w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0];
	var Q = x ? new Uint8Array(w) : w;
	w = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
	var U = x ? new Uint16Array(w) : w;
	w = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
	var R = x ? new Uint8Array(w) : w;
	w = new(x ? Uint8Array : Array)(288);
	B = 0;
	for (G = w.length; B < G; ++B) w[B] = 143 >= B ? 8 : 255 >= B ? 9 : 279 >= B ? 7 : 8;
	var V = f(w);
	w = new(x ? Uint8Array : Array)(30);
	B = 0;
	for (G = w.length; B < G; ++B) w[B] = 5;
	var W = f(w);
	r.prototype.o = function(a, b) {
		var c = this.a,
			d = this.b;
		this.u = a;
		for (var e = c.length - 258, f, g, h; 256 !== (f = u(this, a));)
			if (256 > f) d >= e && (this.b = d, c = this.f(), d = this.b), c[d++] = f;
			else
				for (f -= 257, h = T[f], 0 < Q[f] && (h += t(this, Q[f])), f = u(this, b), g = U[f], 0 < R[f] && (g += t(this, R[f])), d >= e && (this.b = d, c = this.f(), d = this.b); h--;) c[d] = c[d++-g];
		for (; 8 <= this.e;) this.e -= 8, this.c--;
		this.b = d
	};
	r.prototype.I = function(a, b) {
		var c = this.a,
			d = this.b;
		this.u = a;
		for (var e = c.length, f, g, h; 256 !== (f = u(this, a));)
			if (256 > f) d >= e && (c = this.f(), e = c.length), c[d++] = f;
			else
				for (f -= 257, h = T[f], 0 < Q[f] && (h += t(this, Q[f])), f = u(this, b), g = U[f], 0 < R[f] && (g += t(this, R[f])), d + h > e && (c = this.f(), e = c.length); h--;) c[d] = c[d++-g];
		for (; 8 <= this.e;) this.e -= 8, this.c--;
		this.b = d
	};
	r.prototype.f = function() {
		var a = new(x ? Uint8Array : Array)(this.b - 32768),
			b = this.b - 32768,
			c, d, e = this.a;
		if (x) a.set(e.subarray(32768, a.length));
		else
			for (c = 0, d = a.length; c < d; ++c) a[c] = e[c + 32768];
		this.k.push(a);
		this.q += a.length;
		if (x) e.set(e.subarray(b, b + 32768));
		else
			for (c = 0; 32768 > c; ++c) e[c] = e[b + c];
		this.b = 32768;
		return e
	};
	r.prototype.J = function(a) {
		var b, c = this.input.length / this.c + 1 | 0,
			d, e, f, g = this.input,
			h = this.a;
		a && ("number" === typeof a.v && (c = a.v), "number" === typeof a.F && (c += a.F));
		2 > c ? (d = (g.length - this.c) / this.u[2], f = d / 2 * 258 | 0, e = f < h.length ? h.length + f : h.length << 1) : e = h.length * c;
		x ? (b = new Uint8Array(e), b.set(h)) : b = h;
		return this.a = b
	};
	r.prototype.t = function() {
		var a = 0,
			b = this.a,
			c = this.k,
			d, e = new(x ? Uint8Array : Array)(this.q + (this.b - 32768)),
			f, g, h, k;
		if (0 === c.length) return x ? this.a.subarray(32768, this.b) : this.a.slice(32768, this.b);
		f = 0;
		for (g = c.length; f < g; ++f)
			for (d = c[f], h = 0, k = d.length; h < k; ++h) e[a++] = d[h];
		f = 32768;
		for (g = this.b; f < g; ++f) e[a++] = b[f];
		this.k = [];
		return this.buffer = e
	};
	r.prototype.H = function() {
		var a, b = this.b;
		x ? this.B ? (a = new Uint8Array(b), a.set(this.a.subarray(0, b))) : a = this.a.subarray(0, b) : (this.a.length > b && (this.a.length = b), a = this.a);
		return this.buffer = a
	};
	v.prototype.p = function() {
		var b = this.input,
			d, e;
		d = this.A.p();
		this.c = this.A.c;
		this.M && (e = (b[this.c++] << 24 | b[this.c++] << 16 | b[this.c++] << 8 | b[this.c++]) >>> 0, e !== c(d) && a(Error("invalid adler-32 checksum")));
		return d
	};
	b("Zlib.Inflate", v);
	b("Zlib.Inflate.BufferType", z);
	z.ADAPTIVE = z.C;
	z.BLOCK = z.D;
	b("Zlib.Inflate.prototype.decompress", v.prototype.p);
	z = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
	x && new Uint16Array(z);
	z = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258];
	x && new Uint16Array(z);
	z = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0];
	x && new Uint8Array(z);
	z = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
	x && new Uint16Array(z);
	z = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
	x && new Uint8Array(z);
	z = new(x ? Uint8Array : Array)(288);
	w = 0;
	for (B = z.length; w < B; ++w) z[w] = 143 >= w ? 8 : 255 >= w ? 9 : 279 >= w ? 7 : 8;
	f(z);
	z = new(x ? Uint8Array : Array)(30);
	w = 0;
	for (B = z.length; w < B; ++w) z[w] = 5;
	f(z);
	var O = 8
}).call(this);
_p = window;
_p = _p.Zlib = _p.Zlib;
_p.Deflate = _p.Deflate;
_p.Deflate.compress = _p.Deflate.compress;
_p.Inflate = _p.Inflate;
_p.Inflate.BufferType = _p.Inflate.BufferType;
_p.Inflate.prototype.decompress = _p.Inflate.prototype.decompress;
cc.PNGReader = cc.Class.extend({
	ctor: function(a) {
		var b, c, d, e;
		this.data = a;
		this.pos = 8;
		this.palette = [];
		this.imgData = [];
		this.transparency = {};
		this.animation = null;
		this.text = {};
		for (d = null;;) {
			b = this.readUInt32();
			e = a = void 0;
			e = [];
			for (a = 0; 4 > a; ++a) e.push(String.fromCharCode(this.data[this.pos++]));
			a = e.join("");
			switch (a) {
				case "IHDR":
					this.width = this.readUInt32();
					this.height = this.readUInt32();
					this.bits = this.data[this.pos++];
					this.colorType = this.data[this.pos++];
					this.compressionMethod = this.data[this.pos++];
					this.filterMethod = this.data[this.pos++];
					this.interlaceMethod = this.data[this.pos++];
					break;
				case "acTL":
					this.animation = {
						numFrames: this.readUInt32(),
						numPlays: this.readUInt32() || Infinity,
						frames: []
					};
					break;
				case "PLTE":
					this.palette = this.read(b);
					break;
				case "fcTL":
					d && this.animation.frames.push(d);
					this.pos += 4;
					d = {
						width: this.readUInt32(),
						height: this.readUInt32(),
						xOffset: this.readUInt32(),
						yOffset: this.readUInt32()
					};
					a = this.readUInt16();
					b = this.readUInt16() || 100;
					d.delay = 1E3 * a / b;
					d.disposeOp = this.data[this.pos++];
					d.blendOp = this.data[this.pos++];
					d.data = [];
					break;
				case "IDAT":
				case "fdAT":
					"fdAT" === a && (this.pos += 4, b -= 4);
					a = (null != d ? d.data : void 0) || this.imgData;
					for (e = 0; 0 <= b ? e < b : e > b; 0 <= b ? ++e : --e) a.push(this.data[this.pos++]);
					break;
				case "tRNS":
					this.transparency = {};
					switch (this.colorType) {
						case 3:
							this.transparency.indexed = this.read(b);
							b = 255 - this.transparency.indexed.length;
							if (0 < b)
								for (a = 0; 0 <= b ? a < b : a > b; 0 <= b ? ++a : --a) this.transparency.indexed.push(255);
							break;
						case 0:
							this.transparency.grayscale = this.read(b)[0];
							break;
						case 2:
							this.transparency.rgb = this.read(b)
					}
					break;
				case "tEXt":
					e = this.read(b);
					b = e.indexOf(0);
					a = String.fromCharCode.apply(String, e.slice(0, b));
					this.text[a] = String.fromCharCode.apply(String, e.slice(b + 1));
					break;
				case "IEND":
					d && this.animation.frames.push(d);
					a: {
						switch (this.colorType) {
							case 0:
							case 3:
							case 4:
								d = 1;
								break a;
							case 2:
							case 6:
								d = 3;
								break a
						}
						d = void 0
					}
					this.colors = d;
					this.hasAlphaChannel = 4 === (c = this.colorType) || 6 === c;
					c = this.colors + (this.hasAlphaChannel ? 1 : 0);
					this.pixelBitlength = this.bits * c;
					a: {
						switch (this.colors) {
							case 1:
								c = "DeviceGray";
								break a;
							case 3:
								c = "DeviceRGB";
								break a
						}
						c = void 0
					}
					this.colorSpace = c;
					Uint8Array != Array && (this.imgData = new Uint8Array(this.imgData));
					return;
				default:
					this.pos += b
			}
			this.pos += 4;
			if (this.pos > this.data.length) throw Error("Incomplete or corrupt PNG file");
		}
	},
	read: function(a) {
		var b, c;
		c = [];
		for (b = 0; 0 <= a ? b < a : b > a; 0 <= a ? ++b : --b) c.push(this.data[this.pos++]);
		return c
	},
	readUInt32: function() {
		var a, b, c, d;
		a = this.data[this.pos++] << 24;
		b = this.data[this.pos++] << 16;
		c = this.data[this.pos++] << 8;
		d = this.data[this.pos++];
		return a | b | c | d
	},
	readUInt16: function() {
		var a, b;
		a = this.data[this.pos++] << 8;
		b = this.data[this.pos++];
		return a | b
	},
	decodePixels: function(a) {
		var b, c, d, e, f, g, h, k, m, n, q, s, r, t, u;
		null == a && (a = this.imgData);
		if (0 === a.length) return new Uint8Array(0);
		a = (new Zlib.Inflate(a, {
			index: 0,
			verify: !1
		})).decompress();
		k = this.pixelBitlength / 8;
		s = k * this.width;
		m = new Uint8Array(s * this.height);
		g = a.length;
		for (c = n = q = 0; n < g;) {
			switch (a[n++]) {
				case 0:
					for (b = 0; b < s; b += 1) m[c++] = a[n++];
					break;
				case 1:
					for (e = r = 0; r < s; e = r += 1) b = a[n++], f = e < k ? 0 : m[c - k], m[c++] = (b + f) % 256;
					break;
				case 2:
					for (e = f = 0; f < s; e = f += 1) b = a[n++], d = (e - e % k) / k, r = q && m[(q - 1) * s + d * k + e % k], m[c++] = (r + b) % 256;
					break;
				case 3:
					for (e = u = 0; u < s; e = u += 1) b = a[n++], d = (e - e % k) / k, f = e < k ? 0 : m[c - k], r = q && m[(q - 1) * s + d * k + e % k], m[c++] = (b + Math.floor((f + r) / 2)) % 256;
					break;
				case 4:
					for (e = u = 0; u < s; e = u += 1) b = a[n++], d = (e - e % k) / k, f = e < k ? 0 : m[c - k], 0 === q ? r = t = 0 : (r = m[(q - 1) * s + d * k + e % k], t = d && m[(q - 1) * s + (d - 1) * k + e % k]), h = f + r - t, e = Math.abs(h - f), d = Math.abs(h - r), h = Math.abs(h - t), f = e <= d && e <= h ? f : d <= h ? r : t, m[c++] = (b + f) % 256;
					break;
				default:
					throw Error("Invalid filter algorithm: " + a[n - 1]);
			}
			q++
		}
		return m
	},
	copyToImageData: function(a, b) {
		var c, d, e, f, g, h, k, m;
		d = this.colors;
		m = null;
		c = this.hasAlphaChannel;
		this.palette.length && (m = null != (e = this._decodedPalette) ? e : this._decodedPalette = this.decodePalette(), d = 4, c = !0);
		e = a.data || a;
		k = e.length;
		g = m || b;
		f = h = 0;
		if (1 === d)
			for (; f < k;) d = m ? 4 * b[f / 4] : h, h = g[d++], e[f++] = h, e[f++] = h, e[f++] = h, e[f++] = c ? g[d++] : 255, h = d;
		else
			for (; f < k;) d = m ? 4 * b[f / 4] : h, e[f++] = g[d++], e[f++] = g[d++], e[f++] = g[d++], e[f++] = c ? g[d++] : 255, h = d
	},
	decodePalette: function() {
		var a, b, c, d, e, f, g, h, k;
		c = this.palette;
		f = this.transparency.indexed || [];
		e = new Uint8Array((f.length || 0) + c.length);
		b = g = a = d = 0;
		for (h = c.length; g < h; b = g += 3) e[d++] = c[b], e[d++] = c[b + 1], e[d++] = c[b + 2], e[d++] = null != (k = f[a++]) ? k : 255;
		return e
	},
	render: function(a) {
		var b;
		a.width = this.width;
		a.height = this.height;
		a = a.getContext("2d");
		b = a.createImageData(this.width, this.height);
		this.copyToImageData(b, this.decodePixels());
		return a.putImageData(b, 0, 0)
	}
});
cc.tiffReader = {
	_littleEndian: !1,
	_tiffData: null,
	_fileDirectories: [],
	getUint8: function(a) {
		return this._tiffData[a]
	},
	getUint16: function(a) {
		return this._littleEndian ? this._tiffData[a + 1] << 8 | this._tiffData[a] : this._tiffData[a] << 8 | this._tiffData[a + 1]
	},
	getUint32: function(a) {
		var b = this._tiffData;
		return this._littleEndian ? b[a + 3] << 24 | b[a + 2] << 16 | b[a + 1] << 8 | b[a] : b[a] << 24 | b[a + 1] << 16 | b[a + 2] << 8 | b[a + 3]
	},
	checkLittleEndian: function() {
		var a = this.getUint16(0);
		if (18761 === a) this.littleEndian = !0;
		else if (19789 === a) this.littleEndian = !1;
		else throw console.log(a), TypeError("Invalid byte order value.");
		return this.littleEndian
	},
	hasTowel: function() {
		if (42 !== this.getUint16(2)) throw RangeError("You forgot your towel!");
		return !0
	},
	getFieldTypeName: function(a) {
		var b = this.fieldTypeNames;
		return a in b ? b[a] : null
	},
	getFieldTagName: function(a) {
		var b = this.fieldTagNames;
		if (a in b) return b[a];
		console.log("Unknown Field Tag:", a);
		return "Tag" + a
	},
	getFieldTypeLength: function(a) {
		return -1 !== ["BYTE", "ASCII", "SBYTE", "UNDEFINED"].indexOf(a) ? 1 : -1 !== ["SHORT", "SSHORT"].indexOf(a) ? 2 : -1 !== ["LONG", "SLONG", "FLOAT"].indexOf(a) ? 4 : -1 !== ["RATIONAL", "SRATIONAL", "DOUBLE"].indexOf(a) ? 8 : null
	},
	getFieldValues: function(a, b, c, d) {
		a = [];
		var e = this.getFieldTypeLength(b);
		if (4 >= e * c) !1 === this.littleEndian ? a.push(d >>> 8 * (4 - e)) : a.push(d);
		else
			for (var f = 0; f < c; f++) {
				var g = e * f;
				8 <= e ? -1 !== ["RATIONAL", "SRATIONAL"].indexOf(b) ? (a.push(this.getUint32(d + g)), a.push(this.getUint32(d + g + 4))) : cc.log("Can't handle this field type or size") : a.push(this.getBytes(e, d + g))
			}
		"ASCII" === b && a.forEach(function(a, b, c) {
			c[b] = String.fromCharCode(a)
		});
		return a
	},
	getBytes: function(a, b) {
		if (0 >= a) cc.log("No bytes requested");
		else {
			if (1 >= a) return this.getUint8(b);
			if (2 >= a) return this.getUint16(b);
			if (3 >= a) return this.getUint32(b) >>> 8;
			if (4 >= a) return this.getUint32(b);
			cc.log("Too many bytes requested")
		}
	},
	getBits: function(a, b, c) {
		c = c || 0;
		b += Math.floor(c / 8);
		var d = c + a;
		a = 32 - a;
		var e, f;
		0 >= d ? console.log("No bits requested") : 8 >= d ? (e = 24 + c, f = this.getUint8(b)) : 16 >= d ? (e = 16 + c, f = this.getUint16(b)) : 32 >= d ? (e = c, f = this.getUint32(b)) : console.log("Too many bits requested");
		return {
			bits: f << e >>> a,
			byteOffset: b + Math.floor(d / 8),
			bitOffset: d % 8
		}
	},
	parseFileDirectory: function(a) {
		var b = this.getUint16(a),
			c = [];
		a += 2;
		for (var d = 0; d < b; a += 12, d++) {
			var e = this.getUint16(a),
				f = this.getUint16(a + 2),
				g = this.getUint32(a + 4),
				h = this.getUint32(a + 8),
				e = this.getFieldTagName(e),
				f = this.getFieldTypeName(f),
				g = this.getFieldValues(e, f, g, h);
			c[e] = {
				type: f,
				values: g
			}
		}
		this._fileDirectories.push(c);
		b = this.getUint32(a);
		0 !== b && this.parseFileDirectory(b)
	},
	clampColorSample: function(a, b) {
		var c = Math.pow(2, 8 - b);
		return Math.floor(a * c + (c - 1))
	},
	parseTIFF: function(a, b) {
		b = b || cc.newElement("canvas");
		this._tiffData = a;
		this.canvas = b;
		this.checkLittleEndian();
		if (this.hasTowel()) {
			var c = this.getUint32(4);
			this._fileDirectories.length = 0;
			this.parseFileDirectory(c);
			var d = this._fileDirectories[0],
				c = d.ImageWidth.values[0],
				e = d.ImageLength.values[0];
			this.canvas.width = c;
			this.canvas.height = e;
			var f = [],
				g = d.Compression ? d.Compression.values[0] : 1,
				h = d.SamplesPerPixel.values[0],
				k = [],
				m = 0,
				n = !1;
			d.BitsPerSample.values.forEach(function(a, b, c) {
				k[b] = {
					bitsPerSample: a,
					hasBytesPerSample: !1,
					bytesPerSample: void 0
				};
				0 === a % 8 && (k[b].hasBytesPerSample = !0, k[b].bytesPerSample = a / 8);
				m += a
			}, this);
			if (0 === m % 8) var n = !0,
				q = m / 8;
			var s = d.StripOffsets.values,
				r = s.length;
			if (d.StripByteCounts) var t = d.StripByteCounts.values;
			else if (cc.log("Missing StripByteCounts!"), 1 === r) t = [Math.ceil(c * e * m / 8)];
			else throw Error("Cannot recover from missing StripByteCounts");
			for (var u = 0; u < r; u++) {
				var y = s[u];
				f[u] = [];
				for (var v = t[u], C = 0, E = 0, A = 1, x = !0, z = [], w = 0, B = 0, G = 0; C < v; C += A) switch (g) {
					case 1:
						A = 0;
						for (z = []; A < h; A++)
							if (k[A].hasBytesPerSample) z.push(this.getBytes(k[A].bytesPerSample, y + C + k[A].bytesPerSample * A));
							else {
								var H = this.getBits(k[A].bitsPerSample, y + C, E);
								z.push(H.bits);
								C = H.byteOffset - y;
								E = H.bitOffset;
								throw RangeError("Cannot handle sub-byte bits per sample");
							}
						f[u].push(z);
						if (n) A = q;
						else throw A = 0, RangeError("Cannot handle sub-byte bits per pixel");
						break;
					case 32773:
						if (x) {
							var x = !1,
								F = 1,
								J = 1,
								A = this.getInt8(y + C);
							0 <= A && 127 >= A ? F = A + 1 : -127 <= A && -1 >= A ? J = -A + 1 : x = !0
						} else {
							for (var L = this.getUint8(y + C), A = 0; A < J; A++) {
								if (k[B].hasBytesPerSample) G = G << 8 * w | L, w++, w === k[B].bytesPerSample && (z.push(G), G = w = 0, B++);
								else throw RangeError("Cannot handle sub-byte bits per sample");
								B === h && (f[u].push(z), z = [], B = 0)
							}
							F--;
							0 === F && (x = !0)
						}
						A = 1
				}
			}
			if (b.getContext) {
				q = this.canvas.getContext("2d");
				q.fillStyle = "rgba(255, 255, 255, 0)";
				u = d.RowsPerStrip ? d.RowsPerStrip.values[0] : e;
				y = f.length;
				e %= u;
				e = 0 === e ? u : e;
				C = u;
				g = 0;
				z = d.PhotometricInterpretation.values[0];
				F = [];
				J = 0;
				d.ExtraSamples && (F = d.ExtraSamples.values, J = F.length);
				if (d.ColorMap) var H = d.ColorMap.values,
					K = Math.pow(2, k[0].bitsPerSample);
				for (u = 0; u < y; u++) {
					u + 1 === y && (C = e);
					d = f[u].length;
					g *= u;
					for (n = h = 0; h < C, n < d; h++)
						for (s = 0; s < c; s++, n++) {
							t = f[u][n];
							x = E = v = 0;
							r = 1;
							if (0 < J)
								for (v = 0; v < J; v++)
									if (1 === F[v] || 2 === F[v]) {
										r = t[3 + v] / 256;
										break
									}
							switch (z) {
								case 0:
									if (k[0].hasBytesPerSample) var M = Math.pow(16, 2 * k[0].bytesPerSample);
									t.forEach(function(a, b, c) {
										c[b] = M - a
									});
								case 1:
									v = E = x = this.clampColorSample(t[0], k[0].bitsPerSample);
									break;
								case 2:
									v = this.clampColorSample(t[0], k[0].bitsPerSample);
									E = this.clampColorSample(t[1], k[1].bitsPerSample);
									x = this.clampColorSample(t[2], k[2].bitsPerSample);
									break;
								case 3:
									if (void 0 === H) throw Error("Palette image missing color map");
									t = t[0];
									v = this.clampColorSample(H[t], 16);
									E = this.clampColorSample(H[K + t], 16);
									x = this.clampColorSample(H[2 * K + t], 16);
									break;
								default:
									throw RangeError("Unknown Photometric Interpretation:", z);
							}
							q.fillStyle = "rgba(" + v + ", " + E + ", " + x + ", " + r + ")";
							q.fillRect(s, g + h, 1, 1)
						}
					g = C
				}
			}
			return this.canvas
		}
	},
	fieldTagNames: {
		315: "Artist",
		258: "BitsPerSample",
		265: "CellLength",
		264: "CellWidth",
		320: "ColorMap",
		259: "Compression",
		33432: "Copyright",
		306: "DateTime",
		338: "ExtraSamples",
		266: "FillOrder",
		289: "FreeByteCounts",
		288: "FreeOffsets",
		291: "GrayResponseCurve",
		290: "GrayResponseUnit",
		316: "HostComputer",
		270: "ImageDescription",
		257: "ImageLength",
		256: "ImageWidth",
		271: "Make",
		281: "MaxSampleValue",
		280: "MinSampleValue",
		272: "Model",
		254: "NewSubfileType",
		274: "Orientation",
		262: "PhotometricInterpretation",
		284: "PlanarConfiguration",
		296: "ResolutionUnit",
		278: "RowsPerStrip",
		277: "SamplesPerPixel",
		305: "Software",
		279: "StripByteCounts",
		273: "StripOffsets",
		255: "SubfileType",
		263: "Threshholding",
		282: "XResolution",
		283: "YResolution",
		326: "BadFaxLines",
		327: "CleanFaxData",
		343: "ClipPath",
		328: "ConsecutiveBadFaxLines",
		433: "Decode",
		434: "DefaultImageColor",
		269: "DocumentName",
		336: "DotRange",
		321: "HalftoneHints",
		346: "Indexed",
		347: "JPEGTables",
		285: "PageName",
		297: "PageNumber",
		317: "Predictor",
		319: "PrimaryChromaticities",
		532: "ReferenceBlackWhite",
		339: "SampleFormat",
		559: "StripRowCounts",
		330: "SubIFDs",
		292: "T4Options",
		293: "T6Options",
		325: "TileByteCounts",
		323: "TileLength",
		324: "TileOffsets",
		322: "TileWidth",
		301: "TransferFunction",
		318: "WhitePoint",
		344: "XClipPathUnits",
		286: "XPosition",
		529: "YCbCrCoefficients",
		531: "YCbCrPositioning",
		530: "YCbCrSubSampling",
		345: "YClipPathUnits",
		287: "YPosition",
		37378: "ApertureValue",
		40961: "ColorSpace",
		36868: "DateTimeDigitized",
		36867: "DateTimeOriginal",
		34665: "Exif IFD",
		36864: "ExifVersion",
		33434: "ExposureTime",
		41728: "FileSource",
		37385: "Flash",
		40960: "FlashpixVersion",
		33437: "FNumber",
		42016: "ImageUniqueID",
		37384: "LightSource",
		37500: "MakerNote",
		37377: "ShutterSpeedValue",
		37510: "UserComment",
		33723: "IPTC",
		34675: "ICC Profile",
		700: "XMP",
		42112: "GDAL_METADATA",
		42113: "GDAL_NODATA",
		34377: "Photoshop"
	},
	fieldTypeNames: {
		1: "BYTE",
		2: "ASCII",
		3: "SHORT",
		4: "LONG",
		5: "RATIONAL",
		6: "SBYTE",
		7: "UNDEFINED",
		8: "SSHORT",
		9: "SLONG",
		10: "SRATIONAL",
		11: "FLOAT",
		12: "DOUBLE"
	}
};
cc.Particle = function(a, b, c, d, e, f, g, h, k, m, n, q) {
	this.pos = a ? a : cc.p(0, 0);
	this.startPos = b ? b : cc.p(0, 0);
	this.color = c ? c : {
		r: 0,
		g: 0,
		b: 0,
		a: 255
	};
	this.deltaColor = d ? d : {
		r: 0,
		g: 0,
		b: 0,
		a: 255
	};
	this.size = e || 0;
	this.deltaSize = f || 0;
	this.rotation = g || 0;
	this.deltaRotation = h || 0;
	this.timeToLive = k || 0;
	this.atlasIndex = m || 0;
	this.modeA = n ? n : new cc.Particle.ModeA;
	this.modeB = q ? q : new cc.Particle.ModeB;
	this.isChangeColor = !1;
	this.drawPos = cc.p(0, 0)
};
cc.Particle.ModeA = function(a, b, c) {
	this.dir = a ? a : cc.p(0, 0);
	this.radialAccel = b || 0;
	this.tangentialAccel = c || 0
};
cc.Particle.ModeB = function(a, b, c, d) {
	this.angle = a || 0;
	this.degreesPerSecond = b || 0;
	this.radius = c || 0;
	this.deltaRadius = d || 0
};
cc.Particle.TemporaryPoints = [cc.p(), cc.p(), cc.p(), cc.p()];
cc.ParticleSystem = cc.Node.extend({
	_plistFile: "",
	_elapsed: 0,
	_dontTint: !1,
	modeA: null,
	modeB: null,
	_className: "ParticleSystem",
	_pointZeroForParticle: cc.p(0, 0),
	_particles: null,
	_emitCounter: 0,
	_particleIdx: 0,
	_batchNode: null,
	atlasIndex: 0,
	_transformSystemDirty: !1,
	_allocatedParticles: 0,
	drawMode: null,
	shapeType: null,
	_isActive: !1,
	particleCount: 0,
	duration: 0,
	_sourcePosition: null,
	_posVar: null,
	life: 0,
	lifeVar: 0,
	angle: 0,
	angleVar: 0,
	startSize: 0,
	startSizeVar: 0,
	endSize: 0,
	endSizeVar: 0,
	_startColor: null,
	_startColorVar: null,
	_endColor: null,
	_endColorVar: null,
	startSpin: 0,
	startSpinVar: 0,
	endSpin: 0,
	endSpinVar: 0,
	emissionRate: 0,
	_totalParticles: 0,
	_texture: null,
	_blendFunc: null,
	_opacityModifyRGB: !1,
	positionType: null,
	autoRemoveOnFinish: !1,
	emitterMode: 0,
	_quads: null,
	_indices: null,
	_buffersVBO: null,
	_pointRect: null,
	_textureLoaded: null,
	_quadsArrayBuffer: null,
	ctor: function(a) {
		cc.Node.prototype.ctor.call(this);
		this.emitterMode = cc.ParticleSystem.MODE_GRAVITY;
		this.modeA = new cc.ParticleSystem.ModeA;
		this.modeB = new cc.ParticleSystem.ModeB;
		this._blendFunc = {
			src: cc.BLEND_SRC,
			dst: cc.BLEND_DST
		};
		this._particles = [];
		this._sourcePosition = cc.p(0, 0);
		this._posVar = cc.p(0, 0);
		this._startColor = cc.color(255, 255, 255, 255);
		this._startColorVar = cc.color(255, 255, 255, 255);
		this._endColor = cc.color(255, 255, 255, 255);
		this._endColorVar = cc.color(255, 255, 255, 255);
		this._plistFile = "";
		this._elapsed = 0;
		this._dontTint = !1;
		this._pointZeroForParticle = cc.p(0, 0);
		this._particleIdx = this._emitCounter = 0;
		this._batchNode = null;
		this.atlasIndex = 0;
		this._transformSystemDirty = !1;
		this._allocatedParticles = 0;
		this.drawMode = cc.ParticleSystem.SHAPE_MODE;
		this.shapeType = cc.ParticleSystem.BALL_SHAPE;
		this._isActive = !1;
		this._totalParticles = this.emissionRate = this.endSpinVar = this.endSpin = this.startSpinVar = this.startSpin = this.endSizeVar = this.endSize = this.startSizeVar = this.startSize = this.angleVar = this.angle = this.lifeVar = this.life = this.duration = this.particleCount = 0;
		this._texture = null;
		this._opacityModifyRGB = !1;
		this.positionType = cc.ParticleSystem.TYPE_FREE;
		this.autoRemoveOnFinish = !1;
		this._buffersVBO = [0, 0];
		this._quads = [];
		this._indices = [];
		this._pointRect = cc.rect(0, 0, 0, 0);
		this._textureLoaded = !0;
		cc._renderType === cc._RENDER_TYPE_WEBGL && (this._quadsArrayBuffer = null);
		!a || cc.isNumber(a) ? (a = a || 100, this.setDrawMode(cc.ParticleSystem.TEXTURE_MODE), this.initWithTotalParticles(a)) : a && this.initWithFile(a)
	},
	initIndices: function() {
		for (var a = this._indices, b = 0, c = this._totalParticles; b < c; ++b) {
			var d = 6 * b,
				e = 4 * b;
			a[d + 0] = e + 0;
			a[d + 1] = e + 1;
			a[d + 2] = e + 2;
			a[d + 5] = e + 1;
			a[d + 4] = e + 2;
			a[d + 3] = e + 3
		}
	},
	initTexCoordsWithRect: function(a) {
		var b = cc.contentScaleFactor(),
			c = cc.rect(a.x * b, a.y * b, a.width * b, a.height * b),
			d = a.width,
			e = a.height;
		this._texture && (d = this._texture.pixelsWidth, e = this._texture.pixelsHeight);
		if (cc._renderType !== cc._RENDER_TYPE_CANVAS) {
			cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL ? (a = (2 * c.x + 1) / (2 * d), b = (2 * c.y + 1) / (2 * e), d = a + (2 * c.width - 2) / (2 * d), c = b + (2 * c.height - 2) / (2 * e)) : (a = c.x / d, b = c.y / e, d = a + c.width / d, c = b + c.height / e);
			var e = c,
				c = b,
				b = e,
				f = 0,
				g = 0;
			this._batchNode ? (e = this._batchNode.textureAtlas.quads, f = this.atlasIndex, g = this.atlasIndex + this._totalParticles) : (e = this._quads, f = 0, g = this._totalParticles);
			for (; f < g; f++) {
				e[f] || (e[f] = cc.V3F_C4B_T2F_QuadZero());
				var h = e[f];
				h.bl.texCoords.u = a;
				h.bl.texCoords.v = b;
				h.br.texCoords.u = d;
				h.br.texCoords.v = b;
				h.tl.texCoords.u = a;
				h.tl.texCoords.v = c;
				h.tr.texCoords.u = d;
				h.tr.texCoords.v = c
			}
		}
	},
	getBatchNode: function() {
		return this._batchNode
	},
	setBatchNode: function(a) {
		if (this._batchNode != a) {
			var b = this._batchNode;
			if (this._batchNode = a)
				for (var c = this._particles, d = 0; d < this._totalParticles; d++) c[d].atlasIndex = d;
			a ? b || (this._batchNode.textureAtlas._copyQuadsToTextureAtlas(this._quads, this.atlasIndex), cc._renderContext.deleteBuffer(this._buffersVBO[1])) : (this._allocMemory(), this.initIndices(), this.setTexture(b.getTexture()), this._setupVBO())
		}
	},
	getAtlasIndex: function() {
		return this.atlasIndex
	},
	setAtlasIndex: function(a) {
		this.atlasIndex = a
	},
	getDrawMode: function() {
		return this.drawMode
	},
	setDrawMode: function(a) {
		this.drawMode = a
	},
	getShapeType: function() {
		return this.shapeType
	},
	setShapeType: function(a) {
		this.shapeType = a
	},
	isActive: function() {
		return this._isActive
	},
	getParticleCount: function() {
		return this.particleCount
	},
	setParticleCount: function(a) {
		this.particleCount = a
	},
	getDuration: function() {
		return this.duration
	},
	setDuration: function(a) {
		this.duration = a
	},
	getSourcePosition: function() {
		return {
			x: this._sourcePosition.x,
			y: this._sourcePosition.y
		}
	},
	setSourcePosition: function(a) {
		this._sourcePosition = a
	},
	getPosVar: function() {
		return {
			x: this._posVar.x,
			y: this._posVar.y
		}
	},
	setPosVar: function(a) {
		this._posVar = a
	},
	getLife: function() {
		return this.life
	},
	setLife: function(a) {
		this.life = a
	},
	getLifeVar: function() {
		return this.lifeVar
	},
	setLifeVar: function(a) {
		this.lifeVar = a
	},
	getAngle: function() {
		return this.angle
	},
	setAngle: function(a) {
		this.angle = a
	},
	getAngleVar: function() {
		return this.angleVar
	},
	setAngleVar: function(a) {
		this.angleVar = a
	},
	getGravity: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.getGravity() : Particle Mode should be Gravity");
		var a = this.modeA.gravity;
		return cc.p(a.x, a.y)
	},
	setGravity: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.setGravity() : Particle Mode should be Gravity");
		this.modeA.gravity = a
	},
	getSpeed: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.getSpeed() : Particle Mode should be Gravity");
		return this.modeA.speed
	},
	setSpeed: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.setSpeed() : Particle Mode should be Gravity");
		this.modeA.speed = a
	},
	getSpeedVar: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.getSpeedVar() : Particle Mode should be Gravity");
		return this.modeA.speedVar
	},
	setSpeedVar: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.setSpeedVar() : Particle Mode should be Gravity");
		this.modeA.speedVar = a
	},
	getTangentialAccel: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.getTangentialAccel() : Particle Mode should be Gravity");
		return this.modeA.tangentialAccel
	},
	setTangentialAccel: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.setTangentialAccel() : Particle Mode should be Gravity");
		this.modeA.tangentialAccel = a
	},
	getTangentialAccelVar: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.getTangentialAccelVar() : Particle Mode should be Gravity");
		return this.modeA.tangentialAccelVar
	},
	setTangentialAccelVar: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.setTangentialAccelVar() : Particle Mode should be Gravity");
		this.modeA.tangentialAccelVar = a
	},
	getRadialAccel: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.getRadialAccel() : Particle Mode should be Gravity");
		return this.modeA.radialAccel
	},
	setRadialAccel: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.setRadialAccel() : Particle Mode should be Gravity");
		this.modeA.radialAccel = a
	},
	getRadialAccelVar: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.getRadialAccelVar() : Particle Mode should be Gravity");
		return this.modeA.radialAccelVar
	},
	setRadialAccelVar: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.setRadialAccelVar() : Particle Mode should be Gravity");
		this.modeA.radialAccelVar = a
	},
	getRotationIsDir: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.getRotationIsDir() : Particle Mode should be Gravity");
		return this.modeA.rotationIsDir
	},
	setRotationIsDir: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_GRAVITY && cc.log("cc.ParticleBatchNode.setRotationIsDir() : Particle Mode should be Gravity");
		this.modeA.rotationIsDir = a
	},
	getStartRadius: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.getStartRadius() : Particle Mode should be Radius");
		return this.modeB.startRadius
	},
	setStartRadius: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.setStartRadius() : Particle Mode should be Radius");
		this.modeB.startRadius = a
	},
	getStartRadiusVar: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.getStartRadiusVar() : Particle Mode should be Radius");
		return this.modeB.startRadiusVar
	},
	setStartRadiusVar: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.setStartRadiusVar() : Particle Mode should be Radius");
		this.modeB.startRadiusVar = a
	},
	getEndRadius: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.getEndRadius() : Particle Mode should be Radius");
		return this.modeB.endRadius
	},
	setEndRadius: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.setEndRadius() : Particle Mode should be Radius");
		this.modeB.endRadius = a
	},
	getEndRadiusVar: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.getEndRadiusVar() : Particle Mode should be Radius");
		return this.modeB.endRadiusVar
	},
	setEndRadiusVar: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.setEndRadiusVar() : Particle Mode should be Radius");
		this.modeB.endRadiusVar = a
	},
	getRotatePerSecond: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.getRotatePerSecond() : Particle Mode should be Radius");
		return this.modeB.rotatePerSecond
	},
	setRotatePerSecond: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.setRotatePerSecond() : Particle Mode should be Radius");
		this.modeB.rotatePerSecond = a
	},
	getRotatePerSecondVar: function() {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.getRotatePerSecondVar() : Particle Mode should be Radius");
		return this.modeB.rotatePerSecondVar
	},
	setRotatePerSecondVar: function(a) {
		this.emitterMode !== cc.ParticleSystem.MODE_RADIUS && cc.log("cc.ParticleBatchNode.setRotatePerSecondVar() : Particle Mode should be Radius");
		this.modeB.rotatePerSecondVar = a
	},
	setScale: function(a, b) {
		this._transformSystemDirty = !0;
		cc.Node.prototype.setScale.call(this, a, b)
	},
	setRotation: function(a) {
		this._transformSystemDirty = !0;
		cc.Node.prototype.setRotation.call(this, a)
	},
	setScaleX: function(a) {
		this._transformSystemDirty = !0;
		cc.Node.prototype.setScaleX.call(this, a)
	},
	setScaleY: function(a) {
		this._transformSystemDirty = !0;
		cc.Node.prototype.setScaleY.call(this, a)
	},
	getStartSize: function() {
		return this.startSize
	},
	setStartSize: function(a) {
		this.startSize = a
	},
	getStartSizeVar: function() {
		return this.startSizeVar
	},
	setStartSizeVar: function(a) {
		this.startSizeVar = a
	},
	getEndSize: function() {
		return this.endSize
	},
	setEndSize: function(a) {
		this.endSize = a
	},
	getEndSizeVar: function() {
		return this.endSizeVar
	},
	setEndSizeVar: function(a) {
		this.endSizeVar = a
	},
	getStartColor: function() {
		return cc.color(this._startColor.r, this._startColor.g, this._startColor.b, this._startColor.a)
	},
	setStartColor: function(a) {
		this._startColor = cc.color(a)
	},
	getStartColorVar: function() {
		return cc.color(this._startColorVar.r, this._startColorVar.g, this._startColorVar.b, this._startColorVar.a)
	},
	setStartColorVar: function(a) {
		this._startColorVar = cc.color(a)
	},
	getEndColor: function() {
		return cc.color(this._endColor.r, this._endColor.g, this._endColor.b, this._endColor.a)
	},
	setEndColor: function(a) {
		this._endColor = cc.color(a)
	},
	getEndColorVar: function() {
		return cc.color(this._endColorVar.r, this._endColorVar.g, this._endColorVar.b, this._endColorVar.a)
	},
	setEndColorVar: function(a) {
		this._endColorVar = cc.color(a)
	},
	getStartSpin: function() {
		return this.startSpin
	},
	setStartSpin: function(a) {
		this.startSpin = a
	},
	getStartSpinVar: function() {
		return this.startSpinVar
	},
	setStartSpinVar: function(a) {
		this.startSpinVar = a
	},
	getEndSpin: function() {
		return this.endSpin
	},
	setEndSpin: function(a) {
		this.endSpin = a
	},
	getEndSpinVar: function() {
		return this.endSpinVar
	},
	setEndSpinVar: function(a) {
		this.endSpinVar = a
	},
	getEmissionRate: function() {
		return this.emissionRate
	},
	setEmissionRate: function(a) {
		this.emissionRate = a
	},
	getTotalParticles: function() {
		return this._totalParticles
	},
	setTotalParticles: function(a) {
		if (cc._renderType === cc._RENDER_TYPE_CANVAS) this._totalParticles = 200 > a ? a : 200;
		else {
			if (a > this._allocatedParticles) {
				var b = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT;
				this._indices = new Uint16Array(6 * a);
				var c = new ArrayBuffer(a * b),
					d = this._particles;
				d.length = 0;
				for (var e = this._quads, f = e.length = 0; f < a; f++) d[f] = new cc.Particle, e[f] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, c, f * b);
				this._totalParticles = this._allocatedParticles = a;
				if (this._batchNode)
					for (b = 0; b < a; b++) d[b].atlasIndex = b;
				this._quadsArrayBuffer = c;
				this.initIndices();
				this._setupVBO();
				this._texture && this.initTexCoordsWithRect(cc.rect(0, 0, this._texture.width, this._texture.height))
			} else this._totalParticles = a;
			this.resetSystem()
		}
	},
	getTexture: function() {
		return this._texture
	},
	setTexture: function(a) {
		a.isLoaded() ? this.setTextureWithRect(a, cc.rect(0, 0, a.width, a.height)) : (this._textureLoaded = !1, a.addLoadedEventListener(function(a) {
			this._textureLoaded = !0;
			this.setTextureWithRect(a, cc.rect(0, 0, a.width, a.height))
		}, this))
	},
	getBlendFunc: function() {
		return this._blendFunc
	},
	setBlendFunc: function(a, b) {
		if (void 0 === b) this._blendFunc != a && (this._blendFunc = a, this._updateBlendFunc());
		else if (this._blendFunc.src != a || this._blendFunc.dst != b) this._blendFunc = {
			src: a,
			dst: b
		}, this._updateBlendFunc()
	},
	isOpacityModifyRGB: function() {
		return this._opacityModifyRGB
	},
	setOpacityModifyRGB: function(a) {
		this._opacityModifyRGB = a
	},
	isBlendAdditive: function() {
		return this._blendFunc.src == cc.SRC_ALPHA && this._blendFunc.dst == cc.ONE || this._blendFunc.src == cc.ONE && this._blendFunc.dst == cc.ONE
	},
	setBlendAdditive: function(a) {
		var b = this._blendFunc;
		a ? (b.src = cc.SRC_ALPHA, b.dst = cc.ONE) : cc._renderType === cc._RENDER_TYPE_WEBGL ? this._texture && !this._texture.hasPremultipliedAlpha() ? (b.src = cc.SRC_ALPHA, b.dst = cc.ONE_MINUS_SRC_ALPHA) : (b.src = cc.BLEND_SRC, b.dst = cc.BLEND_DST) : (b.src = cc.BLEND_SRC, b.dst = cc.BLEND_DST)
	},
	getPositionType: function() {
		return this.positionType
	},
	setPositionType: function(a) {
		this.positionType = a
	},
	isAutoRemoveOnFinish: function() {
		return this.autoRemoveOnFinish
	},
	setAutoRemoveOnFinish: function(a) {
		this.autoRemoveOnFinish = a
	},
	getEmitterMode: function() {
		return this.emitterMode
	},
	setEmitterMode: function(a) {
		this.emitterMode = a
	},
	init: function() {
		return this.initWithTotalParticles(150)
	},
	initWithFile: function(a) {
		this._plistFile = a;
		a = cc.loader.getRes(a);
		return a ? this.initWithDictionary(a, "") : (cc.log("cc.ParticleSystem.initWithFile(): Particles: file not found"), !1)
	},
	getBoundingBoxToWorld: function() {
		return cc.rect(0, 0, cc._canvas.width, cc._canvas.height)
	},
	initWithDictionary: function(a, b) {
		var c = !1,
			d = null,
			d = this._valueForKey,
			e = parseInt(d("maxParticles", a));
		if (this.initWithTotalParticles(e)) {
			this.angle = parseFloat(d("angle", a));
			this.angleVar = parseFloat(d("angleVariance", a));
			this.duration = parseFloat(d("duration", a));
			this._blendFunc.src = parseInt(d("blendFuncSource", a));
			this._blendFunc.dst = parseInt(d("blendFuncDestination", a));
			c = this._startColor;
			c.r = 255 * parseFloat(d("startColorRed", a));
			c.g = 255 * parseFloat(d("startColorGreen", a));
			c.b = 255 * parseFloat(d("startColorBlue", a));
			c.a = 255 * parseFloat(d("startColorAlpha", a));
			c = this._startColorVar;
			c.r = 255 * parseFloat(d("startColorVarianceRed", a));
			c.g = 255 * parseFloat(d("startColorVarianceGreen", a));
			c.b = 255 * parseFloat(d("startColorVarianceBlue", a));
			c.a = 255 * parseFloat(d("startColorVarianceAlpha", a));
			c = this._endColor;
			c.r = 255 * parseFloat(d("finishColorRed", a));
			c.g = 255 * parseFloat(d("finishColorGreen", a));
			c.b = 255 * parseFloat(d("finishColorBlue", a));
			c.a = 255 * parseFloat(d("finishColorAlpha", a));
			c = this._endColorVar;
			c.r = 255 * parseFloat(d("finishColorVarianceRed", a));
			c.g = 255 * parseFloat(d("finishColorVarianceGreen", a));
			c.b = 255 * parseFloat(d("finishColorVarianceBlue", a));
			c.a = 255 * parseFloat(d("finishColorVarianceAlpha", a));
			this.startSize = parseFloat(d("startParticleSize", a));
			this.startSizeVar = parseFloat(d("startParticleSizeVariance", a));
			this.endSize = parseFloat(d("finishParticleSize", a));
			this.endSizeVar = parseFloat(d("finishParticleSizeVariance", a));
			this.setPosition(parseFloat(d("sourcePositionx", a)), parseFloat(d("sourcePositiony", a)));
			this._posVar.x = parseFloat(d("sourcePositionVariancex", a));
			this._posVar.y = parseFloat(d("sourcePositionVariancey", a));
			this.startSpin = parseFloat(d("rotationStart", a));
			this.startSpinVar = parseFloat(d("rotationStartVariance", a));
			this.endSpin = parseFloat(d("rotationEnd", a));
			this.endSpinVar = parseFloat(d("rotationEndVariance", a));
			this.emitterMode = parseInt(d("emitterType", a));
			if (this.emitterMode == cc.ParticleSystem.MODE_GRAVITY) c = this.modeA, c.gravity.x = parseFloat(d("gravityx", a)), c.gravity.y = parseFloat(d("gravityy", a)), c.speed = parseFloat(d("speed", a)), c.speedVar = parseFloat(d("speedVariance", a)), e = d("radialAcceleration", a), c.radialAccel = e ? parseFloat(e) : 0, e = d("radialAccelVariance", a), c.radialAccelVar = e ? parseFloat(e) : 0, e = d("tangentialAcceleration", a), c.tangentialAccel = e ? parseFloat(e) : 0, e = d("tangentialAccelVariance", a), c.tangentialAccelVar = e ? parseFloat(e) : 0, e = d("rotationIsDir", a).toLowerCase(), c.rotationIsDir = null != e && ("true" === e || "1" === e);
			else if (this.emitterMode == cc.ParticleSystem.MODE_RADIUS) c = this.modeB, c.startRadius = parseFloat(d("maxRadius", a)), c.startRadiusVar = parseFloat(d("maxRadiusVariance", a)), c.endRadius = parseFloat(d("minRadius", a)), c.endRadiusVar = 0, c.rotatePerSecond = parseFloat(d("rotatePerSecond", a)), c.rotatePerSecondVar = parseFloat(d("rotatePerSecondVariance", a));
			else return cc.log("cc.ParticleSystem.initWithDictionary(): Invalid emitterType in config file"), !1;
			this.life = parseFloat(d("particleLifespan", a));
			this.lifeVar = parseFloat(d("particleLifespanVariance", a));
			this.emissionRate = this._totalParticles / this.life;
			if (!this._batchNode)
				if (this._opacityModifyRGB = !1, c = d("textureFileName", a), c = cc.path.changeBasename(this._plistFile, c), e = cc.textureCache.getTextureForKey(c)) this.setTexture(e);
				else if ((d = d("textureImageData", a)) && 0 !== d.length) {
				d = cc.unzipBase64AsArray(d, 1);
				if (!d) return cc.log("cc.ParticleSystem: error decoding or ungzipping textureImageData"), !1;
				e = cc.getImageFormatByData(d);
				if (e !== cc.FMT_TIFF && e !== cc.FMT_PNG) return cc.log("cc.ParticleSystem: unknown image format with Data"), !1;
				var f = cc.newElement("canvas");
				e === cc.FMT_PNG ? (new cc.PNGReader(d)).render(f) : cc.tiffReader.parseTIFF(d, f);
				cc.textureCache.cacheImage(c, f);
				(d = cc.textureCache.getTextureForKey(c)) || cc.log("cc.ParticleSystem.initWithDictionary() : error loading the texture");
				this.setTexture(d)
			} else {
				e = cc.textureCache.addImage(c);
				if (!e) return !1;
				this.setTexture(e)
			}
			c = !0
		}
		return c
	},
	initWithTotalParticles: function(a) {
		this._totalParticles = a;
		var b, c = this._particles;
		for (b = c.length = 0; b < a; b++) c[b] = new cc.Particle;
		if (!c) return cc.log("Particle system: not enough memory"), !1;
		this._allocatedParticles = a;
		if (this._batchNode)
			for (b = 0; b < this._totalParticles; b++) c[b].atlasIndex = b;
		this._isActive = !0;
		this._blendFunc.src = cc.BLEND_SRC;
		this._blendFunc.dst = cc.BLEND_DST;
		this.positionType = cc.ParticleSystem.TYPE_FREE;
		this.emitterMode = cc.ParticleSystem.MODE_GRAVITY;
		this._transformSystemDirty = this.autoRemoveOnFinish = !1;
		this.scheduleUpdateWithPriority(1);
		if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
			if (!this._allocMemory()) return !1;
			this.initIndices();
			this._setupVBO();
			this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR)
		}
		return !0
	},
	destroyParticleSystem: function() {
		this.unscheduleUpdate()
	},
	addParticle: function() {
		if (this.isFull()) return !1;
		var a, b = this._particles;
		cc._renderType === cc._RENDER_TYPE_CANVAS ? this.particleCount < b.length ? a = b[this.particleCount] : (a = new cc.Particle, b.push(a)) : a = b[this.particleCount];
		this.initParticle(a);
		++this.particleCount;
		return !0
	},
	initParticle: function(a) {
		var b = cc.randomMinus1To1;
		a.timeToLive = this.life + this.lifeVar * b();
		a.timeToLive = Math.max(0, a.timeToLive);
		a.pos.x = this._sourcePosition.x + this._posVar.x * b();
		a.pos.y = this._sourcePosition.y + this._posVar.y * b();
		var c, d;
		c = this._startColor;
		var e = this._startColorVar,
			f = this._endColor;
		d = this._endColorVar;
		cc._renderType === cc._RENDER_TYPE_CANVAS ? (c = cc.color(cc.clampf(c.r + e.r * b(), 0, 255), cc.clampf(c.g + e.g * b(), 0, 255), cc.clampf(c.b + e.b * b(), 0, 255), cc.clampf(c.a + e.a * b(), 0, 255)), d = cc.color(cc.clampf(f.r + d.r * b(), 0, 255), cc.clampf(f.g + d.g * b(), 0, 255), cc.clampf(f.b + d.b * b(), 0, 255), cc.clampf(f.a + d.a * b(), 0, 255))) : (c = {
			r: cc.clampf(c.r + e.r * b(), 0, 255),
			g: cc.clampf(c.g + e.g * b(), 0, 255),
			b: cc.clampf(c.b + e.b * b(), 0, 255),
			a: cc.clampf(c.a + e.a * b(), 0, 255)
		}, d = {
			r: cc.clampf(f.r + d.r * b(), 0, 255),
			g: cc.clampf(f.g + d.g * b(), 0, 255),
			b: cc.clampf(f.b + d.b * b(), 0, 255),
			a: cc.clampf(f.a + d.a * b(), 0, 255)
		});
		a.color = c;
		e = a.deltaColor;
		f = a.timeToLive;
		e.r = (d.r - c.r) / f;
		e.g = (d.g - c.g) / f;
		e.b = (d.b - c.b) / f;
		e.a = (d.a - c.a) / f;
		c = this.startSize + this.startSizeVar * b();
		c = Math.max(0, c);
		a.size = c;
		this.endSize === cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE ? a.deltaSize = 0 : (d = this.endSize + this.endSizeVar * b(), d = Math.max(0, d), a.deltaSize = (d - c) / f);
		c = this.startSpin + this.startSpinVar * b();
		d = this.endSpin +
			this.endSpinVar * b();
		a.rotation = c;
		a.deltaRotation = (d - c) / f;
		this.positionType == cc.ParticleSystem.TYPE_FREE ? a.startPos = this.convertToWorldSpace(this._pointZeroForParticle) : this.positionType == cc.ParticleSystem.TYPE_RELATIVE && (a.startPos.x = this._position.x, a.startPos.y = this._position.y);
		c = cc.degreesToRadians(this.angle + this.angleVar * b());
		if (this.emitterMode === cc.ParticleSystem.MODE_GRAVITY) f = this.modeA, d = a.modeA, e = f.speed + f.speedVar * b(), d.dir.x = Math.cos(c), d.dir.y = Math.sin(c), cc.pMultIn(d.dir, e), d.radialAccel = f.radialAccel + f.radialAccelVar * b(), d.tangentialAccel = f.tangentialAccel + f.tangentialAccelVar * b(), f.rotationIsDir && (a.rotation = -cc.radiansToDegrees(cc.pToAngle(d.dir)));
		else {
			d = this.modeB;
			a = a.modeB;
			var e = d.startRadius + d.startRadiusVar * b(),
				g = d.endRadius + d.endRadiusVar * b();
			a.radius = e;
			a.deltaRadius = d.endRadius === cc.ParticleSystem.START_RADIUS_EQUAL_TO_END_RADIUS ? 0 : (g - e) / f;
			a.angle = c;
			a.degreesPerSecond = cc.degreesToRadians(d.rotatePerSecond + d.rotatePerSecondVar * b())
		}
	},
	stopSystem: function() {
		this._isActive = !1;
		this._elapsed = this.duration;
		this._emitCounter = 0
	},
	resetSystem: function() {
		this._isActive = !0;
		this._elapsed = 0;
		var a = this._particles;
		for (this._particleIdx = 0; this._particleIdx < this.particleCount; ++this._particleIdx) a[this._particleIdx].timeToLive = 0
	},
	isFull: function() {
		return this.particleCount >= this._totalParticles
	},
	updateQuadWithParticle: function(a, b) {
		var c = null;
		this._batchNode ? (c = this._batchNode.textureAtlas.quads[this.atlasIndex + a.atlasIndex], this._batchNode.textureAtlas.dirty = !0) : c = this._quads[this._particleIdx];
		var d, e, f, g;
		this._opacityModifyRGB ? (d = 0 | a.color.r * a.color.a / 255, e = 0 | a.color.g * a.color.a / 255, f = 0 | a.color.b * a.color.a / 255) : (d = 0 | a.color.r, e = 0 | a.color.g, f = 0 | a.color.b);
		g = 0 | a.color.a;
		var h = c.bl.colors;
		h.r = d;
		h.g = e;
		h.b = f;
		h.a = g;
		h = c.br.colors;
		h.r = d;
		h.g = e;
		h.b = f;
		h.a = g;
		h = c.tl.colors;
		h.r = d;
		h.g = e;
		h.b = f;
		h.a = g;
		h = c.tr.colors;
		h.r = d;
		h.g = e;
		h.b = f;
		h.a = g;
		d = a.size / 2;
		if (a.rotation) {
			e = -d;
			f = -d;
			g = b.x;
			var h = b.y,
				k = -cc.degreesToRadians(a.rotation),
				m = Math.cos(k),
				k = Math.sin(k);
			c.bl.vertices.x = e * m - f * k + g;
			c.bl.vertices.y = e * k + f * m + h;
			c.br.vertices.x = d * m - f * k + g;
			c.br.vertices.y = d * k + f * m + h;
			c.tl.vertices.x = e * m - d * k + g;
			c.tl.vertices.y = e * k + d * m + h;
			c.tr.vertices.x = d * m - d * k + g;
			c.tr.vertices.y = d * k + d * m + h
		} else c.bl.vertices.x = b.x - d, c.bl.vertices.y = b.y - d, c.br.vertices.x = b.x + d, c.br.vertices.y = b.y - d, c.tl.vertices.x = b.x - d, c.tl.vertices.y = b.y + d, c.tr.vertices.x = b.x + d, c.tr.vertices.y = b.y + d
	},
	postStep: function() {
		if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
			var a = cc._renderContext;
			a.bindBuffer(a.ARRAY_BUFFER, this._buffersVBO[0]);
			a.bufferData(a.ARRAY_BUFFER, this._quadsArrayBuffer, a.DYNAMIC_DRAW)
		}
	},
	update: function(a) {
		if (this._isActive && this.emissionRate) {
			var b = 1 / this.emissionRate;
			this.particleCount < this._totalParticles && (this._emitCounter += a);
			for (; this.particleCount < this._totalParticles && this._emitCounter > b;) this.addParticle(), this._emitCounter -= b;
			this._elapsed += a; - 1 != this.duration && this.duration < this._elapsed && this.stopSystem()
		}
		this._particleIdx = 0;
		b = cc.Particle.TemporaryPoints[0];
		this.positionType == cc.ParticleSystem.TYPE_FREE ? cc.pIn(b, this.convertToWorldSpace(this._pointZeroForParticle)) : this.positionType == cc.ParticleSystem.TYPE_RELATIVE && (b.x = this._position.x, b.y = this._position.y);
		if (this._visible) {
			for (var c = cc.Particle.TemporaryPoints[1], d = cc.Particle.TemporaryPoints[2], e = cc.Particle.TemporaryPoints[3], f = this._particles; this._particleIdx < this.particleCount;) {
				cc.pZeroIn(c);
				cc.pZeroIn(d);
				cc.pZeroIn(e);
				var g = f[this._particleIdx];
				g.timeToLive -= a;
				if (0 < g.timeToLive) {
					if (this.emitterMode == cc.ParticleSystem.MODE_GRAVITY) {
						var h = e,
							k = c,
							m = d;
						g.pos.x || g.pos.y ? (cc.pIn(k, g.pos), cc.pNormalizeIn(k)) : cc.pZeroIn(k);
						cc.pIn(m, k);
						cc.pMultIn(k, g.modeA.radialAccel);
						var n = m.x;
						m.x = -m.y;
						m.y = n;
						cc.pMultIn(m, g.modeA.tangentialAccel);
						cc.pIn(h, k);
						cc.pAddIn(h, m);
						cc.pAddIn(h, this.modeA.gravity);
						cc.pMultIn(h, a);
						cc.pAddIn(g.modeA.dir, h);
						cc.pIn(h, g.modeA.dir);
						cc.pMultIn(h, a);
						cc.pAddIn(g.pos, h)
					} else h = g.modeB, h.angle += h.degreesPerSecond * a, h.radius += h.deltaRadius * a, g.pos.x = -Math.cos(h.angle) * h.radius, g.pos.y = -Math.sin(h.angle) * h.radius;
					this._dontTint && cc._renderType !== cc._RENDER_TYPE_WEBGL || (g.color.r += g.deltaColor.r * a, g.color.g += g.deltaColor.g * a, g.color.b += g.deltaColor.b * a, g.color.a += g.deltaColor.a * a, g.isChangeColor = !0);
					g.size += g.deltaSize * a;
					g.size = Math.max(0, g.size);
					g.rotation += g.deltaRotation * a;
					h = c;
					this.positionType == cc.ParticleSystem.TYPE_FREE || this.positionType == cc.ParticleSystem.TYPE_RELATIVE ? (k = d, cc.pIn(k, b), cc.pSubIn(k, g.startPos), cc.pIn(h, g.pos), cc.pSubIn(h, k)) : cc.pIn(h, g.pos);
					this._batchNode && (h.x += this._position.x, h.y += this._position.y);
					cc._renderType == cc._RENDER_TYPE_WEBGL ? this.updateQuadWithParticle(g, h) : cc.pIn(g.drawPos, h);
					++this._particleIdx
				} else if (g = g.atlasIndex, this._particleIdx !== this.particleCount - 1 && (h = f[this._particleIdx], f[this._particleIdx] = f[this.particleCount - 1], f[this.particleCount - 1] = h), this._batchNode && (this._batchNode.disableParticle(this.atlasIndex + g), f[this.particleCount - 1].atlasIndex = g), --this.particleCount, 0 == this.particleCount && this.autoRemoveOnFinish) {
					this.unscheduleUpdate();
					this._parent.removeChild(this, !0);
					return
				}
			}
			this._transformSystemDirty = !1
		}
		this._batchNode || this.postStep()
	},
	updateWithNoTime: function() {
		this.update(0)
	},
	_valueForKey: function(a, b) {
		if (b) {
			var c = b[a];
			return null != c ? c : ""
		}
		return ""
	},
	_updateBlendFunc: function() {
		if (this._batchNode) cc.log("Can't change blending functions when the particle is being batched");
		else {
			var a = this._texture;
			if (a && a instanceof cc.Texture2D) {
				this._opacityModifyRGB = !1;
				var b = this._blendFunc;
				b.src == cc.BLEND_SRC && b.dst == cc.BLEND_DST && (a.hasPremultipliedAlpha() ? this._opacityModifyRGB = !0 : (b.src = cc.SRC_ALPHA, b.dst = cc.ONE_MINUS_SRC_ALPHA))
			}
		}
	},
	clone: function() {
		var a = new cc.ParticleSystem;
		if (a.initWithTotalParticles(this.getTotalParticles())) {
			a.setAngle(this.getAngle());
			a.setAngleVar(this.getAngleVar());
			a.setDuration(this.getDuration());
			var b = this.getBlendFunc();
			a.setBlendFunc(b.src, b.dst);
			a.setStartColor(this.getStartColor());
			a.setStartColorVar(this.getStartColorVar());
			a.setEndColor(this.getEndColor());
			a.setEndColorVar(this.getEndColorVar());
			a.setStartSize(this.getStartSize());
			a.setStartSizeVar(this.getStartSizeVar());
			a.setEndSize(this.getEndSize());
			a.setEndSizeVar(this.getEndSizeVar());
			a.setPosition(cc.p(this.x, this.y));
			a.setPosVar(cc.p(this.getPosVar().x, this.getPosVar().y));
			a.setStartSpin(this.getStartSpin() || 0);
			a.setStartSpinVar(this.getStartSpinVar() || 0);
			a.setEndSpin(this.getEndSpin() || 0);
			a.setEndSpinVar(this.getEndSpinVar() || 0);
			a.setEmitterMode(this.getEmitterMode());
			this.getEmitterMode() == cc.ParticleSystem.MODE_GRAVITY ? (b = this.getGravity(), a.setGravity(cc.p(b.x, b.y)), a.setSpeed(this.getSpeed()), a.setSpeedVar(this.getSpeedVar()), a.setRadialAccel(this.getRadialAccel()), a.setRadialAccelVar(this.getRadialAccelVar()), a.setTangentialAccel(this.getTangentialAccel()), a.setTangentialAccelVar(this.getTangentialAccelVar())) : this.getEmitterMode() == cc.ParticleSystem.MODE_RADIUS && (a.setStartRadius(this.getStartRadius()), a.setStartRadiusVar(this.getStartRadiusVar()), a.setEndRadius(this.getEndRadius()), a.setEndRadiusVar(this.getEndRadiusVar()), a.setRotatePerSecond(this.getRotatePerSecond()), a.setRotatePerSecondVar(this.getRotatePerSecondVar()));
			a.setLife(this.getLife());
			a.setLifeVar(this.getLifeVar());
			a.setEmissionRate(this.getEmissionRate());
			if (!this.getBatchNode() && (a.setOpacityModifyRGB(this.isOpacityModifyRGB()), b = this.getTexture())) {
				var c = b.getContentSize();
				a.setTextureWithRect(b, cc.rect(0, 0, c.width, c.height))
			}
		}
		return a
	},
	setDisplayFrame: function(a) {
		var b = a.getOffsetInPixels();
		0 == b.x && 0 == b.y || cc.log("cc.ParticleSystem.setDisplayFrame(): QuadParticle only supports SpriteFrames with no offsets");
		cc._renderType === cc._RENDER_TYPE_WEBGL && (this._texture && a.getTexture()._webTextureObj == this._texture._webTextureObj || this.setTexture(a.getTexture()))
	},
	setTextureWithRect: function(a, b) {
		var c = this._texture;
		cc._renderType === cc._RENDER_TYPE_WEBGL ? c && a._webTextureObj == c._webTextureObj || c == a || (this._texture = a, this._updateBlendFunc()) : c && a == c || c == a || (this._texture = a, this._updateBlendFunc());
		this._pointRect = b;
		this.initTexCoordsWithRect(b)
	},
	draw: function(a) {
		this._textureLoaded && !this._batchNode && (cc._renderType === cc._RENDER_TYPE_CANVAS ? this._drawForCanvas(a) : this._drawForWebGL(a), cc.g_NumberOfDraws++)
	},
	_drawForCanvas: function(a) {
		a = a || cc._renderContext;
		a.save();
		this.isBlendAdditive() ? a.globalCompositeOperation = "lighter" : a.globalCompositeOperation = "source-over";
		for (var b = this._texture.getHtmlElementObj(), c = 0; c < this.particleCount; c++) {
			var d = this._particles[c],
				e = 0 | 0.5 * d.size;
			if (this.drawMode == cc.ParticleSystem.TEXTURE_MODE) {
				if (b.width && b.height) {
					a.save();
					a.globalAlpha = d.color.a / 255;
					a.translate(0 | d.drawPos.x, -(0 | d.drawPos.y));
					var e = 4 * Math.floor(d.size / 4),
						f = this._pointRect.width,
						g = this._pointRect.height;
					a.scale(Math.max(1 / f * e, 1E-6), Math.max(1 / g * e, 1E-6));
					d.rotation && a.rotate(cc.degreesToRadians(d.rotation));
					a.translate(-(0 | f / 2), -(0 | g / 2));
					(d = d.isChangeColor ? this._changeTextureColor(b, d.color, this._pointRect) : b) && a.drawImage(d, 0, 0);
					a.restore()
				}
			} else a.save(), a.globalAlpha = d.color.a / 255, a.translate(0 | d.drawPos.x, -(0 | d.drawPos.y)), this.shapeType == cc.ParticleSystem.STAR_SHAPE ? (d.rotation && a.rotate(cc.degreesToRadians(d.rotation)), cc._drawingUtil.drawStar(a, e, d.color)) : cc._drawingUtil.drawColorBall(a, e, d.color), a.restore()
		}
		a.restore()
	},
	_changeTextureColor: function(a, b, c) {
		a.tintCache || (a.tintCache = document.createElement("canvas"), a.tintCache.width = a.width, a.tintCache.height = a.height);
		return cc.generateTintImageWithMultiply(a, b, c, a.tintCache)
	},
	_drawForWebGL: function(a) {
		this._texture && (a = a || cc._renderContext, this._shaderProgram.use(), this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4(), cc.glBindTexture2D(this._texture), cc.glBlendFuncForParticle(this._blendFunc.src, this._blendFunc.dst), cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX), a.bindBuffer(a.ARRAY_BUFFER, this._buffersVBO[0]), a.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 3, a.FLOAT, !1, 24, 0), a.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, a.UNSIGNED_BYTE, !0, 24, 12), a.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, a.FLOAT, !1, 24, 16), a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]), a.drawElements(a.TRIANGLES, 6 * this._particleIdx, a.UNSIGNED_SHORT, 0))
	},
	listenBackToForeground: function(a) {
		cc.TEXTURE_ATLAS_USE_VAO ? this._setupVBOandVAO() : this._setupVBO()
	},
	_setupVBOandVAO: function() {},
	_setupVBO: function() {
		if (cc._renderType != cc._RENDER_TYPE_CANVAS) {
			var a = cc._renderContext;
			this._buffersVBO[0] = a.createBuffer();
			a.bindBuffer(a.ARRAY_BUFFER, this._buffersVBO[0]);
			a.bufferData(a.ARRAY_BUFFER, this._quadsArrayBuffer, a.DYNAMIC_DRAW);
			this._buffersVBO[1] = a.createBuffer();
			a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, this._buffersVBO[1]);
			a.bufferData(a.ELEMENT_ARRAY_BUFFER, this._indices, a.STATIC_DRAW)
		}
	},
	_allocMemory: function() {
		if (cc._renderType === cc._RENDER_TYPE_CANVAS) return !0;
		if (this._batchNode) return cc.log("cc.ParticleSystem._allocMemory(): Memory should not be allocated when not using batchNode"), !1;
		var a = cc.V3F_C4B_T2F_Quad.BYTES_PER_ELEMENT,
			b = this._totalParticles,
			c = this._quads;
		c.length = 0;
		this._indices = new Uint16Array(6 * b);
		for (var d = new ArrayBuffer(a * b), e = 0; e < b; e++) c[e] = new cc.V3F_C4B_T2F_Quad(null, null, null, null, d, e * a);
		if (!c || !this._indices) return cc.log("cocos2d: Particle system: not enough memory"), !1;
		this._quadsArrayBuffer = d;
		return !0
	}
});
_p = cc.ParticleSystem.prototype;
cc._renderType !== cc._RENDER_TYPE_CANVAS || cc.sys._supportCanvasNewBlendModes || (_p._changeTextureColor = function(a, b, c) {
	var d = cc.textureCache.getTextureColors(a);
	return d ? (d.tintCache || (d.tintCache = document.createElement("canvas"), d.tintCache.width = a.width, d.tintCache.height = a.height), cc.generateTintImage(a, d, b, c, d.tintCache), d.tintCache) : null
});
cc.defineGetterSetter(_p, "opacityModifyRGB", _p.isOpacityModifyRGB, _p.setOpacityModifyRGB);
cc.defineGetterSetter(_p, "batchNode", _p.getBatchNode, _p.setBatchNode);
cc.defineGetterSetter(_p, "active", _p.isActive);
cc.defineGetterSetter(_p, "sourcePos", _p.getSourcePosition, _p.setSourcePosition);
cc.defineGetterSetter(_p, "posVar", _p.getPosVar, _p.setPosVar);
cc.defineGetterSetter(_p, "gravity", _p.getGravity, _p.setGravity);
cc.defineGetterSetter(_p, "speed", _p.getSpeed, _p.setSpeed);
cc.defineGetterSetter(_p, "speedVar", _p.getSpeedVar, _p.setSpeedVar);
cc.defineGetterSetter(_p, "tangentialAccel", _p.getTangentialAccel, _p.setTangentialAccel);
cc.defineGetterSetter(_p, "tangentialAccelVar", _p.getTangentialAccelVar, _p.setTangentialAccelVar);
cc.defineGetterSetter(_p, "radialAccel", _p.getRadialAccel, _p.setRadialAccel);
cc.defineGetterSetter(_p, "radialAccelVar", _p.getRadialAccelVar, _p.setRadialAccelVar);
cc.defineGetterSetter(_p, "rotationIsDir", _p.getRotationIsDir, _p.setRotationIsDir);
cc.defineGetterSetter(_p, "startRadius", _p.getStartRadius, _p.setStartRadius);
cc.defineGetterSetter(_p, "startRadiusVar", _p.getStartRadiusVar, _p.setStartRadiusVar);
cc.defineGetterSetter(_p, "endRadius", _p.getEndRadius, _p.setEndRadius);
cc.defineGetterSetter(_p, "endRadiusVar", _p.getEndRadiusVar, _p.setEndRadiusVar);
cc.defineGetterSetter(_p, "rotatePerS", _p.getRotatePerSecond, _p.setRotatePerSecond);
cc.defineGetterSetter(_p, "rotatePerSVar", _p.getRotatePerSecondVar, _p.setRotatePerSecondVar);
cc.defineGetterSetter(_p, "startColor", _p.getStartColor, _p.setStartColor);
cc.defineGetterSetter(_p, "startColorVar", _p.getStartColorVar, _p.setStartColorVar);
cc.defineGetterSetter(_p, "endColor", _p.getEndColor, _p.setEndColor);
cc.defineGetterSetter(_p, "endColorVar", _p.getEndColorVar, _p.setEndColorVar);
cc.defineGetterSetter(_p, "totalParticles", _p.getTotalParticles, _p.setTotalParticles);
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.ParticleSystem.create = function(a) {
	return new cc.ParticleSystem(a)
};
cc.ParticleSystem.createWithTotalParticles = cc.ParticleSystem.create;
cc.ParticleSystem.ModeA = function(a, b, c, d, e, f, g, h) {
	this.gravity = a ? a : cc.p(0, 0);
	this.speed = b || 0;
	this.speedVar = c || 0;
	this.tangentialAccel = d || 0;
	this.tangentialAccelVar = e || 0;
	this.radialAccel = f || 0;
	this.radialAccelVar = g || 0;
	this.rotationIsDir = h || !1
};
cc.ParticleSystem.ModeB = function(a, b, c, d, e, f) {
	this.startRadius = a || 0;
	this.startRadiusVar = b || 0;
	this.endRadius = c || 0;
	this.endRadiusVar = d || 0;
	this.rotatePerSecond = e || 0;
	this.rotatePerSecondVar = f || 0
};
cc.ParticleSystem.SHAPE_MODE = 0;
cc.ParticleSystem.TEXTURE_MODE = 1;
cc.ParticleSystem.STAR_SHAPE = 0;
cc.ParticleSystem.BALL_SHAPE = 1;
cc.ParticleSystem.DURATION_INFINITY = -1;
cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE = -1;
cc.ParticleSystem.START_RADIUS_EQUAL_TO_END_RADIUS = -1;
cc.ParticleSystem.MODE_GRAVITY = 0;
cc.ParticleSystem.MODE_RADIUS = 1;
cc.ParticleSystem.TYPE_FREE = 0;
cc.ParticleSystem.TYPE_RELATIVE = 1;
cc.ParticleSystem.TYPE_GROUPED = 2;
cc.ParticleFire = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 300 : 150)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(0, 0)), this.setRadialAccel(0), this.setRadialAccelVar(0), this.setSpeed(60), this.setSpeedVar(20), this.setAngle(90), this.setAngleVar(10), a = cc.director.getWinSize(), this.setPosition(a.width / 2, 60), this.setPosVar(cc.p(40, 20)), this.setLife(3), this.setLifeVar(0.25), this.setStartSize(54), this.setStartSizeVar(10), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(this.getTotalParticles() / this.getLife()), this.setStartColor(cc.color(194, 64, 31, 255)), this.setStartColorVar(cc.color(0, 0, 0, 0)), this.setEndColor(cc.color(0, 0, 0, 255)), this.setEndColorVar(cc.color(0, 0, 0, 0)), this.setBlendAdditive(!0), !0) : !1
	}
});
cc.ParticleFire.create = function() {
	return new cc.ParticleFire
};
cc.ParticleFireworks = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 1500 : 150)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(0, -90)), this.setRadialAccel(0), this.setRadialAccelVar(0), this.setSpeed(180), this.setSpeedVar(50), a = cc.director.getWinSize(), this.setPosition(a.width / 2, a.height / 2), this.setAngle(90), this.setAngleVar(20), this.setLife(3.5), this.setLifeVar(1), this.setEmissionRate(this.getTotalParticles() / this.getLife()), this.setStartColor(cc.color(128, 128, 128, 255)), this.setStartColorVar(cc.color(128, 128, 128, 255)), this.setEndColor(cc.color(26, 26, 26, 51)), this.setEndColorVar(cc.color(26, 26, 26, 51)), this.setStartSize(8), this.setStartSizeVar(2), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setBlendAdditive(!1), !0) : !1
	}
});
cc.ParticleFireworks.create = function() {
	return new cc.ParticleFireworks
};
cc.ParticleSun = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 350 : 150)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setBlendAdditive(!0), this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(0, 0)), this.setRadialAccel(0), this.setRadialAccelVar(0), this.setSpeed(20), this.setSpeedVar(5), this.setAngle(90), this.setAngleVar(360), a = cc.director.getWinSize(), this.setPosition(a.width / 2, a.height / 2), this.setPosVar(cc.p(0, 0)), this.setLife(1), this.setLifeVar(0.5), this.setStartSize(30), this.setStartSizeVar(10), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(this.getTotalParticles() / this.getLife()), this.setStartColor(cc.color(194, 64, 31, 255)), this.setStartColorVar(cc.color(0, 0, 0, 0)), this.setEndColor(cc.color(0, 0, 0, 255)), this.setEndColorVar(cc.color(0, 0, 0, 0)), !0) : !1
	}
});
cc.ParticleSun.create = function() {
	return new cc.ParticleSun
};
cc.ParticleGalaxy = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 200 : 100)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(0, 0)), this.setSpeed(60), this.setSpeedVar(10), this.setRadialAccel(-80), this.setRadialAccelVar(0), this.setTangentialAccel(80), this.setTangentialAccelVar(0), this.setAngle(90), this.setAngleVar(360), a = cc.director.getWinSize(), this.setPosition(a.width / 2, a.height / 2), this.setPosVar(cc.p(0, 0)), this.setLife(4), this.setLifeVar(1), this.setStartSize(37), this.setStartSizeVar(10), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(this.getTotalParticles() / this.getLife()), this.setStartColor(cc.color(31, 64, 194, 255)), this.setStartColorVar(cc.color(0, 0, 0, 0)), this.setEndColor(cc.color(0, 0, 0, 255)), this.setEndColorVar(cc.color(0, 0, 0, 0)), this.setBlendAdditive(!0), !0) : !1
	}
});
cc.ParticleGalaxy.create = function() {
	return new cc.ParticleGalaxy
};
cc.ParticleFlower = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 250 : 100)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(0, 0)), this.setSpeed(80), this.setSpeedVar(10), this.setRadialAccel(-60), this.setRadialAccelVar(0), this.setTangentialAccel(15), this.setTangentialAccelVar(0), this.setAngle(90), this.setAngleVar(360), a = cc.director.getWinSize(), this.setPosition(a.width / 2, a.height / 2), this.setPosVar(cc.p(0, 0)), this.setLife(4), this.setLifeVar(1), this.setStartSize(30), this.setStartSizeVar(10), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(this.getTotalParticles() / this.getLife()), this.setStartColor(cc.color(128, 128, 128, 255)), this.setStartColorVar(cc.color(128, 128, 128, 128)), this.setEndColor(cc.color(0, 0, 0, 255)), this.setEndColorVar(cc.color(0, 0, 0, 0)), this.setBlendAdditive(!0), !0) : !1
	}
});
cc.ParticleFlower.create = function() {
	return new cc.ParticleFlower
};
cc.ParticleMeteor = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 150 : 100)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(-200, 200)), this.setSpeed(15), this.setSpeedVar(5), this.setRadialAccel(0), this.setRadialAccelVar(0), this.setTangentialAccel(0), this.setTangentialAccelVar(0), this.setAngle(90), this.setAngleVar(360), a = cc.director.getWinSize(), this.setPosition(a.width / 2, a.height / 2), this.setPosVar(cc.p(0, 0)), this.setLife(2), this.setLifeVar(1), this.setStartSize(60), this.setStartSizeVar(10), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(this.getTotalParticles() / this.getLife()), this.setStartColor(cc.color(51, 102, 179)), this.setStartColorVar(cc.color(0, 0, 51, 26)), this.setEndColor(cc.color(0, 0, 0, 255)), this.setEndColorVar(cc.color(0, 0, 0, 0)), this.setBlendAdditive(!0), !0) : !1
	}
});
cc.ParticleMeteor.create = function() {
	return new cc.ParticleMeteor
};
cc.ParticleSpiral = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 500 : 100)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(0, 0)), this.setSpeed(150), this.setSpeedVar(0), this.setRadialAccel(-380), this.setRadialAccelVar(0), this.setTangentialAccel(45), this.setTangentialAccelVar(0), this.setAngle(90), this.setAngleVar(0), a = cc.director.getWinSize(), this.setPosition(a.width / 2, a.height / 2), this.setPosVar(cc.p(0, 0)), this.setLife(12), this.setLifeVar(0), this.setStartSize(20), this.setStartSizeVar(0), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(this.getTotalParticles() / this.getLife()), this.setStartColor(cc.color(128, 128, 128, 255)), this.setStartColorVar(cc.color(128, 128, 128, 0)), this.setEndColor(cc.color(128, 128, 128, 255)), this.setEndColorVar(cc.color(128, 128, 128, 0)), this.setBlendAdditive(!1), !0) : !1
	}
});
cc.ParticleSpiral.create = function() {
	return new cc.ParticleSpiral
};
cc.ParticleExplosion = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 700 : 300)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(0.1), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(0, 0)), this.setSpeed(70), this.setSpeedVar(40), this.setRadialAccel(0), this.setRadialAccelVar(0), this.setTangentialAccel(0), this.setTangentialAccelVar(0), this.setAngle(90), this.setAngleVar(360), a = cc.director.getWinSize(), this.setPosition(a.width / 2, a.height / 2), this.setPosVar(cc.p(0, 0)), this.setLife(5), this.setLifeVar(2), this.setStartSize(15), this.setStartSizeVar(10), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(this.getTotalParticles() / this.getDuration()), this.setStartColor(cc.color(179, 26, 51, 255)), this.setStartColorVar(cc.color(128, 128, 128, 0)), this.setEndColor(cc.color(128, 128, 128, 0)), this.setEndColorVar(cc.color(128, 128, 128, 0)), this.setBlendAdditive(!1), !0) : !1
	}
});
cc.ParticleExplosion.create = function() {
	return new cc.ParticleExplosion
};
cc.ParticleSmoke = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 200 : 100)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(0, 0)), this.setRadialAccel(0), this.setRadialAccelVar(0), this.setSpeed(25), this.setSpeedVar(10), this.setAngle(90), this.setAngleVar(5), a = cc.director.getWinSize(), this.setPosition(a.width / 2, 0), this.setPosVar(cc.p(20, 0)), this.setLife(4), this.setLifeVar(1), this.setStartSize(60), this.setStartSizeVar(10), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(this.getTotalParticles() / this.getLife()), this.setStartColor(cc.color(204, 204, 204, 255)), this.setStartColorVar(cc.color(5, 5, 5, 0)), this.setEndColor(cc.color(0, 0, 0, 255)), this.setEndColorVar(cc.color(0, 0, 0, 0)), this.setBlendAdditive(!1), !0) : !1
	}
});
cc.ParticleSmoke.create = function() {
	return new cc.ParticleSmoke
};
cc.ParticleSnow = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 700 : 250)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(0, -1)), this.setSpeed(5), this.setSpeedVar(1), this.setRadialAccel(0), this.setRadialAccelVar(1), this.setTangentialAccel(0), this.setTangentialAccelVar(1), a = cc.director.getWinSize(), this.setPosition(a.width / 2, a.height + 10), this.setPosVar(cc.p(a.width / 2, 0)), this.setAngle(-90), this.setAngleVar(5), this.setLife(45), this.setLifeVar(15), this.setStartSize(10), this.setStartSizeVar(5), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(10), this.setStartColor(cc.color(255, 255, 255, 255)), this.setStartColorVar(cc.color(0, 0, 0, 0)), this.setEndColor(cc.color(255, 255, 255, 0)), this.setEndColorVar(cc.color(0, 0, 0, 0)), this.setBlendAdditive(!1), !0) : !1
	}
});
cc.ParticleSnow.create = function() {
	return new cc.ParticleSnow
};
cc.ParticleRain = cc.ParticleSystem.extend({
	ctor: function() {
		cc.ParticleSystem.prototype.ctor.call(this, cc._renderType === cc._RENDER_TYPE_WEBGL ? 1E3 : 300)
	},
	initWithTotalParticles: function(a) {
		return cc.ParticleSystem.prototype.initWithTotalParticles.call(this, a) ? (this.setDuration(cc.ParticleSystem.DURATION_INFINITY), this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY), this.setGravity(cc.p(10, -10)), this.setRadialAccel(0), this.setRadialAccelVar(1), this.setTangentialAccel(0), this.setTangentialAccelVar(1), this.setSpeed(130), this.setSpeedVar(30), this.setAngle(-90), this.setAngleVar(5), a = cc.director.getWinSize(), this.setPosition(a.width / 2, a.height), this.setPosVar(cc.p(a.width / 2, 0)), this.setLife(4.5), this.setLifeVar(0), this.setStartSize(4), this.setStartSizeVar(2), this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE), this.setEmissionRate(20), this.setStartColor(cc.color(179, 204, 255, 255)), this.setStartColorVar(cc.color(0, 0, 0, 0)), this.setEndColor(cc.color(179, 204, 255, 128)), this.setEndColorVar(cc.color(0, 0, 0, 0)), this.setBlendAdditive(!1), !0) : !1
	}
});
cc.ParticleRain.create = function() {
	return new cc.ParticleRain
};
cc.PARTICLE_DEFAULT_CAPACITY = 500;
cc.ParticleBatchNode = cc.Node.extend({
	textureAtlas: null,
	TextureProtocol: !0,
	_blendFunc: null,
	_className: "ParticleBatchNode",
	ctor: function(a, b) {
		cc.Node.prototype.ctor.call(this);
		this._blendFunc = {
			src: cc.BLEND_SRC,
			dst: cc.BLEND_DST
		};
		cc.isString(a) ? this.init(a, b) : a instanceof cc.Texture2D && this.initWithTexture(a, b)
	},
	initWithTexture: function(a, b) {
		this.textureAtlas = new cc.TextureAtlas;
		this.textureAtlas.initWithTexture(a, b);
		this._children.length = 0;
		cc._renderType === cc._RENDER_TYPE_WEBGL && (this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
		return !0
	},
	initWithFile: function(a, b) {
		var c = cc.textureCache.addImage(a);
		return this.initWithTexture(c, b)
	},
	init: function(a, b) {
		var c = cc.TextureCache.getInstance().addImage(a);
		return this.initWithTexture(c, b)
	},
	addChild: function(a, b, c) {
		if (!a) throw "cc.ParticleBatchNode.addChild() : child should be non-null";
		if (!(a instanceof cc.ParticleSystem)) throw "cc.ParticleBatchNode.addChild() : only supports cc.ParticleSystem as children";
		b = null == b ? a.zIndex : b;
		c = null == c ? a.tag : c;
		if (a.getTexture() != this.textureAtlas.texture) throw "cc.ParticleSystem.addChild() : the child is not using the same texture id";
		var d = a.getBlendFunc();
		if (0 === this._children.length) this.setBlendFunc(d);
		else if (d.src != this._blendFunc.src || d.dst != this._blendFunc.dst) {
			cc.log("cc.ParticleSystem.addChild() : Can't add a ParticleSystem that uses a different blending function");
			return
		}
		b = this._addChildHelper(a, b, c);
		c = 0;
		0 != b ? (b = this._children[b - 1], c = b.getAtlasIndex() + b.getTotalParticles()) : c = 0;
		this.insertChild(a, c);
		a.setBatchNode(this)
	},
	insertChild: function(a, b) {
		var c = a.getTotalParticles(),
			d = this.textureAtlas,
			e = d.totalQuads;
		a.setAtlasIndex(b);
		e + c > d.getCapacity() && (this._increaseAtlasCapacityTo(e + c), d.fillWithEmptyQuadsFromIndex(d.getCapacity() - c, c));
		a.getAtlasIndex() + c != e && d.moveQuadsFromIndex(b, b + c);
		d.increaseTotalQuadsWith(c);
		this._updateAllAtlasIndexes()
	},
	removeChild: function(a, b) {
		if (null != a) {
			if (!(a instanceof cc.ParticleSystem)) throw "cc.ParticleBatchNode.removeChild(): only supports cc.ParticleSystem as children";
			if (-1 == this._children.indexOf(a)) cc.log("cc.ParticleBatchNode.removeChild(): doesn't contain the sprite. Can't remove it");
			else {
				cc.Node.prototype.removeChild.call(this, a, b);
				var c = this.textureAtlas;
				c.removeQuadsAtIndex(a.getAtlasIndex(), a.getTotalParticles());
				c.fillWithEmptyQuadsFromIndex(c.totalQuads, a.getTotalParticles());
				a.setBatchNode(null);
				this._updateAllAtlasIndexes()
			}
		}
	},
	reorderChild: function(a, b) {
		if (!a) throw "cc.ParticleBatchNode.reorderChild(): child should be non-null";
		if (!(a instanceof cc.ParticleSystem)) throw "cc.ParticleBatchNode.reorderChild(): only supports cc.QuadParticleSystems as children";
		if (-1 === this._children.indexOf(a)) cc.log("cc.ParticleBatchNode.reorderChild(): Child doesn't belong to batch");
		else if (b != a.zIndex) {
			if (1 < this._children.length) {
				var c = this._getCurrentIndex(a, b);
				if (c.oldIndex != c.newIndex) {
					this._children.splice(c.oldIndex, 1);
					this._children.splice(c.newIndex, 0, a);
					c = a.getAtlasIndex();
					this._updateAllAtlasIndexes();
					for (var d = 0, e = this._children, f = 0; f < e.length; f++)
						if (e[f] == a) {
							d = a.getAtlasIndex();
							break
						}
					this.textureAtlas.moveQuadsFromIndex(c, a.getTotalParticles(), d);
					a.updateWithNoTime()
				}
			}
			a._setLocalZOrder(b)
		}
	},
	removeChildAtIndex: function(a, b) {
		this.removeChild(this._children[i], b)
	},
	removeAllChildren: function(a) {
		for (var b = this._children, c = 0; c < b.length; c++) b[c].setBatchNode(null);
		cc.Node.prototype.removeAllChildren.call(this, a);
		this.textureAtlas.removeAllQuads()
	},
	disableParticle: function(a) {
		a = this.textureAtlas.quads[a];
		a.br.vertices.x = a.br.vertices.y = a.tr.vertices.x = a.tr.vertices.y = a.tl.vertices.x = a.tl.vertices.y = a.bl.vertices.x = a.bl.vertices.y = 0;
		this.textureAtlas._setDirty(!0)
	},
	draw: function(a) {
		cc._renderType !== cc._RENDER_TYPE_CANVAS && 0 != this.textureAtlas.totalQuads && (cc.nodeDrawSetup(this), cc.glBlendFuncForParticle(this._blendFunc.src, this._blendFunc.dst), this.textureAtlas.drawQuads())
	},
	getTexture: function() {
		return this.textureAtlas.texture
	},
	setTexture: function(a) {
		this.textureAtlas.texture = a;
		var b = this._blendFunc;
		a && !a.hasPremultipliedAlpha() && b.src == cc.BLEND_SRC && b.dst == cc.BLEND_DST && (b.src = cc.SRC_ALPHA, b.dst = cc.ONE_MINUS_SRC_ALPHA)
	},
	setBlendFunc: function(a, b) {
		void 0 === b ? (this._blendFunc.src = a.src, this._blendFunc.dst = a.dst) : (this._blendFunc.src = a, this._blendFunc.src = b)
	},
	getBlendFunc: function() {
		return {
			src: this._blendFunc.src,
			dst: this._blendFunc.dst
		}
	},
	visit: function(a) {
		cc._renderType !== cc._RENDER_TYPE_CANVAS && this._visible && (cc.kmGLPushMatrix(), this.grid && this.grid.isActive() && (this.grid.beforeDraw(), this.transformAncestors()), this.transform(a), this.draw(a), this.grid && this.grid.isActive() && this.grid.afterDraw(this), cc.kmGLPopMatrix())
	},
	_updateAllAtlasIndexes: function() {
		for (var a = 0, b = this._children, c = 0; c < b.length; c++) {
			var d = b[c];
			d.setAtlasIndex(a);
			a += d.getTotalParticles()
		}
	},
	_increaseAtlasCapacityTo: function(a) {
		cc.log("cocos2d: cc.ParticleBatchNode: resizing TextureAtlas capacity from [" + this.textureAtlas.getCapacity() + "] to [" + a + "].");
		this.textureAtlas.resizeCapacity(a) || cc.log("cc.ParticleBatchNode._increaseAtlasCapacityTo() : WARNING: Not enough memory to resize the atlas")
	},
	_searchNewPositionInChildrenForZ: function(a) {
		for (var b = this._children, c = b.length, d = 0; d < c; d++)
			if (b[d].zIndex > a) return d;
		return c
	},
	_getCurrentIndex: function(a, b) {
		for (var c = !1, d = !1, e = 0, f = 0, g = 0, h = this._children, k = h.length, m = 0; m < k; m++) {
			var n = h[m];
			if (n.zIndex > b && !d && (e = m, d = !0, c && d)) break;
			if (a == n && (f = m, c = !0, d || (g = -1), c && d)) break
		}
		d || (e = k);
		return {
			newIndex: e + g,
			oldIndex: f
		}
	},
	_addChildHelper: function(a, b, c) {
		if (!a) throw "cc.ParticleBatchNode._addChildHelper(): child should be non-null";
		if (a.parent) return cc.log("cc.ParticleBatchNode._addChildHelper(): child already added. It can't be added again"), null;
		this._children || (this._children = []);
		var d = this._searchNewPositionInChildrenForZ(b);
		this._children.splice(d, 0, a);
		a.tag = c;
		a._setLocalZOrder(b);
		a.parent = this;
		this._running && (a.onEnter(), a.onEnterTransitionDidFinish());
		return d
	},
	_updateBlendFunc: function() {
		this.textureAtlas.texture.hasPremultipliedAlpha() || (this._blendFunc.src = cc.SRC_ALPHA, this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA)
	},
	getTextureAtlas: function() {
		return this.textureAtlas
	},
	setTextureAtlas: function(a) {
		this.textureAtlas = a
	}
});
_p = cc.ParticleBatchNode.prototype;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.ParticleBatchNode.create = function(a, b) {
	return new cc.ParticleBatchNode(a, b)
};
cc.IMEKeyboardNotificationInfo = function(a, b, c) {
	this.begin = a || cc.rect(0, 0, 0, 0);
	this.end = b || cc.rect(0, 0, 0, 0);
	this.duration = c || 0
};
cc.IMEDelegate = cc.Class.extend({
	ctor: function() {
		cc.imeDispatcher.addDelegate(this)
	},
	removeDelegate: function() {
		cc.imeDispatcher.removeDelegate(this)
	},
	attachWithIME: function() {
		return cc.imeDispatcher.attachDelegateWithIME(this)
	},
	detachWithIME: function() {
		return cc.imeDispatcher.detachDelegateWithIME(this)
	},
	canAttachWithIME: function() {
		return !1
	},
	didAttachWithIME: function() {},
	canDetachWithIME: function() {
		return !1
	},
	didDetachWithIME: function() {},
	insertText: function(a, b) {},
	deleteBackward: function() {},
	getContentText: function() {
		return ""
	},
	keyboardWillShow: function(a) {},
	keyboardDidShow: function(a) {},
	keyboardWillHide: function(a) {},
	keyboardDidHide: function(a) {}
});
cc.IMEDispatcher = cc.Class.extend({
	_domInputControl: null,
	impl: null,
	_currentInputString: "",
	_lastClickPosition: null,
	ctor: function() {
		this.impl = new cc.IMEDispatcher.Impl;
		this._lastClickPosition = cc.p(0, 0)
	},
	init: function() {
		if (!cc.sys.isMobile) {
			this._domInputControl = cc.$("#imeDispatcherInput");
			this._domInputControl || (this._domInputControl = cc.$new("input"), this._domInputControl.setAttribute("type", "text"), this._domInputControl.setAttribute("id", "imeDispatcherInput"), this._domInputControl.resize(0, 0), this._domInputControl.translates(0, 0), this._domInputControl.style.opacity = "0", this._domInputControl.style.fontSize = "1px", this._domInputControl.setAttribute("tabindex", 2), this._domInputControl.style.position = "absolute", this._domInputControl.style.top = 0, this._domInputControl.style.left = 0, document.body.appendChild(this._domInputControl));
			var a = this;
			cc._addEventListener(this._domInputControl, "input", function() {
				a._processDomInputString(a._domInputControl.value)
			}, !1);
			cc._addEventListener(this._domInputControl, "keydown", function(b) {
				b.keyCode === cc.KEY.tab ? (b.stopPropagation(), b.preventDefault()) : b.keyCode == cc.KEY.enter && (a.dispatchInsertText("\n", 1), b.stopPropagation(), b.preventDefault())
			}, !1);
			/msie/i.test(navigator.userAgent) && cc._addEventListener(this._domInputControl, "keyup", function(b) {
				b.keyCode == cc.KEY.backspace && a._processDomInputString(a._domInputControl.value)
			}, !1);
			cc._addEventListener(window, "mousedown", function(b) {
				var c = b.pageY || 0;
				a._lastClickPosition.x = b.pageX || 0;
				a._lastClickPosition.y = c
			}, !1)
		}
	},
	_processDomInputString: function(a) {
		var b, c;
		b = this._currentInputString.length < a.length ? this._currentInputString.length : a.length;
		for (c = 0; c < b && a[c] === this._currentInputString[c]; c++);
		var d = this._currentInputString.length - c,
			e = a.length - c;
		for (b = 0; b < d; b++) this.dispatchDeleteBackward();
		for (b = 0; b < e; b++) this.dispatchInsertText(a[c + b], 1);
		this._currentInputString = a
	},
	dispatchInsertText: function(a, b) {
		!this.impl || !a || 0 >= b || this.impl._delegateWithIme && this.impl._delegateWithIme.insertText(a, b)
	},
	dispatchDeleteBackward: function() {
		this.impl && this.impl._delegateWithIme && this.impl._delegateWithIme.deleteBackward()
	},
	getContentText: function() {
		if (this.impl && this.impl._delegateWithIme) {
			var a = this.impl._delegateWithIme.getContentText();
			return a ? a : ""
		}
		return ""
	},
	dispatchKeyboardWillShow: function(a) {
		if (this.impl)
			for (var b = 0; b < this.impl._delegateList.length; b++) {
				var c = this.impl._delegateList[b];
				c && c.keyboardWillShow(a)
			}
	},
	dispatchKeyboardDidShow: function(a) {
		if (this.impl)
			for (var b = 0; b < this.impl._delegateList.length; b++) {
				var c = this.impl._delegateList[b];
				c && c.keyboardDidShow(a)
			}
	},
	dispatchKeyboardWillHide: function(a) {
		if (this.impl)
			for (var b = 0; b < this.impl._delegateList.length; b++) {
				var c = this.impl._delegateList[b];
				c && c.keyboardWillHide(a)
			}
	},
	dispatchKeyboardDidHide: function(a) {
		if (this.impl)
			for (var b = 0; b < this.impl._delegateList.length; b++) {
				var c = this.impl._delegateList[b];
				c && c.keyboardDidHide(a)
			}
	},
	addDelegate: function(a) {
		a && this.impl && (-1 < this.impl._delegateList.indexOf(a) || this.impl._delegateList.splice(0, 0, a))
	},
	attachDelegateWithIME: function(a) {
		if (!this.impl || !a || -1 == this.impl._delegateList.indexOf(a)) return !1;
		if (this.impl._delegateWithIme) {
			if (!this.impl._delegateWithIme.canDetachWithIME() || !a.canAttachWithIME()) return !1;
			var b = this.impl._delegateWithIme;
			this.impl._delegateWithIme = null;
			b.didDetachWithIME();
			this._focusDomInput(a);
			return !0
		}
		if (!a.canAttachWithIME()) return !1;
		this._focusDomInput(a);
		return !0
	},
	_focusDomInput: function(a) {
		cc.sys.isMobile ? (this.impl._delegateWithIme = a, a.didAttachWithIME(), this._currentInputString = a.string || "", a = prompt("please enter your word:", this._currentInputString), null != a && this._processDomInputString(a), this.dispatchInsertText("\n", 1)) : (this.impl._delegateWithIme = a, this._currentInputString = a.string || "", a.didAttachWithIME(), this._domInputControl.focus(), this._domInputControl.value = this._currentInputString, this._domInputControlTranslate())
	},
	_domInputControlTranslate: function() {
		/msie/i.test(navigator.userAgent) ? (this._domInputControl.style.left = this._lastClickPosition.x + "px", this._domInputControl.style.top = this._lastClickPosition.y + "px") : this._domInputControl.translates(this._lastClickPosition.x, this._lastClickPosition.y)
	},
	detachDelegateWithIME: function(a) {
		if (!this.impl || !a || this.impl._delegateWithIme != a || !a.canDetachWithIME()) return !1;
		this.impl._delegateWithIme = null;
		a.didDetachWithIME();
		cc._canvas.focus();
		return !0
	},
	removeDelegate: function(a) {
		this.impl && a && -1 != this.impl._delegateList.indexOf(a) && (this.impl._delegateWithIme && a == this.impl._delegateWithIme && (this.impl._delegateWithIme = null), cc.arrayRemoveObject(this.impl._delegateList, a))
	},
	processKeycode: function(a) {
		32 > a ? a == cc.KEY.backspace ? this.dispatchDeleteBackward() : a == cc.KEY.enter && this.dispatchInsertText("\n", 1) : 255 > a && this.dispatchInsertText(String.fromCharCode(a), 1)
	}
});
cc.IMEDispatcher.Impl = cc.Class.extend({
	_delegateWithIme: null,
	_delegateList: null,
	ctor: function() {
		this._delegateList = []
	},
	findDelegate: function(a) {
		for (var b = 0; b < this._delegateList.length; b++)
			if (this._delegateList[b] == a) return b;
		return null
	}
});
cc.imeDispatcher = new cc.IMEDispatcher;
document.body ? cc.imeDispatcher.init() : cc._addEventListener(window, "load", function() {
	cc.imeDispatcher.init()
}, !1);
cc.TextFieldDelegate = cc.Class.extend({
	onTextFieldAttachWithIME: function(a) {
		return !1
	},
	onTextFieldDetachWithIME: function(a) {
		return !1
	},
	onTextFieldInsertText: function(a, b, c) {
		return !1
	},
	onTextFieldDeleteBackward: function(a, b, c) {
		return !1
	},
	onDraw: function(a) {
		return !1
	}
});
cc.TextFieldTTF = cc.LabelTTF.extend({
	delegate: null,
	colorSpaceHolder: null,
	_colorText: null,
	_lens: null,
	_inputText: "",
	_placeHolder: "",
	_charCount: 0,
	_className: "TextFieldTTF",
	ctor: function(a, b, c, d, e) {
		this.colorSpaceHolder = cc.color(127, 127, 127);
		this._colorText = cc.color(255, 255, 255, 255);
		cc.imeDispatcher.addDelegate(this);
		cc.LabelTTF.prototype.ctor.call(this);
		void 0 !== e ? (this.initWithPlaceHolder("", b, c, d, e), a && this.setPlaceHolder(a)) : void 0 === d && void 0 !== c && (this.initWithString("", b, c), a && this.setPlaceHolder(a))
	},
	getDelegate: function() {
		return this.delegate
	},
	setDelegate: function(a) {
		this.delegate = a
	},
	getCharCount: function() {
		return this._charCount
	},
	getColorSpaceHolder: function() {
		return cc.color(this.colorSpaceHolder)
	},
	setColorSpaceHolder: function(a) {
		this.colorSpaceHolder.r = a.r;
		this.colorSpaceHolder.g = a.g;
		this.colorSpaceHolder.b = a.b;
		this.colorSpaceHolder.a = cc.isUndefined(a.a) ? 255 : a.a
	},
	setTextColor: function(a) {
		this._colorText.r = a.r;
		this._colorText.g = a.g;
		this._colorText.b = a.b;
		this._colorText.a = cc.isUndefined(a.a) ? 255 : a.a
	},
	initWithPlaceHolder: function(a, b, c, d, e) {
		switch (arguments.length) {
			case 5:
				return a && this.setPlaceHolder(a), this.initWithString(this._placeHolder, d, e, b, c);
			case 3:
				return a && this.setPlaceHolder(a), this.initWithString(this._placeHolder, arguments[1], arguments[2]);
			default:
				throw "Argument must be non-nil ";
		}
	},
	setString: function(a) {
		this._inputText = (a = String(a)) || "";
		this._inputText.length ? (cc.LabelTTF.prototype.setString.call(this, this._inputText), this.setColor(this._colorText)) : (cc.LabelTTF.prototype.setString.call(this, this._placeHolder), this.setColor(this.colorSpaceHolder));
		cc._renderType === cc._RENDER_TYPE_CANVAS && this._updateTexture();
		this._charCount = this._inputText.length
	},
	getString: function() {
		return this._inputText
	},
	setPlaceHolder: function(a) {
		this._placeHolder = a || "";
		this._inputText.length || (cc.LabelTTF.prototype.setString.call(this, this._placeHolder), this.setColor(this.colorSpaceHolder))
	},
	getPlaceHolder: function() {
		return this._placeHolder
	},
	draw: function(a) {
		a = a || cc._renderContext;
		this.delegate && this.delegate.onDraw(this) || cc.LabelTTF.prototype.draw.call(this, a)
	},
	visit: function(a) {
		this._super(a)
	},
	attachWithIME: function() {
		return cc.imeDispatcher.attachDelegateWithIME(this)
	},
	detachWithIME: function() {
		return cc.imeDispatcher.detachDelegateWithIME(this)
	},
	canAttachWithIME: function() {
		return this.delegate ? !this.delegate.onTextFieldAttachWithIME(this) : !0
	},
	didAttachWithIME: function() {},
	canDetachWithIME: function() {
		return this.delegate ? !this.delegate.onTextFieldDetachWithIME(this) : !0
	},
	didDetachWithIME: function() {},
	deleteBackward: function() {
		var a = this._inputText.length;
		0 == a || this.delegate && this.delegate.onTextFieldDeleteBackward(this, this._inputText[a - 1], 1) || (1 >= a ? (this._inputText = "", this._charCount = 0, cc.LabelTTF.prototype.setString.call(this, this._placeHolder), this.setColor(this.colorSpaceHolder)) : this.string = this._inputText.substring(0, a - 1))
	},
	removeDelegate: function() {
		cc.imeDispatcher.removeDelegate(this)
	},
	insertText: function(a, b) {
		var c = a,
			d = c.indexOf("\n"); - 1 < d && (c = c.substring(0, d));
		if (0 < c.length) {
			if (this.delegate && this.delegate.onTextFieldInsertText(this, c, c.length)) return;
			c = this._inputText + c;
			this._charCount = c.length;
			this.string = c
		} - 1 != d && (this.delegate && this.delegate.onTextFieldInsertText(this, "\n", 1) || this.detachWithIME())
	},
	getContentText: function() {
		return this._inputText
	},
	keyboardWillShow: function(a) {},
	keyboardDidShow: function(a) {},
	keyboardWillHide: function(a) {},
	keyboardDidHide: function(a) {}
});
_p = cc.TextFieldTTF.prototype;
cc.defineGetterSetter(_p, "charCount", _p.getCharCount);
cc.defineGetterSetter(_p, "placeHolder", _p.getPlaceHolder, _p.setPlaceHolder);
cc.TextFieldTTF.create = function(a, b, c, d, e) {
	return new cc.TextFieldTTF(a, b, c, d, e)
};
cc._globalFontSize = cc.ITEM_SIZE;
cc._globalFontName = "Arial";
cc._globalFontNameRelease = !1;
cc.MenuItem = cc.Node.extend({
	_enabled: !1,
	_target: null,
	_callback: null,
	_isSelected: !1,
	_className: "MenuItem",
	ctor: function(a, b) {
		var c = cc.Node.prototype;
		c.ctor.call(this);
		this._callback = this._target = null;
		this._enabled = this._isSelected = !1;
		c.setAnchorPoint.call(this, 0.5, 0.5);
		this._target = b || null;
		if (this._callback = a || null) this._enabled = !0
	},
	isSelected: function() {
		return this._isSelected
	},
	setOpacityModifyRGB: function(a) {},
	isOpacityModifyRGB: function() {
		return !1
	},
	setTarget: function(a, b) {
		this._target = b;
		this._callback = a
	},
	isEnabled: function() {
		return this._enabled
	},
	setEnabled: function(a) {
		this._enabled = a
	},
	initWithCallback: function(a, b) {
		this.anchorY = this.anchorX = 0.5;
		this._target = b;
		this._callback = a;
		this._enabled = !0;
		this._isSelected = !1;
		return !0
	},
	rect: function() {
		var a = this._position,
			b = this._contentSize,
			c = this._anchorPoint;
		return cc.rect(a.x - b.width * c.x, a.y - b.height * c.y, b.width, b.height)
	},
	selected: function() {
		this._isSelected = !0
	},
	unselected: function() {
		this._isSelected = !1
	},
	setCallback: function(a, b) {
		this._target = b;
		this._callback = a
	},
	activate: function() {
		if (this._enabled) {
			var a = this._target,
				b = this._callback;
			if (b)
				if (a && cc.isString(b)) a[b](this);
				else a && cc.isFunction(b) ? b.call(a, this) : b(this)
		}
	}
});
_p = cc.MenuItem.prototype;
cc.defineGetterSetter(_p, "enabled", _p.isEnabled, _p.setEnabled);
cc.MenuItem.create = function(a, b) {
	return new cc.MenuItem(a, b)
};
cc.MenuItemLabel = cc.MenuItem.extend({
	_disabledColor: null,
	_label: null,
	_orginalScale: 0,
	_colorBackup: null,
	ctor: function(a, b, c) {
		cc.MenuItem.prototype.ctor.call(this, b, c);
		this._label = this._disabledColor = null;
		this._orginalScale = 0;
		this._colorBackup = null;
		a && (this._originalScale = 1, this._colorBackup = cc.color.WHITE, this._disabledColor = cc.color(126, 126, 126), this.setLabel(a), this.cascadeOpacity = this.cascadeColor = !0)
	},
	getDisabledColor: function() {
		return this._disabledColor
	},
	setDisabledColor: function(a) {
		this._disabledColor = a
	},
	getLabel: function() {
		return this._label
	},
	setLabel: function(a) {
		a && (this.addChild(a), a.anchorX = 0, a.anchorY = 0, this.width = a.width, this.height = a.height);
		this._label && this.removeChild(this._label, !0);
		this._label = a
	},
	setEnabled: function(a) {
		if (this._enabled != a) {
			var b = this._label;
			a ? b.color = this._colorBackup : (this._colorBackup = b.color, b.color = this._disabledColor)
		}
		cc.MenuItem.prototype.setEnabled.call(this, a)
	},
	setOpacity: function(a) {
		this._label.opacity = a
	},
	getOpacity: function() {
		return this._label.opacity
	},
	setColor: function(a) {
		this._label.color = a
	},
	getColor: function() {
		return this._label.color
	},
	initWithLabel: function(a, b, c) {
		this.initWithCallback(b, c);
		this._originalScale = 1;
		this._colorBackup = cc.color.WHITE;
		this._disabledColor = cc.color(126, 126, 126);
		this.setLabel(a);
		return this.cascadeOpacity = this.cascadeColor = !0
	},
	setString: function(a) {
		this._label.string = a;
		this.width = this._label.width;
		this.height = this._label.height
	},
	getString: function() {
		return this._label.string
	},
	activate: function() {
		this._enabled && (this.stopAllActions(), this.scale = this._originalScale, cc.MenuItem.prototype.activate.call(this))
	},
	selected: function() {
		if (this._enabled) {
			cc.MenuItem.prototype.selected.call(this);
			var a = this.getActionByTag(cc.ZOOM_ACTION_TAG);
			a ? this.stopAction(a) : this._originalScale = this.scale;
			a = cc.ScaleTo.create(0.1, 1.2 * this._originalScale);
			a.setTag(cc.ZOOM_ACTION_TAG);
			this.runAction(a)
		}
	},
	unselected: function() {
		if (this._enabled) {
			cc.MenuItem.prototype.unselected.call(this);
			this.stopActionByTag(cc.ZOOM_ACTION_TAG);
			var a = cc.ScaleTo.create(0.1, this._originalScale);
			a.setTag(cc.ZOOM_ACTION_TAG);
			this.runAction(a)
		}
	}
});
_p = cc.MenuItemLabel.prototype;
cc.defineGetterSetter(_p, "string", _p.getString, _p.setString);
cc.defineGetterSetter(_p, "disabledColor", _p.getDisabledColor, _p.setDisabledColor);
cc.defineGetterSetter(_p, "label", _p.getLabel, _p.setLabel);
cc.MenuItemLabel.create = function(a, b, c) {
	return new cc.MenuItemLabel(a, b, c)
};
cc.MenuItemAtlasFont = cc.MenuItemLabel.extend({
	ctor: function(a, b, c, d, e, f, g) {
		var h;
		a && 0 < a.length && (h = cc.LabelAtlas.create(a, b, c, d, e));
		cc.MenuItemLabel.prototype.ctor.call(this, h, f, g)
	},
	initWithString: function(a, b, c, d, e, f, g) {
		if (!a || 0 == a.length) throw "cc.MenuItemAtlasFont.initWithString(): value should be non-null and its length should be greater than 0";
		var h = new cc.LabelAtlas;
		h.initWithString(a, b, c, d, e);
		this.initWithLabel(h, f, g);
		return !0
	}
});
cc.MenuItemAtlasFont.create = function(a, b, c, d, e, f, g) {
	return new cc.MenuItemAtlasFont(a, b, c, d, e, f, g)
};
cc.MenuItemFont = cc.MenuItemLabel.extend({
	_fontSize: null,
	_fontName: null,
	ctor: function(a, b, c) {
		var d;
		a && 0 < a.length ? (this._fontName = cc._globalFontName, this._fontSize = cc._globalFontSize, d = cc.LabelTTF.create(a, this._fontName, this._fontSize)) : (this._fontSize = 0, this._fontName = "");
		cc.MenuItemLabel.prototype.ctor.call(this, d, b, c)
	},
	initWithString: function(a, b, c) {
		if (!a || 0 == a.length) throw "Value should be non-null and its length should be greater than 0";
		this._fontName = cc._globalFontName;
		this._fontSize = cc._globalFontSize;
		a = cc.LabelTTF.create(a, this._fontName, this._fontSize);
		this.initWithLabel(a, b, c);
		return !0
	},
	setFontSize: function(a) {
		this._fontSize = a;
		this._recreateLabel()
	},
	getFontSize: function() {
		return this._fontSize
	},
	setFontName: function(a) {
		this._fontName = a;
		this._recreateLabel()
	},
	getFontName: function() {
		return this._fontName
	},
	_recreateLabel: function() {
		var a = cc.LabelTTF.create(this._label.string, this._fontName, this._fontSize);
		this.setLabel(a)
	}
});
cc.MenuItemFont.setFontSize = function(a) {
	cc._globalFontSize = a
};
cc.MenuItemFont.fontSize = function() {
	return cc._globalFontSize
};
cc.MenuItemFont.setFontName = function(a) {
	cc._globalFontNameRelease && (cc._globalFontName = "");
	cc._globalFontName = a;
	cc._globalFontNameRelease = !0
};
_p = cc.MenuItemFont.prototype;
cc.defineGetterSetter(_p, "fontSize", _p.getFontSize, _p.setFontSize);
cc.defineGetterSetter(_p, "fontName", _p.getFontName, _p.setFontName);
cc.MenuItemFont.fontName = function() {
	return cc._globalFontName
};
cc.MenuItemFont.create = function(a, b, c) {
	return new cc.MenuItemFont(a, b, c)
};
cc.MenuItemSprite = cc.MenuItem.extend({
	_normalImage: null,
	_selectedImage: null,
	_disabledImage: null,
	ctor: function(a, b, c, d, e) {
		cc.MenuItem.prototype.ctor.call(this);
		this._disabledImage = this._selectedImage = this._normalImage = null;
		if (void 0 !== b) {
			var f, g, h;
			void 0 !== e ? (f = c, h = d, g = e) : void 0 !== d && cc.isFunction(d) ? (f = c, h = d) : void 0 !== d && cc.isFunction(c) ? (g = d, h = c, f = cc.Sprite.create(b)) : void 0 === c && (f = cc.Sprite.create(b));
			this.initWithNormalSprite(a, b, f, h, g)
		}
	},
	getNormalImage: function() {
		return this._normalImage
	},
	setNormalImage: function(a) {
		this._normalImage != a && (a && (this.addChild(a, 0, cc.NORMAL_TAG), a.anchorX = 0, a.anchorY = 0), this._normalImage && this.removeChild(this._normalImage, !0), this._normalImage = a, this.width = this._normalImage.width, this.height = this._normalImage.height, this._updateImagesVisibility(), a.textureLoaded && !a.textureLoaded() && a.addLoadedEventListener(function(a) {
			this.width = a.width;
			this.height = a.height
		}, this))
	},
	getSelectedImage: function() {
		return this._selectedImage
	},
	setSelectedImage: function(a) {
		this._selectedImage != a && (a && (this.addChild(a, 0, cc.SELECTED_TAG), a.anchorX = 0, a.anchorY = 0), this._selectedImage && this.removeChild(this._selectedImage, !0), this._selectedImage = a, this._updateImagesVisibility())
	},
	getDisabledImage: function() {
		return this._disabledImage
	},
	setDisabledImage: function(a) {
		this._disabledImage != a && (a && (this.addChild(a, 0, cc.DISABLE_TAG), a.anchorX = 0, a.anchorY = 0), this._disabledImage && this.removeChild(this._disabledImage, !0), this._disabledImage = a, this._updateImagesVisibility())
	},
	initWithNormalSprite: function(a, b, c, d, e) {
		this.initWithCallback(d, e);
		this.setNormalImage(a);
		this.setSelectedImage(b);
		this.setDisabledImage(c);
		if (a = this._normalImage) this.width = a.width, this.height = a.height, a.textureLoaded && !a.textureLoaded() && a.addLoadedEventListener(function(a) {
			this.width = a.width;
			this.height = a.height;
			this.cascadeOpacity = this.cascadeColor = !0
		}, this);
		return this.cascadeOpacity = this.cascadeColor = !0
	},
	setColor: function(a) {
		this._normalImage.color = a;
		this._selectedImage && (this._selectedImage.color = a);
		this._disabledImage && (this._disabledImage.color = a)
	},
	getColor: function() {
		return this._normalImage.color
	},
	setOpacity: function(a) {
		this._normalImage.opacity = a;
		this._selectedImage && (this._selectedImage.opacity = a);
		this._disabledImage && (this._disabledImage.opacity = a)
	},
	getOpacity: function() {
		return this._normalImage.opacity
	},
	selected: function() {
		cc.MenuItem.prototype.selected.call(this);
		this._normalImage && (this._disabledImage && (this._disabledImage.visible = !1), this._selectedImage ? (this._normalImage.visible = !1, this._selectedImage.visible = !0) : this._normalImage.visible = !0)
	},
	unselected: function() {
		cc.MenuItem.prototype.unselected.call(this);
		this._normalImage && (this._normalImage.visible = !0, this._selectedImage && (this._selectedImage.visible = !1), this._disabledImage && (this._disabledImage.visible = !1))
	},
	setEnabled: function(a) {
		this._enabled != a && (cc.MenuItem.prototype.setEnabled.call(this, a), this._updateImagesVisibility())
	},
	_updateImagesVisibility: function() {
		var a = this._normalImage,
			b = this._selectedImage,
			c = this._disabledImage;
		this._enabled ? (a && (a.visible = !0), b && (b.visible = !1), c && (c.visible = !1)) : c ? (a && (a.visible = !1), b && (b.visible = !1), c && (c.visible = !0)) : (a && (a.visible = !0), b && (b.visible = !1))
	}
});
_p = cc.MenuItemSprite.prototype;
cc.defineGetterSetter(_p, "normalImage", _p.getNormalImage, _p.setNormalImage);
cc.defineGetterSetter(_p, "selectedImage", _p.getSelectedImage, _p.setSelectedImage);
cc.defineGetterSetter(_p, "disabledImage", _p.getDisabledImage, _p.setDisabledImage);
cc.MenuItemSprite.create = function(a, b, c, d, e) {
	return new cc.MenuItemSprite(a, b, c, d, e || void 0)
};
cc.MenuItemImage = cc.MenuItemSprite.extend({
	ctor: function(a, b, c, d, e) {
		var f = null,
			g = null,
			h = null,
			k = null,
			m = null;
		void 0 === a ? cc.MenuItemSprite.prototype.ctor.call(this) : (f = cc.Sprite.create(a), b && (g = cc.Sprite.create(b)), void 0 === d ? k = c : void 0 === e ? (k = c, m = d) : e && (h = cc.Sprite.create(c), k = d, m = e), cc.MenuItemSprite.prototype.ctor.call(this, f, g, h, k, m))
	},
	setNormalSpriteFrame: function(a) {
		this.setNormalImage(cc.Sprite.create(a))
	},
	setSelectedSpriteFrame: function(a) {
		this.setSelectedImage(cc.Sprite.create(a))
	},
	setDisabledSpriteFrame: function(a) {
		this.setDisabledImage(cc.Sprite.create(a))
	},
	initWithNormalImage: function(a, b, c, d, e) {
		var f = null,
			g = null,
			h = null;
		a && (f = cc.Sprite.create(a));
		b && (g = cc.Sprite.create(b));
		c && (h = cc.Sprite.create(c));
		return this.initWithNormalSprite(f, g, h, d, e)
	}
});
cc.MenuItemImage.create = function(a, b, c, d, e) {
	return new cc.MenuItemImage(a, b, c, d, e)
};
cc.MenuItemToggle = cc.MenuItem.extend({
	subItems: null,
	_selectedIndex: 0,
	_opacity: null,
	_color: null,
	ctor: function() {
		cc.MenuItem.prototype.ctor.call(this);
		this._selectedIndex = 0;
		this.subItems = [];
		this._opacity = 0;
		this._color = cc.color.WHITE;
		0 < arguments.length && this.initWithItems(Array.prototype.slice.apply(arguments))
	},
	getOpacity: function() {
		return this._opacity
	},
	setOpacity: function(a) {
		this._opacity = a;
		if (this.subItems && 0 < this.subItems.length)
			for (var b = 0; b < this.subItems.length; b++) this.subItems[b].opacity = a;
		this._color.a = a
	},
	getColor: function() {
		var a = this._color;
		return cc.color(a.r, a.g, a.b, a.a)
	},
	setColor: function(a) {
		var b = this._color;
		b.r = a.r;
		b.g = a.g;
		b.b = a.b;
		if (this.subItems && 0 < this.subItems.length)
			for (b = 0; b < this.subItems.length; b++) this.subItems[b].setColor(a);
		void 0 === a.a || a.a_undefined || this.setOpacity(a.a)
	},
	getSelectedIndex: function() {
		return this._selectedIndex
	},
	setSelectedIndex: function(a) {
		if (a != this._selectedIndex) {
			this._selectedIndex = a;
			(a = this.getChildByTag(cc.CURRENT_ITEM)) && a.removeFromParent(!1);
			a = this.subItems[this._selectedIndex];
			this.addChild(a, 0, cc.CURRENT_ITEM);
			var b = a.width,
				c = a.height;
			this.width = b;
			this.height = c;
			a.setPosition(b / 2, c / 2)
		}
	},
	getSubItems: function() {
		return this.subItems
	},
	setSubItems: function(a) {
		this.subItems = a
	},
	initWithItems: function(a) {
		var b = a.length;
		cc.isFunction(a[a.length - 2]) ? (this.initWithCallback(a[a.length - 2], a[a.length - 1]), b -= 2) : cc.isFunction(a[a.length - 1]) ? (this.initWithCallback(a[a.length - 1], null), b -= 1) : this.initWithCallback(null, null);
		for (var c = this.subItems, d = c.length = 0; d < b; d++) a[d] && c.push(a[d]);
		this._selectedIndex = cc.UINT_MAX;
		this.setSelectedIndex(0);
		return this.cascadeOpacity = this.cascadeColor = !0
	},
	addSubItem: function(a) {
		this.subItems.push(a)
	},
	activate: function() {
		this._enabled && this.setSelectedIndex((this._selectedIndex + 1) % this.subItems.length);
		cc.MenuItem.prototype.activate.call(this)
	},
	selected: function() {
		cc.MenuItem.prototype.selected.call(this);
		this.subItems[this._selectedIndex].selected()
	},
	unselected: function() {
		cc.MenuItem.prototype.unselected.call(this);
		this.subItems[this._selectedIndex].unselected()
	},
	setEnabled: function(a) {
		if (this._enabled != a) {
			cc.MenuItem.prototype.setEnabled.call(this, a);
			var b = this.subItems;
			if (b && 0 < b.length)
				for (var c = 0; c < b.length; c++) b[c].enabled = a
		}
	},
	selectedItem: function() {
		return this.subItems[this._selectedIndex]
	},
	onEnter: function() {
		cc.Node.prototype.onEnter.call(this);
		this.setSelectedIndex(this._selectedIndex)
	}
});
_p = cc.MenuItemToggle.prototype;
cc.defineGetterSetter(_p, "selectedIndex", _p.getSelectedIndex, _p.setSelectedIndex);
cc.MenuItemToggle.create = function() {
	0 < arguments.length && null == arguments[arguments.length - 1] && cc.log("parameters should not be ending with null in Javascript");
	var a = new cc.MenuItemToggle;
	a.initWithItems(Array.prototype.slice.apply(arguments));
	return a
};
cc.MENU_STATE_WAITING = 0;
cc.MENU_STATE_TRACKING_TOUCH = 1;
cc.MENU_HANDLER_PRIORITY = -128;
cc.DEFAULT_PADDING = 5;
cc.Menu = cc.Layer.extend({
	enabled: !1,
	_selectedItem: null,
	_state: -1,
	_touchListener: null,
	_className: "Menu",
	ctor: function(a) {
		cc.Layer.prototype.ctor.call(this);
		this._color = cc.color.WHITE;
		this.enabled = !1;
		this._opacity = 255;
		this._selectedItem = null;
		this._state = -1;
		this._touchListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: !0,
			onTouchBegan: this._onTouchBegan,
			onTouchMoved: this._onTouchMoved,
			onTouchEnded: this._onTouchEnded,
			onTouchCancelled: this._onTouchCancelled
		});
		0 < arguments.length && null == arguments[arguments.length - 1] && cc.log("parameters should not be ending with null in Javascript");
		var b = arguments.length,
			c;
		if (0 == b) c = [];
		else if (1 == b) c = a instanceof Array ? a : [a];
		else if (1 < b) {
			c = [];
			for (var d = 0; d < b; d++) arguments[d] && c.push(arguments[d])
		}
		this.initWithArray(c)
	},
	onEnter: function() {
		var a = this._touchListener;
		a._isRegistered() || cc.eventManager.addListener(a, this);
		cc.Node.prototype.onEnter.call(this)
	},
	isEnabled: function() {
		return this.enabled
	},
	setEnabled: function(a) {
		this.enabled = a
	},
	initWithItems: function(a) {
		var b = [];
		if (a)
			for (var c = 0; c < a.length; c++) a[c] && b.push(a[c]);
		return this.initWithArray(b)
	},
	initWithArray: function(a) {
		if (cc.Layer.prototype.init.call(this)) {
			this.enabled = !0;
			var b = cc.winSize;
			this.setPosition(b.width / 2, b.height / 2);
			this.setContentSize(b);
			this.setAnchorPoint(0.5, 0.5);
			this.ignoreAnchorPointForPosition(!0);
			if (a)
				for (b = 0; b < a.length; b++) this.addChild(a[b], b);
			this._selectedItem = null;
			this._state = cc.MENU_STATE_WAITING;
			return this.cascadeOpacity = this.cascadeColor = !0
		}
		return !1
	},
	addChild: function(a, b, c) {
		if (!(a instanceof cc.MenuItem)) throw "cc.Menu.addChild() : Menu only supports MenuItem objects as children";
		cc.Layer.prototype.addChild.call(this, a, b, c)
	},
	alignItemsVertically: function() {
		this.alignItemsVerticallyWithPadding(cc.DEFAULT_PADDING)
	},
	alignItemsVerticallyWithPadding: function(a) {
		var b = -a,
			c = this._children,
			d, e, f, g;
		if (c && 0 < c.length) {
			e = 0;
			for (d = c.length; e < d; e++) b += c[e].height * c[e].scaleY + a;
			var h = b / 2;
			e = 0;
			for (d = c.length; e < d; e++) g = c[e], f = g.height, b = g.scaleY, g.setPosition(0, h - f * b / 2), h -= f * b + a
		}
	},
	alignItemsHorizontally: function() {
		this.alignItemsHorizontallyWithPadding(cc.DEFAULT_PADDING)
	},
	alignItemsHorizontallyWithPadding: function(a) {
		var b = -a,
			c = this._children,
			d, e, f, g;
		if (c && 0 < c.length) {
			d = 0;
			for (e = c.length; d < e; d++) b += c[d].width * c[d].scaleX + a;
			var h = -b / 2;
			d = 0;
			for (e = c.length; d < e; d++) g = c[d], b = g.scaleX, f = c[d].width, g.setPosition(h + f * b / 2, 0), h += f * b + a
		}
	},
	alignItemsInColumns: function() {
		0 < arguments.length && null == arguments[arguments.length - 1] && cc.log("parameters should not be ending with null in Javascript");
		for (var a = [], b = 0; b < arguments.length; b++) a.push(arguments[b]);
		var c = -5,
			d = 0,
			e = 0,
			f = 0,
			g, h, k, m = this._children;
		if (m && 0 < m.length)
			for (b = 0, k = m.length; b < k; b++) d >= a.length || !(g = a[d]) || (h = m[b].height, e = e >= h || isNaN(h) ? e : h, ++f, f >= g && (c += e + 5, e = f = 0, ++d));
		var n = cc.director.getWinSize(),
			q = g = e = d = 0,
			s = 0,
			c = c / 2;
		if (m && 0 < m.length)
			for (b = 0, k = m.length; b < k; b++) {
				var r = m[b];
				0 == g && (g = a[d], s = q = n.width / (1 + g));
				h = r._getHeight();
				e = e >= h || isNaN(h) ? e : h;
				r.setPosition(s - n.width / 2, c - h / 2);
				s += q;
				++f;
				f >= g && (c -= e + 5, e = g = f = 0, ++d)
			}
	},
	alignItemsInRows: function() {
		0 < arguments.length && null == arguments[arguments.length - 1] && cc.log("parameters should not be ending with null in Javascript");
		var a = [],
			b;
		for (b = 0; b < arguments.length; b++) a.push(arguments[b]);
		var c = [],
			d = [],
			e = -10,
			f = -5,
			g = 0,
			h = 0,
			k = 0,
			m, n, q, s, r = this._children;
		if (r && 0 < r.length)
			for (b = 0, q = r.length; b < q; b++)(n = r[b], g >= a.length || !(m = a[g])) || (s = n.width, h = h >= s || isNaN(s) ? h : s, f += n.height + 5, ++k, k >= m && (c.push(h), d.push(f), e += h + 10, h = k = 0, f = -5, ++g));
		f = cc.director.getWinSize();
		m = h = g = 0;
		var e = -e / 2,
			t = 0;
		if (r && 0 < r.length)
			for (b = 0, q = r.length; b < q; b++) n = r[b], 0 == m && (m = a[g], t = d[g]), s = n._getWidth(), h = h >= s || isNaN(s) ? h : s, n.setPosition(e + c[g] / 2, t - f.height / 2), t -= n.height + 10, ++k, k >= m && (e += h + 5, h = m = k = 0, ++g)
	},
	removeChild: function(a, b) {
		null != a && (a instanceof cc.MenuItem ? (this._selectedItem == a && (this._selectedItem = null), cc.Node.prototype.removeChild.call(this, a, b)) : cc.log("cc.Menu.removeChild():Menu only supports MenuItem objects as children"))
	},
	_onTouchBegan: function(a, b) {
		var c = b.getCurrentTarget();
		if (c._state != cc.MENU_STATE_WAITING || !c._visible || !c.enabled) return !1;
		for (var d = c.parent; null != d; d = d.parent)
			if (!d.isVisible()) return !1;
		c._selectedItem = c._itemForTouch(a);
		return c._selectedItem ? (c._state = cc.MENU_STATE_TRACKING_TOUCH, c._selectedItem.selected(), !0) : !1
	},
	_onTouchEnded: function(a, b) {
		var c = b.getCurrentTarget();
		c._state !== cc.MENU_STATE_TRACKING_TOUCH ? cc.log("cc.Menu.onTouchEnded(): invalid state") : (c._selectedItem && (c._selectedItem.unselected(), c._selectedItem.activate()), c._state = cc.MENU_STATE_WAITING)
	},
	_onTouchCancelled: function(a, b) {
		var c = b.getCurrentTarget();
		c._state !== cc.MENU_STATE_TRACKING_TOUCH ? cc.log("cc.Menu.onTouchCancelled(): invalid state") : (this._selectedItem && c._selectedItem.unselected(), c._state = cc.MENU_STATE_WAITING)
	},
	_onTouchMoved: function(a, b) {
		var c = b.getCurrentTarget();
		if (c._state !== cc.MENU_STATE_TRACKING_TOUCH) cc.log("cc.Menu.onTouchMoved(): invalid state");
		else {
			var d = c._itemForTouch(a);
			d != c._selectedItem && (c._selectedItem && c._selectedItem.unselected(), c._selectedItem = d, c._selectedItem && c._selectedItem.selected())
		}
	},
	onExit: function() {
		this._state == cc.MENU_STATE_TRACKING_TOUCH && (this._selectedItem && (this._selectedItem.unselected(), this._selectedItem = null), this._state = cc.MENU_STATE_WAITING);
		cc.Node.prototype.onExit.call(this)
	},
	setOpacityModifyRGB: function(a) {},
	isOpacityModifyRGB: function() {
		return !1
	},
	_itemForTouch: function(a) {
		a = a.getLocation();
		var b = this._children,
			c;
		if (b && 0 < b.length)
			for (var d = b.length - 1; 0 <= d; d--)
				if (c = b[d], c.isVisible() && c.isEnabled()) {
					var e = c.convertToNodeSpace(a),
						f = c.rect();
					f.x = 0;
					f.y = 0;
					if (cc.rectContainsPoint(f, e)) return c
				}
		return null
	}
});
_p = cc.Menu.prototype;
cc.Menu.create = function(a) {
	var b = arguments.length;
	0 < b && null == arguments[b - 1] && cc.log("parameters should not be ending with null in Javascript");
	return 0 == b ? new cc.Menu : 1 == b ? new cc.Menu(a) : new cc.Menu(Array.prototype.slice.call(arguments, 0))
};
cc.TGA_OK = 0;
cc.TGA_ERROR_FILE_OPEN = 1;
cc.TGA_ERROR_READING_FILE = 2;
cc.TGA_ERROR_INDEXED_COLOR = 3;
cc.TGA_ERROR_MEMORY = 4;
cc.TGA_ERROR_COMPRESSED_FILE = 5;
cc.ImageTGA = function(a, b, c, d, e, f, g) {
	this.status = a || 0;
	this.type = b || 0;
	this.pixelDepth = c || 0;
	this.width = d || 0;
	this.height = e || 0;
	this.imageData = f || [];
	this.flipped = g || 0
};
cc.tgaLoadHeader = function(a, b, c) {
	var d = 2;
	if (d + 1 > b) return !1;
	a = new cc.BinaryStreamReader(a);
	a.setOffset(d);
	c.type = a.readByte();
	d += 10;
	if (d + 4 + 1 > b) return !1;
	a.setOffset(d);
	c.width = a.readUnsignedShort();
	c.height = a.readUnsignedInteger();
	c.pixelDepth = a.readByte();
	if (d + 5 + 1 > b) return !1;
	b = a.readByte();
	c.flipped = 0;
	b & 32 && (c.flipped = 1);
	return !0
};
cc.tgaLoadImageData = function(a, b, c) {
	var d, e;
	d = 0 | c.pixelDepth / 2;
	e = c.height * c.width * d;
	if (18 + e > b) return !1;
	c.imageData = cc.__getSubArray(a, 18, 18 + e);
	if (3 <= d)
		for (a = 0; a < e; a += d) b = c.imageData[a], c.imageData[a] = c.imageData[a + 2], c.imageData[a + 2] = b;
	return !0
};
cc.tgaRGBtogreyscale = function(a) {
	var b, c;
	if (8 !== a.pixelDepth) {
		var d = a.pixelDepth / 8,
			e = new Uint8Array(a.height * a.width);
		if (null !== e) {
			for (c = b = 0; c < a.width * a.height; b += d, c++) e[c] = 0.3 * a.imageData[b] + 0.59 * a.imageData[b + 1] + 0.11 * a.imageData[b + 2];
			a.pixelDepth = 8;
			a.type = 3;
			a.imageData = e
		}
	}
};
cc.tgaDestroy = function(a) {
	a && (a.imageData = null)
};
cc.tgaLoadRLEImageData = function(a, b, c) {
	var d, e, f, g = 0,
		h = 0,
		k = 0,
		m = [],
		n = 0,
		q = 18;
	d = c.pixelDepth / 8;
	e = c.height * c.width;
	for (f = 0; f < e; f++) {
		if (0 != n) n--, h = 0 != k;
		else {
			if (q + 1 > b) break;
			n = a[q];
			q += 1;
			(k = n & 128) && (n -= 128);
			h = 0
		}
		if (!h) {
			if (q + d > b) break;
			m = cc.__getSubArray(a, q, q + d);
			q += d;
			3 <= d && (h = m[0], m[0] = m[2], m[2] = h)
		}
		for (h = 0; h < d; h++) c.imageData[g + h] = m[h];
		g += d
	}
	return !0
};
cc.tgaFlipImage = function(a) {
	for (var b = a.pixelDepth / 8 * a.width, c = 0; c < a.height / 2; c++) {
		var d = cc.__getSubArray(a.imageData, c * b, c * b + b);
		cc.__setDataToArray(cc.__getSubArray(a.imageData, (a.height - (c + 1)) * b, b), a.imageData, c * b);
		cc.__setDataToArray(d, a.imageData, (a.height - (c + 1)) * b)
	}
	a.flipped = 0
};
cc.__getSubArray = function(a, b, c) {
	return a instanceof Array ? a.slice(b, c) : a.subarray(b, c)
};
cc.__setDataToArray = function(a, b, c) {
	for (var d = 0; d < a.length; d++) b[c + d] = a[d]
};
cc.BinaryStreamReader = cc.Class.extend({
	_binaryData: null,
	_offset: 0,
	ctor: function(a) {
		this._binaryData = a
	},
	setBinaryData: function(a) {
		this._binaryData = a;
		this._offset = 0
	},
	getBinaryData: function() {
		return this._binaryData
	},
	_checkSize: function(a) {
		if (!(this._offset + Math.ceil(a / 8) < this._data.length)) throw Error("Index out of bound");
	},
	_decodeFloat: function(a, b) {
		var c = a + b + 1,
			d = c >> 3;
		this._checkSize(c);
		var c = Math.pow(2, b - 1) - 1,
			e = this._readBits(a + b, 1, d),
			f = this._readBits(a, b, d),
			g = 0,
			h = 2,
			k = 0;
		do
			for (var m = this._readByte(++k, d), n = a % 8 || 8, q = 1 << n; q >>= 1;) m & q && (g += 1 / h), h *= 2; while (a -= n);
		this._offset += d;
		return f == (c << 1) + 1 ? g ? NaN : e ? -Infinity : Infinity : (1 + -2 * e) * (f || g ? f ? Math.pow(2, f - c) * (1 + g) : Math.pow(2, -c + 1) * g : 0)
	},
	_readByte: function(a, b) {
		return this._data[this._offset + b - a - 1]
	},
	_decodeInt: function(a, b) {
		var c = this._readBits(0, a, a / 8),
			d = Math.pow(2, a);
		this._offset += a / 8;
		return b && c >= d / 2 ? c - d : c
	},
	_shl: function(a, b) {
		for (++b; --b; a = 1073741824 == ((a %= 2147483648) & 1073741824) ? 2 * a : 2 * (a - 1073741824) + 2147483648);
		return a
	},
	_readBits: function(a, b, c) {
		var d = (a + b) % 8,
			e = a % 8,
			f = c - (a >> 3) - 1;
		a = c + (-(a + b) >> 3);
		var g = f - a;
		b = this._readByte(f, c) >> e & (1 << (g ? 8 - e : b)) - 1;
		for (g && d && (b += (this._readByte(a++, c) & (1 << d) - 1) << (g-- << 3) - e); g;) b += this._shl(this._readByte(a++, c), (g-- << 3) - e);
		return b
	},
	readInteger: function() {
		return this._decodeInt(32, !0)
	},
	readUnsignedInteger: function() {
		return this._decodeInt(32, !1)
	},
	readSingle: function() {
		return this._decodeFloat(23, 8)
	},
	readShort: function() {
		return this._decodeInt(16, !0)
	},
	readUnsignedShort: function() {
		return this._decodeInt(16, !1)
	},
	readByte: function() {
		var a = this._data[this._offset];
		this._offset += 1;
		return a
	},
	readData: function(a, b) {
		return this._binaryData instanceof Array ? this._binaryData.slice(a, b) : this._binaryData.subarray(a, b)
	},
	setOffset: function(a) {
		this._offset = a
	},
	getOffset: function() {
		return this._offset
	}
});
cc.TMX_ORIENTATION_ORTHO = 0;
cc.TMX_ORIENTATION_HEX = 1;
cc.TMX_ORIENTATION_ISO = 2;
cc.TMXTiledMap = cc.Node.extend({
	properties: null,
	mapOrientation: null,
	objectGroups: null,
	_mapSize: null,
	_tileSize: null,
	_tileProperties: null,
	_className: "TMXTiledMap",
	ctor: function(a, b) {
		cc.Node.prototype.ctor.call(this);
		this._mapSize = cc.size(0, 0);
		this._tileSize = cc.size(0, 0);
		void 0 !== b ? this.initWithXML(a, b) : void 0 !== a && this.initWithTMXFile(a)
	},
	getMapSize: function() {
		return cc.size(this._mapSize.width, this._mapSize.height)
	},
	setMapSize: function(a) {
		this._mapSize.width = a.width;
		this._mapSize.height = a.height
	},
	_getMapWidth: function() {
		return this._mapSize.width
	},
	_setMapWidth: function(a) {
		this._mapSize.width = a
	},
	_getMapHeight: function() {
		return this._mapSize.height
	},
	_setMapHeight: function(a) {
		this._mapSize.height = a
	},
	getTileSize: function() {
		return cc.size(this._tileSize.width, this._tileSize.height)
	},
	setTileSize: function(a) {
		this._tileSize.width = a.width;
		this._tileSize.height = a.height
	},
	_getTileWidth: function() {
		return this._tileSize.width
	},
	_setTileWidth: function(a) {
		this._tileSize.width = a
	},
	_getTileHeight: function() {
		return this._tileSize.height
	},
	_setTileHeight: function(a) {
		this._tileSize.height = a
	},
	getMapOrientation: function() {
		return this.mapOrientation
	},
	setMapOrientation: function(a) {
		this.mapOrientation = a
	},
	getObjectGroups: function() {
		return this.objectGroups
	},
	setObjectGroups: function(a) {
		this.objectGroups = a
	},
	getProperties: function() {
		return this.properties
	},
	setProperties: function(a) {
		this.properties = a
	},
	initWithTMXFile: function(a) {
		if (!a || 0 == a.length) throw "cc.TMXTiledMap.initWithTMXFile(): tmxFile should be non-null or non-empty string.";
		this.height = this.width = 0;
		a = cc.TMXMapInfo.create(a);
		if (!a) return !1;
		var b = a.getTilesets();
		b && 0 !== b.length || cc.log("cc.TMXTiledMap.initWithTMXFile(): Map not found. Please check the filename.");
		this._buildWithMapInfo(a);
		return !0
	},
	initWithXML: function(a, b) {
		this.height = this.width = 0;
		var c = cc.TMXMapInfo.create(a, b),
			d = c.getTilesets();
		d && 0 !== d.length || cc.log("cc.TMXTiledMap.initWithXML(): Map not found. Please check the filename.");
		this._buildWithMapInfo(c);
		return !0
	},
	_buildWithMapInfo: function(a) {
		this._mapSize = a.getMapSize();
		this._tileSize = a.getTileSize();
		this.mapOrientation = a.orientation;
		this.objectGroups = a.getObjectGroups();
		this.properties = a.properties;
		this._tileProperties = a.getTileProperties();
		var b = 0,
			c = a.getLayers();
		if (c)
			for (var d = null, e = 0, f = c.length; e < f; e++)(d = c[e]) && d.visible && (d = this._parseLayer(d, a), this.addChild(d, b, b), this.width = Math.max(this.width, d.width), this.height = Math.max(this.height, d.height), b++)
	},
	allLayers: function() {
		for (var a = [], b = this._children, c = 0, d = b.length; c < d; c++) {
			var e = b[c];
			e && e instanceof cc.TMXLayer && a.push(e)
		}
		return a
	},
	getLayer: function(a) {
		if (!a || 0 === a.length) throw "cc.TMXTiledMap.getLayer(): layerName should be non-null or non-empty string.";
		for (var b = this._children, c = 0; c < b.length; c++) {
			var d = b[c];
			if (d && d.layerName == a) return d
		}
		return null
	},
	getObjectGroup: function(a) {
		if (!a || 0 === a.length) throw "cc.TMXTiledMap.getObjectGroup(): groupName should be non-null or non-empty string.";
		if (this.objectGroups)
			for (var b = 0; b < this.objectGroups.length; b++) {
				var c = this.objectGroups[b];
				if (c && c.groupName == a) return c
			}
		return null
	},
	getProperty: function(a) {
		return this.properties[a.toString()]
	},
	propertiesForGID: function(a) {
		cc.log("propertiesForGID is deprecated. Please use getPropertiesForGID instead.");
		return this.getPropertiesForGID[a]
	},
	getPropertiesForGID: function(a) {
		return this._tileProperties[a]
	},
	_parseLayer: function(a, b) {
		var c = this._tilesetForLayer(a, b),
			c = cc.TMXLayer.create(c, a, b);
		a.ownTiles = !1;
		c.setupTiles();
		return c
	},
	_tilesetForLayer: function(a, b) {
		var c = a._layerSize,
			d = b.getTilesets();
		if (d)
			for (var e = d.length - 1; 0 <= e; e--) {
				var f = d[e];
				if (f)
					for (var g = 0; g < c.height; g++)
						for (var h = 0; h < c.width; h++) {
							var k = a._tiles[h + c.width * g];
							if (0 != k && (k & cc.TMX_TILE_FLIPPED_MASK) >>> 0 >= f.firstGid) return f
						}
			}
		cc.log("cocos2d: Warning: TMX Layer " + a.name + " has no tiles");
		return null
	}
});
_p = cc.TMXTiledMap.prototype;
cc.defineGetterSetter(_p, "mapWidth", _p._getMapWidth, _p._setMapWidth);
cc.defineGetterSetter(_p, "mapHeight", _p._getMapHeight, _p._setMapHeight);
cc.defineGetterSetter(_p, "tileWidth", _p._getTileWidth, _p._setTileWidth);
cc.defineGetterSetter(_p, "tileHeight", _p._getTileHeight, _p._setTileHeight);
cc.TMXTiledMap.create = function(a, b) {
	return new cc.TMXTiledMap(a, b)
};
cc.TMX_PROPERTY_NONE = 0;
cc.TMX_PROPERTY_MAP = 1;
cc.TMX_PROPERTY_LAYER = 2;
cc.TMX_PROPERTY_OBJECTGROUP = 3;
cc.TMX_PROPERTY_OBJECT = 4;
cc.TMX_PROPERTY_TILE = 5;
cc.TMX_TILE_HORIZONTAL_FLAG = 2147483648;
cc.TMX_TILE_VERTICAL_FLAG = 1073741824;
cc.TMX_TILE_DIAGONAL_FLAG = 536870912;
cc.TMX_TILE_FLIPPED_ALL = (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_DIAGONAL_FLAG) >>> 0;
cc.TMX_TILE_FLIPPED_MASK = ~cc.TMX_TILE_FLIPPED_ALL >>> 0;
cc.TMXLayerInfo = cc.Class.extend({
	properties: null,
	name: "",
	_layerSize: null,
	_tiles: null,
	visible: null,
	_opacity: null,
	ownTiles: !0,
	_minGID: 1E5,
	_maxGID: 0,
	offset: null,
	ctor: function() {
		this.properties = [];
		this.name = "";
		this._layerSize = null;
		this._tiles = [];
		this.visible = !0;
		this._opacity = 0;
		this.ownTiles = !0;
		this._minGID = 1E5;
		this._maxGID = 0;
		this.offset = cc.p(0, 0)
	},
	getProperties: function() {
		return this.properties
	},
	setProperties: function(a) {
		this.properties = a
	}
});
cc.TMXTilesetInfo = cc.Class.extend({
	name: "",
	firstGid: 0,
	_tileSize: null,
	spacing: 0,
	margin: 0,
	sourceImage: "",
	imageSize: null,
	ctor: function() {
		this._tileSize = cc.size(0, 0);
		this.imageSize = cc.size(0, 0)
	},
	rectForGID: function(a) {
		var b = cc.rect(0, 0, 0, 0);
		b.width = this._tileSize.width;
		b.height = this._tileSize.height;
		a &= cc.TMX_TILE_FLIPPED_MASK;
		a -= parseInt(this.firstGid, 10);
		var c = parseInt((this.imageSize.width - 2 * this.margin + this.spacing) / (this._tileSize.width + this.spacing), 10);
		b.x = parseInt(a % c * (this._tileSize.width + this.spacing) +
			this.margin, 10);
		b.y = parseInt(parseInt(a / c, 10) * (this._tileSize.height + this.spacing) + this.margin, 10);
		return b
	}
});
cc.TMXMapInfo = cc.SAXParser.extend({
	properties: null,
	orientation: null,
	parentElement: null,
	parentGID: null,
	layerAttrs: 0,
	storingCharacters: !1,
	tmxFileName: null,
	currentString: null,
	_objectGroups: null,
	_mapSize: null,
	_tileSize: null,
	_layers: null,
	_tilesets: null,
	_tileProperties: null,
	_resources: "",
	_currentFirstGID: 0,
	ctor: function(a, b) {
		cc.SAXParser.prototype.ctor.apply(this);
		this._mapSize = cc.size(0, 0);
		this._tileSize = cc.size(0, 0);
		this._layers = [];
		this._tilesets = [];
		this._objectGroups = [];
		this.properties = [];
		this._tileProperties = {};
		this._currentFirstGID = 0;
		void 0 !== b ? this.initWithXML(a, b) : void 0 !== a && this.initWithTMXFile(a)
	},
	getOrientation: function() {
		return this.orientation
	},
	setOrientation: function(a) {
		this.orientation = a
	},
	getMapSize: function() {
		return cc.size(this._mapSize.width, this._mapSize.height)
	},
	setMapSize: function(a) {
		this._mapSize.width = a.width;
		this._mapSize.height = a.height
	},
	_getMapWidth: function() {
		return this._mapSize.width
	},
	_setMapWidth: function(a) {
		this._mapSize.width = a
	},
	_getMapHeight: function() {
		return this._mapSize.height
	},
	_setMapHeight: function(a) {
		this._mapSize.height = a
	},
	getTileSize: function() {
		return cc.size(this._tileSize.width, this._tileSize.height)
	},
	setTileSize: function(a) {
		this._tileSize.width = a.width;
		this._tileSize.height = a.height
	},
	_getTileWidth: function() {
		return this._tileSize.width
	},
	_setTileWidth: function(a) {
		this._tileSize.width = a
	},
	_getTileHeight: function() {
		return this._tileSize.height
	},
	_setTileHeight: function(a) {
		this._tileSize.height = a
	},
	getLayers: function() {
		return this._layers
	},
	setLayers: function(a) {
		this._layers.push(a)
	},
	getTilesets: function() {
		return this._tilesets
	},
	setTilesets: function(a) {
		this._tilesets.push(a)
	},
	getObjectGroups: function() {
		return this._objectGroups
	},
	setObjectGroups: function(a) {
		this._objectGroups.push(a)
	},
	getParentElement: function() {
		return this.parentElement
	},
	setParentElement: function(a) {
		this.parentElement = a
	},
	getParentGID: function() {
		return this.parentGID
	},
	setParentGID: function(a) {
		this.parentGID = a
	},
	getLayerAttribs: function() {
		return this.layerAttrs
	},
	setLayerAttribs: function(a) {
		this.layerAttrs = a
	},
	getStoringCharacters: function() {
		return this.storingCharacters
	},
	setStoringCharacters: function(a) {
		this.storingCharacters = a
	},
	getProperties: function() {
		return this.properties
	},
	setProperties: function(a) {
		this.properties = a
	},
	initWithTMXFile: function(a) {
		this._internalInit(a, null);
		return this.parseXMLFile(a)
	},
	initWithXML: function(a, b) {
		this._internalInit(null, b);
		return this.parseXMLString(a)
	},
	parseXMLFile: function(a, b) {
		var c = (b = b || !1) ? a : cc.loader.getRes(a);
		if (!c) throw "Please load the resource first : " + a;
		var d, e, c = this._parseXML(c).documentElement;
		d = c.getAttribute("version");
		e = c.getAttribute("orientation");
		if ("map" == c.nodeName && ("1.0" != d && null !== d && cc.log("cocos2d: TMXFormat: Unsupported TMX version:" + d), "orthogonal" == e ? this.orientation = cc.TMX_ORIENTATION_ORTHO : "isometric" == e ? this.orientation = cc.TMX_ORIENTATION_ISO : "hexagonal" == e ? this.orientation = cc.TMX_ORIENTATION_HEX : null !== e && cc.log("cocos2d: TMXFomat: Unsupported orientation:" + e), d = cc.size(0, 0), d.width = parseFloat(c.getAttribute("width")), d.height = parseFloat(c.getAttribute("height")), this.setMapSize(d), d = cc.size(0, 0), d.width = parseFloat(c.getAttribute("tilewidth")), d.height = parseFloat(c.getAttribute("tileheight")), this.setTileSize(d), e = c.querySelectorAll("map \x3e properties \x3e  property"))) {
			var f = {};
			for (d = 0; d < e.length; d++) f[e[d].getAttribute("name")] = e[d].getAttribute("value");
			this.properties = f
		}
		f = c.getElementsByTagName("tileset");
		"map" !== c.nodeName && (f = [], f.push(c));
		for (d = 0; d < f.length; d++) {
			e = f[d];
			var g = e.getAttribute("source");
			if (g) e = b ? cc.path.join(this._resources, g) : cc.path.changeBasename(a, g), this.parseXMLFile(e);
			else {
				g = new cc.TMXTilesetInfo;
				g.name = e.getAttribute("name") || "";
				g.firstGid = parseInt(e.getAttribute("firstgid")) || 0;
				g.spacing = parseInt(e.getAttribute("spacing")) || 0;
				g.margin = parseInt(e.getAttribute("margin")) || 0;
				var h = cc.size(0, 0);
				h.width = parseFloat(e.getAttribute("tilewidth"));
				h.height = parseFloat(e.getAttribute("tileheight"));
				g._tileSize = h;
				var h = e.getElementsByTagName("image")[0].getAttribute("source"),
					k = -1;
				this.tmxFileName && (k = this.tmxFileName.lastIndexOf("/")); - 1 !== k ? (k = this.tmxFileName.substr(0, k + 1), g.sourceImage = k + h) : g.sourceImage = this._resources + (this._resources ? "/" : "") + h;
				this.setTilesets(g);
				if (h = e.getElementsByTagName("tile"))
					for (k = 0; k < h.length; k++) {
						e = h[k];
						this.parentGID = parseInt(g.firstGid) + parseInt(e.getAttribute("id") || 0);
						var m = e.querySelectorAll("properties \x3e property");
						if (m) {
							var n = {};
							for (e = 0; e < m.length; e++) {
								var q = m[e].getAttribute("name");
								n[q] = m[e].getAttribute("value")
							}
							this._tileProperties[this.parentGID] = n
						}
					}
			}
		}
		if (f = c.getElementsByTagName("layer"))
			for (d = 0; d < f.length; d++) {
				h = f[d];
				k = h.getElementsByTagName("data")[0];
				g = new cc.TMXLayerInfo;
				g.name = h.getAttribute("name");
				e = cc.size(0, 0);
				e.width = parseFloat(h.getAttribute("width"));
				e.height = parseFloat(h.getAttribute("height"));
				g._layerSize = e;
				e = h.getAttribute("visible");
				g.visible = "0" != e;
				e = h.getAttribute("opacity") || 1;
				g._opacity = e ? parseInt(255 * parseFloat(e)) : 255;
				g.offset = cc.p(parseFloat(h.getAttribute("x")) || 0, parseFloat(h.getAttribute("y")) || 0);
				m = "";
				for (e = 0; e < k.childNodes.length; e++) m += k.childNodes[e].nodeValue;
				m = m.trim();
				e = k.getAttribute("compression");
				n = k.getAttribute("encoding");
				if (e && "gzip" !== e && "zlib" !== e) return cc.log("cc.TMXMapInfo.parseXMLFile(): unsupported compression method"), null;
				switch (e) {
					case "gzip":
						g._tiles = cc.unzipBase64AsArray(m, 4);
						break;
					case "zlib":
						e = new Zlib.Inflate(cc.Codec.Base64.decodeAsArray(m, 1));
						g._tiles = cc.uint8ArrayToUint32Array(e.decompress());
						break;
					case null:
					case "":
						if ("base64" == n) g._tiles = cc.Codec.Base64.decodeAsArray(m, 4);
						else if ("csv" === n)
							for (g._tiles = [], e = m.split(","), k = 0; k < e.length; k++) g._tiles.push(parseInt(e[k]));
						else
							for (e = k.getElementsByTagName("tile"), g._tiles = [], k = 0; k < e.length; k++) g._tiles.push(parseInt(e[k].getAttribute("gid")));
						break;
					default:
						this.layerAttrs == cc.TMXLayerInfo.ATTRIB_NONE && cc.log("cc.TMXMapInfo.parseXMLFile(): Only base64 and/or gzip/zlib maps are supported")
				}
				if (h = h.querySelectorAll("properties \x3e property")) {
					k = {};
					for (e = 0; e < h.length; e++) k[h[e].getAttribute("name")] = h[e].getAttribute("value");
					g.properties = k
				}
				this.setLayers(g)
			}
		if (f = c.getElementsByTagName("objectgroup"))
			for (d = 0; d < f.length; d++) {
				h = f[d];
				g = new cc.TMXObjectGroup;
				g.groupName = h.getAttribute("name");
				g.setPositionOffset(cc.p(parseFloat(h.getAttribute("x")) * this.getTileSize().width || 0, parseFloat(h.getAttribute("y")) * this.getTileSize().height || 0));
				if (k = h.querySelectorAll("objectgroup \x3e properties \x3e property"))
					for (e = 0; e < k.length; e++) m = {}, m[k[e].getAttribute("name")] = k[e].getAttribute("value"), g.properties = m;
				if (h = h.querySelectorAll("object"))
					for (e = 0; e < h.length; e++) {
						m = h[e];
						k = {};
						k.name = m.getAttribute("name") || "";
						k.type = m.getAttribute("type") || "";
						k.x = parseInt(m.getAttribute("x") || 0) + g.getPositionOffset().x;
						n = parseInt(m.getAttribute("y") || 0) + g.getPositionOffset().y;
						k.width = parseInt(m.getAttribute("width")) || 0;
						k.height = parseInt(m.getAttribute("height")) || 0;
						k.y = parseInt(this.getMapSize().height * this.getTileSize().height) - n - k.height;
						if (n = m.querySelectorAll("properties \x3e property"))
							for (q = 0; q < n.length; q++) k[n[q].getAttribute("name")] = n[q].getAttribute("value");
						(n = m.querySelectorAll("polygon")) && 0 < n.length && (n = n[0].getAttribute("points")) && (k.polygonPoints = this._parsePointsString(n));
						(m = m.querySelectorAll("polyline")) && 0 < m.length && (m = m[0].getAttribute("points")) && (k.polylinePoints = this._parsePointsString(m));
						g.setObjects(k)
					}
				this.setObjectGroups(g)
			}
		return c
	},
	_parsePointsString: function(a) {
		if (!a) return null;
		var b = [];
		a = a.split(" ");
		for (var c = 0; c < a.length; c++) {
			var d = a[c].split(",");
			b.push({
				x: d[0],
				y: d[1]
			})
		}
		return b
	},
	parseXMLString: function(a) {
		return this.parseXMLFile(a, !0)
	},
	getTileProperties: function() {
		return this._tileProperties
	},
	setTileProperties: function(a) {
		this._tileProperties.push(a)
	},
	getCurrentString: function() {
		return this.currentString
	},
	setCurrentString: function(a) {
		this.currentString = a
	},
	getTMXFileName: function() {
		return this.tmxFileName
	},
	setTMXFileName: function(a) {
		this.tmxFileName = a
	},
	_internalInit: function(a, b) {
		this._tilesets.length = 0;
		this._layers.length = 0;
		this.tmxFileName = a;
		b && (this._resources = b);
		this._objectGroups.length = 0;
		this.properties.length = 0;
		this._tileProperties.length = 0;
		this.currentString = "";
		this.storingCharacters = !1;
		this.layerAttrs = cc.TMXLayerInfo.ATTRIB_NONE;
		this.parentElement = cc.TMX_PROPERTY_NONE;
		this._currentFirstGID = 0
	}
});
_p = cc.TMXMapInfo.prototype;
cc.defineGetterSetter(_p, "mapWidth", _p._getMapWidth, _p._setMapWidth);
cc.defineGetterSetter(_p, "mapHeight", _p._getMapHeight, _p._setMapHeight);
cc.defineGetterSetter(_p, "tileWidth", _p._getTileWidth, _p._setTileWidth);
cc.defineGetterSetter(_p, "tileHeight", _p._getTileHeight, _p._setTileHeight);
cc.TMXMapInfo.create = function(a, b) {
	return new cc.TMXMapInfo(a, b)
};
cc.loader.register(["tmx", "tsx"], cc._txtLoader);
cc.TMXLayerInfo.ATTRIB_NONE = 1;
cc.TMXLayerInfo.ATTRIB_BASE64 = 2;
cc.TMXLayerInfo.ATTRIB_GZIP = 4;
cc.TMXLayerInfo.ATTRIB_ZLIB = 8;
cc.TMXObjectGroup = cc.Class.extend({
	properties: null,
	groupName: "",
	_positionOffset: null,
	_objects: null,
	ctor: function() {
		this.groupName = "";
		this._positionOffset = cc.p(0, 0);
		this.properties = [];
		this._objects = []
	},
	getPositionOffset: function() {
		return cc.p(this._positionOffset)
	},
	setPositionOffset: function(a) {
		this._positionOffset.x = a.x;
		this._positionOffset.y = a.y
	},
	getProperties: function() {
		return this.properties
	},
	setProperties: function(a) {
		this.properties.push(a)
	},
	getGroupName: function() {
		return this.groupName.toString()
	},
	setGroupName: function(a) {
		this.groupName = a
	},
	propertyNamed: function(a) {
		return this.properties[a]
	},
	objectNamed: function(a) {
		if (this._objects && 0 < this._objects.length)
			for (var b = this._objects, c = 0, d = b.length; c < d; c++) {
				var e = b[c].name;
				if (e && e == a) return b[c]
			}
		return null
	},
	getObjects: function() {
		return this._objects
	},
	setObjects: function(a) {
		this._objects.push(a)
	}
});
cc.TMXLayer = cc.SpriteBatchNode.extend({
	tiles: null,
	tileset: null,
	layerOrientation: null,
	properties: null,
	layerName: "",
	_layerSize: null,
	_mapTileSize: null,
	_opacity: 255,
	_minGID: null,
	_maxGID: null,
	_vertexZvalue: null,
	_useAutomaticVertexZ: null,
	_alphaFuncValue: null,
	_reusedTile: null,
	_atlasIndexArray: null,
	_contentScaleFactor: null,
	_cacheCanvas: null,
	_cacheContext: null,
	_cacheTexture: null,
	_subCacheCanvas: null,
	_subCacheContext: null,
	_subCacheCount: 0,
	_subCacheWidth: 0,
	_maxCachePixel: 1E7,
	_className: "TMXLayer",
	ctor: function(a, b, c) {
		cc.SpriteBatchNode.prototype.ctor.call(this);
		this._descendants = [];
		this._layerSize = cc.size(0, 0);
		this._mapTileSize = cc.size(0, 0);
		if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
			var d = cc._canvas,
				e = cc.newElement("canvas");
			e.width = d.width;
			e.height = d.height;
			this._cacheCanvas = e;
			this._cacheContext = this._cacheCanvas.getContext("2d");
			var f = new cc.Texture2D;
			f.initWithElement(e);
			f.handleLoadedTexture();
			this._cacheTexture = f;
			this.width = d.width;
			this.height = d.height;
			this._cachedParent = this
		}
		void 0 !== c && this.initWithTilesetInfo(a, b, c)
	},
	setContentSize: function(a, b) {
		var c = this._contentSize;
		cc.Node.prototype.setContentSize.call(this, a, b);
		if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
			var d = this._cacheCanvas,
				e = cc.contentScaleFactor();
			d.width = 0 | 1.5 * c.width * e;
			d.height = 0 | 1.5 * c.height * e;
			this.layerOrientation === cc.TMX_ORIENTATION_HEX ? this._cacheContext.translate(0, d.height - 0.5 * this._mapTileSize.height) : this._cacheContext.translate(0, d.height);
			c = this._cacheTexture._contentSize;
			c.width = d.width;
			c.height = d.height;
			c = d.width * d.height;
			if (c > this._maxCachePixel) {
				this._subCacheCanvas || (this._subCacheCanvas = []);
				this._subCacheContext || (this._subCacheContext = []);
				this._subCacheCount = Math.ceil(c / this._maxCachePixel);
				c = this._subCacheCanvas;
				for (e = 0; e < this._subCacheCount; e++) {
					c[e] || (c[e] = document.createElement("canvas"), this._subCacheContext[e] = c[e].getContext("2d"));
					var f = c[e];
					f.width = this._subCacheWidth = Math.round(d.width / this._subCacheCount);
					f.height = d.height
				}
				for (e = this._subCacheCount; e < c.length; e++) f.width = 0, f.height = 0
			} else this._subCacheCount = 0
		}
	},
	getTexture: null,
	_getTextureForCanvas: function() {
		return this._cacheTexture
	},
	visit: null,
	_visitForCanvas: function(a) {
		var b = a || cc._renderContext;
		if (this._visible) {
			b.save();
			this.transform(a);
			var c, d = this._children;
			if (this._cacheDirty) {
				var e = cc.view;
				e._setScaleXYForRenderTexture();
				var f = this._cacheContext,
					g = this._cacheCanvas;
				f.clearRect(0, 0, g.width, -g.height);
				f.save();
				f.translate(this._anchorPointInPoints.x, -this._anchorPointInPoints.y);
				if (d)
					for (this.sortAllChildren(), c = 0; c < d.length; c++) d[c] && d[c].visit(f);
				f.restore();
				if (0 < this._subCacheCount)
					for (d = this._subCacheWidth, f = g.height, c = 0; c < this._subCacheCount; c++) this._subCacheContext[c].drawImage(g, c * d, 0, d, f, 0, 0, d, f);
				e._resetScale();
				this._cacheDirty = !1
			}
			this.draw(a);
			b.restore()
		}
	},
	draw: null,
	_drawForCanvas: function(a) {
		a = a || cc._renderContext;
		var b = 0 | -this._anchorPointInPoints.x,
			c = 0 | -this._anchorPointInPoints.y,
			d = cc.view,
			e = this._cacheCanvas;
		if (e) {
			var f = this._subCacheCount,
				g = e.height * d._scaleY,
				h = 0.5 * this._mapTileSize.height * d._scaleY;
			if (0 < f)
				for (var e = this._subCacheCanvas, k = 0; k < f; k++) {
					var m = e[k];
					this.layerOrientation === cc.TMX_ORIENTATION_HEX ? a.drawImage(e[k], 0, 0, m.width, m.height, b + k * this._subCacheWidth, -(c + g) + h, m.width * d._scaleX, g) : a.drawImage(e[k], 0, 0, m.width, m.height, b + k * this._subCacheWidth, -(c + g), m.width * d._scaleX, g)
				} else this.layerOrientation === cc.TMX_ORIENTATION_HEX ? a.drawImage(e, 0, 0, e.width, e.height, b, -(c + g) + h, e.width * d._scaleX, g) : a.drawImage(e, 0, 0, e.width, e.height, b, -(c + g), e.width * d._scaleX, g)
		}
	},
	getLayerSize: function() {
		return cc.size(this._layerSize.width, this._layerSize.height)
	},
	setLayerSize: function(a) {
		this._layerSize.width = a.width;
		this._layerSize.height = a.height
	},
	_getLayerWidth: function() {
		return this._layerSize.width
	},
	_setLayerWidth: function(a) {
		this._layerSize.width = a
	},
	_getLayerHeight: function() {
		return this._layerSize.height
	},
	_setLayerHeight: function(a) {
		this._layerSize.height = a
	},
	getMapTileSize: function() {
		return cc.size(this._mapTileSize.width, this._mapTileSize.height)
	},
	setMapTileSize: function(a) {
		this._mapTileSize.width = a.width;
		this._mapTileSize.height = a.height
	},
	_getTileWidth: function() {
		return this._mapTileSize.width
	},
	_setTileWidth: function(a) {
		this._mapTileSize.width = a
	},
	_getTileHeight: function() {
		return this._mapTileSize.height
	},
	_setTileHeight: function(a) {
		this._mapTileSize.height = a
	},
	getTiles: function() {
		return this.tiles
	},
	setTiles: function(a) {
		this.tiles = a
	},
	getTileset: function() {
		return this.tileset
	},
	setTileset: function(a) {
		this.tileset = a
	},
	getLayerOrientation: function() {
		return this.layerOrientation
	},
	setLayerOrientation: function(a) {
		this.layerOrientation = a
	},
	getProperties: function() {
		return this.properties
	},
	setProperties: function(a) {
		this.properties = a
	},
	initWithTilesetInfo: function(a, b, c) {
		var d = b._layerSize,
			e = 0.35 * parseInt(d.width * d.height) + 1,
			f;
		a && (f = cc.textureCache.addImage(a.sourceImage));
		return this.initWithTexture(f, e) ? (this.layerName = b.name, this._layerSize = d, this.tiles = b._tiles, this._minGID = b._minGID, this._maxGID = b._maxGID, this._opacity = b._opacity, this.properties = b.properties, this._contentScaleFactor = cc.director.getContentScaleFactor(), this.tileset = a, this._mapTileSize = c.getTileSize(), this.layerOrientation = c.orientation, a = this._calculateLayerOffset(b.offset), this.setPosition(cc.pointPixelsToPoints(a)), this._atlasIndexArray = [], this.setContentSize(cc.sizePixelsToPoints(cc.size(this._layerSize.width * this._mapTileSize.width, this._layerSize.height * this._mapTileSize.height))), this._useAutomaticVertexZ = !1, this._vertexZvalue = 0, !0) : !1
	},
	releaseMap: function() {
		this.tiles && (this.tiles = null);
		this._atlasIndexArray && (this._atlasIndexArray = null)
	},
	getTileAt: function(a, b) {
		if (!a) throw "cc.TMXLayer.getTileAt(): pos should be non-null";
		void 0 !== b && (a = cc.p(a, b));
		if (a.x >= this._layerSize.width || a.y >= this._layerSize.height || 0 > a.x || 0 > a.y) throw "cc.TMXLayer.getTileAt(): invalid position";
		if (!this.tiles || !this._atlasIndexArray) return cc.log("cc.TMXLayer.getTileAt(): TMXLayer: the tiles map has been released"), null;
		var c = null,
			d = this.getTileGIDAt(a);
		if (0 === d) return c;
		var e = 0 | a.x + a.y * this._layerSize.width,
			c = this.getChildByTag(e);
		c || (d = this.tileset.rectForGID(d), d = cc.rectPixelsToPoints(d), c = new cc.Sprite, c.initWithTexture(this.texture, d), c.batchNode = this, c.setPosition(this.getPositionAt(a)), c.vertexZ = this._vertexZForPos(a), c.anchorX = 0, c.anchorY = 0, c.opacity = this._opacity, d = this._atlasIndexForExistantZ(e), this.addSpriteWithoutQuad(c, d, e));
		return c
	},
	getTileGIDAt: function(a, b) {
		if (!a) throw "cc.TMXLayer.getTileGIDAt(): pos should be non-null";
		void 0 !== b && (a = cc.p(a, b));
		if (a.x >= this._layerSize.width || a.y >= this._layerSize.height || 0 > a.x || 0 > a.y) throw "cc.TMXLayer.getTileGIDAt(): invalid position";
		return this.tiles && this._atlasIndexArray ? (this.tiles[0 | a.x + a.y * this._layerSize.width] & cc.TMX_TILE_FLIPPED_MASK) >>> 0 : (cc.log("cc.TMXLayer.getTileGIDAt(): TMXLayer: the tiles map has been released"), null)
	},
	getTileFlagsAt: function(a, b) {
		if (!a) throw "cc.TMXLayer.getTileFlagsAt(): pos should be non-null";
		void 0 !== b && (a = cc.p(a, b));
		if (a.x >= this._layerSize.width || a.y >= this._layerSize.height || 0 > a.x || 0 > a.y) throw "cc.TMXLayer.getTileFlagsAt(): invalid position";
		return this.tiles && this._atlasIndexArray ? (this.tiles[0 | a.x + a.y * this._layerSize.width] & cc.TMX_TILE_FLIPPED_ALL) >>> 0 : (cc.log("cc.TMXLayer.getTileFlagsAt(): TMXLayer: the tiles map has been released"), null)
	},
	setTileGID: function(a, b, c, d) {
		if (!b) throw "cc.TMXLayer.setTileGID(): pos should be non-null";
		void 0 !== d ? b = cc.p(b, c) : d = c;
		if (b.x >= this._layerSize.width || b.y >= this._layerSize.height || 0 > b.x || 0 > b.y) throw "cc.TMXLayer.setTileGID(): invalid position";
		if (this.tiles && this._atlasIndexArray)
			if (0 !== a && a < this.tileset.firstGid) cc.log("cc.TMXLayer.setTileGID(): invalid gid:" + a);
			else {
				d = d || 0;
				this._setNodeDirtyForCache();
				c = this.getTileFlagsAt(b);
				var e = this.getTileGIDAt(b);
				if (e != a || c != d)
					if (c = (a | d) >>> 0, 0 === a) this.removeTileAt(b);
					else if (0 === e) this._insertTileForGID(c, b);
				else {
					var e = b.x + b.y * this._layerSize.width,
						f = this.getChildByTag(e);
					f ? (a = this.tileset.rectForGID(a), a = cc.rectPixelsToPoints(a), f.setTextureRect(a, !1), null != d && this._setupTileSprite(f, b, c), this.tiles[e] = c) : this._updateTileForGID(c, b)
				}
			} else cc.log("cc.TMXLayer.setTileGID(): TMXLayer: the tiles map has been released")
	},
	removeTileAt: function(a, b) {
		if (!a) throw "cc.TMXLayer.removeTileAt(): pos should be non-null";
		void 0 !== b && (a = cc.p(a, b));
		if (a.x >= this._layerSize.width || a.y >= this._layerSize.height || 0 > a.x || 0 > a.y) throw "cc.TMXLayer.removeTileAt(): invalid position";
		if (!this.tiles || !this._atlasIndexArray) cc.log("cc.TMXLayer.removeTileAt(): TMXLayer: the tiles map has been released");
		else if (0 !== this.getTileGIDAt(a)) {
			cc._renderType === cc._RENDER_TYPE_CANVAS && this._setNodeDirtyForCache();
			var c = 0 | a.x + a.y * this._layerSize.width,
				d = this._atlasIndexForExistantZ(c);
			this.tiles[c] = 0;
			this._atlasIndexArray.splice(d, 1);
			if (c = this.getChildByTag(c)) cc.SpriteBatchNode.prototype.removeChild.call(this, c, !0);
			else if (cc._renderType === cc._RENDER_TYPE_WEBGL && this.textureAtlas.removeQuadAtIndex(d), this._children)
				for (var c = this._children, e = 0, f = c.length; e < f; e++) {
					var g = c[e];
					if (g) {
						var h = g.atlasIndex;
						h >= d && (g.atlasIndex = h - 1)
					}
				}
		}
	},
	getPositionAt: function(a, b) {
		void 0 !== b && (a = cc.p(a, b));
		var c = cc.p(0, 0);
		switch (this.layerOrientation) {
			case cc.TMX_ORIENTATION_ORTHO:
				c = this._positionForOrthoAt(a);
				break;
			case cc.TMX_ORIENTATION_ISO:
				c = this._positionForIsoAt(a);
				break;
			case cc.TMX_ORIENTATION_HEX:
				c = this._positionForHexAt(a)
		}
		return cc.pointPixelsToPoints(c)
	},
	getProperty: function(a) {
		return this.properties[a]
	},
	setupTiles: function() {
		cc._renderType === cc._RENDER_TYPE_CANVAS ? this.tileset.imageSize = this._originalTexture.getContentSizeInPixels() : (this.tileset.imageSize = this.textureAtlas.texture.getContentSizeInPixels(), this.textureAtlas.texture.setAliasTexParameters());
		this._parseInternalProperties();
		cc._renderType === cc._RENDER_TYPE_CANVAS && this._setNodeDirtyForCache();
		for (var a = this._layerSize.height, b = this._layerSize.width, c = 0; c < a; c++)
			for (var d = 0; d < b; d++) {
				var e = this.tiles[d + b * c];
				0 !== e && (this._appendTileForGID(e, cc.p(d, c)), this._minGID = Math.min(e, this._minGID), this._maxGID = Math.max(e, this._maxGID))
			}
		this._maxGID >= this.tileset.firstGid && this._minGID >= this.tileset.firstGid || cc.log("cocos2d:TMX: Only 1 tileset per layer is supported")
	},
	addChild: function(a, b, c) {
		cc.log("addChild: is not supported on cc.TMXLayer. Instead use setTileGID or tileAt.")
	},
	removeChild: function(a, b) {
		if (a)
			if (-1 === this._children.indexOf(a)) cc.log("cc.TMXLayer.removeChild(): Tile does not belong to TMXLayer");
			else {
				cc._renderType === cc._RENDER_TYPE_CANVAS && this._setNodeDirtyForCache();
				var c = a.atlasIndex;
				this.tiles[this._atlasIndexArray[c]] = 0;
				this._atlasIndexArray.splice(c, 1);
				cc.SpriteBatchNode.prototype.removeChild.call(this, a, b)
			}
	},
	getLayerName: function() {
		return this.layerName
	},
	setLayerName: function(a) {
		this.layerName = a
	},
	_positionForIsoAt: function(a) {
		return cc.p(this._mapTileSize.width / 2 * (this._layerSize.width + a.x - a.y - 1), this._mapTileSize.height / 2 * (2 * this._layerSize.height - a.x - a.y - 2))
	},
	_positionForOrthoAt: function(a) {
		return cc.p(a.x * this._mapTileSize.width, (this._layerSize.height - a.y - 1) * this._mapTileSize.height)
	},
	_positionForHexAt: function(a) {
		return cc.p(a.x * this._mapTileSize.width * 3 / 4, (this._layerSize.height - a.y - 1) * this._mapTileSize.height + (1 == a.x % 2 ? -this._mapTileSize.height / 2 : 0))
	},
	_calculateLayerOffset: function(a) {
		var b = cc.p(0, 0);
		switch (this.layerOrientation) {
			case cc.TMX_ORIENTATION_ORTHO:
				b = cc.p(a.x * this._mapTileSize.width, -a.y * this._mapTileSize.height);
				break;
			case cc.TMX_ORIENTATION_ISO:
				b = cc.p(this._mapTileSize.width / 2 * (a.x -
					a.y), this._mapTileSize.height / 2 * (-a.x - a.y));
				break;
			case cc.TMX_ORIENTATION_HEX:
				0 === a.x && 0 === a.y || cc.log("offset for hexagonal map not implemented yet")
		}
		return b
	},
	_appendTileForGID: function(a, b) {
		var c = this.tileset.rectForGID(a),
			c = cc.rectPixelsToPoints(c),
			d = 0 | b.x + b.y * this._layerSize.width,
			c = this._reusedTileWithRect(c);
		this._setupTileSprite(c, b, a);
		var e = this._atlasIndexArray.length;
		this.insertQuadFromSprite(c, e);
		this._atlasIndexArray.splice(e, 0, d);
		return c
	},
	_insertTileForGID: function(a, b) {
		var c = this.tileset.rectForGID(a),
			c = cc.rectPixelsToPoints(c),
			d = 0 | b.x + b.y * this._layerSize.width,
			c = this._reusedTileWithRect(c);
		this._setupTileSprite(c, b, a);
		var e = this._atlasIndexForNewZ(d);
		this.insertQuadFromSprite(c, e);
		this._atlasIndexArray.splice(e, 0, d);
		if (this._children)
			for (var f = this._children, g = 0, h = f.length; g < h; g++) {
				var k = f[g];
				if (k) {
					var m = k.atlasIndex;
					m >= e && (k.atlasIndex = m + 1)
				}
			}
		this.tiles[d] = a;
		return c
	},
	_updateTileForGID: function(a, b) {
		var c = this.tileset.rectForGID(a),
			d = this._contentScaleFactor,
			c = cc.rect(c.x / d, c.y / d, c.width / d, c.height / d),
			d = b.x + b.y * this._layerSize.width,
			c = this._reusedTileWithRect(c);
		this._setupTileSprite(c, b, a);
		c.atlasIndex = this._atlasIndexForExistantZ(d);
		c.dirty = !0;
		c.updateTransform();
		this.tiles[d] = a;
		return c
	},
	_parseInternalProperties: function() {
		var a = this.getProperty("cc_vertexz");
		if (a)
			if ("automatic" == a) {
				this._useAutomaticVertexZ = !0;
				var b = this.getProperty("cc_alpha_func"),
					a = 0;
				b && (a = parseFloat(b));
				cc._renderType === cc._RENDER_TYPE_WEBGL && (this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST), b = cc._renderContext.getUniformLocation(this.shaderProgram.getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S), this.shaderProgram.use(), this.shaderProgram.setUniformLocationWith1f(b, a))
			} else this._vertexZvalue = parseInt(a, 10)
	},
	_setupTileSprite: function(a, b, c) {
		var d = b.x + b.y * this._layerSize.width;
		a.setPosition(this.getPositionAt(b));
		cc._renderType === cc._RENDER_TYPE_WEBGL ? a.vertexZ = this._vertexZForPos(b) : a.tag = d;
		a.anchorX = 0;
		a.anchorY = 0;
		a.opacity = this._opacity;
		cc._renderType === cc._RENDER_TYPE_WEBGL && (a.rotation = 0);
		a.setFlippedX(!1);
		a.setFlippedY(!1);
		(c & cc.TMX_TILE_DIAGONAL_FLAG) >>> 0 ? (a.anchorX = 0.5, a.anchorY = 0.5, a.x = this.getPositionAt(b).x + a.width / 2, a.y = this.getPositionAt(b).y + a.height / 2, b = (c & (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG) >>> 0) >>> 0, b == cc.TMX_TILE_HORIZONTAL_FLAG ? a.rotation = 90 : b == cc.TMX_TILE_VERTICAL_FLAG ? a.rotation = 270 : (a.rotation = b == (cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0 ? 90 : 270, a.setFlippedX(!0))) : ((c & cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0 && a.setFlippedX(!0), (c & cc.TMX_TILE_VERTICAL_FLAG) >>> 0 && a.setFlippedY(!0))
	},
	_reusedTileWithRect: function(a) {
		cc._renderType === cc._RENDER_TYPE_WEBGL ? (this._reusedTile ? (this._reusedTile.batchNode = null, this._reusedTile.setTextureRect(a, !1)) : (this._reusedTile = new cc.Sprite, this._reusedTile.initWithTexture(this.texture, a, !1)), this._reusedTile.batchNode = this) : (this._reusedTile = new cc.Sprite, this._reusedTile.initWithTexture(this._textureForCanvas, a, !1), this._reusedTile.batchNode = this, this._reusedTile.parent = this);
		return this._reusedTile
	},
	_vertexZForPos: function(a) {
		var b = 0,
			c = 0;
		if (this._useAutomaticVertexZ) switch (this.layerOrientation) {
			case cc.TMX_ORIENTATION_ISO:
				c = this._layerSize.width + this._layerSize.height;
				b = -(c - (a.x + a.y));
				break;
			case cc.TMX_ORIENTATION_ORTHO:
				b = -(this._layerSize.height - a.y);
				break;
			case cc.TMX_ORIENTATION_HEX:
				cc.log("TMX Hexa zOrder not supported");
				break;
			default:
				cc.log("TMX invalid value")
		} else b = this._vertexZvalue;
		return b
	},
	_atlasIndexForExistantZ: function(a) {
		var b;
		if (this._atlasIndexArray)
			for (var c = this._atlasIndexArray, d = 0, e = c.length; d < e && (b = c[d], b != a); d++);
		cc.isNumber(b) || cc.log("cc.TMXLayer._atlasIndexForExistantZ(): TMX atlas index not found. Shall not happen");
		return d
	},
	_atlasIndexForNewZ: function(a) {
		for (var b = this._atlasIndexArray, c = 0, d = b.length; c < d && !(a < b[c]); c++);
		return c
	}
});
_p = cc.TMXLayer.prototype;
cc._renderType == cc._RENDER_TYPE_WEBGL ? (_p.draw = cc.SpriteBatchNode.prototype.draw, _p.visit = cc.SpriteBatchNode.prototype.visit, _p.getTexture = cc.SpriteBatchNode.prototype.getTexture) : (_p.draw = _p._drawForCanvas, _p.visit = _p._visitForCanvas, _p.getTexture = _p._getTextureForCanvas);
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
cc.defineGetterSetter(_p, "layerWidth", _p._getLayerWidth, _p._setLayerWidth);
cc.defineGetterSetter(_p, "layerHeight", _p._getLayerHeight, _p._setLayerHeight);
cc.defineGetterSetter(_p, "tileWidth", _p._getTileWidth, _p._setTileWidth);
cc.defineGetterSetter(_p, "tileHeight", _p._getTileHeight, _p._setTileHeight);
cc.TMXLayer.create = function(a, b, c) {
	return new cc.TMXLayer(a, b, c)
};
cc.PointObject = cc.Class.extend({
	_ratio: null,
	_offset: null,
	_child: null,
	ctor: function(a, b) {
		this.initWithCCPoint(a, b)
	},
	getRatio: function() {
		return this._ratio
	},
	setRatio: function(a) {
		this._ratio = a
	},
	getOffset: function() {
		return this._offset
	},
	setOffset: function(a) {
		this._offset = a
	},
	getChild: function() {
		return this._child
	},
	setChild: function(a) {
		this._child = a
	},
	initWithCCPoint: function(a, b) {
		this._ratio = a;
		this._offset = b;
		this._child = null;
		return !0
	}
});
cc.PointObject.create = function(a, b) {
	return new cc.PointObject(a, b)
};
cc.ParallaxNode = cc.Node.extend({
	parallaxArray: null,
	_lastPosition: null,
	_className: "ParallaxNode",
	getParallaxArray: function() {
		return this.parallaxArray
	},
	setParallaxArray: function(a) {
		this.parallaxArray = a
	},
	ctor: function() {
		cc.Node.prototype.ctor.call(this);
		this.parallaxArray = [];
		this._lastPosition = cc.p(-100, -100)
	},
	addChild: function(a, b, c, d) {
		if (3 === arguments.length) cc.log("ParallaxNode: use addChild(child, z, ratio, offset) instead");
		else {
			if (!a) throw "cc.ParallaxNode.addChild(): child should be non-null";
			var e = new cc.PointObject(c, d);
			e.setChild(a);
			this.parallaxArray.push(e);
			a.setPosition(this._position.x * c.x + d.x, this._position.y * c.y + d.y);
			cc.Node.prototype.addChild.call(this, a, b, a.tag)
		}
	},
	removeChild: function(a, b) {
		for (var c = this.parallaxArray, d = 0; d < c.length; d++)
			if (c[d].getChild() == a) {
				c.splice(d, 1);
				break
			}
		cc.Node.prototype.removeChild.call(this, a, b)
	},
	removeAllChildren: function(a) {
		this.parallaxArray.length = 0;
		cc.Node.prototype.removeAllChildren.call(this, a)
	},
	visit: function() {
		var a = this._absolutePosition();
		if (!cc.pointEqualToPoint(a, this._lastPosition)) {
			for (var b = this.parallaxArray, c = 0, d = b.length; c < d; c++) {
				var e = b[c];
				e.getChild().setPosition(-a.x + a.x * e.getRatio().x + e.getOffset().x, -a.y + a.y * e.getRatio().y + e.getOffset().y)
			}
			this._lastPosition = a
		}
		cc.Node.prototype.visit.call(this)
	},
	_absolutePosition: function() {
		for (var a = this._position, b = this; null != b.parent;) b = b.parent, a = cc.pAdd(a, b.getPosition());
		return a
	}
});
cc.ParallaxNode.create = function() {
	return new cc.ParallaxNode
};
if (cc.sys._supportWebAudio) {
	var _ctx = cc.webAudioContext = new(window.AudioContext || window.webkitAudioContext || window.mozAudioContext);
	cc.WebAudio = cc.Class.extend({
		_events: null,
		_buffer: null,
		_sourceNode: null,
		_volumeNode: null,
		src: null,
		preload: null,
		autoplay: null,
		controls: null,
		mediagroup: null,
		currentTime: 0,
		startTime: 0,
		duration: 0,
		_loop: null,
		_volume: 1,
		_pauseTime: 0,
		_paused: !1,
		_stopped: !0,
		_loadState: -1,
		ctor: function(a) {
			this._events = {};
			this.src = a;
			this._volumeNode = _ctx.createGain ? _ctx.createGain() : _ctx.createGainNode();
			this._onSuccess1 = this._onSuccess.bind(this);
			this._onError1 = this._onError.bind(this)
		},
		_play: function(a) {
			var b = this._sourceNode = _ctx.createBufferSource(),
				c = this._volumeNode;
			a = a || 0;
			b.buffer = this._buffer;
			c.gain.value = this._volume;
			b.connect(c);
			c.connect(_ctx.destination);
			b.loop = this._loop;
			b._stopped = !1;
			b.playbackState || (b.onended = function() {
				this._stopped = !0
			});
			this._stopped = this._paused = !1;
			b.start ? b.start(0, a) : b.noteGrainOn ? (c = b.buffer.duration, this.loop ? b.noteGrainOn(0, a, c) : b.noteGrainOn(0, a, c - a)) : b.noteOn(0);
			this._pauseTime = 0
		},
		_stop: function() {
			var a = this._sourceNode;
			this._stopped || (a.stop ? a.stop(0) : a.noteOff(0), this._stopped = !0)
		},
		play: function() {
			if (-1 == this._loadState) this._loadState = 0;
			else if (1 == this._loadState) {
				var a = this._sourceNode;
				if (this._stopped || !a || 2 != a.playbackState && a._stopped) this.startTime = _ctx.currentTime, this._play(0)
			}
		},
		pause: function() {
			this._pauseTime = _ctx.currentTime;
			this._paused = !0;
			this._stop()
		},
		resume: function() {
			this._paused && this._play(this._buffer ? (this._pauseTime - this.startTime) % this._buffer.duration : 0)
		},
		stop: function() {
			this._pauseTime = 0;
			this._paused = !1;
			this._stop()
		},
		load: function() {
			var a = this;
			if (1 != a._loadState) {
				a._loadState = -1;
				a.played = !1;
				a.ended = !0;
				var b = new XMLHttpRequest;
				b.open("GET", a.src, !0);
				b.responseType = "arraybuffer";
				b.onload = function() {
					_ctx.decodeAudioData(b.response, a._onSuccess1, a._onError1)
				};
				b.send()
			}
		},
		addEventListener: function(a, b) {
			this._events[a] = b.bind(this)
		},
		removeEventListener: function(a) {
			delete this._events[a]
		},
		canplay: function() {
			return cc.sys._supportWebAudio
		},
		_onSuccess: function(a) {
			this._buffer = a;
			a = this._events.success;
			var b = this._events.canplaythrough;
			a && a();
			b && b();
			0 != this._loadState && "autoplay" != this.autoplay && !0 != this.autoplay || this._play();
			this._loadState = 1
		},
		_onError: function() {
			var a = this._events.error;
			a && a();
			this._loadState = -2
		},
		cloneNode: function() {
			var a = new cc.WebAudio(this.src);
			a.volume = this.volume;
			a._loadState = this._loadState;
			a._buffer = this._buffer;
			0 != a._loadState && -1 != a._loadState || a.load();
			return a
		}
	});
	_p = cc.WebAudio.prototype;
	cc.defineGetterSetter(_p, "loop", function() {
		return this._loop
	}, function(a) {
		this._loop = a;
		this._sourceNode && (this._sourceNode.loop = a)
	});
	cc.defineGetterSetter(_p, "volume", function() {
		return this._volume
	}, function(a) {
		this._volume = a;
		this._volumeNode.gain.value = a
	});
	cc.defineGetterSetter(_p, "paused", function() {
		return this._paused
	});
	cc.defineGetterSetter(_p, "ended", function() {
		var a = this._sourceNode;
		return this._paused ? !1 : this._stopped && !a ? !0 : null == a.playbackState ? a._stopped : 3 == a.playbackState
	});
	cc.defineGetterSetter(_p, "played", function() {
		var a = this._sourceNode;
		return a && (2 == a.playbackState || !a._stopped)
	})
}
cc.AudioEngine = cc.Class.extend({
	_soundSupported: !1,
	_currMusic: null,
	_currMusicPath: null,
	_musicPlayState: 0,
	_audioID: 0,
	_effects: {},
	_audioPool: {},
	_effectsVolume: 1,
	_maxAudioInstance: 5,
	_effectPauseCb: null,
	_playings: [],
	ctor: function() {
		this._soundSupported = 0 < cc._audioLoader._supportedAudioTypes.length;
		this._effectPauseCb && (this._effectPauseCb = this._effectPauseCb.bind(this))
	},
	willPlayMusic: function() {
		return !1
	},
	getEffectsVolume: function() {
		return this._effectsVolume
	},
	playMusic: function(a, b) {
		if (this._soundSupported) {
			var c = this._currMusic;
			c && this._stopAudio(c);
			cc.sys.isMobile && cc.sys.os == cc.sys.OS_IOS ? (c = this._getAudioByUrl(a), this._currMusic = c.cloneNode(), this._currMusicPath = a) : a != this._currMusicPath && (this._currMusic = c = this._getAudioByUrl(a), this._currMusicPath = a);
			this._currMusic && (this._currMusic.loop = b || !1, this._playMusic(this._currMusic))
		}
	},
	_getAudioByUrl: function(a) {
		var b = cc.loader,
			c = b.getRes(a);
		c || (b.load(a), c = b.getRes(a));
		return c
	},
	_playMusic: function(a) {
		a.ended || (a.stop ? a.stop() : (a.pause(), 2 < a.readyState && (a.currentTime = 0)));
		this._musicPlayState = 2;
		a.play()
	},
	stopMusic: function(a) {
		if (0 < this._musicPlayState) {
			var b = this._currMusic;
			b && this._stopAudio(b) && (a && cc.loader.release(this._currMusicPath), this._currMusicPath = this._currMusic = null, this._musicPlayState = 0)
		}
	},
	_stopAudio: function(a) {
		return a && !a.ended ? (a.stop ? a.stop() : (a.pause(), 2 < a.readyState && a.duration && Infinity != a.duration && (a.currentTime = a.duration)), !0) : !1
	},
	pauseMusic: function() {
		2 == this._musicPlayState && (this._currMusic.pause(), this._musicPlayState = 1)
	},
	resumeMusic: function() {
		1 == this._musicPlayState && (this._resumeAudio(this._currMusic), this._musicPlayState = 2)
	},
	_resumeAudio: function(a) {
		a && !a.ended && (a.resume ? a.resume() : a.play())
	},
	rewindMusic: function() {
		this._currMusic && this._playMusic(this._currMusic)
	},
	getMusicVolume: function() {
		return 0 == this._musicPlayState ? 0 : this._currMusic.volume
	},
	setMusicVolume: function(a) {
		0 < this._musicPlayState && (this._currMusic.volume = Math.min(Math.max(a, 0), 1))
	},
	isMusicPlaying: function() {
		return 2 == this._musicPlayState && this._currMusic && !this._currMusic.ended
	},
	_getEffectList: function(a) {
		var b = this._audioPool[a];
		b || (b = this._audioPool[a] = []);
		return b
	},
	_getEffect: function(a) {
		var b;
		if (!this._soundSupported) return null;
		var c = this._getEffectList(a);
		if (cc.sys.isMobile && cc.sys.os == cc.sys.OS_IOS) b = this._getEffectAudio(c, a);
		else {
			for (var d = 0, e = c.length; d < e; d++) {
				var f = c[d];
				if (f.ended) {
					b = f;
					2 < b.readyState && (b.currentTime = 0);
					window.chrome && b.load();
					break
				}
			}
			b || (b = this._getEffectAudio(c, a)) && c.push(b)
		}
		return b
	},
	_getEffectAudio: function(a, b) {
		var c;
		if (a.length >= this._maxAudioInstance) return cc.log("Error: " + b + " greater than " + this._maxAudioInstance), null;
		c = this._getAudioByUrl(b);
		if (!c) return null;
		c = c.cloneNode(!0);
		this._effectPauseCb && cc._addEventListener(c, "pause", this._effectPauseCb);
		c.volume = this._effectsVolume;
		return c
	},
	playEffect: function(a, b) {
		var c = this._getEffect(a);
		if (!c) return null;
		c.loop = b || !1;
		c.play();
		var d = this._audioID++;
		this._effects[d] = c;
		return d
	},
	setEffectsVolume: function(a) {
		a = this._effectsVolume = Math.min(Math.max(a, 0), 1);
		var b = this._effects,
			c;
		for (c in b) b[c].volume = a
	},
	pauseEffect: function(a) {
		(a = this._effects[a]) && !a.ended && a.pause()
	},
	pauseAllEffects: function() {
		var a = this._effects,
			b;
		for (b in a) {
			var c = a[b];
			c.ended || c.pause()
		}
	},
	resumeEffect: function(a) {
		this._resumeAudio(this._effects[a])
	},
	resumeAllEffects: function() {
		var a = this._effects,
			b;
		for (b in a) this._resumeAudio(a[b])
	},
	stopEffect: function(a) {
		this._stopAudio(this._effects[a]);
		delete this._effects[a]
	},
	stopAllEffects: function() {
		var a = this._effects,
			b;
		for (b in a) this._stopAudio(a[b]), delete a[b]
	},
	unloadEffect: function(a) {
		var b = cc.loader,
			c = this._effects,
			d = this._getEffectList(a);
		b.release(a);
		if (0 != d.length) {
			b = d[0].src;
			delete this._audioPool[a];
			for (var e in c) c[e].src == b && (this._stopAudio(c[e]), delete c[e])
		}
	},
	end: function() {
		this.stopMusic();
		this.stopAllEffects()
	},
	_pausePlaying: function() {
		var a = this._effects,
			b, c;
		for (c in a) !(b = a[c]) || b.ended || b.paused || (this._playings.push(b), b.pause());
		this.isMusicPlaying() && (this._playings.push(this._currMusic), this._currMusic.pause())
	},
	_resumePlaying: function() {
		for (var a = this._playings, b = 0, c = a.length; b < c; b++) this._resumeAudio(a[b]);
		a.length = 0
	}
});
cc.sys._supportWebAudio || cc.sys._supportMultipleAudio || (cc.AudioEngineForSingle = cc.AudioEngine.extend({
	_waitingEffIds: [],
	_pausedEffIds: [],
	_currEffect: null,
	_maxAudioInstance: 2,
	_effectCache4Single: {},
	_needToResumeMusic: !1,
	_expendTime4Music: 0,
	_isHiddenMode: !1,
	_playMusic: function(a) {
		this._stopAllEffects();
		this._super(a)
	},
	resumeMusic: function() {
		1 == this._musicPlayState && (this._stopAllEffects(), this._needToResumeMusic = !1, this._expendTime4Music = 0, this._super())
	},
	playEffect: function(a, b) {
		var c = this._currEffect,
			d = b ? this._getEffect(a) : this._getSingleEffect(a);
		if (!d) return null;
		d.loop = b || !1;
		var e = this._audioID++;
		this._effects[e] = d;
		this.isMusicPlaying() && (this.pauseMusic(), this._needToResumeMusic = !0);
		c ? (c != d && this._waitingEffIds.push(this._currEffectId), this._waitingEffIds.push(e), c.pause()) : (this._currEffect = d, this._currEffectId = e, d.play());
		return e
	},
	pauseEffect: function(a) {
		cc.log("pauseEffect not supported in single audio mode!")
	},
	pauseAllEffects: function() {
		var a = this._waitingEffIds,
			b = this._pausedEffIds,
			c = this._currEffect;
		if (c) {
			for (var d = 0, e = a.length; d < e; d++) b.push(a[d]);
			a.length = 0;
			b.push(this._currEffectId);
			c.pause()
		}
	},
	resumeEffect: function(a) {
		cc.log("resumeEffect not supported in single audio mode!")
	},
	resumeAllEffects: function() {
		var a = this._waitingEffIds,
			b = this._pausedEffIds;
		this.isMusicPlaying() && (this.pauseMusic(), this._needToResumeMusic = !0);
		for (var c = 0, d = b.length; c < d; c++) a.push(b[c]);
		b.length = 0;
		!this._currEffect && 0 <= a.length && (a = a.pop(), b = this._effects[a]) && (this._currEffectId = a, this._currEffect = b, this._resumeAudio(b))
	},
	stopEffect: function(a) {
		var b = this._currEffect,
			c = this._waitingEffIds,
			d = this._pausedEffIds;
		b && this._currEffectId == a ? this._stopAudio(b) : (b = c.indexOf(a), 0 <= b ? c.splice(b, 1) : (b = d.indexOf(a), 0 <= b && d.splice(b, 1)))
	},
	stopAllEffects: function() {
		this._stopAllEffects();
		!this._currEffect && this._needToResumeMusic && (this._resumeAudio(this._currMusic), this._musicPlayState = 2, this._needToResumeMusic = !1, this._expendTime4Music = 0)
	},
	unloadEffect: function(a) {
		var b = cc.loader,
			c = this._effects,
			d = this._effectCache4Single,
			e = this._getEffectList(a),
			f = this._currEffect;
		b.release(a);
		if (0 != e.length || d[a]) {
			b = 0 < e.length ? e[0].src : d[a].src;
			delete this._audioPool[a];
			delete d[a];
			for (var g in c) c[g].src == b && delete c[g];
			f && f.src == b && this._stopAudio(f)
		}
	},
	_getSingleEffect: function(a) {
		var b = this._effectCache4Single[a],
			c = this._waitingEffIds,
			d = this._pausedEffIds,
			e = this._effects;
		if (b) 2 < b.readyState && (b.currentTime = 0);
		else {
			b = this._getAudioByUrl(a);
			if (!b) return null;
			b = b.cloneNode(!0);
			this._effectPauseCb && cc._addEventListener(b, "pause", this._effectPauseCb);
			b.volume = this._effectsVolume;
			this._effectCache4Single[a] = b
		}
		a = 0;
		for (var f = c.length; a < f;) e[c[a]] == b ? c.splice(a, 1) : a++;
		a = 0;
		for (f = d.length; a < f;) e[d[a]] == b ? d.splice(a, 1) : a++;
		b._isToPlay = !0;
		return b
	},
	_stopAllEffects: function() {
		var a = this._currEffect,
			b = this._audioPool,
			c = this._effectCache4Single,
			d = this._waitingEffIds,
			e = this._pausedEffIds;
		if (a || 0 != d.length || 0 != e.length) {
			for (var f in c) {
				var g = c[f];
				2 < g.readyState && g.duration && Infinity != g.duration && (g.currentTime = g.duration)
			}
			d.length = 0;
			e.length = 0;
			for (f in b)
				for (c = b[f], d = 0, e = c.length; d < e; d++) g = c[d], g.loop = !1, 2 < g.readyState && g.duration && Infinity != g.duration && (g.currentTime = g.duration);
			a && this._stopAudio(a)
		}
	},
	_effectPauseCb: function() {
		if (!this._isHiddenMode) {
			var a = this._getWaitingEffToPlay();
			if (a) a._isToPlay ? (delete a._isToPlay, a.play()) : this._resumeAudio(a);
			else if (this._needToResumeMusic) {
				a = this._currMusic;
				if (2 < a.readyState && a.duration && Infinity != a.duration) {
					var b = a.currentTime + this._expendTime4Music,
						b = b - a.duration * (b / a.duration | 0);
					a.currentTime = b
				}
				this._expendTime4Music = 0;
				this._resumeAudio(a);
				this._musicPlayState = 2;
				this._needToResumeMusic = !1
			}
		}
	},
	_getWaitingEffToPlay: function() {
		var a = this._waitingEffIds,
			b = this._effects,
			c = this._currEffect,
			d = c ? c.currentTime - (c.startTime || 0) : 0;
		for (this._expendTime4Music += d; 0 != a.length;) {
			var e = a.pop();
			if (c = b[e]) {
				if (c._isToPlay || c.loop || c.duration && c.currentTime + d < c.duration) return this._currEffectId = e, this._currEffect = c, !c._isToPlay && 2 < c.readyState && c.duration && Infinity != c.duration && (a = c.currentTime + d, a -= c.duration * (a / c.duration | 0), c.currentTime = a), c._isToPlay = !1, c;
				2 < c.readyState && c.duration && Infinity != c.duration && (c.currentTime = c.duration)
			}
		}
		return this._currEffect = this._currEffectId = null
	},
	_pausePlaying: function() {
		var a = this._currEffect;
		this._isHiddenMode = !0;
		if (a = 2 == this._musicPlayState ? this._currMusic : a) this._playings.push(a), a.pause()
	},
	_resumePlaying: function() {
		var a = this._playings;
		this._isHiddenMode = !1;
		0 < a.length && (this._resumeAudio(a[0]), a.length = 0)
	}
}));
cc._audioLoader = {
	_supportedAudioTypes: null,
	getBasePath: function() {
		return cc.loader.audioPath
	},
	_load: function(a, b, c, d, e, f, g) {
		var h = this,
			k = cc.loader,
			m = cc.path,
			n = this._supportedAudioTypes,
			q = "";
		if (0 == n.length) return g("can not support audio!");
		if (-1 == d) q = (m.extname(a) || "").toLowerCase(), h.audioTypeSupported(q) || (q = n[0], d = 0);
		else if (d < n.length) q = n[d];
		else return g("can not found the resource of audio! Last match url is : " + a);
		if (0 <= e.indexOf(q)) return h._load(a, b, c, d + 1, e, f, g);
		a = m.changeExtname(a, q);
		e.push(q);
		f = h._loadAudio(a, f, function(k) {
			if (k) return h._load(a, b, c, d + 1, e, f, g);
			g(null, f)
		}, d == n.length - 1);
		k.cache[b] = f
	},
	audioTypeSupported: function(a) {
		return a ? 0 <= this._supportedAudioTypes.indexOf(a.toLowerCase()) : !1
	},
	_loadAudio: function(a, b, c, d) {
		var e;
		e = cc.isObject(window.cc) || "firefox" != cc.sys.browserType ? "file://" == location.origin ? Audio : cc.WebAudio || Audio : Audio;
		2 == arguments.length ? (c = b, b = new e) : 3 < arguments.length && !b && (b = new e);
		b.src = a;
		b.preload = "auto";
		e = navigator.userAgent;
		if (/Mobile/.test(e) && (/iPhone OS/.test(e) || /iPad/.test(e) || /Firefox/.test(e)) || /MSIE/.test(e)) b.load(), c(null, b);
		else {
			cc._addEventListener(b, "canplaythrough", function() {
				c(null, b);
				this.removeEventListener("canplaythrough", arguments.callee, !1);
				this.removeEventListener("error", arguments.callee, !1)
			}, !1);
			var f = function() {
				b.removeEventListener("emptied", f);
				b.removeEventListener("error", f);
				c("load " + a + " failed");
				d && (this.removeEventListener("canplaythrough", arguments.callee, !1), this.removeEventListener("error", arguments.callee, !1))
			};
			cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT && cc._addEventListener(b, "emptied", f, !1);
			cc._addEventListener(b, "error", f, !1);
			b.load()
		}
		return b
	},
	load: function(a, b, c, d) {
		this._load(a, b, c, -1, [], null, d)
	}
};
cc._audioLoader._supportedAudioTypes = function() {
	var a = cc.newElement("audio"),
		b = [];
	if (a.canPlayType) {
		var c = function(b) {
			b = a.canPlayType(b);
			return "no" != b && "" != b
		};
		c('audio/ogg; codecs\x3d"vorbis"') && b.push(".ogg");
		c("audio/mpeg") && b.push(".mp3");
		c('audio/wav; codecs\x3d"1"') && b.push(".wav");
		c("audio/mp4") && b.push(".mp4");
		(c("audio/x-m4a") || c("audio/aac")) && b.push(".m4a")
	}
	return b
}();
cc.loader.register(["mp3", "ogg", "wav", "mp4", "m4a"], cc._audioLoader);
cc.audioEngine = cc.AudioEngineForSingle ? new cc.AudioEngineForSingle : new cc.AudioEngine;
cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function() {
	cc.audioEngine._pausePlaying()
});
cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function() {
	cc.audioEngine._resumePlaying()
});