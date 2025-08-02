import React, { useContext } from 'react'
import './FoodItem.css'
import rating_starts from "../frontend_assets/rating_starts.png";
import add_icon_white from "../frontend_assets/add_icon_white.png";
import remove_icon_red from "../frontend_assets/remove_icon_red.png";
import add_icon_green from "../frontend_assets/add_icon_green.png";
import { StoreContext } from '../context/StoreContext';

const FoodItem = ({id,name,price,description,image}) => {
    const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  return (
    <div>
        <div className="food-item">
            <div className="food-item-img-container">
                <img className='food-item-image' src={image} alt=""/>
                {!cartItems[id]
                    ?<img className='add' onClick={()=>addToCart(id)} 
                    src={add_icon_white} alt=""/>
                    :<div className='food-item-counter'>
                        <img onClick={()=>removeFromCart(id)} 
                        src={remove_icon_red} alt="" />
                        <p>{cartItems[id]}</p>
                        <img onClick={()=>addToCart(id)} 
                        src={add_icon_green} alt=""/>
                    </div>
                }
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <img src={rating_starts} alt='' />
                </div>
                <p className="food-item-desc">{description}</p>
                <p className="food-item-price">$ {price}</p>
            </div>
        </div>
    </div>
  )
}
export default FoodItem