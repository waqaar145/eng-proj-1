import { useState } from "react";

const useNav = () => {
  const [show, setShow] = useState(false);

  function toggle (data) {
    if (data) {
      document.body.style.overflow = null;
    }
    setShow(!show);
  }

  return {
    show,
    toggle
  }
}

export default useNav;