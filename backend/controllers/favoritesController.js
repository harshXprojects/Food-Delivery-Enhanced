import userModel from "../models/userModel.js";

// Toggle favorite (add if not present, remove if already favorited)
const toggleFavorite = async (req, res) => {
  const { itemId } = req.body;
  const userId = req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    const isFav = user.favorites.includes(itemId);
    if (isFav) {
      await userModel.findByIdAndUpdate(userId, { $pull: { favorites: itemId } });
      res.json({ success: true, message: "Removed from favorites" });
    } else {
      await userModel.findByIdAndUpdate(userId, { $push: { favorites: itemId } });
      res.json({ success: true, message: "Added to favorites" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Get all favorites for logged in user
const getFavorites = async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { toggleFavorite, getFavorites };
