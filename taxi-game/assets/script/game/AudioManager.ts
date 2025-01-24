import { assert, assetManager, AudioClip, AudioSource, log } from "cc";

// 个人暂认为，定义一个全是static的类，不如直接用单例模式
export class AudioManager {
    // 整个游戏仅这一个音频组件，默认音频片段为背景音乐
    private static _audioSource?: AudioSource;
    // 音频片段缓存表
    private static _cachedAudioClipMap: Record<string, AudioClip> = {};

    // init AudioManager in GameRoot component.
    public static init(audioSource: AudioSource) {
        log('Init AudioManager !');
        // 将GameRoot传来的音频组件视为唯一
        AudioManager._audioSource = audioSource;
    }

    public static playMusic() {
        const audioSource = AudioManager._audioSource!;
        // 使用assert来检查，会更简洁
        assert(audioSource, 'AudioManager not inited!');

        audioSource.play();
    }

    public static playSound(name: string) {
        const audioSource = AudioManager._audioSource!;
        assert(audioSource, 'AudioManager not inited!');

        const path = `audio/sound/${name}`;
        let cachedAudioClip = AudioManager._cachedAudioClipMap[path];
        if (cachedAudioClip) {
            // 播放一次音频，参数为（音频片段，声量倍数）
            audioSource.playOneShot(cachedAudioClip, 1);
        } else {
            // 动态加载的所有资源最好都放在resources文件夹下

            // 通过资源加载器加载资源（所有资源都可以通过此类方法加载，但限制在resources/路径下），资源类型为音频片段
            assetManager.resources?.load(path, AudioClip, (err, clip) => {
                if (err) {
                    console.warn(err);
                    return;
                }

                AudioManager._cachedAudioClipMap[path] = clip;
                audioSource.playOneShot(clip, 1);
            });
        }
    }
}