import { _decorator, Component, Node, Prefab, instantiate } from "cc";
const { ccclass, property } = _decorator;

// 对象池管理
@ccclass("PoolManager")
export class PoolManager {
    public static handle = new Map<string, Node[]>() ;

    public static getNode(prefab: Prefab, parent: Node) {
        const name = prefab.data.name;
        let node: Node = null;
        const pool = this.handle.get(name);
        if (this.handle.has(name) && pool.length > 0) {
            node = this.handle.get(name).pop();
        } else {
            node = instantiate(prefab) as Node;
        }

        node.setParent(parent);
        return node;
    }

    public static setNode(target: Node) {
        const name = target.name;
        
        //先与父节点解绑 
        target.parent = null;
        
        if (this.handle.has(name)) {
            this.handle.get(name).push(target);
        } else {
            if (name.length > 0) {
                // 不仅设置了，也保证只有一个
                this.handle.set(name, [target]);
            } else {
                // 拿不到name说明不需要这个node，直接销毁
                target.destroy();
            }
        }
    }
}
