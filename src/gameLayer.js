var GameLayer = cc.Layer.extend({
    //定义常量
    TIME: 20,
    _context: null,
    _progressTime: null, //倒计时bar
    _pause: null, //是否停止点击
    _progressTimeScheduler: null,
    _updateScheduler: null,
    _mScoreLabel: null, //得分对象
    _mTimeLabel: null, //倒计时对象
    _score: null, //得分
    _rocket: null, //火箭对象
    _time: null, //时间
    _gold: null, //金币对象
    _goldText: null, //金币文案
    ctor: function(a) {
        this._super();
        this._context = a;
        this.init();
        this.startGame();

    },
    init: function() {
        this._super();
        
        this._score = 0;
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
        //初始化所有
        //加载成绩对象
        this._mScoreLabel = cc.LabelTTF.create("000000米", "Courier", 32);
        this._mScoreLabel.setAnchorPoint(0.5, 0.5);
        this._mScoreLabel.setPosition(size.width - 100, size.height - 70);
        this._mScoreLabel.setColor(cc.color(255, 102, 0));
        this.addChild(this._mScoreLabel, 1);
        //加载倒计时bar
        var __bar = new cc.Sprite(s_bar);
        var __barSize = __bar.getContentSize();
        __bar.setAnchorPoint(0.5, 0.5);
        __bar.setPosition(size.width / 2, size.height - 120);
        this.addChild(__bar);
        //加载倒计时对象
        this._mTimeLabel = cc.LabelTTF.create(20, "Courier", 60);
        this._mTimeLabel.setAnchorPoint(0.5, 0.5);
        this._mTimeLabel.setPosition(__barSize.width / 2, __barSize.height / 2 - 10);
        this._mTimeLabel.setColor(cc.color(255, 255, 255));
        __bar.addChild(this._mTimeLabel, 1);
        
        // this._progressTime = new cc.ProgressTimer(new cc.Sprite(pg_game_a_png));
        // this._progressTime.type = cc.ProgressTimer.TYPE_BAR;
        // this._progressTime.midPoint = cc.p(0, 1);
        // this._progressTime.barChangeRate = cc.p(1, 0);
        // this._progressTime.percentage = 100;
        
        
        // var top = 101;
        
        // this._progressTime.x = 12;
        // this._progressTime.y = cc.winSize.height - top * window.game.scale;
        // //console.log(this._progressTime.y);
        // this._progressTime.setScale(window.game.scale, window.game.scale);
        // console.log(window.game.scale);
        // this._progressTime.anchorX = 0;
        // this._progressTime.anchorY = 0;
        // this.addChild(this._progressTime);
        // 启动提示计时器
        this.schedule(this.updateTime);
        this.schedule(this.checkOut, 0.1);
        this.schedule(this.checkTime, 1);
        // for (var a = [], b = 0; 3 > b; b++) {
        //     //var c = cc.spriteFrameCache.getSpriteFrame("images/run" + b + ".png");
        //     var c = new cc.SpriteFrame("images/feiting" + b + ".png", cc.rect(0, 0, 640, 196));
        //     a.push(c)
        // }
        // a = new cc.Animation(a, 0.2);
        // this._actionFly4 = cc.animate(a);
        // this.bx.runAction(cc.repeatForever(this._actionFly4));

    },
    updateTime: function() {
        if (!this._rocket.first) {
            var __y1 = BG1.getPositionY();
            var __y2 = BG2.getPositionY();
            var __maxX = cc.winSize.width;
            var __maxY = cc.winSize.height;
            var __pos = this._rocket.getPosition();

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
            //更新得分
            this._score += this._rocket.speed;
            __zeroNum = 6 - this._score.toString().split("").length;
            for (var i = 0; i < __zeroNum; i++) {
                __zeroText += "0";
            }
            this._mScoreLabel.setString(__zeroText + this._score + "米");

            //金币碰撞检测
            if (this._gold) {

                var __goldBox = this._gold.getBoundingBox();
                var __rocketBox = this._rocket.getBoundingBox();
                if (cc.rectIntersectsRect(__goldBox, __rocketBox)) {
                    //发生碰撞事件
                    this._gold.removeFromParent(!0);
                    this._gold = null;
                    this.createGoldText(__goldBox);
                }
            }
        }
    },
    checkOut: function() {
        var __maxX = cc.winSize.width;
        var __maxY = cc.winSize.height;
        var __pos = this._rocket.getPosition();
        var __rocketSize = this._rocket.getContentSize();
        var __leaveH = this._rocket.jumpSY + this._rocket.jump - __pos.y;
        // 按照设定的几率值，随机产生偏移值
        var __temp = 2;
        var __dir = __leaveH / 2;
        //__dir > __maxX / 2 ? __maxX / 2 : __dir;
        var __speed = __dir / 2000;
        if (__pos.x > __maxX - __rocketSize.width) { 
            if(!this._rocket.fantan){
                this._rocket.fantan = 1;
                this._rocket.stopAllActions();
                var __startPos = cc.p(__pos.x - __dir, __leaveH / 2 + __pos.y);
                this._rocket.moveTo(__speed, __startPos, 1, -100);
            }
            
        } else if (__pos.x < 0) {
            if(!this._rocket.fantan){
                this._rocket.fantan = 1;
                this._rocket.stopAllActions();
                var __startPos = cc.p(__pos.x + __dir, __leaveH / 2 + __pos.y);
                this._rocket.moveTo(__speed, __startPos, 1, 100);
            }
            
        }
    },
    checkTime: function() {
        this._time--;
        if (this._time <= 0) {
            this.win();
            return;
        } else if (this._time == 18) {
            this.createGold();
        }
        this._mTimeLabel.setString(this._time);
    },
    createGoldText: function(goldBox) {
        //加载金币文案对象
        var __goldText = cc.LabelTTF.create("+500", "Courier", 40);
        __goldText.setAnchorPoint(0.5, 0.5);
        __goldText.setPosition(goldBox.x, goldBox.y);
        __goldText.setColor(cc.color(255, 255, 255));
        this.addChild(__goldText, 1);
        var __Pos = cc.p(goldBox.x, goldBox.y + 300);
        var __action = cc.sequence(cc.moveTo(0.6, __Pos), cc.callFunc(function() {
            __goldText.removeFromParent(!0);
        }, __goldText));
        __goldText.runAction(__action);
    },
    createGold: function() {
        var __gold = this._gold = new cc.Sprite(s_gold);
        var __goldtSize = __gold.getContentSize();
        var size = cc.winSize;
        // 按照设定的几率值，随机产生偏移值
        var __tempX = (0 | (Math.random() * 10000) % (size.width - __goldtSize.width));
        var __tempY = (0 | (Math.random() * 10000) % (size.height - __goldtSize.height));
        __gold.anchorX = 0;
        __gold.anchorY = 0;
        __gold.x = __tempX;
        __gold.y = __tempY;
        this.addChild(__gold, 1);
    },
    win: function() {
        alert("游戏胜利!");
        this._rocket.stopAllActions();
        cc.director.pause();
    },
    startGame: function() {
    }
});