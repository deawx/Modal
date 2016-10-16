(function (global, factory) {
    "use strict";

    if (typeof module === "object" && typeof module.exports === "object") {

        // For CommonJS and CommonJS-like environments where a proper `window` is present
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
                module.exports = factory(global, require('jquery'), require("language"));
            });
        }
        else {
            // AMD (Register as an anonymous module)
            if (typeof define === "function" && define.amd) {
                define('modal', ['jquery', 'language'], factory(global, $, language));
            }
            else {
                factory(global, jQuery);
            }
        }
    }
// Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : this, (function (window, $, language, noGlobal) {
    "use strict";

    var HTML_CHARS = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;'
        },
        _uid = -1,
        SCRIPT_FRAGMENT = '<script[^>]*>([\\S\\s]*?)<\/script\\s*>',
        TMPL_TIP_HEADER = '<div class="modal-header modal-tip-header"></div>',
        TMPL_TIP_CLOSE = '<div class="modal-close modal-tip-close"><i class="icon-cross" title="' + language.CLOSE + '"></i></div>',
        CLS_NO_FOOTER = 'modal-without-footer',
        CLS_HIDE = 'modal-hidden';

    function guid(prefix) {
        var id;

        _uid += 1;
        id = prefix ? prefix + '-' + _uid : _uid;

        return id;
    }

    function stripScripts(html) {
        return html.replace(new RegExp(SCRIPT_FRAGMENT, 'img'), '');
    }

    function encodeHTML(html) {
        html = '' + html;

        return html.replace(/[\r\t\n]/g, ' ')
            .replace(/[&<>"'\/`]/g, function (match) {
                return HTML_CHARS[match];
            });
    }

    function decodeHTML(html) {
        return stripScripts(html)
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, '\'')
            .replace(/&#x2F;/g, '\/')
            .replace(/&#x60;/g, '`');
    }

    function tmpl(json, html) {
        html = '' + html;

        $.each(json, function (key, value) {
            html = html.replace(new RegExp('{' + key + '}', 'ig'), encodeHTML(value));
        });

        return html;
    }

    /**
     *
     * @param config
     * @returns {Modal}
     * @constructor
     */
    var Modal = function (config) {
        this.attributes = {};

        this.parent = null;

        this.wrap = null;
        this.header = null;
        this.title = null;
        this.closebar = null;
        this.body = null;
        this.content = null;
        this.information = null;
        this.footer = null;
        this.buttons = [];
        this.overlay = null;

        this.width = 600;
        this.height = 360;

        this.init(config);

        return this;
    };

    /**
     *
     * @type {{parent: HTMLElement, title: string, content: string, hasClose: boolean, hasOverlay: boolean, autoDisplay: boolean, beforeBuild: null, afterBuild: null, beforeOpen: null, afterOpen: null, beforeResize: null, afterResize: null, beforeUpdatePosition: null, afterUpdatePosition: null, beforeClose: null, afterClose: null, buttons: Array, TMPL_WRAP: string, TMPL_HEADER: string, TMPL_TITLE: string, TMPL_CLOSE: string, TMPL_BODY: string, TMPL_CONTENT: string, TMPL_INFORMATION: string, TMPL_FOOTER: string, TMPL_BUTTON: string, TMPL_OVERLAY: string, width: number, height: number}}
     */
    Modal.defaults = {
        parent: document.body,
        title: language.WINDOW,
        content: '',
        hasHeader: true,
        hasClose: true,
        hasOverlay: true,
        autoDisplay: true,
        beforeBuild: null,
        afterBuild: null,
        beforeOpen: null,
        afterOpen: null,
        beforeResize: null,
        afterResize: null,
        beforeUpdatePosition: null,
        afterUpdatePosition: null,
        beforeClose: null,
        afterClose: null,
        beforeDestroy: null,
        afterDestroy: null,
        buttons: [],
        TMPL_WRAP: '<div class="modal-wrap ' + CLS_HIDE + '" id="modal-{id}"></div>',
        TMPL_HEADER: '<div class="modal-header"></div>',
        TMPL_TITLE: '<h2 class="modal-title">{title}</h2>',
        TMPL_CLOSE: '<div class="modal-close"><i class="icon-cross" title="' + language.CLOSE + '"></i></div>',
        TMPL_BODY: '<div class="modal-body"></div>',
        TMPL_CONTENT: '<div class="modal-content"></div>',
        TMPL_INFORMATION: '<div class="modal-information"></div>',
        TMPL_FOOTER: '<div class="modal-footer"></div>',
        TMPL_BUTTON: '<button type="button" data-action="{action}" class="modal-button">{text}</button>',
        TMPL_OVERLAY: '<div class="modal-overlay ' + CLS_HIDE + '"></div>',
        delay: -1,
        width: 600,
        height: 360
    };

    Modal.CUSTOMEVENTS = [
        'build',
        'afterBuild',
        'open',
        'afterOpen',
        'resize',
        'afterResize',
        'updatePosition',
        'afterUpdatePosition',
        'close',
        'afterClose',
        'destroy',
        'afterDestroy'
    ];

    Modal.ACTIONS = [
        'enter',
        'save',
        'ok',
        'cancel',
        'close'
    ];

    /**
     *
     * @type {{version: string, constructor: Modal, set: Modal.set, init: Modal.init, _init: Modal._init, render: Modal.render, resize: Modal.resize, updatePosition: Modal.updatePosition, open: Modal.open, hide: Modal.hide, close: Modal.close, isOpen: Modal.isOpen, attachEvents: Modal.attachEvents, _onCloseClick: Modal._onCloseClick, _onButtonClick: Modal._onButtonClick}}
     */
    Modal.prototype = {
        version: "0.1.0",
        constructor: Modal,
        on: function (evtName, callback) {
            var self = this;

            if ($.inArray(Modal.CUSTOMEVENTS, evtName) && $.isFunction(callback)) {
                this.wrap.on(evtName, self, function (evt) {
                    callback(evt);
                });
            }

            return this;
        },
        /**
         *
         * @param config
         * @returns {Modal}
         */
        set: function (config) {
            if ($.isPlainObject(config)) {
                $.extend(this.attributes, config);
            }

            return this;
        },
        /**
         *
         * @param config
         * @returns {Modal}
         */
        init: function (config) {
            this.set(Modal.defaults)
                .set(config)
                ._init()
                .render()
                .attachEvents();

            return this;
        },
        /**
         *
         * @returns {Modal}
         * @private
         */
        _init: function () {
            var Modal = this,
                attrs = this.attributes,
                buttons = attrs.buttons;

            this.parent = $(attrs.parent);

            this.wrap = $(tmpl({
                id: guid()
            }, attrs.TMPL_WRAP));

            this.header = $(attrs.TMPL_HEADER);

            this.title = $(tmpl({
                title: attrs.title
            }, attrs.TMPL_TITLE));

            this.closebar = $(attrs.TMPL_CLOSE);

            this.body = $(attrs.TMPL_BODY);
            this.content = $(attrs.TMPL_CONTENT);
            this.information = $(attrs.TMPL_INFORMATION);
            this.footer = $(attrs.TMPL_FOOTER);

            // 如果有按钮
            if (buttons.length > 0) {
                $(buttons)
                    .each(function (i, config) {

                        var $button = $(tmpl({
                            text: config.text,
                            action: config.action
                        }, attrs.TMPL_BUTTON));

                        if (config.btnCls) {
                            $button.addClass(config.btnCls);
                        }

                        Modal.buttons.push($button);
                    });
            }

            this.overlay = $(attrs.TMPL_OVERLAY);

            return this;
        },
        /**
         *
         * @returns {Modal}
         */
        render: function () {
            var attrs = this.attributes,
                beforeBuild = attrs.beforeBuild,
                afterBuild = attrs.afterBuild,
                $buttons = this.buttons,
                $wrap = this.wrap,
                $header = this.header,
                $footer = this.footer;

            if ($.isFunction(beforeBuild)) {
                beforeBuild(this);
            }
            else {
                this.wrap.trigger('build');
            }

            // 如果设置了标题
            if (attrs.hasHeader) {
                // render Title
                $header.append(this.title);

                // render CloseBar
                if (attrs.hasClose) {
                    $header.append(this.closebar);
                }

                $wrap.append($header);
            } else {
                if (attrs.hasClose) {
                    $wrap.append(this.closebar);
                }
            }

            // render Content
            this.information.html(attrs.content);
            this.content.append(this.information);
            this.body.append(this.content);

            // render Body
            $wrap.append(this.body);

            if ($buttons.length > 0) {
                // render Buttons
                $($buttons)
                    .each(function (i, button) {
                        $footer.append($(button));
                    });

                // render Footer
                $wrap.append($footer);
            }
            else {
                $wrap.addClass(CLS_NO_FOOTER);
            }

            // resize window
            if (attrs.width) {
                $wrap.width(attrs.width);
            }

            if (attrs.height) {
                $wrap.height(attrs.height);
            }

            this.parent.append($wrap);

            // render overlay
            if (attrs.hasOverlay) {
                this.parent.append(this.overlay);
            }

            if ($.isFunction(afterBuild)) {
                afterBuild(this);
            }
            else {
                this.wrap.trigger('afterBuild');
            }

            // display window
            if (attrs.autoDisplay) {
                this.open();
            }

            return this;
        },
        /**
         *
         * @returns {Modal}
         */
        resize: function () {
            var $wrap = this.wrap,
                $header = this.header,
                wrapEl = $wrap[0],
                wrapHeight = wrapEl.offsetHeight,
                headerHeight = $header.length > 0 ? $header[0].offsetHeight : 0,
                attrs = this.attributes,
                beforeResize = attrs.beforeResize,
                afterResize = attrs.afterResize,
                bodyHeight,
                footerHeight;

            if (this.attributes.buttons.length > 0) {
                footerHeight = this.footer[0].offsetHeight;

                bodyHeight = wrapHeight - headerHeight - footerHeight;
            }
            else {
                bodyHeight = wrapHeight - headerHeight;
            }

            if ($.isFunction(beforeResize)) {
                beforeResize(this);
            }
            else {
                this.wrap.trigger('resize');
            }

            this.body.height(bodyHeight);
            this.content.height(bodyHeight - 20);

            if ($.isFunction(afterResize)) {
                afterResize(this);
            }
            else {
                this.wrap.trigger('afterResize');
            }

            return this;
        },
        /**
         * @returns {Modal}
         */
        updatePosition: function () {
            var wrapEl = this.wrap[0],
                attrs = this.attributes,
                beforeUpdatePosition = attrs.beforeUpdatePosition,
                afterUpdatePosition = attrs.afterUpdatePosition;

            if ($.isFunction(beforeUpdatePosition)) {
                beforeUpdatePosition(this);
            }
            else {
                this.wrap.trigger('updatePosition');
            }

            // 定位
            this.wrap.css({
                'margin': '-' + (wrapEl.offsetHeight / 2) + 'px 0 0 -' + (wrapEl.offsetWidth / 2) + 'px'
            });

            if ($.isFunction(afterUpdatePosition)) {
                afterUpdatePosition(this);
            }
            else {
                this.wrap.trigger('afterUpdatePosition');
            }

            return this;
        },
        /**
         *
         * @returns {Modal}
         */
        open: function () {
            var self = this,
                attrs = this.attributes,
                beforeOpen = attrs.beforeOpen,
                afterOpen = attrs.afterOpen;

            if ($.isFunction(beforeOpen)) {
                beforeOpen(this);
            }
            else {
                this.wrap.trigger('open');
            }

            this.wrap.removeClass(CLS_HIDE);
            this.overlay.removeClass(CLS_HIDE);

            if ($.isFunction(afterOpen)) {
                afterOpen(this);
            }
            else {
                this.wrap.trigger('afterOpen');
            }

            this.resize().updatePosition();

            // 设置了自动关闭时间的，并且窗口未关闭就自动关闭
            if (attrs.delay && attrs.delay > 0) {
                setTimeout(function () {
                    self.close();
                }, attrs.delay);
            }

            return this;
        },
        /**
         *
         * @returns {Modal}
         */
        hide: function () {
            var attrs = this.attributes,
                beforeClose = attrs.beforeClose,
                afterClose = attrs.afterClose;

            if ($.isFunction(beforeClose)) {
                beforeClose(this);
            }
            else {
                this.wrap.trigger('close');
            }

            this.wrap.addClass(CLS_HIDE);
            this.overlay.addClass(CLS_HIDE);

            if ($.isFunction(afterClose)) {
                afterClose(this);
            }
            else {
                this.wrap.trigger('beforeClose');
            }

            return this;
        },
        /**
         *
         * @returns {Modal}
         */
        close: function () {
            var attrs = this.attributes,
                beforeDestroy = attrs.beforeDestroy,
                afterDestroy = attrs.afterDestroy;

            if(!this.isOpen()){
                return this;
            }

            this.hide();

            if ($.isFunction(beforeDestroy)) {
                beforeDestroy(this);
            }
            else {
                this.wrap.trigger('destory');
            }

            this.wrap.off().remove();
            this.overlay.remove();

            if ($.isFunction(afterDestroy)) {
                afterDestroy(this);
            }
            else {
                this.wrap.trigger('afterDestroy');
            }

            return this;
        },
        isOpen: function () {
            var $warp = this.wrap;

            return !$warp.hasClass(CLS_HIDE) && $warp[0];
        },
        /**
         *
         * @returns {Modal}
         */
        attachEvents: function () {
            var Modal = this,
                EventData = {
                    context: Modal
                },
                $buttons = this.buttons;

            this.closebar.on('click', EventData, this._onCloseClick);

            if ($buttons.length > 0) {
                $($buttons)
                    .each(function (i, button) {
                        var $button = $(button);

                        $button.on('click', function (evt) {

                            Modal._onButtonClick(Modal, i);

                            evt.stopPropagation();
                            evt.preventDefault();
                        });
                    });
            }

            return this;
        },
        /**
         *
         * @param evt
         * @returns {Modal|boolean}
         * @private
         */
        _onCloseClick: function (evt) {
            var Modal = evt.data.context;

            Modal.close();

            evt.stopPropagation();
            evt.preventDefault();

            return Modal;
        },
        /**
         *
         * @param context
         * @param index
         * @returns {*}
         * @private
         */
        _onButtonClick: function (context, index) {
            var Modal = context,
                buttons = Modal.attributes.buttons,
                config = buttons[index],
                action = config.action,
                callback = config.callback,
                isFunction = $.isFunction;

            if (isFunction(callback)) {
                callback(config, Modal);
            }

            if ($.inArray(action, Modal.ACTIONS) && config.autoClose) {
                Modal.close();
            }

            return Modal;
        }
    };

    // dialog()　方法，可以做完整的配置
    Modal.dialog = function (options) {
        return new Modal(options);
    };

    // info() 方法，只用来显示信息
    Modal.info = function (tip, title, callback) {
        var buttonConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-secondary',
                text: language.ENTER
            },
            TMPL_INFO_CONTENT = '<div class="modal-content modal-dialog-content modal-info-content"><i class="icon-info modal-icon modal-info-icon"></i></div>',
            config = {
                title: title || language.INFO,
                content: tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_INFO_CONTENT,
                buttons: [buttonConfig]
            };

        if ($.isFunction(title)) {
            callback = title;
        }

        buttonConfig.callback = callback;

        return new Modal(config);
    };

    // alert() 方法
    Modal.alert = Modal.warning = function (tip, title, callback) {
        var buttonConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-secondary',
                text: language.ENTER
            },
            TMPL_WARNING_CONTENT = '<div class="modal-content modal-dialog-content modal-warning-content"><i class="icon-warning modal-icon modal-warning-icon"></i></div>',
            config = {
                title: title || language.WARNING,
                content: tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_WARNING_CONTENT,
                buttons: [buttonConfig]
            };

        if ($.isFunction(title)) {
            callback = title;
        }

        buttonConfig.callback = callback;

        return new Modal(config);
    };

    // confirm() 方法
    Modal.confirm = function (options) {
        var enterConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-primary',
                text: language.ENTER
            },
            cancelConfig = {
                action: 'cancel',
                autoClose: true,
                btnCls: 'modal-button-secondary',
                text: language.CANCEL
            },
            TMPL_CONFIRM_CONTENT = '<div class="modal-content modal-dialog-content modal-confirm-content"><i class="icon-question modal-icon modal-confirm-icon"></i></div>',
            config = {
                title: options.title || language.CONFIRM,
                content: options.tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_CONFIRM_CONTENT,
                buttons: [enterConfig, cancelConfig]
            };

        if ($.isFunction(options.enterCallback)) {
            enterConfig.callback = options.enterCallback;
        }

        if ($.isFunction(options.cancelCallback)) {
            cancelConfig.callback = options.cancelCallback;
        }

        return new Modal(config);
    };

    // error() 方法
    Modal.error = function (tip, title, callback) {
        var buttonConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-secondary',
                text: language.ENTER
            },
            TMPL_ERROR_CONTENT = '<div class="modal-content modal-dialog-content modal-error-content"><i class="icon-error modal-icon modal-error-icon"></i></div>',
            config = {
                title: title || language.ERROR,
                content: tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_ERROR_CONTENT,
                buttons: [buttonConfig]
            };

        if ($.isFunction(title)) {
            callback = title;
        }

        buttonConfig.callback = callback;

        return new Modal(config);
    };

    // success() 方法
    Modal.success = function (tip, title, callback) {
        var buttonConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-secondary',
                text: language.ENTER
            },
            TMPL_SUCCESS_CONTENT = '<div class="modal-content modal-dialog-content modal-success-content"><i class="icon-success modal-icon modal-success-icon"></i></div>',
            config = {
                title: title || language.SUCCESS,
                content: tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_SUCCESS_CONTENT,
                buttons: [buttonConfig]
            };

        if ($.isFunction(title)) {
            callback = title;
        }

        buttonConfig.callback = callback;

        return new Modal(config);
    };

    Modal.frame = function (options) {
        var afterClose = options.afterClose,
            TMPL_FRAME_CONTENT = '<div class="modal-content modal-frame-content"></div>',
            TMPL_FRAME ='<iframe class="modal-frame" src="' + options.url + '" scrolling="' + (options.scrolling || "yes") + '">',
            config = {
                title: options.title,
                content: TMPL_FRAME,
                width: options.width || 600,
                height: options.height || 360,
                hasClose: options.hasClose,
                hasHeader: options.hasHeader,
                autoDisplay: true,
                hasOverlay: true,
                buttons: options.buttons,
                delay: options.delay,
                TMPL_CONTENT: TMPL_FRAME_CONTENT
            };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    Modal.loading = function (options) {
        var afterClose = options.afterClose,
            hasHeader = options.hasHeader || false,
            height = hasHeader ? 100 : 60,
            TMPL_LOADING_CONTENT = '<div class="modal-content modal-dialog-content modal-loading-content"><i class="icon-loading modal-icon modal-loading-icon"></i></div>',
            config = {
                title: options.title || language.LOADING,
                content: options.tip,
                width: options.width || 480,
                height: height,
                hasHeader: hasHeader,
                hasClose: false,
                autoDisplay: true,
                hasOverlay: true,
                delay: options.delay || 3000,
                TMPL_CONTENT: TMPL_LOADING_CONTENT
            };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    Modal.tip = function (options) {
        var afterClose = options.afterClose,
            config = {
                content: options.tip,
                width: options.width || 280,
                height: options.height || 140,
                hasClose: options.hasClose || true,
                hasHeader: options.hasHeader || true,
                hasOverlay: options.hasOverlay || true,
                delay: options.delay || 3000,
                buttons: options.buttons,
                autoDisplay: true,
                TMPL_HEADER: TMPL_TIP_HEADER,
                TMPL_CLOSE: TMPL_TIP_CLOSE
            };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    Modal.tipInfo = function (options) {
        var afterClose = options.afterClose,
            TMPL_TIP_INFO_CONTENT = '<div class="modal-content modal-dialog-content modal-tip-content modal-info-content"><i class="icon-info modal-icon modal-info-icon"></i></div>',
            config = {
            content: options.tip,
            width: options.width || 280,
            height: options.height || 140,
            hasClose: options.hasClose || false,
            hasHeader: false,
            autoDisplay: true,
            hasOverlay: false,
            delay: options.delay || 3000,
            TMPL_HEADER: TMPL_TIP_HEADER,
            TMPL_CLOSE: TMPL_TIP_CLOSE,
            TMPL_CONTENT: TMPL_TIP_INFO_CONTENT
        };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    Modal.tipAlert = Modal.tipWarning = function (options) {
        var afterClose = options.afterClose,
            TMPL_TIP_WARNING_CONTENT = '<div class="modal-content modal-dialog-content modal-tip-content modal-warning-content"><i class="icon-warning modal-icon modal-warning-icon"></i></div>',
            config = {
            content: options.tip,
            width: options.width || 280,
            height: options.height || 100,
            hasClose: options.hasClose || false,
            hasHeader: false,
            autoDisplay: true,
            hasOverlay: false,
            delay: options.delay || 3000,
            TMPL_HEADER: TMPL_TIP_HEADER,
            TMPL_CLOSE: TMPL_TIP_CLOSE,
            TMPL_CONTENT: TMPL_TIP_WARNING_CONTENT
        };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    Modal.tipError = function (options) {
        var afterClose = options.afterClose,
            TMPL_TIP_ERROR_CONTENT = '<div class="modal-content modal-dialog-content modal-tip-content  modal-success-content"><i class="icon-error modal-icon modal-error-icon"></i></div>',
            config = {
            content: options.tip,
            width: options.width || 280,
            height: options.height || 140,
            hasClose: options.hasClose || false,
            hasHeader: false,
            autoDisplay: true,
            hasOverlay: false,
            delay: options.delay || 3000,
            TMPL_HEADER: TMPL_TIP_HEADER,
            TMPL_CLOSE: TMPL_TIP_CLOSE,
            TMPL_CONTENT: TMPL_TIP_ERROR_CONTENT
        };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    Modal.tipSuccess = function (options) {
        var afterClose = options.afterClose,
            TMPL_TIP_SUCCESS_CONTENT = '<div class="modal-content modal-dialog-content modal-tip-content"><i class="icon-success modal-icon modal-success-icon"></i></div>',
            config = {
            content: options.tip,
            width: options.width || 280,
            height: options.height || 140,
            hasClose: options.hasClose || false,
            hasHeader: false,
            autoDisplay: true,
            hasOverlay: false,
            delay: options.delay || 3000,
            TMPL_HEADER: TMPL_TIP_HEADER,
            TMPL_CLOSE: TMPL_TIP_CLOSE,
            TMPL_CONTENT: TMPL_TIP_SUCCESS_CONTENT
        };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    if (!noGlobal) {
        window.Modal = Modal;
    }

    return Modal;
}));