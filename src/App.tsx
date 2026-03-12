import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components';
import { ListPage, CaseFormPage, DetailPage } from './pages';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/upload" element={<CaseFormPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/edit/:id" element={<CaseFormPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
