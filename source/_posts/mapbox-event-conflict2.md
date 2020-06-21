---
title: 解决mapbox中事件冲突的几种方法
date: 2020-06-21 15:25:19
categories: mapbox
tags:
  - mapbox
  - 前端开发
---

最近在基于mapbox做项目，随着功能越来越多，mapbox上的事件冲突也越来越严重。比如说一个人需要实现在地图上点击一下出现一个弹窗显示当前地点的效果，另外一个人需要实现在地图上点击选中某片区域的功能，最终得到的效果是当用户在地图上点击以后既出现了弹窗又选中了某片区域。

例如下面的代码会导致点击地图后同时在控制台打印两条信息
```javascript
    map.on("load", () => {
          map.on("click",() => {
            console.log("click 1")
          })
          map.on("click",() => {
            console.log("click 2")
          })
      });
```
从下图中可以看出click事件被响应了两次
![信息打印了两次](https://static.huiyuanai.com/lixfio/image/mapbox-event-conflict/pic1.png)




下面是解决这些问题的一些思路，仅供参考。

1. e.preventDefault

e.preventDefault()本身是用来阻止事件发生后的默认行为的。例如下面的代码可以屏蔽掉mapbox的拖拽移动等功能

```javascript
    map.on("load", () => {
          map.on("mousedown", e => {
            e.preventDefault();
          })
      });
```
但是默认情况下这个只会阻止mapbox上的一些默认行为，只在代码里加一个e.preventDefault并不能阻止我们自己代码里的一些冲突。所幸的是，在调用了e.preventDefault()之后，e.defaultPrevented会被修改为true，因此，我们的代码里可以通过判断这个值来避免事件的冲突。下面是示例代码:
```javascript
      map.on("load", () => {
          map.on("click",e => {
            if(e.defaultPrevented){
                return;
            }
            e.preventDefault();
            console.log("click 1")
          })
          map.on("click",e => {
            if(e.defaultPrevented){
                return;
            }
            e.preventDefault();
            console.log("click 2")
          })
      });

```
从下图中可以看出click事件被响应了一次（实际上是两次，但是第二次直接返回了）
![信息只打印了一次](https://static.huiyuanai.com/lixfio/image/mapbox-event-conflict/pic2.png)

2. 故意出错
这个方案不太好，就是故意加一些出错的代码，这样js在执行到出错的代码后就不再往下执行了。
```javascript
      map.on("load", () => {
          map.on("click",e => {
            console.log("click 1")
            console.log(i)
          })
          map.on("click",e => {
            console.log("click 2")
            console.log(i)
          })
      });
```
从下图中可以看出click事件被响应了一次
![代码出错后不再往下执行](https://static.huiyuanai.com/lixfio/image/mapbox-event-conflict/pic3.png)
但是相信这样的代码对于大多数人来说连编译都过不了

3. 重写mapbox的on和off方法
前面的方法1虽然可以避免部分的事件冲突，但是一方面我们的遗留代码比较多，一处一处的修改不太现实，另一方面除了解决冲突外，我们可能也会希望有些监听能够优先被响应（类似于css中的z-index）。
熟悉面向对象的朋友都应该知道子类可以重写父类的方法。因此我们可以设计出一个子类来继承mapboxgl.Map，重写Map的on和off方法，同时也要考虑兼容以前的用法。

由于我的代码水平不高，下面的代码完全仅供参考

```javascript
    class iMap extends mapboxgl.Map {
        constructor(options) {
            super(options);
        }

        off(type, arg1, arg2) {
            let listener = typeof arg1 === "function" ? arg1 : arg2;
            if (this.listenerMap[type]) {
            let index = this.listenerMap[type].findIndex(
                (l) => l.listener === listener
            );
            if (index != -1) {
                this.listenerMap[type].splice(index, 1);
            }
            }
        }

        /**
         *支持两种调用形式
            * on(type, layerId, listener, priority, forceCall)
            * on(type, listener, priority, forceCall)
            * priority为优先级，值越大在调用链中越靠前
            * forceCall为强制调用，如果为true,则即使前面的事件屏蔽了事件的传播，仍然会被调用
            * 由于priority和forceCall为可选属性，因此，新的on接口完全兼容原来的接口
            */

        on(type, arg1, arg2, arg3, arg4) {
            this.listenerMap = this.listenerMap || {};
            let listener = undefined;
            let priority = 0;
            let forceCall = false;
            let layerId;
            if (typeof arg1 === "function") {
                // arg1 为listener  arg2为优先级, arg3为是否强制调用
                if (arg2 && typeof arg2 === "number") {
                    priority = arg2;
                }
                if (arg3 && typeof arg3 === "boolean") {
                    forceCall = arg1;
                }
                listener = arg1;
            } else {
                // arg1 为图层ID，arg2为listener, arg3为优先级，arg4为是否强制调用
                layerId = arg1;
                if (arg3 && typeof arg3 === "number") {
                    priority = arg3;
                }
                if (arg4 && typeof arg4 === "boolean") {
                    forceCall = arg4;
                }
                listener = arg2;
            }

            if (listener) {
            if (this.listenerMap[type] === undefined) {
                //注册事件
                this.listenerMap[type] = [];
                super.on(type, (event) => {
                let eventNotStop = true;
                let sortListeners = this.listenerMap[type].sort(
                    (a, b) => b.priority - a.priority
                );
                let filterLayers;
                if (event.point) {
                    //如果事件包含点事件的话需要进行过滤出哪些图层包含了这些点。如果事件是绑定在图层上的话，需要这个来判断是否需要被调用
                    filterLayers = this._whichLayerContainsGeometry(
                    event.point,
                    sortListeners
                        .map((l) => l.layerId)
                        .filter((item) => item !== undefined)
                    );
                }
                for (let listener of sortListeners) {
                    if (
                    !filterLayers ||
                    !listener.layerId ||
                    filterLayers.findIndex((l) => l === listener.layerId) !== -1
                    ) {
                        if (eventNotStop) {
                            let executeResult = listener.listener(event);
                            eventNotStop =
                            executeResult === undefined ? true : executeResult;
                        } else {
                            //事件已经被终止，只允许forceCall的lisnten被调用
                            if (listener.forceCall) {
                            listener.listener(event);
                            }
                        }
                    }
                    }
                });
            }
            this.listenerMap[type].push({
                    priority: priority,
                    layerId: layerId,
                    forceCall: forceCall,
                    listener: listener,
                });
            }
        }

        _whichLayerContainsGeometry(geometry, layers) {
            let newlayers = [];
            for (let layer of layers) {
                if (this.getLayer(layer)) {
                    newlayers.push(layer);
                }
            }
            let features = this.queryRenderedFeatures(geometry, {
                layers: newlayers,
            });
            let targetLayers = features.map((f) => f.layer.id);
            return targetLayers;
        }
    }

```

使用的话，只需要把原来的new mapboxgl.Map() 换成 new iMap()

```javascript
    mapboxgl.accessToken =
    "<your access token>";
    var map = new iMap({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-74.5, 40],
        zoom: 9, 
    });
```

下面是调用示例
```javascript
    map.on("load", () => {
        map.on("click", (e) => {
            console.log("虽然我排在第一个，但是由于我的优先级低(默认为0)，而且前面的调用返回了false，所以我不会被调用");
        });
        map.on("click", (e) => {
            console.log("虽然前面的调用返回了false，但是我的forceCall被设置为了true，所以仍然会被调用");
        },1,true);
        map.on("click", (e) => {
            console.log("我的优先级排第二，我要阻止事件的继续向下传播");
            return false;
        },7);
        map.on("click", (e) => {
            console.log("虽然我排在最后，但是由于我的优先级最高，会被第一个调用");
        },9);
    });
```

下面是执行结果
![执行结果](https://static.huiyuanai.com/lixfio/image/mapbox-event-conflict/pic4.png)


完整代码请参考[这个地址](https://raw.githubusercontent.com/lixiaofei123/lixiaofei123.github.io/master/2020/06/21/mapbox-event-conflict2/demo)

> 同时基于iMap，我们也可以重写mapbox.marker，来避免两个marker在重叠时点击其中一个marker会导致两个marker都响应点击事件的情况




