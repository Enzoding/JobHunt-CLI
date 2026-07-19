# 招聘类型能力矩阵与证据

> 验证日期起点：2026-07-19  
> 状态枚举：`SUPPORTED` / `UNSUPPORTED_NO_PUBLIC_CHANNEL` / `NO_LIVE_JOBS` / `BLOCKED_API_CHANGE` / `PENDING`

本文件记录 36 个站点在 `social` / `campus` / `intern` 上的公开渠道能力结论。接口事实以 Chrome DevTools MCP 抓包为准；未完成调研的单元格标记为 `PENDING`。

## 脱敏规则

- 不记录 Cookie、token、CSRF、签名明文、设备 ID、个人信息。
- fixture 仅保留影响解析的最小字段结构。
- `NO_LIVE_JOBS` 必须同时具备公开入口证据、有效空响应和脱敏 fixture。

## 矩阵

| Site ID | social | campus | intern | 官方入口 / 备注 | DevTools 证据摘要 | 验证日期 |
| --- | --- | --- | --- | --- | --- | --- |
| didi | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待校招/实习入口抓包 | 2026-07-19 |
| kuaishou | SUPPORTED | SUPPORTED | SUPPORTED | 社招/日常实习：`zhaopin.kuaishou.cn`；校招：`campus.kuaishou.cn` | DevTools：social `C001`；trainee `C002`+`G002`；campus `POST .../positions/simple` + `GET .../positions/find` | 2026-07-19 |
| bytedance | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 portal/recruitment filter 抓包 | 2026-07-19 |
| meituan | SUPPORTED | SUPPORTED | SUPPORTED | `/web/social`、`/web/campus` | DevTools：`jobType` `3/1/2` → social/campus/intern；detail `jobShareType=1` | 2026-07-19 |
| xiaomi | SUPPORTED | SUPPORTED | SUPPORTED | `hr.xiaomi.com` → `/index` `/campus/` `/internship/` | DevTools：同 API，`website-path` 头区分渠道；`portal_type` 均为 6 | 2026-07-19 |
| tencent | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待校招独立 API/attrId 抓包 | 2026-07-19 |
| baidu | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待校招列表与 SSR 详情抓包 | 2026-07-19 |
| jd | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待类型路径抓包 | 2026-07-19 |
| xiaohongshu | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 recruitType 枚举抓包 | 2026-07-19 |
| bilibili | SUPPORTED | PENDING | PENDING | 社招基线；已有 campus filter 线索 | 待 campus position API 抓包 | 2026-07-19 |
| netease | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 workType/校招路由抓包 | 2026-07-19 |
| ctrip | SUPPORTED | PENDING | PENDING | 社招基线；含 Intern kind 线索 | 待校招/实习入口抓包 | 2026-07-19 |
| huawei | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 campus jobType 抓包 | 2026-07-19 |
| dji | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待校招/实习列表抓包 | 2026-07-19 |
| ant | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 /api/campus 抓包 | 2026-07-19 |
| mihoyo | SUPPORTED | PENDING | PENDING | 社招基线已接入 | 待 hireType 枚举抓包 | 2026-07-19 |
| moonshot | SUPPORTED | PENDING | PENDING | Moka 社招基线 | 待独立 campus/intern site 调研 | 2026-07-19 |
| deepseek | SUPPORTED | PENDING | PENDING | Moka 社招基线 | 待公开校招/实习入口调研 | 2026-07-19 |
| dewu | SUPPORTED | PENDING | PENDING | Feishu SaaS 社招基线 | 待 portal_type 抓包 | 2026-07-19 |
| minimax | SUPPORTED | PENDING | PENDING | Feishu SaaS 社招基线 | 待 portal_type 抓包 | 2026-07-19 |
| zhipu | SUPPORTED | PENDING | PENDING | Feishu SaaS 社招基线 | 待 portal_type 抓包 | 2026-07-19 |
| taotian | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| taobao-shangou | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| fliggy | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| alibaba-intl | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| aliyun | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| tongyi | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| dingtalk | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| quark | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| thead | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| amap | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| cainiao | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| hujing | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| freshippo | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| alihealth | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |
| lingxi | SUPPORTED | PENDING | PENDING | Alibaba CPO 社招基线 | 待 campus/intern channel 抓包 | 2026-07-19 |

## 公共契约进度

| 能力 | 状态 |
| --- | --- |
| `src/core/natures.js` 标准类型与别名 | Done |
| registry `supported_natures` / 聚合 / detail 拒 all | Done |
| CLI `filters`/`detail --nature` | Done |
| 离线契约测试 | Done |
| 试点站点多类型实现（xiaomi/meituan/kuaishou） | Done |
| Alibaba CPO 共享协议调研 | In progress（见下方取证） |
| 全矩阵 DevTools 证据 | Pending |
| `0.2.0-beta.0` 预发布 | Pending |

## Phase 3 取证摘要（Alibaba CPO / 淘天）

验证日期：2026-07-19

- 官方入口：`https://talent.taotian.com/` → 社招 `/off-campus/position-list`，校招 `/campus/home`、`/campus/position-list?campusType=freshman&batchId=...`
- 列表：`POST /position/search`
  - 社招：`channel=group_official_site`（配置默认；HTML `cdc_*` 映射不可直接替代）
  - 校招：`channel=campus_group_official_site` + `categoryType=freshman`（可带 `batchId`）
  - 实习：`channel=campus_group_official_site` + `categoryType=internship`（当前 `listBatch.internship=[]`，空列表）
- 批次：`POST /searchCondition/listBatch` 返回 `graduate` / `internship`
- 详情：`POST /position/detail`，`{ id, channel, language }`
- 无登录可访问；Cookie/CSRF 仅会话用，不入库
- 结论：协议可复用到 CPO 族；实习可为 `NO_LIVE_JOBS`；各子站 channel 名不同，需逐站验证后才能声明 `supportedNatures`

## 证据记录模板

```text
Site: <id>
Nature: social|campus|intern
Status: SUPPORTED|UNSUPPORTED_NO_PUBLIC_CHANNEL|NO_LIVE_JOBS|BLOCKED_API_CHANGE
Verified: YYYY-MM-DD
Official URL: https://...
List request: METHOD path — trigger — key params
Filter request: METHOD path — trigger — key params
Detail request: METHOD path — trigger — key params
Nature switch diff: ...
Unauthenticated replay: yes/no
Notes: ...
```
