/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var doc = window.document;
var event = require('../src/index.js');
var selector = require('blear.core.selector');

describe('blear.core.event unit test', function () {
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

    it('.on:3/.un:1', function (done) {
        var divEl = doc.createElement('div');

        doc.body.appendChild(divEl);

        var times1 = 0;
        var times2 = 0;
        var times3 = 0;
        var fn1 = function () {
            times1++;
        };
        var fn2 = function () {
            times2++;
        };
        var fn3 = function () {
            times3++;
        };

        event.on(divEl, 'click', fn1);
        event.on(divEl, 'click', fn2);
        event.on(divEl, 'click', fn3);

        event.emit(divEl, 'click');
        event.un(divEl);
        event.emit(divEl, 'click');

        expect(times1).toEqual(1);
        expect(times2).toEqual(1);
        expect(times3).toEqual(1);
        doc.body.removeChild(divEl);
        done();
    });

    it('.on:3/.un:2', function (done) {
        var divEl = doc.createElement('div');

        doc.body.appendChild(divEl);

        var times1 = 0;
        var times2 = 0;
        var times3 = 0;
        var fn1 = function () {
            times1++;
        };
        var fn2 = function () {
            times2++;
        };
        var fn3 = function () {
            times3++;
        };

        event.on(divEl, 'click', fn1);
        event.on(divEl, 'click', fn2);
        event.on(divEl, 'click', fn3);

        event.emit(divEl, 'click');
        event.un(divEl, 'click');
        event.emit(divEl, 'click');

        expect(times1).toEqual(1);
        expect(times2).toEqual(1);
        expect(times3).toEqual(1);
        doc.body.removeChild(divEl);
        done();
    });

    it('.on:3/.un:3', function (done) {
        var divEl = doc.createElement('div');

        doc.body.appendChild(divEl);

        var times1 = 0;
        var times2 = 0;
        var times3 = 0;
        var fn1 = function () {
            times1++;
        };
        var fn2 = function () {
            times2++;
        };
        var fn3 = function () {
            times3++;
        };

        event.on(divEl, 'click', fn1);
        event.on(divEl, 'click', fn2);
        event.on(divEl, 'click', fn3);

        event.emit(divEl, 'click');
        event.un(divEl, 'click', fn2);
        event.emit(divEl, 'click');

        setTimeout(function () {
            expect(times1).toEqual(2);
            expect(times2).toEqual(1);
            expect(times3).toEqual(2);
            doc.body.removeChild(divEl);
            done();
        }, 100);
    });

    it('.on:4/.un:1', function (done) {
        var divEl = doc.createElement('div');
        var pEl = doc.createElement('p');

        divEl.appendChild(pEl);
        doc.body.appendChild(divEl);

        var times1 = 0;
        var times2 = 0;
        var times3 = 0;
        var fn1 = function () {
            times1++;
        };
        var fn2 = function () {
            times2++;
        };
        var fn3 = function () {
            times3++;
        };

        event.on(divEl, 'click', 'p', fn1);
        event.on(divEl, 'click', 'p', fn2);
        event.on(divEl, 'click', 'p', fn3);

        event.emit(pEl, 'click');
        event.un(divEl);
        event.emit(pEl, 'click');

        setTimeout(function () {
            expect(times1).toEqual(1);
            expect(times2).toEqual(1);
            expect(times3).toEqual(1);
            doc.body.removeChild(divEl);
            done();
        }, 100);
    });

    it('.on:4/.un:2', function (done) {
        var divEl = doc.createElement('div');
        var pEl = doc.createElement('p');

        divEl.appendChild(pEl);
        doc.body.appendChild(divEl);

        var times1 = 0;
        var times2 = 0;
        var times3 = 0;
        var fn1 = function () {
            times1++;
        };
        var fn2 = function () {
            times2++;
        };
        var fn3 = function () {
            times3++;
        };

        event.on(divEl, 'click', 'p', fn1);
        event.on(divEl, 'click', 'p', fn2);
        event.on(divEl, 'click', 'p', fn3);

        event.emit(pEl, 'click');
        event.un(divEl, 'click');
        event.emit(pEl, 'click');

        setTimeout(function () {
            expect(times1).toEqual(1);
            expect(times2).toEqual(1);
            expect(times3).toEqual(1);
            doc.body.removeChild(divEl);
            done();
        }, 100);
    });

    it('.on:4/.un:3', function (done) {
        var divEl = doc.createElement('div');
        var pEl = doc.createElement('p');

        divEl.appendChild(pEl);
        doc.body.appendChild(divEl);

        var times1 = 0;
        var times2 = 0;
        var times3 = 0;
        var fn1 = function () {
            times1++;
        };
        var fn2 = function () {
            times2++;
        };
        var fn3 = function () {
            times3++;
        };

        event.on(divEl, 'click', 'p', fn1);
        event.on(divEl, 'click', 'p', fn2);
        event.on(divEl, 'click', 'p', fn3);

        event.emit(pEl, 'click');
        event.un(divEl, 'click', fn2);
        event.emit(pEl, 'click');

        setTimeout(function () {
            expect(times1).toEqual(2);
            expect(times2).toEqual(1);
            expect(times3).toEqual(2);
            doc.body.removeChild(divEl);
            done();
        }, 100);
    });

    it('.length', function (done) {
        var divEl1 = doc.createElement('div');
        var divEl2 = doc.createElement('div');

        doc.body.appendChild(divEl1);
        doc.body.appendChild(divEl2);

        var times1 = 0;
        var times2 = 0;
        var times3 = 0;
        var fn1 = function () {
            times1++;
        };
        var fn2 = function () {
            times2++;
        };
        var fn3 = function () {
            times3++;
        };

        event.on(divEl1, 'click', fn1);
        event.on(divEl1, 'click', fn2);
        event.on(divEl1, 'click', fn3);

        event.un(divEl1, 'click', fn2);

        expect(event.length(divEl1, 'click')).toEqual(2);
        expect(event.length(divEl2, 'click')).toEqual(0);
        doc.body.removeChild(divEl1);
        doc.body.removeChild(divEl2);
        done();
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

    it('.once/.un:2', function (done) {
        var divEl = doc.createElement('div');
        doc.body.appendChild(divEl);
        var times = 0;
        event.once(divEl, 'click', function () {
            times++;
        });

        event.un(divEl, 'click');
        event.emit(divEl, 'click');

        setTimeout(function () {
            expect(times).toEqual(0);
            doc.body.removeChild(divEl);
            done();
        }, 100);
    });

    it('.once/.un:3', function (done) {
        var divEl = doc.createElement('div');
        doc.body.appendChild(divEl);
        var time1s = 0;
        var time2s = 0;
        var fn1 = function () {
            time1s++;
        };
        var fn2 = function () {
            time2s++;
        };

        event.once(divEl, 'click', fn1);
        event.once(divEl, 'click', fn2);
        event.un(divEl, 'click', fn1);
        event.emit(divEl, 'click');

        setTimeout(function () {
            expect(time1s).toEqual(0);
            expect(time2s).toEqual(1);
            doc.body.removeChild(divEl);
            done();
        }, 100);
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

        event.un(divEl, 'click');
        event.un(divEl, 'mouseover');
        event.emit(divEl, 'click');
        event.emit(divEl, 'click');
        event.emit(divEl, 'mouseover');
        event.emit(divEl, 'mouseover');

        setTimeout(function () {
            expect(click1Times).toEqual(0);
            expect(click2Times).toEqual(0);
            expect(mouseover1Times).toEqual(0);
            expect(mouseover2Times).toEqual(0);
            doc.body.removeChild(divEl);
            done();
        }, 100);
    });

    it('remove empty on', function (done) {
        var divEl = doc.createElement('div');
        doc.body.appendChild(divEl);
        var fn = function () {

        };
        var called = false;

        try {
            event.un(divEl);
            event.un(divEl, 'click');
            event.un(divEl, 'click', fn);
        } catch (err) {
            called = true;
        }

        expect(called).toEqual(false);
        doc.body.removeChild(divEl);
        done();
    });

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

    it('.clone(ev, type)', function (done) {
        var divEl = document.createElement('div');

        event.on(divEl, 'click', function (ev) {
            var ev2 = event.clone(ev, 'click2');

            expect(ev2.originalEvent).toBe(ev);
            expect(ev2.type).toBe('click2');
            expect(ev2).not.toBe(ev);
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
