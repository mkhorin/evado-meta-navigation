/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('./BaseSource');

module.exports = class DatabaseSource extends Base {

    constructor (config) {
        super({
            tables: {
                sections: 'meta_navigation_section',
                nodes: 'meta_navigation_node'
            },
            ...config
        });
        this.db = this.meta.getDb();
    }

    async load () {
        this.clear();
        for (const key of Object.keys(this.tables)) {
            this._data[key] = await this.db.find(this.tables[key]);
        }
        return this._data;
    }

    insert (table, data) {
        return this.db.insert(this.tables[table], data);
    }

    delete () {
        return this.dropTables();
    }

    async dropTables () {
        for (const table of Object.values(this.tables)) {
            await this.db.drop(table);
        }
    }
};