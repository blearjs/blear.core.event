/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var doc = window.document;
var event = require('../src/index.js');
var selector = require('blear.core.selector');

describe('.clone', function () {

    it('.clone(ev)', function (done) {
        var divEl = document.createElement('div');

        event.on(divEl, 'click', function (ev) {
            var ev2 = event.clone(ev);

            expect(ev2.originalEvent).toBe(ev);
            expect(ev2.type).toBe(ev.type);
            expect(ev2).not.toBe(ev);
            done();
        });
        event.emit(divEl, 'click');
    });

});
