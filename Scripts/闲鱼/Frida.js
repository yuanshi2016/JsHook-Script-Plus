function startActvityUrl(activityToStart, url) {
    Java.perform(function () {
        var Intent = Java.use('android.content.Intent');
        var contextWrapper = Java.use('android.content.ContextWrapper');
        var intent = Intent.$new();
        var Uri = Java.use('android.net.Uri');
        var uri = Uri.parse(url);
        intent.setClassName("com.taobao.taobao", activityToStart);
        intent.setAction("android.intent.action.VIEW");
        intent.setData(uri); // 添加参数到Intent
        // 获取当前应用的Context对象
        var currentApplication = Java.use("android.app.ActivityThread").currentApplication();
        var context = currentApplication.getApplicationContext();
        // 设置FLAG_ACTIVITY_NEW_TASK标志
        intent.setFlags(0x10000000);
        // 启动Activity

        context.startActivity(intent);
    });
}
function log(str) {
    console.log(str);
};
function dump_map(map) {
    Java.perform(function () {
        var keyset = map.keySet();
        var it = keyset.iterator();
        while (it.hasNext()) {
            var keystr = it.next().toString();
            var valuestr = map.get(keystr);
            console.log(keystr, valuestr)
        }
    })
}
function traceClass(targetClass) {
    Java.perform(function () {
        //Java.use是新建一个对象哈，大家还记得么？
        var hook = Java.use(targetClass);
        //利用反射的方式，拿到当前类的所有方法
        var methods = hook.class.getDeclaredMethods();
        //建完对象之后记得将对象释放掉哈
        hook.$dispose;
        //将方法名保存到数组中
        var parsedMethods = [];
        methods.forEach(function (method) {
            console.log(method)
            parsedMethods.push(method.toString().replace(targetClass + ".", "TOKEN").match(/\sTOKEN(.*)\(/)[1]);
        });
        // //去掉一些重复的值
        // var targets = uniqBy(parsedMethods, JSON.stringify);
        // //对数组中所有的方法进行hook，traceMethod也就是第一小节的内容
        // targets.forEach(function (targetMethod) {
        //     traceMethod(targetClass + "." + targetMethod);
        // });
    })
}
// 字节转utf-8
function bytesToUTF8(bytes) {
    let result = '';
    let codepoint;
    for (let i = 0; i < bytes.length;) {
        if ((bytes[i] & 0xf8) === 0xf0) {
            codepoint = ((bytes[i] & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f);
            result += String.fromCodePoint(codepoint);
            i += 4;
        } else if ((bytes[i] & 0xf0) === 0xe0) {
            codepoint = ((bytes[i] & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f);
            result += String.fromCodePoint(codepoint);
            i += 3;
        } else if ((bytes[i] & 0xe0) === 0xc0) {
            codepoint = ((bytes[i] & 0x1f) << 6) | (bytes[i + 1] & 0x3f);
            result += String.fromCodePoint(codepoint);
            i += 2;
        } else {
            result += String.fromCharCode(bytes[i]);
            i++;
        }
    }
    return result;
}

Java.perform(function () {
    var MainActivity = Java.use("com.taobao.idlefish.maincontainer.activity.MainActivity");
    var SwitchConfig = Java.use('mtopsdk.mtop.global.SwitchConfig');
    SwitchConfig.isGlobalSpdySslSwitchOpen.overload().implementation = function () {
        return false;
    }
    SwitchConfig.isGlobalSpdySwitchOpen.overload().implementation = function () {
        return false;
    }
    //提示网络连接失败
    let ExceptionCheck = Java.use("com.taobao.android.remoteobject.easy.ExceptionCheck");
    ExceptionCheck["mtopExceptionCheck"].implementation = function (exc) {
        console.log(`ExceptionCheck.mtopExceptionCheck is called: exc=${exc}`);
        let result = this["mtopExceptionCheck"](exc);
        console.log(`ExceptionCheck.mtopExceptionCheck result=${result}`);
        return result;
    };
    // mtop.taobao.idle.awesome.detail.unit 闲鱼宝贝详情
    let MtopRemoteCallback = Java.use("com.taobao.android.remoteobject.mtop.MtopRemoteCallback");
    MtopRemoteCallback["onJsonReturn"].overload('com.taobao.android.remoteobject.core.RemoteContext', 'java.util.Map', 'com.taobao.android.remoteobject.mtop.MtopBaseReturn').implementation = function (remoteContext, map, mtopBaseReturn) {
        try {
            // console.log(mtopBaseReturn.getApi())
            switch (mtopBaseReturn.getApi()) {
                case "mtop.taobao.idle.awesome.detail.unit":
                    let json_ = JSON.parse(mtopBaseReturn.getData().toString())
                    json_.flowData.body.sections[0].components.forEach((item, index) => {
                        if (item.data.editTimeStr) {
                            var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();
                            Java.scheduleOnMainThread(function () {
                                var toast = Java.use("android.widget.Toast");
                                toast.makeText(Java.use("android.app.ActivityThread").currentApplication().getApplicationContext(), Java.use("java.lang.String").$new(`发布时间:${item.data.editTimeStr}`), 1).show();
                            });
                            // console.log("发布时间:" + item.data.editTimeStr);
                        }
                    });
                    break;
            }
        } catch (error) {
            console.log("运行失败:" + error)
        }
        this["onJsonReturn"](remoteContext, map, mtopBaseReturn);
    };

});