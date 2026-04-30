import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Header from './components/header';

export default function AppLayout() {
  const [canSave, setCanSave] = useState(false);
  const [onSave, setOnSave] = useState(() => () => {});

  return (
    <div>
      <Header onSave={onSave} canSave={canSave} />

      <div id="wrapper">
        <Outlet context={{ setCanSave, setOnSave }} />
      </div>
    </div>
  );
}