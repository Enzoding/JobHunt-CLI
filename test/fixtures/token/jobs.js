const LONG_DUTY = `负责大模型与检索增强生成相关能力的设计与落地，覆盖召回、排序、评测与线上稳定性。日常工作包括：梳理业务场景中的用户意图，拆解可评测的质量指标；与数据、工程和产品同事对齐样本标注规范；设计并迭代 Prompt、工具调用与多轮对话策略；跟踪幻觉、延迟和成本之间的权衡；把离线实验结论沉淀为可复用的评测集。还需要编写灰度发布清单、异常回滚说明和周度质量回顾，保证实验结论可以复现。需要持续阅读公开技术报告，但不要求接触任何内部账号、Cookie 或个人联系方式。岗位职责文本仅用于离线 Token 测试，已脱敏。`;

const LONG_REQ = `本科及以上学历，计算机、人工智能、统计学或相关专业；3 年以上自然语言处理、推荐或搜索经验；熟悉 Python、C++ 或 Java 中至少一种；了解 Transformer、RAG、向量检索、评测集构建与 A/B 实验；具备把论文方法改造成可维护服务的能力；沟通清晰，能把技术方案写成同事读得懂的文档。加分项：开源贡献、多模态或 Agent 编排经验。本段任职要求为脱敏样例，不含简历附件或内部系统地址。`;

const MIXED_DUTY = `Build and maintain retrieval-augmented generation (RAG) pipelines for internal knowledge search. 工作涵盖 chunking、embedding、ANN 召回、rerank 与 citation 对齐。You will partner with backend engineers to ship low-latency C++/Python services, watch token cost, and keep evaluation sets versioned. Also own weekly quality reviews, rollback notes, and reproducible offline eval reports. 描述已脱敏，仅保留中英技术词供 tokenizer 采样。`;

const MIXED_REQ = `Experience with LLMs, RAG, vector databases, and offline evaluation. 熟悉 PyTorch 或 JAX，能阅读英文论文并把 baseline 复现到可比较的指标。Plus: CUDA kernels, prompt injection awareness, and structured logging. 不包含个人邮箱或手机号。`;

function rawFor(id, extra = {}) {
  return {
    source_nature_code: '1',
    source_nature_name: '社会招聘',
    vendor_job_id: id,
    ...extra,
  };
}

export function createJob(overrides = {}) {
  const id = overrides.id || 'job-001';
  const job = {
    id,
    code: '',
    job_no: '',
    name: 'AI 算法工程师',
    url: `https://jobs.example.test/roles/${id}`,
    category_code: 'tech',
    category_name: '技术类',
    nature_code: 'social',
    nature_name: '社招',
    location_codes: '110100',
    location_names: '北京',
    experience_code: '3-5',
    levels: '',
    department_code: 'ai',
    department_name: '人工智能部',
    updated_at: '2026-06-01',
    description: LONG_DUTY,
    requirement: LONG_REQ,
    raw: rawFor(id),
    ...overrides,
  };
  return job;
}

const LONG_NAMES = [
  '大模型应用算法工程师',
  '推荐算法工程师',
  '搜索相关性算法专家',
  '对话系统算法工程师',
  '计算机视觉算法工程师',
  '语音识别算法工程师',
  '知识图谱工程师',
  '机器学习平台工程师',
  '数据科学工程师',
  '智能业务算法工程师',
];

const MIXED_NAMES = [
  'RAG Platform Engineer',
  'LLM Inference Engineer',
  'C++ High Performance Engineer',
  'Multimodal AI Engineer',
  'Agent Runtime Engineer',
  'Embedding Systems Engineer',
  'Eval Platform Engineer',
  'Prompt Engineering Specialist',
  'ML Compiler Engineer',
  'AI Safety Engineer',
];

const CITIES = ['北京', '上海', '深圳', '杭州', '广州'];
const DEPTS = ['人工智能部', '搜索推荐部', '基础架构部', '数据科学部', '大模型应用部'];

export function createLongZhJobs() {
  return LONG_NAMES.map((name, index) => createJob({
    id: `zh-${String(index + 1).padStart(3, '0')}`,
    name,
    location_names: CITIES[index % CITIES.length],
    department_name: DEPTS[index % DEPTS.length],
    updated_at: `2026-05-${String((index % 28) + 1).padStart(2, '0')}`,
    description: `${LONG_DUTY} 本岗位侧重${name}方向，需要把评测集、灰度发布和线上监控串成闭环。补充说明第 ${index + 1} 条，避免十条样本完全重复。`,
    requirement: `${LONG_REQ} 本方向额外关注${name}相关项目经历。样例序号 ${index + 1}。`,
  }));
}

export function createMixedTechJobs() {
  return MIXED_NAMES.map((name, index) => createJob({
    id: `mix-${String(index + 1).padStart(3, '0')}`,
    name,
    category_name: '技术类',
    location_names: CITIES[index % CITIES.length],
    department_name: DEPTS[index % DEPTS.length],
    updated_at: `2026-04-${String((index % 28) + 1).padStart(2, '0')}`,
    description: `${MIXED_DUTY} Role focus: ${name}. Sample ${index + 1}.`,
    requirement: `${MIXED_REQ} Preferred stack mention: ${name}. Sample ${index + 1}.`,
  }));
}

export function createShortJobs() {
  return [
    createJob({
      id: 'short-001',
      name: '产品经理',
      description: '负责需求评审。',
      requirement: '有 B 端经验。',
      location_names: '北京',
      department_name: '产品部',
    }),
    createJob({
      id: 'short-002',
      name: '设计师',
      description: '输出视觉规范。',
      requirement: '熟悉 Figma。',
      location_names: '上海',
      department_name: '设计部',
    }),
    createJob({
      id: 'short-003',
      name: '运营专员',
      description: '活动执行。',
      requirement: '沟通能力强。',
      location_names: '深圳',
      department_name: '运营部',
    }),
    createJob({
      id: 'short-004',
      name: '测试工程师',
      description: '编写用例。',
      requirement: '了解接口测试。',
      location_names: '杭州',
      department_name: '质量部',
    }),
    createJob({
      id: 'short-005',
      name: '行政助理',
      description: '支持日常行政。',
      requirement: '细心负责。',
      location_names: '广州',
      department_name: '行政部',
    }),
  ];
}

export function createDetailIdJobs() {
  return {
    usesId: createJob({
      id: 'mt-1001',
      name: '美团风格岗位（detail 用 id）',
    }),
    usesCode: createJob({
      id: 'inner-88',
      code: 'A57861',
      name: '字节风格岗位（detail 用 code）',
    }),
    missingCode: createJob({
      id: 'fallback-22',
      code: '',
      name: '缺少 code，应回退 id',
    }),
    missingBoth: createJob({
      id: '',
      code: '',
      name: '缺少 id 与 code',
      nature_code: 'social',
    }),
  };
}

export function createEmptyFieldJob() {
  return createJob({
    id: 'empty-001',
    name: '空字段样本',
    category_name: '',
    location_names: [],
    department_name: null,
    updated_at: undefined,
    url: '',
    description: LONG_DUTY,
    requirement: LONG_REQ,
  });
}

export function createNestedRawJob() {
  const job = createJob({
    id: 'raw-001',
    name: '嵌套 raw 样本',
  });
  job.raw = {
    source_nature_code: 'campus_v2',
    source_nature_name: '校园招聘',
    nested: { vendor: 'example', flags: ['debug', 'mapping'] },
  };
  return job;
}

export function createComparePayload() {
  const meituanJobs = createLongZhJobs().map(job => {
    const clone = { ...job };
    delete clone.raw;
    return clone;
  });
  const xiaomiJobs = createMixedTechJobs().map(job => {
    const clone = { ...job };
    delete clone.raw;
    return clone;
  });
  return {
    query: 'AI',
    nature: 'social',
    category: '',
    location: '',
    max_per_site: 10,
    sites: ['meituan', 'xiaomi', 'tencent'],
    results: [
      { site: 'meituan', count: meituanJobs.length, jobs: meituanJobs, error: null },
      { site: 'xiaomi', count: xiaomiJobs.length, jobs: xiaomiJobs, error: null },
      {
        site: 'tencent',
        count: 0,
        jobs: [],
        error: { code: 'API_ERROR', message: 'fixture site timeout' },
      },
    ],
  };
}

export function createAnalyzeResult() {
  const rows = [
    ...createLongZhJobs().slice(0, 6),
    ...createMixedTechJobs().slice(0, 4),
  ];
  return {
    summary: {
      total: rows.length,
      natures: [['社招', 10]],
      locations: [['北京', 3], ['上海', 2], ['深圳', 2], ['杭州', 2], ['广州', 1]],
      categories: [['技术类', 10]],
      departments: [['人工智能部', 3], ['搜索推荐部', 2], ['基础架构部', 2], ['数据科学部', 2], ['大模型应用部', 1]],
      timeBuckets: [['2026-06', 2], ['2026-05', 5], ['2026-04', 3]],
      skillTerms: [['RAG', 6], ['评测', 5], ['embedding', 4], ['C++', 3]],
      requirementTerms: [['Python', 6], ['Transformer', 4], ['论文', 3]],
    },
    rows,
  };
}

export const SEARCH_FIXTURE_WEIGHTS = {
  'jobs-long-zh': 4,
  'jobs-mixed-tech': 3,
  'jobs-short': 1,
};

export function searchFixtureGroups() {
  return {
    'jobs-long-zh': createLongZhJobs(),
    'jobs-mixed-tech': createMixedTechJobs(),
    'jobs-short': createShortJobs(),
  };
}
