/*
 * Copyright © 2020 Cask Data, Inc.
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

import React, { useCallback, useEffect, useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { getCurrentNamespace } from 'services/NamespaceStore';
import { MyPipelineApi } from 'api/pipeline';
import ConfigurationGroup from 'components/ConfigurationGroup';
import { objectQuery } from 'services/helpers';
import { FormControlLabel, Switch } from '@material-ui/core';
import ToggleSwitch from 'components/ToggleSwitch';
import LoadingSVG from 'components/LoadingSVG';
import VersionStore from 'services/VersionStore';

const useStyles = makeStyles({
  container: {
    left: 0,
    maxWidth: '100%',
    width: '100%',
    height: '100%',
    paddingBottom: '50px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'stretch',
  },
  toggleContainer: {
    maxWidth: '25%',
    paddingTop: '10px',
    paddingBottom: '10px',
  },
  inner: {
    overflowY: 'scroll',
  },
});

function fetchPluginInfo() {
  const version = VersionStore.getState().version;
  const pluginParams = {
    namespace: getCurrentNamespace(),
    parentArtifact: 'cdap-data-pipeline', // cdap-data-pipeline
    version, // $CDAP_VERSION
    extension: 'sqlengine', // sqlengine
    pluginName: 'BigQueryPushdownEngine', // BigQueryPushdownEngine
    scope: 'SYSTEM', // SYSTEM // may change
    artifactName: 'google-cloud', // google-cloud
    artifactScope: 'SYSTEM', // SYSTEM
    limit: 1,
    order: 'DESC',
  };

  return MyPipelineApi.getPluginProperties(pluginParams).map(([res]) => {
    return res;
  });
}

// TODO: this is copied without modification from app/cdap/components/Replicator/utilities/index.ts
// is there a shared place it can move instead?
function fetchPluginWidget(artifactName, artifactVersion, artifactScope, pluginName, pluginType) {
  const widgetKey = `widgets.${pluginName}-${pluginType}`;
  const params = {
    namespace: getCurrentNamespace(),
    artifactName,
    artifactVersion,
    scope: artifactScope,
    keys: widgetKey,
  };

  return MyPipelineApi.fetchWidgetJson(params).map((res) => {
    if (!res || !res[widgetKey]) {
      return {};
    }

    try {
      const widgetContent = JSON.parse(res[widgetKey]);
      return widgetContent;
    } catch (parseError) {
      throw new Error(parseError);
    }
  });
}

function defaultPushdown(version) {
  return {
    plugin: {
      name: 'BigQueryPushdown', // FIXME: should there be an "Engine" on this?
      label: 'BigQueryPushdown',
      type: 'sqlengine',
      artifact: {
        name: 'google-cloud',
        version,
        scope: 'USER', // FIXME: where is this supposed to come from?
      },
      properties: {},
    },
  };
}
interface IPushdownConfig {
  enabled: boolean;
  transformationPushdown: null | {
    plugin: null | object;
  };
}

interface IPushdownProps {
  value: IPushdownConfig;
  onValueChange: (value: IPushdownConfig) => void;
}

export default function PushdownConfig({ value, onValueChange }: IPushdownProps) {
  const [loading, setLoading] = useState(true);
  const [pluginInfo, setPluginInfo] = useState(null);
  const [pluginWidget, setPluginWidget] = useState(null);
  const pluginProperties = objectQuery(pluginInfo, 'properties') || {};
  const { enabled, transformationPushdown } = value;

  const plugin = objectQuery(transformationPushdown, 'plugin');
  const valueProperties = objectQuery(plugin, 'properties') || {};

  const classes = useStyles();
  const onChange = (newProps) => {
    const newTransformationPushdown = {
      plugin: {
        ...plugin,
        properties: {
          ...valueProperties,
          ...newProps,
        },
      },
    };
    onValueChange({ enabled, transformationPushdown: newTransformationPushdown });
  };

  const toggleEnabled = () => {
    onValueChange({ enabled: !enabled, transformationPushdown });
  };

  useEffect(() => {
    fetchPluginInfo().subscribe(
      (res) => {
        fetchPluginWidget(
          'google-cloud',
          res.artifact.version,
          res.artifact.scope,
          'BigQueryPushdown',
          'sqlengine'
        ).subscribe(
          (widget) => {
            if (plugin === null || plugin === undefined) {
              onValueChange({
                enabled,
                transformationPushdown: defaultPushdown(res.artifact.version),
              });
            }
            setPluginInfo(res);
            setPluginWidget(widget);
          },
          null,
          () => {
            setLoading(false);
          }
        );
      },
      (err) => {
        // tslint:disable-next-line: no-console
        console.error('Error fetching plugin', err);

        // TODO: error handling
      }
    );
    // pass etc
  }, []);

  if (loading) {
    return <LoadingSVG />;
  }

  return (
    <div className={classes.container}>
      <div className={classes.inner}>
        ELT Pushdown lets you push transformations to an SQL-compatible engine, enabling an ELT
        pattern.
        <div className="label-with-toggle row">
          <span className="toggle-label col-xs-4">Enable ELT Pushdown</span>
          <div className="col-xs-7 toggle-container">
            <ToggleSwitch isOn={enabled} onToggle={toggleEnabled} />
          </div>
        </div>
        <ConfigurationGroup
          widgetJson={pluginWidget}
          pluginProperties={pluginProperties}
          values={valueProperties}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

PushdownConfig.propTypes = {
  value: PropTypes.object,
  onValueChange: PropTypes.func,
};
