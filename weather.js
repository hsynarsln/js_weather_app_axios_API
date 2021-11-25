const form = document.querySelector('.top-banner form'); //?top-banner clasının içindeki formu yakalıyoruz.
const input = document.querySelector('.top-banner input');
const msg = document.querySelector('.top-banner .msg');
const list = document.querySelector('.ajax-section .cities');

localStorage.setItem('apiKey', EncryptStringAES('4d8fb5b93d4af21d66a2948710284366'));

form.addEventListener('submit', e => {
  e.preventDefault(); //? s"submit" olmasın benim api'den datamı getirsin.
  getWeatherDataFromApi();
});

const getWeatherDataFromApi = async () => {
  let apiKey = DecryptStringAES(localStorage.getItem('apiKey'));
  let inputVal = input.value;
  let weatherType = 'metric'; //? santigrat olarak alıyoruz.
  // console.log(apiKey); //4d8fb5b93d4af21d66a2948710284366
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=${weatherType}`;

  try {
    const response = await axios.get(url); //? default olarak zaten "get" veriyor. yazmasak da olur
    console.log(response); //{data: {…}, status: 200, statusText: 'OK', headers: {…}, config: {…}, …}
    const { main, name, sys, weather } = response.data; //? response'un datasını {main, name, sys, weather} olarak destructure yaptık.
    // console.log(name); //Ankara

    //*-----------------------------------------
    //! Burada mükerrer şehir eklemeyi önlüyoruz
    //*-----------------------------------------
    const cityListItems = list.querySelectorAll('.city'); //? return type olarak nodeList alıyoruz. Array'e çevirmemiz lazom. Bunun için ya [...] veya Array.from yapmamız gerekir.
    const cityListItemsArray = Array.from(cityListItems);
    // console.log(cityListItemsArray);
    if (cityListItemsArray.length > 0) {
      const filteredArray = cityListItemsArray.filter(card => card.querySelector('.city-name span').innerText == name);
      if (filteredArray.length > 0) {
        msg.innerText = `You already know the weather for ${filteredArray[0].querySelector('.city-name span').innerText}, Please search for another city`;
        form.reset();
        input.focus();
        return; //? burada fonksiyonu kırmamız lazım ve true ise sonraki işlemleri devam ettirmememiz lazım yoksa yine ekleme yapar.
      }
    }

    //*---------------------
    //!----icon creating----
    //*---------------------
    // console.log(weather[0].icon); // 01n
    const iconUrl = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0].icon}.svg`;
    // console.log(iconUrl); //https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/01n.svg

    //*----------------------
    //!----li creating-------
    //*----------------------
    const createdCityCardLi = document.createElement('li');
    createdCityCardLi.classList.add('city');
    const createdCityCardLiInnerHTML = `        
    <h2 class="city-name" data-name="${name}, ${sys.country}">
      <span>${name}</span>
      <sup>${sys.country}</sup>
    </h2>
    <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
    <figure>
      <img class="city-icon" src=${iconUrl}>
      <figcaption>${weather[0].description}</figcaption>
    </figure>
    <button type="button" class="del-button" onclick="clearCity(this)">X</button>`;

    createdCityCardLi.innerHTML = createdCityCardLiInnerHTML;
    list.appendChild(createdCityCardLi);
    msg.innerText = '';
    form.reset();
    input.focus(); //? focus ile kullanıcının yeni veri girişine olanak sağlıyoruz. mouse ile tıklamadan tekrar tekrar doldurabiliyoruz.
  } catch (error) {
    msg.innerText = error;
  }
};

const clearCity = element => {
  let city = element.parentNode;
  city.parentNode.removeChild(city);
};
