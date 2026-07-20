import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard.tsx'
import Invoices from './pages/Invoices';
import Stock from './pages/Stock';
import AiAssistant from './pages/AiAssistant';
import InvoiceIncomingNew from './pages/InvoiceIncomingNew.tsx'
import Settings from './pages/Settings';
import InvoiceOutgoingNew from './pages/InvoiceOutgoingNew.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/incoming/new" element={<InvoiceIncomingNew />} />
          <Route path="/invoices/outgoing/new" element={<InvoiceOutgoingNew />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
