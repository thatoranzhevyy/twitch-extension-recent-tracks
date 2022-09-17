var token, userId;

inputUsername = $("#username")

// so we don't have to write this out everytime
const twitch = window.Twitch.ext;

// onContext callback called when context of an extension is fired
twitch.onContext((context) => {
  console.log(context);
});

window.Twitch.ext.onError(function (t) {
  console.log(t)
})

// onAuthorized callback called each time JWT is fired
twitch.onAuthorized((auth) => {
  // save our credentials
  token = auth.token;
  userId = auth.userId;

  let configuration = JSON.parse(twitch.configuration.broadcaster.content)
  inputUsername.val(configuration.username)
});

$("#submit").click(function () {
  twitch.configuration.set('broadcaster', '1', JSON.stringify({"username": inputUsername.val()}));
  $(this).addClass("success");
  $(this).val("Сохранено");
  setInterval(() => {
    $(this).removeClass("success");
    $(this).val("Сохранить");
  }, 1000);

});
