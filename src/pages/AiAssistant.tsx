import { useState, useRef, useEffect } from 'react';
import {
  Typography,
  Input,
  Button,
  Card,
  Avatar,
  Space,
  Spin,
  Table,
  Empty,
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import '../cssFiles/AiAssistant.css';

const { Title, Text, Paragraph } = Typography;

interface ChatMessage {
  key: string;
  sender: 'user' | 'ai';
  text: string;
  table?: { columns: string[]; rows: (string | number)[][] };
}

const initialMessages: ChatMessage[] = [
  {
    key: '1',
    sender: 'ai',
    text: 'Здравей! Можеш да ме питаш за части, наличности или фактури на нормален език.',
  },
];

export default function AiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelData, setPanelData] = useState<ChatMessage['table'] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      key: Date.now().toString(),
      sender: 'user',
      text: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    // TODO: изпращане на inputValue към .NET backend
    // backend-ът праща заявката към LLM заедно със схемата на базата,
    // LLM-ът генерира SQL/структурирана заявка, backend-ът я изпълнява
    // и връща резултата (текст + евентуално таблица) обратно тук
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        key: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Намерих 1 част с ниска наличност — виж детайлите в панела вдясно.',
        table: {
          columns: ['Част', 'Наличност', 'Доставчик'],
          rows: [['Свещи за запалване', 2, 'AutoParts BG']],
        },
      };

      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);

      if (aiResponse.table) {
        setPanelData(aiResponse.table);
        setPanelOpen(true);
      }
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const openPanelForMessage = (msg: ChatMessage) => {
    if (msg.table) {
      setPanelData(msg.table);
      setPanelOpen(true);
    }
  };

  const panelColumns = panelData?.columns.map((col, i) => ({
    title: col,
    dataIndex: i,
    key: i,
  }));

  const panelRows = panelData?.rows.map((row, i) => {
    const obj: Record<string, string | number> = { key: i };
    row.forEach((cell, j) => (obj[j] = cell));
    return obj;
  });

  return (
    <div className="ai-page">
      <div className="ai-header">
        <Title level={3} className="ai-title">
          AI Асистент
        </Title>
        <Button
          icon={panelOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setPanelOpen(!panelOpen)}
        >
          Данни
        </Button>
      </div>

      <div
        className="ai-main-row"
        style={{ gap: panelOpen ? 16 : 0 }}
      >
        <Card className="ai-chat-card" styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' } }}>
          <div className="ai-messages">
            <Space direction="vertical" size="large" className="full-width">
              {messages.map((msg) => (
                <div
                  key={msg.key}
                  className={`ai-message-row ${msg.sender === 'user' ? 'ai-message-row-user' : ''}`}
                >
                  <Avatar
                    icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    className={msg.sender === 'user' ? 'ai-avatar-user' : 'ai-avatar-bot'}
                  />
                  <div className={`ai-bubble ${msg.sender === 'user' ? 'ai-bubble-user' : 'ai-bubble-bot'}`}>
                    <Paragraph className="ai-bubble-text">{msg.text}</Paragraph>

                    {msg.table && (
                      <Button
                        size="small"
                        type="link"
                        className="ai-bubble-link"
                        onClick={() => openPanelForMessage(msg)}
                      >
                        Отвори данните →
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="ai-loading-row">
                  <Avatar icon={<RobotOutlined />} className="ai-avatar-bot" />
                  <Spin size="small" />
                  <Text type="secondary">Асистентът пише...</Text>
                </div>
              )}

              <div ref={messagesEndRef} />
            </Space>
          </div>

          <div className="ai-input-row">
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Попитай нещо, напр. 'Покажи ми фактурите от този месец'"
              autoSize={{ minRows: 1, maxRows: 4 }}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} disabled={loading} />
          </div>
        </Card>

        <div
          className="ai-panel-wrapper"
          style={{ width: panelOpen ? 380 : 0 }}
        >
          <Card
            className="ai-panel-card"
            styles={{ body: { padding: 16, overflowY: 'auto', flex: 1 } }}
            title="Резултати"
            extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setPanelOpen(false)} />}
          >
            {panelData ? (
              <Table columns={panelColumns} dataSource={panelRows} pagination={false} size="small" />
            ) : (
              <Empty description="Все още няма данни за показване" />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}