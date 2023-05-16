"use strict";

const { promisify } = require("util");
const fs = require("fs");

const yaml = require("yaml");
const VError = require("verror");

const { getConfigInstance } = require("./config");
const { RunningModes } = require("./constants");
const runner = require("./runner");
const dbHandler = require("./dbHandler");
const { getAllTenantIds } = require("./shared/cdsHelper");

const readFileAsync = promisify(fs.readFile);

// const COMPONENT_NAME = "/FeatureToggles";
const VERROR_CLUSTER_NAME = "EventQueueInitialization";

const initialize = async ({
  configFilePath,
  mode = RunningModes.singleInstance,
  registerDbHandler = true,
  betweenRuns = 5 * 60 * 1000,
} = {}) => {
  const config = await readConfigFromFile(configFilePath);
  const configInstance = getConfigInstance();
  configInstance.fileContent = config;
  configInstance.betweenRuns = betweenRuns;
  if (registerDbHandler) {
    const dbService = await cds.connect.to("db");
    dbHandler.registerEventQueueDbHandler(dbService);
  }
  const multiTenancyEnabled = await getAllTenantIds();
  if (mode === RunningModes.singleInstance) {
    // TODO: check if there is a redis binding
    configInstance.redisEnabled = false;
    // TODO: find a better way to determine this
    if (multiTenancyEnabled) {
      runner.singleInstanceAndMultiTenancy();
    } else {
      runner.singleInstanceAndTenant();
    }
  }
  if (mode === RunningModes.multiInstance) {
    // TODO: check if there is a redis binding
    configInstance.redisEnabled = true;
    if (multiTenancyEnabled) {
      runner.multiInstanceAndTenancy();
    } else {
      runner.multiInstanceAndSingleTenancy();
    }
  }
};

const readConfigFromFile = async (configFilepath) => {
  const fileData = await readFileAsync(configFilepath);
  if (/\.ya?ml$/i.test(configFilepath)) {
    return yaml.parse(fileData.toString());
  }
  if (/\.json$/i.test(configFilepath)) {
    return JSON.parse(fileData.toString());
  }
  throw new VError(
    {
      name: VERROR_CLUSTER_NAME,
      info: { configFilepath },
    },
    "configFilepath with unsupported extension, allowed extensions are .yaml and .json"
  );
};

module.exports = {
  initialize,
};
