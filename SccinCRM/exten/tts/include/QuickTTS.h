/**
 * @file      QuickTTS.h
 * @brief     declare QuickTTS functions
 *
 * Declare QuickTTS speech synthesis functions
 * Copyright (C)    2004 - 2007 by ANHUI USTC IFLYTEK. Co.,LTD.
 *                   All rights reserved.
 *
 * @author    iFLYTEK
 * @version   1.0
 * @date      2007-4-2
 *
 * @see
 *
 * @par history£º
 * <table border=1>
 *  <tr> <th>version   <th>date         <th>author   <th>note   </tr>
 *  <tr> <td>1.0       <td>2007/4/2    <td>iFLYTEK  <td>create </tr>
 * </table>
 */
#ifndef _QUICKTTS_H_
#define _QUICKTTS_H_

#ifdef __cplusplus
extern "C" {
#endif

/* define WINAPI */
#ifndef WINAPI
#define WINAPI __stdcall
#endif /* WINAPI */

/**
 * @brief   QuickTTSSynth
 *
 * QuickTTSSynth function convert text (file) to audio file
 *
 * @author  iFLYTEK
 * @return  long - Return 0 in success, otherwise return error code.
 * @param   const char* szText            - [in] Text or text file need to be synthesized
 * @param   bool bTextFile                - [in] Text or text file, true is text file
 * @param   const char* szVoiceFile       - [in] output audio file name
 * @param   const char* szServerIP        - [in] TTS Server IP
 * @param   const char* szServiceUID      - [in] TTS Service sign, format as:
                                                                  "ename="intp40/ce30/..." QoS="high/normal/low"" or "lang="0x804" QoS="...""
 * @param   const char* szConnectStr      - [in] Connect string to specify instance feature, format as:"4=3 6=1 17=2 ..."
 * @see
*/
long WINAPI QuickTTSSynth(const char* szText,
                          bool bTextFile,
                          const char* szVoiceFile,
                          const char* szServerIP,
                          const char* szServiceUID,
                          const char* szConnectStr
                          );

typedef long (WINAPI *Proc_QuickTTSSynth)(const char* szText,
                                          bool bTextFile,
                                          const char* szVoiceFile,
                                          const char* szServerIP,
                                          const char* szServiceUID,
                                          const char* szConnectStr
                                          );

/**
 * @brief   QuickTTSSynthW
 *
 * QuickTTSSynthW function convert text (file) to audio file (WChar Edition)
 *
 * @author  iFLYTEK
 * @return  long - Return 0 in success, otherwise return error code.
 * @param   const wchar_t* szText         - [in] Text or text file need to be synthesized
 * @param   bool bTextFile                - [in] Text or text file, true is text file
 * @param   const wchar_t* szVoiceFile    - [in] output audio file name
 * @param   const wchar_t* szServerIP     - [in] TTS Server IP
 * @param   const wchar_t* szServiceUID   - [in] TTS Service sign, format as:
                                                                  "ename="intp40/ce30/..." QoS="high/normal/low"" or "lang="0x804" QoS="...""
 * @param   const wchar_t* szConnectStr   - [in] Connect string to specify instance feature, format as:"4=3 6=1 17=2 ..."
 * @see
*/
long WINAPI QuickTTSSynthW(const wchar_t* szText,
                           bool bTextFile,
                           const wchar_t* szVoiceFile,
                           const wchar_t* szServerIP,
                           const wchar_t* szServiceUID,
                           const wchar_t* szConnectStr
                           );

typedef long (WINAPI *Proc_QuickTTSSynthW)(const wchar_t* szText,
                                           bool bTextFile,
                                           const wchar_t* szVoiceFile,
                                           const wchar_t* szServerIP,
                                           const wchar_t* szServiceUID,
                                           const wchar_t* szConnectStr
                                           );

#ifdef __cplusplus
};//extern "C" {
#endif

#endif // _QUICKTTS_H_
