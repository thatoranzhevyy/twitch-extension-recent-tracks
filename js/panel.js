const LastFm = {
  defaults: { // default, override via params
    url: 'https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks',
    page: 'https://www.last.fm/user/',
    params: {
      limit: 8,
      format: 'json',
      api_key: '',
      user: ''
    },
    loadImages: false,
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  },
  init(param) {
    var el, o = $.extend(true, {}, this.defaults, param);
    this.defaults = o;
    this.connector(o.url, o.params);
    setInterval(() => {
      this.connector(o.url, o.params)
    }, 15000);
  },
  async connector(url, params) {
    var str = $.param(params);
    await fetch(`${url}&${str}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.success(data)
      })
      .catch((error) => {
        $(".error").show()
        console.error('Fetch: Error ', error);
      });
  },
  success(data) {
    if (data) {
      if (this.defaults.params.limit > 1 && data.recenttracks.track.length) {
        this.renderItems(data.recenttracks.track)
      }
    }
  },
  renderItems(recentTracks) {
    $('.track_list').empty();
    recentTracks.forEach((trackElement) => {
      if (this.handleDate(trackElement) === "Сейчас") {
        $('.track_list').append($('<h2/>', {text: 'Сейчас играет'}));
      }

      $('.track_list').append(
        `<div class="track">
        <div class="track_item">` + ((this.defaults.loadImages) ? `<div class="track_item_image">
            <img aria-hidden="false" draggable="false" loading="eager"
                 src="${trackElement.image[0]['#text']}" width="40" height="40" alt="">
          </div>` : "") + `
          <div class="track_item_text">
            <div class="track_name">${trackElement.name}</div>
            <div class="track_artist"><span>${trackElement.artist['#text']}</span></div>
          </div>
          <div class="track_play_time" style="width: 25%">${this.handleDate(trackElement)}</div>
        </div>
      </div>`
      );

      if (this.handleDate(trackElement) === "Сейчас") {
        $('.track_list').append($('<h2/>', {text: 'Недавние треки'}));
      }
    })
  },
  handleDate(itm) {
    var n = new Date(), t, ago = "";
    if (itm.date && itm.date.uts) {
      t = Math.round((n.getTime() / 1000 - parseInt(itm.date.uts)) / 60);
      ago += this.handleSinceDateEndings(t, itm.date.uts);
    } else {
      ago += "Сейчас";
    }
    return ago;
  },
  handleSinceDateEndings(t, original_timestamp) {
    var ago = " ", date;
    if (t <= 1) {
      ago += "Сейчас";
    } else if (t < 60) {
      ago += t + " мин назад";
    } else if (t >= 60 && t <= 120) {
      ago += Math.floor(t / 60) + " час назад"
    } else if (t < 1440) {
      //console.log(t)
      ago += Math.floor(t / 60) + " часов назад";
    } else if (t < 2880) {
      ago += "1 день назад";
    } else if (t > 2880 && t < 4320) {
      ago += "2 дня назад";
    } else {
      date = new Date(parseInt(original_timestamp) * 1000)
      ago += this.defaults.months[date.getMonth()] + " " + date.getDate();
    }
    return ago;
  },
};

const twitch = window.Twitch.ext;
twitch.onAuthorized(() => {
  let configuration = JSON.parse(twitch.configuration.broadcaster.content)
  if (!configuration.username || !configuration.api_key) {
    $(".error").show()
  } else {
    LastFm.init({
      params: {
        limit: "8",
        user: configuration.username,
        api_key: configuration.api_key
      },
      loadImages: false
    });
  }
});

