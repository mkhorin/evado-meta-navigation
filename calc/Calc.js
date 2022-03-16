/**
 * @copyright Copyright (c) 2022 Maxim Khorin (maksimovichu@gmail.com)
 *
 * Examples of calculated expressions
 * See CalcToken for operations
 *
 * ["$+", ".attrName", 22, ...]
 * ["$method", "toLowerCase", "value", ...arguments] - Execute value method
 * ["$moment", "$now", "format", "MM-DD"]
 * ["$duration", "value", "seconds", "humanize"]
 * ["$now"] - Current datetime
 * ["$number"] - Cast to number
 * ["$raw", "$user"] - Output as is
 * ["$round", ".attrName", precision]
 * ["$placeholder", "placeholder", "value"] - Set placeholder if value is empty
 * ["$replace", "source", "target", "value"] - If value is source then replace with target
 *
 * Shortcut expressions
 *
 * "$now"
 * "$moment.$now.format.MM-DD"
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Calc extends Base {

    constructor (config) {
        super(config);
        this.init();
    }

    init () {
        this.token = this.createToken(this.data);
        this.resolve = this.resolveToken;
    }

    createToken (data, config) {
        data = this.normalizeData(data);
        return ClassHelper.spawn(this.getTokenClass(data), {
            ...config,
            calc: this,
            data
        });
    }

    normalizeData (data) {
        if (typeof data !== 'string') {
            return data;
        }
        const first = data.charAt(0);
        if (first === '$') {
            return data.split('.');
        }
        return data;
    }

    getTokenClass (data) {
        if (Array.isArray(data)) {
            switch (data[0]) {
                case '$condition': return CalcCondition;
            }
        }
        return CalcToken;
    }

    resolveToken () {
        return this.token.resolve(...arguments);
    }

    log () {
        CommonHelper.log(this.node, this.constructor.name, ...arguments);
    }
};

const ClassHelper = require('areto/helper/ClassHelper');
const CommonHelper = require('areto/helper/CommonHelper');
const CalcToken = require('./CalcToken');
const CalcCondition = require('./CalcCondition');