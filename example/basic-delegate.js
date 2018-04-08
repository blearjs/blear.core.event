/**
 * 文件描述
 * @author ydr.me
 * @create 2018-04-08 10:49
 * @update 2018-04-08 10:49
 */


'use strict';

var event = require('../src/index');


event.on(document.getElementById('demo'), 'click', 'li', function (ev) {
    ev.preventDefault();
    console.log(this, ev);
});

