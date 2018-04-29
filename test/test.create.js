/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var doc = window.document;
var event = require('../src/index.js');
var selector = require('blear.core.selector');

describe('.create', function () {

    it('.create(ev)', function (done) {
        var divEl = doc.createElement('div');
        doc.body.appendChild(divEl);
        var times = 0;
        event.create('a');
        event.on(divEl, 'a', function () {
            times++;
        });
        event.emit(divEl, 'a');
        setTimeout(function () {
            expect(times).toBe(1);
            doc.body.removeChild(divEl);
            done();
        }, 10);
    });

    it('.create(ev, Constructor)', function (done) {
        var divEl = doc.createElement('div');
        doc.body.appendChild(divEl);
        var times = 0;
        var ev = null;
        event.on(divEl, 'a', function (_ev) {
            times++;
            ev = _ev;
        });
        event.emit(divEl, event.create('a', MouseEvent));
        setTimeout(function () {
            expect(times).toBe(1);
            expect(ev.type).toBe('a');
            expect(ev.constructor).toBe(MouseEvent);
            doc.body.removeChild(divEl);
            done();
        }, 10);
    });

    it('.create(ev, properties)', function (done) {
        var divEl = doc.createElement('div');
        doc.body.appendChild(divEl);
        var times = 0;
        var ev = null;
        event.on(divEl, 'a', function (_ev) {
            times++;
            ev = _ev;
        });
        event.emit(divEl, event.create('a', {
            bubbles: false
        }));
        setTimeout(function () {
            expect(times).toBe(1);
            expect(ev.type).toBe('a');
            expect(ev.constructor).toBe(Event);
            expect(ev.bubbles).toBe(false);
            doc.body.removeChild(divEl);
            done();
        }, 10);
    });

    it('.create(ev, properties, Constructor)', function (done) {
        var divEl = doc.createElement('div');
        doc.body.appendChild(divEl);
        var times = 0;
        var ev = null;
        event.on(divEl, 'a', function (_ev) {
            times++;
            ev = _ev;
        });
        event.emit(divEl, event.create('a', {
            bubbles: false,
            clientX: 100
        }, MouseEvent));
        setTimeout(function () {
            expect(times).toBe(1);
            expect(ev.type).toBe('a');
            expect(ev.constructor).toBe(MouseEvent);
            expect(ev.bubbles).toBe(false);
            expect(ev.clientX).toBe(100);
            doc.body.removeChild(divEl);
            done();
        }, 10);
    });

});
