/**
 * Created by haixi on 2016/10/6.
 */
define(function(require,exports,module){
    var $ = require("jquery"),
        Modal = require("modal"),
        hljs = require("highlight");

    var StepsExamples = {
        btnSteps: null,
        init: function () {
            this._init().render().attachEvents();

            return this;
        },
        _init: function () {
            this.btnSteps = $("#btnSteps");

            return this;
        },
        render: function(){
            // 高亮代码
            hljs.initHighlightingOnLoad();

            return this;
        },
        attachEvents: function () {

            this.btnSteps.on("click", this._onModalStepsClick);

            return this;
        },
        _onModalStepsClick: function(evt){
            Modal.steps({
                title: 'Defer parsing of JavaScript',
                stepsJSON: [
                    {
                        title: 'Defer parsing of JavaScript 规则简介',
                        contents: [
                            '其实我们前面介绍的《<a href="http://www.yaohaixiao.com/frontend/performance/put-javascript-at-bottom/">Put JavaScript at bottom</a>》就算是一种<strong>暂缓 <span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span> 解析</strong>的方法。但我们这里的<strong>暂缓 <span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span> 解析</strong>包含了更多的内容：',
                            'Put <span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span> at bottom 比较起来则更加粗矿一些，不管在初始化时需不需<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>脚本都加载了，只做到了延迟解析而已。不过这里要强调一点，<strong>Defer parsing of <span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span></strong> 规则是针对移动设备更进一步的优化措施，所以为了给移动设备节省流量，需要只加载需要的脚本，减少下载组件的流量。同时这样处理，可以让程序更快的相应用户。这些都是移动应用要特别注意的，<strong>数据流量和应用程序的相应速度</strong>。'
                        ]
                    },
                    {
                        title: 'Defer parsing of JavaScript 的方法',
                        contents: [
                            '<strong><a href="https://developers.google.com/speed/docs/best-practices/payload#DeferLoadingJS" target="_blank">Defer loading of JavaScript</a></strong>，延缓加载<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>（这个我稍后会介绍）。大家也可以参考Nicholas C. Zakas 的博文《<a href="http://www.nczonline.net/blog/2009/06/23/loading-javascript-without-blocking/" target="_blank">Loading JavaScript without blocking</a>》。',
                            '<strong><a href="https://developers.google.com/speed/docs/best-practices/rtt#PreferAsyncResources" target="_blank">&lt;script async&gt;</a></strong>，在SCRIPT标签中添加<strong>async</strong>属性，有了这个属性， Internet Explorer、Firefox、Chrome 和 Safari 浏览器都会异步加载SRC属性中指定的外部<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>资源。另外大家可以参阅《<strong><a href="http://www.yaohaixiao.com/frontend/performance/prefer-asynchronous-resources/">Prefer asynchronous resources</a></strong>》规则了解一些如何异步加载脚本。',
                            '<strong><a href="http://googlecode.blogspot.com/2009/09/gmail-for-mobile-html5-series-reducing.html" target="_blank">load JavaScript in comments</a></strong>，in comments 指的是将<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>作为文本下载下来。这种方法保证了所有的<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>在初始页面加载加载，而不是要求的<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>解析。在需要的时候再使用<code>evel()</code>方法将需要的脚本转换成可执行的<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>代码。淘宝网首页有一段时间就用隐藏的textare存储这些<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span> Comments。'
                        ]
                    },
                    {
                        title: 'Defer parsing of JavaScript 规则简介',
                        contents: [
                            '其实我们前面介绍的《<a href="http://www.yaohaixiao.com/frontend/performance/put-javascript-at-bottom/">Put JavaScript at bottom</a>》就算是一种<strong>暂缓 <span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span> 解析</strong>的方法。但我们这里的<strong>暂缓 <span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span> 解析</strong>包含了更多的内容：',
                            'Put <span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span> at bottom 比较起来则更加粗矿一些，不管在初始化时需不需<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>脚本都加载了，只做到了延迟解析而已。不过这里要强调一点，<strong>Defer parsing of <span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span></strong> 规则是针对移动设备更进一步的优化措施，所以为了给移动设备节省流量，需要只加载需要的脚本，减少下载组件的流量。同时这样处理，可以让程序更快的相应用户。这些都是移动应用要特别注意的，<strong>数据流量和应用程序的相应速度</strong>。'
                        ]
                    },
                    {
                        title: 'Defer parsing of JavaScript 的方法',
                        contents: [
                            '<strong><a href="https://developers.google.com/speed/docs/best-practices/payload#DeferLoadingJS" target="_blank">Defer loading of JavaScript</a></strong>，延缓加载<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>（这个我稍后会介绍）。大家也可以参考Nicholas C. Zakas 的博文《<a href="http://www.nczonline.net/blog/2009/06/23/loading-javascript-without-blocking/" target="_blank">Loading JavaScript without blocking</a>》。',
                            '<strong><a href="https://developers.google.com/speed/docs/best-practices/rtt#PreferAsyncResources" target="_blank">&lt;script async&gt;</a></strong>，在SCRIPT标签中添加<strong>async</strong>属性，有了这个属性， Internet Explorer、Firefox、Chrome 和 Safari 浏览器都会异步加载SRC属性中指定的外部<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>资源。另外大家可以参阅《<strong><a href="http://www.yaohaixiao.com/frontend/performance/prefer-asynchronous-resources/">Prefer asynchronous resources</a></strong>》规则了解一些如何异步加载脚本。',
                            '<strong><a href="http://googlecode.blogspot.com/2009/09/gmail-for-mobile-html5-series-reducing.html" target="_blank">load JavaScript in comments</a></strong>，in comments 指的是将<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>作为文本下载下来。这种方法保证了所有的<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>在初始页面加载加载，而不是要求的<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>解析。在需要的时候再使用<code>evel()</code>方法将需要的脚本转换成可执行的<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span>代码。淘宝网首页有一段时间就用隐藏的textare存储这些<span class="bm_keywordlink"><a href="http://www.yaohaixiao.com/category/frontend/javascript/" target="_blank">JavaScript</a></span> Comments。'
                        ]
                    }
                ]
            });
        }
    };

    StepsExamples.init();

    module.exports = StepsExamples;
});