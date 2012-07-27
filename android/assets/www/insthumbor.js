$(function() {
    
    var THUMBOR_REMOTE_URL = 'http://thumbor.caricio.com',
        THUMBOR_UPLOAD_URL = 'http://thumbor.caricio.com/upload';

    var Utils = {

        makeId: function() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 15; i++ ) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return text;
        },

        pad: function(number) {
            number += '';
            if (number.length == 1) { 
                return '0' + number;
            }
            return number;
        }

    };

    var Device = {

        destinationType: null,

        takePicture: function(handlers) {
            navigator.camera.getPicture(handlers.success, handlers.error, {
                quality: 20,
                destinationType: Device.destinationType.FILE_URI
            });
        },

        uploadPicture: function(imageURI, handlers) {
           var options = new FileUploadOptions(),
                today = new Date();

            options.fileKey = "media";
            options.fileName = Utils.makeId() + ".jpeg";
            options.mimeType = "image/jpeg";

            var ft = new FileTransfer();
            ft.upload(imageURI, THUMBOR_UPLOAD_URL, function(response) {
                handlers.success([THUMBOR_REMOTE_URL,
                                  'unsafe',
                                   today.getFullYear(),
                                   Utils.pad(today.getMonth() + 1),
                                   today.getDate(),
                                   options.fileName].join('/'),
                    response);
            }, handlers.error, options);
        }
    };


    window.Insthumbor = function(elementId) {
        this.element = $(elementId);
        this.elements = {};

        this._findElements();
        this._bindEvents();
    };

    $.extend(Insthumbor.prototype, {

        _findElements: function() {
            this.elements.currentPicture = this.element.find('.current-picture');
            this.elements.pictureButton = this.element.find('.picture-button');
            this.elements.statusBar = this.element.find('.status-bar');
        },

        _bindEvents: function() {
            this.elements.pictureButton.on("click", $.proxy(this._onClickToTakePicture, this));
        },

        _onClickToTakePicture: function(ev) {
            Device.takePicture({
                success: $.proxy(this._photoSuccess, this),
                error: $.proxy(this._photoError, this)
            });
        },

        _photoSuccess: function(imageURI) {
            Device.uploadPicture(imageURI, {
                success: $.proxy(this._uploadSucess, this),
                error: $.proxy(this._uploadError, this)
            });
            this.showPicture(imageURI);
        },

        _photoError: function(message) {
            this.changeStatus('Photo capture failed.');
            alert('Failed because: ' + message);
        },

        _uploadSucess: function(imageRemoteURL, response) {
            console.log("Code = " + response.responseCode);
            console.log("Response = " + response.response);
            console.log("Sent = " + response.bytesSent);

            this.changeStatus("Image remote URL: " + imageRemoteURL);
            var url = new ThumborURL(THUMBOR_REMOTE_URL, imageRemoteURL);
            this.showPicture(url.resize(130, 130).filter("lomoize(0.6,2.3)").unsafeURL());
        },

        uploadError: function(error) {
            this.changeStatus('Photo upload failed.');
            alert("An error has occurred: Code = " + error.code);
        },

        showPicture: function(imageURI) {
            this.elements.currentPicture.attr('src', imageURI);
            this.elements.currentPicture.show();
        },

        changeStatus: function(message) {
            this.elements.statusBar.text(message);
        }

    });

    function onDeviceReady() {
        console.log("device ready!");
        Device.destinationType = navigator.camera.DestinationType;
        (new Insthumbor('#insthumbor'));
    }

    document.addEventListener("deviceready", onDeviceReady, false);
});
