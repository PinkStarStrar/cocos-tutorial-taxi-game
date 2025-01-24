import { _decorator, Component, Node, Label, log } from "cc";
import { CustomEventListener } from "../data/CustomEventListener";
import { Constants } from "../data/Constants";
import { UpdateLabelValue } from "../data/UpdateLabelValue";
const { ccclass, property } = _decorator;

@ccclass("LoadingUI")
export class LoadingUI extends Component {
    @property({
        type: UpdateLabelValue
    })
    public progressLabel: UpdateLabelValue = null!;
    @property({
        type: Label
    })
    public tipLabel: Label = null!;
    private _progress = 0;

    public onEnable(){
        // 仅注册事件
        CustomEventListener.on(Constants.EventName.UPDATE_PROGRESS, this.updateProgress, this);
    }

    public onDisable(){
        CustomEventListener.off(Constants.EventName.UPDATE_PROGRESS, this.updateProgress, this);
    }

    public show(start = 0){
        this.node.active = true;
        //进度条
        this._progress = start;
        // 初始化进度条
        this.progressLabel.playUpdateValue(this._progress, this._progress, 0);
    }

    private updateProgress(value: number, tips?: string){
        // 更新进度条
        this.progressLabel.playUpdateValue(this._progress, this._progress + value, 0.2);
        this._progress += value;
        if (tips) {
            this.tipLabel.string = tips;
        }
    }

    public finishLoading(){
        this.progressLabel.playUpdateValue(this._progress, 100, 0.2);
        this._progress = 100;
        this.scheduleOnce(this._hide, 0.5);
    }

    private _hide(){
        this.node.active = false;
        // 节点被禁用，删除事件
    }

}
