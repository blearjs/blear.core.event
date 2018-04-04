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
var guid = random.guid;
var DOM_KEY = guid();
var LISTENER_MAP = guid();
var OPTIONS_FLAG = guid();
var IMMEDIATE_PROPAGATION_STOPPED = guid();
var ONCED = guid();
var eventStrore = {};
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


/**
 * 事件监听
 * @param el {Object} 对象
 * @param type {String} 事件类型
 * @param [sel] {String|Object} 选择器
 * @param listener {Function} 监听函数
 * @param [options] {Object|Boolean} 参数
 */
exports.on = function (el, type, sel, listener, options) {
    var args = access.args(arguments);

    switch (args.length) {
        // .on(el, type, listener);
        case 3:
            on(el, type, el, args[2], false);
            break;
        // .on(el, type, listener, options);
        // .on(el, type, sel, listener);
        case 4:
            if (typeis.Function(args[2])) {
                on(el, type, el, args[2], args[3]);
            } else {
                on(el, type, sel, args[3], false);
            }
            break;

        // .on(el, type, sel, listener, options);
        case 5:
            on(el, type, sel, listener, options);
            break;
    }
};

/**
 * 接触事件绑定
 * @param el {Object} 对象
 * @param [type] {String} 事件类型
 * @param [listener] {Function} 事件函数
 */
exports.un = function (el, type, listener) {
    var args = access.args(arguments);

    switch (args.length) {
        // .un(el);
        case 1:
            unAllEvents(el);
            break;

        // .un(el, type);
        case 2:
            unAllListeners(el, type);
            break;

        // .un(el, type, listener);
        case 3:
            unOneListener(el, type, listener);
            break;
    }
};

/**
 * 【单次】事件监听
 * @param el {Object} 对象
 * @param type {String} 事件类型
 * @param [sel] {String|Object} 选择器
 * @param listener {Function} 监听函数
 * @param [options] {Object|Boolean} 参数
 */
exports.once = function (el, type, sel, listener, options) {
    var args = access.args(arguments);

    switch (args.length) {
        // .on(el, type, listener);
        case 3:
            once(el, type, el, args[2], false);
            break;
        // .on(el, type, listener, options);
        // .on(el, type, sel, listener);
        case 4:
            if (typeis.Function(args[2])) {
                once(el, type, el, args[2], args[3]);
            } else {
                once(el, type, sel, args[3], false);
            }
            break;

        // .on(el, type, sel, listener, options);
        case 5:
            once(el, type, sel, listener, options);
            break;
    }
};


exports.create = function () {

};

exports.emit = function () {

};

window.eventStrore = eventStrore;

// ======================================================


/**
 * 检测是否支持 passive
 * @returns {boolean}
 */
function checkPassiveSuppted() {
    var passiveSupported = false;

    try {
        var options = Object.defineProperty({}, 'passive', {
            get: function () {
                passiveSupported = true;
            }
        });

        window.addEventListener('a', null, options);
    } catch (err) {
    }

    return passiveSupported;
}


/**
 * 事件监听
 * @param el
 * @param type
 * @param sel
 * @param listener
 * @param options
 */
function on(el, type, sel, listener, options) {
    var key = el[DOM_KEY] = el[DOM_KEY] || guid();
    eventStrore[key] = eventStrore[key] || {};
    var listenerMap = eventStrore[key][LISTENER_MAP] = eventStrore[key][LISTENER_MAP] || {};
    var optionsFlag = eventStrore[key][OPTIONS_FLAG] = eventStrore[key][OPTIONS_FLAG] || null;
    var listenerList = listenerMap[type] = listenerMap[type] || [];
    listenerMap[type].push(listener);

    if (!optionsFlag) {
        options = typeis.Boolean(options) ? {capture: options} : options;
        options = passiveSuppted ? object.assign({}, defaults, options) : Boolean(options.capture);
        eventStrore[key][OPTIONS_FLAG] = options;
        el.addEventListener(type, function (ev) {
            delegate(el, wrapEvent(ev), sel, listenerList);
        }, options);
    }
}

/**
 * 【单次】事件监听
 * @param el
 * @param type
 * @param sel
 * @param listener
 * @param options
 */
function once(el, type, sel, listener, options) {
    listener[ONCED] = true;
    on(el, type, sel, listener, options);
}

/**
 * 删除所有事件
 * @param el
 */
function unAllEvents(el) {
    var key = el[DOM_KEY];

    if (!key) {
        return;
    }

    eventStrore[key][LISTENER_MAP] = {};
}

/**
 * 删除指定类型的所有事件
 * @param el
 * @param type
 */
function unAllListeners(el, type) {
    var key = el[DOM_KEY];

    if (!key) {
        return;
    }

    var listenerList = eventStrore[key][LISTENER_MAP][type];

    if (!listenerList) {
        return;
    }

    // 必须这么操作才是操作原始数组的引用
    listenerList.length = 0;
}

/**
 * 删除一个事件
 * @param el
 * @param type
 * @param listener
 */
function unOneListener(el, type, listener) {
    var key = el[DOM_KEY];

    if (!key) {
        return;
    }

    var listenerList = eventStrore[key][LISTENER_MAP][type];

    if (!listenerList) {
        return;
    }

    array.delete(listenerList, listener);
}


/**
 * 事件包装
 * @param ev
 * @returns {*}
 */
function wrapEvent(ev) {
    var stopImmediatePropagation = ev.stopImmediatePropagation;
    ev[IMMEDIATE_PROPAGATION_STOPPED] = false;
    ev.stopImmediatePropagation = function () {
        ev[IMMEDIATE_PROPAGATION_STOPPED] = true;
        return stopImmediatePropagation.call(ev);
    };
    return ev;
}


/**
 * 代理
 * @param el
 * @param ev
 * @param sel
 * @param list
 */
function delegate(el, ev, sel, list) {
    var closestEl = selector.closest(ev.target, sel)[0];
    var falsed = false;
    var listCopied = [].concat(list);

    // 如果事件类型相同 && 最近节点存在 && 父子关系
    if (closestEl && selector.contains(closestEl, el)) {
        array.each(listCopied, function (index, listener) {
            if (listener.call(closestEl, ev) === false) {
                if (!falsed) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    ev.stopImmediatePropagation();
                }

                falsed = true;
            }

            if (listener[ONCED]) {
                array.remove(list, index);
            }

            if (ev[IMMEDIATE_PROPAGATION_STOPPED]) {
                return false;
            }
        });
    }
}


