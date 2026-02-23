const {
  jsonResponse,
  methodNotAllowed,
  optionsResponse,
  readData,
} = require("./_store");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return optionsResponse();
  }
  if (event.httpMethod !== "GET") {
    return methodNotAllowed("GET");
  }

  try {
    const data = await readData();
    return jsonResponse(200, data);
  } catch (error) {
    return jsonResponse(500, {
      error: "load_failed",
      details: error.message || "Unknown error",
    });
  }
};
