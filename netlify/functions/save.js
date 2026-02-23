const {
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
    const payload = event.body ? JSON.parse(event.body) : {};
    const saved = await writeData(payload);
    return jsonResponse(200, {
      message: "saved",
      savedData: saved,
    });
  } catch (error) {
    return jsonResponse(500, {
      error: "save_failed",
      details: error.message || "Unknown error",
    });
  }
};
