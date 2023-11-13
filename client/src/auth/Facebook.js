import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { API, setHeaders } from '../api';
import { setCookie } from './helpers';

const Facebook = ({ informParent = (f) => f }) => {
  const responseFacebook = (response) => {
    console.log(response);
    API.post('/auth/create/5', setHeaders(), {
      userID: response.userID,
      accessToken: response.accessToken,
    })
      .then((response) => {
        console.log('FACEBOOK SIGNIN SUCCESS', response);
        // inform parent component
        informParent(response);
        setCookie('authType', 'Facebook');
      })
      .catch((error) => {
        console.log('FACEBOOK SIGNIN ERROR', error.response);
      });
  };
  return (
    <div className="pb-3">
      <FacebookLogin
        appId={`${process.env.REACT_APP_FACEBOOK_APP_ID}`}
        autoLoad={false}
        callback={responseFacebook}
        render={(renderProps) => (
          <button onClick={renderProps.onClick} className="btn btn-primary btn-lg btn-block">
            <i className="fab fa-facebook pr-2"></i> Login with Facebook
          </button>
        )}
      />
    </div>
  );
};

export default Facebook;
