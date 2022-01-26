import Layout from './../src/layout/default'
import { HTTPSSRInstance } from './../src/utils/AuthHeaders'

const Index = (props) => {
  return (
    <Layout>
      <b>Users list</b>
      <ul>
        {
          props.users.map(user => {
            return (
              <li key={user.id}>
                {user.name}
              </li>
            )
          })
        }
      </ul>
    </Layout>
  )
}

Index.getInitialProps = async (ctx) => {
  let HTTPSSR = HTTPSSRInstance(ctx);
  try {
    let {data: {data}} = await HTTPSSR.get('/api/v1/auth/test')
    return {
      users: data
    }
  } catch (error) {
    return {
      users: []
    }
  }
}

export default Index;