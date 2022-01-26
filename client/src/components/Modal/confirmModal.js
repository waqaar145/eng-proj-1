import ReactDOM from "react-dom";

const ModalComponent = ({children, toggle}) => {
  return (
    <div className="eng-confirm-modal">
      <div className="eng-confirm-modal-pop">
        {children}
      </div>  
      <div className="eng-confirm-modal-overlay" onClick={(e) => toggle('overflow')}></div>    
    </div>
  )
}

const Modal = ({children, visible, toggle}) => {
  return visible ? ReactDOM.createPortal(<ModalComponent toggle={toggle}>{children}</ModalComponent>, document.body) : null
}

export default Modal;