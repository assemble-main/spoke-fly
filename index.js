import proxy from "@fly/fetch/proxy";

const admin = {
  name: "admin",
  test: request => request.referrer && request.referrer.includes("/admin"),
  respond: request =>
    proxy(request, `https://${app.config.adminBackend}`, {
      headers: {
        host: app.config.adminBackend,
        "x-forwarded-host": request.headers.get("hostname")
      }
    })
};

const texter = {
  name: "texter",
  test: request => true,
  respond: request => {
    console.log(app);
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
  console.log(request);
  for (let backend of backends) {
    if (backend.test(request)) {
      console.log(`Using ${backend.name}`);
      return backend.respond(request);
    }
  }
});
