/**
 * Created by haixi on 2016/10/6.
 */
define(function(require,exports,module){
    var $ = require("jquery"),
        Modal = require("modal"),
        hljs = require("highlight");

    var AlertExamples = {
        btnAlert: null,
        btnAlertWithCallback: null,
        btnWarning: null,
        btnWarningWithCallback: null,
        btnTipAlertWithoutClose: null,
        btnTipAlertWithClose: null,
        btnTipAlertCloseWithCallback: null,
        btnTipAlertCloseWithCallbackHasClose: null,
        btnTipWarningWithoutClose: null,
        btnTipWarningWithClose: null,
        btnTipWarningCloseWithCallback: null,
        btnTipWarningCloseWithCallbackHasClose: null,
        init: function () {
            this._init().render().attachEvents();

            return this;
        },
        _init: function () {
            this.btnAlert = $("#btnAlert");
            this.btnAlertWithCallback = $("#btnAlertWithCallback");


            this.btnWarning = $("#btnWarning");
            this.btnWarningWithCallback = $("#btnWarningWithCallback");

            this.btnTipAlertWithoutClose = $("#btnTipAlertWithoutClose");
            this.btnTipAlertWithClose = $("#btnTipAlertWithClose");

            this.btnTipAlertCloseWithCallback = $("#btnTipAlertCloseWithCallback");
            this.btnTipAlertCloseWithCallbackHasClose = $("#btnTipAlertCloseWithCallbackHasClose");

            this.btnTipWarningWithoutClose = $("#btnTipWarningWithoutClose");
            this.btnTipWarningWithClose = $("#btnTipWarningWithClose");

            this.btnTipWarningCloseWithCallback = $("#btnTipWarningCloseWithCallback");
            this.btnTipWarningCloseWithCallbackHasClose = $("#btnTipWarningCloseWithCallbackHasClose");

            return this;
        },
        render: function () {

            // 高亮代码
            hljs.initHighlightingOnLoad();

            return this;
        },
        attachEvents: function () {

            this.btnAlert.on("click", this._onModalAlertClick);
            this.btnAlertWithCallback.on("click", this._onModalAlertWithCallbackClick);

            this.btnWarning.on("click", this._onModalWaringClick);
            this.btnWarningWithCallback.on("click", this._onModalWarningWithCallbackClick);

            this.btnTipAlertWithoutClose.on("click", this._onModalTipAlertWithoutCloseClick);
            this.btnTipAlertWithClose.on("click", this._onModalTipAlertWithCloseClick);

            this.btnTipAlertCloseWithCallback.on("click", this._onTipAlertCloseWithCallback);
            this.btnTipAlertCloseWithCallbackHasClose.on("click", this._onTipAlertCloseWithCallbackHasClose);

            this.btnTipWarningWithoutClose.on("click", this._onModalTipAlertWithoutCloseClick);
            this.btnTipWarningWithClose.on("click", this._onModalTipAlertWithCloseClick);

            this.btnTipWarningCloseWithCallback.on("click", this._onTipAlertCloseWithCallback);
            this.btnTipWarningCloseWithCallbackHasClose.on("click", this._onTipAlertCloseWithCallbackHasClose);

            return this;
        },
        _onTipAlertCloseWithCallbackHasClose: function(evt){
            Modal.tipAlert({
                tip: '<p>请填写完整的产品信息！</p>',
                width: 300,
                height:80,
                delay: 5000,
                hasClose: true,
                afterClose: function(modal){
                    alert(modal.attributes.title);
                }
            });
        },
        _onTipAlertCloseWithCallback: function(evt){
            Modal.tipAlert({
                tip: '请填写完整的产品信息！',
                width: 300,
                height:80,
                delay: 5000,
                afterClose: function(modal){
                    alert(modal.attributes.title);
                }
            });
        },
        _onModalTipAlertWithoutCloseClick: function(evt){
            Modal.tipAlert({
                tip: '请填写完整的产品信息！',
                width: 300,
                height:80,
                delay: 4000
            });
        },
        _onModalTipAlertWithCloseClick: function(evt){
            Modal.tipAlert({
                tip: '请填写完整的产品信息！',
                width: 300,
                height:80,
                delay: 4000,
                hasClose: true
            });
        },
        _onModalAlertClick: function (evt) {
            Modal.warning('请填写完整的产品信息！','警告', function(options,modal){
                alert(modal.attributes.title);
            });
        },
        _onModalAlertWithCallbackClick: function (evt) {
            Modal.warning('请填写完整的产品信息！','警告');
        },
        _onModalWarningWithCallbackClick: function (evt) {
            Modal.warning('请填写完整的产品信息！','警告', function(options,modal){
                alert(modal.attributes.title);
            });
        },
        _onModalWaringClick: function (evt) {
            Modal.warning('请填写完整的产品信息！','警告');
        }
    };

    AlertExamples.init();

    module.exports = AlertExamples;
});