import proxy from "@fly/fetch/proxy";
import Url from "url-parse";

const adminTrafficRate = parseFloat(app.config.adminTrafficRate || 0.0);

const admin = {
  name: "admin",
  test: request => {
    const referer = request.headers.get("referer");
    // The adminbackend should handle any asset requests originating from an index served by
    // adminBackend (Lambda indexes will request from s3) as bundle hash chunks may not match
    // between EKS and Lambda
    const isAssetsRequest = request.url.includes("/assets");

    const isAutoassignRequest = request.url.includes("/autoassign");

    const isAdminRequest = referer && referer.includes("/admin");
    const isAdminRouted = Math.random() < adminTrafficRate;

    return (
      isAutoassignRequest || isAdminRequest || isAssetsRequest || isAdminRouted
    );
  },
  respond: request => {
    return proxy(`https://${app.config.adminBackend}`, {
      headers: {
        host: app.config.adminBackend,
        "x-forwarded-host": request.headers.get("hostname")
      }
    })(request);
  }
};

const texter = {
  name: "texter",
  test: _request => true,
  respond: request => {
    return proxy(`https://${app.config.texterBackend}`, {
      headers: {
        host: app.config.texterBackend,
        "x-forwarded-host": request.headers.get("hostname")
      }
    })(request);
  }
};

const backends = [admin, texter];

fly.http.respondWith(async request => {
  const { isMaintenanceMode } = app.config;
  const booleanTrue = isMaintenanceMode && isMaintenanceMode === true;
  const textTrue = isMaintenanceMode && isMaintenanceMode === "true";
  if (booleanTrue || textTrue) {
    return new Response(
      "<h1>Spoke is down for maintenance at the moment.</h1>",
      {
        status: 503
      }
    );
  }

  // Force HTTPS
  const url = new Url(request.url);
  if (url.protocol === "http:" && url.hostname !== "localhost") {
    url.set("protocol", "https:");
    return new Response("Redirecting", {
      status: 302,
      headers: { Location: url.toString() }
    });
  }

  for (let backend of backends) {
    if (backend.test(request)) {
      return backend.respond(request);
    }
  }
});
