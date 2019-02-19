import proxy from "@fly/fetch/proxy";

const admin = {
  name: "admin",
  test: request =>
    request.url.includes("/twilio") ||
    request.url.includes("/assets") ||
    (request.headers.get("referer") &&
      request.headers.get("referer").includes("/admin")),
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
  test: request => true,
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

fly.http.respondWith(request => {
  for (let backend of backends) {
    if (backend.test(request)) {
      console.log(request.headers.get("referer"));
      console.log(`Using ${backend.name}`);
      return backend.respond(request);
    }
  }
});
