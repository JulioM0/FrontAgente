import React from 'react';

export const Button = ({ onClick, children, className, type = 'button', ...props }) => (
  <button type={type} onClick={onClick} className={className} {...props}>
    {children}
  </button>
);

