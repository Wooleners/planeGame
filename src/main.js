window.onload = function() {
    var gameScene = {};
    window.game = {};
    cc.game.onStart = function() {
        var designSize = cc.size(640, 1136); // 设定一个默认大小，用于判断是否是高清屏幕
        var screenSize = cc.view.getFrameSize(); // 获取浏览器窗口大小

        
        if (!cc.sys.isNative && screenSize.height <= 480) {
            // 如果不是原生设备并且浏览器窗口高度小于设定值，则使用标准大小资源图片
            designSize = cc.size(640, 960);
        } else { 
        }
        //设置图片资源目录
        cc.loader.resPath = "images";
        // 设置游戏视图按指定大小满屏显示
        cc.view.setDesignResolutionSize(designSize.width, designSize.height, cc.ResolutionPolicy.SHOW_ALL);
        cc.LoaderScene.preload(g_resources, function() {
            //document.getElementById("startgame").style.display = "block";
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