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
                module.exports = factory(global, require('jquery'));
            });
        }
        else {
            // AMD
            if (typeof define === "function" && define.amd) {
                define('modal', ['jquery'], factory(global, $));
            }
            else {
                factory(global, jQuery);
            }
        }
    }
// Pass this if window is not defined yet
})(typeof window !== "undefined" ? window : this, (function (window, $, noGlobal) {
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
        TXT = {
            WINDOW: "窗口",
            CANCEL: "取消",
            ENTER: "确定",
            SAVE: "保存",
            LOADING: "加载中...",
            INFO: "信息",
            WARNING: "警告",
            CONFIRM: "确认",
            ERROR: "错误",
            SUCCESS: "成功",
            CLOSE: '关闭',
            STEPS: '步骤',
            PREV: '上一步',
            NEXT: '下一步',
            GOT_IT: '知道了！'
        },
        _uid = -1,
        SCRIPT_FRAGMENT = '<script[^>]*>([\\S\\s]*?)<\/script\\s*>',
        TMPL_TIP_HEADER = '<div class="modal-header modal-tip-header"></div>',
        TMPL_TIP_CLOSE = '<div class="modal-close modal-tip-close"><i class="icon-cross" title="' + TXT.CLOSE + '"></i></div>',
        CLS_NO_FOOTER = 'modal-without-footer',
        CLS_HIDE = 'modal-hidden';

    /**
     * 判断是否为 String 类型
     *
     * @param {String} str - 要检测的字符
     * @returns {boolean}
     */
    function isString(str) {
        return typeof str === "string";
    }

    /**
     * 生成唯一ID，结果如: build-0
     *
     * @param {String} [prefix] - 生成ID的前缀
     * @returns {string}
     */
    function guid(prefix) {
        var id;

        _uid += 1;
        id = prefix ? prefix + '-' + _uid : _uid;

        return id;
    }

    /**
     * 移除字符串中的危险 script 代码
     *
     * @param {String} html - (html)字符串
     * @returns {string}
     */
    function stripScripts(html) {
        return html.replace(new RegExp(SCRIPT_FRAGMENT, 'img'), '');
    }

    /**
     * 转义HTML代码
     *
     * @param {String} html - (html)字符串
     * @returns {string}
     */
    function encodeHTML(html) {
        html = '' + html;

        return stripScripts(html).replace(/[\r\t\n]/g, ' ')
            .replace(/[&<>"'\/`]/g, function (match) {
                return HTML_CHARS[match];
            });
    }

    /**
     * 恢复被转义的HTML代码
     *
     * @param {String} html - (html)字符串
     * @returns {string}
     */
    function decodeHTML(html) {
        return html.replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, '\'')
            .replace(/&#x2F;/g, '\/')
            .replace(/&#x60;/g, '`');
    }

    /**
     * 使用 JSON 对象格式数据替换HTML模板片段中的特殊字符，生成一段 HTML 模板字符串
     *
     * @param {Object} json - JSON 对象格式的数据
     * @param {String} html - 包含特殊字符的 HTML 模板片段
     * @returns {string|*}
     */
    function tmpl(json, html) {
        html = '' + html;

        $.each(json, function (key, value) {
            html = html.replace(new RegExp('{' + key + '}', 'ig'), decodeHTML(encodeHTML(value)));
        });

        return html;
    }

    /**
     * Modal 构造函数
     *
     * @param {Object} config
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
     * CUSTOMEVENTS 静态属性，包含 Modal 注册的所有合法自定义事件
     *
     * @property
     * @static
     * @type {string[]}
     */
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

    /**
     * ACTIONS 静态属性，包含 Modal 对象注册的所有常用按钮动作点类型
     *
     * @property
     * @static
     * @type {string[]}
     */
    Modal.ACTIONS = [
        'enter',
        'save',
        'ok',
        'cancel',
        'close'
    ];


    /**
     * Modal 对象默认的配置项
     *
     * *@property
     * @static
     * @type {{parent: HTMLElement, title: string, content: string, hasHeader: boolean, hasClose: boolean, hasOverlay: boolean, autoDisplay: boolean, beforeBuild: null, afterBuild: null, beforeOpen: null, afterOpen: null, beforeResize: null, afterResize: null, beforeUpdatePosition: null, afterUpdatePosition: null, beforeClose: null, afterClose: null, beforeDestroy: null, afterDestroy: null, buttons: Array, TMPL_WRAP: string, TMPL_HEADER: string, TMPL_TITLE: string, TMPL_CLOSE: string, TMPL_BODY: string, TMPL_CONTENT: string, TMPL_INFORMATION: string, TMPL_FOOTER: string, TMPL_BUTTON: string, TMPL_OVERLAY: string, delay: number, width: number, height: number}}
     */
    Modal.defaults = {
        parent: document.body,
        title: TXT.WINDOW,
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
        TMPL_CLOSE: '<div class="modal-close"><i class="icon-cross" title="' + TXT.CLOSE + '"></i></div>',
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
         * 专门用来配置 Modal 配置项 attributes 属性的方法
         *
         * @param {Object} config
         * @returns {Modal}
         */
        set: function (config) {
            if ($.isPlainObject(config)) {
                $.extend(this.attributes, config);
            }

            return this;
        },
        /**
         * 程序的初始化方法
         *
         * @param {Object} config
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
         * 初始化 Modal 对象的各个属性
         *
         * @returns {Modal}
         * @private
         */
        _init: function () {
            var self = this,
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
                        var action = config.action,
                            text = config.text;

                        if (!text) {
                            switch (action) {
                                case 'enter':
                                case 'ok':
                                    text = TXT.ENTER;
                                    break;
                                case 'save':
                                    text = TXT.SAVE;
                                    break;
                                case 'cancel':
                                    text = TXT.CANCEL;
                                    break;
                                case 'close':
                                    text = TXT.CLOSE;
                                    break;
                            }
                        }


                        var $button = $(tmpl({
                            text: text,
                            action: action
                        }, attrs.TMPL_BUTTON));

                        if (config.btnCls) {
                            $button.addClass(config.btnCls);
                        }

                        self.buttons.push($button);
                    });
            }

            this.overlay = $(attrs.TMPL_OVERLAY);

            return this;
        },
        /**
         * 绘制 Modal 窗口的界面
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
         * 重新计算窗口尺寸
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
            this.information.height(bodyHeight - 20 - parseInt(this.information.css("padding-top"),10));

            if ($.isFunction(afterResize)) {
                afterResize(this);
            }
            else {
                this.wrap.trigger('afterResize');
            }

            return this;
        },
        /**
         * 重新定位窗口
         *
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
         * 显示窗口（显示，调整大小，重新定位）
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
         * 隐藏窗口
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
         * 关闭（销毁）窗口
         *
         * @returns {Modal}
         */
        close: function () {
            var attrs = this.attributes,
                beforeDestroy = attrs.beforeDestroy,
                afterDestroy = attrs.afterDestroy;

            if (!this.isOpen()) {
                return this;
            }

            this.hide();

            if ($.isFunction(beforeDestroy)) {
                beforeDestroy(this);
            }
            else {
                this.wrap.trigger('destroy');
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
        /**
         * 判断窗口是否显示可见
         *
         * @returns {boolean}
         */
        isOpen: function () {
            var $warp = this.wrap;

            return !$warp.hasClass(CLS_HIDE) && $warp[0];
        },
        /**
         * 给窗口的各个 DOM 窗口绑定事件处理器
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
         * 关闭按钮的事件处理器
         *
         * @param {Event} evt
         * @returns {Modal}
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
         * 操作按钮的事件处理器
         *
         * @param {Object} context
         * @param {Number} index
         * @returns {Modal}
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

    /**
     * dialog()　方法，可以做完整的配置
     *
     * @param {Object} options
     * @see Modal.defaults
     * @returns {Modal}
     */
    Modal.dialog = function (options) {
        return new Modal(options);
    };

    /**
     * info() 方法，创建普通信息提示窗口
     *
     * @param {String} tip - 提示文本或者HTML代码
     * @param {String|Function} [title] - 窗口标题或者回调函数
     * @param {Function} [callback] - 关闭窗口后的回调函数
     * @returns {Modal}
     */
    Modal.info = function (tip, title, callback) {
        var isFunction = $.isFunction,
            buttonConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-secondary'
            },
            TMPL_INFO_CONTENT = '<div class="modal-content modal-dialog-content modal-info-content">' +
                '<i class="icon-info modal-icon modal-info-icon"></i>' +
                '</div>',
            config = {
                content: tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_INFO_CONTENT,
                buttons: [buttonConfig]
            };

        if (isFunction(title)) {
            callback = title;
            config.title = TXT.INFO;
        }
        else {
            if (isString(title)) {
                config.title = title || TXT.INFO;
            }
        }

        if (isFunction(callback)) {
            buttonConfig.callback = callback;
        }

        return new Modal(config);
    };

    /**
     * alert() 方法，创建警告信息提示窗口
     *
     * @param {String} tip - 提示文本或者HTML代码
     * @param {String|Function} [title] - 窗口标题或者回调函数
     * @param {Function} [callback] - 关闭窗口后的回调函数
     * @returns {Modal}
     */
    Modal.alert = function (tip, title, callback) {
        var isFunction = $.isFunction,
            buttonConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-secondary'
            },
            TMPL_WARNING_CONTENT = '<div class="modal-content modal-dialog-content modal-warning-content">' +
                '<i class="icon-warning modal-icon modal-warning-icon"></i>' +
                '</div>',
            config = {
                content: tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_WARNING_CONTENT,
                buttons: [buttonConfig]
            };

        if (isFunction(title)) {
            callback = title;
            config.title = TXT.WARNING;
        }
        else {
            if (isString(title)) {
                config.title = title || TXT.WARNING;
            }
        }

        if (isFunction(callback)) {
            buttonConfig.callback = callback;
        }

        return new Modal(config);
    };

    // warning 是 alert 的一个别名
    Modal.warning = Modal.alert;

    /**
     * confirm() 方法，创建确认提示窗口
     *
     * @param {Object} options - 配置信息
     * @param {String} options.tip - 提示文本或者HTML代码
     * @param {String} [options.title] - 窗口标题文本
     * @param {Function} [options.enterCallback] - 确认按钮的的回调方法
     * @param {Function} [options.cancelCallback] - 取消按钮的的回调方法
     *
     * @returns {Modal}
     */
    Modal.confirm = function (options) {
        var isFunction = $.isFunction,
            enterCallback = options.enterCallback,
            cancelCallback = options.cancelCallback,
            enterConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-primary'
            },
            cancelConfig = {
                action: 'cancel',
                autoClose: true,
                btnCls: 'modal-button-secondary'
            },
            TMPL_CONFIRM_CONTENT = '<div class="modal-content modal-dialog-content modal-confirm-content">' +
                '<i class="icon-question modal-icon modal-confirm-icon"></i>' +
                '</div>',
            config = {
                title: options.title || TXT.CONFIRM,
                content: options.tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_CONFIRM_CONTENT,
                buttons: [enterConfig, cancelConfig]
            };

        if (isFunction(enterCallback)) {
            enterConfig.callback = enterCallback;
        }

        if (isFunction(cancelCallback)) {
            cancelConfig.callback = cancelCallback;
        }

        return new Modal(config);
    };

    /**
     * error() 方法，创建错误信息提示窗口
     *
     * @param {String} tip - 提示文本或者HTML代码
     * @param {String|Function} [title] - 窗口标题或者回调函数
     * @param {Function} [callback] - 关闭窗口后的回调函数
     * @returns {Modal}
     */
    Modal.error = function (tip, title, callback) {
        var isFunction = $.isFunction,
            buttonConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-secondary'
            },
            TMPL_ERROR_CONTENT = '<div class="modal-content modal-dialog-content modal-error-content">' +
                '<i class="icon-error modal-icon modal-error-icon"></i>' +
                '</div>',
            config = {
                content: tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_ERROR_CONTENT,
                buttons: [buttonConfig]
            };

        if (isFunction(title)) {
            callback = title;
            config.title = TXT.ERROR;
        }
        else {
            if (isString(title)) {
                config.title = title || TXT.ERROR;
            }
        }

        if (isFunction(callback)) {
            buttonConfig.callback = callback;
        }

        return new Modal(config);
    };

    /**
     * success() 方法，创建成功信息提示窗口
     *
     * @param {String} tip - 提示文本或者HTML代码
     * @param {String|Function} [title] - 窗口标题或者回调函数
     * @param {Function} [callback] - 关闭窗口后的回调函数
     * @returns {Modal}
     */
    Modal.success = function (tip, title, callback) {
        var isFunction = $.isFunction,
            buttonConfig = {
                action: 'enter',
                autoClose: true,
                btnCls: 'modal-button-secondary'
            },
            TMPL_SUCCESS_CONTENT = '<div class="modal-content modal-dialog-content modal-success-content">' +
                '<i class="icon-success modal-icon modal-success-icon"></i>' +
                '</div>',
            config = {
                content: tip,
                width: 480,
                height: 200,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_SUCCESS_CONTENT,
                buttons: [buttonConfig]
            };

        if (isFunction(title)) {
            callback = title;
            config.title = TXT.SUCCESS;
        }
        else {
            if (isString(title)) {
                config.title = title || TXT.SUCCESS;
            }
        }

        if (isFunction(callback)) {
            buttonConfig.callback = callback;
        }

        return new Modal(config);
    };

    /**
     * frame() 方法，创建框架页窗口
     *
     * @param {Object} options - 配置信息
     * @param {String} options.url - 页面URL地址
     * @param {String} [options.scrolling] - 是否显示框架滚动条
     * @param {String} options.title - 窗口标题文本
     * @param {Number} [options.width] - 窗口宽度
     * @param {Number} [options.height] - 窗口高度
     * @param {Boolean} [options.hasClose] - 是否有关闭按钮
     * @param {Boolean} [options.hasHeader] - 是否有标题
     * @param {Array} [options.buttons] - 窗口的操作按钮
     * @param {Number} [options.delay] - 窗口展示时间
     * @param {Function} [options.afterClose] - 窗口关闭后的回调函数
     * @returns {Modal}
     */
    Modal.frame = function (options) {
        var afterClose = options.afterClose,
            TMPL_FRAME_CONTENT = '<div class="modal-content modal-frame-content"></div>',
            TMPL_FRAME = '<iframe class="modal-frame" src="' + options.url + '" scrolling="' + (options.scrolling || "yes") + '">',
            config = {
                title: options.title,
                content: TMPL_FRAME,
                width: options.width || 600,
                height: options.height || 360,
                hasClose: options.hasClose,
                hasHeader: options.hasHeader,
                buttons: options.buttons,
                delay: options.delay,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_FRAME_CONTENT
            };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    /**
     * loading() 方法，创建信息加载或者数据处理中窗口
     *
     * @param {Object} options - 配置信息
     * @param {String} options.tip - 提示信息
     * @param {String} [options.title] - 窗口标题文本
     * @param {Number} [options.width] - 窗口宽度
     * @param {Number} [options.height] - 窗口高度
     * @param {Boolean} [options.hasHeader] - 是否显示标题栏
     * @param {Number} [options.delay] - 窗口显示时间
     * @param {Function} [options.afterClose] - 窗口关闭后的回调函数
     * @returns {Modal}
     */
    Modal.loading = function (options) {
        var afterClose = options.afterClose,
            hasHeader = options.hasHeader || false,
            height = hasHeader ? 100 : (options.height ? options.height : 60),
            TMPL_LOADING_CONTENT = '<div class="modal-content modal-dialog-content modal-loading-content">' +
                '<i class="icon-loading modal-icon modal-loading-icon"></i>' +
                '</div>',
            config = {
                title: options.title || TXT.LOADING,
                content: options.tip,
                width: options.width || 480,
                height: height,
                hasHeader: hasHeader,
                delay: options.delay || 3000,
                hasClose: false,
                autoDisplay: true,
                hasOverlay: true,
                TMPL_CONTENT: TMPL_LOADING_CONTENT
            };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    /**
     *
     * @param {Object} options - 配置信息
     * @param {Array} options.stepsJSON - 步骤的JSON数组格式信息
     * @param {String} [options.title] - 窗口标题文本
     * @param {Number} [options.width] - 窗口宽度
     * @param {Number} [options.height] - 窗口高度
     * @param {Boolean} [options.hasClose] - 是否有关闭按钮
     * @param {Boolean} [options.hasOverlay] - 是否有遮罩层
     * @param {Function} [options.afterClose] - 关闭前的回调函数
     * @returns {Modal}
     */
    Modal.steps = function(options) {
        var afterClose = options.afterClose,
            /**
             * 显示上一步内容
             *
             * @param {Object} modal - Modal 对象的实例对象
             */
            prev = function (modal) {
                var step = modal.information.find(".modal-step-md").filter(":visible").index(),
                    $steps = modal.information.find(".modal-step-md"),
                    $visibleStep = $steps.eq(step),
                    $curStep;

                step -= 1;

                if (step <= 0) {
                    step = 0;
                }

                $curStep = $steps.eq(step);

                $visibleStep.addClass(CLS_HIDE);
                $curStep.removeClass(CLS_HIDE);

                buttonsEnabled(step, modal);
            },
            /**
             * 显示下一步内容
             *
             * @param {Object} modal - Modal 对象的实例对象
             */
            next = function (modal) {
                var step = modal.information.find(".modal-step-md").filter(":visible").index(),
                    $steps = modal.information.find(".modal-step-md"),
                    max = $steps.length - 1,
                    $visibleStep = $steps.eq(step),
                    $curStep;

                step += 1;

                if (step > max) {
                    step = max;
                }

                $curStep = $steps.eq(step);

                $visibleStep.addClass(CLS_HIDE);
                $curStep.removeClass(CLS_HIDE);

                buttonsEnabled(step, modal);
            },
            /**
             * 当前步骤下，上一步和下一步是否可用
             *
             * @param {Number} step - 当前的步骤索引值
             * @param {Object} modal - Modal 对象的实例对象
             */
            buttonsEnabled = function (step, modal) {
                var $steps = modal.information.find(".modal-step-md"),
                    max = $steps.length - 1,
                    $footer = modal.footer,
                    $btnPrev = $footer.find(".modal-button-prev"),
                    $btnNext = $footer.find(".modal-button-next");

                if (step <= 0) {
                    $btnPrev.attr("disabled", true);
                }
                else {
                    $btnPrev.removeAttr("disabled");
                }

                if (step >= max) {
                    $btnNext.attr("disabled", true);
                }
                else {
                    $btnNext.removeAttr("disabled");
                }
            },
            // 配置信息
            config = {
                title: options.title || TXT.STEPS,
                width: options.width || 480,
                height: options.height || 240,
                hasClose: options.hasClose || true,
                hasOverlay: options.hasOverlay || true,
                /**
                 * 界面创建完成，就需要设置按钮是否可用
                 *
                 * @param {Object} modal - Modal 对象的实例对象
                 */
                afterBuild: function (modal) {
                    var step = modal.information.find(".modal-step-md").filter(":visible").index();

                    buttonsEnabled(step, modal);
                },
                /**
                 * 窗口大小调整完毕，需要设置步骤内容显示容器的高度
                 *
                 * @param {Object} modal - Modal 对象的实例对象
                 */
                afterResize: function (modal) {
                    setTimeout(function () {
                        modal.body.find(".modal-step-bd").height(modal.information.height() - 32);
                    }, 450);
                },
                buttons: [
                    {
                        text: TXT.PREV,
                        action: 'prev',
                        btnCls: 'modal-button-primary modal-button-prev',
                        callback: function (options, modal) {
                            prev(modal);
                        }
                    },
                    {
                        text: TXT.NEXT,
                        action: 'next',
                        btnCls: 'modal-button-primary modal-button-next',
                        callback: function (options, modal) {
                            next(modal);
                        }
                    },
                    {
                        text: TXT.GOT_IT,
                        action: 'cancel',
                        btnCls: 'modal-button-secondary modal-button-got',
                        autoClose: true
                    }
                ]
            },
            STEPS_HTML = '',
            TMPL_STEP = '<div class="modal-step-md {hidden}" data-step="{id}" id="step-{id}">' +
                '<div class="modal-step-hd"><h2 class="modal-step-title">STEP {step}: {title}</h2></div>' +
                '<div class="modal-step-bd">{content}</div>' +
                '</div>';

        $(options.stepsJSON).each(function (i, stepJSON) {
            stepJSON.id = i;
            stepJSON.step = i + 1;
            stepJSON.hidden = '';
            stepJSON.content = '';

            if (i > 0) {
                stepJSON.hidden = CLS_HIDE;
            }

            $(stepJSON.contents).each(function (j, content) {
                stepJSON.content += '<p>' + content + '</p>';
            });

            STEPS_HTML += tmpl(stepJSON, TMPL_STEP);
        });

        config.content = STEPS_HTML;

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    /**
     * tip() 方法，创建一个小巧的可配置的提示窗口
     *
     * @param {Object} options - 配置信息
     * @param {String} options.tip - 提示信息
     * @param {String} options.title - 窗口标题文本
     * @param {Number} [options.width] - 窗口宽度
     * @param {Number} [options.height] - 窗口高度
     * @param {Boolean} [options.hasClose] - 是否有关闭按钮
     * @param {Boolean} [options.hasHeader] - 是否有标题
     * @param {Boolean} [options.hasOverlay] - 是否有遮罩曾
     * @param {Number} [options.delay] - 窗口展示时间
     * @param {Array} [options.buttons] - 窗口的操作按钮
     * @param {Function} [options.afterClose] - 窗口关闭后的回调函数
     * @returns {Modal}
     */
    Modal.tip = function (options) {
        var afterClose = options.afterClose,
            config = {
                title: options.title || TXT.WINDOW,
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

    /**
     * tipInfo() 方法，创建一个小巧的普通信息提示窗口
     *
     * @param {Object} options - 配置信息
     * @param {String} options.tip - 提示信息
     * @param {Number} [options.width] - 窗口宽度
     * @param {Number} [options.height] - 窗口高度
     * @param {Boolean} [options.hasClose] - 是否有关闭按钮
     * @param {Number} [options.delay] - 窗口展示时间
     * @param {Function} [options.afterClose] - 窗口关闭后的回调函数
     * @returns {Modal}
     */
    Modal.tipInfo = function (options) {
        var afterClose = options.afterClose,
            TMPL_TIP_INFO_CONTENT = '<div class="modal-content modal-dialog-content modal-tip-content modal-info-content">' +
                '<i class="icon-info modal-icon modal-info-icon"></i>' +
                '</div>',
            config = {
                content: options.tip,
                width: options.width || 280,
                height: options.height || 140,
                hasClose: options.hasClose || false,
                delay: options.delay || 3000,
                hasHeader: false,
                autoDisplay: true,
                hasOverlay: false,
                TMPL_HEADER: TMPL_TIP_HEADER,
                TMPL_CLOSE: TMPL_TIP_CLOSE,
                TMPL_CONTENT: TMPL_TIP_INFO_CONTENT
            };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    /**
     * tipAlert() 方法，创建一个小巧的警告信息提示窗口
     *
     * @param {Object} options - 配置信息
     * @param {String} options.tip - 提示信息
     * @param {Number} [options.width] - 窗口宽度
     * @param {Number} [options.height] - 窗口高度
     * @param {Boolean} [options.hasClose] - 是否有关闭按钮
     * @param {Number} [options.delay] - 窗口展示时间
     * @param {Function} [options.afterClose] - 窗口关闭后的回调函数
     * @returns {Modal}
     */
    Modal.tipAlert = function (options) {
        var afterClose = options.afterClose,
            TMPL_TIP_WARNING_CONTENT = '<div class="modal-content modal-dialog-content modal-tip-content modal-warning-content">' +
                '<i class="icon-warning modal-icon modal-warning-icon"></i>' +
                '</div>',
            config = {
                content: options.tip,
                width: options.width || 280,
                height: options.height || 100,
                hasClose: options.hasClose || false,
                delay: options.delay || 3000,
                hasHeader: false,
                autoDisplay: true,
                hasOverlay: false,
                TMPL_HEADER: TMPL_TIP_HEADER,
                TMPL_CLOSE: TMPL_TIP_CLOSE,
                TMPL_CONTENT: TMPL_TIP_WARNING_CONTENT
            };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    Modal.tipWarning = Modal.tipAlert;

    /**
     * tipError() 方法，创建一个小巧的错误信息提示窗口
     *
     * @param {Object} options - 配置信息
     * @param {String} options.tip - 提示信息
     * @param {Number} [options.width] - 窗口宽度
     * @param {Number} [options.height] - 窗口高度
     * @param {Boolean} [options.hasClose] - 是否有关闭按钮
     * @param {Number} [options.delay] - 窗口展示时间
     * @param {Function} [options.afterClose] - 窗口关闭后的回调函数
     * @returns {Modal}
     */
    Modal.tipError = function (options) {
        var afterClose = options.afterClose,
            TMPL_TIP_ERROR_CONTENT = '<div class="modal-content modal-dialog-content modal-tip-content modal-error-content">' +
                '<i class="icon-error modal-icon modal-error-icon"></i>' +
                '</div>',
            config = {
                content: options.tip,
                width: options.width || 280,
                height: options.height || 140,
                hasClose: options.hasClose || false,
                delay: options.delay || 3000,
                hasHeader: false,
                autoDisplay: true,
                hasOverlay: false,
                TMPL_HEADER: TMPL_TIP_HEADER,
                TMPL_CLOSE: TMPL_TIP_CLOSE,
                TMPL_CONTENT: TMPL_TIP_ERROR_CONTENT
            };

        if ($.isFunction(afterClose)) {
            config.afterClose = afterClose;
        }

        return new Modal(config);
    };

    /**
     * tipSuccess() 方法，创建一个小巧的成功信息提示窗口
     *
     * @param {Object} options - 配置信息
     * @param {String} options.tip - 提示信息
     * @param {Number} [options.width] - 窗口宽度
     * @param {Number} [options.height] - 窗口高度
     * @param {Boolean} [options.hasClose] - 是否有关闭按钮
     * @param {Number} [options.delay] - 窗口展示时间
     * @param {Function} [options.afterClose] - 窗口关闭后的回调函数
     * @returns {Modal}
     */
    Modal.tipSuccess = function (options) {
        var afterClose = options.afterClose,
            TMPL_TIP_SUCCESS_CONTENT = '<div class="modal-content modal-dialog-content modal-tip-content modal-success-content">' +
                '<i class="icon-success modal-icon modal-success-icon"></i>' +
                '</div>',
            config = {
                content: options.tip,
                width: options.width || 280,
                height: options.height || 140,
                hasClose: options.hasClose || false,
                delay: options.delay || 3000,
                hasHeader: false,
                autoDisplay: true,
                hasOverlay: false,
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
