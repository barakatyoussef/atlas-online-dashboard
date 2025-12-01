const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path"); // 📌 Import de path pour gérer les fichiers statiques

const volsRoutes = require("./routes/vols.routes");
const synthese = require("./routes/synthese.routes");
const login = require("./routes/loginuser.routes");
const users = require("./routes/admin.routes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes API
app.use("/api", volsRoutes);
app.use("/api", synthese);
app.use("/api", login);
app.use("/api", users);

// Servir le frontend React en production
app.use(express.static(path.join(__dirname, "../build"))); 

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build/index.html"));
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur Express lancé sur http:localhost:${PORT}`);
});