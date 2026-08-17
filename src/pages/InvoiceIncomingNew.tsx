import { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  Upload,
  Button,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Table,
  Space,
  Divider,
  Tabs,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../services/InvoiceServices/getInvoices';
import { importInvoiceXml } from '../services/InvoiceServices/importInvoiceXml';
import type { InvoiceListItem } from '../types/InvoiceTypes';
import '../cssFiles/InvoicesIncomingNew.css';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface LineItem {
  key: string;
  partName: string;
  quantity: number;
  unitPrice: number;
}

export default function InvoiceIncomingNew() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [items, setItems] = useState<LineItem[]>([
    { key: '1', partName: '', quantity: 1, unitPrice: 0 },
  ]);

  const [importedInvoices, setImportedInvoices] = useState<InvoiceListItem[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [importing, setImporting] = useState(false);

  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const data = await getInvoices();
      setImportedInvoices(data);
    } catch {
      message.error('Неуспешно зареждане на импортираните фактури.');
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xml',
    showUploadList: false,
    disabled: importing,
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      setImporting(true);
      try {
        const invoice = await importInvoiceXml(file as File);
        message.success(`Фактура №${invoice.number} от ${invoice.supplier.name} е импортирана успешно.`);
        onSuccess?.(invoice);
        loadInvoices();
      } catch (err) {
        message.error('Неуспешен импорт на фактурата.');
        onError?.(err as Error);
      } finally {
        setImporting(false);
      }
    },
  };

  const importedColumns: ColumnsType<InvoiceListItem> = [
    { title: 'Номер', dataIndex: 'number' },
    { title: 'Доставчик', dataIndex: 'supplierName' },
    {
      title: 'Дата на издаване',
      dataIndex: 'issueDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: 'Срок за плащане',
      dataIndex: 'dueDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    { title: 'Нето (лв.)', dataIndex: 'netAmount', render: (v: number) => v.toFixed(2) },
    { title: 'ДДС (лв.)', dataIndex: 'vatAmount', render: (v: number) => v.toFixed(2) },
    { title: 'Бруто (лв.)', dataIndex: 'grossAmount', render: (v: number) => v.toFixed(2) },
    {
      title: 'Платено (лв.)',
      dataIndex: 'paidAmount',
      render: (v: number | null) => (v ?? 0).toFixed(2),
    },
    {
      title: 'Остатък (лв.)',
      dataIndex: 'outstandingAmount',
      render: (v: number | null) => (v ?? 0).toFixed(2),
    },
  ];

  const addItem = () => {
    setItems([...items, { key: Date.now().toString(), partName: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const updateItem = (key: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const columns = [
    {
      title: 'Част',
      dataIndex: 'partName',
      render: (_: unknown, record: LineItem) => (
        <Input
          value={record.partName}
          placeholder="Име на частта"
          onChange={(e) => updateItem(record.key, 'partName', e.target.value)}
        />
      ),
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      width: 140,
      render: (_: unknown, record: LineItem) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => updateItem(record.key, 'quantity', val ?? 1)}
          className="full-width"
        />
      ),
    },
    {
      title: 'Ед. цена (лв.)',
      dataIndex: 'unitPrice',
      width: 160,
      render: (_: unknown, record: LineItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={(val) => updateItem(record.key, 'unitPrice', val ?? 0)}
          className="full-width"
        />
      ),
    },
    {
      title: 'Общо',
      width: 120,
      render: (_: unknown, record: LineItem) => `${(record.quantity * record.unitPrice).toFixed(2)} лв.`,
    },
    {
      title: '',
      width: 50,
      render: (_: unknown, record: LineItem) => (
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} />
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    console.log('Фактура за запис:', { ...values, items, total });
    message.success('Фактурата е записана успешно!');
    navigate('/invoices');
  };

  const ManualForm = (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Space size="large" className="form-row" wrap>
        <Form.Item
          label="Номер на фактура"
          name="number"
          rules={[{ required: true, message: 'Задължително поле' }]}
        >
          <Input placeholder="INV-0001" className="input-md" />
        </Form.Item>
        <Form.Item
          label="Доставчик"
          name="supplier"
          rules={[{ required: true, message: 'Задължително поле' }]}
        >
          <Input placeholder="Име на доставчика" className="input-lg" />
        </Form.Item>
        <Form.Item label="Дата" name="date" rules={[{ required: true }]}>
          <DatePicker className="input-sm" />
        </Form.Item>
      </Space>

      <Divider>Части</Divider>

      <Table
        columns={columns}
        dataSource={items}
        pagination={false}
        rowKey="key"
        footer={() => (
          <Button type="dashed" icon={<PlusOutlined />} onClick={addItem} block>
            Добави част
          </Button>
        )}
      />

      <div className="total-row">
        <Text strong>Общо: {total.toFixed(2)} лв.</Text>
      </div>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Запази фактура
          </Button>
          <Button onClick={() => navigate('/invoices')}>Отказ</Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const AutoUpload = (
    <>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Кликни или пусни XML файл тук</p>
        <p className="ant-upload-hint">
          Файлът се изпраща към сървъра, който извлича данните автоматично (доставчик,
          части, суми) и ги добавя в склада
        </p>
      </Dragger>

      <Divider>Импортирани фактури</Divider>

      <Table
        columns={importedColumns}
        dataSource={importedInvoices}
        rowKey="id"
        loading={loadingInvoices}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Все още няма импортирани фактури' }}
      />
    </>
  );

  return (
    <div>
      <Title level={3}>Вкарване на фактура</Title>

      <Card>
        <Tabs
          defaultActiveKey="auto"
          items={[
            { key: 'auto', label: 'Автоматично разпознаване', children: AutoUpload },
            { key: 'manual', label: 'Ръчно въвеждане', children: ManualForm },
          ]}
        />
      </Card>
    </div>
  );
}