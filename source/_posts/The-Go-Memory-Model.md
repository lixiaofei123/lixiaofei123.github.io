---
title: GoLang 内存模型
date: 2019-09-20 15:34:41
tags:  golang学习
---



Golang的内存模型主要解决的是多协程下的对同一个变量的内存可见性的问题。



# Happens Before

在同一个协程中，读和写的行为必须表现的和代码中指定的一致。虽然编译器以及处理器可能会对我们的代码进行重排序从而来加快程序的执行速度，但是这种重排序不会改变代码中定义的行为。但是这种重排序可能会影响多协程下的可见性。例如，在一个协程中执行了 a=1;b=2，另外一个协程可能读取到更新后的b值和更新前的a值。

Happens before定义了Golang程序中读写操作在内存中执行的顺序。如果事件e1 happens before 事件e2，那么可以说事件e2 happens after 事件e2，如果事件e1既没有happens before 事件e2，又没有happens after时间e2之后，那么可以说是e1和e2是并行的。

**在单线程中，*happens-before*的顺序和代码表达的顺序是一致的。**

现在有一个变量v，有一个对变量v的写操作w，和对变量v的读操作r。如果需要让读操作r能(但不一定)观察到写操作w的结果，需要满足下面两个条件。

1. 读操作r不happen before写操作w (有可能是并发发生)
2. 没有另外一个写操作发生在w之后r之前。(还是有可能是并发发生)

如果想要确保读操作r一定能观察到写操作w的结果，则需要满足下面两个条件。

1. 写操作w happen before 读操作r
2. 任何另外一个写操作都 happen before写操作w之前，happen after读操作r之后。



# Synchronization

## 初始化

*如果package p引入了package q，那么package q的init方法的完成happens before package p的任何方法之前*

> *If a package* `p` *imports package* `q`*, the completion of* `q`*'s* `init` *functions happens before the start of any of* `p`*'s.*

**main方法happen after所有的init方法结束之后**

> *The* `go` *statement that starts a new goroutine happens before the goroutine's execution begins.*



## 协程创建





*新启动一个协程happens before这个协程的执行*

> *The* `go` *statement that starts a new goroutine happens before the goroutine's execution begins.*



## 协程的销毁



协程的结束不保证happen before于程序中的任何事件。

> The exit of a goroutine is not guaranteed to happen before any event in the program



例如下面这个例子

```golang
var a string

func hello() {
	go func() { a = "hello" }()
	print(a)
}
```



对a的赋值操作可能发生在任意一个事件点，因此不能确保另外一个协程能到看到赋值后的a的结果



## channel 通信



golang里有一个很重要的思想*不要通过共享内存来通信，而是通过通信来共享内存*.

> Don't communicate by sharing memory; share memory by communicating.

对应channel，也有几条重要的happens-before规则



对channel发送数据happens before于对于此channel相应的接收。

>  A send on a channel happens before the corresponding receive from that channel completes.



例如下面代码

```golang
var c = make(chan int, 10)
var a string

func f() {
	a = "hello, world"
	c <- 0
}

func main() {
	go f()
	<-c
	print(a)
}
```



能够确保输出 "hello world"。　a="hello, world" happens before c <- 0,c <- 0 happens before <-c，<-c happens before print(a)，根据happens-before的传递性，a="hello, world" happens before print(a)。



*关闭channel happens before 接收channel因关闭返回的０值*

> The closing of a channel happens before a receive that returns a zero value because the channel is closed.



*从一个没有缓冲的channel里接收值happens before向这个channel发送值*

> A receive from an unbuffered channel happens before the send on that channel completes.



这个和上面是刚好相反的。区别在于这个是一个没有缓冲的channel，即通过make(chan int)构造的通道。

```golang
var c = make(chan int)
var a string

func f() {
	a = "hello, world"
	<- c
}

func main() {
	go f()
	c <- 0
	print(a)
}
```



*一个容量为c的通过的第k个值的接收happens before与这个通道第k+c个值的发送*

> The* *k**th receive on a channel with capacity* *C* *happens before the* *k**+**C**th send from that channel completes.



例如下面这个例子，可以确保同时只有三个协程在执行w()

```golang
var limit = make(chan int, 3)

func main() {
	for _, w := range work {
		go func(w func()) {
			limit <- 1
			w()
			<-limit
		}(w)
	}
	select{}
}
```



## Locks



*对于sync.Mutex或者sync.RWMutex　变量，如果n < m，那么第n次解锁happens before与第m次加锁*

> *For any* `sync.Mutex` *or* `sync.RWMutex` *variable* `l` *and* *n* *<* *m**, call* *n* *of* `l.Unlock()` *happens before call* *m* *of* `l.Lock()` *returns.*



例如

```golang
var l sync.Mutex
var a string

func f() {
	a = "hello, world"
	l.Unlock()
}

func main() {
	l.Lock()
	go f()
	l.Lock()
	print(a)
}
```



在这个例子中，l.Unlock() happens before 第二次l.Lock()，根据传递性，a = "hello, world"　happens before　print(a)，因此可以确保输出"hello, world"



> *For any call to* `l.RLock` *on a* `sync.RWMutex` *variable* `l`*, there is an* *n* *such that the* `l.RLock` *happens (returns) after call* *n* *to* `l.Unlock` *and the matching* `l.RUnlock` *happens before call* *n**+1 to* `l.Lock`*.*





## Once



golang的sync中提供了一个安全的机制来确保多个协程的初始化方法只执行一次。它就是Once。如果多个协程同时调用了once.Do(f)，函数f()只会被执行一次，对once.Do(f)的调用将会等待f()执行结束后返回。

*once.Do(f)中f()的执行返回happens before任何一个once.Do(f)的调用返回。*

> *A single call of* `f()` *from* `once.Do(f)` *happens (returns) before any call of* `once.Do(f)` *returns.*



例如这个程序

```
var a string
var once sync.Once

func setup() {
	a = "hello, world"
}

func doprint() {
	once.Do(setup)
	print(a)
}

func twoprint() {
	go doprint()
	go doprint()
}
```



# 不正确的同步


在并发情况中，即使读操作r观察到了写操作w的写入的值，也不意味happening after读操作r的能够观察到happened before写操作w的写。

看下面的例子

```golang
var a, b int

func f() {
	a = 1
	b = 2
}

func g() {
	print(b)
	print(a)
}

func main() {
	go f()
	g()
}
```



上面输出的结果有可能是２　0，即使print(b)输出了２，print(a)仍可能输出0。（当然这只是一种可能，这种可能性有可能永远不会发生）



还有一种是双重检查锁的代码。例如下面这段代码。第二个协程有可能只观察到了done=true，但是没有观察到ａ="hello, world"，然后输出一个空字符串。

```golang
var a string
var done bool

func setup() {
	a = "hello, world"
	done = true
}

func doprint() {
	if !done {
		once.Do(setup)
	}
	print(a)
}

func twoprint() {
	go doprint()
	go doprint()
}
```



另外一个不正确的写法是循环等待一个值。不正确的原因和上面差不多，也是第二个协程有可能只观察到了done=true，但是没有观察到ａ="hello, world"，然后输出一个空字符串。另外，main方法也不保证协程setup()会被完成。

```golang
var a string
var done bool

func setup() {
	a = "hello, world"
	done = true
}

func main() {
	go setup()
	for !done {
	}
	print(a)
}
```



