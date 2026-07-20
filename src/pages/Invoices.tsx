import { useState } from 'react';
import { Table, Tag, Button, Input, Space, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import '../cssFiles/Invoice.css';

const { Title } = Typography;

interface Invoice {
  key: string;
  number: string;
  type: 'incoming' | 'outgoing';
  client: string;
  date: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
}

const mockData: Invoice[] = [
  { key: '1', number: 'INV-0001', type: 'outgoing', client: 'Иван Петров ЕООД', date: '2026-07-01', total: 1250.0, status: 'paid' },
  { key: '2', number: 'INV-0002', type: 'incoming', client: 'Доставчик АД', date: '2026-07-05', total: 3400.5, status: 'sent' },
  { key: '3', number: 'INV-0003', type: 'outgoing', client: 'Мария Георгиева', date: '2026-07-10', total: 890.0, status: 'overdue' },
  { key: '4', number: 'INV-0004', type: 'outgoing', client: 'Тех Солюшънс ООД', date: '2026-07-14', total: 2100.0, status: 'draft' },
];

const statusColors: Record<Invoice['status'], string> = {
  draft: 'default',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
};

const statusLabels: Record<Invoice['status'], string> = {
  draft: 'Чернова',
  sent: 'Изпратена',
  paid: 'Платена',
  overdue: 'Просрочена',
};

export default function Invoices() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const filteredData = mockData.filter(
    (inv) =>
      inv.number.toLowerCase().includes(searchText.toLowerCase()) ||
      inv.client.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<Invoice> = [
    {
      title: 'Номер',
      dataIndex: 'number',
      key: 'number',
      render: (text, record) => (
        <a onClick={() => navigate(`/invoices/${record.key}`)}>{text}</a>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      render: (type: Invoice['type']) =>
        type === 'incoming' ? (
          <Tag color="cyan">Вкарване</Tag>
        ) : (
          <Tag color="purple">Изкарване</Tag>
        ),
    },
    { title: 'Клиент', dataIndex: 'client', key: 'client' },
    { title: 'Дата', dataIndex: 'date', key: 'date' },
    {
      title: 'Сума',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `${total.toFixed(2)} лв.`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: Invoice['status']) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
      filters: Object.entries(statusLabels).map(([value, text]) => ({ text, value })),
      onFilter: (value, record) => record.status === value,
    },
  ];

  return (
    <div>
      <div className="invoices-header">
        <Title level={3} className="invoices-title">Фактури</Title>
        <Space>
          <Input
            placeholder="Търси по номер или клиент"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="invoices-search"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/invoices/incoming/new')}>
            Нова фактура
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={filteredData} />
    </div>
  );
}