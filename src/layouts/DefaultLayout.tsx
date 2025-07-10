import React from 'react';
import NavigationBar from '../components/NavigationBar';

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
    <NavigationBar />
    {children}
  </div>
);

export default DefaultLayout; 