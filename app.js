var url = 'http://localhost:3001';
var socket = io(url);
var toJSON = function(obj) { return JSON.stringify(obj, null, '  '); };
var println = function() {
  var args = Array.prototype.slice.call(arguments);
  var html = $('<pre class="log-box">' + args.join(' ') + '</pre><hr>');
  $('.left').append(html);

  state.logCount++;
  $('.log-count').text(state.logCount);
};

var state = {
  logCount: 0
};

var config = {
  access_token: undefined
};

if (window.location.hash === '#member') {
  config.access_token = '7f4349cc-9269-49c6-9522-418a589ed923'
} else {
  // foo, admin
  config.access_token = '82c5bbe7-d9fd-4f5d-a06c-e34e588db2fd';

}

socket.on('connect', function() {
  println('connected to server');

  // Data we're sending to the server
  var authData = {
    app_id: 1,
    subscriptions: ['DEPOSITS', 'CHAT'],
    access_token: config.access_token
  };

  println('Sent this authData to server:', toJSON(authData));

  socket.emit('auth', authData, function(err, data) {
    if (err) {
      println('[auth] err when authing to server:', toJSON(err));
      return;
    }
    println('[auth] got data from server:', toJSON(data));

    data.chat.messages.forEach(function(msg) {
      insertMessageIntoDOM(msg);
    });

    scrollChatToBottom();
  });
});

socket.on('new_message', function(msg) {
  println('[new_message]  received:', toJSON(msg));
  insertMessageIntoDOM(msg);
  scrollChatToBottom();
});

socket.on('unconfirmed_deposit_change', function(payload) {
  println('[unconfirmed_deposit_change] payload: ', toJSON(payload));
});

socket.on('confirmed_deposit_change', function(payload) {
  println('[confirmed_deposit_change] payload: ', toJSON(diff));
});

socket.on('reconnect', function() {
  println('reconnected to server');
});

socket.on('disconnect', function() {
  println('disconnected from server');
});

$('.chat-input').on('keydown', function(e) {
  var ENTER = 13;
  if (e.which !== ENTER) {
    return;
  }

  var text = $('.chat-input').val();

  socket.emit('new_message', {
    channel: undefined, // defaults to 'lobby'
    text: text
  }, function(err, msg) {
    if (err) {
      alert('Error: ' + err);
      return;
    }

    $('.chat-input').val('');
  });
});

socket.on('user_left', function(uname) {
  println('[user_left] uname:', uname);
});

socket.on('user_joined', function(user) {
  println('[user_joined] user:', toJSON(user));
});

function scrollChatToBottom() {
  $('.messages').scrollTop($('.messages')[0].scrollHeight);
}

function insertMessageIntoDOM(msg) {
  var $li;
  // system messages have no user
  if (!msg.user) {
    $li = $('<li>SYSTEM :: ' + msg.text + '</li>');
  } else {
    $li = $('<li>' + msg.user.role + ' - ' + msg.user.uname + ' : ' + msg.text + '</li>');
  }
  $('.messages').append($li);
}

$('.chat-input').focus();
