import React from 'react';

// sass
import './shop.styles.scss'

import ItemList from '../item-list/item-list.component'

const Shop = () => (
    <div className="shop">
        <h2>
            Shop
        </h2>
    <ItemList />
    </div>
)

export default Shop;