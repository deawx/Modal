/**
 * Created by haixi on 2016/10/6.
 */
(function (global, factory) {
    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {

        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error("Modal requires a window with a document");
                }
                return factory(w);
            };
    } else {
        // CMD (Register as an anonymous module)
        if ("function" == typeof define && define.cmd) {
            define(function (require, exports, module) {
                module.exports = factory(global);
            });
        }
        else {
            // AMD (Register as an anonymous module)
            if (typeof define === "function" && define.amd) {
                define('zh_CN', factory(global));
            }
            else {
                factory(global);
            }
        }
    }
// Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : this, (function (window, noGlobal) {
    var zh_CN = {
        WINDOW: "窗口",
        CANCEL: "取消",
        ENTER: "确定",
        LOADING: "加载中...",
        INFO: "信息",
        WARNING: "警告",
        CONFIRM: "确认",
        ERROR: "错误",
        SUCCESS: "成功",
        CLOSE: '关闭'
    };

    if(!noGlobal) {
        window.zh_CN = zh_CN;
    }

    return zh_CN;
}));