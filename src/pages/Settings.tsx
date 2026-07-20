import { useState } from 'react';
import {
  Typography,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  InputNumber,
  Card,
  Space,
  message,
  Avatar,
} from 'antd';
import {
  UploadOutlined,
  InboxOutlined,
  SaveOutlined,
  FileTextOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import '../cssFiles/Settings.css';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function Settings() {
  const [businessForm] = Form.useForm();
  const [numberingForm] = Form.useForm();
  const [stockForm] = Form.useForm();

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [templateFileName, setTemplateFileName] = useState<string | null>(null);

  // --- Лого upload ---
  const logoUploadProps: UploadProps = {
    name: 'logo',
    multiple: false,
    accept: '.png,.jpg,.jpeg,.svg',
    showUploadList: false,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => setLogoUrl(e.target?.result as string);
      reader.readAsDataURL(file);
      return false; // спираме auto-upload, ще пращаме сами към backend по-късно
    },
  };

  // --- Темплейт за фактури upload ---
  const templateUploadProps: UploadProps = {
    name: 'template',
    multiple: false,
    accept: '.docx,.pdf,.xlsx',
    beforeUpload: (file) => {
      setTemplateFileName(file.name);
      message.success(`Файлът "${file.name}" е готов за качване.`);
      // TODO: изпращане към .NET backend, който съхранява темплейта
      return false;
    },
  };

  const handleBusinessSave = (values: any) => {
    console.log('Бизнес информация:', { ...values, logoUrl });
    // TODO: POST към .NET backend
    message.success('Бизнес информацията е запазена.');
  };

  const handleNumberingSave = (values: any) => {
    console.log('Номерация на фактури:', values);
    message.success('Настройките за номерация са запазени.');
  };

  const handleStockSave = (values: any) => {
    console.log('Настройки на склада:', values);
    message.success('Настройките на склада са запазени.');
  };

  // --- Таб: Бизнес информация ---
  const BusinessTab = (
    <Card>
      <Form
        form={businessForm}
        layout="vertical"
        onFinish={handleBusinessSave}
        initialValues={{
          companyName: '',
          eik: '',
          address: '',
          phone: '',
          email: '',
          iban: '',
          bankName: '',
        }}
      >
        <div className="settings-logo-row">
          <Avatar
            shape="square"
            size={80}
            src={logoUrl ?? undefined}
            icon={!logoUrl && <ShopOutlined />}
            className="settings-logo-avatar"
          />
          <Upload {...logoUploadProps}>
            <Button icon={<UploadOutlined />}>Качи лого</Button>
          </Upload>
        </div>

        <div className="settings-form-grid">
          <Form.Item label="Име на фирмата" name="companyName" rules={[{ required: true }]}>
            <Input placeholder="напр. Ауто Сервиз Петров ЕООД" />
          </Form.Item>
          <Form.Item label="ЕИК / Булстат" name="eik">
            <Input placeholder="123456789" />
          </Form.Item>
          <Form.Item label="Адрес" name="address">
            <Input placeholder="гр. София, ул. Примерна 1" />
          </Form.Item>
          <Form.Item label="Телефон" name="phone">
            <Input placeholder="+359 88 888 8888" />
          </Form.Item>
          <Form.Item label="Имейл" name="email">
            <Input placeholder="office@example.com" />
          </Form.Item>
          <Form.Item label="Банка" name="bankName">
            <Input placeholder="напр. УниКредит Булбанк" />
          </Form.Item>
          <Form.Item label="IBAN" name="iban" className="settings-form-full">
            <Input placeholder="BG00 UNCR 0000 0000 0000 00" />
          </Form.Item>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            Запази промените
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // --- Таб: Темплейт за фактури ---
  const TemplateTab = (
    <Card>
      <Text strong>Темплейт за изходящи фактури</Text>
      <p className="settings-hint-text">
        Качи Word, Excel или PDF файла с дизайна, по който трябва да се генерират
        изходящите фактури. Приложението ще попълва данните автоматично в него.
      </p>

      <Dragger {...templateUploadProps} className="settings-dragger">
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Кликни или пусни файл тук (.docx, .xlsx, .pdf)</p>
        <p className="ant-upload-hint">Ще замени текущия темплейт, ако вече има качен</p>
      </Dragger>

      {templateFileName && (
        <div className="settings-current-file">
          <FileTextOutlined />
          <Text>Текущ файл: {templateFileName}</Text>
        </div>
      )}
    </Card>
  );

  // --- Таб: Номерация на фактури ---
  const NumberingTab = (
    <Card>
      <Form
        form={numberingForm}
        layout="vertical"
        onFinish={handleNumberingSave}
        initialValues={{ prefix: 'INV-', nextNumber: 1, digits: 4 }}
      >
        <div className="settings-form-grid">
          <Form.Item label="Префикс" name="prefix">
            <Input placeholder="INV-" />
          </Form.Item>
          <Form.Item label="Следващ номер" name="nextNumber">
            <InputNumber min={1} className="settings-full-width" />
          </Form.Item>
          <Form.Item label="Брой цифри" name="digits">
            <InputNumber min={1} max={10} className="settings-full-width" />
          </Form.Item>
        </div>

        <Text type="secondary" className="settings-preview-text">
          Пример за следващ номер: <Text strong>INV-0001</Text>
        </Text>

        <Form.Item className="settings-save-button">
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            Запази промените
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  // --- Таб: Настройки на склада ---
  const StockTab = (
    <Card>
      <Form
        form={stockForm}
        layout="vertical"
        onFinish={handleStockSave}
        initialValues={{ lowStockThreshold: 5 }}
      >
        <Form.Item
          label="Праг за ниска наличност"
          name="lowStockThreshold"
          extra="Части с наличност под тази стойност ще се показват като предупреждение в Таблото и Склада."
        >
          <InputNumber min={0} className="settings-full-width" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            Запази промените
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <div>
      <Title level={3}>Настройки</Title>

      <Tabs
        defaultActiveKey="business"
        items={[
          { key: 'business', label: 'Бизнес информация', children: BusinessTab },
          { key: 'template', label: 'Темплейт за фактури', children: TemplateTab },
          { key: 'numbering', label: 'Номерация', children: NumberingTab },
          { key: 'stock', label: 'Склад', children: StockTab },
        ]}
      />
    </div>
  );
}