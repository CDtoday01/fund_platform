import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useAuthStore  } from '../../store/auth'

function Trade() {
  const isLoggedIn = useAuthStore(state => state.isLoggedIn)
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
      btc_price: '',
      usdt_total: '',
      btc_amount: '',
    });
  
    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      axios.post('http://127.0.0.1:8000/form/trade/', formData)
        .then(response => {
          console.log('Data submitted successfully:', response.data);
        })
        .catch(error => {
          console.error('There was an error submitting the form!', error);
        });
    };

    useEffect(() => {
      if (isLoggedIn()) {
        navigate('/trade');
      }
    }, []);

  return (
    <>
      {isLoggedIn()
      ? <form onSubmit={handleSubmit}>
          <h1>Trade</h1>
          <div>
              <label>Price</label>
              <input
              type="number"
              name="btc_price"
              value={formData.btc_price}
              onChange={handleChange}
              />
          </div>
          <div>
              <label>Spend</label>
              <input
              type="number"
              name="usdt_total"
              value={formData.usdt_total}
              onChange={handleChange}
              />
          </div>
          <div>
              <label>Recieve up to</label>
              <input
              type="number"
              name="btc_amount"
              value={formData.btc_amount}
              onChange={handleChange}
              />
          </div>
          <button type="submit">Confirm</button>
      </form>
      : <div>
          <h1>Please Login First</h1>
      </div> 
      }
    </>
  )
}

export default Trade