/**
 * 文件描述
 * @author ydr.me
 * @create 2018-04-04 16:32
 * @update 2018-04-04 16:32
 */


'use strict';

var event = require('../src/index');

var demoEl = document.getElementById('demo');

event.on(demoEl, 'click', 'li button', function (ev) {
    console.log('li button', this, ev);
});

event.on(demoEl, 'click', 'p button', function (ev) {
    console.log('p button', this, ev);
});
