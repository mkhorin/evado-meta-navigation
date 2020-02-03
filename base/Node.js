/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Node extends Base {

    static compareOrder (a, b) {
        if (a.data.orderNumber) {
            return b.data.orderNumber ? a.data.orderNumber - b.data.orderNumber : 1;
        }
        if(!b.data.orderNumber) { // sort by abc
            return (a.data.label || a.data.name).localeCompare(b.data.label || b.data.name);
        }
        return -1;
    }

    static concatChildren (nodes) {
        const result = [];
        for (const node of nodes) {
            if (node.children) {
                result.push(...node.children);
            }
        }
        return result;
    }

    constructor (config) {
        super(config);
        this.name = this.data.name;
        this.id = `${this.name}.${this.section.id}`;
        this.options = this.data.options || {};
        this.system = this.data.system;
        this.translationKey = `${this.section.translationKey}.${this.name}`;
        this.title = this.createTitle();
    }

    isSystem () {
        return this.system;
    }

    getName () {
        return this.name;
    }

    getTitle () {
        return this.title;
    }

    getOption (key, defaults) {
        return NestedValueHelper.get(key, this.options, defaults);
    }

    getParent () {
        return this.parent;
    }

    getParents () {
        if (!this._parents) {
            this._parents = [];
            let item = this.parent;
            while (item) {
                this._parents.push(item);
                item = item.parent;
            }
        }
        return this._parents;
    }

    toString () {
        return this.id;
    }

    createTitle () {
        return MetaHelper.isSystemName(this.name)
            ? this.data.label || this.name
            : MetaHelper.createTitle(this);
    }

    build () {
        if (this.data.parent) {
            this.parent = this.section.getNode(this.data.parent);
            if (this.parent) {
                ObjectHelper.push(this, 'children', this.parent);
            } else {
                this.log('error', `Parent item not found`);
            }
        }
        if (!this.system) {
            this.system = this.parent && this.parent.isSystem();
        }
    }

    log () {
        CommonHelper.log(this.section, `${this.constructor.name}: ${this.id}`, ...arguments);
    }
};

const CommonHelper = require('areto/helper/CommonHelper');
const NestedValueHelper = require('areto/helper/NestedValueHelper');
const ObjectHelper = require('areto/helper/ObjectHelper');
const MetaHelper = require('../helper/MetaHelper');