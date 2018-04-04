/**
 * core event
 * 事件系统简单解释
 *
 * 一、装载事件
 * event.on(el, eventType, listener);
 * event.on(el, eventType, sel, listener);
 * event.once(el, eventType, listener);
 * event.once(el, eventType, sel, listener);
 *
 * 二、卸载事件
 * event.un(el, eventType, listener);
 * listener === proxyId ===>> listenerProxy
 *
 * @author zcl
 * @author ydr.me
 * @create 2016-04-12 15:04
 * @update 2016年04月16日12:34:25
 * @update 2018年04月04日15:46:34
 */


'use strict';


var access = require('blear.utils.access');
var typeis = require('blear.utils.typeis');
var object = require('blear.utils.object');
var array = require('blear.utils.array');
var random = require('blear.utils.random');
var selector = require('blear.core.selector');


var w3c = !!window.FormData;
var specialEvents = {};
var standardHandle = function (ev, callback) {
    return callback.call(this, ev);
};
var DOM_KEY = random.guid();
var EVENT_KEY = random.guid();
var passiveSuppted = checkPassiveSuppted();
var defaults = {
    // 是否捕获：
    // 表示 listener 会在该类型的事件捕获阶段传播到该 EventTarget 时触发。
    capture: false,
    // 是否顺从：
    // 表示 listener 永远不会调用 preventDefault()。
    // 如果 listener 仍然调用了这个函数，客户端将会忽略它并抛出一个控制台警告。
    passive: false,
    // 是否单次（目前无效）：
    // 表示 listener 在添加之后最多只调用一次。如果是 true， listener 会在其被调用之后自动移除。
    once: false
};

exports.on = function () {

};

exports.un = function () {

};

exports.create = function () {

};

exports.emit = function () {

};

// ======================================================

/**
 * 检测是否支持 passive
 * @returns {boolean}
 */
function checkPassiveSuppted() {
    var passiveSupported = false;

    try {
        var options = Object.defineProperty({}, "passive", {
            get: function() {
                passiveSupported = true;
            }
        });

        window.addEventListener("test", null, options);
    } catch(err) {}

    return passiveSupported;
}


/**
 * 原生事件监听
 * @param el
 * @param ev
 * @param listener
 * @param options
 */
function nativeAdd(el, ev, listener, options) {
    el.addEventListener(ev, listener, options);
}




