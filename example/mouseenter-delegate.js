/**
 * 文件描述
 * @author ydr.me
 * @create 2016-06-27 17:34
 */


'use strict';

var event = require('../src/index');
var selector = require('blear.core.selector');

var mouseenterDelegate = function (el, sel) {
    event.on(el, 'mouseover', sel, function (ev) {
        var target = this;
        var related = ev.relatedTarget;

        // For mouseenter/leave call the handler if related is outside the target.
        // NB: No relatedTarget if the mouse left/entered the browser window
        if (!related || ( related !== target && !selector.contains(related, target) )) {
            console.log('mouseenter', target);
        }
    });
};

var ulEl = document.getElementById('demo');
// mouseenterDelegate(ulEl, 'li');
event.on(ulEl, 'mouseenter', 'li', function (ev) {
    console.log('mouseenter', this);
});

