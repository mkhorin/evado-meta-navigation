/**
 * @copyright Copyright (c) 2022 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class BaseProvider extends Base {

    static create (data, node) {
        if (data) {
            const module = node.section.meta.module;
            const config = this.prepareSpawn(data, module);
            return ClassHelper.spawn(config, {module, node});
        }
    }

    static prepareSpawn (data, module) {
        return data.Class
            ? ClassHelper.resolveSpawn(data, module)
            : this.getDefaultSpawn(data);
    }

    static getDefaultSpawn (data) {
        return {Class: this, data};
    }

    constructor () {
        super(...arguments);
        this.idAttr = this.data.idAttr || '_id';
        this.labelAttr = this.data.labelAttr || 'name';
        this.descriptionAttr = this.data.descriptionAttr;
        this.baseMeta = this.module.getBaseMeta();
    }

    async resolveNode (params) {
        const id = params[DynamicNode.OBJECT_ID_PARAM];
        const data = await this.find().byId(id).one();
        return this.createNode(data);
    }

    async resolveNodes () {
        const items = await this.find().all();
        return items.map(this.createNode, this);
    }

    find () {
        return this.getView().find().raw();
    }

    getView () {
        const cls = this.baseMeta.getClass(this.data.class);
        return this.data.view
            ? cls.getView(this.data.view)
            : cls;
    }

    createNode (data) {
        return new DynamicNode({
            objectId: data[this.idAttr],
            label: data[this.labelAttr],
            description: data[this.descriptionAttr],
            provider: this
        });
    }

    log () {
        CommonHelper.log(this.node, this.constructor.name, ...arguments);
    }
};

const ClassHelper = require('areto/helper/ClassHelper');
const CommonHelper = require('areto/helper/CommonHelper');
const DynamicNode = require('./DynamicNode');