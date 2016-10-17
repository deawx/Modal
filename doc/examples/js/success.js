/**
 * Created by haixi on 2016/10/6.
 */
define(function(require,exports,module){
    var $ = require("jquery"),
        Modal = require("modal"),
        hljs = require("highlight");

    var SuccessExamples = {
        btnSuccess: null,
        btnTipSuccess: null,
        init: function () {
            this._init().render().attachEvents();

            return this;
        },
        _init: function () {
            this.btnSuccess = $("#btnSuccess");
            this.btnTipSuccess = $("#btnTipSuccess");

            return this;
        },
        render: function(){
            // 高亮代码
            hljs.initHighlightingOnLoad();

            return this;
        },
        attachEvents: function () {

            this.btnSuccess.on("click", this._onModalSuccessClick);
            this.btnTipSuccess.on("click", this._onModalTipSuccessClick);

            return this;
        },
        _onModalSuccessClick: function(evt){

            Modal.success(
                "Modal 有两种创建普通信息提示窗口的方法",
                "提示",
                function(modal){
                    alert('你点击了确定按钮')
                }
            );
        },
        _onModalTipSuccessClick: function(evt){
            Modal.tipSuccess({
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

    SuccessExamples.init();

    module.exports = SuccessExamples;
});