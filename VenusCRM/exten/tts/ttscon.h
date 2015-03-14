/** 
 * @file	ttscon.h
 * @brief	
 * 
 * detail...
 * 
 * @author	lygao
 * @version	1.0
 * @date	2005-12-6
 * 
 * @see		
 * 
 * <b>History:</b><br>
 * <table>
 *  <tr> <th>Version	<th>Date		<th>Author	<th>Notes</tr>
 *  <tr> <td>1.0		<td>2005-12-6	<td>lygao	<td>Create this file</tr>
 * </table>
 * 
 */

#ifndef __TTS_CONSOLE_H__
#define __TTS_CONSOLE_H__

#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <limits.h>
#include <errno.h>
#include <iostream>

#ifndef WIN32 
#include <pthread.h>
#include <unistd.h>
typedef int	BOOL;

#else  //WIN32
#include <windows.h>
#define	PATH_MAX	_MAX_PATH
#endif//WIN32

#include "iFly_TTS.h"
#include "FileVerInfo.h"
#include "ttscon_utils.h"//Added by lygao, 2005-11-16 14:53:33

typedef char			*LPTSTR;
typedef const char		*LPCTSTR;
typedef unsigned char	*PBYTE;

const int MAX_TXT_BUFFER	= 0x10000;
const int MAX_TTS_PARAM		= (TTS_PARAM_BGSOUND+1);

//?????ֽڵ?WORD?ߵ?λ??ת
#define TTS_WORD_LE_BE(val)	 ((TTSWORD) ( (((TTSWORD) (val) & (TTSWORD) 0x00ffU) << 8) | \
							 (((TTSWORD) (val) & (TTSWORD) 0xff00U) >> 8)))
//?ĸ??ֽڵ?DWORD?ߵ?λ??ת
#define TTS_DWORD_LE_BE(val) ((TTSDWORD) ( (((TTSDWORD) (val) & (TTSDWORD) 0x000000ffU) << 24) | \
							 (((TTSDWORD) (val) & (TTSDWORD) 0x0000ff00U) <<  8) | \
							 (((TTSDWORD) (val) & (TTSDWORD) 0x00ff0000U) >>  8) | \
							 (((TTSDWORD) (val) & (TTSDWORD) 0xff000000U) >> 24)))

enum ETTSSynthMode {
	tsmTradition = 0,	// No Callback and synchronous synthesize
	tsmCbSynch,			// Callback and synchronous synthesize
	tsmCbAsynch			// Callback and asynchronous synthesize
};

enum ETTSCON_PARAM_TYPE
{
	PARAM_INVALID		= 0,
	PARAM_MODE			= 1,
	PARAM_VID			= 2,
	PARAM_CODEPAGE		= 3,
	PARAM_AUDIOFMT		= 4,
	PARAM_SPEED			= 5,
	PARAM_VOLUMN		= 6,
	PARAM_PITCH			= 7,
	PARAM_ENTER			= 8,
	PARAM_LENGTH		= 9,
	PARAM_MARKS			= 10,
	PARAM_NUMBER		= 11,
	PARAM_ENGLISH		= 12,
	PARAM_BGS			= 13,
	PARAM_VPT			= 14,
	PARAM_RAW			= 15,
	PARAM_IP			= 16,
	PARAM_Y				= 17,
	PARAM_LIBRARY		= 18,
	PARAM_ROUNDS		= 19,
	PARAM_ASYNCONN		= 20,
	PARAM_ASYNDISCON	= 21,
	PARAM_FILTER		= 22,
	PARAM_AHF			= 23,
	PARAM_CONNSTR		= 24,
	PARAM_USRLIB		= 25,
	PARAM_BYTEORDER		= 26,
};

enum ETTSCON_PARAM_VALUE_TYPE
{
	VALUE_INVALID		= 0, 
	VALUE_VACANT		= 1, // parameter doesn't have value
	VALUE_NUMERIC		= 2, // the value of parameter is numeric
	VALUE_NONNUMERIC	= 3  // the value of parameter isn't numeric
};

const struct PARAMLIST {
	const char* name;			      // name of parameter
	ETTSCON_PARAM_TYPE	type;		  // type of parameter
	ETTSCON_PARAM_VALUE_TYPE value;   // type of parameter's value
	const char* tip;				  // explanation of parameter
} param_list[] = {
		"-m",		  PARAM_MODE,		VALUE_NUMERIC,   "Set synthesize mode",
		"-mode",	  PARAM_MODE,		VALUE_NUMERIC,   "Set synthesize mode",

		"-i",		  PARAM_VID,        VALUE_NUMERIC,    "Set current voice token ID(VID)",
		"-vid",		  PARAM_VID,		VALUE_NUMERIC,    "Set current voice token ID(VID)",

		"-c",		  PARAM_CODEPAGE,   VALUE_NUMERIC,    "Set current Chinese code page type",
		"-cp",		  PARAM_CODEPAGE,   VALUE_NUMERIC,    "Set current Chinese code page type",
		"-codepage",  PARAM_CODEPAGE,   VALUE_NUMERIC,    "Set current Chinese code page type",

		"-f",		  PARAM_AUDIOFMT,   VALUE_NUMERIC,    "Set current audio data format",
		"-adf",		  PARAM_AUDIOFMT,   VALUE_NUMERIC,    "Set current audio data format",
		"-audiofmt",  PARAM_AUDIOFMT,   VALUE_NUMERIC,    "Set current audio data format",

		"-d",		  PARAM_SPEED,	    VALUE_NUMERIC,    "Set current speed value",
		"-speed",	  PARAM_SPEED,	    VALUE_NUMERIC,    "Set current speed value",

		"-v",		  PARAM_VOLUMN,	    VALUE_NUMERIC,    "Set current volume of output voice",
		"-volumn",	  PARAM_VOLUMN,	    VALUE_NUMERIC,    "Set current volume of output voice",

		"-p",		  PARAM_PITCH,	    VALUE_NUMERIC,    "Set current pitch of output voice",
		"-pitch",	  PARAM_PITCH,	    VALUE_NUMERIC,    "Set current pitch of output voice",

		"-b",		  PARAM_ENTER,	    VALUE_NUMERIC,    "Set treatment of <enter> char when spliting sentence",
		"-enter",	  PARAM_ENTER,	    VALUE_NUMERIC,    "Set treatment of <enter> char when spliting sentence",

		"-l",		  PARAM_LENGTH,	    VALUE_NUMERIC,    "Set maximal length of the split sentence",
		"-len",		  PARAM_LENGTH,	    VALUE_NUMERIC,    "Set maximal length of the split sentence",
		"-length",	  PARAM_LENGTH,	    VALUE_NUMERIC,    "Set maximal length of the split sentence",

		"-k",		  PARAM_MARKS,	    VALUE_NUMERIC,    "Set whether to read all marks or not",
		"-marks",	  PARAM_MARKS,	    VALUE_NUMERIC,    "Set whether to read all marks or not",

		"-n",		  PARAM_NUMBER,	    VALUE_NUMERIC,    "Set how to pronounce numeric string",
		"-number",	  PARAM_NUMBER,	    VALUE_NUMERIC,    "Set how to pronounce numeric string",

		"-e",		  PARAM_ENGLISH,	VALUE_NUMERIC,    "Set How to pronounce English (letter or word) ",
		"-english",	  PARAM_ENGLISH,	VALUE_NUMERIC,    "Set How to pronounce English (letter or word) ",

		"-s",		  PARAM_BGS,		VALUE_NUMERIC,    "Set to choose which BGS can be used",
		"-bgs",		  PARAM_BGS,		VALUE_NUMERIC,    "Set to choose which BGS can be used",

		"-u",		  PARAM_VPT,		VALUE_NUMERIC,    "Set whether to enable VPT or not",
		"-vpt",		  PARAM_VPT,		VALUE_NUMERIC,    "Set whether to enable VPT or not",

		"-o",		  PARAM_RAW,		VALUE_NUMERIC,    "Set output audio data type,WINDOWS PCM or PCM Raw data",
		"-raw",		  PARAM_RAW,		VALUE_NUMERIC,    "Set output audio data type,WINDOWS PCM or PCM Raw data",

		"-r",		  PARAM_IP,			VALUE_NONNUMERIC, "Set Remote TTSServer IP",
		"-ip",		  PARAM_IP,			VALUE_NONNUMERIC, "Set Remote TTSServer IP",
										 
		"-y",		  PARAM_Y,		    VALUE_VACANT,     "Overwrite file without prompt",
										 
		"-lib",		  PARAM_LIBRARY,	VALUE_NONNUMERIC, "Set library of Iflytek to load",
		"-library",	  PARAM_LIBRARY,    VALUE_NONNUMERIC, "Set library of Iflytek to load",

		"-t",		  PARAM_BYTEORDER,	VALUE_NUMERIC,	  "Set byteorder,2 for sun/mach",
		"-byteorder", PARAM_BYTEORDER,	VALUE_NUMERIC,	  "Set byteorder,2 for sun/mach",		
		//??intp50??linux?汾????ʱ??????????????ȥ????
		//Deleted by hyxiong, 2006-12-3 10:43:44
		/*"-rounds",	  PARAM_ROUNDS,	    VALUE_NUMERIC,    "Set times of synthesization",
										 
		"-asynconn",  PARAM_ASYNCONN,	VALUE_VACANT,	  "Set asynchronous connection",
										 
		"-asyndiscon",PARAM_ASYNDISCON, VALUE_VACANT,     "Set asynchronous disconnection",
										 
		"-filter",	  PARAM_FILTER,	    VALUE_NONNUMERIC, "Set TTS Service sign",

		"-ahf",		  PARAM_AHF,		VALUE_NUMERIC,    "Set audio head format",

		"-connstr",	  PARAM_CONNSTR,	VALUE_NONNUMERIC, "Set connect string",*/
		//Deleted End by hyxiong

		"-usrlib",	  PARAM_USRLIB,		VALUE_NONNUMERIC, "Set user's library to load",
};

inline bool IsLittleEndian( )
{
	TTSDWORD dwTestValue = 0xFF000000;
	return *((char*)(&dwTestValue))==0;
}

#endif	// __TTS_CONSOLE_H__
