(function (window) {
   function Promise (excutor){
      const self = this
      self.status = 'pending'
      self.data = undefined
      self.callbacks = []
      //成功的函数
      function resolve (value){
          //因为状态只能改变一次
          if(self.status != 'pending'){
               return
          }
         self.status = 'resolved'
         self.data = value
         //可能需要执行已保存的待执行的函数
         if(self.callbacks.length > 0){
             setTimeout(()=>{
                self.callbacks.forEach((callbackObj)=>{
                    callbackObj.onResolved(value)
                })
             },0)
           
         }
      }
      //失败的函数
      function reject (reason){
           //因为状态只能改变一次
        if(self.status != 'pending'){
        return
       }
         self.status = 'rejected'
         self.data = reason
         if(self.callbacks.length > 0){
             setTimeout(()=>{
                self.callbacks.forEach((callbackObj)=>{
                    callbackObj.onRejacted(reason)
                })
             },0)
             
         }
      }
      try {
        excutor(resolve, reject)
      } catch (error) { // 一旦执行器执行抛出异常, promise变为失败, 且结果数据为error
        reject(error)
      }
      
   }
   Promise.prototype.then = function (onResolved,onRejacted){
     const self = this
     return  new Promise((resolve,reject)=>{
            function handle (callback){
               
                try {
                    const result=callback(self.data)
                    if(result instanceof Promise){
                       result.then(
                           value=>{resolve(value)},
                           reason=>{reject(reason)}
                         )
                    }else{
                        resolve(result) 
                    }
                  
                } catch (error) {
                    reject(error)
                }
            }
           if(self.status === 'reolved'){
               setTimeout(()=>{
                 handle(onResolved)
               },0)
            }else if(self.status === 'rejected'){
                setTimeout(()=>{
                    handle(onRejacted)
                },0)
            }else{
                this.callbacks.push({
                    onResolved:(value)=>{
                      handle(onResolved)
                },
                    onRejacted:(reason)=>{
                      handle(onRejacted)
                }
            })
          
        }
   })
}
window.Promise = Promise
})(window)