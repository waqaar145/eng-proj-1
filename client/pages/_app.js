import App from "next/app";
import { wrapper } from "./../src/store/index";
import { authActionTypes } from "./../src/store/auth/auth.actiontype";
import { END } from "redux-saga";
import Router from "next/router";
import { parseCookies } from "nookies";
import { HTTPClient } from "../src/services";
import { HTTPSSRInstance } from "../src/utils/AuthHeaders";
import { ToastContainer } from "react-toastify";

import "bootstrap/dist/css/bootstrap.min.css";
import "../src/assets/styles/globals.scss";
import "./../src/assets/styles/components/Modal/modal.scss";
import "./../src/assets/styles/components/Nav/nav.scss";
import "./../src/assets/styles/components/Modal/confirmModal.scss";
import "./../src/assets/styles/components/Dropdown/basicDropdown.scss";
import "react-toastify/dist/ReactToastify.min.css";

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = {
      ...(Component.getInitialProps
        ? await Component.getInitialProps(ctx)
        : {}),
    };

    if (ctx.req) {
      try {
        let HTTPSSR = HTTPSSRInstance(ctx);
        let {
          data: {
            data: { user },
          },
        } = await HTTPSSR.get("/api/v1/auth/logged-in");
        ctx.store.dispatch({
          type: authActionTypes.WATCH_LOGIN_SUCCESS,
          payload: { data: user },
        });
      } catch (error) {}
      ctx.store.dispatch(END);
      await ctx.store.sagaTask.toPromise();
    }

    const {
      Auth: { loggedInStatus, loggedInUser },
    } = ctx.store.getState();
    if (ctx.pathname === "/login" && loggedInStatus) {
      if (ctx.req) {
        ctx.res.writeHead(302, { Location: "/" });
        ctx.res.end();
      } else {
        Router.push("/");
      }
    }
    return { pageProps, store: ctx.store };
  }

  componentDidMount() {
    const cookies = parseCookies();
    HTTPClient.saveHeader({
      key: "Authorization",
      value: `Bearer ${cookies.engToken}`,
    });
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Component {...pageProps} />
        <ToastContainer />
      </>
    );
  }
}

export default wrapper.withRedux(MyApp);
