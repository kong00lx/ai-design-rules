---
name: antd-ui-review
description: >-
  Ant Design UI 代码审查器。对已有 UI 代码进行设计规范检查，输出问题清单和修复建议。
  触发条件：用户说"帮我 review UI"、"检查设计规范"、"audit 这个组件"等。
metadata:
  surfaces:
    - ide
---

# Ant Design UI 代码审查器

## 执行步骤

当用户要求 review UI 代码时，按以下顺序执行：

1. **读取目标文件**
2. **逐项检查**（按下方 5 个维度）
3. **输出问题报告**（严重 / 中等 / 建议 三级）
4. **提供具体修复代码**

---

## 审查维度 1：组件选择合规性

检查是否用裸 HTML 实现了 antd 已有的功能：

```
❌ 违规信号：
- 裸 <input> / <textarea> / <select> / <button>
- 自制 overlay / modal / dropdown
- style={{ display: 'flex' }} 替代 <Space> 或 Tailwind
- window.alert() / window.confirm()
- 自制 loading spinner（CSS @keyframes）
- 裸 <ul><li> 列表（应用 <List>）
- 自制分页（prev/next button）
```

---

## 审查维度 2：状态完整性

每个交互组件必须有完整的 4 态：

```
必检项：
□ loading 态  → 异步操作中显示 Button loading 或 Spin/Skeleton
□ error 态    → 请求失败显示 message.error 或 Alert
□ empty 态    → 列表/表格无数据时有 Empty 组件
□ disabled 态 → 不可操作时用 disabled prop，不用 opacity 模拟

危险操作检查：
□ 删除操作   → 必须有 Popconfirm 或 Modal.confirm
□ 提交操作   → 必须有 loading 按钮防止重复提交
```

---

## 审查维度 3：视觉规范合规性

```
颜色检查：
□ 不使用魔法颜色（color: '#1890ff'、background: '#ff4d4f'）
□ 状态颜色使用语义 Tag（success/error/warning/default）
□ 只用颜色区分状态 → 必须补充图标或文字

间距检查：
□ 间距值是否 4/8/12/16/20/24/32px（8px 网格）
□ 是否使用内联 style 写死 margin/padding

字体检查：
□ 字号是否在规范范围内（12/14/16/20/24/30/38px）
□ 正文不使用 12px
□ 标题不超过 3 种字号

对齐检查：
□ 数字列是否右对齐（align: 'right'）
□ 同一卡片内对齐方式是否一致
```

---

## 审查维度 4：交互体验

```
□ 表单是否使用 <Form> 统一管理（而非 useState 手动）
□ 表单字段是否有 placeholder
□ 必填字段是否有 rules 校验
□ 长文本是否有省略处理（ellipsis）
□ 操作列是否固定在右侧（fixed: 'right'）
□ 大数据量是否有分页
□ 图标库是否统一使用 @ant-design/icons
```

---

## 审查维度 5：响应式

```
□ 布局是否使用 Row+Col 栅格（而非固定 px 宽度）
□ 移动端是否可用（xs 断点是否有对应样式）
□ 表格是否有 scroll={{ x: number }}（列多时）
```

---

## 输出报告格式

```markdown
## UI 审查报告

### 🔴 严重问题（必须修复）
1. **使用裸 `<input>` 替代 antd Input**
   位置：`UserForm.tsx:42`
   修复：`<Input placeholder="请输入用户名" />`

2. **删除操作无确认**
   位置：`UserTable.tsx:88`
   修复：用 Popconfirm 包裹删除按钮

### 🟡 中等问题（建议修复）
1. **使用魔法颜色 `#ff4d4f`**
   位置：`StatusTag.tsx:15`
   修复：`<Tag color="error">失败</Tag>`

### 🟢 优化建议
1. **Table 缺少 scroll={{ x: 800 }}**
   列数较多时水平滚动体验更好

---
**评分：** 85/100
**主要问题：** 状态管理不完整、部分魔法颜色
```

---

## 快速修复模板

### 修复裸 input → antd Input
```tsx
// ❌
<input type="text" onChange={e => setValue(e.target.value)} />

// ✅
<Input value={value} onChange={e => setValue(e.target.value)} placeholder="..." />
```

### 修复 alert → message
```tsx
// ❌
alert('保存成功');

// ✅
message.success('保存成功');
```

### 修复删除无确认
```tsx
// ❌
<Button onClick={() => handleDelete(id)}>删除</Button>

// ✅
<Popconfirm
  title="确认删除？"
  description="此操作不可撤销"
  onConfirm={() => handleDelete(id)}
  okText="删除"
  okButtonProps={{ danger: true }}
>
  <Button danger>删除</Button>
</Popconfirm>
```

### 修复缺少空态
```tsx
// ❌
{data.length === 0 ? <div>暂无数据</div> : <Table ... />}

// ✅
<Table
  ...
  locale={{ emptyText: <Empty description="暂无数据" /> }}
/>
```
