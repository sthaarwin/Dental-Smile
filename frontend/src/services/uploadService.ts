import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const uploadImage = async (file: File) => {
  // Validate file size
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size should be less than 2MB');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Only JPG and PNG files are allowed');
  }

  // Create form data for file upload
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`${API_URL}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data.imageUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};
