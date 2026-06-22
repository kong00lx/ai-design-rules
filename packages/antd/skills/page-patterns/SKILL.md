---
name: antd-page-patterns
description: >-
  Ant Design 页面级 Pattern 生成器。使用此 Skill 生成标准的列表页、表单页、
  详情页或工作台页面，保证结构完整、状态齐全、符合 antd 设计规范。
  触发条件：用户说"生成列表页"、"写一个表单页"、"做一个详情页"等。
metadata:
  surfaces:
    - ide
---

# Ant Design 页面 Pattern 生成器

## 使用方式

当用户需要生成页面骨架时，按以下步骤执行：

1. **识别页面类型**（从用户描述中判断）
2. **收集必要信息**（业务实体名称、字段）
3. **使用对应模板**生成完整代码

---

## Pattern 1：标准列表页

**适用场景：** 数据管理、记录查看、批量操作

**必须包含：**
- 顶部：搜索栏 + 操作按钮区（新建、批量操作）
- 中部：Table（带分页、loading、空态、行操作）
- 弹窗：新建/编辑 Modal 或 Drawer

```tsx
// [ENTITY] = 业务实体名，如 User、Order、Product
import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Input, Space, Tag, Card, Modal, Form,
  Popconfirm, message, Empty, Skeleton
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';

interface [ENTITY] {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  // ... 其他字段
}

export default function [ENTITY]ListPage() {
  const [data, setData] = useState<[ENTITY][]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<[ENTITY] | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch[ENTITY]List({ page, pageSize, search });
      setData(res.data);
      setTotal(res.total);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      await delete[ENTITY](id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<[ENTITY]> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link" size="small"
            onClick={() => { setEditRecord(record); setModalOpen(true); }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            description="此操作不可撤销"
            onConfirm={() => handleDelete(record.id)}
            okText="删除"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800 m-0">[ENTITY] 管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditRecord(null); setModalOpen(true); }}
        >
          新建 [ENTITY]
        </Button>
      </div>

      <Card>
        {/* 搜索栏 */}
        <div className="flex items-center justify-between mb-4">
          <Space>
            <Input.Search
              placeholder="搜索名称..."
              allowClear
              style={{ width: 260 }}
              onSearch={setSearch}
            />
          </Space>
          {selectedRowKeys.length > 0 && (
            <Space>
              <span className="text-gray-500">已选 {selectedRowKeys.length} 项</span>
              <Button danger>批量删除</Button>
            </Space>
          )}
        </div>

        {/* 数据表格 */}
        <Table<[ENTITY]>
          rowKey="id"
          dataSource={data}
          columns={columns}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
          }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => { setPage(p); setPageSize(s); },
          }}
          locale={{
            emptyText: (
              <Empty description="暂无数据">
                <Button type="primary" icon={<PlusOutlined />}
                  onClick={() => { setEditRecord(null); setModalOpen(true); }}>
                  立即创建
                </Button>
              </Empty>
            )
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* 新建/编辑 Modal */}
      <[ENTITY]FormModal
        open={modalOpen}
        record={editRecord}
        onSuccess={() => { setModalOpen(false); fetchData(); }}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
```

---

## Pattern 2：标准表单页

**适用场景：** 创建/编辑复杂对象、配置页、申请表单

**必须包含：**
- 面包屑导航
- 分组的表单字段（Card 分组）
- 底部操作区（提交 + 取消，固定/跟随）

```tsx
export default function [ENTITY]FormPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetch[ENTITY](id).then(data => form.setFieldsValue(data));
    }
  }, [id]);

  const handleSubmit = async (values: Partial<[ENTITY]>) => {
    setLoading(true);
    try {
      if (isEdit) {
        await update[ENTITY](id, values);
        message.success('更新成功');
      } else {
        await create[ENTITY](values);
        message.success('创建成功');
      }
      navigate(-1);
    } catch {
      message.error(isEdit ? '更新失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <Breadcrumb
        className="mb-6"
        items={[
          { title: <HomeOutlined />, href: '/' },
          { title: '[ENTITY] 管理', href: '/[entities]' },
          { title: isEdit ? '编辑' : '新建' },
        ]}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        scrollToFirstError
      >
        {/* 基本信息 */}
        <Card title="基本信息" className="mb-4">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="名称" rules={[{ required: true }]}>
                <Input placeholder="请输入名称" />
              </Form.Item>
            </Col>
            {/* ...更多字段 */}
          </Row>
        </Card>

        {/* 操作区 */}
        <div className="flex items-center gap-3">
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '保存修改' : '立即创建'}
          </Button>
          <Button onClick={() => navigate(-1)}>取消</Button>
        </div>
      </Form>
    </div>
  );
}
```

---

## Pattern 3：详情页

**适用场景：** 查看记录详情、审核详情、订单详情

**必须包含：**
- 页头（标题 + 状态 + 主操作按钮）
- 基本信息区（Descriptions）
- 相关数据区（Table 或 Timeline）
- 操作历史（Timeline）

```tsx
export default function [ENTITY]DetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<[ENTITY] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch[ENTITY](id).then(setData).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (!data) return <Result status="404" title="记录不存在" />;

  return (
    <div className="p-6">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <h1 className="text-xl font-semibold m-0">{data.name}</h1>
          <Tag color={data.status === 'active' ? 'success' : 'default'}>
            {data.status === 'active' ? '启用' : '停用'}
          </Tag>
        </div>
        <Space>
          <Button onClick={() => navigate(`/[entities]/${id}/edit`)}>编辑</Button>
          <Button type="primary">主要操作</Button>
        </Space>
      </div>

      {/* 基本信息 */}
      <Card title="基本信息" className="mb-4">
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="名称">{data.name}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color="success">启用</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{data.createdAt}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 关联数据 */}
      <Card title="关联记录">
        <Table /* ... 关联数据表格 */ />
      </Card>
    </div>
  );
}
```

---

## Pattern 4：工作台/Dashboard

**必须包含：**
- 顶部统计卡片（Statistic）
- 主要图表区（AntV 或 antd Charts）
- 快捷操作或待办事项

```tsx
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">工作台</h1>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        {[
          { title: '今日新增', value: 128, suffix: '条' },
          { title: '待处理', value: 23, valueStyle: { color: '#faad14' } },
          { title: '本月完成', value: 1024 },
          { title: '成功率', value: 98.5, suffix: '%' },
        ].map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card>
              <Statistic {...stat} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 主要内容区 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="趋势图">{/* 图表 */}</Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="待办事项">
            <List
              dataSource={todoItems}
              renderItem={(item) => (
                <List.Item>
                  <Checkbox checked={item.done}>{item.title}</Checkbox>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
```

---

## 生成页面的检查清单

生成任何页面前，确认已包含：
- [ ] 所有异步操作有 loading 状态
- [ ] 列表/表格有空态设计
- [ ] 操作成功/失败有 message 提示
- [ ] 危险操作有 Popconfirm 确认
- [ ] 表单有校验规则（required 字段必须校验）
- [ ] 数字列右对齐
- [ ] 操作列固定在右侧
- [ ] 面包屑导航（页面层级 > 2）
- [ ] 响应式布局（移动端至少可用）
