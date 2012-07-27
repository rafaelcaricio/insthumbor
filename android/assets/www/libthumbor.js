var CryptoLib = {};

var ThumborURL = function(thumborServer, imageURL) {
    if (imageURL) {
        this.imageURL = imageURL.replace(/^https?\:\/\//, '');
    } else {
        this.imageURL = '';
    }

    this.thumborServer = thumborServer;

    this.width = 0;
    this.height = 0;
    this.smart = false;
    this.fitInFlag = false;
    this.withFlipHorizontally = false;
    this.withFlipVertically = false;
    this.halignValue = null;
    this.valignValue = null;
    this.cropValues = null;
    this.meta = false;
    this.filtersCalls = [];
}

ThumborURL.prototype =  {

    TOP: 'top',
    MIDDLE: 'middle',
    BOTTOM: 'bottom',

    RIGHT: 'right',
    CENTER: 'center',
    LEFT: 'left',

    inflateKey: function(securityKey) {
        while (securityKey.length < 16) {
            securityKey += securityKey;
        }
        return securityKey.substring(0, 16);
    },

    generate: function() {
        var url = this.requestPath(),
            encryptedURL;

        url = this.rightPad(url, '{');

        encryptedURL = CryptoLib.AES.encrypt(url, CryptoLib.charenc.UTF8.stringToBytes(this.key), {mode: new CryptoLib.mode.ECB(CryptoLib.pad.NoPadding) });

        return '/' + encryptedURL.replace(/\+/g, '-').replace(/\//g, '_') + '/' + this.imageURL;
    },

    unsafeURL: function() {
        var safeURL = this.urlParts();
        safeURL.push(this.imageURL);
        return this.thumborServer + '/unsafe/' + safeURL.join('/');
    },

    requestPath: function() {
        var parts = this.urlParts();
        parts.push(this.md5(this.imageURL));
        return parts.join('/');
    },

    urlParts: function() {
        if (!this.imageURL) {
            throw Error('The image url can\'t be null or empty.');
        }

        var parts = [];

        if (this.meta) {
            parts.push('meta');
        }

        if (this.cropValues) {
            parts.push(this.cropValues.left + 'x' + this.cropValues.top + ':' + this.cropValues.right + 'x' + this.cropValues.bottom);
        }

        if (this.fitInFlag) {
            parts.push('fit-in');
        }


        if (this.width || this.height || this.withFlipHorizontally || this.withFlipVertically) {
            var sizeString = '';

            if (this.withFlipHorizontally) {
                sizeString += '-';
            }
            sizeString += this.width;

            sizeString += 'x';

            if (this.withFlipVertically) {
                sizeString += "-";
            }
            sizeString += this.height;

            parts.push(sizeString);
        }

        if (this.halignValue) {
            parts.push(this.halignValue);
        }

        if (this.valignValue) {
            parts.push(this.valignValue);
        }

        if (this.smart) {
            parts.push('smart');
        }

        if (this.filtersCalls.length) {
            parts.push('filters:' + this.filtersCalls.join(':'));
        }

        return parts;
    },

    rightPad: function(url, padChar) {
        var numberOfChars = 16 - url.length % 16;

        if (!numberOfChars) {
            return url;
        }

        for (var i=0; i < numberOfChars; i++) {
            url += padChar;
        }

        return url;
    },

    md5: function(imageURL) {
        return CryptoLib.MD5(imageURL);
    },

    resize: function(width, height) {
        this.width = width;
        this.height = height;
        return this;
    },

    withSmartCropping: function() {
        this.smart = true;
        return this;
    },

    fitIn: function(width, height) {
        this.width = width;
        this.height = height;
        this.fitInFlag = true;
        return this;
    },

    flipHorizontally: function() {
        this.withFlipHorizontally = true;
        return this;
    },

    flipVertically: function() {
        this.withFlipVertically = true;
        return this;
    },

    halign: function(halign) {
        if (halign === this.LEFT || halign === this.RIGHT || halign === this.CENTER) {
            this.halignValue = halign;
        } else {
            throw Error('Horizontal align must be left, right or center.');
        }
        return this;
    },

    valign: function(valign) {
        if (valign === this.TOP || valign === this.BOTTOM || valign === this.MIDDLE) {
            this.valignValue = valign;
        } else {
            throw Error('Vertical align must be top, bottom or middle.');
        }
        return this;
    },

    crop: function(left, top, right, bottom) {
        if (left > 0 && top > 0 && right > 0 && bottom > 0) {
            this.cropValues = {left: left, top: top, right: right, bottom: bottom};
        }
        return this;
    },

    metaDataOnly: function() {
        this.meta = true;
        return this;
    },

    filter: function(filterCall) {
        this.filtersCalls.push(filterCall);
        return this;
    },

    toString: function() {
        return this.generate();
    }

};
