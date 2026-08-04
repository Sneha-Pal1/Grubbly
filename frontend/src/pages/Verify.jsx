import React, { useCallback, useContext, useEffect } from 'react';
import './Verify.css';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext.js';
import axios from 'axios';

const Verify = () => {
  // const [searchParams, setSearchParams] = useSearchParams();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const verifyPayment = useCallback(async () => {
    const response = await axios.post(url + '/api/order/verify', {
      success,
      orderId,
    });
    if (response.data.success) {
      navigate('/myorders');
    } else {
      navigate('/');
    }
  }, [navigate, orderId, success, url]);
  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>Verifying your order...</p>
    </div>
  );
};

export default Verify;
