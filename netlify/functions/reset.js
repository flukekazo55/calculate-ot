const {
  DEFAULT_DATA,
  jsonResponse,
  methodNotAllowed,
  optionsResponse,
  writeData,
} = require("./_store");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return optionsResponse();
  }
  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST");
  }

  try {
    const resetData = await writeData(DEFAULT_DATA);
    return jsonResponse(200, {
      message: "reset",
      resetData,
    });
  } catch (error) {
    return jsonResponse(500, {
      error: "reset_failed",
      details: error.message || "Unknown error",
    });
  }
};
