import React from 'react';

export default function LoadingScreen({ message, sub }) {
  return (
    <div className="screen loading-screen">
      <div className="loading-content">
        <div className="loading-logo">FL</div>
        <div className="loading-dots"><span /><span /><span /></div>
        <p className="loading-message">{message}</p>
        <p className="loading-sub">{sub}</p>
      </div>
    </div>
  );
}
