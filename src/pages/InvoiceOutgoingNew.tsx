import { useState } from 'react';
import {
  Typography,
  Card,
  Table,
  Button,
  Input,
  InputNumber,
  Form,
  DatePicker,
  Space,
  Divider,
  Tabs,
  message,
  Modal,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, FileDoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../cssFiles/InvoiceOutgoingNew.css';

const { Title, Text } = Typography;

interface StockPart {
  key: string;
  name: string;
  available: number;
  unitPrice: number;
}

interface SelectedPart extends StockPart {
  quantity: number;
}

interface ManualLineItem {
  key: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

const mockStock: StockPart[] = [
  { key: '1', name: 'Спирачни накладки', available: 12, unitPrice: 45.0 },
  { key: '2', name: 'Маслен филтър', available: 30, unitPrice: 8.5 },
  { key: '3', name: 'Въздушен филтър', available: 20, unitPrice: 12.0 },
  { key: '4', name: 'Амортисьор преден', available: 6, unitPrice: 89.0 },
];

export default function InvoiceOutgoingNew() {
  const navigate = useNavigate();
  const [autoForm] = Form.useForm();
  const [manualForm] = Form.useForm();

  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const addPart = (part: StockPart) => {
    if (selectedParts.find((p) => p.key === part.key)) {
      message.warning('Тази част вече е добавена.');
      return;
    }
    setSelectedParts([...selectedParts, { ...part, quantity: 1 }]);
  };

  const removePart = (key: string) => {
    setSelectedParts(selectedParts.filter((p) => p.key !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    setSelectedParts(selectedParts.map((p) => (p.key === key ? { ...p, quantity } : p)));
  };

  const autoTotal = selectedParts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);

  const filteredStock = mockStock.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const selectedColumns = [
    { title: 'Част', dataIndex: 'name' },
    { title: 'Наличност', dataIndex: 'available' },
    {
      title: 'Количество',
      width: 140,
      render: (_: unknown, record: SelectedPart) => (
        <InputNumber
          min={1}
          max={record.available}
          value={record.quantity}
          onChange={(val) => updateQuantity(record.key, val ?? 1)}
          className="full-width"
        />
      ),
    },
    {
      title: 'Ед. цена (лв.)',
      dataIndex: 'unitPrice',
      render: (val: number) => `${val.toFixed(2)} лв.`,
    },
    {
      title: 'Общо',
      render: (_: unknown, record: SelectedPart) => `${(record.quantity * record.unitPrice).toFixed(2)} лв.`,
    },
    {
      title: '',
      width: 50,
      render: (_: unknown, record: SelectedPart) => (
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removePart(record.key)} />
      ),
    },
  ];

  const stockColumns = [
    { title: 'Част', dataIndex: 'name' },
    { title: 'Наличност', dataIndex: 'available' },
    { title: 'Цена', dataIndex: 'unitPrice', render: (v: number) => `${v.toFixed(2)} лв.` },
    {
      title: '',
      width: 100,
      render: (_: unknown, record: StockPart) => (
        <Button type="link" onClick={() => addPart(record)}>
          Добави
        </Button>
      ),
    },
  ];

  const handleAutoGenerate = (values: any) => {
    if (selectedParts.length === 0) {
      message.error('Добави поне една част преди да генерираш фактурата.');
      return;
    }
    console.log('Автоматично генериране:', { ...values, parts: selectedParts, total: autoTotal });
    // TODO: POST към .NET backend, който пълни темплейта и намалява наличностите
    message.success('Фактурата се генерира...');
    navigate('/invoices');
  };

  const [manualItems, setManualItems] = useState<ManualLineItem[]>([
    { key: '1', description: '', quantity: 1, unitPrice: 0 },
  ]);

  const addManualItem = () => {
    setManualItems([...manualItems, { key: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeManualItem = (key: string) => {
    setManualItems(manualItems.filter((item) => item.key !== key));
  };

  const updateManualItem = (key: string, field: keyof ManualLineItem, value: string | number) => {
    setManualItems(manualItems.map((item) => (item.key === key ? { ...item, [field]: value } : item)));
  };

  const manualTotal = manualItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const manualColumns = [
    {
      title: 'Описание',
      dataIndex: 'description',
      render: (_: unknown, record: ManualLineItem) => (
        <Input
          value={record.description}
          placeholder="Услуга или част"
          onChange={(e) => updateManualItem(record.key, 'description', e.target.value)}
        />
      ),
    },
    {
      title: 'Количество',
      width: 140,
      render: (_: unknown, record: ManualLineItem) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => updateManualItem(record.key, 'quantity', val ?? 1)}
          className="full-width"
        />
      ),
    },
    {
      title: 'Ед. цена (лв.)',
      width: 160,
      render: (_: unknown, record: ManualLineItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={(val) => updateManualItem(record.key, 'unitPrice', val ?? 0)}
          className="full-width"
        />
      ),
    },
    {
      title: 'Общо',
      width: 120,
      render: (_: unknown, record: ManualLineItem) => `${(record.quantity * record.unitPrice).toFixed(2)} лв.`,
    },
    {
      title: '',
      width: 50,
      render: (_: unknown, record: ManualLineItem) => (
        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeManualItem(record.key)} />
      ),
    },
  ];

  const handleManualGenerate = (values: any) => {
    if (manualItems.length === 0) {
      message.error('Добави поне един ред.');
      return;
    }
    console.log('Ръчно генериране:', { ...values, items: manualItems, total: manualTotal });
    message.success('Фактурата се генерира...');
    navigate('/invoices');
  };

  const ClientFields = () => (
    <Space size="large" className="form-row" wrap>
      <Form.Item label="Клиент" name="client" rules={[{ required: true }]}>
        <Input placeholder="Име на клиента" className="input-md" />
      </Form.Item>
      <Form.Item label="Кола (марка, модел, рег. номер)" name="carInfo">
        <Input placeholder="напр. VW Passat, СВ1234АВ" className="input-lg" />
      </Form.Item>
      <Form.Item label="Дата" name="date" rules={[{ required: true }]}>
        <DatePicker className="input-sm" />
      </Form.Item>
    </Space>
  );

  const AutoTab = (
    <Form form={autoForm} layout="vertical" onFinish={handleAutoGenerate}>
      <ClientFields />

      <Divider>Избрани части</Divider>

      <Table
        columns={selectedColumns}
        dataSource={selectedParts}
        pagination={false}
        rowKey="key"
        locale={{ emptyText: 'Все още няма добавени части' }}
        footer={() => (
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => setPickerOpen(true)} block>
            Добави част от склада
          </Button>
        )}
      />

      <div className="total-row">
        <Text strong>Общо: {autoTotal.toFixed(2)} лв.</Text>
      </div>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<FileDoneOutlined />}>
            Генерирай фактура по темплейт
          </Button>
          <Button onClick={() => navigate('/invoices')}>Отказ</Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const ManualTab = (
    <Form form={manualForm} layout="vertical" onFinish={handleManualGenerate}>
      <ClientFields />

      <Divider>Редове</Divider>

      <Table
        columns={manualColumns}
        dataSource={manualItems}
        pagination={false}
        rowKey="key"
        footer={() => (
          <Button type="dashed" icon={<PlusOutlined />} onClick={addManualItem} block>
            Добави ред
          </Button>
        )}
      />

      <div className="total-row">
        <Text strong>Общо: {manualTotal.toFixed(2)} лв.</Text>
      </div>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<FileDoneOutlined />}>
            Генерирай фактура по темплейт
          </Button>
          <Button onClick={() => navigate('/invoices')}>Отказ</Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <Title level={3}>Изкарване на фактура</Title>

      <Card>
        <Tabs
          defaultActiveKey="auto"
          items={[
            { key: 'auto', label: 'Избор от склад', children: AutoTab },
            { key: 'manual', label: 'Ръчно въвеждане', children: ManualTab },
          ]}
        />
      </Card>

      <Modal
        title="Избери части от склада"
        open={pickerOpen}
        onCancel={() => setPickerOpen(false)}
        footer={null}
        width={700}
      >
        <Input
          placeholder="Търси част..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
        <Table columns={stockColumns} dataSource={filteredStock} rowKey="key" pagination={false} />
      </Modal>
    </div>
  );
}