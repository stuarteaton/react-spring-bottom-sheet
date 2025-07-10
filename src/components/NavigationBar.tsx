import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar: React.FC = () => (
  <nav style={{ marginBottom: 24 }}>
    <Link to="/" style={{ marginRight: 16 }}>Home</Link>
    <Link to="/blocking" style={{ marginRight: 16 }}>Blocking</Link>
    <Link to="/snap" style={{ marginRight: 16 }}>Snap</Link>
    <Link to="/sticky">Sticky</Link>
  </nav>
);

export default NavigationBar; 