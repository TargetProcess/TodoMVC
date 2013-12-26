define(['tau/libs/jquery/jquery.ui'], function($){

    $.widget('tau.sprite', {

        options: {
            fps: 25,
            autoplay: false,

            width: null,
            height: null,
            frames: null,
            url: null
        },



        _create: function() {
            this.element.addClass(this._getClass());
            this._initStyle = this.element.attr('style');
        },



        _init: function() {

            if (this.isPlaying()) {
                this.stop();
            }


            var sheetUrl = this.options.url || this.element.css('backgroundImage');

            if (sheetUrl) {
                try {
                    this._initSheetData(sheetUrl);
                } catch (e) {
                    this.element.html(e.message);
                }

                this._initDimensions();

                this._setFrame(0);

                if (this.options.autoplay) {
                    this.play();
                }
            }
        },



        _getClass: function() {
            return (this.namespace + '-' + this.widgetName);
        },



        _urlToVal: function(url, pattern, errorText) {
            var patternMatch = url.match(pattern);

            if (!patternMatch) {
                throw Error(errorText);
            }

            var digitsMatch = patternMatch[0].match(/\d+/);

            if (!digitsMatch) {
                throw Error(errorText);
            }

            return parseInt(digitsMatch[0]);
        },



        _parseFramesCount: function(url) {
            return this._urlToVal(url, /f-\d+/, 'Sprite frames count is not determined.');
        },



        _parseSheetWidth: function(url) {
            return this._urlToVal(url, /w-\d+/, 'Sprite sheet width is not determined.');
        },



        _parseSheetHeight: function(url) {
            return this._urlToVal(url, /h-\d+/, 'Sprite sheet height is not determined.');
        },



        _initSheetData: function(sheetUrl) {
            this._sheetWidth = this.options.width || this._parseSheetWidth(sheetUrl);
            this._sheetHeight =  this.options.height || this._parseSheetHeight(sheetUrl);

            this._framesCount = this.options.frames || this._parseFramesCount(sheetUrl);
            this._frameWidth = this._sheetWidth / this._framesCount;

            this._firstFrameIndex = 0;
            this._lastFrameIndex = this._framesCount - 1;
        },



        _initDimensions: function() {
            this.element.css({
                width: this._frameWidth,
                height: this._sheetHeight
            });
        },



        _setFrame: function(frameIndex) {
            var offset = -((this._currentFrameIndex = frameIndex) * this._frameWidth);
            this.element.css('backgroundPosition', offset + 'px 0px');
        },



        _nextFrame: function() {
            var nextFrameIndex = this._currentFrameIndex + 1;

            if (nextFrameIndex > this._lastFrameIndex) {
                nextFrameIndex = this._firstFrameIndex;
            }

            this._setFrame(nextFrameIndex);
        },



        isPlaying: function() {
            return !!this._playIntervalId;
        },



        play: function() {
            if (!this.isPlaying()) {
                this._playIntervalId = setInterval($.proxy(this, '_nextFrame'), 1000 / this.options.fps);
            }
        },



        stop: function() {
            if (this.isPlaying()) {
                clearInterval(this._playIntervalId);
                this._playIntervalId = null;
            }
        },



        destroy: function() {
            this.stop();

            if (this._initStyle) {
                this.element.attr('style', this._initStyle);
            }
            else {
                this.element.removeAttr('style');
            }

            this.element.removeClass(this._getClass());

            $.Widget.prototype.destroy.call(this);
        }

    });

});
