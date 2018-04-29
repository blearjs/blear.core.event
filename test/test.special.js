/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var doc = window.document;
var event = require('../src/index.js');
var selector = require('blear.core.selector');

describe('.special', function () {

    it('.special', function (done) {
        event.special('abc', 'click', function (ev, listener) {
            ev.abc = parseInt(ev.timeStamp);
            listener.call(this, ev);
        });

        var divEl = document.createElement('div');
        event.on(divEl, 'abc', function (ev) {
            expect(typeof ev.abc).toBe('number');
            done();
        });

        event.emit(divEl, 'click');
    });

    it('mouseenter', function (done) {
        var divEl = document.createElement('div');

        divEl.innerHTML = '' +
            '<ul>' +
            /**/'<li>' +
            /**//**/'<p>' +
            /**//**//**/'<span></span>' +
            /**//**/'</p>' +
            /**/'</li>' +
            '</ul>';
        doc.body.appendChild(divEl);
        var liEl = divEl.getElementsByTagName('li')[0];
        var pEl = liEl.getElementsByTagName('p')[0];
        var spanEl = pEl.getElementsByTagName('span')[0];
        var evList = [];

        event.on(divEl, 'mouseenter', 'li', function (ev) {
            evList.push(ev);
        });
        event.emit(spanEl, event.create('mouseover', MouseEvent));

        setTimeout(function () {
            document.body.removeChild(divEl);
            expect(evList.length).toBe(1);
            done();
        }, 10);
    });

});
