/**
 * 文件描述
 * @author ydr.me
 * @create 2018-04-04 16:32
 * @update 2018-04-04 16:32
 */


'use strict';

var event = require('../src/index');

var retEl = document.getElementById('ret');
var inputEl = document.getElementById('input');

window.event = event;
event.on(inputEl, 'input', function () {
    retEl.innerText = inputEl.value;
});
