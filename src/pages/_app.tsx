import "../styles/globals.scss";
import { CeramicWrapper } from "../context";
import type { AppProps } from "next/app";
import React from "react";
import AuthPrompt from "./did";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <div>
      <div className='container'>
        <CeramicWrapper>
          <div className='body'>
            <Component {...pageProps} ceramic />
          </div>
        </CeramicWrapper>
      </div>
    </div>
  );
};

export default MyApp;
