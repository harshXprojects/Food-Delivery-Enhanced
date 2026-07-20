import React, { useContext } from "react";
import "./Favorites.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";

const Favorites = () => {
  const { food_list, favorites } = useContext(StoreContext);
  const favoriteFoods = food_list.filter((item) => favorites.includes(item._id));

  return (
    <div className="favorites">
      <h2>My Favourites ❤️</h2>
      {favoriteFoods.length === 0 ? (
        <div className="favorites-empty">
          <p>No favourites yet!</p>
          <p>Tap the 🤍 on any food item to save it here.</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favoriteFoods.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
