#define BUILDING_NODE_EXTENSION
#include <node.h>
#include <string.h>
#include "tts.h"


using namespace v8;


Persistent<Function> TTSObject::constructor;

//TTSObject::TTSObject(double value) : value_(value) {
TTSObject::TTSObject(const Arguments& args){
    out_audio_file_[PATH_MAX] = '\x0';    // output audiofile name
    text_file_[PATH_MAX] = '\x0';    // output audiofile name
    text_file_len_        = 0;
    text_buffer_[MAX_TXT_BUFFER] = '\x0';
    server_addr_[256]       = '\x0';
    connect_str_[512]       = '\x0';
    filter_[256]          = '\x0';   // Set filter param
    user_lib_name_[256]        = '\x0';      // Set user library name

    user_lib_set_ = FALSE;
    prompt_         = TRUE;
   synth_mode_       = tsmTradition;  // Synthesize mode
   raw_audio_data_  = FALSE;
   synth_param_[MAX_TTS_PARAM]     =  0 ;
   synth_param_set_[MAX_TTS_PARAM] =  FALSE ;
   tts_inited_       = FALSE;
   instance_     = NULL;
   user_lib_     = NULL;
   user_lib_loaded_  = FALSE;
   asyn_connect_   = FALSE;
   asyn_discon_    = FALSE;

   std::map<int, std::string> option_map; 

   ttscon_mode = FALSE;
   ttscon_mode_value= 0;
   synth_rounds_num_ = 1;


tts_set_synth_param_ = NULL;
tts_load_usr_lib_ = NULL;
tts_uninitialize_ = NULL ;
tts_disconnect_ = NULL;
tts_unload_user_lib_ = NULL;
tts_connect_= NULL;
tts_initialize_ = NULL;
tts_initialize_ex_  = NULL;
tts_synth_text_ex_= NULL;
tts_synth_text_ = NULL;
tts_fetch_next_ = NULL;
tts_set_param_ =NULL;
}



TTSObject::~TTSObject() {
}

void TTSObject::Init(Handle<Object> exports) {
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("TTSObject"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  // Prototype
  tpl->PrototypeTemplate()->Set(String::NewSymbol("plusOne"),
      FunctionTemplate::New(PlusOne)->GetFunction());

tpl->PrototypeTemplate()->Set(String::NewSymbol("synth"),
      FunctionTemplate::New(Synth)->GetFunction());

tpl->PrototypeTemplate()->Set(String::NewSymbol("reload"),
      FunctionTemplate::New(Reload)->GetFunction());

tpl->PrototypeTemplate()->Set(String::NewSymbol("unload"),
      FunctionTemplate::New(Unload)->GetFunction());

  constructor = Persistent<Function>::New(tpl->GetFunction());
  exports->Set(String::NewSymbol("TTSObject"), constructor);
}





Handle<Value> TTSObject::New(const Arguments& args) {
  HandleScope scope;
  if (args.IsConstructCall()) {
    // Invoked as constructor: `new TTSObject(...)`
  //double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
  TTSObject* obj = new TTSObject(args);
    obj->load(args);
    obj->Wrap(args.This());
    return args.This();
  } else {
    // Invoked as plain function `TTSObject(...)`, turn into construct call.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    return scope.Close(constructor->NewInstance(argc, argv));
  }
}




const char* ToCString(const String::Utf8Value& value) {
  return *value ? *value : "<string conversion failed>";
}


Handle<Value> TTSObject::PlusOne(const Arguments& args) {
  HandleScope scope;
  TTSObject* obj = ObjectWrap::Unwrap<TTSObject>(args.This());
  obj->value_ += 1;
  return scope.Close(Number::New(obj->value_));
}
/*
args[0]:configs
args[1]:cb
*/
Handle<Value> TTSObject::Reload(const Arguments& args){
HandleScope scope;
if (args.Length() < 1 || !args[1]->IsFunction() ) {
return scope.Close(Undefined());
}
Local<Function> cb = Local<Function>::Cast(args[1]);
const unsigned argc = 2;

TTSObject* obj = ObjectWrap::Unwrap<TTSObject>(args.This());
if(obj->load(args)<0){
 Local<Value> argv[argc] = {
  Local<String>::New(String::New("false")),
  Local<String>::New(String::New("重新加载发生错误！"))
}; 
  cb->Call(Context::GetCurrent()->Global(), argc, argv);
}else{
   Local<Value> argv[argc] = { 
    Local<String>::New(String::New("true")),
    Local<String>::New(String::New("重新加载成功！")) 
  };
  cb->Call(Context::GetCurrent()->Global(), argc, argv);
}

return scope.Close(Undefined());
}

Handle<Value> TTSObject::Unload(const Arguments& args){
  HandleScope scope;
  if (args.Length() < 1 || !args[0]->IsFunction() ) {
return scope.Close(Undefined());
}
  Local<Function> cb = Local<Function>::Cast(args[0]);
  const unsigned argc = 2;
  TTSObject* obj = ObjectWrap::Unwrap<TTSObject>(args.This());
   obj->pre_quit();
Local<Value> argv[argc] = { 
    Local<Value>::New(String::New("true")) ,
    Local<Value>::New(String::New("卸载服务成功！")) 
  };

cb->Call(Context::GetCurrent()->Global(), argc, argv);
   
  return scope.Close(Undefined()); 
}

/*Handle<value> TTSObject::getState(const Arguments& args){
    HandleScope scope;
     TTSObject* obj = ObjectWrap::Unwrap<TTSObject>(args.This());
    if(!obj->instance_ || !tts_inited_){

    }else{

    }
}*/
Handle<Value> TTSObject::Synth(const Arguments& args) {
    HandleScope scope;
      if (args.Length() < 3 || !args[2]->IsFunction()) {
        //ThrowException(Exception::TypeError(String::New("参数个数不对，【文件名/合成内容】")));
        return scope.Close(Undefined());
      }
    BOOL success=true;
    Local<Function> cb = Local<Function>::Cast(args[2]);
    const unsigned argc = 2;
      TTSData       tts_data;
      TTSRETVAL     ret = TTSERR_OK;
      memset(&tts_data, 0, sizeof(tts_data));

      TTSObject* obj = ObjectWrap::Unwrap<TTSObject>(args.This());


      if (obj->instance_ == NULL){
       ret = obj->connect();
       if(ret<0){
        ret=obj->initialize();
        if(ret<0){
        success=false;
        Local<Value> argv[argc] = { 
        Local<Value>::New(String::New("false")) ,
        Local<Value>::New(String::New("连接TTS服务失败：语音服务器异常！")) 
      };
       cb->Call(Context::GetCurrent()->Global(), argc, argv);
       return scope.Close(Number::New(-1));
     }else{
        ret = obj->connect();
     }
       }
      }

      String::Utf8Value str0(args[0]);
      const char* cstr0 = ToCString(str0);
      strcpy(obj->out_audio_file_,cstr0);

      String::Utf8Value str1(args[1]);
      const char* cstr1 = ToCString(str1);
      strcpy(obj->text_buffer_,cstr1);

      obj->text_file_len_=strlen((char *)obj->text_buffer_);
      tts_data.dwInBufSize = obj->text_file_len_;
      tts_data.szInBuf = obj->text_buffer_;
     
     if(!obj->prompt_){
      unlink(obj->out_audio_file_);
     }
      if(obj->tts_synth_text_ == NULL){
        success=false;
        Local<Value> argv[argc] = { 
        Local<Value>::New(String::New("false")) ,
        Local<Value>::New(String::New("初始化失败！")) 
      };
       cb->Call(Context::GetCurrent()->Global(), argc, argv);
      return scope.Close(Number::New(-1));
      }
      ret = obj->tts_synth_text_(obj->instance_, &tts_data);
        if (ret) 
        {
        success=false;    
          //obj->pre_quit();
        Local<Value> argv[argc] = { 
        Local<Value>::New(String::New("false")) ,
        Local<Value>::New(String::New("合成失败！")) 
      };
        cb->Call(Context::GetCurrent()->Global(), argc, argv);
        return scope.Close(Number::New(-1));
        }

        if (tts_data.dwOutBufSize > 0) 
        {
          obj->CatWavFile(obj->out_audio_file_, (PBYTE)tts_data.pOutBuf, tts_data.dwOutBufSize);
        }

        while(tts_data.dwOutFlags == TTS_FLAG_STILL_HAVE_DATA)
        {
          ret = obj->tts_fetch_next_(obj->instance_, &tts_data);
          if (ret) 
          {    
            //obj->pre_quit();
            return scope.Close(String::New("Error in TTSFetchNext, Error Code 0x"));
          }
          if (tts_data.dwOutBufSize > 0) 
            obj->CatWavFile(obj->out_audio_file_, (PBYTE)tts_data.pOutBuf, tts_data.dwOutBufSize);
        }// End while

      memset(obj->text_buffer_,0,sizeof(obj->text_buffer_)/sizeof(char));

      if(obj->instance_ != NULL){
        ret=obj->disconnect();
      }
      if(success){
      Local<Value> argv1[argc] = { 
        Local<Value>::New(String::New("true")) ,
        Local<Value>::New(String::New("合成成功！")) 
      };
      cb->Call(Context::GetCurrent()->Global(), argc, argv1);

      return scope.Close(Number::New(1));
    }
}


int TTSObject::load(const Arguments& args){
  HandleScope scope;
  TTSRETVAL     ret = TTSERR_OK;
  synth_rounds_num_ = 1; //初始化
  memset( lib_name_, 0, sizeof lib_name_); 
  strcpy( lib_name_, TEXT("libiflytts.so"));
  if(args.Length()>0 && args[0]->IsObject()){
   Local<Object> oo = args[0]->ToObject();

   if(oo->Has(String::New("server"))){
    Local<Value> value=oo->Get(String::New("server"));
    String::Utf8Value str0(value);
    const char* cstr0 = ToCString(str0);
    strcpy(server_addr_,cstr0);
  }else{
    strcpy(server_addr_,"127.0.0.1");
  }
  /*
  输出音频数据的格式。 
  0：WINDOWS PCM(.wav)；1：PCM Raw Data
  */
  if(oo->Has(String::New("format"))){
   Local<Value> value=oo->Get(String::New("format"));
   int a=value->IntegerValue();
   raw_audio_data_ = (BOOL)a;
 }else{
  raw_audio_data_ = (BOOL)0;
}
 /*
  设置合成语速。 
  取值范围是-500～+500，0为原速（缺省），数值大则语速快，对应于0.5～1.5倍线性调整关系。
  */
  
  if(oo->Has(String::New("speed"))){
   Local<Value> value=oo->Get(String::New("speed"));
   int a=value->IntegerValue();
   synth_param_[TTS_PARAM_SPEED] = a;
 }else{
   synth_param_[TTS_PARAM_SPEED] = 0;
 }
 synth_param_set_[TTS_PARAM_SPEED] = TRUE;

 //保留同名文件
 if(oo->Has(String::New("prompt"))){
   Local<Value> value=oo->Get(String::New("prompt"));
   bool a=value->BooleanValue();
   prompt_ = a;
 }else{
   prompt_ = false;
 }

    /*
  设置输出音量。
  有效范围从小到大为：－20～ ＋20 （0为缺省音量）。
  */
  if(oo->Has(String::New("volume"))){
   Local<Value> value=oo->Get(String::New("volume"));
   bool a=value->IntegerValue();
   synth_param_[TTS_PARAM_VOLUME] = a;
 }else{
   synth_param_[TTS_PARAM_VOLUME] = 0;
 }

 
 synth_param_set_[TTS_PARAM_VOLUME] = TRUE;

  /*
  设置输出音调。
  有效范围从小到大为：－500 ～＋500 （0为缺省音调）。
  */
  if(oo->Has(String::New("tone"))){
   Local<Value> value=oo->Get(String::New("tone"));
   bool a=value->IntegerValue();
   synth_param_[TTS_PARAM_PITCH] = a;
 }else{
  synth_param_[TTS_PARAM_PITCH] = 0;
}

synth_param_set_[TTS_PARAM_PITCH] = TRUE;

/*
    数字字符串的读法。 
  0：自动判断(缺省)；1：按数值发音；2：按数字发音；
  3：自动判断处理，如果不确定将按照数值发音。
  */
  if(oo->Has(String::New("digit"))){
   Local<Value> value=oo->Get(String::New("digit"));
   bool a=value->IntegerValue();
   synth_param_[TTS_PARAM_READNUMBER] = a;
 }else{
  synth_param_[TTS_PARAM_READNUMBER] = 2;
}

synth_param_set_[TTS_PARAM_READNUMBER] = TRUE;


}

  /*
  合成模式。
  0：传统的调用方式(缺省)；1：同步回调方式；
  2：异步回调方式。
  */
  synth_mode_ = (ETTSSynthMode)0;     
  ttscon_mode = TRUE;
  ttscon_mode_value = 0;
  /*
  设置中文文本内码类型。 
  1：GB-2312；2：GBK；3：BIG5；4：UNICODE；
  5：GB18030；6：UTF8。
  */
  synth_param_[TTS_PARAM_CODEPAGE] = 6;
  synth_param_set_[TTS_PARAM_CODEPAGE] = TRUE;
  /*
  设置音频数据格式。
  格式对应表参见开发文档的TTSSetParam函数。
  */
  //synth_param_[TTS_PARAM_AUDIODATAFMT] = 0;
  //synth_param_set_[TTS_PARAM_AUDIODATAFMT] = TRUE;
  
  /*
  分句时对回车符的处理。
  0：合成系统自动判断(缺省)；
  1：回车符作为断句标志；2：删除回车符；
  3：回车符被转化为空格。
  */
  synth_param_[TTS_PARAM_ENTERTREAT] = 2;
  synth_param_set_[TTS_PARAM_ENTERTREAT] = TRUE;
  /*
  最大断句长度。
  取值范围从小到大为：16 ～128 （128为缺省最大断句长度）。
  */
  synth_param_[TTS_PARAM_MAXSENLEN] = 128;
  synth_param_set_[TTS_PARAM_MAXSENLEN] = TRUE;
  /*
  标点符号的读法。 
  0：不读出标点符号(缺省)；1：读出标点符号。
  */
  synth_param_[TTS_PARAM_READALLMARKS] = 0;
  synth_param_set_[TTS_PARAM_READALLMARKS] = TRUE;

  /*
  英文文本的读法。 
  0：自动判断处理，如果不确定将按照英文词语拼写处理(缺省)；
  1：所有英文按字母发音；
  2：自动判断处理，如果不确定将按照字母朗读。
  */
  synth_param_[TTS_PARAM_READENGLISH] = 2;
  synth_param_set_[TTS_PARAM_READENGLISH] = TRUE;

    //-------------------
    // Load/Free Library
    //  加载动态库
    //-------------------
  TTSCON_Dll_Handle lib;
  int synth_times = 1;
  void* lib_handle = TTSCON_INVALID_HANDLE;
  load_tts_lib(lib,lib_name_);
 return initialize();   
 // return 0;
}

int TTSObject::initialize(){
    TTSRETVAL     ret = TTSERR_OK;
    //初始化TTS实例
    /*if ((ret = tts_initialize_()) != TTSERR_OK)
    {
    return -2;
    }*/
    if ((ret = tts_initialize_ex_(NULL, NULL)) != TTSERR_OK)
    {
    return -2;
    }
    tts_inited_ = TRUE;    
    return set_synth_param();    
}

int TTSObject::connect(){
    const char *company_name = "四川建设网";// developer information
    const char *user_name = "林勇";
    const char *product_name  = "iFly TTS 合成服务";
    const char *serial_num  = "*****-*****-*****"; // Enter your product serial number here!
    memset(&tts_connect, 0, sizeof(TTSConnectStruct));
    tts_connect.dwSDKVersion = IFLYTTS_SDK_VER;
    strcpy(tts_connect.szCompanyName, company_name);
    strcpy(tts_connect.szUserName, user_name);
    strcpy(tts_connect.szProductName, product_name);
    strcpy(tts_connect.szSerialNumber, serial_num);
    strcpy(tts_connect.szConnectStr, connect_str_);
    strcpy(tts_connect.szServiceUID, filter_);
    strcpy(tts_connect.szTTSServerIP, server_addr_);
    
    if ( !asyn_connect_ ) // synchronized connect   同步连接
    {   
      instance_ = tts_connect_(&tts_connect);
      if (instance_ == NULL)
      {
        pre_quit();
        if (tts_connect.dwErrorCode == TTSERR_INVALIDSN)
        {       
          return -3;
        }
        else
        {       
          return -1;
        }
        
        
      }else{
        return 0;
      }   
     
    }else{
      return -2;
    }
}

int TTSObject::disconnect(){
  if(tts_disconnect_(instance_) != TTSERR_OK){
    return -1;
  }else{
   instance_=NULL;
   return 0; 
  }
}

int TTSObject::unload(){
  return 0;
}


int TTSObject::load_tts_lib( TTSCON_Dll_Handle& lib, const char* lib_name)
{
  void* lib_handle = TTSCON_INVALID_HANDLE;
  lib.open(lib_name,lib_handle);
  lib_handle = lib.get_handle();

  if ( lib_handle == TTSCON_INVALID_HANDLE )
  {   
    //ThrowException(Exception::TypeError(String::New("TTSCON_INVALID_HANDLE")));
    return -1;
  }

  tts_initialize_ = ( Proc_TTSInitialize) lib.get_func_addr(TEXT("TTSInitialize"));
  if ( !tts_initialize_ )
  {   
    //ThrowException(Exception::TypeError(String::New("open TTSInitialize fail.")));
    lib.close(1);
    return -2;
  }

  tts_initialize_ex_ = ( Proc_TTSInitializeEx) lib.get_func_addr(TEXT("TTSInitializeEx"));
  if(!tts_initialize_ex_)
  {
    lib.close(1);
    return -2;
  }

  tts_synth_text_ex_ = ( Proc_TTSSynthTextEx) lib.get_func_addr(TEXT ("TTSSynthTextEx"));
  if ( !tts_synth_text_ex_ )
  {   
    //ThrowException(Exception::TypeError(String::New("open TTSSynthTextEx fail.")));
    lib.close(1);
    return -3;
  }

  tts_synth_text_ = ( Proc_TTSSynthText) lib.get_func_addr( TEXT("TTSSynthText"));
  if ( !tts_synth_text_ )
  { 
    
    //ThrowException(Exception::TypeError(String::New("open TTSSynthText fail..")));
    lib.close(1);
    return -4;
  }

  tts_fetch_next_ = ( Proc_TTSFetchNext) lib.get_func_addr( TEXT("TTSFetchNext"));
  if ( !tts_fetch_next_ )
  {
   // std::cout << TEXT("open TTSFetchNext fail.") << std::endl;  
    lib.close(1);
     //ThrowException(Exception::TypeError(String::New("oopen TTSFetchNext fail.")));
    return -5;
  }

  tts_set_synth_param_ = ( Proc_TTSSetSynthParam) lib.get_func_addr(TEXT("TTSSetSynthParam"));
  if ( !tts_set_synth_param_ )
  {
   // std::cout << TEXT("open TTSSetSynthParam fail.") << std::endl;  
    //ThrowException(Exception::TypeError(String::New("open TTSSetSynthParam fail.")));
    lib.close(1);
    return -6;
  }

   tts_set_param_ = ( Proc_TTSSetParam) lib.get_func_addr(TEXT("TTSSetParam"));
  if ( !tts_set_param_ )
  {
   // std::cout << TEXT("open TTSSetSynthParam fail.") << std::endl;  
    //ThrowException(Exception::TypeError(String::New("open TTSSetSynthParam fail.")));
    lib.close(1);
    return -6;
  }

  tts_load_usr_lib_ = ( Proc_TTSLoadUserLib) lib.get_func_addr(TEXT("TTSLoadUserLib"));
  if ( !tts_load_usr_lib_ )
  {
    //std::cout << TEXT("open TTSLoadUserLib fail.") << std::endl;  
    //ThrowException(Exception::TypeError(String::New("open TTSLoadUserLib fail.")));
    lib.close(1);
    return -7;
  }

  tts_uninitialize_  = ( Proc_TTSUninitialize ) lib.get_func_addr(TEXT("TTSUninitialize"));
  if ( !tts_uninitialize_   )
  {   
   // std::cout << TEXT("open TTSUninitialize fail.") << std::endl; 
    //ThrowException(Exception::TypeError(String::New("open TTSUninitialize fail.")));
    lib.close(1);
    return -8;
  }

  tts_disconnect_ = ( Proc_TTSDisconnect) lib.get_func_addr(TEXT("TTSDisconnect"));
  if ( !tts_disconnect_ )
  { 
    //std::cout << TEXT("open TTSDisconnect fail.") << std::endl; 
    //ThrowException(Exception::TypeError(String::New("open TTSDisconnect fail.")));
    lib.close(1);
    return -9;
  }


  tts_connect_ = ( Proc_TTSConnect) lib.get_func_addr(TEXT("TTSConnect"));
  if ( !tts_connect_ )
  {
    //std::cout << TEXT("open TTSConnect fail.") << std::endl;  
    lib.close(1);
    return -10;
  }

  tts_unload_user_lib_ = ( Proc_TTSUnloadUserLib) lib.get_func_addr(TEXT("TTSUnloadUserLib"));
  if ( !tts_unload_user_lib_ )
  {
    //std::cout << TEXT("open TTSUnloadUserLib fail.") << std::endl;  
    lib.close(1);
    return -11;
  }
//ThrowException(Exception::TypeError(String::New("加载成功")));
  return 0;
}

/** 
 * @brief   pre_quit
 *  
 * Do something before quit the application. 退出应用程序之前做点什么
 *  
 * @author  lygao
 * @date  2005-11-27
 * @return  No return value.
 * @param TTSConnectStruct& tts_connect - [in,out] 
 * @see   
 */

void TTSObject::pre_quit()
{
  if (instance_ )
  {
    if ( user_lib_loaded_ )
    {
      tts_unload_user_lib_(instance_,user_lib_);
      user_lib_ = NULL;
      user_lib_loaded_ = FALSE;
    }
    // Asynchronous disconnect TTS system
    // 异步断开TTS系统
    if ( asyn_discon_ )
    {
      discon_complete_mutex_.creat();
      int ret = tts_disconnect_(instance_);
      if ( ret != TTSERR_OK )
      {
      }
      else
      {

        if ( discon_complete_mutex_.acquire(ASYDISCON_TIME) == -1 )
        {
    
        }
        else
        {
        
        }
      }
      discon_complete_mutex_.remove();
    }
    else// synchronous disconnect TTS system 同步断开TTS系统
    {
      int ret = tts_disconnect_(instance_);
      if ( ret != TTSERR_OK )
      {
      }
      else
      {
      }
    }

    instance_ = NULL;
  }

  //-------------------------
  // Unload TTS from system
  // 从系统中卸载TTS服务
  //-------------------------
  if ( tts_inited_ )
  {
    tts_uninitialize_();    
    tts_inited_ = FALSE;
  }
}


int TTSObject::set_synth_param(void)
{
  TTSRETVAL ret = TTSERR_OK;
  if( synth_param_set_[TTS_PARAM_VPTTREAT] || synth_param_set_[TTS_PARAM_BGSOUND] || user_lib_set_ )
  { 
    // load usr's lib，default is“Custom”
    //Modified by lygao, 2006-2-8 13:54:31
    char pack_name_dft[64] = "Custom";
    char* pack_name = pack_name_dft;
    //Modified end by lygao
    if ( user_lib_set_ )
    {
      pack_name = user_lib_name_;     
    }
    ret = tts_load_usr_lib_(instance_, &user_lib_, 
      (PTTSVOID)pack_name, strlen(pack_name) * sizeof(char));
    if( ret != 0 )
    {
      user_lib_loaded_ = FALSE;
      return TTSERR_FAIL;
    }
    else
    {     
      user_lib_loaded_ = TRUE;
    }
  }



  BOOL is_print = FALSE;

  if ( ttscon_mode ) // If set synthesize mode, print it.
  {     
   
    is_print = TRUE;
  }

//FILE * fp = NULL;
//fp = fopen("tts.log", "a");

  //print parameters which user set

  for( int i = 1; i < MAX_TTS_PARAM; i ++ )
  {
    if ( synth_param_set_[ i ] )
    {
       ret = tts_set_synth_param_( instance_, i, synth_param_[ i ] );
      // fputs(option_map[i], fp);
      // fputs(":", fp);
       //fputs(synth_param_[i], fp);
       // fputs("\r\n", fp);
     
      if ( ret == TTSERR_OK )
      {
        is_print = TRUE;
      }
      else
      {
        return TTSERR_FAIL;
      }
    } 
  }
 // ret=tts_set_param_(instance_,TTS_PARAM_READNUMBER,npram,1);
 // fclose(fp); 
  return TTSERR_OK;
}


TTSRETVAL TTSObject::SynthProcessProc(HTTSINSTANCE instance,
               PTTSData tts_data, TTSINT32 lparam, PTTSVOID user_data)
{
  int ret;

  if (tts_data->dwOutBufSize > 0)
  {
    ret = CatWavFile(out_audio_file_, 
      (unsigned char*)tts_data->pOutBuf, tts_data->dwOutBufSize);
    if (ret != TTSERR_OK)
      return TTSGETERRCODE(ret);
  }

  if (synth_mode_ == tsmCbAsynch)
  {
    if (tts_data->dwOutFlags == TTS_FLAG_DATA_END)
    {
      //---------------------------------------------------------
      // Notify main thread that synthesizing procedure completed
      // 通知主线程 合成完成
      //---------------------------------------------------------
      synth_complete_mutex_.release();
    }
  }

  // You can return TTSERR_CANCEL to stop Synthesizing Procedure
  return tts_data->dwErrorCode; 
}


/** 
 * @brief   ConnectCBProc
 *  
 *  
 *  
 * @author  lygao
 * @date  2005-11-27
 * @return  TTSRETVAL - Return 0 in success, otherwise return error code.
 * @param  HTTSINSTANCE tts_inst  - [in] 
 * @param PTTSConnectStruct connect - [in] 
 * @param TTSINT32 lparam - [in] 
 * @param TTSDWORD user_data  - [in] 
 * @see   
 */
TTSRETVAL TTSObject::ConnectCBProc( HTTSINSTANCE tts_inst, PTTSConnectStruct connect, 
            TTSINT32 lparam, TTSDWORD user_data )
{
  BOOL is_disconnect_cb = (BOOL)lparam;


  if ( is_disconnect_cb)
  {
    // TTSDisconnect Callbacking
    //std::cout << TEXT("ConnectCBProc::Asynchrounous disconnect callback! ")<<std::endl;
    discon_complete_mutex_.release();
  }
  else
  { 
    // TTSConnect Callbacking
   // std::cout << TEXT("ConnectCBProc::Asynchrounous connect callback! ")<<std::endl;
    connect_complete_mutex_.release();
  }

  return TTSERR_OK; 
}


/** 
 * @brief   CatWavFile
 *  
 * Append some audio data to a audiofile
 *  
 * @author  lygao
 * @date  2005-11-27
 * @return  int - Return 0 in success, otherwise return error code.
 * @param const char* wave_file - [in,out] 
 * @param PBYTE buf_new - [in] 
 * @param TTSDWORD buf_new_len  - [in] 
 * @see   
 */
int  TTSObject::CatWavFile(const char* wave_file, PBYTE buf_new, TTSDWORD buf_new_len)
{
  FILE* fp;
  TTSDWORD file_size, data_size, wav_size;

  if ( buf_new_len <= 0 )
  {
    return TTSERR_OK;
  }

  //std::cout << TEXT("*");

  fp = fopen(wave_file, "r+b");
  if ( fp == NULL )
  {
    fp = fopen(wave_file, "wb");
  }

  if ( fp == NULL )
  {
    return TTSERR_WRITEFILE;
  }
  fseek(fp, 0, SEEK_END);
  file_size = ftell(fp);
  if (file_size == 0  || raw_audio_data_ == TRUE)
  {
    fwrite(buf_new, 1, buf_new_len, fp);
  }
  else
  {
    TTSDWORD head_size = 0;
    /*if( synth_param_[TTS_PARAM_AUDIODATAFMT] >= TTS_ADF_PCM8K8B1C &&
      synth_param_[TTS_PARAM_AUDIODATAFMT] <= TTS_ADF_PCM6K16B1C)
    {
      head_size = 44;
    }*/

    // aLaw/uLaw Wav数据
    if(synth_param_[TTS_PARAM_AUDIODATAFMT] >= TTS_ADF_ALAW16K1C &&
      synth_param_[TTS_PARAM_AUDIODATAFMT] <= TTS_ADF_ULAW6K1C)
    {
      head_size = 58;
    }
    else
    {
      head_size = 44;
    }
      
    fwrite(buf_new + head_size, 1, buf_new_len - head_size, fp);
    file_size = file_size + buf_new_len - head_size;
    data_size = file_size - head_size;
    wav_size = file_size - 8;

    fseek(fp, head_size - sizeof(TTSDWORD), SEEK_SET);
    if ( !IsLittleEndian() )
    {
      data_size = TTS_DWORD_LE_BE(data_size);
    }
    fwrite(&data_size, 1, sizeof(TTSDWORD), fp);
    fseek(fp, 4, SEEK_SET);
    if ( !IsLittleEndian() )
    {
      wav_size = TTS_DWORD_LE_BE(wav_size);
    }
    fwrite(&wav_size, 1, sizeof(TTSDWORD), fp);
  }

  fclose(fp);
  fflush(stdout);
  return TTSERR_OK;
}




