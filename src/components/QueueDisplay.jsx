import React from 'react';
import './QueueDisplay.css';

export default function QueueDisplay({ queueNumber, serviceCategory, counter, size = 'lg' }) {
  return (
    <div className={`queue-display queue-${size}`}>
      {serviceCategory && <div className="queue-category">{serviceCategory}</div>}
      <div className="queue-number">{queueNumber || '---'}</div>
      {counter && <div className="queue-counter">Loket {counter}</div>}
    </div>
  );
}
