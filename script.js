'use strict';

let localStream = null;
let peer = null;
let existingCall = null;

// Get camera and audio object.
navigator.mediaDevices.getUserMedia({video:true, audio:true})
    .then(function(stream) {
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
    }).catch(function(error) {
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
    });

$(function(){
    $('#make-call').children().prop("disabled", true);    
});

// Peering
$('#make-peer').submit(function(e){
    e.preventDefault();
    var peerId = $('#peer-id').val();

    // Create peer object.
    peer = new Peer(peerId,        
        {
        key: '55ed50bb-74ed-46cf-b08d-3486b05b9f47',
        debug: 3
    });    

    peer.on('open', function(){
        // Connect to signaling server.
        $('#my-id').text(peer.id);
    }).on('error', function(err){
        // Errot
        alert(err.message);
    }).on('close', function(){
        // Close 
    }).on('disconnected', function(){
        // Disonnect to signaling server.
    }).on('call', function(call){
        call.answer(localStream);
        setupCallEventHandlers(call);
    });
    
    $('#make-call').children().prop("disabled", false);        
});

// Calling
$('#make-call').submit(function(e){
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream);
    setupCallEventHandlers(call);
});

$('#end-call').click(function(){
    existingCall.close();
    $('#make-call').children().prop("disabled", true);            
});

function setupCallEventHandlers(call) {
    // It takes priority
    if (existingCall) {
        existingCall.close();
    };

    existingCall = call;

    call.on('stream', function(stream){
        addVideo(call,stream);
        setupEndCallUI();
        $('#their-id').text(call.remoteId);
    });

    call.on('close', function(){
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });    
} 

function addVideo(call, stream) {
    $('#their-video').get(0).srcObject = stream;
}

function removeVideo(peerId) {
    $('#'+peerId).remove();
}

function setupMakeCallUI() {
    $('#make-call').show();
    $('#end-call').hide();
}

function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}