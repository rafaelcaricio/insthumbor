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
            options.chunkedMode = false;

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
            this.elements.backButton = this.element.find('.back-button');
            this.elements.waitScreen = this.element.find('.wait-screen');
            this.elements.imageScreen = this.element.find('.body');
            this.elements.boxSelection = this.element.find('.box-selection');
            this.elements.footerMenu = this.element.find('.footer-menu');
        },

        _bindEvents: function() {
            this.elements.pictureButton.on("click", $.proxy(this._onClickToTakePicture, this));
            this.elements.backButton.on("click", $.proxy(this._onClickToBack, this));
        },

        _onClickToBack: function(ev) {
            ev.preventDefault();
            this.elements.backButton.hide();
            this.elements.waitScreen.hide();
            this.elements.imageScreen.hide();
            this.elements.boxSelection.hide();
            this.elements.footerMenu.show();
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
            this.elements.waitScreen.show();
            this.elements.footerMenu.hide();
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
            this.showPicture(url.resize(300, 300).unsafeURL());
            this.elements.waitScreen.hide();
            this.elements.backButton.show();
            this.elements.imageScreen.show();
            this._showBoxSelection(imageRemoteURL);
        },

        _showBoxSelection: function(imageRemoteURL) {
            var filters = [
                'quality(50)',
                'noise(60):rgb(25,43,50)',
                'lomoize(0.6,2.3)',
                'contrast(40)',
                'sharpen(2,1.0,true)'
            ],
            self = this;

            this.elements.boxSelection.find('li').each(function(i) {

                var url = new ThumborURL(THUMBOR_REMOTE_URL, imageRemoteURL).resize(50, 50);
                $(this).find('img').attr('src', url.filter(filters[i]).unsafeURL());

                $(this).find('a').unbind('click').bind('click', function() {
                    var selectionURL = new ThumborURL(THUMBOR_REMOTE_URL, imageRemoteURL).resize(300, 300);
                    self.showPicture(selectionURL.filter(filters[i]).unsafeURL());
                });

            });

            this.elements.boxSelection.show();
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
