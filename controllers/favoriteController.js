const favoriteModel = require('../models/favorite-model');
const utilities = require('../utilities/');
const jwt = require('jsonwebtoken');



async function addToFavorites(req, res) {
  try {
    const { inv_id } = req.body;

     // Add debug logs
    console.log('Adding favorite for vehicle:', inv_id);
    console.log('Current URL:', req.originalUrl)



    const { success, message } = await favoriteModel.addFavorite(
      req.user.account_id, 
      inv_id
    );

    if (success) {
      req.flash('notice', 'Added to favorites!');
    } else {
      req.flash('info', message || 'This vehicle is already in your favorites');
    }

    return res.redirect(`/inv/detail/${inv_id}`);

  } catch (error) {
    console.error('Controller error:', error);
    req.flash('error', 'Could not save favorite. Please try again.');
    return res.redirect('/account/login');
  }
}


async function showFavorites(req, res) {
  try {
    const favorites = await favoriteModel.getFavorites(req.user.account_id);
    
    res.render('account/favorites', {
      title: 'My Favorites',
      favorites: favorites.rows, // Ensure this matches your model response
      nav: await utilities.getNav()
    });
  } catch (error) {
    req.flash('error', 'Failed to load favorites');
    res.redirect('/account');
  }
}

module.exports = { addToFavorites, showFavorites };