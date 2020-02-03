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
        this.title = MetaHelper.createTitle(this);
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

    getTitle () {
        return this.title;
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
        }
        this.children.sort(Node.compareOrder);
    }
};

const DataMap = require('areto/base/DataMap');
const MetaHelper = require('../helper/MetaHelper');
const Node = require('./Node');