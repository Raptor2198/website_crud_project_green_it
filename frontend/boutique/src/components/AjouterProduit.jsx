import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/AjouterProduit.css";  

export default function AjouterProduit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nom: "", description: "", prix: "", image: null });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = e => setFormData({ ...formData, image: e.target.files[0] });

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    await axios.post("http://localhost:5000/produits", data);
    navigate("/");
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ajouter-produit-container">
      <h2>Ajouter un produit</h2>
      <form onSubmit={handleSubmit}>
        <input name="nom" placeholder="Nom" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} required />
        <input name="prix" type="number" placeholder="Prix" onChange={handleChange} required />
        <input type="file" accept="image/webp" onChange={handleFileChange} required />
        <button className="btn-ajouter">Ajouter</button>
      </form>

      {/* 🔹 Bouton Retour */}
      <button onClick={() => navigate(-1)} className="btn-retour">
        Retour
      </button>
    </motion.div>
  );
}
