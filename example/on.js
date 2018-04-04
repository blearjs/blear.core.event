/**
 * 文件描述
 * @author ydr.me
 * @create 2018-04-04 16:32
 * @update 2018-04-04 16:32
 */


'use strict';

var event = require('../src/index');

// document.getElementById('demo').addEventListener('click', function (ev) {
//     // ev.preventDefault();
//     // ev.stopPropagation();
//     ev.stopImmediatePropagation();
//     alert('1：你点击了我');
// });
//
// document.getElementById('demo').addEventListener('click', function (ev) {
//     alert('2：你点击了我');
// });

event.on(document.getElementById('demo'), 'click', function () {
    alert('1：你点击了我');
    return false;
});

event.on(document.getElementById('demo'), 'click', function () {
    alert('2：你点击了我');
});

