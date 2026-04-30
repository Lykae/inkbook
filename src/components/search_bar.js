import React, { useState } from 'react';

export default function SearchBar({ placeholder, onSearchTermChange }) {
  const [term, setTerm] = useState('');

  const handleChange = (value) => {
    setTerm(value);
    onSearchTermChange?.(value);
  };

  return (
    <input
      value={term}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}