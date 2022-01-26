import ReactDOM from "react-dom";

const ModalComponent = ({children, toggle}) => {
  return (
    <div className="eng-modal">
      <div className="eng-modal-pop">
        {children}
      </div>  
      <div className="eng-modal-overlay" onClick={(e) => toggle('overflow')}></div>    
    </div>
  )
}

const Modal = ({children, visible, toggle}) => {
  // if (visible) {
  //   document.body.style.overflow = 'hidden'
  // }
  return visible ? ReactDOM.createPortal(<ModalComponent toggle={toggle}>{children}</ModalComponent>, document.body) : null
}

export default Modal;