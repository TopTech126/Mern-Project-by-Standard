import React, { useState, useEffect } from 'react';
import { decodeToken } from 'react-jwt';
import Layout from '../core/Layout';
import { API, setHeaders } from '../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { getCookie } from './helpers';

const Reset = ({ match }) => {
  // props.match from react router dom
  const [values, setValues] = useState({
    name: '',
    token: '',
    newPassword: '',
    buttonText: 'Reset password',
  });

  useEffect(() => {
    let token = match.params.token;
    let { name } = decodeToken(token);
    // console.log(name);
    if (token) {
      setValues({ ...values, name, token });
    }
  }, []);

  const { name, token, newPassword, buttonText } = values;

  const handleChange = (event) => {
    setValues({ ...values, newPassword: event.target.value });
  };

  const clickSubmit = async (event) => {
    event.preventDefault();
    setValues({ ...values, buttonText: 'Submitting' });
    await API.put('/auth/update/2', setHeaders(), { newPassword, resetPasswordLink: token })
      .then((response) => {
        console.log('RESET PASSWORD SUCCESS', response);
        toast.success(response.data.message);
        setValues({ ...values, buttonText: 'Done' });
      })
      .catch((error) => {
        console.log('RESET PASSWORD ERROR', error.response.data);
        toast.error(error.response.data.error);
        setValues({ ...values, buttonText: 'Reset password' });
      });
  };

  const passwordResetForm = () => (
    <form>
      <div className="form-group">
        <label className="text-muted">Email</label>
        <input
          onChange={handleChange}
          value={newPassword}
          type="password"
          className="form-control"
          placeholder="Type new password"
          required
        />
      </div>

      <div>
        <button className="btn btn-primary" onClick={clickSubmit}>
          {buttonText}
        </button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <ToastContainer />
        <h1 className="p-5 text-center">Hey {name}, Type your new password</h1>
        {passwordResetForm()}
      </div>
    </Layout>
  );
};

export default Reset;
