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

import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { CreateConnection } from 'components/Connections/Create';
import { createPortal } from 'react-dom';
import If from 'components/If';

const useStyle = makeStyles((theme) => {
  return {
    root: {
      position: 'absolute',
      top: '50px',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.palette.white[50],
      zIndex: 1062,
      textAlign: 'left',
    },
  };
});

export default function CreateConnectionModal({
  isOpen,
  onToggle,
  initialConfig = null,
  onCreate,
  isEdit = false,
}) {
  const classes = useStyle();

  const body = document.body;
  const [el] = React.useState(document.createElement('div'));

  React.useEffect(() => {
    if (isOpen) {
      body.appendChild(el);
    }
    return () => {
      try {
        body.removeChild(el);
      } catch (e) {
        // no-op
      }
    };
  }, [isOpen]);

  return createPortal(
    <div className={classes.root}>
      <If condition={isOpen}>
        <CreateConnection
          enableRouting={false}
          onToggle={onToggle}
          initialConfig={initialConfig}
          onCreate={onCreate}
          isEdit={isEdit}
        />
      </If>
    </div>,
    el
  );
}
