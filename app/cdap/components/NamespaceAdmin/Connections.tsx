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
import makeStyles from '@material-ui/core/styles/makeStyles';
import { IConnection } from 'components/NamespaceAdmin/store';
import { connect } from 'react-redux';
import Table from 'components/Table';
import TableHeader from 'components/Table/TableHeader';
import TableRow from 'components/Table/TableRow';
import TableCell from 'components/Table/TableCell';
import TableBody from 'components/Table/TableBody';
import { humanReadableDate, objectQuery } from 'services/helpers';
import ActionsPopover, { IAction } from 'components/ActionsPopover';
import { deleteConnection } from 'components/NamespaceAdmin/store/ActionCreator';
import ConfirmationModal from 'components/ConfirmationModal';
import DownloadFile from 'services/download-file';
import CreateConnectionModal from 'components/Connections/CreateConnectionModal';
import { getConnections } from 'components/NamespaceAdmin/store/ActionCreator';
import AddConnectionBtnModal from 'components/Connections/AddConnectionBtnModal';
import ImportConnectionBtn from 'components/Connections/ImportConnectionBtn';

const useStyle = makeStyles((theme) => {
  return {
    subtitleSection: {
      marginBottom: '15px',

      '& > *': {
        marginRight: '10px',
      },
    },
    delete: {
      color: objectQuery(theme, 'palette', 'red', 100),
    },
  };
});

interface IConnectionsProps {
  connections: IConnection[];
}

const ConnectionsView: React.FC<IConnectionsProps> = ({ connections }) => {
  const classes = useStyle();
  const [isCreateConnectionOpen, setIsCreateConnectionOpen] = useState(false);
  const [initConnConfig, setInitConnConfig] = useState(null);
  const [connectionToDelete, setConnectionToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  let confirmDeleteElem;
  if (connectionToDelete) {
    confirmDeleteElem = (
      <div>
        Are you sure you want to delete{' '}
        <strong>
          <em>{connectionToDelete.name}</em>
        </strong>
        ?
      </div>
    );
  }

  function handleDelete() {
    if (!connectionToDelete) {
      return;
    }

    deleteConnection(connectionToDelete).subscribe(handleConfirmationClose, (err) => {
      setDeleteError(err);
    });
  }

  function handleConfirmationClose() {
    setConnectionToDelete(null);
    setDeleteError(null);
  }

  function toggleConnectionCreate() {
    const newState = !isCreateConnectionOpen;

    setIsCreateConnectionOpen(newState);

    if (!newState) {
      setInitConnConfig(null);
      setIsEdit(false);
    }
  }

  function getConnectionConfig(conn) {
    const connectionConfig = {
      name: conn.name,
      description: conn.description,
      category: conn.plugin.category,
      plugin: conn.plugin,
    };

    return connectionConfig;
  }

  function exportConnection(conn) {
    const connectionConfig = getConnectionConfig(conn);
    const artifact = objectQuery(conn, 'plugin', 'artifact') || {};
    DownloadFile(
      connectionConfig,
      null,
      `${conn.name}-connector-${artifact.name}-${artifact.version}`
    );
  }

  function cloneConnection(conn) {
    const config = getConnectionConfig(conn);
    delete config.name;

    openConnectionConfig(config);
  }

  function openConnectionConfig(config) {
    setInitConnConfig(config);
    toggleConnectionCreate();
  }

  function editConnection(conn) {
    const config = getConnectionConfig(conn);
    setIsEdit(true);
    openConnectionConfig(config);
  }

  return (
    <div>
      <div className={classes.subtitleSection}>
        <AddConnectionBtnModal onCreate={getConnections} />
        <ImportConnectionBtn onCreate={getConnections} />
      </div>

      <Table columnTemplate="2fr 1fr 1fr 100px">
        <TableHeader>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Installed on</TableCell>
            <TableCell />
          </TableRow>
        </TableHeader>

        <TableBody>
          {connections.map((conn) => {
            const actions: IAction[] = [
              {
                label: 'Edit',
                actionFn: () => editConnection(conn),
              },
              {
                label: 'Export',
                actionFn: () => exportConnection(conn),
              },
              {
                label: 'Duplicate',
                actionFn: () => cloneConnection(conn),
              },
              {
                label: 'separator',
              },
              {
                label: 'Delete',
                actionFn: () => setConnectionToDelete(conn),
                className: classes.delete,
              },
            ];

            return (
              <TableRow key={conn.name}>
                <TableCell>{conn.name}</TableCell>
                <TableCell>{conn.connectionType}</TableCell>
                <TableCell>{humanReadableDate(conn.createdTimeMillis, true)}</TableCell>
                <TableCell>
                  <ActionsPopover actions={actions} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ConfirmationModal
        headerTitle="Delete connection"
        toggleModal={handleConfirmationClose}
        confirmationElem={confirmDeleteElem}
        confirmButtonText="Delete"
        confirmFn={handleDelete}
        cancelFn={handleConfirmationClose}
        isOpen={!!connectionToDelete}
        errorMessage={!deleteError ? '' : 'Failed to delete connection'}
        extendedMessage={deleteError}
      />

      <CreateConnectionModal
        isOpen={isCreateConnectionOpen}
        onToggle={toggleConnectionCreate}
        initialConfig={initConnConfig}
        onCreate={getConnections}
        isEdit={isEdit}
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    connections: state.connections,
  };
};

const Connections = connect(mapStateToProps)(ConnectionsView);
export default Connections;
