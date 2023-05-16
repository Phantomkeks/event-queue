"use strict";

// TODO: how to deal with tx chaining - maybe inherit _ from context
// TODO: how to deal with fatal logs
// TODO: think about switching to cds.env from own config class
// TODO: adjust all logs --> different syntax
// TODO: add createdAt to persistence to proper order/sort event queue entries

module.exports = {
  ...require("./initialize"),
  ...require("./config"),
  ...require("./eventTypeRegister"),
  ...require("./processEventQueue"),
  ...require("./dbHandler"),
  ...require("./constants"),
  ...require("./publishEvent"),
  EventQueueProcessorBase: require("./EventQueueProcessorBase"),
};
