# Gander project page / Gander 项目主页

A bilingual, dependency-free static project page for **Omni Interaction Agent Technical Report** (2026-09-08).

中英双语静态主页，包含 12 类能力、12 段演示视频、方法插图、完整实验表格与论文引用。无需安装依赖或执行构建。

## Preview / 本地预览

在本目录运行：

```sh
python3 preview.py
```

`preview.py` 使用 Python 标准库并支持视频字节范围请求，方便在 Safari 等浏览器中播放和拖动长视频。它仅用于本机预览，无需上传到 GitHub Pages。

打开 <http://localhost:8000>。也可以直接打开 `index.html`；本地 HTTP 预览更接近 GitHub Pages，支持更完整的浏览器功能。

The page defaults to English and remembers the selected language when browser storage is available. Switching languages preserves the selected demo, playback progress, and play state. Original video audio and embedded captions are not translated.

## GitHub Pages

1. 将以下发布文件通过 Git 上传至目标仓库，保持相对目录结构：
   - `index.html`
   - `assets/`（包含脚本、样式、视频、封面及插图）
   - `Omni-Interaction-Agent/`（技术博客，`Omni-Interaction-Agent/asset/` 包含博客使用的视频与封面副本）
   - `gander.pdf`
   - `.nojekyll`
   - `README.md`（说明文件，可选）
2. 在仓库 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch**。
3. 选择保存上述文件的分支，目录选择 **/ (root)**，保存设置。

无需 Jekyll、Node.js、GitHub Actions 或后端。仓库可以是 `username.github.io`，也可以是普通项目仓库；页面不使用站点根绝对路径，因此兼容 `/repository-name/` 子路径。

Original MOV files remain untouched in the working folder and are not needed by the published page. Upload the MP4 files under `assets/videos/`. No repository was created and no deployment was performed as part of this local deliverable.

## Content and maintenance / 内容维护

- `assets/content.js` — 中英文案、能力与样本列表、作者、Table 3–6 的所有数值。页面正文优先使用此文件的文案。
- `assets/app.js` — 能力翻页、语言切换、视频播放管理与实验标签。
- `assets/styles.css` — 布局、配色、移动端样式及减少动态效果适配。
- `index.html` — 语义化页面结构及默认英文静态正文；大幅修改英文内容时可同步其中的静态文本。页面运行时会从 `content.js` 更新文案。

发布脚本、文案或样式的更新时，同步更新 `index.html` 中三个资源的 `?v=` 版本号，避免浏览器混用缓存的新旧文件。

文案使用成对的 `en` / `zh` key。视频配置中的每个样本集中维护 `id`、`src`（视频相对路径）与 `poster`（封面相对路径）。增加能力后，标签与页数会从数据自动生成；初始 HTML 页码仅作为加载前的占位显示。

Do not recreate video elements when updating page text: retained video nodes preserve playback progress. Videos are manual-play, use `preload="none"`, and receive their source only when first visited. Switching capabilities or translation samples pauses the previous video without resetting its position.

## Media mapping / 素材对应

| 网页文件（assets/videos/） | 原始素材 | 时长 |
| --- | --- | --- |
| visual-task.mp4 | e8-协同任务+视觉修改.mov | 99.82 s |
| technical-report-reading.mp4 | e13-视觉类-读取技术报告.mov | 56.60 s |
| collaborative-task.mp4 | e7-协同任务-基础.mov | 84.06 s |
| video-commentary.mp4 | e15-视频解说-1.mov | 49.80 s |
| visual-proactivity.mp4 | e15-视觉触发.mov | 18.33 s |
| translation-zh-en.mp4 | e5-同传中译英.mov | 34.10 s |
| translation-en-zh.mp4 | e5-同传英译中.mov | 36.07 s |
| robust-conversation.mp4 | e4-重度抗干扰+自然对话-new-1.mov | 56.80 s |
| full-duplex.mp4 | e3-双工打断附和-new-1.mov | 28.73 s |
| two-person-dialogue.mp4 | e2-双人对话-1.mov | 30.67 s |
| video-understanding.mp4 | e11-视频问答.mov | 26.53 s |
| reasoning.mp4 | e2-简单推理-new-1.mov | 28.93 s |

MP4 files retain the original 1920×1080 H.264 video and AAC audio. They were exported without re-encoding, with the `moov` index ahead of `mdat` for progressive playback. Compressed audio/video samples were verified against their original MOV files. Video posters are frames from the corresponding recordings.

论文图由当前 `gander.pdf` 整体裁出，保留图内容，移除论文页眉、页脚及原 caption；网页提供中英图注：

| 图片（assets/figures/） | 来源 |
| --- | --- |
| overview.webp | Figure 1，PDF 第 2 页 |
| architecture.webp | Figure 2，PDF 第 7 页 |
| thinker-talker.webp | Figure 4，PDF 第 11 页 |

## Demo ordering and blog copies / 演示顺序与博客副本

两页按综合任务到日常交互的顺序展示：协同任务＋视觉修改、技术报告视觉阅读、基础协同任务、视频解说、视觉主动交互、中译英同传、英译中同传、抗干扰对话、多人交互、双人对话理解、视频理解、常识推理。项目主页将两个同传方向拆分展示，因此共有 12 个能力页、12 段视频。

项目主页使用 `assets/videos/` 和 `assets/posters/`；博客使用独立的 `Omni-Interaction-Agent/asset/videos/` 和 `Omni-Interaction-Agent/asset/posters/`，12 段 MP4 和对应封面均已复制。更新素材时同步维护两份文件，原始 MOV 保留在根目录。

## Research fidelity / 论文口径

- Table 3–6 按本地 PDF 逐项核对。Table 3 前四列是 0–1 分数，后三列是百分比；`Interrupt` 为提前抢话比例，非响应用户打断的速度，`n/a` 不是 0。
- Table 4 的 Thinker-text 行独立显示，仅作参考，不直接参与端到端语音系统比较。
- Table 6 融合增益单位为百分点。1 秒流式单元和 128 个时间块是模型设置，并非实测响应延迟。
- 作者顺序、贡献及机构标记均按封面保留。引用不包含未经确认的 DOI、arXiv ID 或期刊。
- GitHub 沿用论文所列 Gander 用户主页；Hugging Face 分别链接至该用户的模型与数据集页面。

Design references: [SeedRealtime](https://seed.bytedance.com/en/SeedRealtime), [Seeduplex](https://seed.bytedance.com/en/seeduplex), [Thinking Machines](https://thinkingmachines.ai/blog/interaction-models/), and [JoyAI-VL-Interaction](https://joyai-vl-video-future-academy-jd.github.io/JoyAI-VL-Interaction/). The page implementation is original; source-site branding and code are not included.
