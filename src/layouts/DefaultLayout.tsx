import React from 'react';

const DefaultLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
    {children}
  </div>
);

export default DefaultLayout; 