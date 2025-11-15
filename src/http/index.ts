import axios from "axios";

const apiKey = '2abb6d2822542a8ced7c21141396e15696da81368e12ed1454c403d83751179e';

export const cryptoHttp = axios.create ({
  baseURL: 'https://min-api.cryptocompare.com/data',
  headers: {
    authorization: `Apikey ${apiKey}`
  }
})