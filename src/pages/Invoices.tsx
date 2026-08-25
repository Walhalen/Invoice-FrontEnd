import { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getInvoices } from '../services/InvoiceServices/getInvoices';
import { deleteInvoice } from '../services/InvoiceServices/deleteInvoice';
import type { InvoiceListItem } from '../types/InvoiceTypes';
import '../cssFiles/Invoice.css';

const { Title } = Typography;

export default function Invoices() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch {
      message.error('Неуспешно зареждане на фактурите.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteInvoice(id);
      message.success('Фактурата е изтрита успешно.');
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch {
      message.error('Неуспешно изтриване на фактурата.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredData = invoices.filter(
    (inv) =>
      inv.number.toLowerCase().includes(searchText.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<InvoiceListItem> = [
    {
      title: 'Номер',
      dataIndex: 'number',
      key: 'number',
      render: (text, record) => <a onClick={() => navigate(`/invoices/${record.id}`)}>{text}</a>,
    },
    { title: 'Доставчик', dataIndex: 'supplierName', key: 'supplierName' },
    {
      title: 'Дата на издаване',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Срок за плащане',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Нето (лв.)',
      dataIndex: 'netAmount',
      key: 'netAmount',
      render: (v: number) => v.toFixed(2),
    },
    {
      title: 'ДДС (лв.)',
      dataIndex: 'vatAmount',
      key: 'vatAmount',
      render: (v: number) => v.toFixed(2),
    },
    {
      title: 'Бруто (лв.)',
      dataIndex: 'grossAmount',
      key: 'grossAmount',
      render: (v: number) => v.toFixed(2),
      sorter: (a, b) => a.grossAmount - b.grossAmount,
    },
    {
      title: 'Платено (лв.)',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (v: number | null) => (v ?? 0).toFixed(2),
    },
    {
      title: 'Остатък (лв.)',
      dataIndex: 'outstandingAmount',
      key: 'outstandingAmount',
      render: (v: number | null) => (v ?? 0).toFixed(2),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Popconfirm
          title="Изтриване на фактура"
          description={`Сигурни ли сте, че искате да изтриете фактура №${record.number}?`}
          onConfirm={() => handleDelete(record.id)}
          okText="Изтрий"
          cancelText="Отказ"
        >
          <Button danger type="text" icon={<DeleteOutlined />} loading={deletingId === record.id} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div className="invoices-header">
        <Title level={3} className="invoices-title">Фактури</Title>
        <Space>
          <Input
            placeholder="Търси по номер или доставчик"
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

      <Table columns={columns} dataSource={filteredData} rowKey="id" loading={loading} />
    </div>
  );
}
