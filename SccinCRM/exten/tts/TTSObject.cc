#define BUILDING_NODE_EXTENSION
#include <node.h>
#include <string.h>
#include "tts.h"


using namespace v8;





Persistent<Function> TTSObject::constructor;

TTSObject::TTSObject(double value) : value_(value) {
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

tpl->PrototypeTemplate()->Set(String::NewSymbol("plusOne2"),
      FunctionTemplate::New(PlusOne2)->GetFunction());

  constructor = Persistent<Function>::New(tpl->GetFunction());
  exports->Set(String::NewSymbol("TTSObject"), constructor);
}

Handle<Value> TTSObject::New(const Arguments& args) {
  HandleScope scope;

  if (args.IsConstructCall()) {
    // Invoked as constructor: `new TTSObject(...)`
    double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    TTSObject* obj = new TTSObject(value);
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
/*

Handle<Value> TTSObject::New(const Arguments& args) {
  //----------------------------------
  // TTS related variable declarations
  // ---------------------------------
  HandleScope scope;

  TTSConnectStruct  tts_connect;
  TTSData       tts_data;
  TTSRETVAL     ret = TTSERR_OK;

  synth_rounds_num_ = 1; //初始化
  memset( lib_name_, 0, sizeof lib_name_); 
#ifdef WIN32
  strcpy( lib_name_, TEXT("iFlyTTS.dll"));
#else
  strcpy( lib_name_, TEXT("libiflytts.so"));
#endif

  //----------------
  // Get Arguments
  //----------------
  if ( parse_cmd_line(args) != TTSERR_OK )
  {
    pre_quit(tts_connect);
   // return TTSERR_FAIL;
  }

  //-------------------
  // Load/Free Library
  //-------------------
  TTSCON_Dll_Handle lib;
  int synth_times = 1;
  if ( load_tts_lib(lib, lib_name_) == -1 )
    {
      //std::cout << TEXT("Load library failed!!") << std::endl;
      //return TTSERR_FAIL;
    }

  if (args.IsConstructCall()) {
    // Invoked as constructor: `new TTSObject(...)`
    double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    TTSObject* obj = new TTSObject(value);
    obj->Wrap(args.This());
    return args.This();
  } else {
    // Invoked as plain function `TTSObject(...)`, turn into construct call.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    return scope.Close(constructor->NewInstance(argc, argv));
  }
}*/

Handle<Value> TTSObject::PlusOne(const Arguments& args) {
  HandleScope scope;

  TTSObject* obj = ObjectWrap::Unwrap<TTSObject>(args.This());
  obj->value_ += 1;

  return scope.Close(Number::New(obj->value_));
}

Handle<Value> TTSObject::PlusOne2(const Arguments& args) {
  HandleScope scope;

  TTSObject* obj = ObjectWrap::Unwrap<TTSObject>(args.This());
  obj->value_ += 2;

  return scope.Close(Number::New(obj->value_));
}


/** 
 * @brief   parse_cmd_line
 *  
 *  
 *  
 * @author  lygao
 * @date  2005-11-27
 * @return  int - Return "TTSERR_OK" in success, otherwise return "TTSERR_FAIL".
 * @param int argc  - [in] 
 * @param char* argv[]  - [in] 
 * @see   
 */
/*Handle<Value> TTSObject::parse_cmd_line(const Arguments& args)
{
  // exclude the parameters that ttscon not support
  std::set<std::string> param_name_set;
  //  map name of parameter to the location of parameter in <param_list>
  std::map<std::string, int> param_pos_map;

  // check 
  if ( args.Length() < 2 )
  {
    //print_usage();
     return Number::New(TTSERR_INVALIDPARA);
   // return TTSERR_INVALIDPARA;
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
        return Number::New(TTSERR_INVALIDPARA);
        //return TTSERR_INVALIDPARA;
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
          return Number::New(-1);
          //return -1;
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
          return Number::New(TTSERR_INVALIDPARA);
          //return TTSERR_INVALIDPARA;
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
              return Number::New(TTSERR_INVALIDPARA);
              //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);
         // return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);
         // return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);
         // return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);        
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);        
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA); 
         // return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);     
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);      
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);   
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);    
          //return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);       
         //return TTSERR_INVALIDPARA;
        }
        raw_audio_data_ = (BOOL)numeric_val;
        break;

      case PARAM_IP://-r -ip
        memset( server_addr_, 0, sizeof server_addr_ );
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
          return Number::New(TTSERR_INVALIDPARA);
         // return TTSERR_INVALIDPARA;
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
          return Number::New(TTSERR_INVALIDPARA);    
          //return TTSERR_INVALIDPARA;
        }
        synth_param_[TTS_PARAM_AUDIOHEADFMT] = numeric_val;
        synth_param_set_[TTS_PARAM_AUDIOHEADFMT] = TRUE;
        option_map.insert( std::map<int, std::string>::value_type
          ( TTS_PARAM_AUDIOHEADFMT, param_list[param_pos_map[*param_iter]].tip));
        break;

      case PARAM_CONNSTR://-connstr 
        memset( connect_str_, 0, sizeof connect_str_ );
        strcpy( connect_str_, non_numeric_val);
        break;

      case PARAM_USRLIB://-usrlib
        memset( user_lib_name_, 0, sizeof user_lib_name_ );
        strcpy( user_lib_name_, non_numeric_val);
        user_lib_set_ = TRUE;
        break;
      case PARAM_BYTEORDER://byteorder
        if( numeric_val < 0 || numeric_val > 2 )
        {
          std::cout << TEXT("options ") << *param_iter;
          std::cout << TEXT(" error! valid value:[0-2]") <<std::endl;         
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
    std::cout << TEXT ( "please input audio file name!") << std::endl;

    std::cin >> out_audio_file_;
  }

  param_iter ++;

  if ( param_iter < param_vec.end() )
    strcpy(text_file_, (*param_iter).c_str());

  // the next arguments all be ingored.

 //   //Modified by lygao, 2006-2-8 11:05:54
  ////When text exist, give informations about text and audio
  //if ( text_file_[0] != TEXT('\0') )
  //{
  //  std::cout << TEXT("Text file to synthesize : ") << text_file_ << std::endl;
  //  std::cout << TEXT("Export audio file : ") << out_audio_file_ << TEXT("\t\t(y/n)\n");
  //  char c;
  //  std::cin>>c;
  //  if (c != 'y' && c != 'Y')
  //  {
  //    std::cout << TEXT("Please input text file name") << std::endl;
  //    memset(text_file_, 0, sizeof text_file_ );
  //    std::cin >> text_file_;

  //    std::cout << TEXT("Please input audio file name") << std::endl;
  //    memset(out_audio_file_, 0, sizeof out_audio_file_ );
  //    std::cin >> out_audio_file_;
  //  }
  //}
 //   //Modified end by lygao
  return Number::New(TTSERR_OK);

  //return TTSERR_OK;
}*/

/** 
 * @brief   fmt_cmd_line
 *  
 *  disjoint parameter and parameter's value
 *  
 * @author  lygao
 * @date  2005-11-27
 * @return  No return value.
 * @param int argc  - [in] 
 * @param char* argv[]  - [in] 
 * @param std::vector<std::string>& param_vec - [in,out] 
 * @see   
 */
/*void TTSObject::fmt_cmd_line(const Arguments& args,std::vector<std::string>& param_vec)
{
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
}*/



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



/*int TTSObject::load_tts_lib( TTSCON_Dll_Handle& lib, const char* lib_name)
{
  void* lib_handle = TTSCON_INVALID_HANDLE;
  lib.open(lib_name,lib_handle);
  lib_handle = lib.get_handle();

  if ( lib_handle == TTSCON_INVALID_HANDLE )
  {   
    std::cout << TEXT("load ") << lib_name;
    std::cout << TEXT(" fail.") << std::endl;
    return -1;
  }

  tts_initialize_ = ( Proc_TTSInitialize) lib.get_func_addr(TEXT("TTSInitialize"));
  if ( !tts_initialize_ )
  {   
    std::cout << TEXT("open TTSInitialize fail.") << std::endl;
    lib.close(1);
    return -1;
  }

  tts_synth_text_ex_ = ( Proc_TTSSynthTextEx) lib.get_func_addr(TEXT ("TTSSynthTextEx"));
  if ( !tts_synth_text_ex_ )
  {   
    std::cout << TEXT("open TTSSynthTextEx fail") << std::endl;
    lib.close(1);
    return -1;
  }

  tts_synth_text_ = ( Proc_TTSSynthText) lib.get_func_addr( TEXT("TTSSynthText"));
  if ( !tts_synth_text_ )
  { 
    std::cout << TEXT("open TTSSynthText fail.") << std::endl;
    lib.close(1);
    return -1;
  }

  tts_fetch_next_ = ( Proc_TTSFetchNext) lib.get_func_addr( TEXT("TTSFetchNext"));
  if ( !tts_fetch_next_ )
  {
    std::cout << TEXT("open TTSFetchNext fail.") << std::endl;  
    lib.close(1);
    return -1;
  }

  tts_set_synth_param_ = ( Proc_TTSSetSynthParam) lib.get_func_addr(TEXT("TTSSetSynthParam"));
  if ( !tts_set_synth_param_ )
  {
    std::cout << TEXT("open TTSSetSynthParam fail.") << std::endl;  
    lib.close(1);
    return -1;
  }

  tts_load_usr_lib_ = ( Proc_TTSLoadUserLib) lib.get_func_addr(TEXT("TTSLoadUserLib"));
  if ( !tts_load_usr_lib_ )
  {
    std::cout << TEXT("open TTSLoadUserLib fail.") << std::endl;  
    lib.close(1);
    return -1;
  }

  tts_uninitialize_  = ( Proc_TTSUninitialize ) lib.get_func_addr(TEXT("TTSUninitialize"));
  if ( !tts_uninitialize_   )
  {   
    std::cout << TEXT("open TTSUninitialize fail.") << std::endl; 
    lib.close(1);
    return -1;
  }

  tts_disconnect_ = ( Proc_TTSDisconnect) lib.get_func_addr(TEXT("TTSDisconnect"));
  if ( !tts_disconnect_ )
  { 
    std::cout << TEXT("open TTSDisconnect fail.") << std::endl; 
    lib.close(1);
    return -1;
  }


  tts_connect_ = ( Proc_TTSConnect) lib.get_func_addr(TEXT("TTSConnect"));
  if ( !tts_connect_ )
  {
    std::cout << TEXT("open TTSConnect fail.") << std::endl;  
    lib.close(1);
    return -1;
  }

  tts_unload_user_lib_ = ( Proc_TTSUnloadUserLib) lib.get_func_addr(TEXT("TTSUnloadUserLib"));
  if ( !tts_unload_user_lib_ )
  {
    std::cout << TEXT("open TTSUnloadUserLib fail.") << std::endl;  
    lib.close(1);
    return -1;
  }

  return 0;
}*/

/** 
 * @brief   pre_quit
 *  
 * Do something before quit the application. 
 *  
 * @author  lygao
 * @date  2005-11-27
 * @return  No return value.
 * @param TTSConnectStruct& tts_connect - [in,out] 
 * @see   
 */

Handle<Value> TTSObject::pre_quit(TTSConnectStruct& tts_connect)
{
  /*if ( instance_ )
  {
    if ( user_lib_loaded_ )
    {
      tts_unload_user_lib_(instance_, user_lib_);
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
        //std::cout << TEXT("Error in TTSDisconnect! error code 0x"); 
        //std::cout.flags(std::ios::hex);
        //std::cout.width(4);
        //std::cout.fill('0');  
        //std::cout << TTSGETERRCODE(ret) <<std::endl;
      }
      else
      {
        //std::cout << std::endl;
        //std::cout << TEXT("Disconnect from TTS kernel successfully!");
        //std::cout << std::endl;
      }
    }

    instance_ = NULL;
  }*/

  //-------------------------
  // Unload TTS from system
  // 从系统中卸载TTS服务
  //-------------------------
  /*if ( tts_inited_ )
  {
   // tts_uninitialize_();    
    //std::cout << TEXT("TTS kernel is unloaded from system.") << std::endl;
    tts_inited_ = FALSE;
  }*/

  int a=0;
  if(a != 1){
    
  }
return Undefined();
  //std::cout << TEXT("TTSConsole finished.") << std::endl;
}

