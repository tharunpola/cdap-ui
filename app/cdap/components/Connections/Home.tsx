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

import * as React from 'react';
import { Theme } from '@material-ui/core';
import { ConnectionsBrowserSidePanel } from 'components/Connections/Browser/SidePanel';
import { ConnectionsBrowser } from 'components/Connections/Browser/index';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useParams } from 'react-router';

interface IConnectionsHomeStyleProps {
  sidePanelCollapsed: boolean;
}
const useStyle = makeStyles<Theme, IConnectionsHomeStyleProps>((theme) => {
  return {
    root: {
      display: 'grid',
      gridTemplateColumns: ({ sidePanelCollapsed }) => (sidePanelCollapsed ? '0 1fr' : '250px 1fr'),
      gridTemplateRows: '100%',
      overflowY: 'hidden',
      height: '100%',
    },
  };
});

export function ConnectionsHome({ enableRouting }) {
  const params = useParams();
  const [sidePanelCollapsed, setSidePanelCollapsed] = React.useState(false);
  const [selectedConnection, setSelectedConnection] = React.useState(
    (params as any).connectionid || null
  );

  React.useEffect(() => {
    if ((params as any).connectionid !== selectedConnection) {
      setSelectedConnection((params as any).connectionid);
    }
  }, [params]);

  const classes = useStyle({ sidePanelCollapsed });
  return (
    <div className={classes.root}>
      <ConnectionsBrowserSidePanel
        enableRouting={enableRouting}
        onSidePanelToggle={() => setSidePanelCollapsed(true)}
        onConnectionSelection={(conn) => setSelectedConnection(conn)}
        selectedConnection={selectedConnection}
      />
      <ConnectionsBrowser
        selectedConnection={selectedConnection}
        enableRouting={enableRouting}
        expanded={sidePanelCollapsed}
        onCollapse={() => setSidePanelCollapsed(false)}
      />
    </div>
  );
}
