import NavComponent from "./../../../src/components/Nav/main";

const SideNavbar = ({ show, toggle, children }) => {
  return (
    <NavComponent visible={show} toggle={toggle}>
      {children}
    </NavComponent>
  );
};

export default SideNavbar;
