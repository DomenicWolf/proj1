"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
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
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        ${currentUser ? favStar(story.storyId):''};
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}
function favStar(story) {
  let isFav = false
  for(let favs of currentUser.favorites){
    if(favs.storyId === story){
        isFav = true
        break;
    }
  }
  const starType = isFav ? "fas" : "far";
  return `<span class="star">
        <i class="${starType} fa-star"></i>
        </span>`;
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


$storyForm.on('submit',submitForm);



async function submitForm(e){
  e.preventDefault()
  const $author = $('#author');
  const $title = $('#title');
  const $url = $('#url');
  const story = {title: $title.val(), author: $author.val(), url: $url.val()};
  const user = currentUser;
  $storyForm.hide()
 await storyList.addStory(user,story);
 getAndShowStoriesOnStart()
 putStoriesOnPage()
}

$allStoriesList.on('click','.star', addRemoveFavorite)

async function addRemoveFavorite(e){
  const $li = $(e.target).closest('li')
  const $star = $(e.target).closest('i');
  if($star.hasClass('far')){
    const res = await axios({
    url: `${BASE_URL}/users/${currentUser.username}/favorites/${$li[0].id}`,
    method: "POST",
    data: {token:currentUser.loginToken}
  });
  console.log($star)
  
  $star.removeClass('far').addClass('fas');

  return res;
  }
  else if($star.hasClass('fas')){
    const res = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${$li[0].id}`,
      method: "DELETE",
      data: {token:currentUser.loginToken}
    });
    $star.removeClass('fas').addClass('far');
    return res;
  }
  
}

$ownStories.on('click', loadOwnStories)

function loadOwnStories(){
  const $user = $('.story-user')
 
  for(let user of $user){
 
    if(!user.textContent.includes(currentUser.username)){
      user.closest('li').hidden = true
    }
    else {
      user.closest('li').hidden = false;
      if(!user.parentElement.querySelector('.trash')){
                let span = document.createElement('span')
                span.classList.add('trash')
                let icon = document.createElement('i')
                icon.classList.add('fas');
                icon.classList.add('fa-trash-alt')
                span.append(icon)
                user.parentElement.prepend(span);
      }
      
    }
  }
}

$allStoriesList.on('click','.trash', deleteStories)

async function deleteStories(e) {
  const $li = $(e.target).closest('li');
  const $id = $li[0].id
  
  const res = await axios({
    url: `${BASE_URL}/stories/${$id}`,
    method: "DELETE",
    data: {token:currentUser.loginToken}
  });
  getAndShowStoriesOnStart()
 putStoriesOnPage()

}


$favLink.on('click', loadFavs)

function loadFavs () {
  const $stars = $('.star').find('i')
  const $trash = $('.trash').hidden = true
  for(let star of $stars){
    if(star.classList.contains('far')){
      star.closest('li').hidden = true;
    }
    else {
      star.closest('li').hidden = false;
    }
  }
}







