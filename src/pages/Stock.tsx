import { useEffect, useState } from 'react';
import { Table, Input, Button, Typography, Space, Tag, message } from 'antd';
import { SearchOutlined, FileAddOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { getProducts } from '../services/ProductServices/getProducts';
import type { ProductListItem } from '../types/ProductTypes';
import '../cssFiles/Stock.css';

const { Title } = Typography;

export default function Stock() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        message.error('Неуспешно зареждане на артикулите в склада.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredData = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.code.toLowerCase().includes(searchText.toLowerCase()) ||
      (product.brand ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
      (product.groupName ?? '').toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<ProductListItem> = [
    {
      title: 'Част',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <a onClick={() => navigate(`/stock/${record.id}`)}>{text}</a>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    { title: 'Код', dataIndex: 'code', key: 'code' },
    {
      title: 'Категория',
      dataIndex: 'groupName',
      key: 'groupName',
      filters: Array.from(new Set(products.map((p) => p.groupName).filter(Boolean))).map((c) => ({
        text: c as string,
        value: c as string,
      })),
      onFilter: (value, record) => record.groupName === value,
      render: (groupName: string | null) => groupName ?? '—',
    },
    { title: 'Марка', dataIndex: 'brand', key: 'brand', render: (brand: string | null) => brand ?? '—' },
    {
      title: 'Наличност',
      dataIndex: 'quantityOnHand',
      key: 'quantityOnHand',
      sorter: (a, b) => a.quantityOnHand - b.quantityOnHand,
      render: (quantity: number) => (
        <Tag color={quantity === 0 ? 'red' : quantity < 5 ? 'orange' : 'green'}>{quantity} бр.</Tag>
      ),
    },
    {
      title: 'Посл. цена на доставка',
      dataIndex: 'lastPurchasePrice',
      key: 'lastPurchasePrice',
      render: (price: number) => `${price.toFixed(2)} лв.`,
      sorter: (a, b) => a.lastPurchasePrice - b.lastPurchasePrice,
    },
  ];

  return (
    <div>
      <div className="stock-header">
        <Title level={3} className="stock-title">
          Склад
        </Title>
        <Space>
          <Input
            placeholder="Търси част, код, категория или марка"
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

      <Table columns={columns} dataSource={filteredData} rowKey="id" loading={loading} />
    </div>
  );
}
