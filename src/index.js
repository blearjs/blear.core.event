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
require('./_event-constructor-polyfill');

var typeRE = /\s+/;
var specialEvents = {};
var standardHandle = function (ev, callback) {
    return callback.call(this, ev);
};
var guid = random.guid;
var BUBBLE_MODE_KEY = guid();
var CAPTURE_MODE_KEY = guid();
var IMMEDIATE_PROPAGATION_STOPPED = guid();
var LISTENER_ONCED = guid();
var LISTENER_META = guid();
var eventStrore = {};
var passiveSuppted = checkPassiveSuppted();
var defaultOptions = {
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
// 事件派生默认配置
var defaultProperties = {
    // 是否冒泡
    bubbles: true,
    // 是否可以被阻止冒泡
    cancelable: true,
    // 事情细节
    detail: {}
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
        case 3:
            eachTypes(type, function (type) {
            // .on(el, type, listener);
            on(el, type, el, args[2], false);
            });
            break;

        case 4:
            eachTypes(type, function (type) {
                // .on(el, type, listener, options);
                if (typeis.Function(args[2])) {
                    on(el, type, el, args[2], args[3]);
                }
                // .on(el, type, sel, listener);
                else {
                    on(el, type, sel, args[3], false);
                }
            });
            break;

        case 5:
            eachTypes(type, function (type) {
                // .on(el, type, sel, listener, options);
                on(el, type, sel, listener, options);
            });
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
        case 1:
            // .un(el);
            unAllEvents(el);
            break;

        case 2:
            eachTypes(type, function (type) {
                // .un(el, type);
                unAllListeners(el, type);
            });
            break;

        case 3:
            eachTypes(type, function (type) {
                // .un(el, type, listener);
                unOneListener(el, type, listener);
            });
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
        case 3:
            eachTypes(type, function (type) {
                // .once(el, type, listener);
                once(el, type, el, args[2], false);
            });
            break;

        case 4:
            eachTypes(type, function (type) {
                // .once(el, type, listener, options);
                if (typeis.Function(args[2])) {
                    once(el, type, el, args[2], args[3]);
                }
                // .once(el, type, sel, listener);
                else {
                    once(el, type, sel, args[3], false);
                }
            });
            break;

        case 5:
            eachTypes(type, function (type) {
                // .once(el, type, sel, listener, options);
                once(el, type, sel, listener, options);
            });
            break;
    }
};

/**
 * 指定特殊事件处理，比如处理 mouseenter 的代理通过 mousemove 来间接实现
 * handle this = 元素
 * handle args[0] = ev
 * handle args[1] = listener
 * @param displayType {String} 显示的事件类型
 * @param originType {String} 原始的事件类型
 * @param handle {Function} 处理方式
 */
exports.special = function (displayType, originType, handle) {
    special(displayType, originType, handle);
};

/**
 * 获取指定类型事件的绑定长度
 * @param el {Object} 对象
 * @param type {String} 类型
 * @returns {number}
 */
exports.length = function (el, type) {
    var len = 0;

    eachMode(function (mode) {
        var key = el[mode];

        if (key &&
            eventStrore[key] &&
            eventStrore[key][type]
        ) {
            len += eventStrore[key][type].length;
        }
    });

    return len;
};

/**
 * 事件创建
 * @param type {String} 事件类型
 * @param [properties] {Object} 事件属性
 * @param [Constructor=Event] {Function} 事件构造器
 * @returns {event}
 */
exports.create = function (type, properties, Constructor) {
    var args = access.args(arguments);

    switch (args.length) {
        case 1:
            // .create(type);
            return create(type, null, Event);

        case 2:
            // .create(type, Constructor);
            if (typeis.Function(args[1])) {
                return create(type, null, args[1]);
            }

            // .create(type, properties);
            return create(type, args[1], Event);

        case 3:
            // .create(type, properties, Constructor);
            return create(type, properties, Constructor);
    }
};

/**
 * 克隆事件
 * @param ev {Event} 事件
 * @param [type=ev.type] {String} 类型
 * @returns {event}
 */
exports.clone = function (ev, type) {
    return clone(ev, type);
};

/**
 * 事件发送
 * @param el
 * @param ev
 * @returns {boolean}
 */
exports.emit = function (el, ev) {
    if (typeis.String(ev)) {
        ev = create(ev, null, Event);
    }

    return el.dispatchEvent(ev);
};


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
 * 根据空格分隔 type
 * @param type
 * @param callback
 */
function eachTypes(type, callback) {
    array.each(type.trim().split(typeRE), function (index, type) {
        callback(type);
    });
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
    var specialEvent = specialEvents[type];
    type = specialEvent ? specialEvent.o : type;
    options = typeis.Boolean(options) ? {capture: options} : options;
    options = passiveSuppted ? object.assign({}, defaultOptions, options) : Boolean(options.capture);
    var keyName = options === true || options && options.capture === true ? CAPTURE_MODE_KEY : BUBBLE_MODE_KEY;
    var handle = specialEvent ? specialEvent.h : standardHandle;
    var key = el[keyName] = el[keyName] || guid();
    eventStrore[key] = eventStrore[key] || {};
    var listenerMap = eventStrore[key] = eventStrore[key] || {};
    var listenerList = listenerMap[type];

    if (!listenerList) {
        listenerList = listenerMap[type] = [];
        el.addEventListener(type, function (ev) {
            var immediatePropagationStopped = false;
            array.each([].concat(listenerList), function (index, listener) {
                var meta = listener[LISTENER_META];
                var contextEl = el;
                var execHandle = function () {
                    handle.call(contextEl, ev, function (ev) {
                        ev = wrapEvent(ev);

                        if (listener.call(this, ev) === false) {
                            ev.preventDefault();
                            ev.stopPropagation();
                            ev.stopImmediatePropagation();
                        }

                        if (listener[LISTENER_ONCED]) {
                            listener[LISTENER_ONCED] = null;
                            array.remove(listenerList, index);
                        }

                        if (ev[IMMEDIATE_PROPAGATION_STOPPED]) {
                            immediatePropagationStopped = true;
                        }
                    });
                };

                // 非代理
                if (el === meta.s) {
                    execHandle();
                }
                // 代理
                else {
                    contextEl = selector.closest(ev.target, meta.s)[0];

                    // 如果事件类型相同 && 最近节点存在 && 父子关系
                    if (contextEl && selector.contains(contextEl, el)) {
                        execHandle();
                    }
                }

                if (immediatePropagationStopped) {
                    return false;
                }
            });
        }, options);
    }

    listener[LISTENER_META] = {
        e: el,
        t: type,
        s: sel,
        l: listener,
        o: options
    };
    listenerList.push(listener);
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
    listener[LISTENER_ONCED] = true;
    on(el, type, sel, listener, options);
}

/**
 * 遍历每一种模式（冒泡、捕获）
 * @param callback
 */
function eachMode(callback) {
    array.each([
        BUBBLE_MODE_KEY,
        CAPTURE_MODE_KEY
    ], function (index, mode) {
        return callback(mode);
    });
}

/**
 * 解除 listener 对其他的的引用
 * @param list
 */
function unlinkListenersMeta(list) {
    array.each(list, function (index, listener) {
        listener[LISTENER_META] = null;
        listener[LISTENER_ONCED] = null;
    });
}

/**
 * 删除所有事件
 * @param el
 */
function unAllEvents(el) {
    eachMode(function (mode) {
        var key = el[mode];

        if (key &&
            eventStrore[key]
        ) {
            object.each(eventStrore[key], function (type, list) {
                unlinkListenersMeta(list);
                list.length = 0;
            });
        }
    });
}

/**
 * 删除指定类型的所有事件
 * @param el
 * @param type
 */
function unAllListeners(el, type) {
    eachMode(function (mode) {
        var key = el[mode];

        if (key &&
            eventStrore[key] &&
            eventStrore[key][type]
        ) {
            // 必须这么操作才是操作原始数组的引用
            unlinkListenersMeta(eventStrore[key][type]);
            eventStrore[key][type].length = 0;
        }
    });
}

/**
 * 删除一个事件
 * @param el
 * @param type
 * @param listener
 */
function unOneListener(el, type, listener) {
    eachMode(function (mode) {
        var key = el[mode];

        if (key &&
            eventStrore[key] &&
            eventStrore[key][type]
        ) {
            unlinkListenersMeta([listener]);
            array.delete(eventStrore[key][type], listener);
        }
    });
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
 * 创建事件
 * @param type
 * @param properties
 * @param Constructor
 * @returns {event}
 */
function create(type, properties, Constructor) {
    properties = object.assign({}, defaultProperties, properties);
    return new Constructor(type, properties);

    // var ev;
    //var args;
    //var eventTypeIndex = 0;
    //
    // ev = new Constructor(type, properties);
    //
    //try {
    //    // ie11+/chrome/firefox
    //    ev = new Event(eventType, properties);
    //} catch (err1) {
    //    try {
    //        // who?
    //        ev = new CustomEvent(eventType, properties);
    //    } catch (err2) {
    //        // <= 10
    //        args = [eventType, !!properties.bubbles, !!properties.cancelable, window, {},
    //            0, 0, 0, 0, false, false, false, false, 0, null
    //        ];
    //
    //        if (htmlEvents.indexOf(eventType)) {
    //            eventTypeIndex = 1;
    //        } else if (mouseEvents.test(eventType)) {
    //            eventTypeIndex = 2;
    //        } else if (uiEvents.test(eventType)) {
    //            eventTypeIndex = 3;
    //        } else if (mutationEvents.test(eventType)) {
    //            eventTypeIndex = 4;
    //        }
    //
    //        ev = document.createEvent(eventTypeArr[eventTypeIndex]);
    //        ev['init' + eventInitArr[eventTypeIndex] + 'Event'].apply(ev, args);
    //    }
    //}
    //
    // return ev;
}

/**
 * 克隆一个事件
 * @param ev1
 * @param [type]
 * @returns {event}
 */
function clone(ev1, type) {
    var properties = {};

    try {
        for (var key in ev1) {
            properties[key] = ev1[key];
        }
    } catch (err) {
        // ignore
    }

    var ev2 = create(type || ev1.type, properties, ev1.constructor);
    ev2.originalEvent = ev1;
    return ev2;
}

/**
 * 特殊处理事件
 * @param displayType
 * @param originType
 * @param handle
 */
function special(displayType, originType, handle) {
    specialEvents[displayType] = {
        // d: displayType,
        o: originType,
        h: handle
    };
}

object.each({
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
}, function (displayType, originType) {
    special(displayType, originType, function (ev, listener) {
        var target = this;
        var related = ev.relatedTarget;

        // For mouseenter/leave call the handler if related is outside the target.
        // NB: No relatedTarget if the mouse left/entered the browser window
        if (!related || (related !== target && !selector.contains(related, target))) {
            listener.call(target, clone(ev, displayType));
        }
    });
});


