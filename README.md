# Bitdsk Flash Tool

浏览器内 USB 烧录站点，服务三个硬件平台：**S1**、**U1 Touch**、**U2 Touch**。
纯静态，无后端、无 PHP、无构建步骤，直接托管到 GitHub Pages 即可。

烧录原理：浏览器通过 **Web Serial API** 直连设备的 USB 串口，读取仓库里的
bin 文件按分区偏移写入 flash。全程在本地完成，不上传任何数据。

---

## 一、仓库分工

| 仓库 | 放什么 | 体积 |
|---|---|---|
| [bitdsk-site](https://github.com/bitdsk/bitdsk-site) | 索引页、文档、操作指南、PDF、图片 | 约 19 MB |
| **bitdsk-flash**（本仓库） | 烧录页 + S1 / U1 / U2 的烧录包 | 约 11 MB |
| [Bitdsk_Miner_Archive](https://github.com/bitdsk/Bitdsk_Miner_Archive) | 其余所有固件 bin（OTA 包、legacy、工具、Gerber） | 约 50 MB |
| [Bitdsk-s1-Miner](https://github.com/bitdsk/Bitdsk-s1-Miner) | S1 固件源码（MIT） | — |

主站只做索引，点「Flash tool」跳到这里，点「Download」走 `Bitdsk_Miner_Archive` 的 CDN。

> **版本日期是迁移过来的，可能对不上。**
> 本站和主站的版本号准确，但旁边的日期取自原 WordPress 站的下拉表格，
> 可能差几天。页面上已经加了说明。

---

## 二、三块板是三种设备

客户下单时就知道自己买的是哪块板，所以页面上不讲「固件是怎么构建的」，
只讲**硬件本身的差别和实际效果**：

| | S1 | U1 Touch | U2 Touch |
|---|---|---|---|
| 硬件来源 | 现成 **CYD** 开发板（ESP32-2432S028） | 自研 | 自研 |
| ASIC | 无，ESP32 自己算 | 1 颗 | 1 颗 |
| 算力 | 600k–800k H/s | **200G** | **1100–1500G** |
| 功耗 | USB 供电 | ≈10 W | ≈22–27 W |
| 供电 | USB 5V | DC / Type-C，5V ≈3A | DC，5V ≈5A |
| 屏幕 | 2.8″ 触摸 | 2.8″ 触摸 | 2.8″ 触摸 |
| 温度监控 | – | ✓ | ✓ |
| 固件 | 免费 · **开源** | 免费下载 | 免费下载 |

三者的定位差别：

- **S1** 不是自研硬件，跑在通用的 CYD 板上，没有 ASIC，算力只有几十万 H/s。
  它是桌面显示器和学习板，不是能回本的矿机。固件 MIT 开源：
  [bitdsk/Bitdsk-s1-Miner](https://github.com/bitdsk/Bitdsk-s1-Miner)。
- **U1** 是入门 ASIC 机型，200G / ≈10W，安静、省电，适合长期挂着。
- **U2** 是 U1 的加强版，算力 5–7 倍，代价是功耗翻倍、发热和噪音都上来了，
  但每瓦算力明显更好。

**选型不需要看固件**：型号印在设备上、也在订单里，按实际机型点对应的卡就行。
三个镜像互不通用（S1 的包刷不进 U 系列，U1/U2 也不能互换）。

> 技术备注（维护者用）：三块板都是经典 ESP32（镜像头 `chip_id = 0x0000`），
> 所以 manifest 里 `chipFamily` 统一写 `ESP32`。U1 与 U2 的 `bitdsk-miner.bin`
> 逐字节相同，只靠 NVS 分区区分型号 —— 这个细节不放在页面上，避免让用户困惑。

---

## 三、目录结构

```
bitdsk-flash/
├── index.html              烧录页（三张卡 + 硬件对比表 + 步骤 + 排障）
├── css/style.css           与主站同一套样式，末尾追加了对比表和规格标签样式
├── js/
│   ├── config.js           主站地址配置（mainSite）
│   ├── flash.js            主站链接、汉堡菜单、返回顶部
│   └── vendor/
│       └── esp-web-tools/  esp-web-tools 10.4.0 的 dist/web（26 个文件，544 KB）
├── firmware/
│   ├── s1/manifest.json    v_1.5/    5 个分区
│   ├── u1/manifest.json    v_1.5.2/  5 个分区
│   └── u2/manifest.json    v_1.5.2/  5 个分区
├── images/                 logo + favicon（从主站复制，保持品牌一致）
├── scripts/
│   ├── serve.py            本地预览（修正 Windows 的 MIME 问题）
│   └── check-deploy.py     部署前体检
├── favicon.ico
└── .nojekyll               关闭 Jekyll
```

分区偏移（三张卡一致，只有 NVS 文件名不同）：

| 文件 | 偏移 |
|---|---|
| `bootloader.bin` | `0x1000` |
| `partition-table.bin` | `0x8000` |
| `my_cvs_*.bin` | `0x9000` |
| `bitdsk-miner.bin` | `0x20000` |
| `ota_data_initial.bin` | `0x3A0000` |

---

## 四、本地预览

**必须用 `scripts/serve.py`，不要用 `python -m http.server`。**
Windows 下后者从注册表读 MIME，会把 `.css` 报成 `application/x-css`、`.js` 报成
`application/x-js`，Chrome 直接拒绝加载，页面变成白底无样式。

```bash
python scripts/serve.py 8898
# 打开 http://127.0.0.1:8898/
```

`localhost` 属于安全上下文，Web Serial 可用，插上板子就能真烧。

---

## 五、部署到 GitHub Pages

```bash
git init
git add .
git commit -m "Bitdsk flash tool"
git branch -M main
git remote add origin https://github.com/<user>/bitdsk-flash.git
git push -u origin main
```

然后在仓库 **Settings → Pages** 里选 `main` 分支根目录。
部署后地址是 `https://<user>.github.io/bitdsk-flash/`。

体检脚本会验证：链接大小写（Linux 区分、Windows 不区分，本地能开线上可能 404）、
失效链接、非 ASCII 文件名、单文件超限、`.nojekyll`。

```bash
python scripts/check-deploy.py
```

### 部署后要改一处配置

打开 `js/config.js`，把 `mainSite` 指向主站：

```js
window.BITDSK_FLASH_CONFIG = {
  mainSite: '../bitdsk-site/',   // 同级仓库，默认即可
  // 或用绝对地址：
  // mainSite: 'https://bitdsk.org/',
  github: 'https://github.com/',
  repoName: 'bitdsk-flash'
};
```

留空的话，页面上的主站链接会自动隐藏，不会产生死链。

---

## 六、加一个新版本怎么改

以给 U1 发 `v_1.6` 为例：

1. 新建 `firmware/u1/v_1.6/`，放入 5 个 bin（bootloader、partition-table、NVS、app、ota_data）。
2. 改 `firmware/u1/manifest.json`：`version` 改成 `v_1.6`，5 个 `path` 都指向 `v_1.6/…`。
3. 旧版本目录可以留着（不影响，manifest 只引用新版），也可以删掉省体积。
4. 改 `index.html` 里对应卡片的版本 pill 和分区清单文件名。
5. 跑 `python scripts/check-deploy.py`，然后提交。

S1 和 U2 同理。**注意 U1 和 U2 的 app 是同一个文件**，如果只改 app，
两边都要更新，否则两个型号会跑不同版本。

---

## 七、已知限制

- **必须 HTTPS 或 localhost。** 否则 `navigator.serial` 不可用，页面会提示
  “Serial access is blocked”。
- **只支持桌面版 Chrome / Edge。** Safari、Firefox 没有 Web Serial，移动端也不行。
- **需要数据线。** 只能充电的线是最常见的失败原因。
- **驱动。** Windows 上可能要先装 CP210x 或 CH34x 驱动才能看到串口。

---

## 八、与主站的关系

主站 `bitdsk-site` 的 `js/config.js` 里有对应的 `flashBase` 配置：

```js
flashBase: '../bitdsk-flash/'
```

两边各配一个，互相指向。改仓库名或换域名时，**两个 config.js 都要改**。
