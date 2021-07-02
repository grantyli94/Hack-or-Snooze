"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  console.debug("getAndShowStoriesOnStart");
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {
  let hiddenToggle = "hidden";
  let starToggle;
  
  if (currentUser) {
    starToggle = checkFavorite(story) ? "fas" : "far"
    hiddenToggle = "";
  }
  
  const hostName = story.getHostName();
  // always star, but hidden if user doesn't exist
  return $(`
      <li id="${story.storyId}">
        <span class="trash hidden"><i class="fas fa-trash-alt"></i></span>
        <span class="star ${hiddenToggle}"><i class="fa-star ${starToggle}"></i></span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Checks if a story is in the user's favorites array */

function checkFavorite(story) {
  return currentUser.favorites.some(function(storyItem){
    return storyItem.storyId === story.storyId;
  })
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Takes in form values for story submission and creates new Story instance. Prepends new story 
 * to top of story list and hides submission form
 */
async function submitNewStory(evt) {
  evt.preventDefault();
  let author = $("#author-name").val();
  let title = $("#story-title").val();
  let url = $("#story-url").val();
  
  let story = {author, title, url};
  let newStory = await storyList.addStory(currentUser, story);
  
  currentUser.ownStories.push(newStory)

  const $story = generateStoryMarkup(newStory);
  $allStoriesList.prepend($story);
  $submitForm.hide();
}

$submitForm.on("submit", submitNewStory);

/** Click handler on star icon to add or remove a favorite story. Changes color of star based on favorite status */

function toggleFavorite(evt) {
  console.debug("toggleFavorite",evt);
  let $storyId = $(evt.target).closest('li').attr('id');
  let story = findStory($storyId);
  
  // Adds or removes story from favorites based on inclusion in favorites list
  if (!checkFavorite(story)) {
    currentUser.addFavorite(story);
    $(evt.target).addClass("fas").removeClass("far");
  }
  else {
    currentUser.removeFavorite(story);
    $(evt.target).addClass("far").removeClass("fas");
  }
}

$(".stories-container").on("click", ".star", toggleFavorite);

/** Grabs current user's favorite stories. Iterates over list and generates HTML markups for each and appends to DOM */
function putFavoritesListOnPage() {
  let favorites = currentUser.favorites;
  for (let favorite of favorites) {
    const $favorite = generateStoryMarkup(favorite);
    $allFavoritesList.append($favorite);
  }
}

/** Iterates over stories to find story that matches given storyId */ 
function findStory(storyId) {
  let foundStory;
  for (let story of storyList.stories) { //.find() finds first element that satisifies callback function and returns it
    if (story.storyId === storyId) {
      foundStory = story;
    }
  }
  return foundStory;
}

$(".stories-container").on("click", ".trash", deleteStory);

/** Generates HTML markup for user's ownStories list and appends it to the DOM */
function putUserStoriesOnPage() {
  $userStoriesList.empty()
  let userStories = currentUser.ownStories;
  for (let story of userStories) {
    let $story = generateStoryMarkup(story);
    $story[0].children[0].classList.remove("hidden");
    $userStoriesList.append($story);
  }
}

/** When the trashcan icon is clicked in user's ownStories list, grabs evt.target's storyId. Updates the API to delete the story. Remove story from user's ownStories list
*/
async function deleteStory(evt) {
  console.debug("deleteStory")
  let $storyId = $(evt.target).closest('li').attr('id');
  await currentUser.deleteFromServer($storyId);
  currentUser.ownStories = currentUser.ownStories.filter(story => story.storyId !== $storyId);
  putUserStoriesOnPage();
}