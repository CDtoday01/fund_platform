import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useAuthStore  } from '../../store/auth'

function Order() {
    const isLoggedIn = useAuthStore(state => state.isLoggedIn)
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        stock_name: '',
        bid_price: '',
        ask_price: ''
    });
    
    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/form/order/', formData)
        .then(response => {
            console.log('Data submitted successfully:', response.data);
        })
        .catch(error => {
            console.error('There was an error submitting the form!', error);
        });
    };

    useEffect(() => {
        if (isLoggedIn()) {
          navigate('/order');
        }
      }, []);
    
    return (
        <>
            {isLoggedIn()
                ? <form onSubmit={handleSubmit}>
                    <h1>Order</h1>
                    <div>
                        <label>Stock Name:</label>
                        <select
                        name="stock_name"
                        value={formData.stock_name}
                        onChange={handleChange}
                        >
                        <option value="">Select</option>
                        <option value="btc">BTC</option>
                        <option value="eth">ETH</option>
                        <option value="sol">SOL</option>
                        <option value="ltc">LTC</option>
                        <option value="doge">DOGE</option>
                        </select>
                    </div>
                    <div>
                        <label>Bid Price:</label>
                        <input
                        type="number"
                        name="bid_price"
                        value={formData.bid_price}
                        onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Ask Price:</label>
                        <input
                        type="number"
                        name="ask_price"
                        value={formData.ask_price}
                        onChange={handleChange}
                        />
                    </div>
                    <button type="submit">Submit</button>
                    </form>
                : <div>
                    <h1>Please Login First</h1>
                </div> 
            }
        </>
    );
};

export default Order;