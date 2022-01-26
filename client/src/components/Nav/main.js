import ReactDOM from "react-dom";

const NavComponent = ({children, toggle}) => {
  return (
    <div className="eng-nav">
      <div className="eng-nav-pop">
        {children}
      </div>  
      <div className="eng-nav-overlay" onClick={(e) => toggle('overflow')}></div>    
    </div>
  )
}

const SideNav = ({children, visible, toggle}) => {
  // if (visible) {
  //   document.body.style.overflow = 'hidden'
  // }
  return visible ? ReactDOM.createPortal(<NavComponent toggle={toggle}>{children}</NavComponent>, document.body) : null
}

export default SideNav;