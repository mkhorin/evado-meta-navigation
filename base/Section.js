/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class Section extends Base {

    static sortSectionMap (map) {
        for (const item of Object.values(map)) {
            item.sort(this.compareOrder);
        }
    }

    static compareOrder (a, b) {
        return a.data.orderNumber && b.data.orderNumber
            ? (a.data.orderNumber - b.data.orderNumber)
            : (a.data.label || a.data.name).localeCompare(b.data.label || b.data.name);
    }

    constructor (config) {
        super(config);
        this.name = this.data.name;
        this.id = this.name;
        this.nodes = new DataMap;
        this.label = MetaHelper.createLabel(this);
        this.description = this.data.description;
        this.setBaseName();
        this.translationKey = `nav.${this.baseName}`;
    }

    isBase () {
        return !this.moduleName;
    }

    isModule (name) {
        return this.moduleName ? this.moduleName === name : true;
    }

    getName () {
        return this.name;
    }

    getNode (name) {
        return this.nodes.get(name);
    }

    toString () {
        return this.id;
    }

    createNode (data) {
        if (this.nodes.has(data.name)) {
            return this.meta.log('error', `Node already exists: ${data.name}.${this.name}`);
        }
        this.nodes.set(data.name, new Node({section: this, data}));
    }

    setBaseName () {
        this.baseName = this.name;
        const data = this.meta.splitByModulePrefix(this.name);
        if (data) {
            this.moduleName = data[0];
            this.baseName = data[1];
        }
    }

    build () {
        this.children = [];
        for (const node of this.nodes) {
            if (!node.data.parent) {
                this.children.push(node);
            }
            node.build();
        }
        for (const node of this.nodes) {
            if (node.children) {
                node.children.sort(Node.compareOrder);
            }
            if (node.provider) {
                this.hasDynamicNode = true;
            }
        }
        this.children.sort(Node.compareOrder);
    }

    async getDynamicNodes (items, params) {
        const result = {};
        if (this.hasDynamicNode) {
            for (const item of items) {
                if (item.provider) {
                    result[item.id] = await item.provider.resolveNodes(params);
                }
            }
        }
        return result;
    }

    search (value) {
        const regex = new RegExp(EscapeHelper.escapeRegex(value), 'i');
        const result = [];
        for (const node of this.nodes) {
            if (node.isNode() && regex.test(node.label)) {
                result.push(node);
            }
        }
        return result;
    }

    log () {
        CommonHelper.log(this.meta, `${this.constructor.name}: ${this.id}`, ...arguments);
    }
};

const CommonHelper = require('areto/helper/CommonHelper');
const DataMap = require('areto/base/DataMap');
const EscapeHelper = require('areto/helper/EscapeHelper');
const MetaHelper = require('../helper/MetaHelper');
const Node = require('./Node');