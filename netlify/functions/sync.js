const {
  jsonResponse,
  methodNotAllowed,
  optionsResponse,
} = require("./_store");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return optionsResponse();
  }
  if (event.httpMethod !== "POST") {
    return methodNotAllowed("POST");
  }

  return jsonResponse(501, {
    error: "sync_disabled",
    details:
      "Git sync is not available on Netlify Functions deployment.",
  });
};
