# Gander 技术博客

入口为 [`index.html`](index.html)。默认英文，支持中文切换；正文包含十二段演示、论文图 1、2、4、5，以及方法、数据构建和实验结果解读。页面使用原生 HTML、CSS、JavaScript，无构建步骤。

## 本地预览

在项目根目录（`Gander/`）运行：

```sh
python3 preview.py
```

`preview.py` 使用 Python 标准库并支持视频字节范围请求，方便在 Safari 等浏览器中播放和拖动长视频。它仅用于本机预览，无需上传到 GitHub Pages。

打开 `http://localhost:8000/Omni-Interaction-Agent/`。也可以直接打开 `Omni-Interaction-Agent/index.html`；本地文件模式或浏览器隐私设置可能限制语言偏好存储。关闭 JavaScript 时仍可阅读中文正文、查看图表并播放视频。

## GitHub Pages

将 `Omni-Interaction-Agent/` 与项目根目录的 `assets/`、`gander.pdf`、`index.html` 和 `.nojekyll` 一起发布，保留目录结构。博客视频位于 `asset/videos/`，封面位于 `asset/posters/`，共 12 段 MP4 及对应封面。论文插图、站点图标及 PDF 继续引用父目录资源。发布时请包含整个 `Omni-Interaction-Agent/asset/`。

- 用户主页仓库：`https://username.github.io/Omni-Interaction-Agent/`
- 项目仓库：`https://username.github.io/repository/Omni-Interaction-Agent/`

所有内部链接均为相对路径，两种部署方式都可用。GitHub Pages 的分支发布配置见父目录 [`README.md`](../README.md)。本次仅创建本地文件，未发布到远程。

## 内容维护

- `content.js`：集中保存中文、英文正文和界面文案，`strings.zh` 与 `strings.en` 的键应保持一致；`sections` 定义目录顺序。
- `index.html`：文章结构、完整中文回退内容、视频路径、图表与实验数据。修改中文时，同步更新对应的 `data-i18n` 元素；修改数值时直接更新 HTML 表格，并核对 PDF。
- `styles.css`：桌面左侧固定目录与右侧正文、移动端单栏、表格横向滚动及减少动态效果设置。
- `app.js`：语言偏好、目录定位、视频互斥播放、加载错误提示和表格键盘操作。

`#training` 章节按当前 `../gander.pdf` 第 4 节更新为「交互数据构建 / Interaction Data Construction」，介绍语音、音视频、智能体、抗干扰与负样本四类数据。新版报告不再包含原先的 Thinker/Talker 两阶段训练说明，因此已从这一节删除。参考链接分别指向第 4 节（第 14 页起）、数据分布表 2（第 15 页）和智能体数据流程图 5（第 17 页）。图 5 的网页素材为 `asset/figures/agentic-data-pipeline.webp`，从 PDF 第 17 页完整裁出图示区域，原文保留，配有双语图注；点击图片可查看完整分辨率。

演示按复杂任务到基础能力分为四组，视频编号在全文连续排列：

1. **全模态智能体交互 / Omni Agentic Interaction**（01–02）：游戏创建与视觉修改、技术报告调研。
2. **语音智能体交互 / Audio Agentic Interaction**（03）：通过语音发起地点搜集任务，并查询进展。
3. **音视频全双工对话 / Audio & Video Full-Duplex Dialogue**（04–09）：流式视频解说、视觉主动提醒、中译英同传、英译中同传、附和与打断、视频理解素材。
4. **抗干扰、多人对话与简易推理 / Robust Dialogue, Multi-Speaker Understanding & Simple Reasoning**（10–12）：抗干扰对话、双人对话理解、冰箱降温问题。

e13「视觉阅读：技术报告调研」保持第二个视频位置，对应 `e13-视觉类-读取技术报告.mov`，网页文件为 `asset/videos/technical-report-reading.mp4`，时长 56.60 秒。博客将两个同传方向作为连续视频展示，其余源文件对应关系见父目录 README。调整视频分组时，同步修改 `index.html` 的章节与编号，以及 `content.js` 中的双语标题和 `sections` 目录顺序。

替换两页共用的素材时，先同步 `asset/videos/` 与 `asset/posters/` 中的本地副本及父目录项目主页素材，再修改 `index.html` 中相应的 `src`、`poster`、直接打开链接及双语说明。视频手动播放，使用 `preload="none"`；播放新视频会暂停其他视频，保留进度。语言切换不重建视频节点，也不会重置播放进度。浏览器可能按自己的策略提前请求少量媒体数据。

修改 CSS 或 JavaScript 后，可递增 `index.html` 中资源链接的版本参数，避免旧缓存。侧栏显示日期为 2026-09-08，分类为 Omni interaction agent，研究团队为 Hunyuan speech team (Research project)。研究描述、图注和数值仍以父目录 `gander.pdf` 为准。

## 访问统计

博客页脚接入[不蒜子官方计数器](https://busuanzi.ibruce.info/)，展示文章浏览量（page PV）与站点访客数（site UV）。无需账号或 API key。`app.js` 在公开 HTTP/HTTPS 页面加载一次官方脚本；切换语言不会重复上报。计数服务会收到正常的访问请求信息及页面来源。

本地文件、localhost、127.0.0.1 和 `.local` 预览不加载统计脚本，显示“本地预览不计数”。发布到 GitHub Pages 后自动计数；外部统计服务不可用时显示提示，页面与视频仍可使用。站点访客数是服务提供的站点级统计，并非当前文章的独立访客数。

左上角品牌与页脚品牌在 `index.html` 中维护；截图所示蓝色眉题 `.article-kicker` 已用 HTML 注释保留，可按需取消注释恢复。

## 设计参考

版式参考 [SeedRealtime 技术博客](https://seed.bytedance.com/zh/blog/seedrealtime-audio-visual-full-duplex-llm-released-toward-omni-modal-natural-interaction)：大标题、留白、左侧文章信息和穿插视频的连续正文。文案根据 Gander 论文与现有演示独立编写。
