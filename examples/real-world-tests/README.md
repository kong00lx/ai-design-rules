# 真实项目测试报告

> 测试项目：kyc-app  
> 测试分支：`feature/test-ai-design`  
> 测试时间：2026-06-22  
> 对照分支：`main`（无 ai-design-rules）

---

## 测试结论

安装 ai-design-rules 后，AI 生成代码在以下两类问题上有显著提升：

1. **交互正确性**：发现并修复了实际的交互 bug（不只是样式偏好）
2. **组件语义**：能基于决策树做出更准确的组件选型判断

---

## Case 1：列表批量操作

**任务**：在用户列表页实现批量删除功能

### 差异对比

| 维度 | main（无规则） | feature/test-ai-design（有规则） | 规则来源 |
|------|--------------|--------------------------------|---------|
| 删除确认 | `Popconfirm`（单行悬浮确认） | `Modal.confirm`（批量操作语义更准确） | `11-feedback-patterns.mdc` |
| 翻页行为 | 翻页后保留选中态 | 翻页时重置选中（服务端分页下更安全） | `09-data-display-patterns.mdc` |
| **checkbox 交互** | **点击行会同时触发行跳转+选中** | **checkbox 区域阻止事件冒泡，不触发跳转** | `interaction-design` skill |
| 颜色使用 | 硬编码蓝色 `#1890ff` | 使用项目 token `text-primary`（`#1a2e2a`） | `03-colors.mdc`（已同步项目 token） |

### 最有价值的差异

**checkbox 拦截跳转**是本次测试中价值最高的差异。这不是样式偏好，而是一个实际的**交互 bug**：

```tsx
// ❌ 无规则时的生成代码
<Table
  onRow={(record) => ({
    onClick: () => navigate(`/users/${record.id}`),  // 点击行跳转
  })}
  rowSelection={{ ... }}  // checkbox 点击会同时触发跳转
/>

// ✅ 有规则时的生成代码
<Table
  onRow={(record) => ({
    onClick: () => navigate(`/users/${record.id}`),
  })}
  rowSelection={{
    onChange: (keys) => setSelectedKeys(keys),
    onSelect: (_, __, ___, e) => e.stopPropagation(),  // 阻止冒泡
    onSelectAll: (_, __, ___, e) => e?.stopPropagation(),
  }}
/>
```

**触发原因**：`interaction-design` skill 强制 AI 在编码前梳理交互流程，必须明确区分"点击行→跳转"和"点击 checkbox→选中"两个事件的边界，而不是直接堆代码。

---

## Case 2：Tab 导航 → Steps 组件建议

**任务**：对项目现有 Tab 导航结构进行审查

### 现状

项目使用 `<Tabs>` 展示 KYC 三个阶段：

```
[Draft] → [Risk Check] → [Report]
```

### AI 分析过程

AI 引用了 `10-navigation-patterns.mdc` 中的决策树：

```
何时用 Tabs？
├── 同一数据的不同视角（基本信息/操作记录/关联数据）
├── 同级别的多个列表（全部/进行中/已完成）
└── 页面内容分组展示

何时不用 Tabs？
├── 步骤流程（用 Steps）   ← 命中这条
```

### 判断结论

这 3 个"Tab"不是同一数据的不同视角，而是 KYC 工作流的**三个串行阶段**：
- Draft（起草）→ Risk Check（风控）→ Report（提交）
- 用户必须先完成上一步才能进入下一步
- 这正是 `<Steps>` 组件的设计场景

### 建议代码

```tsx
// ❌ 当前用法（语义不准确）
<Tabs items={[
  { key: 'draft', label: 'Draft' },
  { key: 'risk-check', label: 'Risk Check' },
  { key: 'report', label: 'Report' },
]} />

// ✅ 建议用法
<Steps
  current={currentStep}
  items={[
    { title: 'Draft', description: '起草申请' },
    { title: 'Risk Check', description: '风控审核', status: riskCheckStatus },
    { title: 'Report', description: '提交报告' },
  ]}
/>
```

**触发原因**：决策树明确写出了"步骤流程不用 Tabs"，AI 能精确命中场景，给出组件级建议，而不是模糊的"可以考虑调整"。

---

## 整体评估

| 能力 | 表现 |
|------|------|
| 组件语义判断 | ✅ 显著提升（Tabs→Steps、Popconfirm→Modal.confirm） |
| 交互 bug 预防 | ✅ 发现了 checkbox/row click 冲突这类典型问题 |
| 项目 token 一致性 | ✅ 使用了正确的主题色，无硬编码颜色 |
| 分页行为规范 | ✅ 翻页重置选中，符合服务端分页惯例 |

**结论**：规则对 AI 的约束效果在"有明确决策树"的场景下最显著。下一步可继续扩充决策树覆盖的场景范围。
