export const CONFIG = {
  id: 'minimax',
  opencliSite: 'minimax-jobs',
  name: 'MiniMax',
  description: 'MiniMax social, campus, and intern recruitment',
  domain: 'vrfi1sk8a0.jobs.feishu.cn',
  path: '/index',
  supportedNatures: ['social', 'campus', 'intern'],
  defaultNature: 'social',
  /** DevTools 2026-08-02: campus portal is website-path 379481 (201=校招正式). */
  natureChannels: {
    social: {
      domain: 'vrfi1sk8a0.jobs.feishu.cn',
      websitePath: 'index',
      listPath: '/index',
      recruitmentIds: ['101'],
      jobUrlStyle: 'spread',
    },
    intern: {
      domain: 'vrfi1sk8a0.jobs.feishu.cn',
      websitePath: 'index',
      listPath: '/index',
      recruitmentIds: ['301'],
      jobUrlStyle: 'spread',
    },
    campus: {
      domain: 'vrfi1sk8a0.jobs.feishu.cn',
      websitePath: '379481',
      listPath: '/379481/',
      recruitmentIds: ['201'],
      jobUrlStyle: 'spread',
    },
  },
};

export * from '../feishu-saas/utils.js';
