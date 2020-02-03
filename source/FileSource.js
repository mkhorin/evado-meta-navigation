/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('./BaseSource');

module.exports = class FileSource extends Base {

    constructor (config) {
        super({
            directory: 'navigation',
            ...config
        });
        this.hub = this.meta.hub;
    }

    async load () {
        this.clear();
        await this.loadNavigation();
        return this._data;
    }

    async loadNavigation () {
        const dir = this.meta.getPath(this.directory);
        const files = await FileHelper.readDirectory(dir);
        for (const file of FileHelper.filterJsonFiles(files)) {
            try {
                const data = await FileHelper.readJsonFile(path.join(dir, file));
                data.name = FileHelper.getBasename(file);
                this.addNodes(data);
                delete data.nodes;
                this._data.sections.push(data);
            } catch (err) {
                this.meta.log('error', `Invalid JSON: ${path.join(dir, file)}`, err);
            }

        }
    }

    addNodes ({name, nodes}) {
        if (Array.isArray(nodes)) {
            for (const node of nodes) {
                node.section = name;
                this._data.nodes.push(node);
            }
        }
    }
};

const path = require('path');
const FileHelper = require('areto/helper/FileHelper');