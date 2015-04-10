#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>

#include "ttscon.h"
#include "ttscon_utils.h"
#include <string>
#include <map>
#include <vector>
#include <set>

#define ASYCONN_TIME    10000           // 异步处理连接完成时间
#define ASYDISCON_TIME    10000     // 异步处理断开连接的时间
#define ASYSYNTH_TIME   INFINITE        // 异步合成处理过程完成时间

class TTSObject : public node::ObjectWrap {
 public:
  static void Init(v8::Handle<v8::Object> exports);

 private:
  explicit TTSObject(const v8::Arguments& args);
  ~TTSObject();

 static  v8::Handle<v8::Value> New(const v8::Arguments& args);
 static v8::Handle<v8::Value> PlusOne(const v8::Arguments& args);
 static  v8::Handle<v8::Value> Synth(const v8::Arguments& args);
 static  v8::Handle<v8::Value> Reload(const v8::Arguments& args);
 static  v8::Handle<v8::Value> Unload(const v8::Arguments& args);
 static  v8::Persistent<v8::Function> constructor;
  bool abc_;
  double value_;
  TTSConnectStruct  tts_connect;

 // Some useful funtions
// 一些有用的funtions
 int		  load   (const v8::Arguments& args);
 int		  unload   (void);
 //int	  parse_cmd_line  (const v8::Arguments& args);
 int		  load_tts_lib    (TTSCON_Dll_Handle& lib, const char* lib_name);
 void   pre_quit(void);
 int		  ReadTxtFile     (LPCTSTR szTxtFile, LPTSTR szBuff, int nSize );
 int		  CatWavFile      (LPCTSTR sWavFile, PBYTE pBufNew, TTSDWORD dwBufNewLen);
 int	      set_synth_param (void);
 int connect(void);
 int disconnect(void);
int initialize(void);
 //static void      fmt_cmd_line    (const v8::Arguments& args, std::vector<std::string>& param_vec);
 
 char	out_audio_file_[PATH_MAX]	;//	= {0};		// output audiofile name
 char	text_file_[PATH_MAX]		;//	= {0};		// output audiofile name
 int	text_file_len_				;//	= 0;
 char text_buffer_[MAX_TXT_BUFFER]	;//= {0};
 char server_addr_[256]				;//= {0};
 char connect_str_[512]				;//= {0};
 char filter_[256]					;//= {0};		// Set filter param
 char user_lib_name_[256]			;//		= {0};      // Set user library name

 BOOL				user_lib_set_	;//	= FALSE;
 BOOL				prompt_			 ;//   = TRUE;
 ETTSSynthMode	synth_mode_		 ;//   = tsmTradition;	// Synthesize mode
 BOOL				raw_audio_data_	;//	= FALSE;
 TTSINT32			synth_param_[MAX_TTS_PARAM]	;//    = { 0 };
 BOOL				synth_param_set_[MAX_TTS_PARAM] ;//= { FALSE };
 BOOL				tts_inited_		   ;// = FALSE;
 HTTSINSTANCE		instance_			;//= NULL;
 HTTSUSERLIB		user_lib_			;//= NULL;
 BOOL				user_lib_loaded_	;//= FALSE;
 BOOL				asyn_connect_		;//= FALSE;
 BOOL				asyn_discon_		;//= FALSE;

 TTSCON_Mutex		synth_complete_mutex_; // The event for asynchronous synthesizing 异步合成事件
 TTSCON_Mutex		connect_complete_mutex_;//The event for asynchronous connecting    异步连接事件
 TTSCON_Mutex     discon_complete_mutex_; //The event for asynchronous disconnecting 异步断开事件

// The map for printing SynthParam when SetSynthParam successful
 std::map<int, std::string> option_map; 

 BOOL ttscon_mode;// = FALSE;
 int    ttscon_mode_value;// = 0;
// Call back procedure.
//回调程序

TTSRETVAL SynthProcessProc(HTTSINSTANCE hTTSInstance, 
						   PTTSData pTTSData, TTSINT32 lParam, PTTSVOID pUserData);
TTSRETVAL ConnectCBProc	  (HTTSINSTANCE tts_inst, PTTSConnectStruct connect, 
						   TTSINT32 lparam, TTSDWORD user_data);

//Name of the load Library
//装载库的名称
 char lib_name_[256];
// Times of Load/Free Library
 int synth_rounds_num_ ;//= 1;

//Pointers which point to address of the exported function or variable in the Library
//指针指向的地址库中导出的函数或变量
 Proc_TTSSetSynthParam tts_set_synth_param_;// = NULL;
 Proc_TTSLoadUserLib tts_load_usr_lib_ ;//= NULL;
 Proc_TTSUninitialize tts_uninitialize_ ;//= NULL ;
 Proc_TTSDisconnect tts_disconnect_ ;//= NULL;
 Proc_TTSUnloadUserLib tts_unload_user_lib_;// = NULL;
 Proc_TTSConnect tts_connect_;//= //NULL;
 Proc_TTSInitialize tts_initialize_ ;//= NULL;
 Proc_TTSInitializeEx tts_initialize_ex_ ;
 Proc_TTSSynthTextEx tts_synth_text_ex_;// = NULL;
 Proc_TTSSynthText tts_synth_text_;// = NULL;
 Proc_TTSFetchNext tts_fetch_next_ ;//= NULL;
 Proc_TTSSetParam tts_set_param_;
};

#endif