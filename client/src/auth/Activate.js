import React, { useState, useEffect } from 'react';
import Layout from '../core/Layout';
import { API, setHeaders } from '../api';
import { decodeToken } from 'react-jwt';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { getCookie } from './helpers';

const Activate = ({ match }) => {
  const [values, setValues] = useState({
    name: '',
    token: '',
    show: true,
  });

  useEffect(() => {
    let token = match.params.token;
    let { name } = decodeToken(token);
    // console.log(token);
    if (token) {
      setValues({ ...values, name, token });
    }
  }, []);

  const { name, token, show } = values;

  const clickSubmit = (e) => {
    e.preventDefault();
    API.post('/auth/create/3', { token })
      .then((response) => {
        console.log('ACCOUNT ACTIVATION', response);
        setValues({ ...values, show: false });
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.log('ACCOUNT ACTIVATION ERROR', error.response.data.error);
        toast.error(error.response.data.error);
      });
  };

  const activationLink = () => (
    <div className="text-center">
      <h1 className="p-5">Hey {name}, Ready to activate your account?</h1>
      <button className="btn btn-outline-primary" onClick={clickSubmit}>
        Activate Account
      </button>
    </div>
  );

  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <ToastContainer />
        {activationLink()}
      </div>
    </Layout>
  );
};

export default Activate;
