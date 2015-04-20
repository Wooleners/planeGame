var rocket = cc.Sprite.extend({
	ctor: function(filename, rect) {
		// 自定义初始化
		this._super(filename, rect);

	},
	init: function() {
		//常量定义
		var STARTSPEED = 0.4;
		var DOWNSPEED = 0.7;
		var FIRSTHEIGHT = 2000;

		//共有属性
		this.startSpeed = STARTSPEED; //火箭启动速度
		this.downSpeed = DOWNSPEED; //火箭熄火降落速度
		this.starting = 0; //火箭起飞状态
		this.isDown = 0; //火箭飞行状态
		this.speed = 10; //火箭飞行速度
		this.power = false; //用户是否点击给火箭添加燃料
		this.first = 1;
		this.firstJump = FIRSTHEIGHT;
		this.jump = parseInt(cc.winSize.height / 2.5);
		this.jumpSY = 0;
		// 设置触摸的侦听事件，以便让火箭响应触摸操作
		var touchListener = cc.EventListener.create({
			event: cc.EventListener.TOUCH_ONE_BY_ONE, // 单次点击
			swallowTouches: true,
			// 分别调用自定义方法
			onTouchBegan: function(touch, event) {
				var target = event.getCurrentTarget();
				return target.onPatternTouchBegan(touch, event);
			},
			onTouchMoved: function(touch, event) {
				var target = event.getCurrentTarget();
				//target.onPatternTouchMoved(touch, event);
			},
			onTouchEnded: function(touch, event) {
				var target = event.getCurrentTarget();
				target.onPatternTouchEnded(touch, event);
			}
		});

		// 添加到事件管理器中去
		cc.eventManager.addListener(touchListener, this);
	},
	onPatternTouchBegan: function(touch, event) {
		var __target = event.getCurrentTarget();
        var __locationInNode = touch.getLocation();
        var __s = __target.getContentSize();
        var __p = __target.getPosition();
        var __rect = cc.rect(__p.x, __p.y, __s.width, __s.height);
        var __direction = 1;	//0左1右
        var __offsetX = 0;
        if (cc.rectContainsPoint(__rect, __locationInNode)){
        	var __rocket = this;
			if(this.first){
				__rocket.speed  = 40;
				
			}
			// if (__rocket.speed < 30) {
			// 	__rocket.speed += 5;
			// }
			//window.game.GameLayer._progressTime = 0;
			//window.game.GameLayer._time = window.game.GameLayer.SLOWTIME;
			//window.game.GameLayer._pause = 0;
			if (!__rocket.starting) {
				if(__locationInNode.x < __p.x + __s.width / 2){
					__direction = 0;
				}else{
					__direction = 1;
				}
				__offsetX = Math.abs(__p.x + __s.width / 2 - __locationInNode.x);
				__rocket.up(__direction, __offsetX);
			}
        }else{
        	return false;
        }
		
		return true;
	},
	onPatternTouchEnded: function(){
		window.game.GameLayer._pause = 1;
	},
	up: function(direction, offsetX) {
		var __pos = this.getPosition();
		var __jump = this.first ? this.firstJump : this.jump;
		// 按照设定的几率值，随机产生偏移值
        var __temp = (0 | (Math.random() * 10000)%3) + 2;
		var __dir = direction ? -__temp : __temp;
		__dir *= offsetX;
		var __startPos = cc.p(__pos.x + __dir, __pos.y + __jump);
		//this.speed = 5;
		this.starting = 1;
		this.stopAllActions();
		this.jumpSY = __pos.y;
		this.moveTo(this.startSpeed, __startPos, 1, __dir);
		
	},
	down: function(offsetX) {
		var __posX = this.getPositionX(); 
		var __speed;
		if(this.first){
			__speed = 2;
		}else{
			__speed = this.downSpeed;
		}
		if(this.first){
			offsetX = 0;
		}
		var __startPos = cc.p(__posX + offsetX, -100);
		
		this.isDown = 1;
		this.first = 0;
		//this.stopAllActions();
		this.moveTo(__speed, __startPos, 0);
	},
	// 移动火箭位置
	moveTo: function(duration, position, fly, offsetX) {
		var __self = this;
		if (fly) {
			var __action = cc.sequence(cc.moveTo(duration, position), cc.callFunc(function() {
				__self.flying = 1;
				__self.isDown = 0;
				console.log(1);
				this.starting = 0;
				this.down(offsetX);
				
			}, this));
		} else {

			var __move;
			if(this.first){
				__move = cc.moveTo(duration, position);
			}else{
				__move = cc.moveTo(duration, position).easing(cc.easeIn(2));
			}
			
			var __action = cc.sequence(__move, cc.callFunc(function() {
				//this.starting = 0;
				//__self.isDown = 0;
				this.dead();
				console.log(2);
			}, this));
		}

		this.runAction(__action);

	},
	dead: function(){
		alert("游戏结束得分:" + window.game.GameLayer._score);
		this.stopAllActions();
		cc.director.pause();
		
	}

});