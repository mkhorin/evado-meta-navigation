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
        this.label = this.createLabel();
        this.title = this.data.title || this.label;
        this.description = this.data.description;
        this.opened = this.data.opened;
    }

    isSystem () {
        return this.system;
    }

    isNode () {
        return !this.data.type;
    }

    isContainer () {
        return this.data.type === 'container';
    }

    isDivider () {
        return this.data.type === 'divider';
    }

    isHeader () {
        return this.data.type === 'header';
    }

    getName () {
        return this.name;
    }

    getOption (key, defaults) {
        return NestedHelper.get(key, this.options, defaults);
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

    getParentsChildren () {
        if (!this._parentsChildren) {
            this._parentsChildren = [];
            const parents = this.getParents();
            for (const parent of parents) {
                this._parentsChildren.push(...parent.children);
            }
        }
        return this._parentsChildren;
    }

    toString () {
        return this.id;
    }

    createLabel () {
        if (this.data.label) {
            return this.data.label;
        }
        return MetaHelper.isSystemName(this.name)
            ? this.name
            : StringHelper.generateLabel(this.name);
    }

    build () {
        this.resolveParent();
        this.system = this.system || this.parent?.isSystem();
        this.createFilter();
        this.createProvider();
    }

    resolveParent () {
        if (this.data.parent) {
            this.parent = this.section.getNode(this.data.parent);
            if (this.parent) {
                ObjectHelper.push(this, 'children', this.parent);
            } else {
                this.log('error', `Parent item not found`);
            }
        }
    }

    createFilter () {
        try {
            this.filter = ObjectFilter.create(this.options.filter, this);
        } catch (err) {
            this.log('error', 'Invalid filter', err);
        }
    }

    applyFilter (query) {
        return this.filter?.apply(query)
    }

    createProvider () {
        try {
            this.provider = BaseProvider.create(this.options.provider, this);
        } catch (err) {
            this.log('error', 'Invalid provider', err);
        }
    }

    serializeUrlParams () {
        return this.options.urlParams
            ? `&${UrlHelper.serialize(this.options.urlParams, true)}`
            : '';
    }

    log () {
        CommonHelper.log(this.section.meta, `${this.constructor.name}: ${this.id}`, ...arguments);
    }
};

const CommonHelper = require('areto/helper/CommonHelper');
const NestedHelper = require('areto/helper/NestedHelper');
const ObjectHelper = require('areto/helper/ObjectHelper');
const StringHelper = require('areto/helper/StringHelper');
const MetaHelper = require('../helper/MetaHelper');
const ObjectFilter = require('../filter/ObjectFilter');
const BaseProvider = require('../provider/BaseProvider');
const UrlHelper = require('areto/helper/UrlHelper');