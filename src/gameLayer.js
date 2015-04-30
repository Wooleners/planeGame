var GameLayer = cc.Layer.extend({
    TIME: 20,
    _context: null,
    _progressTime: null, 
    _pause: null, 
    _progressTimeScheduler: null,
    _updateScheduler: null,
    _mScoreLabel: null, 
    _mTimeLabel: null, 
    _score: null, 
    _rocket: null, 
    _time: null, 
    _goldList: null, 
    _golds: null, 
    _goldText: null, 
    _gold1: null,
    _gold2: null,
    _mListener1: null,  
    _arrowDown: null,
    _tips: null,    
    _startTimer: null,  
    _maxGold: null,     
    _cash: null,    
    _frameRate: null,   
    _rockethelp: null,  
    _tipsOver: null,    
    _tips2: null,
    ctor: function(a) {
        this._super();
        this._context = a;
        this.init();
        
    },
    init: function() {
        this._super();
        this._maxGold = 3;
        this.golds = 0;
        this._goldList = [];
        this._score = 0;
        this._cash = 1;
        this._frameRate = 0;
        this._tipsOver = 0;
        this._time = this.TIME;
        var __rocket = this._rocket = new rocket(s_rocket);
        __rocket.init();
        var __rocketSize = __rocket.getContentSize();
        var size = cc.winSize;
        __rocket.anchorX = 0;
        __rocket.anchorY = 0;
        __rocket.x = size.width / 2 - __rocketSize.width / 2;
        __rocket.y = 30;
        this.addChild(__rocket, 1);
        var __img = new cc.Sprite("touxiang.jpg");
        var __imgSize = __img.getContentSize();
        __img.anchorX =0;
        __img.anchorY = 0;
        
        this._rocket.addChild(__img, -1);
        __img.setPosition(38, 105);
        var __bar = new cc.Sprite(s_bar);
        var __barSize = __bar.getContentSize();
        __bar.setAnchorPoint(0.5, 0.5);
        __bar.setPosition(-100, size.height - __barSize.height);
        this.addChild(__bar);

        var __scorebar = new cc.Sprite(s_scoreBar);
        var __scorebarSize = __bar.getContentSize();
        __scorebar.setAnchorPoint(1, 0.5);
        __scorebar.setPosition(size.width + 200, size.height - 116);
        this.addChild(__scorebar);
        this._mScoreLabel = cc.LabelTTF.create("000000米", "微软雅黑", 32);
        this._mScoreLabel.setAnchorPoint(0, 0);
        this._mScoreLabel.setColor(cc.color(255, 255, 255));
        __scorebar.addChild(this._mScoreLabel, 1);
        this._mScoreLabel.setPosition(20, 10);
        this._mTimeLabel = cc.LabelTTF.create(20, "微软雅黑", 60);
        this._mTimeLabel.setAnchorPoint(0.5, 0.5);
        this._mTimeLabel.setPosition(__barSize.width / 2, __barSize.height / 2 - 6);
        this._mTimeLabel.setColor(cc.color(255, 255, 255));
        __bar.addChild(this._mTimeLabel, 1);
        var __tip =  this._tips = new cc.Sprite(s_tips);
        __tip.setAnchorPoint(0.5, 0.5);
        __tip.setPosition(size.width / 2, __rocketSize.height + 30 + 135);
        this.addChild(__tip);
        var __tips2 = this._tips2 = new cc.Sprite(s_tips2);
        __tips2.setAnchorPoint(0.5, 0.5);
        var __rocketPos = __rocket.getPosition();
        __tips2.setPosition(__rocketPos.x + __rocketSize.width, __rocketPos.y + __rocketSize.height + 50);
        __tips2.setOpacity(0);
        this.addChild(__tips2);
        var __arr = this._arrowDown = new cc.Sprite(s_arrowDown);
        __arr.setAnchorPoint(0.5, 0.5);
        __arr.setPosition(size.width / 2, __rocketSize.height + 30 + 38);
        this.addChild(__arr);
        var __arrPos = __arr.getPosition();
        var __startPos = cc.p(__arrPos.x, __arrPos.y - 10);
        var __arrmoveD = cc.moveTo(0.3, __startPos);
        var __endPos = cc.p(__arrPos.x, __arrPos.y);
        var __arrmoveU = cc.moveTo(0.3, __endPos);
        var __actionsTimes = 0;
        var __self = this;
        var __action = cc.callFunc(function() {
                __actionsTimes++;
                if(__actionsTimes >= 5){
                    __tip.runAction(new cc.FadeOut(1));
                    __arr.runAction(new cc.FadeOut(1));
                    __tips2.runAction(new cc.FadeIn(1));
                    __bar.runAction(cc.moveTo(0.5, cc.p(0, size.height - __barSize.height)));
                    var __scorebarPos = __scorebar.getPosition();
                    __scorebar.runAction(cc.moveTo(0.5, {x: __scorebarPos.x - 100, y: size.height - 116}));
                    __self._tipsOver = 1;
                }
            });
        var __action = cc.sequence(__arrmoveD, __arrmoveU, __action);
        __arr.runAction(cc.repeat(__action, 5));
        var __gold1 = this._gold1 = new cc.Sprite(s_gold);
        __tip.setAnchorPoint(0.5, 0.5);
        __gold1.x = 35;
        __gold1.y = 33;
        this.addChild(__gold1, 1);
        var __gold2 = this._gold2 = new cc.Sprite(s_gold);
        __tip.setAnchorPoint(0.5, 0.5);
        __gold2.x = size.width - 20;
        __gold2.y = 180;
        this.addChild(__gold2, 1);
        
        this.startGame();
    },
    updateTime: function() {
        this._frameRate++;
        var __y1 = BG1.getPositionY();
            var __y2 = BG2.getPositionY();
            var __maxX = cc.winSize.width;
            var __maxY = cc.winSize.height;
            var __pos = this._rocket.getPosition();
        if (!this._rocket.first) {
            

            __y1 = __y1 - 1 * this._rocket.speed;
            __y2 = __y2 - 1 * this._rocket.speed;
            if (__maxY / -1 >= __y1) {
                __y1 = __maxY;
                this._rocket.speed = 10;
                BG1.setTexture(s_bg2);
            }
            if (__maxY / -1 >= __y2) {
                __y2 = __maxY;
            }

            BG1.setPositionY(__y1);
            BG2.setPositionY(__y2);
            var __zeroNum = 0;
            var __zeroText = "";
            this._score += this._rocket.speed;
            __zeroNum = 6 - this._score.toString().split("").length;
            for (var i = 0; i < __zeroNum; i++) {
                __zeroText += "0";
            }
            this._mScoreLabel.setString(__zeroText + this._score + "米");
            var __goldCount = this._goldList.length;
            if (__goldCount > 0) {
                for(var i = 0; i < __goldCount; i++){
                    if(this._goldList[i]){
                        var __gold = this._goldList[i];
                        var __goldBox = __gold.getBoundingBox();
                        var __rocketBox = this._rocket.getBoundingBox();
                        if (cc.rectIntersectsRect(__goldBox, __rocketBox)) {
                            __gold.removeFromParent(!0);
                            this._goldList.splice(i, 1);
                            this.createGoldText(__goldBox);
                        }
                    }
                    
                }
            }
        }
            var __rocketSize = this._rocket.getContentSize();
            var __leaveH = this._rocket.jumpSY + this._rocket.jump - __pos.y;
            var __temp = 2;
            var __dir = __leaveH / 2;
            //__dir > __maxX / 2 ? __maxX / 2 : __dir;
            var __speed = __dir / 2000;
            if (__pos.x >= __maxX - __rocketSize.width && __pos.y > 100) { 
                if(!this._rocket.fantan){
                    this._rocket.fantan = 1;
                    this._rocket.stopAllActions();
                    var __startPos = cc.p(__pos.x - __dir, __leaveH / 2 + __pos.y);
                    this._rocket.moveTo(__speed, __startPos, 1, -100);
                }
                
            } else if (__pos.x <= 0 && __pos.y > 100) {
                if(!this._rocket.fantan){
                    this._rocket.fantan = 1;
                    this._rocket.stopAllActions();
                    var __startPos = cc.p(__pos.x + __dir, __leaveH / 2 + __pos.y);
                    this._rocket.moveTo(__speed, __startPos, 1, 100);
                }
                
            }
        //}
    },
    checkOut: function() {
        
    },
    checkTime: function() {
        if(this._startTimer){
            this._time--;
        }
        if (this._time <= 0) {
            this.win();
            return;
        } else if(this._time < this.TIME){
            var __random = this.random(5);
            if(__random == 1 && this.golds < this._maxGold){
                this.golds++;
                this.createGold();
            }
            if(this._time < 10 && !this._rockethelp){
                var __random = this.random(2);
                if(__random == 1){
                    var __help = this._rockethelp = new cc.Sprite(s_rocketHelp);
                    var __rocketSize = this._rocket.getContentSize();
                    __help.setAnchorPoint(0.5, 0.5);
                    
                    this._rocket.addChild(__help, 1);
                    __help.setPosition(__rocketSize.width / 2 + 20, __rocketSize.height + __help.getContentSize().height - 90);
                }
                
            
            }
        }
        this._mTimeLabel.setString(this._time);
    },
    createGoldText: function(goldBox) {
        var __goldText = new cc.Sprite(s_coin100);
        __goldText.setAnchorPoint(0.5, 0.5);
        __goldText.setPosition(goldBox.x, goldBox.y);
        this.addChild(__goldText, 1);
        var __Pos = cc.p(goldBox.x, goldBox.y + 60);
        var __action = cc.sequence(cc.moveTo(0.6, __Pos), cc.callFunc(function() {
            __goldText.removeFromParent(!0);
        }, __goldText));
        __goldText.runAction(__action);
    },
    createGold: function() {
        var __random = this.random(2), __face = s_gold2;
        if(__random == 1 && this._cash){
            __face = s_cash;
            this._cash--;
        }
        var __gold = new cc.Sprite(__face);
        var __goldtSize = __gold.getContentSize();
        var size = cc.winSize;
        var __tempX = this.random(size.width - __goldtSize.width);
        var __tempY = this.random(size.height - __goldtSize.height - 250) + 100;
        __gold.anchorX = 0;
        __gold.anchorY = 0;
        __gold.x = __tempX;
        __gold.y = __tempY;
        __gold.setOpacity(0);
        this.addChild(__gold, 1);
        __gold.runAction(new cc.FadeIn(1));
        
        this._goldList.push(__gold);
    },
    random: function(value){
        return (0 | (Math.random() * 10000) % value);
    },
    win: function() {
        
        this._rocket.stopAllActions();
        cc.director.pause();
        //$("#Cocos2dGameContainer").hide();
        $("#end2").show();
    },
    gameover: function(){
        
        this._rocket.stopAllActions();
        cc.director.pause();
        //$("#Cocos2dGameContainer").hide();
        $("#end").show();
        //document.getElementById("restart").style.display = "block";
        //document.getElementById("restart").onclick = function(e){
            $(".btnOrange").click(function(){

                //cc.director.runScene(new MyScene());
                cc.director.pause();
                cc.director.resume();
                cc.director.runScene(new MyScene());
                //cc.director.resume();
                $("#end").hide();
            });
    },
    startGame: function() {
        var __self = this;
        this.mListener1 = cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "DEAD",
            callback: function(event){
                var pPattern = event.getUserData();
                __self.gameover();
            }
        });
        cc.eventManager.addListener(this.mListener1, 1);
        this.schedule(this.updateTime);
        this.schedule(this.checkTime, 1);
    }
});