/**
 * @file    iFly_SEM.h
 * @brief   iFLY SEM SDK header file
 *
 * This file contains the SEM application programming interface(API) declarations
 * of iFLYTEK. SEM developer can include this file in your project to build applications.
 * For more information, please read the developer guide.
 * Copyright (C)    1999 - 2004 by ANHUI USTC IFLYTEK. Co.,LTD.
 *                  All rights reserved.
 * 
 * @author    Speech Dept. iFLYTEK.
 * @version   1.0
 * @date      2004/5/9
 *
 * @see       
 * 
 * @par History:
 * <table border=1>
 *  <tr> <index> <th>version  <th>date       <th>author  <th>notes             </tr>
 *  <tr> <0>     <td>1.0      <td>2004/05/09 <td>hjye    <td>Create this file  </tr>
 * </table>
 */

#ifndef IFLY_SEM_H
#define IFLY_SEM_H

#include "iFly_TTS.h"


#ifdef __cplusplus
extern "C" {
#endif

/*
 * Basic Data Types
 */

typedef void*               HSEMHANDLE;


/*
 * SEM common defines
 */

#define SEM_DATESTR_LEN_MAX                 20
#define SEM_ENGINENAME_LEN_MAX              64
#define SEM_VOICENAME_LEN_MAX               32
#define SEM_VOICE_LANG_MAX                  16
#define SEM_SAMPLERATE_MAX                   8


/* Instance status */
enum
{
    SEM_INST_STATUS_UNKN,                       /* Unknown status */
    SEM_INST_STATUS_CONNECT,                    /* Connecting */
    SEM_INST_STATUS_DISCONNECT,                 /* Disconnecting */
    SEM_INST_STATUS_RECV,                       /* Receiving data */
    SEM_INST_STATUS_SEND,                       /* Sending data */
    SEM_INST_STATUS_SYNTH,                      /* Synthesizing */
    SEM_INST_STATUS_IDLE,                       /* Idle */
};

/* Engine status */
enum
{
    SEM_ENGINE_STATUS_UNKN          = 0x0000,   /* Unknown state */
    SEM_ENGINE_STATUS_LOAD          = 0x0001,   /* Engine loaded */
    SEM_ENGINE_STATUS_UNLOAD        = 0x0002,   /* Engine unloaded */
    SEM_ENGINE_STATUS_DISABLE       = 0x8000,   /* Service disabled */
};

/* Speaker gender */
enum
{
    SEM_GENDER_UNKN,                            /* Unknown gender */
    SEM_GENDER_FEMALE,                          /* Female */
    SEM_GENDER_MALE,                            /* Male */
};

/* Speaker age */
enum
{
    SEM_AGE_UNKN,                               /* Unknown age */
    SEM_AGE_CHILD,                              /* Child */
    SEM_AGE_YOUTH,                              /* Youth */
    SEM_AGE_MIDDLEAGE,                          /* Middle age */
    SEM_AGE_AGEDNESS,                           /* Agedness */
};

/* Information type of engine queried  */
enum
{
    /* Static engine informations */
    SEM_QUERY_EINFO_NAME            = 1,        /* [Str] Query engine name */
    SEM_QUERY_EINFO_VERSION,                    /* [Str] Query engine version */
    SEM_QUERY_EINFO_PRODUCER,                   /* [Str] Query producer name of engine */
    SEM_QUERY_EINFO_INSTPATH,                   /* [Str] Query engine install path */
    SEM_QUERY_EINFO_LICENSE,                    /* [DWORD] Query license of engine */
    SEM_QUERY_EINFO_STDEFFICENCY,               /* [DWORD] Query benchmark efficency of engine */
    SEM_QUERY_EINFO_CODEPAGE,                   /* [DWORD Array] Query input text codepage engine supported */
    SEM_QUERY_EINFO_MARKLANG,                   /* [DWORD Array] Query mark languages engine supported */
    SEM_QUERY_EINFO_USERLIB,                    /* [String] Query user library engine supported */

    /* Dynamic engine informations */
    SEM_QUERY_EINFO_STATUS          = 20,       /* [DWORD] Query engine status */
    SEM_QUERY_EINFO_TOTALSVC,                   /* [DWORD] Query total service count since startup */
    SEM_QUERY_EINFO_TOTALERR,                   /* [DWORD] Query total error count since startup */
    SEM_QUERY_EINFO_TOTALRECV,                  /* [double] Query total received bytes since startup */
    SEM_QUERY_EINFO_TOTALSEND,                  /* [double] Query total sent bytes since startup */
    SEM_QUERY_EINFO_TOTALEFF,                   /* [DWORD] Query total efficency of engine since startup */
	SEM_QUERY_EINFO_ACTINSTINFO,                /* [TInstInfo Array] Query active instances of engine */
};

/* Engine control command */
enum
{
    SEM_ENGINE_CTRL_LOAD            = 1,        /* Load engine */
    SEM_ENGINE_CTRL_UNLOAD,                     /* Unload engine */
    SEM_ENGINE_CTRL_ENABLE,                     /* Enable engine */
    SEM_ENGINE_CTRL_DISABLE,                    /* Disable engine */
};

/* Engine UNLOAD command flag */
enum
{
    SEM_ECTRL_UNLOAD_FORCE          = 0x0001,   /* Unload regardless there have any active instance */
};

/*
 * SEM Data Structures
 */

#pragma pack(2)

/* Instance information structure */
typedef struct
{
    TTSDWORD        cbSize;                     /* [in] Size of structure */
    TTSDWORD        dwInstID;                   /* [out] Instance handle (Service ID) */
    TTSDWORD        dwErrorCode;                /* [out] Current error code of instance */
    TTSDWORD        dwErrorCount;               /* [out] Count of instance error occurred */
    TTSDWORD        dwInstStatus;               /* [out] Current instance status */
    TTSDWORD        dwClientIP;                 /* [out] Instance client address (Network order) */
    TTSCHAR         szStartTime[SEM_DATESTR_LEN_MAX];   /* [out] Instance start time */
    double          dbRecvBytes;                /* [out] Instance total received bytes */
    double          dbSendBytes;                /* [out] Instance total sent bytes */
    TTSDWORD        dwEfficency;                /* [out] Instance current synthesis efficency */
    TTSDWORD        dwReserved;                 /* [in/out] Reserved: must set to zero */
} TInstInfo, *PTInstInfo;

/* Voice information structure */
typedef struct
{
    TTSDWORD        cbSize;                     /* [in] Size of structure */
    TTSDWORD        dwVoiceID;                  /* [out] Voice ID unique in the scope of engine */
	TTSDWORD        dwGender;                   /* [out] Gender of speaker */
	TTSDWORD        dwAge;                      /* [out] Age of speaker */
	TTSCHAR         szVoiceName[SEM_VOICENAME_LEN_MAX];     /* [out] Voice description string */
	TTSDWORD		dwLangCount;                /* [out] Count of languages */
    TTSDWORD        arrLanguage[SEM_VOICE_LANG_MAX];        /* [out] Language identifier */
	TTSDWORD        arrLangScore[SEM_VOICE_LANG_MAX];       /* [out] Language scores */
	TTSDWORD        dwSRCount;                  /* [out] Count of sample rates */
    TTSDWORD        arrSampleRate[SEM_SAMPLERATE_MAX];      /* [out] Voice Sample rate array: 6k, 8k, 11k, 16k, ... */
    TTSDWORD        dwEngineID;                 /* [out] ID of the engine which this voice belong to */
    TTSDWORD        dwReserved;                 /* [in/out] Reserved: must set to zero */
} TVoiceInfo, *PTVoiceInfo;

/* Filters mask used in FIND ENGINE operator */
enum
{
    SEM_EFIND_FILTER_VOICENAME      = 0x0001,
	SEM_EFIND_FILTER_IPADDR			= 0x0002,
    SEM_EFIND_FILTER_LANGUAGE       = 0x0004,
    SEM_EFIND_FILTER_GENDER         = 0x0008,
    SEM_EFIND_FILTER_AGE            = 0x0010,
    SEM_EFIND_FILTER_SAMPLERATE     = 0x0020,

    SEM_EFIND_FILTER_STATUS         = 0x0040,
    SEM_EFIND_FILTER_ENGINENAME     = 0x0080,
};

/* Filters structure used in FIND ENGINE operator */
typedef struct
{
    TTSDWORD        cbSize;                     /* [in] Size of structure */
    TTSDWORD        dwFilterMask;               /* [in] Filter mask flag */
    TTSCHAR         szVoiceName[SEM_VOICENAME_LEN_MAX];     /* [in] Voice name, wildcard '*' and '?' available */
	TTSCHAR         szIP[TTS_IP_MAXLEN];		/* [in] Server IP address */
    TTSDWORD        dwLanguage;                 /* [in] Language ID */
    TTSDWORD        dwGender;                   /* [in] Speaker gender of voice */
    TTSDWORD        dwAge;                      /* [in] Speaker age of voice */
    TTSDWORD        dwSampleRate;               /* [in] Sample rate of voice */
    TTSDWORD        dwStatus;                   /* [in] Engine status */
    TTSCHAR         szEngineName[SEM_ENGINENAME_LEN_MAX];   /* [in] Engine name, wildcard '*' and '?' available */
    TTSDWORD        dwReserved;                 /* [in/out] Reserved: must set to zero */
} TEngineFindFilter, *PTEngineFindFilter;

/* Filters mask used in FIND VOICE operator */
enum
{
    SEM_VFIND_FILTER_VOICENAME      = 0x0001,
	SEM_VFIND_FILTER_IPADDR			= 0x0002,
    SEM_VFIND_FILTER_LANGUAGE       = 0x0004,
    SEM_VFIND_FILTER_GENDER         = 0x0008,
    SEM_VFIND_FILTER_AGE            = 0x0010,
    SEM_VFIND_FILTER_SAMPLERATE     = 0x0020,
};

/* Filters structure used in FIND VOICE operator */
typedef struct
{
    TTSDWORD        cbSize;                     /* [in] Size of structure */
    TTSDWORD        dwFilterMask;               /* [in] Filter mask flag */
    TTSCHAR         szVoiceName[SEM_VOICENAME_LEN_MAX];     /* [in] Voice name, wildcard '*' and '?' available */
	TTSCHAR         szIP[TTS_IP_MAXLEN];		/* [in] Server IP address */
    TTSDWORD        dwLanguage;                 /* [in] Language ID */
    TTSDWORD        dwGender;                   /* [in] Speaker gender of voice */
    TTSDWORD        dwAge;                      /* [in] Speaker age of voice */
    TTSDWORD        dwSampleRate;               /* [in] Sample rate of voice */
    TTSDWORD        dwReserved;                 /* [in/out] Reserved: must set to zero */
} TVoiceFindFilter, *PTVoiceFindFilter;

#pragma pack()


/*==========================================================================
    Declaration of SEM Interface Functions
 ==========================================================================*/

/** 
 * @brief   SEMFindFirstEngine
 *
 * Find the first engine with specific filters
 *
 * @return  TTSRETVAL - Return 0 in success, otherwise return error code.
 * @param   PTEngineFindFilter pFindFilter - [in] Pointer to the filters structure, or NULL if no filter is specified
 * @param   TTSDWORD *pdwEngineID          - [out] Pointer on a TTSDWORD that will receive the ID of the engine found
 * @param   HSEMHANDLE *phFindHandle       - [out] Pointer on a search handle to be used in subsequent calls to SEMFindNextEngine
 * @see     SEMFindNextEngine, SEMFindClose
 */
TTSRETVAL TTSLIBAPI SEMFindFirstEngine(PTEngineFindFilter pFindFilter, TTSDWORD *pdwEngineID, HSEMHANDLE *phFindHandle);
typedef TTSRETVAL (*Proc_SEMFindFirstEngine)(PTEngineFindFilter pFindFilter, TTSDWORD *pdwEngineID, HSEMHANDLE *phFindHandle);

/** 
 * @brief   SEMFindNextEngine
 * 
 * Find the next engine with filters specified in the FindFirstEngine call
 *
 * @return  TTSRETVAL - Return 0 in success, otherwise return error code.
 * @param   HSEMHANDLE hFindHandle - [in] Handle obtained by a call to SEMFindFirstEngine
 * @param   TTSDWORD *dwEngindID   - [out] Pointer on a TTSDWORD that will receive the ID of the engine found
 * @see     SEMFindFirstEngine, SEMFindClose
 */
TTSRETVAL TTSLIBAPI SEMFindNextEngine(HSEMHANDLE hFindHandle, TTSDWORD *dwEngineID);
typedef TTSRETVAL (*Proc_SEMFindNextEngine)(HSEMHANDLE hFindHandle, TTSDWORD *dwEngineID);

/** 
 * @brief   SEMFindFirstVoice
 *
 * Find the first voice with specific filters
 *
 * @return  TTSRETVAL - Return 0 in success, otherwise return error code.
 * @param   TTSDWORD dwEngineID           - [in] The ID of the engine will be searched or 0 means to search in all engines
 * @param   PTVoiceFindFilter pFindFilter - [in] Pointer to the filters structure, or NULL if no filter is specified
 * @param   PTVoiceInfo pVoiceInfo        - [out] Pointer to the TVoiceInfo structure that will receive the information about the voice found
 * @param   HSEMHANDLE *phFindHandle      - [out] Pointer on a search handle to be used in subsequent calls to SEMFindNextVoice
 * @see     SEMFindNextVoice, SEMFindClose
 */
TTSRETVAL TTSLIBAPI SEMFindFirstVoice(TTSDWORD dwEngineID, PTVoiceFindFilter pFindFilter, PTVoiceInfo pVoiceInfo, HSEMHANDLE *phFindHandle);
typedef TTSRETVAL (*Proc_SEMFindFirstVoice)(TTSDWORD dwEngineID, PTVoiceFindFilter pFindFilter, PTVoiceInfo pVoiceInfo, HSEMHANDLE *phFindHandle);

/** 
 * @brief   SEMFindNextVoice
 * 
 * Find the next voice with filters specified in the FindFirstVoice call
 *
 * @return  TTSRETVAL - Return 0 in success, otherwise return error code.
 * @param   HSEMHANDLE hFindHandle - [in] Handle obtained by a call to SEMFindFirstVoice
 * @param   PTVoiceInfo pVoiceInfo - [out] Pointer to the TVoiceInfo structure that will receive the information about the voice found
 * @see     SEMFindFirstVoice, SEMFindClose
 */
TTSRETVAL TTSLIBAPI SEMFindNextVoice(HSEMHANDLE hFindHandle, PTVoiceInfo pVoiceInfo);
typedef TTSRETVAL (*Proc_SEMFindNextVoice)(HSEMHANDLE hFindHandle, PTVoiceInfo pVoiceInfo);

/** 
 * @brief    SEMFindClose
 * 
 * This function closes the search handle used to find a engine or a voice
 * 
 * @return  TTSRETVAL - Return 0 in success, otherwise return error code.
 * @param   HSEMHANDLE hFindHandle - [in] Handle obtained by a call to SEMFindFirstEngine or SEMFindFirstVoice
 * @see     SEMFindFirstEngine, SEMFindFirstVoice
 */
TTSRETVAL TTSLIBAPI SEMFindClose(HSEMHANDLE hFindHandle);
typedef TTSRETVAL (*Proc_SEMFindClose)(HSEMHANDLE hFindHandle);

/** 
 * @brief   SEMGetEngineInfo
 * 
 * Get specific information about an engine
 *
 * @return  TTSRETVAL - Return 0 in success, otherwise return error code.
 * @param   TTSDWORD dwEngineID - [in] The ID of the engine
 * @param   TTSDWORD dwInfoType - [in] The type of the information to be got
 * @param   PTTSVOID pBuffer    - [in/out] The buffer to return the information required
 * @param   TTSWORD *pdwBufLen  - [in/out] The buffer length/unit[in] or wrote bytes/unit[out], according to dwInfoType
 * @see     
 */
TTSRETVAL TTSLIBAPI SEMGetEngineInfo(TTSDWORD dwEngineID, TTSDWORD dwInfoType, PTTSVOID pBuffer, TTSDWORD *pdwBufLen);
typedef TTSRETVAL (*Proc_SEMGetEngineInfo)(TTSDWORD dwEngineID, TTSDWORD dwInfoType, PTTSVOID pBuffer, TTSDWORD *pdwBufLen);

/** 
 * @brief    SEMEngineCtrl
 * 
 * Control a remote or local engine to do some work
 * 
 * @return    TTSRETVAL - Return 0 in success, otherwise return error code.
 * @param     TTSDWORD dwEngineID - [in] The ID of the engine
 * @param     TTSDWORD dwCommand  - [in] The control command
 * @param     TTSDWORD wParam     - [in/out] The first parameter of the command
 * @param     TTSDWORD lParam     - [in/out] The second parameter of the command
 * @see       
 */
TTSRETVAL TTSLIBAPI SEMEngineCtrl(TTSDWORD dwEngineID, TTSDWORD dwCommand, TTSDWORD wParam, TTSDWORD lParam);
typedef TTSRETVAL (*Proc_SEMEngineCtrl)(TTSDWORD dwEngineID, TTSDWORD dwCommand, TTSDWORD wParam, TTSDWORD lParam);


#ifdef __cplusplus
}    /* extern "C" */
#endif

#endif    /* IFLY_SEM_H */
