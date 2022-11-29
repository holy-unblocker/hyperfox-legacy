/* eslint-disable @typescript-eslint/no-var-requires */
const createBareServer = require("@tomphttp/bare-server-node");
const { uvPath } = require("@titaniumnetwork-dev/ultraviolet");
const express = require("express");
const { join } = require("path");

/**
 *
 * @param {import("express").Express} app
 */
function setupProxy(app) {
  const bareServer = createBareServer("/bare/");

  app.use((req, res, next) => {
    if (bareServer.shouldRoute(req)) {
      bareServer.routeRequest(req, res);
    } else next();
  });

  app.use("/uv/", express.static(join(__dirname, "..", "public", "uv")));
  app.use("/uv/", express.static(uvPath));
}

module.exports = setupProxy;
