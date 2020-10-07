#include <node.h>
#include <iostream>
using namespace std;

namespace calculate
{

    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Number;
    using v8::Object;
    using v8::Value;

    void Method(const FunctionCallbackInfo<Value> &args)
    {


        Isolate *isolate = args.GetIsolate();
       
        int i;
        
        double x = 100.32462344, y = 200.333456533452;

        for (i = 0; i < 1000000000; i++)
        {
            x += y;
        }

        auto total = Number::New(isolate, x);
        args.GetReturnValue().Set(total);
    }

    void Hello(const FunctionCallbackInfo<Value> &args)
    {
        Isolate *isolate = args.GetIsolate();
     
     
        // auto total = Number::New(isolate, x);
        cout << args[0].As<Number>()->Value() <<endl;
        // args.GetReturnValue().Set(total);
    }

    void Initialize(Local<Object> exports)
    {
        NODE_SET_METHOD(exports, "calc", Method);
        NODE_SET_METHOD(exports, "hola", Hello);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);

} // namespace calculate