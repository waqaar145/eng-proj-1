import { FaArrowLeft } from "@react-icons/all-files/fa/FaArrowLeft";
import { MdMenu } from "@react-icons/all-files/md/MdMenu";

const Header = ({ styles, handleNav }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerMenuActions}>
        <div className={styles.backButton}>
          <FaArrowLeft />
        </div>
        <div className={styles.menuIcon} onClick={handleNav}>
          <MdMenu />
        </div>
      </div>
      <div>Search Box</div>
      <div>?</div>
    </div>
  );
};

export default Header;
