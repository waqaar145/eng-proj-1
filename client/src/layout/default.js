import Link from "next/link";

const DefaultLayout = ({children}) => {
  return (
    <>
      <ul>
      <li>
          <Link href="/auth/login" as="/signin">
            <a>Signin</a>
          </Link>
        </li>
        <li>
          <Link href="/" as="/index">
            <a>Index</a>
          </Link>
        </li>
        <li>
          <Link href="/about" as="/about">
            <a>About</a>
          </Link>
        </li>
      </ul>
      {children}
    </>
  )
}

export default DefaultLayout