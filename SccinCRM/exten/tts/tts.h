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
  explicit TTSObject(double value = 0);
  ~TTSObject();

  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> PlusOne(const v8::Arguments& args);
  static v8::Handle<v8::Value> PlusOne2(const v8::Arguments& args);
  static v8::Persistent<v8::Function> constructor;
  double value_;
  // Some useful funtions
// 一些有用的funtions
static int		  test_txt_file   (void);
static int		  test_out_file   (void);
static v8::Handle<v8::Value>		  parse_cmd_line  (const v8::Arguments& args);
static int		  load_tts_lib    (TTSCON_Dll_Handle& lib, const char* lib_name);
static int		  ttscon_demo     (TTSConnectStruct& tts_connect, TTSData& tts_data, TTSRETVAL& ret);
static int		  ReadTxtFile     (LPCTSTR szTxtFile, LPTSTR szBuff, int nSize );
static int		  CatWavFile      (LPCTSTR sWavFile, PBYTE pBufNew, TTSDWORD dwBufNewLen);
static void	  print_usage     (void);
static int	      set_synth_param (void);
static v8::Handle<v8::Value>	  pre_quit        (TTSConnectStruct& tts_connect);
static void      fmt_cmd_line    (const v8::Arguments& args, std::vector<std::string>& param_vec);

static char	out_audio_file_[PATH_MAX]	;//	= {0};		// output audiofile name
static char	text_file_[PATH_MAX]		;//	= {0};		// output audiofile name
static int	text_file_len_				;//	= 0;
static char text_buffer_[MAX_TXT_BUFFER]	;//= {0};
static char server_addr_[256]				;//= {0};
static char connect_str_[512]				;//= {0};
static char filter_[256]					;//= {0};		// Set filter param
static char user_lib_name_[256]			;//		= {0};      // Set user library name

static BOOL				user_lib_set_	;//	= FALSE;
static BOOL				prompt_			 ;//   = TRUE;
static ETTSSynthMode	synth_mode_		 ;//   = tsmTradition;	// Synthesize mode
static BOOL				raw_audio_data_	;//	= FALSE;
static TTSINT32			synth_param_[MAX_TTS_PARAM]	;//    = { 0 };
static BOOL				synth_param_set_[MAX_TTS_PARAM] ;//= { FALSE };
static BOOL				tts_inited_		   ;// = FALSE;
static HTTSINSTANCE		instance_			;//= NULL;
static HTTSUSERLIB		user_lib_			;//= NULL;
static BOOL				user_lib_loaded_	;//= FALSE;
static BOOL				asyn_connect_		;//= FALSE;
static BOOL				asyn_discon_		;//= FALSE;

static TTSCON_Mutex		synth_complete_mutex_; // The event for asynchronous synthesizing
static TTSCON_Mutex		connect_complete_mutex_;//The event for asynchronous connecting
static TTSCON_Mutex     discon_complete_mutex_; //The event for asynchronous disconnecting

// The map for printing SynthParam when SetSynthParam successful
static std::map<int, std::string> option_map; 

static BOOL ttscon_mode;// = FALSE;
static int    ttscon_mode_value;// = 0;
// Call back procedure.
//回调程序
TTSRETVAL SynthProcessProc(HTTSINSTANCE hTTSInstance, 
						   PTTSData pTTSData, TTSINT32 lParam, PTTSVOID pUserData);
TTSRETVAL ConnectCBProc	  (HTTSINSTANCE tts_inst, PTTSConnectStruct connect, 
						   TTSINT32 lparam, TTSDWORD user_data);

//Name of the load Library
//装载库的名称
static char lib_name_[256];
// Times of Load/Free Library
static int synth_rounds_num_ ;//= 1;

//Pointers which point to address of the exported function or variable in the Library
//指针指向的地址库中导出的函数或变量
static Proc_TTSSetSynthParam tts_set_synth_param_;// = NULL;
static Proc_TTSLoadUserLib tts_load_usr_lib_ ;//= NULL;
static Proc_TTSUninitialize tts_uninitialize_ ;//= NULL ;
static Proc_TTSDisconnect tts_disconnect_ ;//= NULL;
static Proc_TTSUnloadUserLib tts_unload_user_lib_;// = NULL;
static Proc_TTSConnect tts_connect_;//= //NULL;
static Proc_TTSInitialize tts_initialize_ ;//= NULL;
static Proc_TTSSynthTextEx tts_synth_text_ex_;// = NULL;
static Proc_TTSSynthText tts_synth_text_;// = NULL;
static Proc_TTSFetchNext tts_fetch_next_ ;//= NULL;
};

#endif