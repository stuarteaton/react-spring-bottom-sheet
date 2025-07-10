import React, { useState, useRef } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';

const Home: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const bottomSheetRef = useRef<{ snapToPoint: (idx: number) => void }>(null);
  const snapPoints = [25, 50, 90];

  return (
    <div style={{ padding: '20px' }}>
      <h1>React Spring Bottom Sheet Playground</h1>
      
      <div style={{ marginTop: 24 }}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '12px',
          }}
        >
          {isOpen ? 'Close' : 'Open'} Bottom Sheet
        </button>

        {/* Snap controls always available */}
        <div style={{ display: 'inline-block', marginLeft: '12px' }}>
          <span style={{ marginRight: '8px' }}>Snap to:</span>
          {snapPoints.map((point, index) => (
            <button
              key={index}
              onClick={() => bottomSheetRef.current?.snapToPoint(index)}
              style={{
                padding: '4px 8px',
                margin: '0 4px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {point}%
            </button>
          ))}
        </div>
      </div>

      <BottomSheet 
        ref={bottomSheetRef}
        open={isOpen}
        snapPoints={snapPoints}
        initialSnapPoint={1}
        canSwipeClose={true}
        canBackdropClose={true}
        blocking={false}
        onClose={() => setIsOpen(false)}
      >
        <div style={{ padding: '20px 0' }}>
          <h2>Bottom Sheet Content</h2>
          <p>This is a working bottom sheet component! You can:</p>
          <ul>
            <li>✅ Click the backdrop to close</li>
            <li>✅ Press Escape to close</li>
            <li>✅ Switch between snap points (25%, 50%, 90%)</li>
            <li>✅ Drag to resize (coming soon)</li>
            <li>🔄 Swipe to close (coming soon)</li>
          </ul>

          {/* Snap point controls inside the sheet */}
          <div style={{ margin: '20px 0' }}>
            <span style={{ marginRight: '8px' }}>Snap to:</span>
            {snapPoints.map((point, index) => (
              <button
                key={index}
                onClick={() => bottomSheetRef.current?.snapToPoint(index)}
                style={{
                  padding: '4px 8px',
                  margin: '0 4px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {point}%
              </button>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close Sheet
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

export default Home; 