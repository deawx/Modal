/**
 * Created by haixi on 2016/10/6.
 */
define(function(require,exports,module){
    var $ = require("jquery"),
        Modal = require("modal"),
        hljs = require("highlight");

    var FrameExamples = {
        btnFrame: null,
        init: function () {
            this._init().render().attachEvents();

            return this;
        },
        _init: function () {
            this.btnFrame = $("#btnFrame");

            return this;
        },
        render: function(){
            // 高亮代码
            hljs.initHighlightingOnLoad();

            return this;
        },
        attachEvents: function () {

            this.btnFrame.on("click", this._onModalFrameClick);

            return this;
        },
        _onModalFrameClick: function(evt){

            Modal.frame({
                scrolling: "no",
                hasHeader: false,
                hasClose: false,
                title: 'IFRAME',
                url: '../index.html',
                width:800,
                height:400,
                delay: 13000,
                buttons: [{
                    // 按钮文本
                    text: '确定',
                    // 按钮动作类型
                    action: 'enter',
                    // 点击按钮后，是否自动关闭按钮
                    autoClose: true,
                    // 按钮附加样式
                    btnCls: 'modal-button-primary',
                    /**
                     * 按钮回调函数
                     * @param {Object} options - 就是本按钮的配置信息
                     * @param {Modal} modal - 弹出窗口的实例对象
                     */
                    callback: function(options, modal){
                        alert('你点击了确定按钮')
                    }
                },{
                    text: '取消',
                    action: 'cancel',
                    btnCls: 'modal-button-secondary',
                    autoClose: true,
                    callback: function(options, modal){
                        alert('你点击了取消按钮')
                    }
                }]
            });
        }
    };

    FrameExamples.init();

    module.exports = FrameExamples;
});