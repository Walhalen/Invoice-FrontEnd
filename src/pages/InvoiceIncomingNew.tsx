import { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
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

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xml,.pdf',
    beforeUpload: () => false,
    onChange(info) {
      const file = info.fileList[0];
      if (file) {
        message.success(`Файлът "${file.name}" е готов за обработка.`);
        // TODO: изпращане към .NET backend endpoint за парсване на XML/PDF
      }
    },
  };

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
    <Dragger {...uploadProps}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Кликни или пусни XML/PDF файл тук</p>
      <p className="ant-upload-hint">
        Ще извлечем данните автоматично от фактурата (доставчик, части, суми) и ще ги
        добавим в склада
      </p>
    </Dragger>
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