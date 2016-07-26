
import Datastore = require("nedb");

export class DataContext implements IDataContext {
    private nedb: Datastore;
    private config: ContextConfig;
    private transOn: boolean;
    private transList: TransQuery[] = [];
    constructor(config: ContextConfig) {
        this.config = config;
        if (!config.IsMulitTabel) {
            this.nedb = new Datastore(config.FilePath + config.DBName);
            this.nedb.loadDatabase();
        }
    }


    async Create(obj: IEntityObject, checkPrimariyKey: boolean = true): Promise<Object> {
        delete (obj as any).ctx;
        let promise;
        if (checkPrimariyKey) {
            let r = await this.checkPrimaryKey(obj);

            if (r) {
                promise = new Promise((resolve, reject) => {
                    this.create_inner(obj).then((r) => {
                        this.pushQuery("create", obj);
                        resolve(r);
                    })
                        .catch(err => {
                            reject(err);
                        })
                });
            }
            else {
                promise = new Promise((resolve, reject) => {
                    reject("重复的主键id:" + obj.id);
                });
            }
        }
        else {
            promise = new Promise((resolve, reject) => {
                this.create_inner(obj).then((r) => {
                    this.pushQuery("create", obj);
                    resolve(r);
                })
                    .catch(err => {
                        reject(err);
                    })
            });

        }


        return promise;
    }
    private checkPrimaryKey(obj: IEntityObject) {
        return new Promise((resolve, reject) => {
            this.Open(obj.toString()).findOne({ id: obj.id }, (err, r) => {
                if (r) {
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            })
        })
    }
    private create_inner(obj: IEntityObject) {
        return new Promise((resolve, reject) => {
            this.Open(obj.toString()).insert(obj, (err, r) => {
                if (err) reject(err);
                else resolve(r);
            });
        });
    }

    async Update(obj: IEntityObject) {
        delete (obj as any).ctx;
        let entity;
        if (this.transOn) {
            entity = await this.getEntity(obj.toString(), obj.id);
            entity.toString = obj.toString;
        }

        return new Promise((resolve, reject) => {
            this.update_inner(obj).then(r => {
                this.pushQuery("update", entity);
                resolve(r);
            }).catch(err => {
                reject(err);
            })
        });
    }
    private async update_inner(obj: IEntityObject) {
        delete (<any>obj)._id;
        let r = await (() => {
            return new Promise((resolve, reject) => {
                this.Open(obj.toString()).update({ id: obj.id }, obj, { upsert: false }, (err, numReplaced: number, upsert) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(obj);
                    }
                });
            })
        })();

        let count = await this.checkCount(obj);
        return r;
    }

    private checkCount(obj: IEntityObject) {
        return new Promise((resolve, reject) => {
            this.Open(obj.toString()).count({ id: obj.id }, (err, r) => {
                if (err) reject(err);
                else resolve(r);
            });
        });
    }
    private getEntity(name, id) {
        return new Promise((resolve, reject) => {
            this.Open(name).findOne({ id: id }, (err, r) => {
                if (err) reject(err);
                else resolve(r);
            });
        });
    }

    async Delete(obj: IEntityObject): Promise<boolean> {
        let entity;
        if (this.transOn) {
            entity = await this.getEntity(obj.toString(), obj.id);
            entity.toString = obj.toString;
        }

        let promise = new Promise<boolean>((resolve, reject) => {
            this.delete_inner(obj).then(() => {
                this.pushQuery("delete", entity);
                resolve(true);
            }).catch(err => {
                reject(err);
            });
        });

        return promise;
    }
    private delete_inner(obj: IEntityObject) {
        let promise = new Promise<boolean>((resolve, reject) => {
            this.Open(obj.toString()).remove({ id: obj.id }, {}, (err, numRemoved) => {
                if (err) reject(err);
                else resolve(true);
            });
        });

        return promise;
    }


    BeginTranscation() {
        this.transOn = true;
    }
    Commit() {
        console.log("Commit this.transOn:", this.transOn);
        if (this.transOn) {
            this.transList = [];
            this.transOn = false;
        };
    }
    Query(qFn: [((p) => Boolean)], tableName: string, queryMode: QueryMode = QueryMode.Normal, orderByFn?, inqObj?): Promise<any> {
        let promise = new Promise((resolve, reject) => {
            let queryFn = {};
            if (qFn) {
                queryFn = {
                    $where: function () {
                        try {
                            let r = true;
                            for (let i = 0; i < qFn.length; i++) {
                                if (!qFn[i](this)) {
                                    r = false;
                                    break;
                                }
                            }

                            return r;
                        } catch (error) {
                            return false;
                        }
                    }
                }
            }
            switch (queryMode) {
                case QueryMode.Normal:
                    this.Open(tableName).find(queryFn, (err, r) => {
                        if (err) reject(err);
                        else resolve(r);
                    });
                    break;
                case QueryMode.Count:
                    this.Open(tableName).count(queryFn, (err, r) => {
                        if (err) reject(err);
                        else resolve(r);
                    });
                    break;
                case QueryMode.First:
                    this.Open(tableName).findOne(queryFn, (err, r) => {
                        if (err) reject(err);
                        else resolve(r);
                    });
                    break;
                case QueryMode.Contains:
                    let inq = {};
                    inq[inqObj.feildName] = {
                        $in: inqObj.value
                    }
                    this.Open(tableName).find(inq, (err, r) => {
                        if (err) reject(err);
                        else resolve(r);
                    });
                    break;
            }
        });

        return promise;
    }

    private dbLinks = [];

    private Open(tbName: string): Datastore {
        if (this.config.IsMulitTabel) {
            let _db = this.dbLinks.find(x => x.key == tbName);
            if (_db) return _db.db;
            else {
                let db: Datastore = new Datastore(this.config.FilePath + tbName + ".db");
                db.loadDatabase();
                this.dbLinks.push({ key: tbName, db: db });
                return db;
            }


        }
        else {
            return this.nedb;
        }

    }

    async RollBack() {
        if (this.transOn) {
            try {
                for (let index = this.transList.length - 1; index >= 0; index--) {
                    let item = this.transList[index];
                    console.log(item);

                    switch (item.key) {
                        case "create":
                            await this.delete_inner(item.entity);
                            break;
                        case "update":
                            await this.update_inner(item.entity);
                            break;
                        case "delete":
                            await this.create_inner(item.entity);
                            break;
                    }
                }
            } catch (error) {
                console.log("回滚失败");
            }
            finally {
                this.transList = [];
            }
        }
    }
    private pushQuery(key, obj) {
        if (this.transOn) {
            this.transList.push({
                key: key,
                entity: obj
            });
        }
    }
}

export enum QueryMode {
    Normal,
    First,
    Count,
    Contains
}

interface ContextConfig {
    IsMulitTabel?: boolean;
    FilePath: string;
    DBName: string
}
interface TransQuery {
    key: string;
    entity: IEntityObject;
}

export function Transaction(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = async function () {
        console.log("BeginTranscation propertyName:", propertyName);
        this.ctx.BeginTranscation();
        let result;
        try {
            result = await method.apply(this, arguments);
            this.ctx.Commit();
            return result;
        } catch (error) {
            console.log("RollBack propertyName:", propertyName);
            await this.ctx.RollBack();

            throw error;
        }
    }
}