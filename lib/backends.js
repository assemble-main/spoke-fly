// const destinations = new Collection("destinations");

export const setter = {
  name: "setter",
  test: request => true,
  respond: request => new Response("static setter", { status: 200 })
};

export const bundle = {
  name: "bundle",
  test: request => true,
  respond: request => new Response("static", { status: 200 })
};

export const admin = {
  name: "admin",
  test: request => true,
  respond: request => new Response("admin", { status: 200 })
};

export const texter = {
  name: "texter",
  test: request => true,
  respond: request => new Response("texter", { status: 200 })
};

export default { setter, bundle, admin, texter };
