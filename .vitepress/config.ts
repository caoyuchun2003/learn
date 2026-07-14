import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/learn/',
  title: 'Learn',
  description: '曹宇春的学习手册库 — AI、Agent、OS 与工程落地',
  lang: 'zh-CN',
  srcDir: '.',
  srcExclude: [
    '**/node_modules/**',
    '**/.git/**',
    '**/.github/**',
    '**/functions/**',
    '**/*.zip',
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: '工具',
        items: [
          { text: '问本站', link: '/tools/ask' },
          { text: 'AI 方案决策器', link: '/tools/ai-decision' },
        ],
      },
      { text: 'Agent 工程', link: '/agent-book/00-前言与导读' },
      { text: 'AI 应用开发', link: '/AI应用开发手册/00-前言与导读' },
      { text: '操作系统', link: '/os-book/00-前言与导读' },
      { text: '模型与成本', link: '/model-cost-book/00-前言与导读' },
      { text: 'GitHub', link: 'https://github.com/caoyuchun2003/learn' },
    ],
    sidebar: {
      '/tools/': [
        {
          text: '工具',
          items: [
            { text: '问本站', link: '/tools/ask' },
            { text: 'AI 方案决策器', link: '/tools/ai-decision' },
            { text: 'CFC 工程方案', link: '/docs/learn-cfc-方案' },
          ],
        },
      ],
      '/docs/': [
        {
          text: '工程方案',
          items: [
            { text: 'Learn × 百度 CFC', link: '/docs/learn-cfc-方案' },
          ],
        },
      ],
      '/agent-book/': [
        {
          text: 'Agent 工程手册',
          items: [
            { text: '手册首页', link: '/agent-book/README' },
            { text: '前言与导读', link: '/agent-book/00-前言与导读' },
            {
              text: '第一篇 · 决策篇',
              items: [
                {
                  text: '第 01 课 · 教材阅读器要不要上 Agent？',
                  link: '/agent-book/01-第01课-教材阅读器要不要上Agent',
                },
                {
                  text: '第 02 课 · Workflow 与 Agent 怎么选',
                  link: '/agent-book/02-第02课-Workflow与Agent怎么选',
                },
                {
                  text: '第 03 课 · RAG 够了吗？什么时候才需要工具',
                  link: '/agent-book/03-第03课-RAG够了吗什么时候才需要工具',
                },
              ],
            },
            {
              text: '第二篇 · 模式篇',
              items: [
                {
                  text: '第 04 课 · 提示链与路由',
                  link: '/agent-book/04-第04课-提示链与路由',
                },
                {
                  text: '第 05 课 · 编排-执行与评估-优化',
                  link: '/agent-book/05-第05课-编排执行与评估优化',
                },
                {
                  text: '第 06 课 · 自主 Agent',
                  link: '/agent-book/06-第06课-自主Agent',
                },
              ],
            },
            {
              text: '第三篇 · 工程篇',
              items: [
                {
                  text: '第 07 课 · 工具设计与安全',
                  link: '/agent-book/07-第07课-工具设计与安全',
                },
                {
                  text: '第 08 课 · MCP 与 Function Calling 选型',
                  link: '/agent-book/08-第08课-MCP与FunctionCalling选型',
                },
                {
                  text: '第 09 课 · 记忆、多轮与上下文',
                  link: '/agent-book/09-第09课-记忆多轮与上下文',
                },
                {
                  text: '第 10 课 · Eval 与降级',
                  link: '/agent-book/10-第10课-Eval与降级',
                },
              ],
            },
            {
              text: '第四篇 · 场景篇',
              items: [
                {
                  text: '第 11 课 · 阅读器 AI 答疑架构全景',
                  link: '/agent-book/11-第11课-阅读器AI答疑架构全景',
                },
                {
                  text: '第 12 课 · 章节直灌 vs 知识库检索',
                  link: '/agent-book/12-第12课-章节直灌vs知识库检索',
                },
                {
                  text: '第 13 课 · 从 V1 到 V2 的演进路线',
                  link: '/agent-book/13-第13课-从V1到V2的演进路线',
                },
              ],
            },
            {
              text: '附录',
              items: [
                {
                  text: '附录 A · Agent 方案决策树',
                  link: '/agent-book/附录A-Agent方案决策树',
                },
                {
                  text: '附录 B · 架构对比速查',
                  link: '/agent-book/附录B-架构对比速查',
                },
              ],
            },
            { text: '分享文案', link: '/agent-book/分享文案' },
          ],
        },
      ],
      '/AI应用开发手册/': [
        {
          text: 'AI 应用开发手册',
          items: [
            { text: '手册首页', link: '/AI应用开发手册/README' },
            { text: '前言与导读', link: '/AI应用开发手册/00-前言与导读' },
            {
              text: '核心篇',
              items: [
                { text: '第 1 课 · LLM 的本质', link: '/AI应用开发手册/01-LLM的本质' },
                { text: '第 2 课 · 训练养成', link: '/AI应用开发手册/02-训练养成' },
                { text: '第 3 课 · RAG', link: '/AI应用开发手册/03-RAG检索增强' },
                { text: '第 4 课 · Agent', link: '/AI应用开发手册/04-Agent智能体' },
                { text: '第 5 课 · 微调', link: '/AI应用开发手册/05-微调Finetuning' },
                { text: '第 6 课 · AI 应用架构', link: '/AI应用开发手册/06-AI应用架构' },
              ],
            },
            {
              text: '进阶篇',
              items: [
                { text: '第 7 课 · 推理模型', link: '/AI应用开发手册/07-推理模型' },
                { text: '第 8 课 · 多模态', link: '/AI应用开发手册/08-多模态' },
                { text: '第 9 课 · 局限与天花板', link: '/AI应用开发手册/09-局限与天花板' },
                { text: '第 10 课 · 提示工程', link: '/AI应用开发手册/10-提示工程' },
                { text: '第 11 课 · Eval', link: '/AI应用开发手册/11-Eval评估' },
                { text: '第 12 课 · 上下文工程', link: '/AI应用开发手册/12-上下文工程' },
                { text: '第 13 课 · 安全与对齐', link: '/AI应用开发手册/13-安全与对齐' },
                { text: '第 14 课 · Diffusion', link: '/AI应用开发手册/14-Diffusion扩散模型' },
                { text: '第 15 课 · 本地部署', link: '/AI应用开发手册/15-本地部署与开源模型' },
                { text: '第 16 课 · 设计模式', link: '/AI应用开发手册/16-AI系统设计模式' },
                { text: '第 17 课 · 模型选型与成本', link: '/AI应用开发手册/17-模型选型与成本' },
                { text: '第 18 课 · 写 MCP', link: '/AI应用开发手册/18-自己写一个MCP' },
                { text: '第 19 课 · AI 产品设计', link: '/AI应用开发手册/19-AI产品设计' },
                { text: '第 20 课 · Embedding', link: '/AI应用开发手册/20-Embedding与向量检索' },
                { text: '第 21 课 · Agent 记忆', link: '/AI应用开发手册/21-Agent记忆系统' },
                { text: '第 22 课 · 评测榜单', link: '/AI应用开发手册/22-AI评测榜单' },
                { text: '第 23 课 · 多智能体', link: '/AI应用开发手册/23-多智能体系统' },
              ],
            },
            { text: '结语', link: '/AI应用开发手册/99-结语' },
          ],
        },
      ],
      '/os-book/': [
        {
          text: '操作系统白话',
          items: [
            { text: '手册首页', link: '/os-book/README' },
            { text: '前言与导读', link: '/os-book/00-前言与导读' },
            {
              text: '地基篇',
              items: [
                { text: '第 01 课 · OS 是公司总管', link: '/os-book/01-第01课-OS是公司总管' },
                { text: '第 02 课 · 进程与线程', link: '/os-book/02-第02课-进程与线程' },
                { text: '第 03 课 · 内存', link: '/os-book/03-第03课-内存桌面与仓库' },
                { text: '第 04 课 · CPU 调度', link: '/os-book/04-第04课-CPU调度' },
              ],
            },
            {
              text: '现场篇',
              items: [
                { text: '第 05 课 · 文件系统', link: '/os-book/05-第05课-文件系统与沙盒' },
                { text: '第 06 课 · 网络栈', link: '/os-book/06-第06课-网络栈' },
                { text: '第 07 课 · 容器与虚拟机', link: '/os-book/07-第07课-容器与虚拟机' },
              ],
            },
            {
              text: '进阶篇',
              items: [
                { text: '第 08 课 · 从源码到进程', link: '/os-book/08-第08课-从源码到进程' },
                { text: '第 09 课 · 安全与权限', link: '/os-book/09-第09课-安全与权限' },
                { text: '第 10 课 · 并发入门', link: '/os-book/10-第10课-并发入门' },
              ],
            },
            {
              text: '附录',
              items: [
                { text: '命令速查', link: '/os-book/11-附录-命令速查' },
                { text: '自测与进阶', link: '/os-book/12-附录-自测与进阶路线' },
              ],
            },
            { text: '结语', link: '/os-book/99-结语' },
          ],
        },
      ],
      '/model-cost-book/': [
        {
          text: '模型与成本落地',
          items: [
            { text: '手册首页', link: '/model-cost-book/README' },
            { text: '前言与导读', link: '/model-cost-book/00-前言与导读' },
            {
              text: '选型篇',
              items: [
                {
                  text: '第 01 课 · 不是越贵越好',
                  link: '/model-cost-book/01-第01课-模型不是越贵越好',
                },
                {
                  text: '第 02 课 · Token 账单',
                  link: '/model-cost-book/02-第02课-Token账单怎么算',
                },
                {
                  text: '第 03 课 · DeepSeek/文心/闭源',
                  link: '/model-cost-book/03-第03课-DeepSeek文心闭源怎么选',
                },
              ],
            },
            {
              text: '路由篇',
              items: [
                {
                  text: '第 04 课 · 多模型路由',
                  link: '/model-cost-book/04-第04课-多模型路由',
                },
                {
                  text: '第 05 课 · Key 放哪',
                  link: '/model-cost-book/05-第05课-Key放哪谁来调',
                },
                {
                  text: '第 06 课 · 流式与超时',
                  link: '/model-cost-book/06-第06课-流式假流式与超时',
                },
              ],
            },
            {
              text: '稳态篇',
              items: [
                {
                  text: '第 07 课 · 限流缓存降级',
                  link: '/model-cost-book/07-第07课-限流缓存与降级',
                },
                {
                  text: '第 08 课 · 助教换模案例',
                  link: '/model-cost-book/08-第08课-案例手册助教换模型',
                },
              ],
            },
            { text: '结语', link: '/model-cost-book/99-结语' },
          ],
        },
      ],
      '/claude-code-book/': [
        {
          text: 'Claude Code 学习方法',
          items: [
            { text: '总导读', link: '/claude-code-book/00-总导读' },
            {
              text: '入门篇 01–03',
              collapsed: true,
              items: [
                { text: '第 01 课', link: '/claude-code-book/01-第01课-认识Claude-Code' },
                { text: '第 02 课', link: '/claude-code-book/02-第02课-安装与环境' },
                { text: '第 03 课', link: '/claude-code-book/03-第03课-第一次对话' },
              ],
            },
            {
              text: '扩展篇 12–16',
              collapsed: true,
              items: [
                { text: '第 13 课 · Skills', link: '/claude-code-book/13-第13课-Skills' },
                { text: '第 16 课 · MCP', link: '/claude-code-book/16-第16课-MCP' },
              ],
            },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/caoyuchun2003/learn' },
    ],
    footer: {
      message: '© 曹宇春 · 个人学习整理，欢迎交流',
      copyright: 'MIT · CC BY-NC 建议注明出处',
    },
    search: {
      provider: 'local',
    },
  },
})
