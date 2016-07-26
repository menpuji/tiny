"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const index_1 = require('../index');
class User extends index_1.EntityObject {
    toString() { return "User"; }
}
exports.User = User;
class Employee extends index_1.EntityObject {
    toString() { return "Employee"; }
}
class TestDemoDataContext extends index_1.DataContext {
    constructor() {
        super({ FilePath: './db/', DBName: "clerkDB.db", IsMulitTabel: true });
        this._user = new User(this);
        this._employee = new Employee(this);
    }
    get User() { return this._user; }
    get Employee() { return this._employee; }
}
function query() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDemoDataContext();
        try {
            let t = new tt();
        }
        catch (err) {
            console.log("nmnnnnnnnnnnnnnnnn:" + err);
            throw new Error(err);
        }
        yield ctx.User.First();
        // let t = new tt();
        // await t.xx("123")
    });
}
class tt {
    constructor() {
        this.ctx = new TestDemoDataContext();
    }
    xx(pp) {
        return __awaiter(this, void 0, void 0, function* () {
            let u = new User();
            u.mobile = "15908101316";
            u.email = "lp@qq.com";
            u.name = "牛魔王";
            u.password = "202cb962ac59075b964b07152d234b70";
            u.id = "3d07e702-d750-46c6-8791-60bc6f76fcc4";
            yield this.ctx.Create(u);
            let rr = yield this.ctx.User.First(x => x.id == "3d07e702-d750-46c6-8791-60bc6f76fcc4");
            rr.name = pp;
            yield this.ctx.Update(rr);
            //await this.ctx.Delete(rr);
            throw "人为抛出异常xx（）方法";
        });
    }
}
__decorate([
    index_1.Transaction, 
    __metadata('design:type', Function), 
    __metadata('design:paramtypes', [String]), 
    __metadata('design:returntype', void 0)
], tt.prototype, "xx", null);
//query();
function GetGuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "";
    var uuid = s.join("");
    return uuid;
}
// import {DataSyncAddEventHandler, DataSyncEventListener }  from "../dataSyncEventListener";
let list = [];
function CreateTest() {
    return __awaiter(this, void 0, void 0, function* () {
        let ctx = new TestDemoDataContext();
        for (let index = 0; index < 100; index++) {
            let u = new User();
            u.mobile = "15908101316";
            u.email = "lp@qq.com";
            u.name = "牛魔王" + index;
            u.password = "202cb962ac59075b964b07152d234b70";
            u.id = GetGuid();
        }
        for (let index = 0; index < 100; index++) {
            let u = new User();
            u.mobile = "15908101316";
            u.email = "lp@qq.com";
            u.name = "孙悟空" + index;
            u.password = "202cb962ac59075b964b07152d234b70";
            u.id = GetGuid();
        }
        // let count = await ctx.User.Count();
        // console.log(count);
    });
}
// let handler = new DataSyncAddEventHandler((sender, args) => {
//     let ctx = new TestDemoDataContext();
//     // console.log(args);
//     list.push({ isop: false, obj: args });
//     //await ctx.Create(args);
// });
// DataSyncEventListener.Current.RegistEvent(handler);
// function insert() {
//     setInterval(async () => {
//         let ctx = new TestDemoDataContext();
//         for (let item of list) {
//             if (!item.isop) {
//                 await ctx.Create(item.obj);
//                 console.log(item);
//                 item.isop = true;
//             }
//         }
//     }, 500);
// }
CreateTest();
insert();
//# sourceMappingURL=test.js.map