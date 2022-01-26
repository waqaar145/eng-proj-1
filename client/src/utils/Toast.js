import { toast, Slide } from 'react-toastify';


export const showToast = (message, type="success") => {
  return toast[type](message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    transition: Slide
  });
}