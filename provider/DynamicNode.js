/**
 * @copyright Copyright (c) 2022 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class DynamicNode extends Base {

    static getConstants () {
        return {
            OBJECT_ID_PARAM: 'id'
        };
    }

    constructor () {
        super(...arguments);
        this.source = this.provider.node;
        this.id = this.source.id;
        this.name = this.source.name;
        this.data = this.source.data;
        this.title = this.label;
        this.options = this.source.options;
    }

    getParentsChildren () {
        return this.source.getParentsChildren();
    }

    getParents () {
        return this.source.getParents();
    }

    serializeUrlParams () {
        return `&${this.OBJECT_ID_PARAM}=${this.objectId}${this.source.serializeUrlParams()}`;
    }
};
module.exports.init();