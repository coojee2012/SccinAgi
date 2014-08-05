#!/bin/bash
#
# 四川建设网NAGI启动脚本
# ScriptAuthor: 林勇
# Revision 1.0 - 14th Sep 2013
#====================================================================
# Run level information:
# chkconfig: 2345 99 99
# Description: 四川建设网呼叫中心交换系统
# processname: nagi
# Author:林勇 <11366846@qq.com>;
# Run "/sbin/chkconfig --add nagi" to add the Run levels.
#====================================================================

#====================================================================
# 将该脚本放到下面的目录.
# mv nagi.sh /etc/init.d/nagi
# 添加自启动项
# chkconfig --add nagi
# 手动改变脚本权限
# chmod 033 /etc/init.d/nagi
# 维护命令：service nagi start|stop|restart
# Source function library
. /etc/rc.d/init.d/functions

# 检查网络是否启动.
#
[ ${NETWORKING} ="yes" ] || exit 0

# Daemon
NAME=nagi
DAEMON=/usr/local/bin/node

# Path to the configuration file.
#
DIR=/opt/NAGI
APP=/opt/NAGI/NAGI.js

#USER="nobody"
#GROUP="nobody"

# Take care of pidfile permissions
mkdir /var/run/$NAME 2>/dev/null || true
#chown "$USER:$GROUP" /var/run/$NAME

# Check the configuration file exists.
#
 if [ ! -f $APP ] ; then
 echo "The app file cannot be found!"
 exit 0
 fi

# Path to the lock file.
#
LOCK_FILE=/var/lock/subsys/nagi

# Path to the pid file.
#
PID=/var/run/$NAME/pid


#====================================================================

#====================================================================
# Run controls:

cd $DIR

RETVAL=0

# Start sccinweb as daemon.
#
start() {
if [ -f $LOCK_FILE ]; then
echo "$NAME is already running!"
exit 0
else
echo -n $"Starting ${NAME}: "
#daemon --check $DAEMON --user $USER "$DAEMON -f $PID -c $CONF > /dev/null"
daemon $DAEMON $APP >/dev/null &
fi

RETVAL=$?
[ $RETVAL -eq 0 ] && success
echo
[ $RETVAL -eq 0 ] && touch $LOCK_FILE
return $RETVAL
}


# Stop nagi.
#
stop() {
echo -n $"Shutting down ${NAME}: "
kill -9 $(ps -ef | grep $APP | grep -v grep | awk '{print $2}')
RETVAL=$?
[ $RETVAL -eq 0 ] && success
rm -f $LOCK_FILE
echo
return $RETVAL
}

# See how we were called.
case "$1" in
start)
start
;;
stop)
stop
;;
restart)
stop
start
;;
condrestart)
if [ -f $LOCK_FILE ]; then
stop
start
RETVAL=$?
fi
;;
status)
status $DAEMON
RETVAL=$?
;;
*)
echo $"Usage: $0 {start|stop|restart|condrestart|status}"
RETVAL=1
esac

exit $RETVAL