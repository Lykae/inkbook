import React, { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';

import Header from './components/header';

export default function AppLayout() {
  const [canSave, setCanSave] = useState(false);
  const saveRef = useRef(() => {});

  const setOnSave = (fn) => {
    saveRef.current = fn;
  };

  return (
    <div>
      <Header
        onSave={() => saveRef.current()}
        canSave={canSave}
      />

      <div id="wrapper">
        <Outlet context={{ setCanSave, setOnSave }} />
      </div>
    </div>
  );
}