import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      const response = await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Item added to cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      const response = await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Item removed from cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(url + "/api/food/list");
    if (response.data.success) {
      setFoodList(response.data.data);
    } else {
      alert("Error! Products are not fetching..");
    }
  };

  const loadCardData = async (token) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token } }
    );
    setCartItems(response.data.cartData);
  };

  const fetchFavorites = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/favorites/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setFavorites(response.data.favorites || []);
      }
    } catch (error) {
      console.log("Error fetching favorites", error);
    }
  };

  const toggleFavorite = async (itemId) => {
    if (!token) {
      toast.error("Please login to save favorites");
      return;
    }
    // Optimistic update
    const isFav = favorites.includes(itemId);
    setFavorites((prev) =>
      isFav ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
    try {
      const response = await axios.post(
        url + "/api/favorites/toggle",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        // Revert on failure
        setFavorites((prev) =>
          isFav ? [...prev, itemId] : prev.filter((id) => id !== itemId)
        );
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const reOrder = async (orderId) => {
    if (!token) {
      toast.error("Please login first");
      return false;
    }
    try {
      const response = await axios.post(
        url + "/api/order/reorder",
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
        toast.success("Items added to cart! Proceed to checkout.");
        return true;
      } else {
        toast.error(response.data.message);
        return false;
      }
    } catch (error) {
      toast.error("Something went wrong");
      return false;
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      if (localStorage.getItem("token")) {
        const savedToken = localStorage.getItem("token");
        setToken(savedToken);
        await loadCardData(savedToken);
        await fetchFavorites(savedToken);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    favorites,
    toggleFavorite,
    reOrder,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;

