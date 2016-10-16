/**
 * Created by haixi on 2016/10/6.
 */
define(function(require,exports,module){
    var $ = require("jquery"),
        Modal = require("modal"),
        hljs = require("highlight"),
        CLS_HIDE = "modal-hidden";

    var ConfirmExamples = {
        btnConfirm: null,
        init: function () {
            this._init().render().attachEvents();

            return this;
        },
        _init: function () {
            this.btnConfirm = $("#btnConfirm");

            return this;
        },
        render: function(){
            // 高亮代码
            hljs.initHighlightingOnLoad();

            return this;
        },
        attachEvents: function () {

            this.btnConfirm.on("click", this._onModalConfirmClick);

            return this;
        },
        _onModalConfirmClick: function(evt){
            Modal.frame({
                title: "确认",
                url: "Modal.confirm()，确定要使用该方法吗？",
                enterCallback: function (options, modal) {
                    console.log(options);
                },
                cancelCallback: function (options, modal) {
                    console.log(options);
                }
            });
        }
    };

    ConfirmExamples.init();

    module.exports = ConfirmExamples;
});