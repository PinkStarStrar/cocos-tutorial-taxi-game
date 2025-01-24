import { _decorator, Component, Node, Touch, EventTouch, Vec3, loader, JsonAsset, BoxCollider } from "cc";
import { MapManager } from "./MapManager";
import { CarManager } from "./CarManager";
import { AudioManager } from "./AudioManager";
import { Constants } from "../data/Constants";
import { CustomEventListener } from "../data/CustomEventListener";
import { UIManager } from "../ui/UIManager";
import { RunTimeData, PlayerData } from "../data/GameData";
import { LoadingUI } from "../ui/LoadingUI";
import { Configuration } from "../data/Configuration";
import { ResUtil } from "../data/ResUtil";
const { ccclass, property } = _decorator;

// 作者将GameContrl放在了canvas上

@ccclass("GameCtrl")
export class GameCtrl extends Component {
    @property({
        type: MapManager,
    })
    public mapManager: MapManager = null!;

    @property({
        type: CarManager
    })
    public carManager: CarManager = null!;

    @property({
        type: Node,
    })
    public group: Node = null!;

    @property({
        type: LoadingUI
    })
    public loadingUI: LoadingUI = null!;

    // private _progress = 5;
    private _runtimeData: RunTimeData = null!;
    private _lastMapID = 0;
    private _init = false;

    public onEnable(){
        // 只进行这一次的初始化
        // GameRoot回避GameCtrl更显调用，不知道否因为预制体层级关系中，GameRoot更高
        // 这里初始化游戏数据，配置数据，玩家数据，加载UI，加载地图
        if(!this._init){
            //关于存储游戏数据的脚本
            this._runtimeData = RunTimeData.instance();
            Configuration.instance().init();
            PlayerData.instance().loadFromCache();
           
            // 主要是进度条展示
            this.loadingUI.show();
           
            // 根据关卡等级获得地图id
            this._lastMapID = this._runtimeData.currLevel;
            this._loadMap(this._lastMapID);

            //对于碰撞组的设置
            const collider = this.group.getComponent(BoxCollider)!;
            collider.setGroup(Constants.CarGroup.NORMAL);
            collider.setMask(-1);
            this._init = true;
        }
    }

    // onEnable再start之前被调用
    public start(){
        // Q: 应该是展示对白的
        UIManager.showDialog(Constants.UIPage.mainUI);

        
        this.node.on(Node.EventType.TOUCH_START, this._touchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this._touchEnd, this);

        // 这里涉及到不止对代码架构的理解，还有对于游戏的理解

        // 游戏的开始
        CustomEventListener.on(Constants.EventName.GAME_START, this._gameStart, this);

        // 关卡失败->游戏的结束，游戏的结束 这里耦合了关卡失败和游戏结束
        CustomEventListener.on(Constants.EventName.GAME_OVER, this._gameOver, this);
        // 关卡获胜
        CustomEventListener.on(Constants.EventName.NEW_LEVEL, this._newLevel, this);

        AudioManager.playMusic();
    }

    private _touchStart(touch: Touch, event: EventTouch) {
        // F:之后修改成按键控制，或者是屏幕滑动控制
        // 控制车辆移动
        this.carManager.controlMoving();
    }

    private _touchEnd(touch: Touch, event: EventTouch) {
        this.carManager.controlMoving(false);
    }

    private _gameStart(){
        UIManager.hideDialog(Constants.UIPage.mainUI);
        UIManager.showDialog(Constants.UIPage.gameUI);
    }

    private _gameOver(){
        UIManager.hideDialog(Constants.UIPage.gameUI);
        UIManager.showDialog(Constants.UIPage.resultUI);
    }

    private _newLevel(){
        UIManager.hideDialog(Constants.UIPage.resultUI);
        UIManager.showDialog(Constants.UIPage.mainUI);

        // 最后一关
        if (this._lastMapID === this._runtimeData.currLevel) {
            this._reset();
            return;
        }

        this.mapManager.recycle();
        this.loadingUI.show();
        this._lastMapID = this._runtimeData.currLevel;
        this._loadMap(this._lastMapID);
    }

    private _reset(){
        // this.mapManager.resetMap();
        this.carManager.reset(this.mapManager.currPath);
        const runtimeData = this._runtimeData;
        runtimeData.currProgress = 0;
        runtimeData.maxProgress = this.mapManager.maxProgress;
        runtimeData.money = 0;
    }

    private _loadMap(level: number, cb?: Function){
        ResUtil.getMap(level, (err: any, asset: JsonAsset)=>{
            if(err){
                console.warn(err);
                return;
            }

            CustomEventListener.dispatchEvent(Constants.EventName.UPDATE_PROGRESS, 30, 'Start building a city...');
            this.mapManager.buildMap(asset, () => {
                CustomEventListener.dispatchEvent(Constants.EventName.UPDATE_PROGRESS, 20, 'End building a city...');
                if (cb) {
                    cb();
                }

                this._reset();
                this.loadingUI.finishLoading();
            });
        });
        // let map = 'map/map';
        // if (level >= 100) {
        //     map += `${level}`;
        // } else if (level >= 10) {
        //     map += `1${level}`;
        // } else {
        //     map += `10${level}`;
        // }

        // this._progress = 5;
        // this.scheduleOnce(this._loadingSchedule, 0.2);
        // loader.loadRes(map, Prefab, (err: any, prefab: Prefab) =>{
        //     if(err){
        //         console.warn(err);
        //         return;
        //     }

        //     const mapNode = instantiate(prefab) as Node;
        //     mapNode.parent = this.mapManager.node;
        //     if(cb){
        //         cb();
        //     }

        //     this._progress = 0;
        //     this._reset();
        //     this.loadingUI.finishLoading();
        // })
    }

    // private _loadingSchedule(){
    //     if(this._progress <= 0){
    //         return;
    //     }

    //     this._progress --;
    //     CustomEventListener.dispatchEvent(Constants.EventName.UPDATE_PROGRESS, 40 / 5);
    //     this.scheduleOnce(this._loadingSchedule, 0.2)
    // }
}
