/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const {expect} = require('chai');
const Section = require('../../../base/Section');

describe('Section', ()=> {

    it('compareOrder', ()=> {
        const a = {data: {orderNumber: 10}};
        const b = {data: {orderNumber: 20}};
        const c = {data: {orderNumber: 10}};

        expect(Section.compareOrder(a, b)).to.eql(-10);
        expect(Section.compareOrder(b, c)).to.eql(10);
        expect(Section.compareOrder(a, c)).to.eql(0);

        const a2 = {data: {name: 'a'}};
        const b2 = {data: {name: 'b'}};
        const c2 = {data: {name: 'a'}};

        expect(Section.compareOrder(a2, b2)).to.eql(-1);
        expect(Section.compareOrder(b2, c2)).to.eql(1);
        expect(Section.compareOrder(a2, c2)).to.eql(0);
    });
});
/*
return a.data.orderNumber && b.data.orderNumber
    ? (a.data.orderNumber - b.data.orderNumber)
    : (a.data.label || a.data.name).localeCompare(b.data.label || b.data.name);

    */