export const CONFIG = {
  id: 'dewu',
  opencliSite: 'dewu-jobs',
  name: 'Dewu',
  description: 'Dewu social, campus, and intern recruitment',
  domain: 'careers.dewu.com',
  path: '/index/position/list',
  supportedNatures: ['social', 'campus', 'intern'],
  defaultNature: 'social',
  /** DevTools 2026-08-02: campus portal is website-path 578078 (201=校招正式). */
  natureChannels: {
    social: {
      domain: 'careers.dewu.com',
      websitePath: 'index',
      listPath: '/index/position/list',
      recruitmentIds: ['101'],
      jobUrlStyle: 'spread',
    },
    intern: {
      domain: 'careers.dewu.com',
      websitePath: 'index',
      listPath: '/index/position/list',
      recruitmentIds: ['301'],
      jobUrlStyle: 'spread',
    },
    campus: {
      domain: 'campus.dewu.com',
      websitePath: '578078',
      listPath: '/578078/position/list',
      recruitmentIds: ['201'],
      jobUrlStyle: 'detail',
    },
  },
};

export * from '../feishu-saas/utils.js';
