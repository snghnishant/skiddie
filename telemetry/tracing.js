// Default deps
"use strict";
const process = require("process");
const opentelemetry = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const { Resource } = require("@opentelemetry/resources");
const {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} = require("@opentelemetry/semantic-conventions");

// Wrapper function to initialize OTL request tracing with a service name and envt
// This is always needs to be put at the top of any file
const init = () => {
  // TODO: Update the address where traces are being collected
  const exporterOptions = {
    url: "http://ipv4_address:port/v1/traces",
  };

  // Exporter instance
  const traceExporter = new OTLPTraceExporter(exporterOptions);
  // SDK init instance
  const sdk = new opentelemetry.NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: process.env.SERVICE_NAME,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
    }),
  });

  // initialize the SDK and register with the OpenTelemetry API
  // this enables the API to record telemetry
  sdk
    .start()
    .then(() => console.log("Tracing initialized"))
    .catch((error) => console.log("Error initializing tracing", error));

  // gracefully shut down the SDK on process exit
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("Tracing terminated"))
      .catch((error) => console.log("Error terminating tracing", error))
      .finally(() => process.exit(0));
  });
};

// module export
module.exports = {
  init_opentelemetry: init,
};

// Usage
// Opentelemetry for request tracing needs to be initialise before any service
// const { init_opentelemetry } = require("./tracing");
// if (process.env.NODE_ENV == "production") {
// 	init_opentelemetry();
// }
