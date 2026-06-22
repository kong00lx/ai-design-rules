# @ai-design-rules/antd

Ant Design 完整设计规范体系的 AI 可执行版本。包含 12 个 Cursor Rules 文件和 3 个 Cursor Skills，覆盖从设计哲学到组件选型的完整决策链。

## 包含内容

### Cursor Rules（自动注入，无需手动调用）

| 文件 | 内容 | 触发方式 |
|------|------|---------|
| `01-design-philosophy.mdc` | 设计价值观：操作位置惯例、文案规范 | 始终生效 |
| `02-design-principles.mdc` | 视觉四原则 + 交互六原则 | 始终生效 |
| `03-colors.mdc` | 色彩 Token 体系 + 禁止事项 | `*.tsx` 文件 |
| `04-typography.mdc` | 字号/行高/字重决策树 | `*.tsx` 文件 |
| `05-layout-spacing.mdc` | 8px 网格 + 间距 Token + 栅格 | `*.tsx` 文件 |
| `06-shadow-elevation.mdc` | 阴影层级系统 + z-index | `*.tsx` 文件 |
| `07-motion-animation.mdc` | 动效时长/曲线/场景规范 | `*.tsx` 文件 |
| `08-data-entry-patterns.mdc` | 表单布局 + 字段选择决策树 | `*.tsx` 文件 |
| `09-data-display-patterns.mdc` | 表格/卡片/空态设计模式 | `*.tsx` 文件 |
| `10-navigation-patterns.mdc` | 菜单/面包屑/标签页规范 | `*.tsx` 文件 |
| `11-feedback-patterns.mdc` | message/Modal/Alert 决策树 | `*.tsx` 文件 |
| `12-component-selection.mdc` | 完整组件选型决策树 + 状态清单 | `*.tsx` 文件 |

### Cursor Skills（按需手动调用）

| Skill | 用途 | 触发方式 |
|-------|------|---------|
| `interaction-design` | **开发新功能前**：强制完成 5 阶段交互设计，输出设计简报再编码 | 对话中说"帮我设计这个功能" |
| `page-patterns` | 生成标准页面骨架（列表页/表单页/详情页/工作台） | 对话中说"生成列表页" |
| `ui-review` | 审查已有 UI 代码，输出规范问题清单 | 对话中说"帮我 review 这个组件" |

## 安装方法

### 方式一：脚本一键安装（推荐）

在你的项目根目录执行：

```bash
# 安装 rules
curl -fsSL https://raw.githubusercontent.com/your-repo/ai-design-rules/main/packages/antd/install.sh | bash

# 或者用 npx（CLI 开发中）
# npx @ai-design-rules/antd init
```

### 方式二：手动复制（当前推荐）

将以下文件复制到你的项目：

**Step 1：复制 Rules 文件**

```bash
# 在你的项目根目录执行
mkdir -p .cursor/rules

# 从本仓库复制（将 /path/to/ai-design-rules 替换为实际路径）
cp /path/to/ai-design-rules/packages/antd/rules/*.mdc .cursor/rules/
```

**Step 2：复制 Skills 文件**

```bash
mkdir -p .agents/skills

cp -r /path/to/ai-design-rules/packages/antd/skills/interaction-design .agents/skills/
cp -r /path/to/ai-design-rules/packages/antd/skills/page-patterns .agents/skills/
cp -r /path/to/ai-design-rules/packages/antd/skills/ui-review .agents/skills/
```

**Step 3：验证目录结构**

```
your-project/
├── .cursor/
│   └── rules/
│       ├── 01-design-philosophy.mdc
│       ├── 02-design-principles.mdc
│       ├── 03-colors.mdc
│       ├── 04-typography.mdc
│       ├── 05-layout-spacing.mdc
│       ├── 06-shadow-elevation.mdc
│       ├── 07-motion-animation.mdc
│       ├── 08-data-entry-patterns.mdc
│       ├── 09-data-display-patterns.mdc
│       ├── 10-navigation-patterns.mdc
│       ├── 11-feedback-patterns.mdc
│       └── 12-component-selection.mdc
└── .agents/
    └── skills/
        ├── interaction-design/
        │   └── SKILL.md
        ├── page-patterns/
        │   └── SKILL.md
        └── ui-review/
            └── SKILL.md
```

### 方式三：Git Submodule

```bash
git submodule add https://github.com/your-repo/ai-design-rules .ai-design-rules

# 复制文件
cp .ai-design-rules/packages/antd/rules/*.mdc .cursor/rules/
cp -r .ai-design-rules/packages/antd/skills/* .agents/skills/
```

## 使用方式

### Rules（自动生效）

安装后无需任何操作，在 Cursor 中编写 `.tsx` 文件时自动注入相关规则。

### Skills（手动触发）

在 Cursor 对话框中直接描述需求：

```
# 开发新功能（推荐先用 interaction-design skill）
"帮我设计用户管理模块的交互方案"
→ AI 会先输出完整设计简报，确认后再生成代码

# 生成页面骨架
"生成一个订单列表页，包含搜索、筛选和批量操作"

# 审查现有代码
"review 一下 UserTable.tsx 的设计规范合规性"
```

## 自定义 Token

如果你的项目使用了自定义 antd 主题（通过 `ConfigProvider` 修改了 `colorPrimary` 等 Token），需要手动更新 `03-colors.mdc` 中的对应数值，确保规则与你的实际 Token 一致。

```tsx
// 你的 theme 配置
const theme = {
  token: {
    colorPrimary: '#FF6B35',  // 将此值同步到 03-colors.mdc
  }
}
```

> CLI 自动同步 Token 功能开发中，届时可一键从 ConfigProvider 配置生成规则。

## 版本要求

- Ant Design v5.x
- Cursor 0.40+（支持 `.cursor/rules/` 目录）
- Node.js 18+（CLI 工具）
