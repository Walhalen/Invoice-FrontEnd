import { useState } from 'react';
import { Table, Input, Button, Typography, Space, Tag } from 'antd';
import { SearchOutlined, FileAddOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import '../cssFiles/Stock.css';

const { Title } = Typography;

interface StockPart {
  key: string;
  name: string;
  category: string;
  available: number;
  unitPrice: number;
  supplier: string;
}

const mockStock: StockPart[] = [
  { key: '1', name: 'Спирачни накладки', category: 'Спирачна система', available: 12, unitPrice: 45.0, supplier: 'Intercars' },
  { key: '2', name: 'Маслен филтър', category: 'Филтри', available: 30, unitPrice: 8.5, supplier: 'Intercars' },
  { key: '3', name: 'Въздушен филтър', category: 'Филтри', available: 20, unitPrice: 12.0, supplier: 'AutoParts BG' },
  { key: '4', name: 'Амортисьор преден', category: 'Окачване', available: 6, unitPrice: 89.0, supplier: 'Intercars' },
  { key: '5', name: 'Свещи за запалване', category: 'Двигател', available: 2, unitPrice: 15.0, supplier: 'AutoParts BG' },
];

export default function Stock() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const filteredData = mockStock.filter(
    (part) =>
      part.name.toLowerCase().includes(searchText.toLowerCase()) ||
      part.category.toLowerCase().includes(searchText.toLowerCase()) ||
      part.supplier.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<StockPart> = [
    {
      title: 'Част',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/stock/${record.key}`)}>{text}</a>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      filters: Array.from(new Set(mockStock.map((p) => p.category))).map((c) => ({
        text: c,
        value: c,
      })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Наличност',
      dataIndex: 'available',
      key: 'available',
      sorter: (a, b) => a.available - b.available,
      render: (available: number) => (
        <Tag color={available === 0 ? 'red' : available < 5 ? 'orange' : 'green'}>
          {available} бр.
        </Tag>
      ),
    },
    {
      title: 'Ед. цена',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => `${price.toFixed(2)} лв.`,
      sorter: (a, b) => a.unitPrice - b.unitPrice,
    },
    { title: 'Доставчик', dataIndex: 'supplier', key: 'supplier' },
  ];

  return (
    <div>
      <div className="stock-header">
        <Title level={3} className="stock-title">
          Склад
        </Title>
        <Space>
          <Input
            placeholder="Търси част, категория или доставчик"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="stock-search"
          />
          <Button icon={<PlusOutlined />} onClick={() => navigate('/invoices/incoming/new')}>
            Вкарай фактура
          </Button>
          <Button
            type="primary"
            icon={<FileAddOutlined />}
            onClick={() => navigate('/invoices/outgoing/new')}
          >
            Изкарай фактура
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={filteredData} rowKey="key" />
    </div>
  );
}