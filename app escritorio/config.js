require("dotenv").config();

module.exports = {
  // URL del web app desplegado en Railway (actualizar después de deploy)
  API_URL: process.env.DCLOCK_API_URL || "http://localhost:3000",

  // Puerto del servidor local al que se conectan las apps móviles
  LOCAL_PORT: Number(process.env.LOCAL_PORT) || 7474,

  APP_VERSION: "1.0.0",
};
