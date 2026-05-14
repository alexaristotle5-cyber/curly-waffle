# 生字日语 PWA

一个轻量手机版 PWA 框架，用来背「生」这个汉字相关的日语单词。

## 当前流程

1. 点击开始
2. 进入背单词
3. 播放单词音频或例句音频
4. 查看释义
5. 标记会了，切换上一个/下一个
6. 从首页或背词页进入单词复习
7. 首页音乐可手动开关，进入学习页后自动停止

## 目录

- `index.html`：页面入口
- `styles.css`：手机优先界面
- `app.js`：学习流程逻辑
- `data/words.json`：词库
- `assets/audio/`：单词和例句语音
- `assets/start-bg.jpg`：当前首屏背景，之后可以直接替换
- `manifest.webmanifest`、`sw.js`：PWA 安装和离线缓存

## 本地预览

```bash
npm run dev
```

然后打开：

```text
http://127.0.0.1:5189/
```

## GitHub Pages

这个项目是纯静态文件，不需要构建。把整个文件夹提交到 GitHub 仓库后，在仓库设置里开启 GitHub Pages，选择仓库根目录即可。
