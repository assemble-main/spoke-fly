import proxy from "@fly/fetch/proxy";

const admin = {
  name: "admin",
  test: request =>
    request.url.includes("/autoassign") ||
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
  console.log(request.remoteAddr)
  if (request.remoteAddr !== '192.168.1.224') 
    return new Response(
      `<html>
      <head>
      <style>
      html, body {
          height: 100%;
      }
      body {
          margin: 0;
      }
      .flex-container {
          max-width: 100%;
          height: 100%;
          padding: 0;
          margin: 0;
          display: -webkit-box;
          display: -moz-box;
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;
          align-items: center;
          justify-content: center;
      }
      .row {
          width: auto;
          border: 1px solid blue;
          max-width: 100%;
      }
      .flex-item {
          background-color: tomato;
          padding: 10px;
          margin: 10px;
          line-height: 20px;
          max-width: 100%;
          color: white;
          text-align: center;
      }
      .flex-item img {
          max-width: 100%;
      }
      </style>
      </head>
      <body>
          <div class="flex-container">
              <div class="row"> 
                  <div class="flex-item">
                      <h3>Temporary Maintenance Mode.</h3>
                      <p>Spoke is down temporarily for exciting upgrades!</p>
                      <img src="https://media.giphy.com/media/l2JI29ccohFCPowxi/giphy.gif" />
                  </div>
              </div>
          </div>
      </body>
      </html>`
    )

  for (let backend of backends) {
    if (backend.test(request)) {
      console.log(request.headers.get("referer"));
      console.log(`Using ${backend.name}`);
      return backend.respond(request);
    }
  }
});
