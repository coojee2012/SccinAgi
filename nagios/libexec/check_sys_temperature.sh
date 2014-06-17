#!/bin/sh
#########################################################################
#
# File:         check_sys_temperature.sh
# Description:  Nagios check plugins to check cpu/supply/MB temperature with mbmon or sensors in *nix.
# Language:     GNU Bourne-Again SHell
# Version:	1.0.4
# Date:		2010-7-29
# Corp.:	Chenlei
# Author:	chnl@163.com 
# WWW:		http://bbs.itnms.net
#########################################################################
# Bugs:
# The Latest Version will be released in http://bbs.itnms.net.
# You can send bugs to http://bbs.itnms.net,
# or email to me directly: chnl@163.com
#########################################################################
# Todo:
# Add function to check the fan speed in the next version.
#########################################################################
# ChangeLog:
# Version 1.0.4
# 2010-07-29
# Fix bugs with misspelling.
#
# Version 1.0.3
# 2008-04-22
# More friendly output when getting temperature info error.
#
# Version 1.0.2
# 2008-03-27
# Add the Performance Data output.
# Support the PNP Graphing tools.
#
# Version 1.0.1
# 2007-12-12
# unset LANG at begin of this scripts for sensors or mbmon output charset encoding error.
#
# Version 1.0
# 2007-12-11
#########################################################################
# Heh, just a ad here :), for my honey.
# http://shop35165045.taobao.com/
############################
#
# Exit values:
# ------------
#    0		OK
#    1		Warning
#    2		Cirital
#    3		Unknown
#    Others	Unknown
#
# ----------------------------------------------------------------------
# These are Parameters from external
# -v 
#	Verbose mode, to debug some messages out to the /tmp directory with log file name check_sys_temperature.$$.
#
# -m mbmon|sensors
#	sepicify the method to use the temperature data, mbmon or sensors	
#
# -w cput,MBt,supplyt
# -c cput,MBt,supplyt
# 	Set Warning and Critical Temperature


print_help_msg(){
	$Echo "Usage: $0 -h to get help."
}

print_full_help_msg(){
	$Echo "Usage:"
	$Echo "$0 [ -v ] -m mbmon|sensors -w cpuT,MBT,supplyT -c cpuT,MBT,supplyT" 
	$Echo "Sepicify the method to use the temperature data, mbmon or sensors."
	$Echo "And the corresponding Critical value must greater than Warning value."
	$Echo "Example:"
	$Echo "${0} -m mbmon -w 50,55,60 -c 55,60,65"
	$Echo "or"
	$Echo "${0} -m sensors -w 50,55,60 -c 55,60,65"
}

print_err_msg(){
	$Echo "Error."
	print_full_help_msg
}

check_record_cnt(){
	echo $2 | awk -F "$1" '{print NF}'
}

to_debug(){
if [ "$Debug" = "true" ]; then
	$Echo "$*" >> /tmp/check_sys_temperature.log.$$ 2>&1
fi
}

unset LANG

case "$(uname -s)"
	in
	SunOS)
	Echo="echo"
	;;
	Linux)
	Echo="echo -e"
	;;
	*)
	Echo="echo"
	;;
esac



if [ $# -lt 1 ]; then
	print_help_msg
	exit 3
else
	while getopts :vhm:w:c: OPTION
	do
		case $OPTION
			in
			v)
			#$Echo "Verbose mode."
			Debug=true
			;;
			m)
			method=$OPTARG
			;;
			w)
			WarningV=$OPTARG
			;;
			c)
			CriticalV=$OPTARG
			;;
			h)
			print_full_help_msg
			exit 3
			;;
			?)
			$Echo "Error: Illegal Option."
			print_help_msg
			exit 3
			;;
		esac
	done

	if [ "$method" = "mbmon" ] ; then
		use_mbmon="true"
		to_debug use_mbmon
	elif [ "$method" = "sensors" ]; then
		use_sensors="true"
		to_debug use_sensors
	else
		$Echo "Error. Must to sepcify the method to use, sensors or mbmon."
		print_full_help_msg
		exit 3
	fi

	to_debug All Values  are \" Warning: "$WarningV" and Critical: "$CriticalV" \".
	WVC=`check_record_cnt "," "$WarningV"`
	CVC=`check_record_cnt "," "$CriticalV"`
	to_debug WVC is $WVC and CVC is $CVC

	if [ $WVC -ne 3 -o $CVC -ne 3 ] ; then
		print_full_help_msg
		exit 3
	else
		W1=`echo $WarningV| awk -F "," '{print $1}'`
		W2=`echo $WarningV| awk -F "," '{print $2}'`
		W3=`echo $WarningV| awk -F "," '{print $3}'`
		to_debug Warning Value is $W1 $W2 $W3

		C1=`echo $CriticalV| awk -F "," '{print $1}'`
		C2=`echo $CriticalV| awk -F "," '{print $2}'`
		C3=`echo $CriticalV| awk -F "," '{print $3}'`
		to_debug Critical Value is $C1 $C2 $C3
		
		check_1=`echo "$C1 > $W1" | bc`
		check_2=`echo "$C2 > $W2" | bc`
		check_3=`echo "$C3 > $W3" | bc`
		to_debug check_1 is $check_1 , check_2 is $check_2 , check_3 is $check_3

		if [ $check_1 -ne 1 -o  $check_2 -ne 1  -o $check_3 -ne 1  ] ; then
			$Echo "Error, the corresponding Critical value must greater than Warning value."
			print_full_help_msg
			exit 3
		fi

	fi
fi

if [ "$use_mbmon" = "true" ]; then
##################################
# mbmon
# 
	mbmonCheckOut=`which mbmon 2>&1`
	if [ $? -ne 0 ];then
		echo $mbmonCheckOut
		echo Maybe you can use the sensors to collect the temperature data.
		exit 3
	fi
	to_debug Use $mbmonCheckOut to check system temperature

	_result=`mbmon -c 1 3 |grep -v ^$ |head -n 1| sed 's/ //g'`
	to_debug mbmon check result is  $_result
	if [ -z "$_result" ] ; then
		$Echo "No Data been get here. Please confirm your ARGS and re-check it with Verbose mode, then to check the log."
		exit 3
	fi

	temperature=`echo $_result|awk -F ";" '{print $1}'| awk -F "=" '{print $2}'`
	to_debug temperature data is $termperature

elif [ "$use_sensors" = "true" ]; then

##################################
# lm-sensors
# 
	sensorsCheckOut=`which sensors 2>&1`
	if [ $? -ne 0 ];then
		echo $sensorsCheckOut
		echo Maybe you can use the mbmon to collect the temperature data.
		exit 3
	fi
	to_debug Use $sensorsCheckOut to check system temperature

	_temperature=`sensors | grep 'temp' | sort | uniq   -w 5  | awk '{print $2}' | sed 's/+//g' | xargs echo|tr -s ' '|sed 's/ /,/g'`
	_fan=`sensors | grep 'fan' | sort | uniq   -w 5  | awk '{print $2}' | sed 's/+//g' | xargs echo|tr -s ' '|sed 's/ /,/g'`
	if [ -z "$_temperature"  -o -z "$_fan" ] ; then
		$Echo "No Data been get here. Please confirm your ARGS and re-check it with Verbose mode, then to check the log."
		exit 3
	fi
	_result="Temp.=${temperature};Rot.=${_fan}"
	to_debug mbmon check result is  $_result
	to_debug temperature data is $termperature
##################################
else
	$Echo "Error. Must to sepcify the method to use, sensors or mbmon."
	print_full_help_msg
	exit 3
fi


t1=`echo $_temperature| awk -F "," '{print $1}'`
t2=`echo $_temperature| awk -F "," '{print $2}'`
t3=`echo $_temperature| awk -F "," '{print $3}'`
to_debug cpuT is $t1 ,MBT is $t2 ,supplyT is $t3


#if [ -z "$t3"  -o  -z "$t2"  -o -z "$t3"  -o  ]; then
#	echo "No Value. Please to check the log file /tmp/check_sys_temperature.log.$$"
#	exit 3
#fi

check_w1=`echo "$t1 < $W1" | bc`
check_w2=`echo "$t2 < $W2" | bc`
check_w3=`echo "$t3 < $W3" | bc`
to_debug check_w1 is $check_w1 , check_w2 is $check_w2 , check_w3 is $check_w3

check_c1=`echo "$t1 < $C1" | bc`
check_c2=`echo "$t2 < $C2" | bc`
check_c3=`echo "$t3 < $C3" | bc`
to_debug check_c1 is $check_c1 , check_c2 is $check_c2 , check_c3 is $check_c3


if [ $check_w1 -eq 1 -a $check_w2 -eq 1  -a $check_w3 -eq 1  ] ; then
	Severity="0";
	Msg="OK";
	to_debug Severity is $Severity , Msg is $Msg 
elif [ $check_c1 -eq 1 -a $check_c2 -eq 1  -a $check_c3 -eq 1 ] ; then
	Severity="1";
	Msg="Warning";
	to_debug Severity is $Severity , Msg is $Msg 
else
	Severity="2";
	Msg="Critical";
	to_debug Severity is $Severity , Msg is $Msg 
fi

#echo "$Msg" "-" The Temperature is "$_temperature" \|${_result}
echo "$Msg" "-" The Temperature is "$_temperature" \|CPU=$t1\;$W1\;$C1\;0\;0 MB=$t2\;$W2\;$C2\;0\;0 SUP=$t3\;$W3\;$C3\;0\;0
exit $Severity

# End of check_sys_temperature.sh
