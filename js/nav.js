"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
  $allFavoritesList.hide();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $mainNavLinks.show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** When user clicks on "submit" in nav bar, show the submit story form */
function navSubmitStoryClick(evt) {
  evt.preventDefault();
  $submitForm.show();
}

$navSubmit.on("click", navSubmitStoryClick)

/** When user clicks on "favorites", hides all stories and displays favorites list */
function navFavoritesClick(evt) {
  evt.preventDefault();
  $allStoriesList.hide();
  $allFavoritesList.empty();
  putFavoritesListOnPage();
  $allFavoritesList.show();
}

$navFavorites.on("click", navFavoritesClick)
