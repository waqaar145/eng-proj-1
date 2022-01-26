import NavComponent from "./../../../src/components/Nav/main";
import styles from "./../../../src/assets/styles/chat/SideNavbar.module.scss";

const SideNavbar = ({ show, toggle, children }) => {
  return (
    <NavComponent visible={show} toggle={toggle}>
      {children}
    </NavComponent>
  );
};

export default SideNavbar;
