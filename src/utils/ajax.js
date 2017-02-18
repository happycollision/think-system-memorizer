import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/librettos',
  method: 'get',
  responseType: 'text'
})

export function getLibretto (fileName) { return new Promise((resolve, reject) => {
  const file = `${fileName}.txt`;
  axiosInstance(file)
    .then(response => {
      resolve(response.data);
    })
    .catch(error => {
      if (error.response) {
        // The request was made, but the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        reject(error.message)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        reject(error.message)
      }
      // The original config for the request
      console.log(error.config);
    })
});}