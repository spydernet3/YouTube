import { useState, useRef } from 'react';

function App() {
  const [query, setQuery] = useState('');
  const [resultType, setResultType] = useState('video');
  const [maxResults, setMaxResults] = useState(5);
  const resultsContainerRef = useRef(null);

  function searchYouTube() {
    // Check if query is empty
    if (!query) {
      alert("Please enter a search keyword.");
      return;
    }

    const tubeApi = import.meta.env.VITE_YOUTUBE_API_KEY; 

    // Initialize the YouTube API
    gapi.client.setApiKey(tubeApi); // Replace with your YouTube API key
    gapi.client.load('youtube', 'v3', function () {
      console.log("YouTube API loaded successfully");

      let requestType = resultType;

      // Shorts are treated as videos, so filter them separately
      if (resultType === 'shorts') {
        requestType = 'video';
      }

      // Make the API request
      const request = gapi.client.youtube.search.list({
        part: 'snippet',
        q: query,
        type: requestType,
        maxResults: maxResults,
      });

      request.execute(function (response) {
        console.log("API response:", response);

        const resultsContainer = resultsContainerRef.current;
        resultsContainer.innerHTML = ''; // Clear previous results

        if (!response.result.items || response.result.items.length === 0) {
          resultsContainer.innerHTML = '<p>No results found.</p>';
          return;
        }

        // Loop through each item in the response
        response.result.items.forEach(item => {
          const itemSnippet = item.snippet;

          // Check if the item is unavailable or deleted
          if (!itemSnippet.title) {
            return;
          }

          // Create title and link based on the result type
          const title = document.createElement('h3');
          title.textContent = itemSnippet.title;

          const link = document.createElement('a');
          if (resultType === 'video' || resultType === 'shorts') {
            link.href = `https://www.youtube.com/watch?v=${item.id.videoId}`;
          } else if (resultType === 'playlist') {
            link.href = `https://www.youtube.com/playlist?list=${item.id.playlistId}`;
          } else if (resultType === 'channel') {
            link.href = `https://www.youtube.com/channel/${item.id.channelId}`;
          }
          link.target = '_blank';
          link.appendChild(title);

          const thumbnail = document.createElement('img');
          thumbnail.src = itemSnippet.thumbnails.default.url;
          thumbnail.alt = itemSnippet.title;

          // Create a result item div
          const resultItem = document.createElement('div');
          resultItem.classList.add('result-item');

          resultItem.appendChild(link);
          resultItem.appendChild(thumbnail);

          resultsContainer.appendChild(resultItem);
        });
      });
    });
  }

  return (
    <div className="container">
      <header>
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" alt="YouTube Logo" className="youtube-logo" />
        <h1>YouTube Filter Search</h1>
      </header>

      <div className="search-container">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter your search keyword" />
        <select value={resultType} onChange={(e) => setResultType(e.target.value)}>
          <option value="video">Videos</option>
          <option value="playlist">Playlists</option>
          <option value="channel">Channels</option>
          <option value="shorts">Shorts</option>
        </select>
        <select value={maxResults} onChange={(e) => setMaxResults(e.target.value)}>
          <option value="5">5</option>
          <option value="15">15</option>
          <option value="35">35</option>
          <option value="50">50</option>
          <option value="75">75</option>
          <option value="100">100</option>
          <option value="125">125</option>
          <option value="150">150</option>
          <option value="175">175</option>
          <option value="200">200</option>
        </select>
        <button id="searchButton" onClick={searchYouTube}>Search</button>
      </div>

      <div ref={resultsContainerRef} id="resultsContainer" className="grid-container"></div>
    </div>
  );
}

export default App;
