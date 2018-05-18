/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var doc = window.document;
var event = require('../src/index.js');
var selector = require('blear.core.selector');

describe('.on', function () {

    it('.on:3', function (done) {
        var divEl = doc.createElement('div');
        doc.body.appendChild(divEl);

        event.on(divEl, 'click', function (ev) {
            expect(ev.type).toEqual('click');
            doc.body.removeChild(divEl);
            done();
        });

        event.emit(divEl, 'click');
    });

    it('.on:4 options:object', function (done) {
        var divEl = doc.createElement('div');

        divEl.innerHTML = '' +
            '<ul>' +
            /**/'<li>' +
            /**//**/'<p>' +
            /**//**//**/'<button>click me</button>' +
            /**//**/'</p>' +
            /**/'</li>' +
            '</ul>';
        doc.body.appendChild(divEl);
        var btnEl = divEl.getElementsByTagName('button')[0];

        event.on(divEl, 'click', function (ev) {
            // 捕获阶段
            expect(ev.eventPhase).toBe(1);
            expect(this.tagName).toEqual('DIV');
            expect(ev.type).toEqual('click');
            doc.body.removeChild(divEl);
            done();
        }, {
            capture: true
        });

        event.emit(btnEl, 'click');
    });

    it('.on:4 options:boolean', function (done) {
        var divEl = doc.createElement('div');

        divEl.innerHTML = '' +
            '<ul>' +
            /**/'<li>' +
            /**//**/'<p>' +
            /**//**//**/'<button>click me</button>' +
            /**//**/'</p>' +
            /**/'</li>' +
            '</ul>';
        doc.body.appendChild(divEl);
        var btnEl = divEl.getElementsByTagName('button')[0];

        event.on(divEl, 'click', function (ev) {
            // 捕获阶段
            expect(ev.eventPhase).toBe(1);
            expect(this.tagName).toEqual('DIV');
            expect(ev.type).toEqual('click');
            doc.body.removeChild(divEl);
            done();
        }, true);

        event.emit(btnEl, 'click');
    });

    it('.on:4 function', function (done) {
        var divEl = doc.createElement('div');

        divEl.innerHTML = '' +
            '<ul>' +
            /**/'<li>' +
            /**//**/'<p>' +
            /**//**//**/'<button>click me</button>' +
            /**//**/'</p>' +
            /**/'</li>' +
            '</ul>';
        doc.body.appendChild(divEl);
        var btnEl = divEl.getElementsByTagName('button')[0];

        event.on(divEl, 'click', 'p', function (ev) {
            expect(this.tagName).toEqual('P');
            expect(ev.type).toEqual('click');
            doc.body.removeChild(divEl);
            done();
        });

        event.emit(btnEl, 'click');
    });

    it('.on:5', function (done) {
        var divEl = document.createElement('div');

        divEl.innerHTML = '' +
            '<ul>' +
            /**/'<li>' +
            /**//**/'<p>' +
            /**//**//**/'<button>click me</button>' +
            /**//**/'</p>' +
            /**/'</li>' +
            '</ul>';
        doc.body.appendChild(divEl);
        var btnEl = divEl.getElementsByTagName('button')[0];

        event.on(divEl, 'click', 'li', function (ev) {
            // 捕获阶段
            expect(ev.eventPhase).toBe(1);
            expect(this.tagName).toEqual('LI');
            expect(ev.type).toEqual('click');
            doc.body.removeChild(divEl);
            done();
        }, true);

        event.emit(btnEl, 'click');
    });

    it('.on preventDefault', function (done) {
        var divEl = document.createElement('div');
        var evList = [];

        event.on(divEl, 'click', function (ev) {
            evList.push(ev);
            ev.preventDefault();
        });

        event.on(divEl, 'click', function (ev) {
            evList.push(ev);
        });

        event.emit(divEl, 'click');

        setTimeout(function () {
            expect(evList.length).toBe(2);
            expect(evList[0].defaultPrevented).toBe(true);
            expect(evList[1].defaultPrevented).toBe(true);
            done();
        }, 10);
    });

    it('.on stopPropagation', function (done) {
        var divEl = document.createElement('div');

        document.body.appendChild(divEl);
        var evList = [];

        event.on(divEl, 'click', function (ev) {
            ev.stopPropagation();
            evList.push(ev);
        });

        event.on(document.body, 'click', function (ev) {
            evList.push(ev);
        });

        event.emit(divEl, event.create('click', MouseEvent));

        setTimeout(function () {
            expect(evList.length).toBe(1);
            document.body.removeChild(divEl);
            done();
        }, 10);
    });

    it('.on stopImmediatePropagation', function (done) {
        var divEl = document.createElement('div');
        var evList = [];

        event.on(divEl, 'click', function (ev) {
            evList.push(ev);
            ev.stopImmediatePropagation();
        });

        event.on(divEl, 'click', function (ev) {
            evList.push(ev);
        });

        event.emit(divEl, 'click');

        setTimeout(function () {
            expect(evList.length).toBe(1);
            done();
        }, 10);
    });

    it('.on return false', function (done) {
        var divEl = document.createElement('div');
        var evList = [];

        event.on(divEl, 'click', function (ev) {
            evList.push(ev);
            return false;
        });

        event.on(divEl, 'click', function (ev) {
            evList.push(ev);
        });

        event.on(divEl, 'click', function (ev) {
            evList.push(ev);
        });

        event.emit(divEl, 'click');

        setTimeout(function () {
            expect(evList.length).toBe(1);
            expect(evList[0].defaultPrevented).toBe(true);
            done();
        }, 10);
    });

    it('on window', function (done) {
        var evList = [];
        event.on(window, 'a', function (ev) {
            evList.push(ev);
        });
        event.emit(window, 'a');
        setTimeout(function () {
            expect(evList.length).toBe(1);
            expect(evList[0].type).toBe('a');
            done();
        }, 10);
    });

    it('bind multiple eventType in same dom', function (done) {
        var divEl = doc.createElement('div');
        doc.body.appendChild(divEl);
        var click1Times = 0;
        var click2Times = 0;
        var mouseover1Times = 0;
        var mouseover2Times = 0;

        event.on(divEl, 'click', function () {
            click1Times++;
        });
        event.on(divEl, 'click', function () {
            click2Times++;
        });
        event.on(divEl, 'mouseover', function () {
            mouseover1Times++;
        });
        event.on(divEl, 'mouseover', function () {
            mouseover2Times++;
        });

        event.emit(divEl, 'click');
        event.emit(divEl, 'click');
        event.emit(divEl, 'mouseover');
        event.emit(divEl, 'mouseover');
        event.un(divEl, 'click');
        event.un(divEl, 'mouseover');
        event.emit(divEl, 'click');
        event.emit(divEl, 'click');
        event.emit(divEl, 'mouseover');
        event.emit(divEl, 'mouseover');

        setTimeout(function () {
            expect(click1Times).toEqual(2);
            expect(click2Times).toEqual(2);
            expect(mouseover1Times).toEqual(2);
            expect(mouseover2Times).toEqual(2);
            doc.body.removeChild(divEl);
            done();
        }, 100);
    });

    it('multiple delegate', function (done) {
        var divEl = document.createElement('div');
        var class0 = 'button-' + Date.now();
        var class1 = 'button-' + Date.now();

        divEl.innerHTML = '' +
            '<ul>' +
            /**/'<li>' +
            /**//**/'<button class="' + class0 + '"></button>' +
            /**/'</li>' +
            '</ul>' +
            '<p>' +
            /**/'<button class="' + class1 + '"></button>' +
            '</p>';
        doc.body.appendChild(divEl);
        var buttonEls = divEl.getElementsByTagName('button');
        var button0El = buttonEls[0];
        var button1El = buttonEls[1];
        var targetList = [];
        var time0 = 0;
        var time1 = 0;

        event.on(divEl, 'click', 'li button', function (ev) {
            targetList.push(this);
            time0 = parseInt(ev.timeStamp);
        });
        event.on(divEl, 'click', 'p button', function (ev) {
            targetList.push(this);
            time1 = parseInt(ev.timeStamp);
        });

        event.emit(button0El, 'click');

        setTimeout(function () {
            event.emit(button1El, 'click');
        }, 10);

        setTimeout(function () {
            expect(targetList.length).toBe(2);
            expect(targetList[0].className).toBe(class0);
            expect(targetList[1].className).toBe(class1);
            expect(time0).toBeGreaterThan(0);
            expect(time1).toBeGreaterThan(0);
            expect(time1).toBeGreaterThan(time0);
            document.body.removeChild(divEl);
            done();
        }, 30);
    });

    it('.once', function (done) {
        var divEl = doc.createElement('div');
        divEl.innerHTML = '<p>1</p>';
        doc.body.appendChild(divEl);
        var pEl = selector.query('p', divEl)[0];

        var times1 = 0;
        var fn1 = function () {
            times1++;
        };

        event.once(divEl, 'click', fn1);
        event.emit(divEl, 'click');
        expect(times1).toEqual(1);

        event.emit(divEl, 'click');
        expect(times1).toEqual(1);

        event.once(divEl, 'click', 'p', fn1);
        event.emit(pEl, 'click');
        expect(times1).toEqual(2);

        event.emit(pEl, 'click');
        expect(times1).toEqual(2);

        doc.body.removeChild(divEl);
        done();
    });

    it('.once:4 options:object', function (done) {
        var divEl = doc.createElement('div');

        divEl.innerHTML = '' +
            '<ul>' +
            /**/'<li>' +
            /**//**/'<p>' +
            /**//**//**/'<button>click me</button>' +
            /**//**/'</p>' +
            /**/'</li>' +
            '</ul>';
        doc.body.appendChild(divEl);
        var btnEl = divEl.getElementsByTagName('button')[0];
        var times = 0;
        var tagNameList = [];

        event.once(divEl, 'click', function (ev) {
            times++;
            tagNameList.push(this.tagName.toUpperCase());
        }, {
            capture: true
        });

        event.emit(btnEl, 'click');
        event.emit(btnEl, 'click');

        setTimeout(function () {
            doc.body.removeChild(divEl);
            expect(times).toBe(1);
            expect(tagNameList.length).toBe(1);
            expect(tagNameList[0]).toBe('DIV');
            done();
        }, 10);
    });

    it('.once:4 options:boolean', function (done) {
        var divEl = doc.createElement('div');

        divEl.innerHTML = '' +
            '<ul>' +
            /**/'<li>' +
            /**//**/'<p>' +
            /**//**//**/'<button>click me</button>' +
            /**//**/'</p>' +
            /**/'</li>' +
            '</ul>';
        doc.body.appendChild(divEl);
        var btnEl = divEl.getElementsByTagName('button')[0];
        var times = 0;
        var tagNameList = [];

        event.once(divEl, 'click', function (ev) {
            times++;
            tagNameList.push(this.tagName.toUpperCase());
        }, {
            capture: true
        });

        event.emit(btnEl, 'click');
        event.emit(btnEl, 'click');

        setTimeout(function () {
            doc.body.removeChild(divEl);
            expect(times).toBe(1);
            expect(tagNameList.length).toBe(1);
            expect(tagNameList[0]).toBe('DIV');
            done();
        }, 10);
    });

    it('.once:5', function (done) {
        var divEl = doc.createElement('div');

        divEl.innerHTML = '' +
            '<ul>' +
            /**/'<li>' +
            /**//**/'<p>' +
            /**//**//**/'<button>click me</button>' +
            /**//**/'</p>' +
            /**/'</li>' +
            '</ul>';
        doc.body.appendChild(divEl);
        var btnEl = divEl.getElementsByTagName('button')[0];
        var times = 0;
        var tagNameList = [];

        event.once(divEl, 'click', 'li', function (ev) {
            times++;
            tagNameList.push(this.tagName.toUpperCase());
        }, {
            capture: true
        });

        event.emit(btnEl, 'click');
        event.emit(btnEl, 'click');

        setTimeout(function () {
            doc.body.removeChild(divEl);
            expect(times).toBe(1);
            expect(tagNameList.length).toBe(1);
            expect(tagNameList[0]).toBe('LI');
            done();
        }, 10);
    });

    it('.on more types', function (done) {
        var divEl = document.createElement('div');
        doc.body.appendChild(divEl);
        var fn = function() {
            // ignore
        };

        event.on(divEl, 'a b c', fn);
        event.on(divEl, 'a b d', fn);
        event.on(divEl, ' a b d ', fn);

        expect(event.length(divEl, 'a')).toEqual(3);
        expect(event.length(divEl, 'b')).toEqual(3);
        expect(event.length(divEl, 'c')).toEqual(1);
        expect(event.length(divEl, 'd')).toEqual(2);
        doc.body.removeChild(divEl);
        done();
    });
});
