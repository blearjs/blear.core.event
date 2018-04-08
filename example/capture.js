/**
 * 文件描述
 * @author ydr.me
 * @create 2018-04-08 11:08
 * @update 2018-04-08 11:08
 */


'use strict';

var event = require('../src/index');


event.on(document.getElementById('demo'), 'click', function (ev) {
    console.log('f2', ev, ev.eventPhase);
}, true);

event.on(document.getElementById('demo'), 'click', function (ev) {
    console.log('f1', ev, ev.eventPhase);
}, false);
