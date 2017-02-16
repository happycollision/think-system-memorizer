import React from 'react';
import ReactDOM from 'react-dom';
import FlipCard from './FlipCard';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<FlipCard />, div);
});

