import React from 'react';
import GoogleLogin from 'react-google-login';
import { API, setHeaders } from '../api';
import { setCookie } from './helpers';

const Google = ({ informParent = (f) => f }) => {
  const responseGoogle = (response) => {
    console.log(response.tokenId);
    API.post('/create/4', { idToken: response.tokenId }, setHeaders())
      .then((response) => {
        console.log('GOOGLE SIGNIN SUCCESS', response);
        // inform parent component
        informParent(response);
        setCookie('authType', 'Google');
      })
      .catch((error) => {
        console.log('GOOGLE SIGNIN ERROR', error.response);
      });
  };
  return (
    <div className="pb-3">
      <GoogleLogin
        clientId={`${process.env.REACT_APP_GOOGLE_CLIENT_ID}`}
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        render={(renderProps) => (
          <button
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
            className="btn btn-danger btn-lg btn-block"
          >
            <i className="fab fa-google pr-2"></i> Login with Google
          </button>
        )}
        cookiePolicy={'single_host_origin'}
      />
    </div>
  );
};

export default Google;
