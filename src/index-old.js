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
 * 为了统一化不同的事件监听方式，都进行一次代理操作
 * listener => listenerProxy
 *
 * 每一个 listener 都有一个 proxyId 来指向 listenerProxy
 * 该 proxyId 的生成规则为：eventProxyPrefix + domId + eventType + id
 *
 * 二、卸载事件
 * event.un(el, eventType, listener);
 * listener === proxyId ===>> listenerProxy
 *
 * @author zcl
 * @author ydr.me
 * @create 2016-04-12 15:04
 * @update 2016年04月16日12:34:25
 */


'use strict';


var access = require('blear.utils.access');
var typeis = require('blear.utils.typeis');
var object = require('blear.utils.object');
var array = require('blear.utils.array');
var selector = require('blear.core.selector');


var w3c = !!window.FormData;
var specialEvents = {};
var standardHandle = function (ev, callback) {
    return callback.call(this, ev);
};

/**
 * 设置 DOM 标记
 * @param el
 * @param key
 * @param val
 */
var setFlag = function (el, key, val) {
    if (w3c || el.nodeType !== 1) {
        el[key] = val;
    } else {
        el.setAttribute(key, val);
    }
};

/**
 * 设置 DOM 标记
 * @param el
 * @param key
 */
var getFlag = function (el, key) {
    if (w3c || el.nodeType !== 1) {
        return el[key];
    } else {
        return el.getAttribute(key);
    }
};

// 标记元素
var EVENT_DOM_ID_KEY = '__core_event_dom_id__';

// 标记事件
var EVENT_LISTENER_ID_KEY = '__core_event_listener_id__';

// 事件管理 map
// id: {
//        click: [
//           fn1,
//           fn2
//        ],
//        mouseover: [
//           fn3
//        ]
//    }
var eventManageMap = window.eventManageMap = {};

// 事件管理者
// id: {
//        click: fn1,
//        mouseover: fn2
//      }
var eventManager = window.eventManager = {};

// 标记事件的代理指向
var PROXY_LISTENER_KEY = '__core/event/proxy__';

/**
 * @link http://www.w3school.com.cn/jsref/dom_obj_event.asp
 * - altKey            返回当事件被触发时，"ALT" 是否被按下。
 * - button            返回当事件被触发时，哪个鼠标按钮被点击。
 * - clientX        返回当事件被触发时，鼠标指针的水平坐标。
 * - clientY        返回当事件被触发时，鼠标指针的垂直坐标。
 * - ctrlKey        返回当事件被触发时，"CTRL" 键是否被按下。
 * - metaKey        返回当事件被触发时，"meta" 键是否被按下。
 * - relatedTarget    返回与事件的目标节点相关的节点。
 * - screenX        返回当某个事件被触发时，鼠标指针的水平坐标。
 * - screenY        返回当某个事件被触发时，鼠标指针的垂直坐标。
 * - shiftKey        返回当事件被触发时，"SHIFT" 键是否被按下。
 * - bubbles        返回布尔值，指示事件是否是起泡事件类型。
 * - cancelable        返回布尔值，指示事件是否可拥可取消的默认动作。
 * - currentTarget    返回其事件监听器触发该事件的元素。
 * - eventPhase        返回事件传播的当前阶段。0=结束或未开始，1=捕获，2=到底，3=冒泡
 * - target            返回触发此事件的元素（事件的目标节点）。
 * - timeStamp        返回事件生成的日期和时间。
 * - type            返回当前 Event 对象表示的事件的名称。
 */
var mustEventProperties = 'altKey button which clientX clientY ctrlKey metaKey relatedTarget pageX pageY screenX screenY shiftKey bubbles cancelable currentTaget eventPhase target timeStamp'.split(' ');
var eventTypeArr = ['Events', 'HTMLEvents', 'MouseEvents', 'UIEvents', 'MutationEvents'];
var eventInitArr = ['', '', 'Mouse', 'UI', 'Mutation'];
/**
 * http://hi.baidu.com/flondon/item/a83892e3b454192a5a7cfb35
 * eventType 共5种类型：Events、HTMLEvents、UIEevents、MouseEvents、MutationEvents。
 * ● Events ：所有的事件。
 * ● HTMLEvents：abort、blur、change、error、focus、load、reset、resize、scroll、select、submit、unload。
 * ● UIEvents：DOMActivate、DOMFocusIn、DOMFocusOut、keydown、keypress、keyup。
 * ● MouseEvents：click、mousedown、mousemove、mouseout、mouseover、mouseup、touch。
 * ● MutationEvents：DOMAttrModified、DOMNodeInserted、DOMNodeRemoved、DOMCharacterDataModified、DOMNodeInsertedIntoDocument、DOMNodeRemovedFromDocument、DOMSubtreeModified。
 */
var htmlEvents = 'abort blur change error focus load reset resize scroll select submit unload'.split(' ');
var mouseEvents = /click|mouse|touch/;
var uiEvents = /key|DOM(Active|Focus)/;
var mutationEvents = /DOM(Attr|Node|Character|Subtree)/;

// 事件派生默认配置
var defaults = {
    // 是否冒泡
    bubbles: true,
    // 是否可以被阻止冒泡
    cancelable: true,
    // 事情细节
    detail: {}
};

/**
 * 获取事件管理 id
 */
var getEventDomId = (function () {
    var id = 1;
    return function () {
        return id++;
    };
}());


/**
 * 获取事件代理 id
 */
var getListenerProxyId = (function () {
    var id = 1;
    // eventProxyPrefix + eventManageId + eventType + id
    return function (el, eventType, listener) {
        var domId = getFlag(el, EVENT_DOM_ID_KEY);

        if (!domId) {
            domId = getEventDomId();
            setFlag(el, EVENT_DOM_ID_KEY, domId);
        }

        var listenerId = listener[EVENT_LISTENER_ID_KEY] = listener[EVENT_LISTENER_ID_KEY] || id++;
        return [PROXY_LISTENER_KEY, domId, eventType, listenerId].join('-');
    };
}());


var reBlank = /\s+/g;

/**
 * 遍历 eventType
 * @param eventType
 * @param fn
 */
var eachEventTypes = function (eventType, fn) {
    array.each(eventType.split(reBlank), fn);
};


/**
 * event bind
 * 所有事件只支出事件冒泡，不支持事件捕获
 * @param {HTMLElement} el
 * @param {String} eventType
 * @param {Function} fn
 */
var addEvent = function (el, eventType, fn) {
    el.addEventListener(eventType, fn, false);
};


///**
// * event unbind
// * @param {HTMLElement} el
// * @param {String} [eventType]
// * @param {Function} [fn]
// */
//var removeEvent = function (el, eventType, fn) {
//    el.removeEventListener(eventType, fn, false);
//};


/**
 * 管理事件
 * @param el
 * @param eventType
 * @param fn
 */
var manageEvent = function (el, eventType, fn) {
    var eventManageId = getFlag(el, EVENT_DOM_ID_KEY) || getEventDomId();
    eventManageMap[eventManageId] = eventManageMap[eventManageId] || {};
    eventManageMap[eventManageId][eventType] = eventManageMap[eventManageId][eventType] || [];

    if (typeis.Function(fn)) {
        eventManageMap[eventManageId][eventType].push(fn);
    }

    var eventManagerMap = eventManager[eventManageId] = eventManager[eventManageId] || {};

    if (!eventManagerMap[eventType]) {
        addEvent(el, eventType, eventManagerMap[eventType] = function (ev) {
            var context = this;
            var listenEventType = ev.type;
            var listenManageId = getFlag(this, EVENT_DOM_ID_KEY);

            var manageMap = eventManageMap[listenManageId] = eventManageMap[listenManageId] || {};
            var manageList = manageMap[listenEventType] = manageMap[listenEventType] || [];

            array.each(manageList, function (index, callback) {
                if (typeis.Function(callback)) {
                    callback.call(context, ev);
                }
            });
        });
    }
};


/**
 * 移除元素上指定类型的回调
 * @param el
 * @param eventType
 * @param fn
 */
var removeElementEventTypeListener = function (el, eventType, fn) {
    var eventManageId = getFlag(el, EVENT_DOM_ID_KEY);

    if (!eventManageId) {
        return;
    }

    var proxyId = getListenerProxyId(el, eventType, fn);
    var proxy = fn[proxyId];

    object.each(eventManageMap[eventManageId], function (_eventType, listeners) {
        if (_eventType === eventType) {
            array.each(listeners, function (index, listener) {
                if (proxy === listener) {
                    eventManageMap[eventManageId][eventType].splice(index, 1);
                    return false;
                }
            });

            return false;
        }
    });
};


/**
 * 移除事件指定类型的所有回调
 * @param el
 * @param eventType
 */
var removeElementEventType = function (el, eventType) {
    var eventManageId = getFlag(el, EVENT_DOM_ID_KEY);

    if (!eventManageId) {
        return;
    }

    object.each(eventManageMap[eventManageId], function (_eventType, listeners) {
        if (_eventType === eventType) {
            eventManageMap[eventManageId][eventType] = [];
            return false;
        }
    });
};


/**
 * 移除元素所有事件
 * @param el
 */
var removeElementEvent = function (el) {
    var eventManageId = getFlag(el, EVENT_DOM_ID_KEY);

    if (!eventManageId) {
        return;
    }

    object.each(eventManageMap[eventManageId], function (_eventType, listeners) {
        eventManageMap[eventManageId][_eventType] = [];
    });
};


var on = function (once, el, eventType, sel, listener) {
    var args = access.args(arguments);

    // on self
    // .on(once, body, 'click', fn);
    if (typeis.Function(args[3])) {
        listener = args[3];
        eachEventTypes(eventType, function (index, _eventType) {
            var specialEvent = specialEvents[_eventType];
            // var displayEvent = specialEvent ? specialEvent.d : _eventType;
            var listenEvent = specialEvent ? specialEvent.l : _eventType;
            var handle = specialEvent ? specialEvent.h : standardHandle;
            var proxyId = getListenerProxyId(el, _eventType, listener);
            var proxy = function (ev) {
                handle.call(this, ev, function (ev) {
                    var targetEl = this;

                    if (once) {
                        removeElementEventTypeListener(el, _eventType, listener);
                    }

                    if (listener.call(targetEl, ev) === false) {
                        ev.preventDefault();
                        ev.stopPropagation();
                        ev.stopImmediatePropagation();
                    }
                });
            };

            listener[proxyId] = proxy;
            manageEvent(el, listenEvent, proxy);
        });
    }
    // delegate
    // .on(once, body, 'click', 'p', fn)
    else if (typeis.Function(args[4])) {
        listener = args[4];
        eachEventTypes(eventType, function (index, _eventType) {
            var specialEvent = specialEvents[_eventType];
            // var displayEvent = specialEvent ? specialEvent.d : _eventType;
            var listenEvent = specialEvent ? specialEvent.l : _eventType;
            var handle = specialEvent ? specialEvent.h : standardHandle;
            var proxyId = getListenerProxyId(el, _eventType, listener);
            var proxy = function (ev) {
                // 查找当前 target 到 selector 的节点
                var closestEl = selector.closest(ev.target, sel)[0];

                if (!closestEl) {
                    return;
                }

                handle.call(closestEl, ev, function (ev) {
                    var targetEl = this;
                    // 如果事件类型相同 && 最近节点存在 && 父子关系
                    if (_eventType === ev.type && targetEl && selector.contains(targetEl, el)) {
                        if (once) {
                            removeElementEventTypeListener(el, _eventType, listener);
                        }

                        if (listener.call(targetEl, ev) === false) {
                            ev.preventDefault();
                            ev.stopPropagation();
                            ev.stopImmediatePropagation();
                        }
                    }
                });
            };
            listener[proxyId] = proxy;
            manageEvent(el, listenEvent, proxy);
        });
    }
};


/**
 * 事件监听
 * @param {Object|Window|HTMLElement|Node} el 元素
 * @param {String} eventType 事件类型
 * @param {String} [sel] 事件委托时的选择器，默认空
 * @param {Function} listener 事件回调 如果事件代理，生成一个相应的属性，保存事件代理的回调
 * @example
 * event.on(el, 'click', fn):
 * event.on(el, 'click', 'li', fn):
 */
exports.on = function (el, eventType, sel, listener) {
    on(false, el, eventType, sel, listener);
};


/**
 * 单次事件监听
 * @param {Object|HTMLElement|Node} el 元素
 * @param {String} eventType 事件类型
 * @param {String} [sel] 事件委托时的选择器，默认空
 * @param {Function} listener 事件回调
 *
 * @example
 * // un capture
 * event.once(ele, 'click', fn, false):
 * event.once(ele, 'click', 'li', fn, false):
 *
 * // is capture
 * event.once(ele, 'click', fn, true):
 * event.once(ele, 'click', 'li', fn, true):
 */
exports.once = function (el, eventType, sel, listener) {
    on(true, el, eventType, sel, listener);
};


/**
 * 移除事件监听
 * @param {Object|window|HTMLElement|Node} el 元素
 * @param {String} [eventType] 事件类型
 * @param {Function} [listener=null] 回调
 *
 * @example
 * // remove one listener
 * event.un(el, 'click', fn);
 * event.un(el, 'click');
 * event.un(el);
 */
exports.un = function (el, eventType, listener) {
    var args = access.args(arguments);
    var argL = args.length;

    // 移除该元素上的所有事件
    // removeEvents(el)
    if (argL === 1) {
        return removeElementEvent(el);
    }

    eachEventTypes(eventType, function (index, _eventType) {
        // 移除指定类型的所有事件
        // removeEvents(el, 'click')
        if (argL === 2 && typeis.String(_eventType)) {
            removeElementEventType(el, _eventType);
        }
        // 移除指定类型的指定回调
        // removeEvents(el, 'click', fn)
        else if (argL === 3 && typeis.Function(listener)) {
            removeElementEventTypeListener(el, _eventType, listener);
        }
    });
};


/**
 * 获得某元素的事件队列长度
 * @param {window|HTMLElement|Node} el 元素
 * @param {String} eventType 单个事件类型
 * @returns {Number} 事件队列长度，最小值为0
 *
 * @example
 * event.length(ele, 'click');
 * // => 0 or more
 */
exports.length = function (el, eventType) {
    var eventManageId = getFlag(el, EVENT_DOM_ID_KEY);

    if (!eventManageId) {
        return 0;
    }

    var manageMap = eventManageMap[eventManageId] = eventManageMap[eventManageId] || {};
    var manageList = manageMap[eventType] = manageMap[eventType] || [];
    return manageList.length;
};


/**
 * 事件创建
 * @param {String} eventType 事件类型
 * @param {Object} [properties] 事件属性
 * @param {Boolean} [properties.bubbles] 是否冒泡，默认 true
 * @param {Boolean} [properties.cancelable] 是否可以被取消冒泡，默认 true
 * @param {Object} [properties.detail] 事件细节，默认{}
 * @returns {Event}
 * @link https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
 *
 * @example
 * event.create('myclick');
 * event.create('myclick', {
 *     bubbles: true,
 *     cancelable: true,
 *     detail: {
 *        a: 1,
 *        b: 2
 *     },
 * });
 */
var create = exports.create = function (eventType, properties) {
    properties = object.assign({}, defaults, properties);

    var ev;
    //var args;
    //var eventTypeIndex = 0;

    ev = new Event(eventType, properties);

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

    return ev;
};


/**
 * 触发事件
 * @param el
 * @param ev
 */
exports.emit = function (el, ev) {
    if (typeis.String(ev)) {
        ev = create(ev);
    }

    el.dispatchEvent(ev);
};


/**
 * 特殊事件
 * @param displayEventType {String} 显示事件类型
 * @param listenEventType {String} 处理事件类型
 * @param handle {Function} 事件处理
 */
var addSpecial = exports.special = function (displayEventType, listenEventType, handle) {
    specialEvents[displayEventType] = {
        d: displayEventType,
        l: listenEventType,
        h: handle
    };
};


object.each({
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
}, function (displayEventType, originEventType) {
    addSpecial(displayEventType, originEventType, function (ev, callback) {
        var target = this;
        var related = ev.relatedTarget;

        // For mouseenter/leave call the handler if related is outside the target.
        // NB: No relatedTarget if the mouse left/entered the browser window
        if (!related || ( related !== target && !selector.contains(related, target) )) {
            var ev2 = {};
            for (var i in ev) {
                try {
                    ev2[i] = ev[i];
                } catch (err) {
                    // ignore
                }
            }
            ev2.type = displayEventType;
            return callback.call(target, ev2);
        }
    });
});

