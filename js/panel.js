const LastFm = {
  defaults: { // default, override via params
    url: 'https://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks',
    page: 'https://www.last.fm/user/',
    user: 'oranzhevyy',
    params: {
      limit: 5, format: 'json', api_key: 'df9ebdae99abc2fabf3c55ceb195e1db', user: 'gandreich'
    },
    loadImages: false,
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  }, init(param) {
    var el, o = $.extend(true, {}, this.defaults, param);
    this.defaults = o;
    this.connector(o.url, o.params);
    setInterval(() => {
      this.connector(o.url, o.params)
    }, 10000);
    // console.log(this.defaults)
  }, success(jo) {
    $('.track_list').empty();
    if (this.defaults.params.limit > 1 && jo.recenttracks.track.length) {
      for (i = 0; i < jo.recenttracks.track.length; i++) {
        // console.log(jo.recenttracks.track[i])
        this.renderItems(jo.recenttracks.track[i]);
      }
    } else {
      // handle the non array returned
      // console.log(jo.recenttracks.track)
    }
  }, async connector(url, params) {

    var str = $.param(params);
    await fetch(`${url}&${str}`, {
      method: 'GET', // or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        this.success(data)

        // const today = new Date();
        // var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        // console.log('Fetch: Success ' + time);
      })
      .catch((error) => {
        console.error('Fetch: Error ', error);
      });
  }, renderItems(trackElement) {
    // console.log(trackElement)
    if (this.handleDate(trackElement) === "Сейчас") {
      $("<h2>Сейчас играет</h2>").appendTo($('.track_list'))
    }
    item = `
      <div class="track">
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
      </div>`;
    $(item).appendTo($('.track_list'))
    if (this.handleDate(trackElement) === "Сейчас") {
      $("<h2>Недавние треки</h2>").appendTo($('.track_list'))
    }
    // console.log(this.handleDate(trackElement))
  }, handleDate(itm) {
    var n = new Date(), t, ago = "";
    if (itm.date && itm.date.uts) {
      t = Math.round((n.getTime() / 1000 - parseInt(itm.date.uts)) / 60);
      ago += this.handleSinceDateEndings(t, itm.date.uts);
    } else {
      ago += "Сейчас";
    }
    return ago;
  }, handleSinceDateEndings(t, original_timestamp) {
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
      ago += "1 day ago";
    } else if (t > 2880 && t < 4320) {
      ago += "2 days ago";
    } else {
      date = new Date(parseInt(original_timestamp) * 1000)
      ago += this.defaults.months[date.getMonth()] + " " + date.getDate();
    }
    return ago;
  }
};

/*
$("#updateList").click(function () {
  LastFm.init({params: {limit: "14", user: "gandreich"}, loadImages: true});
});
*/

const twitch = window.Twitch.ext;
twitch.onAuthorized((auth) => {
  // save our credentials
  token = auth.token;
  userId = auth.userId;
  let configuration = JSON.parse(twitch.configuration.broadcaster.content)
  if (configuration.username) LastFm.init({
    params: {limit: "8", user: configuration.username}, loadImages: false
  }); else $(".error").show()
});
