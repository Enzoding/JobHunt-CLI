# 标准字段与招聘类型

在需要完整字段表、招聘类型规则或 `detail_id` 语义时阅读本文件。

## 招聘类型

| 用户说法 | `--nature` |
|----------|------------|
| 社招、社会招聘、有经验、全职社招 | `social`（默认，可省略） |
| 校招、校园招聘、应届、春招、秋招、毕业生 | `campus` |
| 实习、实习生、暑期实习、日常实习 | `intern` |
| 全部、所有类型、一起看 | `all`（先小规模预览） |

标准值：`social` / `campus` / `intern` / `all`。中文别名可用：`社招` / `校招` / `实习` / `全部`。

全部类型安全规则：

1. 需要确认站点能力时，用 `job sites --format json` 看该站 `supported_natures`。
2. 用 `--nature all --max 9`（或更小）预览，不要一上来 `--max 0`。
3. 用户确认后再放大 `max` 或分类型导出。
4. 只请求 `supported_natures` 中的类型。`UNSUPPORTED_NATURE` 时不要改成社招重试。

## 站点元信息（`job sites`）

| 字段 | 说明 |
|------|------|
| `id` | 站点 ID，用于后续 `<site>` |
| `name` | 公司名称 |
| `detail_id_field` | 详情应使用搜索结果的哪个字段 |
| `detail_id_hint` | ID 格式说明 |
| `supported_natures` | 已接入的招聘类型 |
| `default_nature` | 省略 `--nature` 时的默认值（当前均为 `social`） |
| `max_page_size` | 单次请求最大返回数量 |

compact 结果已带 `detail_id`，列表场景不必先读完整站点表。

## 标准化岗位字段

所有站点归一化为统一结构，部分字段可能为空：

| 字段 | 说明 |
|------|------|
| `id` | 官网裸 ID；跨类型比较时配合 `nature_code` |
| `detail_id` | 仅 compact view：可直接传给 `detail` 的标识 |
| `code` / `job_no` | 部分站点的岗位编码 |
| `name` / `url` | 岗位名称 / 详情页链接 |
| `category_name` | 职位类别名称 |
| `nature_code` / `nature_name` | `social/campus/intern` / `社招/校招/实习` |
| `location_names` | 工作城市 |
| `department_name` | 部门 |
| `updated_at` | 更新时间 |
| `description` / `requirement` | 完整职责 / 任职要求（compact 不含） |
| `raw` | 调试用原始字段（legacy / debug 可能含；full 不含） |

岗位 identity 为 `${nature_code}:${id}`，与跨招聘类型去重一致。

## 输出视图字段契约

- **compact**：`id`, `detail_id`, `name`, `category_name`, `nature_code`, `location_names`, `department_name`, `updated_at`, `url`。空可选字段省略。
- **full**：当前全部可枚举标准字段，去掉顶层 `raw`。
- **debug**：命令当前能获得的全部字段。单站点 search/detail/all 含 `raw`；compare 保持库层不返回 `raw`。
- **legacy**：不传 `--view`，保持旧 JSON。

字段值不被截断、改写、翻译或摘要。不要使用字段名缩写。
