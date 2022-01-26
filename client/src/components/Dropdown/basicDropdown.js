import ReactDOM from "react-dom";

const ModalComponent = ({ children, toggle }) => {
  return (
    <div className="eng-cust-dropdown">
      <div className="eng-cust-dropdown-pop">{children}</div>
      <div
        className="eng-cust-dropdown-overlay"
        onClick={(e) => toggle("overflow")}
      ></div>
    </div>
  );
};

const Modal = ({ children, visible, toggle }) => {
  return visible
    ? ReactDOM.createPortal(
        <ModalComponent toggle={toggle}>{children}</ModalComponent>,
        document.body
      )
    : null;
};

export default Modal;
