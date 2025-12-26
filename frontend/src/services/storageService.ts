import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const uploadInseratImages = async (
  files: File[], 
  inseratId: string
): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const timestamp = Date.now();
    const path = `inserate/${inseratId}/${timestamp}_${index}_${file.name}`;
    return uploadImage(file, path);
  });
  
  return Promise.all(uploadPromises);
};

export const uploadProfileImage = async (
  file: File, 
  userId: string
): Promise<string> => {
  const timestamp = Date.now();
  const path = `profiles/${userId}/${timestamp}_${file.name}`;
  return uploadImage(file, path);
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Fehler beim Löschen des Bildes:', error);
  }
};

