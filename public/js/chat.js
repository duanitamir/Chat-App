const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#sendLocation');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = ()=>{

    // New Message element
    const $newMessage = $messages.lastElementChild;

    // Height of new Message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBlockEnd);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible heigt
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight-newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
};

socket.on('message', (data) => {
    const html = Mustache.render(messageTemplate, {
        username: data.username,
        message: data.text,
        createdAt: moment(data.createdAt).format('hh:mm a'),
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
});

socket.on('locationMessage', (data) => {
    const html = Mustache.render(locationTemplate, {
        username: data.username,
        location: data.location,
        createdAt: moment(data.createdAt).format('hh:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

});

$messageForm.addEventListener('submit', (e) => {

    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message;

    socket.emit('send', message.value, (error) => {
        $messageFormInput.value = '';
        $messageFormInput.focus();
        $messageFormButton.removeAttribute('disabled');
        if (error) {
            return console.log(error)
        }
        console.log('Delivered')
    });

});

$locationButton.addEventListener('click', (e) => {

    $locationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('shareLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared');
            $locationButton.removeAttribute('disabled')
        });
    })
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users}
    );
    document.querySelector('#sidebar').innerHTML = html
});

socket.emit('join', {username, room}, (error) => {
    //  If theres a failure in connaction to room, alert to the screen
    if (error) {
        alert(error);
        location.href = '/';
    }


});

