import axios from 'axios';
const baseUrl = '/api/blogs';

let token = null;

const setToken = newToken => {
  token = `Bearer ${newToken}`;
  console.log('Setting token:', token); // Debugging log
};

fetch('/api/blogs', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));


const getAll = async () => {
  try {
    const config = {
      headers: { Authorization: token },
    };
    const response = await axios.get(baseUrl, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching all blogs:', error.response || error.message); // Debugging log
    throw error;
  }
};

const create = async newObject => {
  try {
    const config = {
      headers: { Authorization: token },
    };
    const response = await axios.post(baseUrl, newObject, config);
    return response.data;
  } catch (error) {
    console.error('Error creating a blog:', error.response || error.message); // Debugging log
    throw error;
  }
};

const update = async (id, newObject) => {
  try {
    const config = {
      headers: { Authorization: token },
    };
    const response = await axios.put(`${baseUrl}/${id}`, newObject, config);
    return response.data;
  } catch (error) {
    console.error('Error updating the blog:', error.response || error.message); // Debugging log
    throw error;
  }
};

const remove = async id => {
  try {
    const config = {
      headers: { Authorization: token },
    };
    const response = await axios.delete(`${baseUrl}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting the blog:', error.response || error.message); // Debugging log
    throw error;
  }
};

export default {
  getAll,
  create,
  update,
  remove,
  setToken,
};
