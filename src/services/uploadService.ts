import { api } from './apiClient';

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string; message: string }> {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image exceeds 5MB size limit'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await api.post<{ url: string; message: string }>('/upload', {
            imageBase64: base64,
            filename: file.name,
          });
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed reading image file'));
      reader.readAsDataURL(file);
    });
  },
};
