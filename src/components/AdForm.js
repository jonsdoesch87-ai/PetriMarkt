import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebaseConfig";

const KANTONE = [
  "Zürich",
  "Bern",
  "Luzern",
  "Uri",
  "Schwyz",
  "Obwalden",
  "Nidwalden",
  "Glarus",
  "Zug",
  "Freiburg",
  "Solothurn",
  "Basel-Stadt",
  "Basel-Landschaft",
  "Schaffhausen",
  "Appenzell A.Rh.",
  "Appenzell I.Rh.",
  "St. Gallen",
  "Graubünden",
  "Aargau",
  "Thurgau",
  "Tessin",
  "Waadt",
  "Wallis",
  "Neuenburg",
  "Genf",
  "Jura",
];

const AdForm = ({ user, onAdCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    kanton: "",
    image: null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validierung prüfen
    if (!formData.title || !formData.price || !formData.kanton || !formData.description) {
      alert("Bitte alle Felder ausfüllen.");
      return;
    }

    try {
      setIsUploading(true);

      // Daten in Firestore speichern
      const adData = {
        title: formData.title,
        price: parseFloat(formData.price),
        description: formData.description,
        kanton: formData.kanton,
        sellerId: user.uid,
        createdAt: Date.now(),
        image: previewImage, // Bild als Base64 im Test speichern
      };

      const adsCollection = collection(firestore, "ads");
      await addDoc(adsCollection, adData);

      setIsUploading(false);
      onAdCreated(); // Callback-Funktion, z. B. Wechsel zur Startseite
    } catch (error) {
      console.error("Fehler beim Erstellen der Anzeige:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Neue Anzeige erstellen</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold mb-1">Titel:</label>
          <input
            name="title"
            type="text"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="Titel der Anzeige"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Preis (CHF):</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            placeholder="Preis in CHF"
            min="0"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Kanton:</label>
          <select
            name="kanton"
            value={formData.kanton}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
          >
            <option value="" disabled>
              Wähle den Kanton
            </option>
            {KANTONE.map((kanton, index) => (
              <option key={index} value={kanton}>
                {kanton}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold mb-1">Beschreibung:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg h-28"
            placeholder="Beschreibung der Anzeige"
          ></textarea>
        </div>
        <div>
          <label className="block font-bold mb-1">Bild hochladen:</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-1"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Vorschau"
              className="mt-3 w-full h-64 object-cover rounded-lg border"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-3 text-white font-bold rounded-lg ${
            isUploading ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          {isUploading ? "Speichern..." : "Anzeige erstellen"}
        </button>
      </form>
    </div>
  );
};

export default AdForm;
