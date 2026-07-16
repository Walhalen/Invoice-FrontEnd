import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Sider, Header, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Табло' },
  { key: '/invoices', icon: <FileTextOutlined />, label: 'Фактури' },
  { key: '/stock', icon: <DatabaseOutlined />, label: 'Склад' },
  { key: '/ai-assistant', icon: <RobotOutlined />, label: 'AI Асистент' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Настройки' },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsible>
        <div
          style={{
            height: 32,
            margin: 16,
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Invoice App
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px' }} />
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}