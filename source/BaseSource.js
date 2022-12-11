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
            const items = meta.classes.map(item => ({
                name: item.getName(),
                title: item.getTitle(),
                class: item.getName()
            }));
            this.createModelServiceNavigation('_classes', items);
        }
    }

    createReportServiceNavigation (meta) {
        if (meta) {
            const items = meta.reports.map(item => ({
                name: item.getName(),
                title: item.getTitle(),
                report: item.getName()
            }));
            this.createModelServiceNavigation('_reports', items);
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
        const data = this.getSectionData({
            name: parent,
            type: 'container',
            section
        });
        this._data.nodes.unshift(data);
        for (const node of nodes) {
            const data = this.getNodeData({...node, section, parent});
            data.name = `${parent}-${node.name}`;
            data.label = node.name;
            this._data.nodes.push(data);
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