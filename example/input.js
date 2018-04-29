/**
 * 文件描述
 * @author ydr.me
 * @create 2018-04-04 16:32
 * @update 2018-04-04 16:32
 */


'use strict';

var event = require('../src/index');

var inputEl = document.getElementById('input');

window.event = event;

event.on(inputEl, 'change', function () {
    console.log('event: change')
});

event.on(inputEl, 'input', function () {
    console.log('event: input')
});
