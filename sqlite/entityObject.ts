///<reference path="typings/tinyDB.d.ts" />

import { DataContext } from './dataContext';

/**
 * EntityObject
 */
class EntityObject<T extends IEntityObject> implements IEntityObject, IQueryObject<T> {
    id: string;
    toString(): string { return ""; }
    private ctx: DataContext;
    private sqlTemp = [];
    private queryParam: QueryParams = new Object() as QueryParams;
    constructor(ctx?: DataContext) {
        this.ctx = ctx;
    }
    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[]): IQueryObject<T> {
        var sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        this.sqlTemp.push(sql);
        return this;
    }
    Select(qFn: (x: T) => void): IQueryObject<T> {
        let filed = this.formateCode(qFn);
        this.queryParam.SelectFileds = filed.split("AND");
        return this;
    }
    Any(qFn: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: boolean) => void): boolean {
        let result = this.Count(qFn, paramsKey, paramsValue, (queryCallback as any));
        return result > 0;
    }
    Count(qFn?: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: number) => void): number {
        let sql = "";
        if (qFn) {
            sql = "SELECT COUNT(id) FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        }
        else {
            sql = "SELECT COUNT(id) FROM " + this.toString();
        }

        sql = this.addQueryStence(sql) + ";";

        let r = this.ctx.Query(sql);
        let result = r ? r[0]["COUNT(id)"] : 0;

        return result;
    }
    First(qFn?: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: T) => void): T {
        let sql: string;
        if (qFn) {
            sql = "SELECT * FROM " + this.toString() + " WHERE " + this.formateCode(qFn, paramsKey, paramsValue);
        }
        else {
            sql = "SELECT * FROM " + this.toString();
        }

        this.Skip(0);
        this.Take(1);
        sql = this.addQueryStence(sql) + ";";

        let row = this.ctx.Query(sql);
        return this.clone(row && row['0'], new Object() as T);
    }
    Take(count: number): IQueryObject<T> {
        this.queryParam.TakeCount = count;
        return this;
    }
    Skip(count: number): IQueryObject<T> {
        this.queryParam.SkipCount = count;
        return this;
    }
    OrderBy(qFn: (x: T) => void): IQueryObject<T> {
        var sql = this.formateCode(qFn);
        this.queryParam.OrderByFiledName = sql;
        return this;
    }
    OrderByDesc(qFn: (x: T) => void): IQueryObject<T> {
        this.queryParam.IsDesc = true;
        return this.OrderBy(qFn);
    }
    ToList(queryCallback?: (result: T[]) => void): T[] {
        let row;
        if (this.sqlTemp.length > 0) {
            let sql = this.sqlTemp[0];
            sql = this.addQueryStence(sql) + ";";
            row = this.ctx.Query(sql);
        }
        else {
            let sql = "SELECT * FROM " + this.toString();
            sql = this.addQueryStence(sql) + ";";
            row = this.ctx.Query(sql);
        }
        return this.cloneList(row);
    }
    Max(qFn: (x: T) => void) {

    }
    Min(qFn: (x: T) => void) {

    }
    private formateCode(qFn, paramsKey?: string[], paramsValue?: any[]): string {
        let qFnS = qFn.toString();

        qFnS = qFnS.replace(/function/g, "");
        qFnS = qFnS.replace(/return/g, "");
        qFnS = qFnS.replace(/if/g, "");
        qFnS = qFnS.replace(/else/g, "");
        qFnS = qFnS.replace(/true/g, "");
        qFnS = qFnS.replace(/false/g, "");
        qFnS = qFnS.replace(/\{/g, "");
        qFnS = qFnS.replace(/\}/g, "");
        qFnS = qFnS.replace(/\(/g, "");
        qFnS = qFnS.replace(/\)/g, "");
        qFnS = qFnS.replace(/\;/g, "");
        qFnS = qFnS.trim();
        let p: string = qFnS[0];

        qFnS = qFnS.substring(1, qFnS.length);
        qFnS = qFnS.trim();
        qFnS = qFnS.replace(new RegExp(p, "gm"), this.toString());
        qFnS = qFnS.replace(/\&\&/g, "AND");
        qFnS = qFnS.replace(/\|\|/g, "OR");

        if (paramsKey && paramsValue) {
            if (paramsKey.length != paramsValue.length) throw 'paramsKey,paramsValue 参数异常';
            for (let i = 0; i < paramsKey.length; i++) {
                let v = paramsValue[i];
                if (isNaN) v = "'" + paramsValue[i] + "'";
                qFnS = qFnS.replace(new RegExp(paramsKey[i], "gm"), v);
            }
        }

        return qFnS;
    }
    clone(source: any, destination: T, isDeep: boolean = false): T {
        if (!source) return null;
        for (var key in source) {
            if (typeof (key) != "function") {
                if (isDeep) { }
                else {
                    if (typeof (key) != "object") {
                        destination[key] = source[key];
                    }
                }
            }
        }
        return destination;
    }
    private cloneList(list: [any]): T[] {
        let r: T[] = [];
        list.forEach(x => {
            if (x) r.push(this.clone(x, new Object() as T, false));
        });

        return r;
    }
    private addQueryStence(sql: string): string {
        if (this.queryParam.SelectFileds && this.queryParam.SelectFileds.length > 0) {
            sql = sql.replace(/\*/g, this.queryParam.SelectFileds.join(','));
        }
        if (this.queryParam.OrderByFiledName) {
            sql += " ORDERBY " + this.queryParam.OrderByFiledName;
            if (this.queryParam.IsDesc) sql += " DESC";
        }
        if (this.queryParam.TakeCount && this.queryParam.SkipCount) {
            sql += " LIMIT " + this.queryParam.SkipCount + "," + this.queryParam.TakeCount;
        }
        this.clearQueryParams();
        return sql;
    }
    private clearQueryParams(): void {
        this.queryParam = new Object() as QueryParams;
    }
}

interface QueryParams {
    TakeCount: number;
    SkipCount: number;
    OrderByFiledName: string;
    IsDesc: boolean;
    SelectFileds: string[];
}

export { EntityObject }