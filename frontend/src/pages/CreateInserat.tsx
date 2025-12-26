import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createInserat } from '../services/inserateService';
import { uploadInseratImages } from '../services/storageService';
import { useAuthStore } from '../store/authStore';

interface InseratFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'Neu' | 'Gebraucht' | 'Selbst gebastelt';
  location: string;
  zipCode?: string;
}

const CreateInserat = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<InseratFormData>();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const onSubmit = async (data: InseratFormData) => {
    if (!user) {
      setError('Bitte melde dich an');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Inserat erstellen
      const inseratId = await createInserat(
        {
          ...data,
          images: [],
        },
        user.id
      );

      // Bilder hochladen, falls vorhanden
      if (imageFiles.length > 0) {
        const imageUrls = await uploadInseratImages(imageFiles, inseratId);
        // Inserat mit Bild-URLs aktualisieren
        await import('../services/inserateService').then(({ updateInserat }) =>
          updateInserat(inseratId, { images: imageUrls })
        );
      }

      navigate(`/inserat/${inseratId}`);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen des Inserats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Neues Inserat erstellen</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Titel *
            </label>
            <input
              type="text"
              id="title"
              {...register('title', { required: 'Titel ist erforderlich' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
              Beschreibung *
            </label>
            <textarea
              id="description"
              rows={6}
              {...register('description', { required: 'Beschreibung ist erforderlich' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
                Preis (CHF) *
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                {...register('price', { 
                  required: 'Preis ist erforderlich',
                  min: { value: 0, message: 'Preis muss positiv sein' }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                Kategorie *
              </label>
              <select
                id="category"
                {...register('category', { required: 'Kategorie ist erforderlich' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Bitte wählen</option>
                <option value="Ruten">Ruten</option>
                <option value="Rollen">Rollen</option>
                <option value="Köder">Köder</option>
                <option value="Zubehör">Zubehör</option>
                <option value="Kleidung">Kleidung</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="condition" className="block text-gray-700 font-medium mb-2">
              Zustand *
            </label>
            <select
              id="condition"
              {...register('condition', { required: 'Zustand ist erforderlich' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Bitte wählen</option>
              <option value="Neu">Neu</option>
              <option value="Gebraucht">Gebraucht</option>
              <option value="Selbst gebastelt">Selbst gebastelt</option>
            </select>
            {errors.condition && (
              <p className="text-red-500 text-sm mt-1">{errors.condition.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="images" className="block text-gray-700 font-medium mb-2">
              Bilder (optional)
            </label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImageFiles(files);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {imageFiles.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {imageFiles.length} Bild(er) ausgewählt
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                Standort *
              </label>
              <input
                type="text"
                id="location"
                {...register('location', { required: 'Standort ist erforderlich' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-gray-700 font-medium mb-2">
                PLZ (optional)
              </label>
              <input
                type="text"
                id="zipCode"
                {...register('zipCode')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Wird erstellt...' : 'Inserat erstellen'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/browse')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInserat;


