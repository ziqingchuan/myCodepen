import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components';
import { ListPage, UploadPage, DetailPage, EditPage } from './pages';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/edit/:id" element={<EditPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
