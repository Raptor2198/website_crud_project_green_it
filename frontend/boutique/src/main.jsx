import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./components/App"; // ✅ Mise à jour pour components
import Produit from "./components/Produit";
import AjouterProduit from "./components/AjouterProduit";
import ModifierProduit from "./components/ModifierProduit";
import "./index.css"; // ✅ Mise à jour du chemin

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/produit/:id" element={<Produit />} />
      <Route path="/ajouter-produit" element={<AjouterProduit />} />
      <Route path="/modifier-produit/:id" element={<ModifierProduit />} />
    </Routes>
  </BrowserRouter>
);
