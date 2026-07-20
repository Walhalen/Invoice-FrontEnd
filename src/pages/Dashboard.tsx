import { Typography, Row, Col, Card, Statistic, Table, Tag } from 'antd';
import {
  FileTextOutlined,
  DatabaseOutlined,
  WarningOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import '../cssFiles/Dashboard.css';

const { Title } = Typography;

// --- Примерни данни (по-късно ще идват от backend) ---

const monthlySpending = [
  { month: 'Яну', вкарани: 1200, изкарани: 2400 },
  { month: 'Фев', вкарани: 1800, изкарани: 2100 },
  { month: 'Мар', вкарани: 900, изкарани: 3200 },
  { month: 'Апр', вкарани: 1500, изкарани: 2800 },
  { month: 'Май', вкарани: 2200, изкарани: 3100 },
  { month: 'Юни', вкарани: 1700, изкарани: 2900 },
  { month: 'Юли', вкарани: 1400, изкарани: 2600 },
];

const recentInvoices = [
  { key: '1', number: 'INV-0004', type: 'outgoing', client: 'Тех Солюшънс ООД', date: '2026-07-14', total: 2100.0, status: 'draft' },
  { key: '2', number: 'INV-0003', type: 'outgoing', client: 'Мария Георгиева', date: '2026-07-10', total: 890.0, status: 'overdue' },
  { key: '3', number: 'INV-0002', type: 'incoming', client: 'Доставчик АД', date: '2026-07-05', total: 3400.5, status: 'sent' },
  { key: '4', number: 'INV-0001', type: 'outgoing', client: 'Иван Петров ЕООД', date: '2026-07-01', total: 1250.0, status: 'paid' },
];

const lowStockParts = [
  { key: '1', name: 'Свещи за запалване', available: 2, supplier: 'AutoParts BG' },
  { key: '2', name: 'Амортисьор преден', available: 6, supplier: 'Intercars' },
];

const statusColors: Record<string, string> = {
  draft: 'default',
  sent: 'blue',
  paid: 'green',
  overdue: 'red',
};

const statusLabels: Record<string, string> = {
  draft: 'Чернова',
  sent: 'Изпратена',
  paid: 'Платена',
  overdue: 'Просрочена',
};

// --- Custom tooltip за диаграмата ---
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="chart-tooltip-item" style={{ color: entry.color }}>
          <span className="chart-tooltip-dot" style={{ background: entry.color }} />
          {entry.name}: <strong>{entry.value.toFixed(2)} лв.</strong>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const stockValue = 24680.5; // TODO: изчислено от backend-а
  const monthlyRevenue = 8940.0; // TODO: сума от изходящите фактури този месец
  const invoiceCount = 12; // TODO: брой фактури този месец

  const invoiceColumns = [
    {
      title: 'Номер',
      dataIndex: 'number',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/invoices/${record.key}`)}>{text}</a>
      ),
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      render: (type: string) =>
        type === 'incoming' ? <Tag color="cyan">Вкарване</Tag> : <Tag color="purple">Изкарване</Tag>,
    },
    { title: 'Клиент', dataIndex: 'client' },
    { title: 'Дата', dataIndex: 'date' },
    {
      title: 'Сума',
      dataIndex: 'total',
      render: (v: number) => `${v.toFixed(2)} лв.`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
    },
  ];

  const stockColumns = [
    {
      title: 'Част',
      dataIndex: 'name',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/stock/${record.key}`)}>{text}</a>
      ),
    },
    {
      title: 'Наличност',
      dataIndex: 'available',
      render: (available: number) => (
        <Tag color={available < 5 ? 'red' : 'orange'}>{available} бр.</Tag>
      ),
    },
    { title: 'Доставчик', dataIndex: 'supplier' },
  ];

  return (
    <div>
      <Title level={3}>Табло</Title>

      {/* Показатели */}
      <Row gutter={16} className="dashboard-stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-stat-card">
            <Statistic
              title="Фактури този месец"
              value={invoiceCount}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-stat-card">
            <Statistic
              title="Стойност на склада"
              value={stockValue}
              precision={2}
              suffix="лв."
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-stat-card">
            <Statistic
              title="Части на изчерпване"
              value={lowStockParts.length}
              prefix={<WarningOutlined />}
              valueStyle={lowStockParts.length > 0 ? { color: '#cf1322' } : undefined}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dashboard-stat-card">
            <Statistic
              title="Приходи този месец"
              value={monthlyRevenue}
              precision={2}
              suffix="лв."
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Диаграма */}
      <Card title="Разходи и приходи по месеци" className="dashboard-chart-card">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={monthlySpending} barGap={8} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4096ff" stopOpacity={1} />
                <stop offset="100%" stopColor="#1677ff" stopOpacity={0.85} />
              </linearGradient>
              <linearGradient id="outgoingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#73d13d" stopOpacity={1} />
                <stop offset="100%" stopColor="#389e0d" stopOpacity={0.85} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8c8c8c', fontSize: 13 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8c8c8c', fontSize: 13 }}
              tickFormatter={(value) => `${value} лв.`}
            />

            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => <span className="chart-legend-label">{value}</span>}
            />

            <Bar
              dataKey="вкарани"
              name="Вкарани (разход)"
              fill="url(#incomingGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="изкарани"
              name="Изкарани (приход)"
              fill="url(#outgoingGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Таблици */}
      <Row gutter={16}>
        <Col xs={24} lg={14}>
          <Card
            title="Последни фактури"
            extra={<a onClick={() => navigate('/invoices')}>Виж всички</a>}
          >
            <Table
              columns={invoiceColumns}
              dataSource={recentInvoices}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title="Части на изчерпване"
            extra={<a onClick={() => navigate('/stock')}>Виж склада</a>}
          >
            <Table
              columns={stockColumns}
              dataSource={lowStockParts}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}