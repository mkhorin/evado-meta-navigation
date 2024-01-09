/**
 * @copyright Copyright (c) 2022 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class ObjectFilter extends Base {

    static create (data, node, params) {
        if (data) {
            const {module} = node.section.meta;
            const config = this.prepareSpawn(data, module);
            return ClassHelper.spawn(config, {...params, module, node});
        }
    }

    static prepareSpawn (data, module) {
        return data.Class
            ? ClassHelper.resolveSpawn(data, module)
            : this.getDefaultSpawn(data);
    }

    static getDefaultSpawn (data) {
        return {
            Class: this,
            solver: this.createSolver(data)
        };
    }

    static createSolver (data) {
        return new Calc({
            data: ['$condition', data],
            node: this.node
        });
    }

    async apply (query) {
        query.and(await this.solver.resolve(query));
    }

    log () {
        CommonHelper.log(this.node, this.constructor.name, ...arguments);
    }
};

const ClassHelper = require('areto/helper/ClassHelper');
const Calc = require('../calc/Calc');