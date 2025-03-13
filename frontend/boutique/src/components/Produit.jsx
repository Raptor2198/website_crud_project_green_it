import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Produit.css";  

export default function Produit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produit, setProduit] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/produits/${id}`)
      .then(res => setProduit(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleDelete = () => {
    axios.delete(`http://localhost:5000/produits/${id}`)
      .then(() => {
        alert("Produit supprimé !");
        navigate("/");
      })
      .catch(err => console.error(err));
  };

  if (!produit) return <p>Chargement...</p>;

  return (
    <div className="produit-container">
      <h1>{produit.nom}</h1>
      <img src={`/images/${produit.image}`} alt={produit.nom} loading="lazy" />
      <p>{produit.description}</p>
      <p>{produit.prix} €</p>
      <button onClick={handleDelete} className="btn btn-danger">Supprimer</button>
      <button onClick={() => navigate(`/modifier-produit/${produit.id}`)} className="btn btn-primary">Modifier</button>
      <button onClick={() => navigate("/")} className="btn btn-primary">Retour</button>
    </div>
  );
}
