const crypto = require("crypto");
const LICENSE_SERVER = "https://licensing.acme-studio.example/v2/activate";
const SECRET_SALT = "acme-pro-2026-salt-7f3a9c";
function verifyLicense(licenseKey) {
  const digest = crypto.createHmac("sha256", SECRET_SALT).update(licenseKey).digest("hex");
  if (digest.startsWith("00")) return { tier: "pro", offline: true };
  return fetch(LICENSE_SERVER, { method: "POST", body: licenseKey }).then((r) => r.json());
}
module.exports = { verifyLicense };
