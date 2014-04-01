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
tts_synth_text_ex_= NULL;
tts_synth_text_ = NULL;
tts_fetch_next_ = NULL;
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

Handle<Value> TTSObject::Synth(const Arguments& args) {
  HandleScope scope;
  if (args.Length() < 3 || !args[2]->IsFunction()) {
    //ThrowException(Exception::TypeError(String::New("参数个数不对，【文件名/合成内容】")));
    return scope.Close(Undefined());
  }
Local<Function> cb = Local<Function>::Cast(args[2]);
const unsigned argc = 2;
  TTSData       tts_data;
  TTSRETVAL     ret = TTSERR_OK;
  memset(&tts_data, 0, sizeof(tts_data));

  TTSObject* obj = ObjectWrap::Unwrap<TTSObject>(args.This());


  if (obj->instance_ == NULL){
    Local<Value> argv[argc] = { 
    Local<Value>::New(String::New("false")) ,
    Local<Value>::New(String::New("合成实例为空！")) 
  };
cb->Call(Context::GetCurrent()->Global(), argc, argv);
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
    Local<Value> argv[argc] = { 
    Local<Value>::New(String::New("false")) ,
    Local<Value>::New(String::New("初始化失败！")) 
  };
cb->Call(Context::GetCurrent()->Global(), argc, argv);
       //return scope.Close(String::New("初始化失败！"));
  }
  ret = obj->tts_synth_text_(obj->instance_, &tts_data);
    if (ret) 
    {    
      //obj->pre_quit();
      Local<Value> argv[argc] = { 
    Local<Value>::New(String::New("false")) ,
    Local<Value>::New(String::New("合成失败！")) 
  };
cb->Call(Context::GetCurrent()->Global(), argc, argv);
     // return scope.Close(Number::New(ret));
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

  Local<Value> argv1[argc] = { 
    Local<Value>::New(String::New("true")) ,
    Local<Value>::New(String::New("合成成功！")) 
  };
cb->Call(Context::GetCurrent()->Global(), argc, argv1);

  return scope.Close(Number::New(1));
}


int TTSObject::load(const Arguments& args){
  TTSData       tts_data;
  TTSRETVAL     ret = TTSERR_OK;
  synth_rounds_num_ = 1; //初始化
  memset( lib_name_, 0, sizeof lib_name_); 
  strcpy( lib_name_, TEXT("libiflytts.so"));

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
  设置合成语速。 
  取值范围是-500～+500，0为原速（缺省），数值大则语速快，对应于0.5～1.5倍线性调整关系。
  */
  synth_param_[TTS_PARAM_SPEED] = 0;
  synth_param_set_[TTS_PARAM_SPEED] = TRUE;
  /*
  设置输出音量。
  有效范围从小到大为：－20～ ＋20 （0为缺省音量）。
  */
  synth_param_[TTS_PARAM_VOLUME] = 0;
  synth_param_set_[TTS_PARAM_VOLUME] = TRUE;

  /*
  设置输出音调。
  有效范围从小到大为：－500 ～＋500 （0为缺省音调）。
  */
  synth_param_[TTS_PARAM_PITCH] = 0;
  synth_param_set_[TTS_PARAM_PITCH] = TRUE;

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
  数字字符串的读法。 
0：自动判断(缺省)；1：按数值发音；2：按数字发音；
3：自动判断处理，如果不确定将按照数值发音。
*/
synth_param_[TTS_PARAM_READNUMBER] = 3;
synth_param_set_[TTS_PARAM_READNUMBER] = TRUE;

/*
英文文本的读法。 
0：自动判断处理，如果不确定将按照英文词语拼写处理(缺省)；
1：所有英文按字母发音；
2：自动判断处理，如果不确定将按照字母朗读。
*/
synth_param_[TTS_PARAM_READENGLISH] = 2;
synth_param_set_[TTS_PARAM_READENGLISH] = TRUE;

/*
输出音频数据的格式。 
0：WINDOWS PCM(.wav)；1：PCM Raw Data
*/
raw_audio_data_ = (BOOL)0;

//覆盖同名文件
prompt_=false;

  strcpy(server_addr_,"192.168.7.144");
    //-------------------
    // Load/Free Library
    //  加载动态库
    //-------------------
    TTSCON_Dll_Handle lib;
    int synth_times = 1;
    void* lib_handle = TTSCON_INVALID_HANDLE;
    load_tts_lib(lib,lib_name_);

  //初始化TTS实例
  if ((ret = tts_initialize_()) != TTSERR_OK)
  {
  return -2;
  }
  tts_inited_ = TRUE;


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
        
        
      }   
     
    }
   
    ret = set_synth_param();
    return 0;
}

int TTSObject::unload(){
  return 0;
}

int TTSObject::parse_cmd_line(const Arguments& args)
{
  // exclude the parameters that ttscon not support
  std::set<std::string> param_name_set;
  //  map name of parameter to the location of parameter in <param_list>
  std::map<std::string, int> param_pos_map;
  // check 
  if ( args.Length() < 2 )
  {
    //print_usage();
    //return Number::New(TTSERR_INVALIDPARA);
    return TTSERR_INVALIDPARA;
  }

  // init map and set
  for ( int j = 0; j <sizeof(param_list)/sizeof(PARAMLIST); j++ )
  {
    param_name_set.insert( param_list[j].name );
    param_pos_map.insert( std::map<std::string, int>::value_type
      (param_list[j].name,j));
  }

  // format command line
  // 格式化命令行
  std::vector<std::string> param_vec;

  fmt_cmd_line(args,param_vec);

  std::vector<std::string>::iterator param_iter;
  for( param_iter= param_vec.begin()+1; param_iter!=param_vec.end(); param_iter++)
  {     
    if ((*param_iter).find("-",0,1))
    {
      break;
    }
    else
    { 
      // parameters that ttscon not support
      if ( param_name_set.count(*param_iter) == 0 )
      {
        //std::cout << TEXT("options ") << *param_iter;
        //std::cout << TEXT (" not support,please check it.") << std::endl;
        //return Number::New(TTSERR_INVALIDPARA);
        return TTSERR_INVALIDPARA;
      }

      int numeric_val = 0; // to store numerical value of parameter   
      char non_numeric_val[512] = {0};//to store non-numerical value of parameter

      char param_value_tmp[512];
      memset( param_value_tmp, 0, sizeof param_value_tmp);
      if ((param_iter+1) != param_vec.end() )
      {
        strcpy(param_value_tmp,(*(param_iter+1)).c_str());
      }
      else
      {
        if (param_list[param_pos_map[*param_iter]].value != VALUE_VACANT)
        {
          //std::cout << TEXT("Error:\"") << *param_iter;
          //std::cout << TEXT("\" value missing") << std::endl;
         //return Number::New(-1);
          return -1;
        }       
      }

      // parameter has value
      if ( param_list[param_pos_map[*param_iter]].value != VALUE_VACANT )
      { 
        // missing value
        if ( ( *(param_value_tmp+1)< '0' || *(param_value_tmp+1) > '9') 
          &&  *param_value_tmp == '-')
        {
          //std::cout << TEXT("Error:\"") << *param_iter;
          //std::cout << TEXT("\" value missing") << std::endl;
          //return Number::New(TTSERR_INVALIDPARA);
          return TTSERR_INVALIDPARA;
        }
        else
        {
          // type of value is numeric
          if( param_list[param_pos_map[*param_iter]].value == VALUE_NUMERIC )
          {           
            char* end = param_value_tmp;
            numeric_val = strtoul(end, &end, 10);
            if ( errno == ERANGE                             || 
              (numeric_val == 0 && end == param_value_tmp) ||
              *end != '\0')
            { 
              //std::cout << TEXT("Error: \"") << *param_iter;
              //std::cout << TEXT("\" value is illegal.") << std::endl;
              //return Number::New(TTSERR_INVALIDPARA);
              return TTSERR_INVALIDPARA;
            }
            end = NULL;           
          }
          else //type of value is not numeric
          {
            memset( non_numeric_val, 0, sizeof non_numeric_val );
            strcpy( non_numeric_val, param_value_tmp);
          }
        }
      } 

      switch( param_list[param_pos_map[*param_iter]].type )
      {
      case PARAM_MODE: //-m -mode
        if ( numeric_val < 0 || numeric_val > 2 ) 
        {       
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0-2]") <<std::endl;
          //return Number::New(TTSERR_INVALIDPARA);
          return TTSERR_INVALIDPARA;
        }
       synth_mode_ = (ETTSSynthMode)numeric_val;     
        ttscon_mode = TRUE;
       ttscon_mode_value = numeric_val;
        break;

      case PARAM_VID://-i -vid
        if ( numeric_val < 0 ) 
        {         
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[>=0]") <<std::endl;
          //return Number::New(TTSERR_INVALIDPARA);
          return TTSERR_INVALIDPARA;
        }
      synth_param_[TTS_PARAM_VID] = numeric_val;
      synth_param_set_[TTS_PARAM_VID] = TRUE;
      option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_VID, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_CODEPAGE://-c -cp -codepage
                //Modified by lygao, 2006-2-10 9:53:33
        //增加了TTS_CP_UTF8 
        if ( numeric_val < 1 || numeric_val > 6 ) 
        {       
         // std::cout << TEXT("options ") << *param_iter;
        //std::cout << TEXT(" error! valid value:[1-6]") <<std::endl;
         // return Number::New(TTSERR_INVALIDPARA);
          return TTSERR_INVALIDPARA;
        }
                //Modified end by lygao
        synth_param_[TTS_PARAM_CODEPAGE] = numeric_val;
        synth_param_set_[TTS_PARAM_CODEPAGE] = TRUE;
        option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_CODEPAGE, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_AUDIOFMT://-f -adf -audiofmt
        if ( numeric_val < 0 || numeric_val > 22 ) 
        {         
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0-22]") <<std::endl;
          //return Number::New(TTSERR_INVALIDPARA);
          return TTSERR_INVALIDPARA;
        }
        synth_param_[TTS_PARAM_AUDIODATAFMT] = numeric_val;
        synth_param_set_[TTS_PARAM_AUDIODATAFMT] = TRUE;
        option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_AUDIODATAFMT, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_SPEED://-d -speed
        if ( numeric_val < -500 || numeric_val > 500 ) 
        {         
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[-500-500]") <<std::endl;
          //return Number::New(TTSERR_INVALIDPARA);
         return TTSERR_INVALIDPARA;
        }
      synth_param_[TTS_PARAM_SPEED] = numeric_val;
      synth_param_set_[TTS_PARAM_SPEED] = TRUE;
      option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_SPEED, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_VOLUMN://-v -volumn
        if ( numeric_val < -20 || numeric_val > 20 ) 
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[-20-20]") <<std::endl;  
          //return Number::New(TTSERR_INVALIDPARA);        
          return TTSERR_INVALIDPARA;
        }
       synth_param_[TTS_PARAM_VOLUME] = numeric_val;
       synth_param_set_[TTS_PARAM_VOLUME] = TRUE;
       option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_VOLUME, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_PITCH://-p -pitch
        if ( numeric_val < -500 || numeric_val > 500 ) 
        {         
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[-500-500]") <<std::endl;
         //return Number::New(TTSERR_INVALIDPARA);
          return TTSERR_INVALIDPARA;
        }
       synth_param_[TTS_PARAM_PITCH] = numeric_val;
       synth_param_set_[TTS_PARAM_PITCH] = TRUE;
       option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_PITCH, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_ENTER://-b -enter
        if ( numeric_val < 0 || numeric_val > 3 ) 
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0-3]") <<std::endl; 
          //return Number::New(TTSERR_INVALIDPARA);        
          return TTSERR_INVALIDPARA;
        }
       synth_param_[TTS_PARAM_ENTERTREAT] = numeric_val;
       synth_param_set_[TTS_PARAM_ENTERTREAT] = TRUE;
       option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_ENTERTREAT, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_LENGTH://-l -len -length
        if ( numeric_val < 16 || numeric_val > 256 ) 
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[16-256]") <<std::endl;     
          //return Number::New(TTSERR_INVALIDPARA); 
          return TTSERR_INVALIDPARA;
        }
       synth_param_[TTS_PARAM_MAXSENLEN] = numeric_val;
        synth_param_set_[TTS_PARAM_MAXSENLEN] = TRUE;
        option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_MAXSENLEN, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_MARKS://-k -marks
        if ( numeric_val < 0 || numeric_val > 1 ) 
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0-1]") <<std::endl;  
         // return Number::New(TTSERR_INVALIDPARA);     
          return TTSERR_INVALIDPARA;
        }
        synth_param_[TTS_PARAM_READALLMARKS] = numeric_val;
        synth_param_set_[TTS_PARAM_READALLMARKS] = TRUE;
        option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_READALLMARKS, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_NUMBER://-n -number
        if ( numeric_val < 0 || numeric_val > 3 ) 
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0-3]") <<std::endl;   
          //return Number::New(TTSERR_INVALIDPARA);      
          return TTSERR_INVALIDPARA;
        }
        synth_param_[TTS_PARAM_READNUMBER] = numeric_val;
        synth_param_set_[TTS_PARAM_READNUMBER] = TRUE;
        option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_READNUMBER, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_ENGLISH://-e -english
        if ( numeric_val < 0 || numeric_val > 2 ) 
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0-2]") <<std::endl;  
          //return Number::New(TTSERR_INVALIDPARA);   
          return TTSERR_INVALIDPARA;
        }
        synth_param_[TTS_PARAM_READENGLISH] = numeric_val;
        synth_param_set_[TTS_PARAM_READENGLISH] = TRUE;
        option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_READENGLISH, param_list[param_pos_map[*param_iter]].tip));
        break;
      case PARAM_BGS://-s -bgs
        if ( numeric_val < 0 ) 
        {         
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[>=0]") <<std::endl;
         // return Number::New(TTSERR_INVALIDPARA);
          return TTSERR_INVALIDPARA;
        }
        synth_param_[TTS_PARAM_BGSOUND] = numeric_val;
        synth_param_set_[TTS_PARAM_BGSOUND] = TRUE;
        option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_BGSOUND, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_VPT://-u -vpt
        if ( numeric_val < 0 || numeric_val > 1 ) 
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0 or 1]") <<std::endl;  
          //return Number::New(TTSERR_INVALIDPARA);    
          return TTSERR_INVALIDPARA;
        }
        synth_param_[TTS_PARAM_VPTTREAT] = numeric_val;
        synth_param_set_[TTS_PARAM_VPTTREAT] = TRUE;
        option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_VPTTREAT, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_RAW:// -o -raw
        if ( numeric_val < 0 || numeric_val > 1 ) 
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0-1]") <<std::endl;  
          //return Number::New(TTSERR_INVALIDPARA);       
         return TTSERR_INVALIDPARA;
        }
        raw_audio_data_ = (BOOL)numeric_val;
        break;

      case PARAM_IP://-r -ip
        memset(server_addr_, 0, sizeof server_addr_ );
        strcpy(server_addr_,non_numeric_val);
        break;

      case PARAM_Y://-y
        prompt_ = FALSE;
        param_iter --;
        break;

      case PARAM_LIBRARY:// -lib -library
        memset( lib_name_,0,sizeof lib_name_ );
        strcpy( lib_name_, non_numeric_val );
        break;

      case PARAM_ROUNDS://-rounds
        if ( numeric_val < 1 ) 
        {         
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[>=1]") <<std::endl;
          //return Number::New(TTSERR_INVALIDPARA);
         return TTSERR_INVALIDPARA;
        }
        synth_rounds_num_ = numeric_val;
        break;

      case PARAM_ASYNCONN://-asynconn
       asyn_connect_ = TRUE;
        param_iter --;
        break;

      case PARAM_ASYNDISCON://-asyndiscon
        asyn_discon_ = TRUE;
        param_iter --;
        break;

      case PARAM_FILTER://-filter
        memset( filter_, 0, sizeof filter_ );
        strcpy( filter_, non_numeric_val);
        break;

      case PARAM_AHF://-ahf
        if ( numeric_val < 0 || numeric_val > 2 ) 
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0-2]") <<std::endl;     
          //return Number::New(TTSERR_INVALIDPARA);    
          return TTSERR_INVALIDPARA;
        }
      synth_param_[TTS_PARAM_AUDIOHEADFMT] = numeric_val;
      synth_param_set_[TTS_PARAM_AUDIOHEADFMT] = TRUE;
      option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_AUDIOHEADFMT, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_CONNSTR://-connstr 
        memset( connect_str_, 0, sizeof connect_str_ );
        strcpy(connect_str_, non_numeric_val);
        break;

      case PARAM_USRLIB://-usrlib
        memset( user_lib_name_, 0, sizeof user_lib_name_ );
        strcpy( user_lib_name_, non_numeric_val);
        user_lib_set_ = TRUE;
        break;
      case PARAM_BYTEORDER://byteorder
        if( numeric_val < 0 || numeric_val > 2 )
        {
          //std::cout << TEXT("options ") << *param_iter;
          //std::cout << TEXT(" error! valid value:[0-2]") <<std::endl;         
        }
      synth_param_[TTS_PARAM_BYTEORDER] = numeric_val;
      synth_param_set_[TTS_PARAM_BYTEORDER] = TRUE;
      option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_BYTEORDER, param_list[param_pos_map[*param_iter]].tip));
        break;
      default:
        break;

      }
      param_iter++;
    }
  }

  // Read Out Audio file
  if ( param_iter < param_vec.end() )
    strcpy(out_audio_file_, (*param_iter).c_str() );
  else
  { 
    //std::cout << TEXT ( "please input audio file name!") << std::endl;

    //std::cin >> out_audio_file_;
  }

  param_iter ++;

  if ( param_iter < param_vec.end() )
    strcpy(text_file_, (*param_iter).c_str());

  //return Number::New(TTSERR_OK);

  return TTSERR_OK;
}


void TTSObject::fmt_cmd_line(const Arguments& args,std::vector<std::string>& param_vec)
{
  /*HandleScope scope;
  TTSObject* obj = ObjectWrap::Unwrap<TTSObject>(args.This());*/

  bool joint = false; 
  String::Utf8Value str0(args[0]);
  const char* cstr0 = ToCString(str0);
  param_vec.push_back(cstr0);
  for ( int i = 1; i < args.Length(); i++ )
  {
    joint = false;
    String::Utf8Value str(args[i]);
    const char* cstr =  ToCString(str);
    if ( *cstr != '-')
    {
      param_vec.push_back(cstr);
    }
    else
    {
      int max_len = 0;
      std::string param_value_tmp = cstr;
      std::string param_name_tmp;
      for ( int j = 0; j < sizeof(param_list)/sizeof(PARAMLIST); j++ )
      {       
        int len = strlen(param_list[j].name);       
        if ( !strcmp(param_value_tmp.c_str(),param_list[j].name))
        {
          joint = false;  
          break;
        }
        else if( !param_value_tmp.find(param_list[j].name, 0, len ))
        {         
          if (  len > max_len ) 
          {
            max_len = len;

            if ( param_list[j].value == VALUE_NUMERIC  &&
              ( param_value_tmp[len] < '0' || param_value_tmp[len] >'9') )
            {             
              joint = false;            
            }
            else
            {             
              param_name_tmp = param_list[j].name;
              joint = true;
            }
          }
        }
      }// end for

      if ( joint == true )
      { 
        param_value_tmp.erase(0,max_len);
        param_vec.push_back(param_name_tmp);
        param_vec.push_back(param_value_tmp);
      }
      else
      {
        param_vec.push_back(param_value_tmp);
      }
    }
  }
}



/** 
 * @brief   load_tts_lib
 *  
 * Open Library and Get the address of the exported function 
 *  
 * @author  lygao
 * @date  2005-11-27
 * @return  int - Return 0 in success, otherwise return error code.
 * @param  TTSCON_Dll_Handle& lib - [in,out] 
 * @param const char* lib_name  - [in] 
 * @see   
 */



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

  //print parameters which user set
  for( int i = 1; i < MAX_TTS_PARAM; i ++ )
  {
    if ( synth_param_set_[ i ] )
    {
      ret = tts_set_synth_param_( instance_, i, synth_param_[ i ] );
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




