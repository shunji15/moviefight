const autoCompleteConfig ={
  renderOption(movie) {
  const imgSrc = movie.Poster === 'N/A' ? '': movie.Poster;
  return `
    <img src="${imgSrc}" />
    <h6>${movie.Title} (${movie.Year})</h6>
   `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response  = await axios.get('http://www.omdbapi.com/', {
      params: {
      apikey: '38c4e79c',
      s: searchTerm, 
      }
    });
    if(response.data.Error) {
        return [];
    }
    return response.data.Search;
  }
};

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector("#left-summary"), 'left');
  }
});

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector("#right-summary"), 'right');
  }
});



let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: '38c4e79c',
        i: movie.imdbID
      }
    });

    summaryElement.innerHTML = movieTemplate(response.data);

    if (side === 'left') {
      leftMovie = response.data;
    } else {
      rightMovie = response.data;
    }

    if (leftMovie && rightMovie) {
      runComparision();
    };
};

const runComparision = () => {
  const leftSideStats = document.querySelectorAll('#left-summary .notification');
  const rightSideStats = document.querySelectorAll('#right-summary .notification');

  

   leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];
    leftSideValue = parseInt(leftStat.dataset.value);
    rightSideValue = parseInt(rightStat.dataset.value);
    if (leftSideValue > rightSideValue) {
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
    } else {
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
    }
  }); 
};



const movieTemplate = (movieDetail) => {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g,'').replace(/,/g, '')
    );
  const metaScore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const votes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
  
  const awards = movieDetail.Awards.split(' ').reduce((acc,curr) => {
    const value = parseInt(curr);
    if(isNaN(value)) {
      return acc;
    } else {
      return acc + value;
    }
  }, 0);
  
  return `
    <article class="media">
      <figure class="media-left"> 
        <p class="image">  
          <img src=${movieDetail.Poster} />
        </p>
      </figure>
      <div class="media-content"> 
        <div class="content"> 
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p> ${movieDetail.Plot} </p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metaScore} class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${votes} class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
}