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
| didi | SUPPORTED | SUPPORTED | SUPPORTED | 社招 `talent.didiglobal.com`；校招 Moka `campus.didiglobal.com/96064`；实习 Moka `app.mokahr.com/6222` | 社招沿用 recruit-portal；校招/实习 Moka `jobs/v2` + AES 解密（siteId 96064/6222） | 2026-07-19 |
| kuaishou | SUPPORTED | SUPPORTED | SUPPORTED | 社招/日常实习：`zhaopin.kuaishou.cn`；校招：`campus.kuaishou.cn` | DevTools：social `C001`；trainee `C002`+`G002`；campus `POST .../positions/simple` + `GET .../positions/find` | 2026-07-19 |
| bytedance | SUPPORTED | SUPPORTED | SUPPORTED | `/experienced` + `/campus`（实习无独立 `/internship` 路径） | DevTools：campus headers + `portal_type=3` + `recruitment_id_list` 201/202 | 2026-07-19 |
| meituan | SUPPORTED | SUPPORTED | SUPPORTED | `/web/social`、`/web/campus` | DevTools：`jobType` `3/1/2` → social/campus/intern；detail `jobShareType=1` | 2026-07-19 |
| xiaomi | SUPPORTED | SUPPORTED | SUPPORTED | `hr.xiaomi.com` → `/index` `/campus/` `/internship/` | DevTools：同 API，`website-path` 头区分渠道；`portal_type` 均为 6 | 2026-07-19 |
| tencent | SUPPORTED | SUPPORTED | SUPPORTED | `careers.tencent.com`；`attrId` `1/2/3` | DevTools：Query API `attrId` 区分社招/校招/实习 | 2026-07-19 |
| baidu | SUPPORTED | SUPPORTED | SUPPORTED | `talent.baidu.com` 列表 + SSR 详情 | DevTools：`recruitType` `SOCIAL/GRADUATE/INTERN` | 2026-07-19 |
| jd | SUPPORTED | SUPPORTED | SUPPORTED | 社招 `zhaopin.jd.com`；校招/实习 `campus.jd.com` | DevTools：`POST /api/wx/position/page?type=present\|internship`；`pageIndex` 0-based | 2026-07-19 |
| xiaohongshu | SUPPORTED | SUPPORTED | SUPPORTED | `job.xiaohongshu.com` `/social|/campus|/intern` | DevTools：`recruitType` + `applyType` 枚举 | 2026-07-19 |
| bilibili | SUPPORTED | SUPPORTED | SUPPORTED | 社招 `/api/srs`；校招/实习同属 campus 渠道 | DevTools 2026-08-02：`type=3` 全职校招、`type=0` 实习；`recruitType` 均为 1 | 2026-08-02 |
| netease | SUPPORTED | SUPPORTED | SUPPORTED | 社招/日常实习 `hr.163.com`；校招 `campus.163.com` | DevTools 2026-08-02：`getJobList?projectId=69`（互联网校招）；互娱/雷火外域暂未接入 | 2026-08-02 |
| ctrip | SUPPORTED | SUPPORTED | SUPPORTED | `job.ctrip.com` experienced + campus | DevTools 2026-08-02：`getJobAd` `category=1` 社招/实习 + `category=2` 校招（可空岗） | 2026-08-02 |
| huawei | SUPPORTED | SUPPORTED | UNSUPPORTED_NO_PUBLIC_CHANNEL | 社招/校招 job-list | DevTools：`jobType` `SR/CR`；校招 `getCampusRecruitmentCategory`；无公开实习渠道 | 2026-07-19 |
| dji | SUPPORTED | UNSUPPORTED_NO_PUBLIC_CHANNEL | SUPPORTED | `we.dji.com` 社招/校园页 | DevTools：`schoolFlag` `N/Y`；社招当前可空（`NO_LIVE_JOBS`） | 2026-07-19 |
| ant | SUPPORTED | SUPPORTED | SUPPORTED | 社招 `/api/social`；校招/实习 `/api/campus` | DevTools：`campus_group_official_site`；客户端 `batchType` graduate/trainee 过滤 | 2026-07-19 |
| mihoyo | SUPPORTED | SUPPORTED | SUPPORTED | `jobs.mihoyo.com` ATS portal | DevTools：`hireType` `0` 社招；`1`+`jobNatures` `[1]`/`[3]` 校招/实习 | 2026-07-19 |
| moonshot | SUPPORTED | SUPPORTED | UNSUPPORTED_NO_PUBLIC_CHANNEL | Moka 社招 `148506`；校招 `campus-recruitment/moonshot/148507` | DevTools 2026-08-02：独立 campus siteId；页内混有实习岗暂整站标 campus | 2026-08-02 |
| deepseek | SUPPORTED | SUPPORTED | UNSUPPORTED_NO_PUBLIC_CHANNEL | Moka 社招 `140576`；校招 `campus-recruitment/high-flyer/4605` | DevTools 2026-08-02：校招站可开但当前 `total=0`；microsite 可无 init-data（零 IV 兜底） | 2026-08-02 |
| dewu | SUPPORTED | SUPPORTED | SUPPORTED | 社招/实习 `careers.dewu.com/index`；校招 `campus.dewu.com/578078` | DevTools 2026-08-02：`website-path=578078` + `recruitment_id_list=201` | 2026-08-02 |
| minimax | SUPPORTED | SUPPORTED | SUPPORTED | 社招/实习 `.../index`；校招 `.../379481` | DevTools 2026-08-02：同域不同 `website-path`；`201` 校招正式 | 2026-08-02 |
| zhipu | SUPPORTED | SUPPORTED | SUPPORTED | 社招/实习飞书；校招 Moka `zphz/148984` | DevTools 2026-08-02：双后端；校招 `jobs/v2` + `site=campus`，约 20 岗 | 2026-08-02 |
| taotian | SUPPORTED | SUPPORTED | SUPPORTED | `/off-campus` + `/campus` | DevTools：`campus_group_official_site` + `categoryType=freshman\|internship`；实习可空 | 2026-07-19 |
| taobao-shangou | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 逐站验证 API 成功；校招/实习当前可能空岗 | 2026-07-19 |
| fliggy | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 逐站验证 API 成功；校招/实习当前可能空岗 | 2026-07-19 |
| alibaba-intl | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 逐站验证 API 成功；校招/实习当前可能空岗 | 2026-07-19 |
| aliyun | SUPPORTED | SUPPORTED | SUPPORTED | DevTools 校招页 | 前端 body 使用通用 `campus_group_official_site`（非 HTML brand map）；当前空岗 | 2026-07-19 |
| tongyi | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招/实习均有在招岗位 | 2026-07-19 |
| dingtalk | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| quark | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| thead | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| amap | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招可空；实习批次存在但列表可空 | 2026-07-19 |
| cainiao | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| hujing | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招/实习均有在招岗位 | 2026-07-19 |
| freshippo | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招/实习当前可能空岗 | 2026-07-19 |
| alihealth | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |
| lingxi | SUPPORTED | SUPPORTED | SUPPORTED | 同上协议 | 校招有岗；实习可空 | 2026-07-19 |

## 公共契约进度

| 能力 | 状态 |
| --- | --- |
| `src/core/natures.js` 标准类型与别名 | Done |
| registry `supported_natures` / 聚合 / detail 拒 all | Done |
| CLI `filters`/`detail --nature` | Done |
| 离线契约测试 | Done |
| 试点站点多类型实现（xiaomi/meituan/kuaishou） | Done |
| Alibaba CPO 15 站共享协议改造 | Done |
| Feishu SaaS 3 站（social/intern） | Done |
| Issue #13 缺口站补全（campus/intern） | Done（2026-08-02：除华为实习外） |
| Phase 4 独立站 + Moka | Done |
| 全矩阵 live smoke（支持渠道） | Done（2026-07-19：FAIL 0 / EMPTY 20 季节性空岗 / PASS 76） |
| README / ADDING_SITE / skill | Done |
| `0.2.0-beta.0` 本地预发布 | Done（见 CHANGES；未 npm publish） |

## Phase 3 取证摘要（Alibaba CPO）

验证日期：2026-07-19

- 官方入口：社招 `/off-campus/position-list`，校招 `/campus/position-list`
- 列表：`POST /position/search`
  - 社招：`channel=group_official_site`（配置默认；HTML `cdc_*` 窄渠道不可直接替代）
  - 校招：`channel=campus_group_official_site` + `categoryType=freshman`
  - 实习：`channel=campus_group_official_site` + `categoryType=internship`
- DevTools（淘天 + 阿里云）确认前端使用通用 `campus_group_official_site`，与 HTML brand map（如 `aliyun_campus_group_official_site`）等价或应优先使用通用值
- 详情：`POST /position/detail`，`{ id, channel, language }`
- 15 站均声明 `supportedNatures: social/campus/intern`；季节性空岗返回空列表（`NO_LIVE_JOBS`），不降级为 unsupported

## Phase 3 取证摘要（Feishu SaaS：zhipu / minimax / dewu）

验证日期：2026-07-19；校招补全：2026-08-02

- 社招门户 `portal_type=6` + `website-path=index`：`101`=全职社招，`301`=实习（保持不变）
- 2026-08-02：得物/MiniMax 另有独立校招 `website-path`（`578078` / `379481`），校招正式码 `201`
- 智谱校招不在飞书，而在 Moka `campus-recruitment/zphz/148984`（双后端）
- 社招默认仍仅返回 `101`，不混入实习岗位

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
