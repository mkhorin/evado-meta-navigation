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
        this.idAttr = this.data.idAttr;
        this.nameAttr = this.data.nameAttr;
        this.descriptionAttr = this.data.descriptionAttr;
        this.baseMeta = this.module.getBaseMeta();
        this.init();
    }

    init () {
        this.setMetaClass();
        this.setMetaView();
    }

    setMetaClass () {
        this.metaClass = this.baseMeta.getClass(this.data.class);
        if (!this.metaClass) {
            this.log('error', `Class not found: ${this.data.class}`);
        }
    }

    setMetaView () {
        if (!this.data.view) {
            this.metaView = this.metaClass;
            return;
        }
        this.metaView = this.metaClass?.getView(this.data.view);
        if (!this.metaView) {
            this.log('error', `View not found: ${this.data.view}`);
        }
    }

    async resolveNode (params) {
        const id = params?.request[DynamicNode.OBJECT_ID_PARAM];
        const query = await this.resolveQuery(this.find(), params);
        if (!query) {
            return null;
        }
        const item = await query.byId(id).one();
        return item ? this.createNode(item) : null;
    }

    async resolveNodes (params) {
        const query = await this.resolveQuery(this.find(), params);
        if (!query) {
            return [];
        }
        const items = await query.all();
        return items.map(this.createNode, this);
    }

    find () {
        return this.metaView?.find();
    }

    async resolveQuery (query, params) {
        const rbac = params?.controller?.module.getRbac();
        if (!query || !rbac) {
            return query;
        }
        const access = await this.resolveAccess(rbac, query.view, params);
        if (!access.canRead()) {
            query.and(['false']);
        }
        await access.assignObjectFilter(query);
        return query;
    }

    resolveAccess (rbac, view, params) {
        return rbac.resolveAccess(params.controller.user.assignments, {
            targetType: rbac.TARGET_VIEW,
            target: view,
            actions: [rbac.READ]
        }, params);
    }

    createNode (model) {
        const id = this.idAttr
            ? model.get(this.idAttr)
            : model.getId();
        const label = this.nameAttr
            ? model.get(this.nameAttr)
            : model.header.resolve();
        const description = this.descriptionAttr
            ? model.get(this.descriptionAttr)
            : null;
        return new DynamicNode({
            objectId: id,
            label: label || id,
            translationKey: this.metaView.translationKey,
            provider: this,
            description,
            model
        });
    }

    log () {
        CommonHelper.log(this.node, this.constructor.name, ...arguments);
    }
};

const ClassHelper = require('areto/helper/ClassHelper');
const CommonHelper = require('areto/helper/CommonHelper');
const DynamicNode = require('./DynamicNode');