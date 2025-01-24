
import { _decorator, Component, AudioSource, assert, game } from 'cc';
import { AudioManager } from './AudioManager';
const { ccclass, property } = _decorator;

@ccclass('GameRoot')
export class GameRoot extends Component {
    
    @property(AudioSource)
    private _audioSource: AudioSource = null!;

    onLoad () {
        // 这可能的意思是this.node.getComponent(AudioSource)?
        const audioSource = this.getComponent(AudioSource)!;
        // 检查条件
        assert(audioSource);
        this._audioSource = audioSource;
        // 声明常驻节点
        game.addPersistRootNode(this.node);

        // init AudioManager
        AudioManager.init(audioSource);
    }
}