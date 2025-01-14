import { applyMiddleware } from 'redux';

import camera from './camera';
import connection from './connection';
import documentation from './documentation';
import engineMode from './engineMode';
import exoplanets from './exoplanets';
import fetchData from './fetchData';
import flightController from './flightController';
import missions from './missions';
import propertyTree from './propertyTree';
import sessionRecording from './sessionRecording';
import shortcuts from './shortcuts';
import skybrowser from './skybrowser';
import time from './time';
import version from './version';

const middleware = applyMiddleware(
  // logger, // middleWare for logging state change
  propertyTree,
  time,
  engineMode,
  sessionRecording,
  connection,
  shortcuts,
  version,
  missions,
  fetchData,
  flightController,
  documentation,
  exoplanets,
  skybrowser,
  camera
);

export default middleware;
