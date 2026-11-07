import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Check,
  Sparkles,
  Terminal,
  Copy,
  CheckCheck,
  ExternalLink,
  ChevronRight,
  FileCode,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';

const COMPANIES_LIST = [
  { id: 'meituan', name: '美团', count: '3,420', logo: '/logos/companies/meituan.svg' },
  { id: 'bytedance', name: '字节跳动', count: '6,850', logo: '/logos/companies/bytedance.svg' },
  { id: 'tencent', name: '腾讯', count: '4,210', logo: '/logos/companies/tencent.svg' },
  { id: 'kuaishou', name: '快手', count: '1,980', logo: '/logos/companies/kuaishou.svg' },
  { id: 'xiaomi', name: '小米', count: '2,150', logo: '/logos/companies/xiaomi.svg' },
  { id: 'baidu', name: '百度', count: '1,640', logo: '/logos/companies/baidu.svg' },
  { id: 'didi', name: '滴滴', count: '1,230', logo: '/logos/companies/didi.svg' },
];

const COMPANY_DETAILS = {
  meituan: {
    name: '美团',
    logo: '/logos/companies/meituan.svg',
    title: 'AI Agent 架构师 (深圳 · 无人机业务部)',
    id: '4669710957',
    date: '2026-09-01',
    city: '深圳市',
    dept: '无人机业务部 · 决策系统中心',
    url: 'zhaopin.meituan.com/job-detail?jobId=4669710957',
    desc: '负责无人机业务场景下 AI Agent 决策系统核心架构。主导多智能体协作框架搭建，结合 LLM 与运筹算法实现高可靠复杂调度与工具自主编排。',
    responsibilities: [
      '主导无人机自主配送链路中 Multi-Agent 协作与决策系统的架构演进与落地；',
      '攻坚复杂环境下的 LLM Function Calling、任务反思（Reflection）与容灾熔断；',
      '负责高并发场景下的向量检索（RAG）工程化与时空数据感知模型推理加速。',
    ],
    requirements: [
      { text: '精通 Python / Java，具备大型分布式高并发工程落地经验 (3 年以上)', tag: '硬性要求' },
      { text: '熟悉 LLM Function Calling、ReAct 决策范式与 RAG 检索增强', tag: '技术核心' },
      { text: '深入理解 LangChain / AutoGPT / 多智能体自主协同调度框架', tag: '加分项' },
    ],
    skills: [
      { pct: '88%', label: 'Function Calling' },
      { pct: '76%', label: 'RAG 向量检索' },
      { pct: '68%', label: 'Python / PyTorch' },
      { pct: '54%', label: '多智能体协同' },
    ],
    searchResults: [
      { id: '4669710957', title: 'AI Agent 架构师', dept: '无人机业务部', city: '深圳', nature: '社招', date: '2026-09-01', match: '98% 匹配' },
      { id: '4669820194', title: '大模型平台研发专家', dept: '基础研发平台', city: '北京', nature: '社招', date: '2026-08-30', match: '92% 匹配' },
      { id: '4669103822', title: 'RAG 向量检索技术专家', dept: '美团搜索技术中心', city: '北京/上海', nature: '社招', date: '2026-08-28', match: '89% 匹配' },
      { id: '4669482910', title: '具身大模型决策算法专家', dept: '自动车配送部', city: '北京', nature: '社招', date: '2026-08-25', match: '85% 匹配' },
      { id: '4669018294', title: 'LLM 推理加速高级工程师', dept: '基础架构部', city: '深圳', nature: '校招/社招', date: '2026-08-23', match: '82% 匹配' },
    ],
    rawJson: {
      code: 200,
      jobId: '4669710957',
      jobTitle: 'AI Agent 架构师',
      departmentName: '无人机业务部',
      cityName: '深圳市',
      workNature: '社会招聘',
      refreshTime: 1725177600000,
      gatewaySign: 'hmac-sha256-verified-200-ok',
      dataSource: 'official_meituan_api',
    },
  },
  bytedance: {
    name: '字节跳动',
    logo: '/logos/companies/bytedance.svg',
    title: '大模型应用架构专家 (Flow 业务线 · 上海/深圳)',
    id: '1749281',
    date: '2026-08-30',
    city: '上海市 / 深圳市',
    dept: 'Flow 平台 · 智能体引擎组',
    url: 'job.bytedance.com/society/position/detail/1749281',
    desc: '主导 Flow 业务线下一代 Agent 自主执行系统，攻坚长上下文规划与多模型协作编排，负责海量并发下的 Prompt 与检索可靠性工程。',
    responsibilities: [
      '负责 Flow 智能体创建平台底层 Agent Execution Runtime 核心架构设计；',
      '攻坚 Long-context 窗口管理、Working Memory 与外部 API 工具生态集成；',
      '搭建高可用向量知识库索引系统与全链路自动化 Benchmark 评估评测体系。',
    ],
    requirements: [
      { text: '计算机相关专业，3 年以上大模型应用落地或搜索推荐工程经验', tag: '硬性要求' },
      { text: '熟练掌握 Agent Planning、Memory 机制及复杂工具链反思模式', tag: '技术核心' },
      { text: '在开源大模型社区有知名 Agent 项目贡献或独立落地者优先', tag: '加分项' },
    ],
    skills: [
      { pct: '92%', label: 'Prompt Engineering' },
      { pct: '84%', label: 'LangChain / LlamaIndex' },
      { pct: '72%', label: 'Vector DB (Milvus)' },
      { pct: '65%', label: 'Go / 高并发微服务' },
    ],
    searchResults: [
      { id: '1749281', title: '大模型应用架构专家 (Flow)', dept: 'Flow 平台', city: '上海/深圳', nature: '社招', date: '2026-08-30', match: '99% 匹配' },
      { id: '1748290', title: '智能体提示词工程专家', dept: '豆包大模型团队', city: '北京', nature: '社招', date: '2026-08-29', match: '94% 匹配' },
      { id: '1747192', title: '多模态 Agent 算法工程师', dept: 'AI Lab', city: '北京/上海', nature: '社招', date: '2026-08-27', match: '90% 匹配' },
      { id: '1746011', title: '大模型推理优化架构师', dept: '基础架构体系', city: '杭州', nature: '社招', date: '2026-08-24', match: '86% 匹配' },
      { id: '1745198', title: 'AI 代码辅助工具架构专家', dept: '研发效能部', city: '北京', nature: '社招', date: '2026-08-21', match: '81% 匹配' },
    ],
    rawJson: {
      status: 0,
      positionId: '1749281',
      title: '大模型应用架构专家',
      sub_department: 'Flow业务组',
      city_list: ['上海', '深圳'],
      recruit_type: 'social',
      publish_timestamp: 1725004800,
      direct_api: true,
    },
  },
  tencent: {
    name: '腾讯',
    logo: '/logos/companies/tencent.svg',
    title: '大模型应用研发专家 (混元团队 · 深圳/北京)',
    id: 'TX-HY-9921',
    date: '2026-08-31',
    city: '深圳市 / 北京市',
    dept: 'PCG 技术工程事业群 · 混元大模型部',
    url: 'careers.tencent.com/jobdesc.html?postId=TX-HY-9921',
    desc: '基于混元通用大模型与领域专属模型，设计产业级智能体解决方案，打造下一代工作流自主助手与知识库精准检索系统。',
    responsibilities: [
      '负责混元生态下企业级 Agent Framework 的核心研发与落地；',
      '优化 Function Calling 语义解析精度与多步骤规划可靠度；',
      '主导自研高性能 RAG 知识检索系统架构与高并发低延迟推理服务。',
    ],
    requirements: [
      { text: '具有深厚工程研发功底，精通 C++ 或 Go，具备高并发服务调优能力', tag: '硬性要求' },
      { text: '熟悉大模型推理加速与 Agent 评测 Benchmark 建设体系', tag: '技术核心' },
      { text: '有真实落地过 DAU 10万+ AI 落地产品系统架构经验者优先', tag: '加分项' },
    ],
    skills: [
      { pct: '89%', label: '混元大模型生态' },
      { pct: '79%', label: 'Agent 决策框架' },
      { pct: '70%', label: '高性能 C++ / Go' },
      { pct: '58%', label: '端到端评估评测' },
    ],
    searchResults: [
      { id: 'TX-HY-9921', title: '大模型应用研发专家', dept: 'PCG 混元部', city: '深圳/北京', nature: '社招', date: '2026-08-31', match: '97% 匹配' },
      { id: 'TX-AI-8812', title: '微信智能对话 Agent 专家', dept: 'WXG 微信事业群', city: '广州', nature: '社招', date: '2026-08-29', match: '93% 匹配' },
      { id: 'TX-CS-7711', title: '腾讯云行业 Agent 解决方案架构师', dept: 'CSIG 云与智慧产业', city: '深圳', nature: '社招', date: '2026-08-26', match: '88% 匹配' },
      { id: 'TX-TE-6623', title: 'C++ 高性能大模型引擎专家', dept: 'TEG 技术工程', city: '深圳', nature: '社招', date: '2026-08-24', match: '84% 匹配' },
      { id: 'TX-IE-5510', title: '多模态内容理解算法研究员', dept: 'IEG 互动娱乐', city: '上海', nature: '校招/社招', date: '2026-08-20', match: '80% 匹配' },
    ],
    rawJson: {
      ret: 0,
      PostId: 'TX-HY-9921',
      RecruitPostName: '大模型应用研发专家',
      BGName: 'PCG',
      LocationName: '深圳,北京',
      LastUpdateTime: '2026年08月31日',
      StandardizedBy: 'JobHunt-CLI',
    },
  },
  kuaishou: {
    name: '快手',
    logo: '/logos/companies/kuaishou.svg',
    title: 'AI Agent 全栈研发专家 (主站研发中心 · 北京/杭州)',
    id: '104829',
    date: '2026-08-28',
    city: '北京市 / 杭州市',
    dept: '主站研发中心 · 创作者 AI 赋能组',
    url: 'zhaopin.kuaishou.cn/recruit/e/#/official/job-info/104829',
    desc: '负责快手主站创作者生态大模型 Agent 系统研发，运用网关 HMAC 校验构建低延迟 API 枢纽，实现多模态素材自动合成与决策分发。',
    responsibilities: [
      '主导短视频创作者专属 Agent 编排流与 FastAPI 微服务架构；',
      '实现底层网关 HMAC-SHA256 自动化调用与分布式异步任务队列；',
      '搭建 Vue 3 可视化编排控制台，打通剧本构思到音画生成的全流程。',
    ],
    requirements: [
      { text: '熟练掌握 Python / Java，深刻理解公开网关安全认证与限流防刷', tag: '硬性要求' },
      { text: '具备多模态内容理解与自主工作流系统搭建经验', tag: '技术核心' },
      { text: '有短视频推荐或创作者平台 AI 赋能经验者优先', tag: '加分项' },
    ],
    skills: [
      { pct: '86%', label: 'HMAC 网关签名' },
      { pct: '78%', label: '多模态 Agent' },
      { pct: '69%', label: 'FastAPI / Python' },
      { pct: '52%', label: 'Vue 3 可视化' },
    ],
    searchResults: [
      { id: '104829', title: 'AI Agent 全栈研发专家', dept: '主站研发中心', city: '北京/杭州', nature: '社招', date: '2026-08-28', match: '96% 匹配' },
      { id: '104192', title: '快手快意大模型算法专家', dept: 'AI 技术中心', city: '北京', nature: '社招', date: '2026-08-25', match: '91% 匹配' },
      { id: '103810', title: '直播间智能互动 Agent 架构师', dept: '直播业务线', city: '北京', nature: '社招', date: '2026-08-22', match: '87% 匹配' },
      { id: '103290', title: '音视频 AIGC 渲染引擎专家', dept: '多媒体技术部', city: '杭州', nature: '社招', date: '2026-08-19', match: '83% 匹配' },
      { id: '102914', title: '分布式爬虫与数据平台架构师', dept: '基础数据部', city: '北京', nature: '社招', date: '2026-08-15', match: '79% 匹配' },
    ],
    rawJson: {
      result: 1,
      id: 104829,
      name: 'AI Agent 全栈研发专家',
      deptName: '主站研发',
      workLocation: '北京',
      hmacValidated: true,
      rawVerified: true,
    },
  },
  xiaomi: {
    name: '小米',
    logo: '/logos/companies/xiaomi.svg',
    title: '端侧大模型算法专家 (手机软件部 · 北京/武汉)',
    id: 'XM-AI-2026-08',
    date: '2026-09-02',
    city: '北京市 / 武汉市',
    dept: '手机软件部 · AI 实验室端侧算法组',
    url: 'hr.xiaomi.com/job/detail/XM-AI-2026-08',
    desc: '负责小米澎湃 OS 端侧大模型与端侧 Agent 系统核心算法研发，攻坚模型轻量化量化剪枝与 NPU 推理引擎极致加速。',
    responsibilities: [
      '研发澎湃 OS 手机与车机端侧 1B~7B 大模型量化（AWQ/GPTQ）与剪枝算法；',
      '主导端侧多模态 Agent 意图识别引擎架构，优化 NPU 功耗与内存占用；',
      '攻坚端云协同通信协议设计，实现跨设备端侧服务自主调度。',
    ],
    requirements: [
      { text: '硕士及以上学历，精通 C++ / Python，熟练掌握 TensorRT / ONNX Runtime', tag: '硬性要求' },
      { text: '深入理解大模型 AWQ / GPTQ 量化算法与端侧显存开销压缩', tag: '技术核心' },
      { text: '在 CVPR / ACL / NeurIPS 等顶会有端侧推理相关论文者优先', tag: '加分项' },
    ],
    skills: [
      { pct: '94%', label: '端侧模型轻量化' },
      { pct: '87%', label: 'NPU 推理加速' },
      { pct: '74%', label: 'C++ / Android NDK' },
      { pct: '61%', label: '澎湃 OS 互联' },
    ],
    searchResults: [
      { id: 'XM-AI-2026-08', title: '端侧大模型算法专家', dept: '手机软件部', city: '北京/武汉', nature: '社招', date: '2026-09-02', match: '98% 匹配' },
      { id: 'XM-OS-1029', title: '澎湃 OS 智能体框架专家', dept: '系统架构部', city: '北京', nature: '社招', date: '2026-08-30', match: '93% 匹配' },
      { id: 'XM-EV-9912', title: '小米汽车智能座舱 Agent 算法专家', dept: '汽车软件部', city: '上海/北京', nature: '社招', date: '2026-08-27', match: '89% 匹配' },
      { id: 'XM-NPU-8821', title: '移动端 NPU 编译器与算子研发', dept: '芯片研发部', city: '武汉', nature: '社招', date: '2026-08-23', match: '85% 匹配' },
      { id: 'XM-SP-7710', title: '多模态语音交互算法研究员', dept: '小爱同学部', city: '北京', nature: '校招/社招', date: '2026-08-18', match: '81% 匹配' },
    ],
    rawJson: {
      code: 0,
      jobCode: 'XM-AI-2026-08',
      jobName: '端侧大模型算法专家',
      deptName: '手机软件部',
      cityName: '北京',
      platform: 'hr.xiaomi.com',
    },
  },
  baidu: {
    name: '百度',
    logo: '/logos/companies/baidu.svg',
    title: '自动驾驶 Agent 算法专家 (智能驾驶 IDG · 北京)',
    id: 'BD-AD-4412',
    date: '2026-08-29',
    city: '北京市',
    dept: '智能驾驶事业群 (IDG) · Apollo 团队',
    url: 'talent.baidu.com/jobs/detail/BD-AD-4412',
    desc: '负责百度 Apollo 智能座舱大模型与车规级决策 Agent 架构，打通端云协同环境感知与多轮复杂语音意图理解。',
    responsibilities: [
      '主导 Apollo 平台端云混合大模型决策引擎架构，保障车规级低延迟响应；',
      '攻坚复杂意图槽位抽取与状态机决策树设计，支持连续多步控制；',
      '结合文心一言核心 API，构建座舱主动服务与车载工作流插件体系。',
    ],
    requirements: [
      { text: '精通 Linux C++ 与 Python，有车载系统或高可靠系统架构经验', tag: '硬性要求' },
      { text: '深刻理解大模型在垂直场景的意图插槽提取与状态机控制流', tag: '技术核心' },
      { text: '有车规级软件研发与端侧模型落地经验者优先', tag: '加分项' },
    ],
    skills: [
      { pct: '91%', label: '端云协同架构' },
      { pct: '81%', label: 'Apollo 智能座舱' },
      { pct: '73%', label: '意图识别 / SLU' },
      { pct: '56%', label: '文心一言 API' },
    ],
    searchResults: [
      { id: 'BD-AD-4412', title: '自动驾驶 Agent 算法专家', dept: '智能驾驶 IDG', city: '北京', nature: '社招', date: '2026-08-29', match: '97% 匹配' },
      { id: 'BD-WX-3321', title: '文心智能体核心架构师', dept: 'MEG 移动生态', city: '北京', nature: '社招', date: '2026-08-26', match: '92% 匹配' },
      { id: 'BD-CL-2210', title: '千帆大模型平台后端专家', dept: '百度智能云', city: '北京/上海', nature: '社招', date: '2026-08-22', match: '88% 匹配' },
      { id: 'BD-SE-1109', title: '新一代智能搜索 Agent 研发专家', dept: '百度搜索技术部', city: '深圳', nature: '社招', date: '2026-08-19', match: '84% 匹配' },
      { id: 'BD-AI-0091', title: '飞桨深度学习推理加速工程师', dept: 'AI 技术平台', city: '北京', nature: '校招/社招', date: '2026-08-14', match: '80% 匹配' },
    ],
    rawJson: {
      postCode: 'BD-AD-4412',
      name: '自动驾驶 Agent 算法专家',
      orgName: '智能驾驶事业群',
      workPlace: '北京',
      apiMode: 'ssr_html_extracted',
    },
  },
  didi: {
    name: '滴滴',
    logo: '/logos/companies/didi.svg',
    title: '核心调度大模型架构师 (出行技术部 · 北京)',
    id: 'DD-TECH-0881',
    date: '2026-09-01',
    city: '北京市',
    dept: '出行技术部 · 智能调度与供需预测组',
    url: 'talent.didiglobal.com/jobs/detail/DD-TECH-0881',
    desc: '主导滴滴全球出行运力匹配与供需预测中的强化学习与大模型 Agent 结合方案，提升复杂路网下的动态调配决策效率。',
    responsibilities: [
      '主导滴滴全局派单与供需平衡中 Agent 自主感知与策略生成框架；',
      '将大规模时空图算法与 LLM 知识库结合，优化路况突发事件自适应调度；',
      '负责高并发分布式调度引擎的平滑容灾演进。',
    ],
    requirements: [
      { text: '具备超大型分布式系统架构能力，精通大规模图算法与时空数据处理', tag: '硬性要求' },
      { text: '熟悉大模型在运筹优化 (Operations Research) 领域的结合实践', tag: '技术核心' },
      { text: '有出行、物流或外卖即时配送调度算法核心研发经验者优先', tag: '加分项' },
    ],
    skills: [
      { pct: '89%', label: '强化学习决策' },
      { pct: '82%', label: '时空供需预测' },
      { pct: '71%', label: '分布式调度系统' },
      { pct: '59%', label: 'Go / 高并发' },
    ],
    searchResults: [
      { id: 'DD-TECH-0881', title: '核心调度大模型架构师', dept: '出行技术部', city: '北京', nature: '社招', date: '2026-09-01', match: '98% 匹配' },
      { id: 'DD-MAP-7721', title: '地图路径规划 Agent 算法专家', dept: '滴滴地图部', city: '北京', nature: '社招', date: '2026-08-28', match: '93% 匹配' },
      { id: 'DD-CS-6612', title: '智能客服多轮对话 Agent 架构师', dept: '服务运营部', city: '杭州', nature: '社招', date: '2026-08-25', match: '89% 匹配' },
      { id: 'DD-SEC-5510', title: '出行安全风控大模型专家', dept: '安全技术部', city: '北京', nature: '社招', date: '2026-08-21', match: '84% 匹配' },
      { id: 'DD-DATA-4401', title: '海量时空数据基础架构工程师', dept: '基础平台部', city: '北京', nature: '校招/社招', date: '2026-08-16', match: '80% 匹配' },
    ],
    rawJson: {
      errno: 0,
      job_id: 'DD-TECH-0881',
      job_name: '核心调度大模型架构师',
      department: '出行技术部',
      location: '北京',
      protocol: 'open_gateway',
    },
  },
};

export function MacWindowMockup({ activeTab = 'summary' }) {
  const [selectedCompany, setSelectedCompany] = useState('meituan');
  const [activeNature, setActiveNature] = useState('social');
  const [checkedItems, setCheckedItems] = useState([true, true, false]);
  const [copied, setCopied] = useState(false);
  const [detailMode, setDetailMode] = useState('normalized'); // 'normalized' | 'raw'

  const currentJob = COMPANY_DETAILS[selectedCompany] || COMPANY_DETAILS.meituan;

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const natureArg = activeNature === 'all_natures' ? '' : `--nature ${activeNature} `;
  
  // Dynamic command tailored to active tab
  let activeCommand = `job ${selectedCompany} search "AI" ${natureArg}--limit 5`.replace(/\s+/g, ' ');
  if (activeTab === 'detail') {
    activeCommand = `job ${selectedCompany} detail "${currentJob.id}"`;
  } else if (activeTab === 'compare') {
    activeCommand = `job compare "大模型" --sites meituan,bytedance,tencent,xiaomi`;
  } else if (activeTab === 'analyze') {
    activeCommand = `job ${selectedCompany} analyze --output markdown`;
  }

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(activeCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-[14px] bg-[var(--m-win)] border border-[var(--m-win-line)] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_20px_50px_-20px_rgba(0,0,0,0.14)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_50px_-20px_rgba(0,0,0,0.6)] overflow-hidden text-left font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        {/* Left Sidebar (Desktop) */}
        <div className="hidden md:flex md:col-span-4 lg:col-span-3.5 flex-col justify-between border-r border-[var(--m-win-line)] bg-[var(--m-win-side)] p-4 select-none">
          <div>
            {/* Window control traffic lights */}
            <div className="flex items-center justify-between pb-5">
              <div className="flex items-center gap-2" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d8a123]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1fa833]" />
              </div>
              <span className="text-[10px] font-mono font-medium text-[var(--m-muted)] bg-[var(--m-chip)] px-2 py-0.5 rounded">
                v1.2.0 · CLI
              </span>
            </div>

            {/* Nature Channels (招聘性质) */}
            <div className="space-y-1 text-xs text-[var(--m-muted)]">
              {[
                { id: 'all_natures', label: '全部渠道 (All Natures)', count: '18,520' },
                { id: 'social', label: '社会招聘 (Social · 默认)', count: '12,410' },
                { id: 'campus', label: '校园招聘 (Campus)', count: '4,280' },
                { id: 'intern', label: '实习招聘 (Intern)', count: '1,830' },
              ].map((item) => {
                const isActive = activeNature === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveNature(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors text-left active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--m-accent)] ${
                      isActive
                        ? 'bg-[var(--m-chip)] text-[var(--m-ink)] font-medium'
                        : 'hover:bg-[var(--m-chip)]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[11px] font-mono tabular-nums text-[var(--m-muted)]">{item.count}</span>
                  </button>
                );
              })}
            </div>

            {/* CHANNELS / COMPANIES WITH REAL LOGOS */}
            <div className="mt-6">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--m-muted)] block mb-2 px-2.5 font-mono">
                COMPANIES (30+ 官方站点)
              </span>
              <div className="space-y-1 text-xs text-[var(--m-muted)]">
                {COMPANIES_LIST.map((comp) => {
                  const isSelected = selectedCompany === comp.id;
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => setSelectedCompany(comp.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-[background-color,transform] duration-150 cursor-pointer active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--m-accent)] ${
                        isSelected
                          ? 'bg-[var(--m-chip)] text-[var(--m-ink)] font-medium'
                          : 'hover:bg-[var(--m-chip)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={comp.logo}
                          alt=""
                          aria-hidden="true"
                          className="h-3.5 w-auto max-w-[3.5rem] object-contain shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="truncate">{comp.name}</span>
                      </div>
                      <span className="text-[10px] font-mono tabular-nums opacity-60 shrink-0">{comp.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Card in Sidebar */}
          <div className="p-3 rounded-lg bg-[var(--m-chip)] border border-[var(--m-line)] text-xs space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[var(--m-muted)] tracking-wider block font-mono">
              PROTOCOL · ZERO AUTH
            </span>
            <div className="font-semibold text-[var(--m-ink)] font-mono text-[11px] truncate">
              {activeCommand}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span>官方直连网关 · 毫秒级响应</span>
            </div>
          </div>
        </div>

        {/* Right Main Content Pane */}
        <div className="col-span-1 md:col-span-8 lg:col-span-8.5 p-5 sm:p-7 flex flex-col justify-between bg-[var(--m-win)]">
          <div>
            {/* Mobile Company Scroller (Ensures mobile users can switch companies, per better-layout) */}
            <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-[var(--m-line)] [scrollbar-width:none]">
              {COMPANIES_LIST.map((comp) => {
                const isSelected = selectedCompany === comp.id;
                return (
                  <button
                    key={`mob-${comp.id}`}
                    type="button"
                    onClick={() => setSelectedCompany(comp.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--m-ink)] text-[var(--m-paper)]'
                        : 'bg-[var(--m-chip)] text-[var(--m-muted)]'
                    }`}
                  >
                    <img src={comp.logo} alt="" className="h-3 w-auto object-contain" />
                    <span>{comp.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub-Header bar inside window */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--m-line)] gap-3">
              <div className="flex items-center gap-2">
                <img
                  src={currentJob.logo}
                  alt={currentJob.name}
                  className="h-4 w-auto object-contain"
                />
                <span className="font-semibold text-sm sm:text-base text-[var(--m-ink)] font-sans">
                  {currentJob.name} 招聘网关 · {
                    activeTab === 'search' ? '实时搜索结果' :
                    activeTab === 'detail' ? '岗位详情探查' :
                    activeTab === 'compare' ? '多司同屏比对' :
                    activeTab === 'analyze' ? '趋势洞察分析' :
                    '结构化职位概览'
                  }
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-mono font-medium">
                  ● 200 OK
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[var(--m-muted)]">
                <span className="truncate max-w-[280px] bg-[var(--m-panel)] px-2.5 py-1 rounded border border-[var(--m-line)] text-[11px]">
                  $ {activeCommand}
                </span>
              </div>
            </div>

            {/* TAB-DRIVEN DYNAMIC CONTENT VIEW */}
            <div className="pt-4 min-h-[380px]">
              <AnimatePresence mode="wait">
                {/* 1. 实时搜索 VIEW */}
                {activeTab === 'search' && (
                  <motion.div
                    key={`view-search-${selectedCompany}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-[var(--m-muted)] pb-1">
                      <span className="font-mono">
                        共检索到 <strong className="text-[var(--m-ink)] font-semibold">{currentJob.searchResults.length}</strong> 条在招岗位 (耗时 84ms)
                      </span>
                      <span className="font-mono text-[11px]">状态: 自动过滤失效/过期数据</span>
                    </div>

                    <div className="space-y-2">
                      {currentJob.searchResults.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-[var(--m-panel)] border border-[var(--m-line)] hover:border-[var(--m-line-strong)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[var(--m-ink)]">
                                {item.title}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--m-chip)] text-[var(--m-muted)] font-mono">
                                ID: {item.id}
                              </span>
                            </div>
                            <div className="text-[11px] text-[var(--m-muted)] flex items-center gap-3">
                              <span>部门: {item.dept}</span>
                              <span>·</span>
                              <span>城市: {item.city}</span>
                              <span>·</span>
                              <span>性质: {item.nature}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                              {item.match}
                            </span>
                            <span className="text-[11px] text-[var(--m-muted)] font-mono">
                              {item.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 2. 岗位详情 VIEW */}
                {activeTab === 'detail' && (
                  <motion.div
                    key={`view-detail-${selectedCompany}-${detailMode}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {/* View Switcher: Normalized vs Raw JSON */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex rounded-lg bg-[var(--m-chip)] p-0.5 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => setDetailMode('normalized')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                            detailMode === 'normalized'
                              ? 'bg-[var(--m-card)] text-[var(--m-ink)] font-semibold shadow-2xs'
                              : 'text-[var(--m-muted)] hover:text-[var(--m-ink)]'
                          }`}
                        >
                          结构化规范字段 (Normalized)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailMode('raw')}
                          className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                            detailMode === 'raw'
                              ? 'bg-[var(--m-card)] text-[var(--m-ink)] font-semibold shadow-2xs'
                              : 'text-[var(--m-muted)] hover:text-[var(--m-ink)]'
                          }`}
                        >
                          <FileCode className="w-3 h-3" />
                          <span>底层原始结构 (Raw JSON)</span>
                        </button>
                      </div>
                      <span className="text-[11px] text-[var(--m-muted)] font-mono hidden sm:inline">
                        职位 ID: {currentJob.id}
                      </span>
                    </div>

                    {detailMode === 'normalized' ? (
                      <div className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-[var(--m-panel)] border border-[var(--m-line)] space-y-2">
                          <h4 className="text-xs font-bold text-[var(--m-ink)]">
                            {currentJob.title}
                          </h4>
                          <p className="text-xs text-[var(--m-muted)] leading-relaxed">
                            {currentJob.desc}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-[var(--m-panel)] border border-[var(--m-line)] space-y-2">
                            <span className="text-[10px] font-semibold text-[var(--m-muted)] uppercase font-mono block">
                              岗位核心职责 (Responsibilities)
                            </span>
                            <ul className="space-y-1.5 text-xs text-[var(--m-ink)] list-disc pl-4">
                              {currentJob.responsibilities.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 rounded-xl bg-[var(--m-panel)] border border-[var(--m-line)] space-y-2">
                            <span className="text-[10px] font-semibold text-[var(--m-muted)] uppercase font-mono block">
                              任职要求 (Qualifications)
                            </span>
                            <ul className="space-y-1.5 text-xs text-[var(--m-ink)] list-disc pl-4">
                              {currentJob.requirements.map((req, i) => (
                                <li key={i}>{req.text}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-[var(--m-card)] border border-[var(--m-line)] font-mono text-xs overflow-x-auto text-[var(--m-ink)]">
                        <pre className="text-[11px] leading-relaxed">
                          {JSON.stringify(currentJob.rawJson, null, 2)}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 3. 结构化概览 VIEW (Default) */}
                {activeTab === 'summary' && (
                  <motion.div
                    key={`view-summary-${selectedCompany}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-5"
                  >
                    {/* Left Column (8 cols) */}
                    <div className="lg:col-span-8 space-y-5">
                      <p className="text-xs sm:text-sm text-[var(--m-ink)] leading-relaxed">
                        {currentJob.desc}
                      </p>

                      <div className="p-3.5 rounded-xl bg-[var(--m-panel)] border border-[var(--m-line)]">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--m-muted)] font-mono block mb-2">
                          STANDARDIZED SCHEMA (统一标准字段)
                        </span>
                        <ul className="space-y-1.5 text-xs text-[var(--m-ink)] list-disc pl-4 font-mono">
                          <li><strong className="font-semibold">name (职位名称):</strong> {currentJob.title.split(' (')[0]}</li>
                          <li><strong className="font-semibold">nature_code (性质):</strong> {activeNature} · 城市: {currentJob.city}</li>
                          <li><strong className="font-semibold">url (官网直链):</strong> {currentJob.url}</li>
                          <li><strong className="font-semibold">raw (底层数据):</strong> 保留{currentJob.name}底层原始结构，杜绝解析黑盒</li>
                        </ul>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--m-muted)] block mb-2 font-mono">
                          CORE REQUIREMENTS (核心要求提炼)
                        </span>
                        <div className="space-y-1.5" role="group" aria-label="核心岗位要求">
                          {currentJob.requirements.map((item, idx) => (
                            <button
                              key={item.text}
                              type="button"
                              role="checkbox"
                              aria-checked={checkedItems[idx]}
                              onClick={() => toggleCheck(idx)}
                              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[var(--m-panel)] cursor-pointer text-xs transition-colors text-left active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--m-accent)]"
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                    checkedItems[idx]
                                      ? 'bg-[var(--m-ink)] border-[var(--m-ink)] text-[var(--m-paper)]'
                                      : 'border-[var(--m-line-strong)]'
                                  }`}
                                  aria-hidden="true"
                                >
                                  {checkedItems[idx] && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className={checkedItems[idx] ? 'line-through text-[var(--m-muted)]' : 'text-[var(--m-ink)]'}>
                                  {item.text}
                                </span>
                              </div>
                              <span className="text-[10px] text-[var(--m-muted)] font-mono shrink-0 pl-2">
                                {item.tag}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column (4 cols) */}
                    <div className="lg:col-span-4 space-y-5 lg:border-l lg:border-[var(--m-line)] lg:pl-5">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--m-muted)] block mb-2.5 font-mono">
                          KEY SKILLS (高频技能词频)
                        </span>
                        <div className="space-y-2">
                          {currentJob.skills.map((pill) => (
                            <div
                              key={pill.label}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[var(--m-panel)] text-xs text-[var(--m-ink)]"
                            >
                              <span className="text-[11px] font-medium">{pill.label}</span>
                              <span className="font-mono text-[11px] text-[var(--m-accent)] font-semibold tabular-nums">
                                {pill.pct}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--m-muted)] block mb-2 font-mono">
                          SITE DISTRIBUTION (在招大厂占比)
                        </span>
                        <div className="space-y-2 text-xs">
                          {[
                            { name: '字节跳动', pct: '38%', bar: 'bg-blue-500' },
                            { name: '美团', pct: '27%', bar: 'bg-rose-500' },
                            { name: '腾讯', pct: '21%', bar: 'bg-sky-500' },
                            { name: '快手', pct: '14%', bar: 'bg-emerald-500' },
                          ].map((site) => (
                            <div key={site.name} className="space-y-1">
                              <div className="flex justify-between text-[11px] text-[var(--m-muted)] font-mono">
                                <span>{site.name}</span>
                                <span className="tabular-nums font-semibold">{site.pct}</span>
                              </div>
                              <div className="w-full bg-[var(--m-chip)] h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${site.bar}`} style={{ width: site.pct }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. 跨司比对 VIEW */}
                {activeTab === 'compare' && (
                  <motion.div
                    key={`view-compare-${selectedCompany}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-[var(--m-muted)] pb-1">
                      <span className="font-mono">跨 3 家主流大厂同屏对比 AI Agent 重点与门槛</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">字段 Schema 100% 对齐</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          comp: '美团',
                          logo: '/logos/companies/meituan.svg',
                          title: 'AI Agent 架构师',
                          dept: '无人机业务部',
                          focus: '复杂动态调度、Function Calling 外部工具链编排',
                          exp: '5 年以上',
                          city: '深圳',
                        },
                        {
                          comp: '字节跳动',
                          logo: '/logos/companies/bytedance.svg',
                          title: '大模型应用架构专家',
                          dept: 'Flow 业务线',
                          focus: 'Prompt Engineering、LangChain、自主 Agent 编排',
                          exp: '3-5 年',
                          city: '上海/深圳',
                        },
                        {
                          comp: '腾讯',
                          logo: '/logos/companies/tencent.svg',
                          title: '大模型应用研发专家',
                          dept: '混元团队',
                          focus: '混元大模型决策框架、RAG 向量检索工程',
                          exp: '3-5 年',
                          city: '深圳/北京',
                        },
                      ].map((card) => (
                        <div
                          key={card.comp}
                          className="p-3.5 rounded-xl bg-[var(--m-panel)] border border-[var(--m-line)] space-y-2 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <img src={card.logo} alt={card.comp} className="h-4 w-auto object-contain" />
                              <span className="font-semibold text-xs text-[var(--m-ink)]">{card.comp}</span>
                            </div>
                            <div className="text-xs font-bold text-[var(--m-ink)]">
                              {card.title}
                            </div>
                            <div className="text-[11px] text-[var(--m-muted)] leading-relaxed">
                              {card.focus}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[var(--m-line)] flex items-center justify-between text-[10px] font-mono text-[var(--m-muted)]">
                            <span>门槛: {card.exp}</span>
                            <span>{card.city}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 5. 趋势洞察 VIEW */}
                {activeTab === 'analyze' && (
                  <motion.div
                    key={`view-analyze-${selectedCompany}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {/* Top 3 KPI Chips */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-[var(--m-panel)] border border-[var(--m-line)]">
                        <span className="text-[10px] text-[var(--m-muted)] block font-mono">在招岗位数</span>
                        <span className="text-sm font-bold text-[var(--m-ink)] font-mono tabular-nums">{currentJob.id.slice(0, 4)}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--m-panel)] border border-[var(--m-line)]">
                        <span className="text-[10px] text-[var(--m-muted)] block font-mono">平均更新周期</span>
                        <span className="text-sm font-bold text-emerald-600 font-mono tabular-nums">&lt; 3 天</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--m-panel)] border border-[var(--m-line)]">
                        <span className="text-[10px] text-[var(--m-muted)] block font-mono">核心技能集中度</span>
                        <span className="text-sm font-bold text-[var(--m-accent)] font-mono tabular-nums">76.4%</span>
                      </div>
                    </div>

                    {/* Markdown Report preview box */}
                    <div className="p-3.5 rounded-xl bg-[var(--m-card)] border border-[var(--m-line)] font-mono text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-[var(--m-muted)] pb-1 border-b border-[var(--m-line)]">
                        <span># 📊 JobHunt 自动化趋势分析简报 · {currentJob.name}</span>
                        <span className="text-emerald-600 font-semibold">✔ 生成成功</span>
                      </div>
                      <div className="text-[11px] text-[var(--m-ink)] pt-1 space-y-1 leading-relaxed">
                        <p>• <strong>核心趋势：</strong>大模型工程化聚焦 Function Calling 与复杂工具自治编排。</p>
                        <p>• <strong>硬性门槛：</strong>分布式高并发（Python/Go）与向量检索（RAG）出现率超 75%。</p>
                        <p>• <strong>招聘梯队：</strong>一线大厂核心聚焦端侧推理加速（NPU）与业务流自动化。</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Banner inside Mac Window */}
          <div className="mt-6 pt-3.5 border-t border-[var(--m-line)] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 text-[var(--m-ink)]">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" aria-hidden="true" />
              <span>
                {activeTab === 'search' && `已通过 ${currentJob.name} 招聘官网实时 API 完成检索`}
                {activeTab === 'detail' && `已获取 ${currentJob.name} 职位详情与底层 Raw 数据`}
                {activeTab === 'summary' && `已聚合 ${currentJob.name} 结构化概览与高频技能指标`}
                {activeTab === 'compare' && `已完成跨司字段映射与多维横向比对`}
                {activeTab === 'analyze' && `已完成 ${currentJob.name} 词频统计与趋势洞察提取`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCmd}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--m-ink)] text-[var(--m-paper)] text-xs font-medium hover:opacity-90 active:scale-[0.97] transition-all cursor-pointer font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--m-accent)] shrink-0"
              title="复制对应查询命令"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>已复制命令</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>一键复制当前命令</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
