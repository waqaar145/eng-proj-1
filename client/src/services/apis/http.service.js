import axios from 'axios';

const axiosInstance  = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

const instanceCreator = ($axios) => {
  return {
    saveHeader({key, value}) {
      $axios.defaults.headers.common[key] = value;
    },
    deleteHeader(key) {
      delete $axios.defaults.headers.common[key];
    },
    get(url, params) {
      return $axios.get(url, params);
    },
    post(resource, data) {
      return $axios.post(resource, data);
    },
    put(resource, data) {
      return $axios.put(resource, data);
    },
    delete(resource) {
      return $axios.delete(resource);
    },
    deleteWithBody(resource, data) {
      return $axios.delete(resource, {data: data});
    },
    customRequest(config) {
      return $axios(config)
    },
    successHandler(response) {
      return response;
    },
    errorHandler(error) {
      const {response} = error;
      const {data: {status} } = response
      return Promise.reject(response);
    },
    interceptorRef: null,
    mountResponseInterceptor() {
      this.interceptorRef = $axios.interceptors.response.use(
        this.successHandler,
        this.errorHandler
      );
    },
    ejectResponseInterceptor() {
      $axios.interceptors.response.eject(this.interceptorRef);
    }
  }
};

export const HTTPClient = instanceCreator(axiosInstance);
HTTPClient.mountResponseInterceptor();