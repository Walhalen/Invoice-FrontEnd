import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Typography, Card, Descriptions, Table, Button, Spin, Result } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getInvoiceById } from '../services/InvoiceServices/getInvoiceById';
import type { InvoiceDetail as InvoiceDetailData, InvoiceItem } from '../types/InvoiceTypes';
import '../cssFiles/InvoiceDetail.css';

const { Title } = Typography;

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadInvoice = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await getInvoiceById(Number(id));
        setInvoice(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  const itemColumns: ColumnsType<InvoiceItem> = [
    { title: '№', dataIndex: 'lineNumber', width: 60 },
    { title: 'Код', dataIndex: 'productCode' },
    { title: 'Част', dataIndex: 'name' },
    { title: 'Описание', dataIndex: 'description' },
    { title: 'Марка', dataIndex: 'brand', render: (v: string | null) => v || '—' },
    { title: 'Група', dataIndex: 'groupName', render: (v: string | null) => v || '—' },
    { title: 'Количество', dataIndex: 'quantity' },
    {
      title: 'Ед. цена (лв.)',
      dataIndex: 'unitPrice',
      render: (v: number) => v.toFixed(2),
    },
    {
      title: 'ДДС %',
      dataIndex: 'vatRate',
      render: (v: number) => `${v}%`,
    },
    {
      title: 'Общо (лв.)',
      render: (_: unknown, record: InvoiceItem) => (record.quantity * record.unitPrice).toFixed(2),
    },
  ];

  if (loading) {
    return (
      <div className="invoice-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !invoice) {
    return (
      <Result
        status="404"
        title="Фактурата не е намерена"
        extra={
          <Button type="primary" onClick={() => navigate('/invoices')}>
            Обратно към фактурите
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="invoice-detail-header">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/invoices')}>
          Назад
        </Button>
        <Title level={3} className="invoice-detail-title">
          Фактура №{invoice.number}
        </Title>
      </div>

      <Card className="invoice-detail-card" title="Обща информация">
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Доставчик">{invoice.supplier.name}</Descriptions.Item>
          <Descriptions.Item label="Код на доставчик">{invoice.supplier.code}</Descriptions.Item>
          <Descriptions.Item label="Дата на издаване">
            {dayjs(invoice.issueDate).format('DD.MM.YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Срок за плащане">
            {dayjs(invoice.dueDate).format('DD.MM.YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Начин на плащане">{invoice.paymentMethodCode}</Descriptions.Item>
          <Descriptions.Item label="Тип документ">{invoice.documentTypeCode}</Descriptions.Item>
          <Descriptions.Item label="Валута">{invoice.currencyCode}</Descriptions.Item>
          <Descriptions.Item label="Склад">{invoice.warehouseCode}</Descriptions.Item>
          <Descriptions.Item label="Код на платец">{invoice.payerCode}</Descriptions.Item>
          <Descriptions.Item label="Код на получател">{invoice.receiverCode}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="invoice-detail-card" title="Суми">
        <Descriptions bordered column={3} size="small">
          <Descriptions.Item label="Нето">{invoice.netAmount.toFixed(2)} лв.</Descriptions.Item>
          <Descriptions.Item label="ДДС">{invoice.vatAmount.toFixed(2)} лв.</Descriptions.Item>
          <Descriptions.Item label="Бруто">{invoice.grossAmount.toFixed(2)} лв.</Descriptions.Item>
          <Descriptions.Item label="Платено">{invoice.paidAmount.toFixed(2)} лв.</Descriptions.Item>
          <Descriptions.Item label="Остатък">{invoice.outstandingAmount.toFixed(2)} лв.</Descriptions.Item>
          <Descriptions.Item label="Сума във валута">
            {invoice.foreignCurrencyAmount.toFixed(2)} {invoice.currencyCode}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="invoice-detail-card" title="Артикули">
        <Table columns={itemColumns} dataSource={invoice.items} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
}
