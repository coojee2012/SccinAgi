#include <node.h>
#include <v8.h>

using namespace v8;

Handle<Value> Method(const Arguments& args) {
  HandleScope scope;
  return scope.Close(String::New("world"));
}
Handle<Value> Max(const Arguments& args) {
  HandleScope scope;
    if (args.Length() < 2) {
    ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
    return scope.Close(Undefined());
  }

  if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
    ThrowException(Exception::TypeError(String::New("Wrong arguments")));
    return scope.Close(Undefined());
  }
}

void init(Handle<Object> target) {
  NODE_SET_METHOD(target, "hello", Method);
  NODE_SET_METHOD(target, "max", Max);
}

NODE_MODULE(binding, init);
