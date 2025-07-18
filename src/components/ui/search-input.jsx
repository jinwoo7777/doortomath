import React from 'react';
import { Search } from 'lucide-react';

const SearchInput = React.forwardRef(({ 
  className, 
  placeholder = "검색...", 
  value, 
  onChange, 
  id,
  ...props 
}, ref) => {
  const containerStyle = {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center'
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    pointerEvents: 'none',
    color: '#9ca3af',
    width: '16px',
    height: '16px'
  };

  const inputStyle = {
    width: '100%',
    height: '40px',
    paddingLeft: '40px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  };

  return (
    <div style={containerStyle}>
      <Search style={iconStyle} />
      <input
        ref={ref}
        type="text"
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={inputStyle}
        onFocus={(e) => {
          e.target.style.borderColor = '#3b82f6';
          e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
    </div>
  );
});

SearchInput.displayName = "SearchInput";

export { SearchInput };