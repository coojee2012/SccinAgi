/** 
 * @file	ttscon.cpp
 * @brief	
 * 
 * detail...
 * 
 * @author	lygao
 * @version	1.0
 * @date	2005-11-27
 * 
 * @see		
 * 
 * <b>History:</b><br>
 * <table>
 *  <tr> <th>Version	<th>Date		<th>Author	<th>Notes</tr>
 *  <tr> <td>1.0		<td>2005-11-27	<td>lygao	<td>Create this file</tr>
 * </table>
 * 
 */

#include "ttscon.h"
#include "ttscon_utils.h"
#include <string>
#include <map>
#include <vector>
#include <set>

#define ASYCONN_TIME		10000           // time of asynchronous connect completing
#define ASYDISCON_TIME		10000			// time of asynchronous disconnect completing
#define ASYSYNTH_TIME		INFINITE        // time of  asynchronous synthesis procedure completing

static char	out_audio_file_[PATH_MAX]		= {0};		// output audiofile name
static char	text_file_[PATH_MAX]			= {0};		// output audiofile name
static int	text_file_len_					= 0;
static char text_buffer_[MAX_TXT_BUFFER]	= {0};
static char server_addr_[256]				= {0};
static char connect_str_[512]				= {0};
static char filter_[256]					= {0};		// Set filter param
static char user_lib_name_[256]					= {0};      // Set user library name

static BOOL				user_lib_set_		= FALSE;
static BOOL				prompt_			    = TRUE;
static ETTSSynthMode	synth_mode_		    = tsmTradition;	// Synthesize mode
static BOOL				raw_audio_data_		= FALSE;
static TTSINT32			synth_param_[MAX_TTS_PARAM]	    = { 0 };
static BOOL				synth_param_set_[MAX_TTS_PARAM] = { FALSE };
static BOOL				tts_inited_		    = FALSE;
static HTTSINSTANCE		instance_			= NULL;
static HTTSUSERLIB		user_lib_			= NULL;
static BOOL				user_lib_loaded_	= FALSE;
static BOOL				asyn_connect_		= FALSE;
static BOOL				asyn_discon_		= FALSE;

static TTSCON_Mutex		synth_complete_mutex_; // The event for asynchronous synthesizing
static TTSCON_Mutex		connect_complete_mutex_;//The event for asynchronous connecting
static TTSCON_Mutex     discon_complete_mutex_; //The event for asynchronous disconnecting

// The map for printing SynthParam when SetSynthParam successful
std::map<int, std::string> option_map; 

static BOOL ttscon_mode = FALSE;
int    ttscon_mode_value = 0;

// Some useful funtions
int		  test_txt_file   (void);
int		  test_out_file   (void);
int		  parse_cmd_line  (int argc, char* argv[]);
int		  load_tts_lib    (TTSCON_Dll_Handle& lib, const char* lib_name);
int		  ttscon_demo     (TTSConnectStruct& tts_connect, TTSData& tts_data, TTSRETVAL& ret);
int		  ReadTxtFile     (LPCTSTR szTxtFile, LPTSTR szBuff, int nSize );
int		  CatWavFile      (LPCTSTR sWavFile, PBYTE pBufNew, TTSDWORD dwBufNewLen);
void	  print_usage     (void);
int	      set_synth_param (void);
void	  pre_quit        (TTSConnectStruct& tts_connect);
void      fmt_cmd_line    (int argc, char* argv[], std::vector<std::string>& param_vec);
// Call back procedure.
TTSRETVAL SynthProcessProc(HTTSINSTANCE hTTSInstance, 
						   PTTSData pTTSData, TTSINT32 lParam, PTTSVOID pUserData);
TTSRETVAL ConnectCBProc	  (HTTSINSTANCE tts_inst, PTTSConnectStruct connect, 
						   TTSINT32 lparam, TTSDWORD user_data);

//Name of the load Library
char lib_name_[256];
// Times of Load/Free Library
int synth_rounds_num_ = 1;

//Pointers which point to address of the exported function or variable in the Library
Proc_TTSSetSynthParam tts_set_synth_param_ = NULL;
Proc_TTSLoadUserLib tts_load_usr_lib_ = NULL;
Proc_TTSUninitialize tts_uninitialize_ = NULL ;
Proc_TTSDisconnect tts_disconnect_ = NULL;
Proc_TTSUnloadUserLib tts_unload_user_lib_ = NULL;
Proc_TTSConnect tts_connect_= NULL;
Proc_TTSInitialize tts_initialize_ = NULL;
Proc_TTSSynthTextEx tts_synth_text_ex_ = NULL;
Proc_TTSSynthText tts_synth_text_ = NULL;
Proc_TTSFetchNext tts_fetch_next_ = NULL;


/** 
 * @brief 	main
 *  
 * Main thread
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	int	- Return 0 in success, otherwise return error code.
 * @param	int argc	- [in] 
 * @param	char* argv[]	- [in] 
 * @see		
 */
int main(int argc, char* argv[])
{
	//----------------------------------
	// TTS related variable declarations
	// ---------------------------------
	TTSConnectStruct	tts_connect;
	TTSData				tts_data;
	TTSRETVAL			ret = TTSERR_OK;

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
	if ( parse_cmd_line(argc, argv) != TTSERR_OK )
	{
		pre_quit(tts_connect);
		return TTSERR_FAIL;
	}

	//-------------------
	// Load/Free Library
	//-------------------
	TTSCON_Dll_Handle lib;
	int synth_times = 1;
	while ( synth_rounds_num_ > 0 )
	{
		std::cout << std::endl;
		std::cout << TEXT("This is ") << synth_times << TEXT("th TTS_Demo!");
		std::cout << std::endl;

		std::cout << TEXT("The library you load is: ") << lib_name_ << std::endl;

		//load library
		if ( load_tts_lib(lib, lib_name_) == -1 )
		{
			std::cout << TEXT("Load library failed!!") << std::endl;
			return TTSERR_FAIL;
		}

		if ( ttscon_demo( tts_connect, tts_data, ret) == TTSERR_FAIL )
		{
			return TTSERR_FAIL;
		}

		lib.close(1);
		synth_rounds_num_ --;
		synth_times++;
		ret = TTSERR_OK;
	} // End while

	return TTSERR_OK;
}

/** 
 * @brief 	print_usage
 *  
 * print information of how to use ttscon 
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	No return value.
 * @see		
 */
void print_usage(void)
{
	std::cout << VER_DESCRIBE << ", version " << VER_FILESTR << std::endl;
	std::cout << "Usage: ttscon [options value ...] audiofile [textfile]" << std::endl;

	std::cout << "Options:" << std::endl;

	int i = 0;
	// The variable is used to story name of paramter 
	std::string temp;	
	for ( i = 0; i < ( sizeof(param_list)/sizeof(PARAMLIST) ); i++ )
	{	
		temp += param_list[i].name;
		//use comma to separate paramters have the same type
		if ( param_list[i].type == param_list[i+1].type )
		{
			temp += ","; 
		}
		else
		{
			std::cout.width(5);
			std::cout<<" ";

			//print parameter's name
			std::cout.setf(std::ios_base::left);
			std::cout.width (18);
			std::cout<<temp;
			temp.clear();

			//print parameter's tip
			std::cout.setf(std::ios_base::left);
			std::cout<<param_list[i].tip<<std::endl;
		}
	}
} 


/** 
 * @brief 	fmt_cmd_line
 *  
 *  disjoint parameter and parameter's value
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	No return value.
 * @param	int argc	- [in] 
 * @param	char* argv[]	- [in] 
 * @param	std::vector<std::string>& param_vec	- [in,out] 
 * @see		
 */
void fmt_cmd_line(int argc, char* argv[],std::vector<std::string>& param_vec)
{
	bool joint = false;	
	param_vec.push_back(argv[0]);
	for ( int i = 1; i < argc; i++ )
	{
		joint = false;
		if ( *argv[i] != '-')
		{
			param_vec.push_back(argv[i]);
		}
		else
		{
			int max_len = 0;
			std::string param_value_tmp = argv[i];
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
 * @brief 	parse_cmd_line
 *  
 *  
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	int	- Return "TTSERR_OK" in success, otherwise return "TTSERR_FAIL".
 * @param	int argc	- [in] 
 * @param	char* argv[]	- [in] 
 * @see		
 */
int parse_cmd_line(int argc, char* argv[])
{
	// exclude the parameters that ttscon not support
	std::set<std::string> param_name_set;
	//  map name of parameter to the location of parameter in <param_list>
	std::map<std::string, int> param_pos_map;

	// check 
	if ( argc < 2 )
	{
		print_usage();
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
	std::vector<std::string> param_vec;
	fmt_cmd_line(argc,argv,param_vec);

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
				std::cout << TEXT("options ") << *param_iter;
				std::cout << TEXT (" not support,please check it.") << std::endl;
				return TTSERR_INVALIDPARA;
			}

			int numeric_val = 0; // to store numerical value of	parameter		
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
					std::cout << TEXT("Error:\"") << *param_iter;
					std::cout << TEXT("\" value missing") << std::endl;
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
					std::cout << TEXT("Error:\"") << *param_iter;
					std::cout << TEXT("\" value missing") << std::endl;
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
							std::cout << TEXT("Error: \"") << *param_iter;
							std::cout << TEXT("\" value is illegal.") << std::endl;
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[0-2]") <<std::endl;
					return TTSERR_INVALIDPARA;
				}
				synth_mode_ = (ETTSSynthMode)numeric_val;			
				ttscon_mode = TRUE;
				ttscon_mode_value = numeric_val;
				break;

			case PARAM_VID://-i -vid
				if ( numeric_val < 0 ) 
				{					
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[>=0]") <<std::endl;
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[1-6]") <<std::endl;
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[0-22]") <<std::endl;
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[-500-500]") <<std::endl;
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[-20-20]") <<std::endl;					
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[-500-500]") <<std::endl;
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[0-3]") <<std::endl;					
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[16-256]") <<std::endl;			
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[0-1]") <<std::endl;				
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[0-3]") <<std::endl;					
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[0-2]") <<std::endl;			
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[>=0]") <<std::endl;
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[0 or 1]") <<std::endl;			
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[0-1]") <<std::endl;					
					return TTSERR_INVALIDPARA;
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[>=1]") <<std::endl;
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
					std::cout << TEXT("options ") << *param_iter;
					std::cout << TEXT(" error! valid value:[0-2]") <<std::endl;					
					return TTSERR_INVALIDPARA;
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
	//	std::cout << TEXT("Text file to synthesize : ") << text_file_ << std::endl;
	//	std::cout << TEXT("Export audio file : ") << out_audio_file_ << TEXT("\t\t(y/n)\n");
	//	char c;
	//	std::cin>>c;
	//	if (c != 'y' && c != 'Y')
	//	{
	//		std::cout << TEXT("Please input text file name") << std::endl;
	//		memset(text_file_, 0, sizeof text_file_ );
	//		std::cin >> text_file_;

	//		std::cout << TEXT("Please input audio file name") << std::endl;
	//		memset(out_audio_file_, 0, sizeof out_audio_file_ );
	//		std::cin >> out_audio_file_;
	//	}
	//}
 //   //Modified end by lygao

	return TTSERR_OK;
}


/** 
 * @brief 	test_txt_file
 *  
 * 
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	int	- Return "TTSERR_OK" in success, otherwise return "TTSERR_FAIL".
 * @see		
 */
int test_txt_file(void)
{
	FILE *fp = NULL;
	if (text_file_[0] == '\x0')
	{
#ifdef WIN32		
		std::cout << TEXT("Please type text in the following, Ctrl-Z <ENTER> to finish.");
		std::cout << std::endl;
#else
		std::cout << TEXT("Please type text in the following, Ctrl-D <ENTER> to finish.");
		std::cout << std::endl;
#endif

		fp = stdin;
		int c = fgetc(fp);
		int count = 0;
		while(c != EOF)
		{
			if (count >= MAX_TXT_BUFFER-1)
				break;
			text_buffer_[count++] = (char)c;
			c = fgetc(fp);
		}
		text_buffer_[count] = '\x0';
		text_file_len_ = count;
	}
	else
	{
		fp = fopen(text_file_, "rb");
		if (fp == NULL)
		{
			std::cout << TEXT("Error: Can't open text file \"");
			std::cout << text_file_ << TEXT("\"") << std::endl;	
			return TTSERR_FAIL;
		}
		fseek(fp, 0, SEEK_END);
		int len = ftell(fp);
		fseek(fp, 0, SEEK_SET);
		if (len > MAX_TXT_BUFFER-1)
			len = MAX_TXT_BUFFER-1;
		len = fread(text_buffer_, 1, len, fp);
		if (len == 0)
		{
			std::cout << TEXT("Error: No text read in file \"");
			std::cout << text_file_ << TEXT("\"") << std::endl;		
			return TTSERR_FAIL;
		}
		text_buffer_[len] = '\x0';
		text_file_len_ = len;
		fclose(fp);
		fp = NULL;
	}

	return TTSERR_OK;
}


/** 
 * @brief 	test_out_file
 *  
 * 
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	int	- Return "TTSERR_OK" in success, otherwise return "TTSERR_FAIL".
 * @see		
 */
int test_out_file(void)
{
	// Test out audio file
	FILE * fp = NULL;
	if (prompt_)
	{
		fp = fopen(out_audio_file_, "rb");
		if (fp  != NULL)
		{
			fclose(fp);			
			std::cout << TEXT("File \"") << out_audio_file_;
			std::cout << TEXT("\" exists, overwrite it?(y/n):");
			char c;
			std::cin>>c;
			if (c != 'y' && c != 'Y')
				return TTSERR_FAIL;
		}
	}

	fp = fopen(out_audio_file_, "wb");
	if (fp == NULL)
	{		
		std::cout << TEXT("Can't write to file \"") << out_audio_file_;
		std::cout << TEXT("\"") << std::endl;
		return TTSERR_FAIL;
	}
	fclose(fp);
	unlink(out_audio_file_);
	return TTSERR_OK;
}


/** 
 * @brief 	SynthProcessProc
 *  
 *  TTS processing callback function
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	TTSRETVAL	- Return 0 in success, otherwise return error code.
 * @param	HTTSINSTANCE instance	- [in] 
 * @param	PTTSData tts_data	- [in] 
 * @param	TTSINT32 lparam	- [in] 
 * @param	PTTSVOID user_data	- [in] 
 * @see		
 */
TTSRETVAL SynthProcessProc(HTTSINSTANCE instance,
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
			//---------------------------------------------------------
			synth_complete_mutex_.release();
		}
	}

	// You can return TTSERR_CANCEL to stop Synthesizing Procedure
	return tts_data->dwErrorCode; 
}


/** 
 * @brief 	ConnectCBProc
 *  
 *  
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	TTSRETVAL	- Return 0 in success, otherwise return error code.
 * @param	 HTTSINSTANCE tts_inst	- [in] 
 * @param	PTTSConnectStruct connect	- [in] 
 * @param	TTSINT32 lparam	- [in] 
 * @param	TTSDWORD user_data	- [in] 
 * @see		
 */
TTSRETVAL ConnectCBProc( HTTSINSTANCE tts_inst, PTTSConnectStruct connect, 
						TTSINT32 lparam, TTSDWORD user_data )
{
	BOOL is_disconnect_cb = (BOOL)lparam;


	if ( is_disconnect_cb)
	{
		// TTSDisconnect Callbacking
		std::cout << TEXT("ConnectCBProc::Asynchrounous disconnect callback! ")<<std::endl;
		discon_complete_mutex_.release();
	}
	else
	{	
		// TTSConnect Callbacking
		std::cout << TEXT("ConnectCBProc::Asynchrounous connect callback! ")<<std::endl;
		connect_complete_mutex_.release();
	}

	return TTSERR_OK; 
}


/** 
 * @brief 	CatWavFile
 *  
 * Append some audio data to a audiofile
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	int	- Return 0 in success, otherwise return error code.
 * @param	const char* wave_file	- [in,out] 
 * @param	PBYTE buf_new	- [in] 
 * @param	TTSDWORD buf_new_len	- [in] 
 * @see		
 */
int  CatWavFile(const char* wave_file, PBYTE buf_new, TTSDWORD buf_new_len)
{
	FILE* fp;
	TTSDWORD file_size, data_size, wav_size;

	if ( buf_new_len <= 0 )
	{
		return TTSERR_OK;
	}

	std::cout << TEXT("*");

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


/** 
 * @brief 	set_synth_param
 *  
 * Read and set parameter
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	int	- Return "TTSERR_OK" in success, otherwise return error code.
 * @see		
 */
int set_synth_param(void)
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
			std::cout << TEXT("Load user's library \"") << pack_name;
			std::cout << TEXT("\" failed, errocode = 0x");
			std::cout.flags(std::ios::hex);
			std::cout.width(8);
			std::cout.fill('0');
			std::cout << TTSGETERRCODE(ret) << std::endl;	
			user_lib_loaded_ = FALSE;
			return TTSERR_FAIL;
		}
		else
		{			
			std::cout << TEXT("Load user's library \"") << pack_name;
			std::cout << TEXT("\" successed.") << std::endl;
			user_lib_loaded_ = TRUE;
		}
	}

	//whether print the synth param,the varaible is used to format the output.
	BOOL is_print = FALSE;

	if ( ttscon_mode ) // If set synthesize mode, print it.
	{			
		std::cout<<"Set synthesize mode : "<< ttscon_mode_value<<std::endl;
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
				std::cout<< option_map[i]<<": "<<synth_param_[i]<<std::endl;
				is_print = TRUE;
			}
			else
			{
				std::cout << TEXT("TTSSetParam(")<<option_map[i]<<TEXT(":" ) << synth_param_[i];
				std::cout << TEXT(") failed, errocode = 0x"); 
				std::cout.flags(std::ios::hex);
				std::cout.width(8);
				std::cout.fill('0');	
				std::cout << TTSGETERRCODE(ret) <<std::endl;
				return TTSERR_FAIL;
			}
		}	
	}

	if(is_print)
	{
		std::cout<<std::endl;
	}
	
	return TTSERR_OK;
}


/** 
 * @brief 	pre_quit
 *  
 * Do something before quit the application. 
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	No return value.
 * @param	TTSConnectStruct& tts_connect	- [in,out] 
 * @see		
 */
void pre_quit(TTSConnectStruct& tts_connect)
{
	if ( instance_ )
	{
		if ( user_lib_loaded_ )
		{
			tts_unload_user_lib_(instance_, user_lib_);
			user_lib_ = NULL;
			user_lib_loaded_ = FALSE;
		}
		// Asynchronous disconnect TTS system
		if ( asyn_discon_ )
		{
			discon_complete_mutex_.creat();
			int ret = tts_disconnect_(instance_);
			if ( ret != TTSERR_OK )
			{
				std::cout << TEXT("Error in TTSDisconnect! error code 0x"); 
				std::cout.flags(std::ios::hex);
				std::cout.width(4);
				std::cout.fill('0');	
				std::cout << TTSGETERRCODE(ret) << std::endl;
			}
			else
			{
				std::cout << TEXT("Asynchronous disconnect from TTS, waiting...")
					<< std::endl;
				if ( discon_complete_mutex_.acquire(ASYDISCON_TIME) == -1 )
				{
					std::cout << TEXT("Asynchronous disconnect time out") << std::endl;
				}
				else
				{
					std::cout << std::endl;
					std::cout << TEXT(" Asynchronous disconnect from TTS kernel successfully!");
					std::cout << std::endl;
				}
			}
			discon_complete_mutex_.remove();
		}
		else// synchronous disconnect TTS system
		{
			int ret = tts_disconnect_(instance_);
			if ( ret != TTSERR_OK )
			{
				std::cout << TEXT("Error in TTSDisconnect! error code 0x"); 
				std::cout.flags(std::ios::hex);
				std::cout.width(4);
				std::cout.fill('0');	
				std::cout << TTSGETERRCODE(ret) <<std::endl;
			}
			else
			{
				std::cout << std::endl;
				std::cout << TEXT("Disconnect from TTS kernel successfully!");
				std::cout << std::endl;
			}
		}

		instance_ = NULL;
	}

	//-------------------------
	// Unload TTS from system
	//-------------------------
	if ( tts_inited_ )
	{
		tts_uninitialize_();		
		std::cout << TEXT("TTS kernel is unloaded from system.") << std::endl;
		tts_inited_ = FALSE;
	}

	std::cout << TEXT("TTSConsole finished.") << std::endl;
}


/** 
 * @brief 	load_tts_lib
 *  
 * Open Library and Get the address of the exported function 
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	int	- Return 0 in success, otherwise return error code.
 * @param	 TTSCON_Dll_Handle& lib	- [in,out] 
 * @param	const char* lib_name	- [in] 
 * @see		
 */
int load_tts_lib( TTSCON_Dll_Handle& lib, const char* lib_name)
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
}

/** 
 * @brief 	ttscon_demo
 *  
 *  TTSCONSOLE DEMO
 *  
 * @author	lygao
 * @date	2005-11-27
 * @return	int	- Return 0 in success, otherwise return error code.
 * @param	TTSConnectStruct& tts_connect	- [in,out] 
 * @param	TTSData& tts_data	- [in,out] 
 * @param	TTSRETVAL& ret	- [in,out] 
 * @see		
 */
int ttscon_demo(TTSConnectStruct& tts_connect, TTSData& tts_data, TTSRETVAL& ret)
{
	//-------------------------
	// Initialize Varibles
	//-------------------------

	std::cout << std::endl << TEXT("Initializing iFlyTTS system...");
	std::cout << std::endl;
	//--------------------------------------
	// Initialize TTS System
	//--------------------------------------
	if ((ret = tts_initialize_()) != TTSERR_OK)
	{
		if (ret == TTSERR_NOLICENCE)
		{			
			std::cout << TEXT("Error in initializing TTS system,");
			std::cout << TEXT(" have no licence to run this application.");
			std::cout << std::endl;
		}
		else
		{
			std::cout << TEXT("Error in initializing TTS system, Error Code 0x"); 
			std::cout.flags(std::ios::hex);
			std::cout.width(4);
			std::cout.fill('0');	
			std::cout << TTSGETERRCODE(ret) <<std::endl;					
		}
		pre_quit(tts_connect);
		return TTSERR_FAIL;
	}
	tts_inited_ = TRUE;	
	std::cout<< TEXT("\r") << TEXT("TTS system Initilized.") << std::endl;

	//----------------------------------------
	// Connect to TTS Service
	//----------------------------------------
	const char *company_name = "User company name";// developer information
	const char *user_name	= "User name";
	const char *product_name	= "iFly TTSConsole demo";
	const char *serial_num	= "*****-*****-*****"; // Enter your product serial number here!
	memset(&tts_connect, 0, sizeof(TTSConnectStruct));
	tts_connect.dwSDKVersion = IFLYTTS_SDK_VER;
	strcpy(tts_connect.szCompanyName, company_name);
	strcpy(tts_connect.szUserName, user_name);
	strcpy(tts_connect.szProductName, product_name);
	strcpy(tts_connect.szSerialNumber, serial_num);
	strcpy(tts_connect.szConnectStr, connect_str_);
	strcpy(tts_connect.szServiceUID, filter_);
	if ( asyn_connect_ )
	{
		tts_connect.pfnConnectCB = (void *)ConnectCBProc;
	}
	if ( asyn_discon_ )
	{
		tts_connect.pfnDisconnectCB = (void *) ConnectCBProc;
	}

	//synthesize through network
	if ( server_addr_[0] != '\x0' )
	{
		strcpy(tts_connect.szTTSServerIP, server_addr_);
	}
	else
	{
		std::cout << TEXT("TTS will search best server to synthesize text")
			<< std::endl;
	}

	if ( !asyn_connect_ ) // synchronized connect		
	{   
		instance_ = tts_connect_(&tts_connect);
		if (instance_ == NULL)
		{
			if (tts_connect.dwErrorCode == TTSERR_INVALIDSN)
			{				
				std::cout << TEXT("Invalid serial number!") << std::endl;
			}
			else
			{				
				std::cout << TEXT( "Error in Connect to TTS server (" )
					<<tts_connect.szTTSServerIP
					<<TEXT("), Error Code=0x"); 
				std::cout.flags(std::ios::hex);
				std::cout.width(8);
				std::cout.fill('0');	
				std::cout << tts_connect.dwErrorCode <<std::endl;
			}
			pre_quit(tts_connect);
			return TTSERR_FAIL;
		}		
		std::cout << TEXT("Connect to TTS server(")<<tts_connect.szTTSServerIP<<TEXT(") successfully.");
		std::cout << std::endl << std::endl;
	}
	else // Asynchronous connect
	{		
		connect_complete_mutex_.creat();
		instance_ = tts_connect_(&tts_connect);
		if ( instance_ == NULL )
		{
			if (tts_connect.dwErrorCode == TTSERR_INVALIDSN)
			{				
				std::cout << TEXT("Invalid serial number!") << std::endl;
			}
			else
			{				
				std::cout << TEXT("Error in Connect to TTS system, Error Code 0x"); 
				std::cout.flags(std::ios::hex);
				std::cout.width(8);
				std::cout.fill('0');	
				std::cout << tts_connect.dwErrorCode <<std::endl;
			}
			pre_quit(tts_connect);
			connect_complete_mutex_.remove();
			return TTSERR_FAIL;
		}
		else
		{
			/*
			 * If Asynchrounous connect callbacking return handle(not null),
			 * which denote programme in process of connecting.
			 */
			std::cout << TEXT("Asynchronous connect from TTS, waiting...")
				<< std::endl;
			if ( connect_complete_mutex_.acquire(ASYCONN_TIME) == -1)
			{
				std::cout << TEXT("Asynchronnous connect time out") << std::endl;
				connect_complete_mutex_.remove();
				return TTSERR_FAIL;
			}

			std::cout << TEXT("Asynchrounous connect successful!") << std::endl;
		}
		connect_complete_mutex_.remove();		
	}

	//------------------------------
	// Set Synthesize Parameters
	//------------------------------
	ret = set_synth_param();
	if ( ret != TTSERR_OK )
	{
		return TTSERR_FAIL;
	}
	ret = test_out_file();
	if (ret != TTSERR_OK)
	{
		pre_quit(tts_connect);
		return ret;
	}

	ret = test_txt_file();
	if (ret != TTSERR_OK)
	{
		pre_quit(tts_connect);
		return ret;
	}

	if ( !raw_audio_data_ )
	{
		tts_set_synth_param_(instance_, TTS_PARAM_AUDIOHEADFMT, TTS_AHF_STAND);
	}
	else
	{
		tts_set_synth_param_(instance_, TTS_PARAM_AUDIOHEADFMT, TTS_AHF_NONE);
	}

	//---------------------------------------
	// Synthesize text to audio data
	//---------------------------------------
	memset(&tts_data, 0, sizeof(tts_data));
	tts_data.dwInBufSize = text_file_len_;
	tts_data.szInBuf = text_buffer_;

	if (synth_mode_ == tsmTradition)	//tradition synthesize mode
	{ 	
		std::cout << TEXT("Using traditional method to synthesize Text.");
		std::cout << std::endl;

		ret = tts_synth_text_(instance_, &tts_data);
		if (ret) 
		{
			std::cout << TEXT("Error in TTSSynthText, Error Code 0x"); 
			std::cout.flags(std::ios::hex);
			std::cout.width(4);
			std::cout.fill('0');	
			std::cout << TTSGETERRCODE(ret) <<std::endl;			
			pre_quit(tts_connect);
			return TTSERR_FAIL;
		}

		if (tts_data.dwOutBufSize > 0) 
		{
			CatWavFile(out_audio_file_, (PBYTE)tts_data.pOutBuf, tts_data.dwOutBufSize);
		}

		while(tts_data.dwOutFlags == TTS_FLAG_STILL_HAVE_DATA)
		{
			ret = tts_fetch_next_(instance_, &tts_data);
			if (ret) 
			{
				std::cout << TEXT("Error in TTSFetchNext, Error Code 0x"); 
				std::cout.flags(std::ios::hex);
				std::cout.width(4);
				std::cout.fill('0');	
				std::cout << TTSGETERRCODE(ret) <<std::endl;			
				pre_quit(tts_connect);
				return TTSERR_FAIL;
			}
			if (tts_data.dwOutBufSize > 0) 
				CatWavFile(out_audio_file_, (PBYTE)tts_data.pOutBuf, tts_data.dwOutBufSize);
		}// End while
	}
	else //callback synthesize 
	{
		TTSCallBacks TtsCallBacks = { 0 };
		TtsCallBacks.nNumCallbacks = 1;
		TtsCallBacks.pfnTTSProcessCB = SynthProcessProc;
		TtsCallBacks.pfnTTSEventCB = NULL;
		//callback synchronization synthesize mode
		if (synth_mode_ == tsmCbSynch) 
		{ 		
			std::cout << TEXT("Using callback synchronous method to synthesize Text.");
			std::cout << std::endl;
			ret = tts_synth_text_ex_(instance_, &tts_data, &TtsCallBacks, FALSE, NULL);
			if (ret != TTSERR_OK)
			{
				std::cout << TEXT("Error in TTSSynthTextEx, Error Code 0x"); 
				std::cout.flags(std::ios::hex);
				std::cout.width(4);
				std::cout.fill('0');	
				std::cout << TTSGETERRCODE(ret) <<std::endl;				
				pre_quit(tts_connect);
				return TTSERR_FAIL;
			}
		}
		else //callback asynchronous synthesize mode
		{ 			
			std::cout << TEXT("Using callback asynchronous method to synthesize Text.");
			std::cout << std::endl;
			ret = tts_synth_text_ex_(instance_, &tts_data, &TtsCallBacks, TRUE, NULL);
			if (ret != TTSERR_OK)
			{
				std::cout << TEXT("Error accur in TTSSynthTextEx function, Error Code 0x"); 
				std::cout.flags(std::ios::hex);
				std::cout.width(4);
				std::cout.fill('0');	
				std::cout << TTSGETERRCODE(ret) <<std::endl;			
				pre_quit(tts_connect);
				return TTSERR_FAIL;
			}
			else
			{
				synth_complete_mutex_.creat();
				std::cout << TEXT("Waiting for the completion of synthesis procedure...")
				          << std::endl;
				std::cout << TEXT("The max time of waiting is: ") << ASYSYNTH_TIME
				           << std::endl;
				if( synth_complete_mutex_.acquire( ASYSYNTH_TIME ) == -1)
				{
					std::cout<< std::endl<< "Asynchronous synth time out" << std::endl;
					synth_complete_mutex_.creat();
					return TTSERR_FAIL;
				}
				else
				{
					std::cout << std::endl
						      << "Asynchronous synthesis procedure complete successful!" 
						      << std::endl;
				}
				synth_complete_mutex_.remove();
			}
		}
	}
	
	std::cout << std::endl;
	std::cout << TEXT("Synthesize text process has completed successfully.");
	std::cout << std::endl;

	//------------------------------------------------------------------------------
	// Disconnect from TTS service,call TTSDisconnect and TTSUninitialize functions
	//------------------------------------------------------------------------------
	pre_quit(tts_connect);
	return 0;
}

