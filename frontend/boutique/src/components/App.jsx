// Importation des modules nécessaires
import { useState, useEffect } from "react"; // useState pour gérer l'état local et useEffect pour les effets secondaires
import axios from "axios"; // Axios permet de faire des requêtes HTTP vers l'API
import { Link } from "react-router-dom"; // Permet la navigation entre les pages sans rechargement
import { motion } from "framer-motion"; // Bibliothèque pour ajouter des animations fluides aux éléments de l'interface
import "../styles/App.css";  // Importation du fichier de styles CSS

export default function App() {
  // 🔹 Déclaration de l'état pour stocker la liste des produits
  const [produits, setProduits] = useState([]);

  // ✅ Rafraîchissement automatique et mise en cache locale pour optimiser les performances
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/produits"); // Requête pour récupérer les produits depuis le serveur
        setProduits(response.data); // Mise à jour de l'état avec les données reçues
        localStorage.setItem("produits", JSON.stringify(response.data)); // ✅ Mise en cache des produits dans le localStorage (optimisation Green IT)
      } catch (error) {
        console.error("Erreur lors de la récupération des produits :", error);
      }
    };

    fetchData(); // Chargement initial des produits au montage du composant

    const interval = setInterval(fetchData, 5000); // 🔄 Rafraîchissement automatique toutes les 5 secondes
    return () => clearInterval(interval); // 🔄 Nettoyage au démontage du composant pour éviter les fuites de mémoire

  }, []);

  // 🔹 Fonction pour supprimer un produit
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/produits/${id}`); // Suppression du produit dans la base de données

      const newProduits = produits.filter(p => p.id !== id); // Mise à jour de l'état en supprimant le produit localement
      setProduits(newProduits);
      localStorage.setItem("produits", JSON.stringify(newProduits)); // ✅ Mise à jour du cache après suppression (optimisation Green IT)

    } catch (error) {
      console.error("Erreur lors de la suppression du produit :", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-50"> {/* Conteneur principal avec une couleur de fond */}
      
      {/* 🔹 Barre de navigation */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 shadow-lg sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto flex items-center justify-between p-6">
          <Link to="/" className="text-2xl font-bold text-white">Gestion Boutique CRUD</Link>
          <div className="hidden lg:flex gap-x-6">
            <Link to="/" className="text-white hover:text-indigo-200 transition">Accueil</Link>
            <Link to="/ajouter-produit" className="text-white hover:text-indigo-200 transition">Ajouter Produit</Link>
          </div>
        </nav>
      </header>

      {/* 🔹 Contenu principal */}
      <main className="flex-1 max-w-6xl mx-auto p-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-4xl font-bold text-center text-blue-900 mb-6">
          Nos Produits 
        </motion.h1>

        {/* 🔹 Affichage des produits sous forme de grille */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {produits.map(p => (
            <motion.div 
              key={p.id} 
              whileHover={{ scale: 1.05 }} 
              className="bg-white p-5 rounded-lg shadow-md transition">
              
              {/* ✅ Lazy Load des images pour optimiser le chargement des ressources */}
              <img 
                src={`/images/${p.image}`} 
                alt={p.nom} 
                className="w-full h-40 object-cover rounded-md mb-4" 
                loading="lazy"
              />

              {/* Nom et prix du produit */}
              <h2 className="text-xl font-semibold text-blue-800">{p.nom}</h2>
              <p className="text-lg font-bold text-red-500">{p.prix} €</p>

              {/* 🔹 Boutons d'actions */}
              <div className="flex justify-between mt-4">
                <Link to={`/produit/${p.id}`} 
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition">
                  Détails
                </Link>
                
                <Link to={`/modifier-produit/${p.id}`} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition">
                  Modifier
                </Link>
                
                <button 
                  onClick={() => handleDelete(p.id)} 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition">
                  Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* 🔹 Pied de page */}
      <footer className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 text-center">
        © 2024 Boutique CRUD Green IT - Tous droits réservés.
      </footer>
    </div>
  );
}
