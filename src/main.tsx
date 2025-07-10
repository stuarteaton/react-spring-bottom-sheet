import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import Home from './pages/Home';
import Blocking from './pages/Blocking';
import Snap from './pages/Snap';
import Sticky from './pages/Sticky';

const App = () => (
  <BrowserRouter>
    <DefaultLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blocking" element={<Blocking />} />
        <Route path="/snap" element={<Snap />} />
        <Route path="/sticky" element={<Sticky />} />
      </Routes>
    </DefaultLayout>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />); 