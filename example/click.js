/**
 * 文件描述
 * @author ydr.me
 * @create 2018-04-04 16:32
 * @update 2018-04-04 16:32
 */


'use strict';

var event = require('../src/index');

event.on(document.getElementById('demo'), 'click', function () {
    alert('1：你点击了我');
});

event.on(document.getElementById('demo'), 'click', function () {
    alert('2：你点击了我');
});

