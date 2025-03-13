import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ModifierProduit.css";  

export default function ModifierProduit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nom: "", description: "", prix: "", image: null });

  useEffect(() => {
    axios.get(`http://localhost:5000/produits/${id}`)
      .then(res => setFormData(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    await axios.put(`http://localhost:5000/produits/${id}`, data);
    navigate("/");
  };

  return (
    <div className="form-container">
      <h2>Modifier le produit</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        <input type="number" name="prix" placeholder="Prix" value={formData.prix} onChange={handleChange} required />
        <input type="file" name="image" accept="image/webp" onChange={handleFileChange} />
        <button type="submit" className="btn-modifier">Modifier</button>
      </form>
      <button className="btn-retour" onClick={() => navigate(-1)}>Retour</button>
    </div>
  );
}
