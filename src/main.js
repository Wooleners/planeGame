window.onload = function() {
    var gameScene = {};
    window.game = {};
    cc.game.onStart = function() {
        
        var screenSize = cc.view.getFrameSize(); // 获取浏览器窗口大小
        var designSize = cc.size(640, 1136); // 设定一个默认大小，用于判断是否是高清屏幕
        if (!cc.sys.isNative && screenSize.height <= 480) {
            // 如果不是原生设备并且浏览器窗口高度小于设定值，则使用标准大小资源图片
            designSize = cc.size(640, 960);
        } else { 
        }
        if(screenSize.height > 480 && screenSize.height < 550){
            designSize = cc.size(640, 1008);
        }
        //设置图片资源目录
        cc.loader.resPath = "images";
        // 设置游戏视图按指定大小满屏显示
        cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.SHOW_ALL);
        cc.LoaderScene.preload(g_resources, function() {
            $("#barline").addClass("barline2");
            $("#barImg").addClass("barImg2");

            var l = 75;
            var t = setInterval(function(){
                l++;
                if(l <= 100){
                    $("#loadingC").html(l);
                }else{
                    $("#loading").hide();
                    window.localStorage.setItem("loading", 1);
                    $("#Cocos2dGameContainer").show();
                    clearInterval(t);
                }
                
            }, 1000/75);
            window.MyScene = cc.Scene.extend({
                onEnter: function() {
                    this.scheduleUpdate();
                    this._super();  
                    window.game = {
                            state: null,
                            score: null,    
                            time: null,
                            width: 0,
                            height: 0,
                            chang: 0,
                            pass: 0,    
                            scale: 1,
                            wdthg: 0,
                            back: 0,
                            getcoins: 0,
                            _score: null,
                            result: null,
                            init: function() {
                                this.score = 0;
                                this.width = 640;
                                this.height = 836;
                                this.wdthg = 151;
                                this.scale = 1;
                                this.chang = 0;
                                this.pass = 0;
                                this.back = 151;
                                this._score = null
                            }
                        },
                        //初始化游戏数据
                        window.game.init();
                    size = cc.director.getWinSize();
                    //window.game.scale = size.width / 640;
                    this._gameBgLayer = new GameBgLayer(this);
                    this.addChild(this._gameBgLayer);
                    window.game.GameLayer = this._gameLayer = new GameLayer(this);
                    this.addChild(this._gameLayer);
                }
            });
            cc.director.runScene(new MyScene());
        }, this);


    };
    cc.game.run("gameCanvas");

};