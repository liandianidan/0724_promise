(function(window){
   function Promise (excutor){
       const self=this //缓存this
       self.status='pending' //初始状态
       self.data=undefined  //初始值
       self.callbacks=[] //存回调的数组
     function resolve (value){
         if(self.status!='pending'){
             return
         }
       self.status='resolved' //成功改变成功的状态
       self.data=value
       //可能需要去执行已保存的待执行的回调函数
       //回调函数必须是异步执行
       if(self.callbacks.length>0){
           setTimeout(()=>{//
            self.callbacks.forEach((callbackObj)=>{
                callbackObj.onResolved(value)//及时函数和数据都有了，也需要放到回调队列里
            })
           },0)
          
          
       }
     }
     function reject (reason){
        if(self.status!='pending'){
            return
        }
       self.status='rejected'
       self.data=reason
       if(self.callbacks.length>0){
          setTimeout(()=>{
             self.callbacks.forEach((callbackObj)=>{
                 callbackObj.onResolved(reason)
             }) 
          })
       }
     }
     //立即同步执行执行器任务，一旦执行失败，返回error
     try {
        excutor(resolve,reject) 
     } catch (error) {
        reject(error) 
     }
   }

   Promise.prototype.then = function (onResolved, onRejected) {
       //设置参数的默认值
    //    onResolved=typeof onResolved==='function'?onResolved:value=>value //不过onResolved的类型不是函数，就返回数据
    //    onRejected=typeof onRejected==='runction'?onRejected:reason=>{throw(reason)}
       const  self=this
      return new Promise((resolve,reject)=>{

           function handle(callback){
                
                //result 有两种情况。第一种，返回值是promise对象，第二种，返回值不是promise对象
                try {
                    const result=callback(self.data)
                    //判断result是否是Promise实例
                    if(result instanceof Promise){
                        //如果是promise的实例，就then继续判断状态
                        result.then(
                            value => { // 如果result成功了, 返回promise也成功, 值就是接收的value
                                resolve(value)
                            },
                            reason => { // 如果result失败了, 返回promise也失败, 值就是接收的reason
                                reject(reason)
                            }
                            ) 
                    }else{ //如果不是实例就直接调用
                    resolve(result) 
                    }
                } catch (error) {
                    reject(error)
                }
           }
           
            if(self.status==='resolved'){//成功状态
                 setTimeout(()=>{
                   handle(onResolved)
                 },0)
            }else if(self.status==='rejected'){//失败失败状态
                setTimeout(()=>{
                   handle(onRejected)
                },0)
            }else{//如果两个状态都不是，就是pending，就要保存成功和失败的待执行函数
             
                   this.callbacks.push({
                        onResolved:(value)=>{
                            handle(onResolved)
                        },
                        onRejected:(reason)=>{
                            handle(onRejected)
                        }
                    })
                }
            })
        }
   

   /* 
  用来指定失败回调函数的方法
  1、catch 是 Promise原型上的方法
  */
 Promise.prototype.catch=function(onRejected){
     return this.then(null,onRejected)
 }
 /* 
  用来返回一个成功/失败的promise的静态方法
  */
 Promise.resolve = function (value) {
    //因为要返回一个promise的实例所以new一个promise
    return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
          value.then(resolve, reject)
        } else {
          resolve(value)
        }
      })
 }



  /* 
  用来返回一个延迟成功/失败的promise的静态方法
  */
 Promise.resolveDelay = function (value,time) {
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            if(value instanceof Promise){
                    value.then(resolve,reject)
                    }else{
                        resolve(value)
                    }  
          },time)
        
     })
 }
 /* 
  用来返回一个失败的promise的静态方法
  */
 Promise.reject = function (reason) {
    return new Promise((resolve,reject)=>{
        reject(reason)
     })
 }
 /* 
  用来返回一个延迟失败的promise的静态方法
  */
 Promise.rejectDelay = function (reason,time) {
    return new Promise((resolve,reject)=>{
       setTimeout(()=>{
        reject(reason)
       },time)
     })
 }
 /* 
  用来返回一个promise的静态方法
    所有的promises都成功, 返回的promise才成功
    只要有一个失败了, 返回的promise就失败了
  */
 Promise.all=function(promises){
     const length=promises.length 
     const values=new Array(length) //创建一个空数组，让这个空数组的长度等于peomises的长度
     const resolvedConst=0 //定义一个计数器
     return new Promise((resolve,reject)=>{
       
         promises.forEach((p,index)=>{
            Promise.resolve(p).then(
                value=>{
                    resolvedConst++  //每次成功了就加一
                    values[index]=value  //把对应的每一项添加到数组里
                    if(resolvedConst===length){ //判断如果两个的length长度相等，就说明已经全部成功了
                        resolve(values)
                    }
                    
                },
                reason=>{
                    reject(reason)
                }
                )
         })
     })
 }


  /* 
  用来返回一个promise的静态方法
  第一个确定结果的promise来决定返回promise结果
  */
 Promise.race=function(promises){
      return  new Promise((resolve,reject)=>{
        promises.forEach(p=>{
          Promise.resolve(p).then(
              value=>{resolve(value)},
              reason=>{reject(reason)}
          )
        })
      })
 }


window.Promise = Promise
})(window)