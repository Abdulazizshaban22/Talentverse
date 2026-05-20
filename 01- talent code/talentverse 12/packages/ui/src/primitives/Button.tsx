
import * as React from 'react';
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return <button {...props} style={{padding: '10px 16px', borderRadius: 12, border: '1px solid #ddd', background: '#fff'}} />;
};
