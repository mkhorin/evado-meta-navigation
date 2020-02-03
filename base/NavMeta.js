/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('evado/component/meta/BaseMetaModel');

module.exports = class NavMeta extends Base {

    constructor (config) {
        super({
            name: 'navigation',
            source: {Class: require('../source/FileSource')},
            enableServiceNavigation: false,
            ...config
        });
        this.createSource(this.source);
    }

    getSection (name, module) {
        return module
            ? this.sections.get(`${module}-${name}`) || this.sections.get(name)
            : this.sections.get(name);
    }

    getNode (id) {
        return this.nodeMap.hasOwnProperty(id) ? this.nodeMap[id] : null;
    }

    afterLoad () {  // after load all meta models
        this.source.createServiceNavigation();
        this.createSections();
        this.createNodes();
        this.createNodeMap();
        this.buildSections();
    }

    createSections () {
        this.sections = new DataMap;
        this.data.sections.forEach(this.createSection, this);
    }

    createSection (data) {
        const {name} = data;
        if (this.sections.has(name)) {
            return this.log('error', `Navigation section already exists: ${name}`);
        }
        this.sections.set(name, new Section({meta: this, data}));
    }

    createNodes () {
        this.data.nodes.forEach(this.createNode, this);
    }

    createNode (data) {
        const {section, name} = data;
        if (!this.sections.has(section)) {
            return this.log('error', `Navigation node: ${name}: Unknown section: ${section}`);
        }
        this.sections.get(section).createNode(data);
    }

    createNodeMap () {
        this.nodeMap = {};
        for (const section of this.sections) {
            for (const node of section.nodes) {
                this.nodeMap[node.id] = node;
            }
        }
    }

    buildSections () {
        this.sections.forEach(section => section.build());
    }
};

const DataMap = require('areto/base/DataMap');
const Section = require('./Section');