import React from 'react';

import './card.styles.scss';

const Card = ({header, link, price, image, description}) => (
    <div className="card">
        <div className="title">
                <h3>
                    {header}
                </h3>
            </div>
            <img src={image} alt="restaurant hero"></img>
            <p>{description}</p>
            <p className="price">{price}</p>
            <a href={link} target="_blank" rel="noopener noreferrer"><button>Learn more</button></a>  
            
        
    </div>
) 

export default Card;