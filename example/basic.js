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

var f1 = function () {
    console.log('f1');
};
var f2 = function () {
    console.log('f2');
};
var f3 = function () {
    console.log('f3');
};
var f4 = function () {
    console.log('f4');
};

event.on(document.getElementById('demo'), 'click', f1);
event.on(document.getElementById('demo'), 'click', f2);
event.once(document.getElementById('demo'), 'click', f3);
event.on(document.getElementById('demo'), 'click', f4);

event.on(document.getElementById('btn1'), 'click', function () {
    event.un(document.getElementById('demo'), 'click', f1);
});
event.on(document.getElementById('btn2'), 'click', function () {
    event.un(document.getElementById('demo'), 'click');
});
event.on(document.getElementById('btn3'), 'click', function () {
    event.un(document.getElementById('demo'), 'click', f3);
});

// event.on(document.getElementById('demo'), 'click', 'li', function (ev) {
//     console.log(this, ev);
// });

