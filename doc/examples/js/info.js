/**
 * Created by haixi on 2016/10/6.
 */
define(function(require,exports,module){
    var $ = require("jquery"),
        Modal = require("modal"),
        hljs = require("highlight");

    var InfoExamples = {
        btnInfo: null,
        btnTipInfo: null,
        init: function () {
            this._init().render().attachEvents();

            return this;
        },
        _init: function () {
            this.btnInfo = $("#btnInfo");
            this.btnTipInfo = $("#btnTipInfo");

            return this;
        },
        render: function(){
            // 高亮代码
            hljs.initHighlightingOnLoad();

            return this;
        },
        attachEvents: function () {

            this.btnInfo.on("click", this._onModalInfoClick);
            this.btnTipInfo.on("click", this._onModalTipInfoClick);

            return this;
        },
        _onModalInfoClick: function(evt){

            Modal.info(
                "Modal 有两种创建普通信息提示窗口的方法",
                "提示",
                function(modal){
                    alert('你点击了确定按钮')
                }
            );
        },
        _onModalTipInfoClick: function(evt){
            Modal.tipInfo({
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

    InfoExamples.init();

    module.exports = InfoExamples;
});