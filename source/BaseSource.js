/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class BaseSource extends Base {

    clear () {
        this._data = {
            sections: [],
            nodes: []
        };
    }
    
    isEnableServiceNavigation () {
        return this.meta.enableServiceNavigation;
    }

    getSection (name) {
        return ArrayHelper.searchByProperty(name, 'name', this._data.sections);
    }

    addSection (name) {
        let section = this.getSection(name);
        if (!section) {
            section = {name};
            this._data.sections.push(section);
        }
        return section;
    }

    createServiceNavigation () {
        this.mainSection = this.addSection('main');
        if (this.isEnableServiceNavigation()) {
            this.createBaseServiceNavigation(this.meta.hub.get('base'));
            this.createReportServiceNavigation(this.meta.hub.get('report'));
        }
    }

    createBaseServiceNavigation (meta) {
        if (meta) {
            this.createModelServiceNavigation('_classes', meta.classes.map(item => ({
                name: item.getName(),
                label: item.getTitle(),
                class: item.getName()
            })));
        }
    }

    createReportServiceNavigation (meta) {
        if (meta) {
            this.createModelServiceNavigation('_reports', meta.reports.map(item => ({
                name: item.getName(),
                label: item.getTitle(),
                report: item.getName()
            })));
        }
    }

    createModelServiceNavigation (parent, nodes) {
        if (!nodes.length) {
            return false;
        }
        for (const module of this.hub.moduleNames) {
            const section = this.getSection(`${module}-main`);
            if (section) {
                this.addSectionServiceNodes(section.name, parent, nodes);
            }
        }
        this.addSectionServiceNodes(this.mainSection.name, parent, nodes);
    }

    addSectionServiceNodes (section, parent, nodes) {
        this._data.nodes.unshift(this.getSectionData({
            name: parent,
            section
        }));
        for (let node of nodes) {
            node = this.getNodeData({...node, section, parent});
            node.name = `${parent}-${node.name}`;
            this._data.nodes.push(node);
        }
    }

    getSectionData (data) {
        return {
            ...data
        };
    }

    getNodeData (data) {
        return {
            system: true,
            ...data
        };
    }
};

const ArrayHelper = require('areto/helper/ArrayHelper');