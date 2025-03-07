/*
 * Copyright © 2021 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CreateConnectionModal from 'components/Connections/CreateConnectionModal';

export default function AddConnectionBtnModal({ onCreate, className = null }) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleConnectionCreate() {
    setIsOpen(!isOpen);
  }

  function onCreateHandler() {
    setIsOpen(false);
    if (typeof onCreate === 'function') {
      onCreate();
    }
  }

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        className={className}
        onClick={toggleConnectionCreate}
      >
        Add Connection
      </Button>

      <CreateConnectionModal
        isOpen={isOpen}
        onToggle={toggleConnectionCreate}
        onCreate={onCreateHandler}
      />
    </>
  );
}
