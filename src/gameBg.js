var BG1 = null;
var BG2 = null;
var GameBgLayer = cc.Layer.extend({
    _context: null,
    _progressTime: null,
    _progressTimeScheduler: null,
    _updateScheduler: null,
    _score: null,
    ctor: function(a) {
        this._super();
        this._context = a;
        this.init();
    },
    init: function() {
        this._super();
        
        var __bg1 = BG1 = new cc.Sprite(s_bg);
        __bg1.anchorX = 0;
        __bg1.anchorY = 0;
        __bg1.x = 0;
        __bg1.y = 0;
        //b.setScale(window.game.scale, window.game.scale);
        this.addChild(__bg1);

        var __bg2 = BG2 = new cc.Sprite(s_bg2);
        __bg2.anchorX = 0;
        __bg2.anchorY = 0;
        __bg2.x = 0;
        __bg2.y = cc.winSize.height;
        this.addChild(__bg2);
    }
});