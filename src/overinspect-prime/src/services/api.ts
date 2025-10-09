import axios from 'axios';

const API_BASE_URL = 'https://your-api-url.com/api'; // Replace with your actual API base URL

export const fetchServiceTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/service_types`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching service types');
  }
};

export const fetchServiceTypeFields = async (serviceTypeId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/service_types/${serviceTypeId}/fields`);
    return response.data.map(field => ({
      ...field,
      input_type: field.input_type || 'string', // Default to 'string' if input_type is not provided
    }));
  } catch (error) {
    throw new Error('Error fetching service type fields');
  }
};