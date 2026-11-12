import React, { useEffect, useState } from 'react';
import './PageTransition.css';

interface PageTransitionProps {
  children: React.ReactNode;
  pageKey: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, pageKey }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setVisible(true);
    }, 20);
    return () => clearTimeout(timer);
  }, [pageKey]);

  return (
    <div className={`page-transition ${visible ? 'page-transition--visible' : ''}`}>
      {children}
    </div>
  );
};

