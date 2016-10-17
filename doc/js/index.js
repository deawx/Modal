/**
 * Created by haixi on 2016/10/6.
 */
define(function(require,exports,module){
    var $ = require("jquery"),
        hljs = require("highlight");

    var ModalIndex = {
        init: function () {
            this.render();

            return this;
        },
        render: function(){
            // 高亮代码
            hljs.initHighlightingOnLoad();

            return this;
        }
    };

    ModalIndex.init();

    module.exports = ModalIndex;
});