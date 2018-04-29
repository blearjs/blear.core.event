/**
 * 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var doc = window.document;
var event = require('../src/index.js');
var selector = require('blear.core.selector');

describe('.length', function () {

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

});
