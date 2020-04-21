const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('#message');
const $messageFromButton = document.querySelector('#send-message'); 
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#side-bar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-render').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message
    const $newMessage = $messages.lastElementChild;

    // Height of the last message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    // console.log(message);
    // С помошью библиотки Mustache рендерим messageTemplate
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('k:mm'),
        username: message.username
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();
});

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Disable
    $messageFromButton.setAttribute('disabled', 'disabled');
    // document.querySelector('#message-form')
    const message = e.target.elements.message.value;
    socket.emit('newMessage', message, (error) => {
        // Enable
        $messageFromButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }

        console.log('Message delivered');
    });
});

document.querySelector('#send-location').addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled');

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('shareGeolocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared');
        });
    });
});

socket.on('renderLocation', (locationString) => {
    const html = Mustache.render(locationTemplate, {
        locationString: locationString.text,
        createdAt: moment(locationString.createdAt).format('k:mm'),
        username: locationString.username
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    $sidebar.innerHTML = '';
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    $sidebar.insertAdjacentHTML('beforeend', html);
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
});
