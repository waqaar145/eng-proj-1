import { useState } from "react";

const useNormalDropdown = () => {
  const [show, setShow] = useState(false);

  function toggle (messageId) {
    setShow(!show)
    if (messageId) {
      let el = document.getElementById(messageId)
      let dropdownEl = document.getElementsByClassName('eng-cust-dropdown-pop');
      console.log(el, dropdownEl)
      if (el && dropdownEl) {
        console.log('if')
        let currentElPos = el.getBoundingClientRect();
        setTimeout(() => {
          console.log(dropdownEl[0])
          if (dropdownEl[0]) {
            console.log('in')
            let left = (currentElPos.left - dropdownEl[0].offsetWidth - 10) + 'px';
            if (window.innerHeight - currentElPos.bottom > dropdownEl[0].offsetHeight) { // Margin from bottom > Dropdown div height
              dropdownEl[0].style.top = currentElPos.top + 'px';
              dropdownEl[0].style.left = left;
            } else {
              dropdownEl[0].style.bottom = '0px';
              dropdownEl[0].style.left = left;
            }
            
            dropdownEl[0].animate([
              { transform: 'translateX(10px)' }, 
              { transform: 'translateX(0px)' }
            ], { 
              duration: 10,
              iterations: 1
            });
          }
        })
      }
    }
  }

  return {
    show,
    toggle
  }
}

export default useNormalDropdown;