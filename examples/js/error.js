/**
 * Created by haixi on 2016/10/6.
 */
define(function(require,exports,module){
    var $ = require("jquery"),
        Modal = require("modal"),
        hljs = require("highlight");

    var ErrorExamples = {
        btnError: null,
        btnTipError: null,
        init: function () {
            this._init().render().attachEvents();

            return this;
        },
        _init: function () {
            this.btnError = $("#btnError");
            this.btnTipError = $("#btnTipError");

            return this;
        },
        render: function(){
            // 高亮代码
            hljs.initHighlightingOnLoad();

            return this;
        },
        attachEvents: function () {

            this.btnError.on("click", this._onModalErrorClick);
            this.btnTipError.on("click", this._onModalTipErrorClick);

            return this;
        },
        _onModalErrorClick: function(evt){

            Modal.error(
                "Modal 有两种创建普通信息提示窗口的方法",
                "提示",
                function(modal){
                    alert('你点击了确定按钮')
                }
            );
        },
        _onModalTipErrorClick: function(evt){
            Modal.tipError({
                tip: "Modal 有两种创建普通信息提示窗口的方法",
                width:400,
                height:100,
                delay: 10000,
                hasClose: true,
                afterClose: function(modal){
                    alert('你点击了确定按钮')
                }
            });
        }
    };

    ErrorExamples.init();

    module.exports = ErrorExamples;
});