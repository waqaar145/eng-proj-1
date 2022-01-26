import styles from './../../src/assets/styles/components/Tooltip.module.scss'

const EngTooltip = ({children, text}) => {
  return (
    <div className={styles.engTooltip}>{children}
      <span className={styles.engTooltiptext}>{text}</span>
    </div>
  )
}

export default EngTooltip;