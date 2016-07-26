
/**
 * ITableDefine 数据表的结构定义
 * 
*/
interface ITableDefine {
    /**
     * 表名称
     */
    TableName: string;
    /**
     * 索引定义列表
     */
    IndexDefines?: ITableIndexDefine[]
}

/**
 * ITableIndexDefine 数据表结构的索引结构定义
 * example：
 * [
 *   {
 *       TableName: "Person",
 *       IndexDefines: [
 *           {
 *               IndexName: "Id",
 *               FieldName: "Id",
 *               IsUnique: true
 *           }
 *       ]
 *   },
 *   {
 *       TableName: "Account",
 *       IndexDefines: [
 *           {
 *               IndexName: "Id",
 *               FieldName: "Id",
 *               IsUnique: true
 *           }
 *       ]
 *   }
 *]
*/
interface ITableIndexDefine {
    /**
     * 索引名称
     */
    IndexName: string;
    /**
     * 索引对应的字段名称
     */
    FieldName: string;
    /**
     * 是否是Unique
     */
    IsUnique: boolean;
}

/**
 * IIndexedDBDriver indexedDB数据库驱动定义
*/
interface IIndexedDBDriver {
    /**
     * 打开数据库
     * @param  {string} dbName
     * @param  {number} dbVersion
     * @param  {ITableDefine[]} tbsObj
     */
    Open(dbName: string, dbVersion: number, tbsObj: ITableDefine[]): void;
    /**
    * 获取一个事务
    * @param  {[string]} tbNames 表名称列表
    * @param  {DBTranscationModel} mode
    * @returns IDBTransaction
    */
    GetTransaction(tbNames: string[], mode: DBTranscationModel): IDBTransaction;
    /**
     * 获取一个store
     * @param  {string} tbName 表名称
     * @param  {IDBTransaction} trans 事务对象
     * @returns IDBObjectStore 
     */
    GetStore(tbName: string, trans: IDBTransaction): IDBObjectStore;
    /**
     * 获取一个索引
     * @param  {IDBObjectStore} store 
     * @param  {string} indexName
     * @returns IDBIndex
     */
    GetStoreIndex(store: IDBObjectStore, indexName: string): IDBIndex;
    /**
     * 获取一个索引游标
     * @param  {IDBIndex} index
     * @param  {(x:IDBCursor)=>void} fn
     * @param  {IDBKeyRange} range?
     * @returns void
     */
    GetIndexCursor(index: IDBIndex, fn: (x: IDBCursor) => void, range?: IDBKeyRange): void;
    /**
     * 获取一个游标
     * @param  {IDBObjectStore} store
     * @param  {(x:IDBCursor)=>void} fn
     * @param  {IDBKeyRange} range?
     * @returns void
     */
    GetCursor(store: IDBObjectStore, fn: (x: IDBCursor) => void, range?: IDBKeyRange): void;
    GetById(store: IDBObjectStore, value, fn?): void;
    /**
     * 关闭数据库
     */
    Close();
    /**
     * 删除数据库
     * @param  {string} dbName
     * @returns void
     */
    DeleteDataBase(dbName: string): void;
}
/**
 * 实体对象接口定义
*/
interface IEntityObject {
    id: string;
    /**
     * 返回实体名称
     * @returns string
     */
    toString(): string;
}
/**
 * 查询对象接口定义
*/
interface IQueryObject<T> {
    /**
     * 查询，最后通过toList方法提交查询。
     * @param  {(x:T)=>boolean} qFn 查询条件函数
     * @param  {string[]} paramsKey? 参数名称列表
     * @param  {any[]} paramsValue? 参数值列表
     * @returns IQueryObject 查询对象
     */
    Where(qFn: (x: T) => boolean, paramsKey?: string[], paramsValue?: any[]): IQueryObject<T>;
    /**
     * 从集合中查找是否有符合匹配的项，存在任何一项返回true，不存在返回false
     * @param  {(entityObject:T)=>boolean} qFn 查询条件函数
     * @param  {string[]} paramsKey? 参数名称列表
     * @param  {any[]} paramsValue? 参数值列表
     * @param  {(result:boolean)=>void} queryCallback? 结果回调函数
     * @returns boolean
     */
    Any(qFn: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: boolean) => void);
    /**
     * 根据查询条件返回第一项结果，存在返回实体对象，不存在返回null
     * @param  {(entityObject:T)=>boolean} qFn? 查询条件函数
     * @param  {string[]} paramsKey? 参数名称列表
     * @param  {any[]} paramsValue? 参数值列表
     * @param  {(result:T)=>void} queryCallback?  结果回调函数
     * @returns T
     */
    First(qFn?: (entityObject: T) => boolean,
        paramsKey?: string[],
        paramsValue?: any[],
        queryCallback?: (result: T) => void);
    /**
     *  执行查询条件。
     * @param  {(result:T[])=>void} queryCallback? 结果集回调函数
     * @returns T[]
     */
    ToList(queryCallback?: (result: T[]) => void);
    /**
     * 获取查询结果集中的结果条数
     * @param  {(entityObject:T)=>boolean} qFn? 查询条件函数
     * @param  {string[]} paramsKey? 参数名称列表
     * @param  {any[]} paramsValue? 参数值列表
     * @param  {(result:number)=>void} queryCallback? 结果回调函数
     * @returns number
     */
    Count(qFn?: (entityObject: T) => boolean, paramsKey?: string[], paramsValue?: any[], queryCallback?: (result: number) => void);
    /**
     * 查询排序
     * @param  {(x:T)=>void} qFn 查询条件函数
     * @returns IQueryObject 查询对象
     */
    OrderBy(qFn: (x: T) => void): IQueryObject<T>;
    /**
     * 查询排序，倒序
     * @param  {(x:T)=>void} qFn 查询条件函数
     * @returns IQueryObject 查询对象
     */
    OrderByDesc(qFn: (x: T) => void): IQueryObject<T>;
    /**
     * 设置需要查询的字段
     * @param  {(x:T)=>void} qFn 查询条件函数
     * @returns IQueryObject 查询对象
     */
    Select(qFn: (x: T) => void): IQueryObject<T>;
    /**
     * 获取的结果条数
     * @param  {number} count 获取的数目
     * @returns IQueryObject 查询对象
     */
    Take(count: number): IQueryObject<T>;
    /**
     * 跳过的结果条数
     * @param  {number} count 跳过查询的数目
     * @returns IQueryObject 查询对象
     */
    Skip(count: number): IQueryObject<T>;

}

interface DBTranscationModel { }

interface IDataContext {
    Create(obj: IEntityObject);
    Update(obj: IEntityObject);
    Delete(obj: IEntityObject);
    BeginTranscation();
    Commit();
    Query(...args);
}