-- MySQL dump 10.13  Distrib 5.5.28, for Linux (i686)
--
-- Host: localhost    Database: autodial
-- ------------------------------------------------------
-- Server version	5.5.28-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `KeyType`
--

DROP TABLE IF EXISTS `KeyType`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `KeyType` (
  `id` varchar(100) NOT NULL,
  `keyTypeID` varchar(50) DEFAULT NULL,
  `KeyTypeName` varchar(50) DEFAULT NULL,
  `State` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `crmCallLog`
--

DROP TABLE IF EXISTS `crmCallLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crmCallLog` (
  `id` varchar(100) NOT NULL,
  `Phone` varchar(50) DEFAULT NULL,
  `WorkTime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `crmCallPhone`
--

DROP TABLE IF EXISTS `crmCallPhone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crmCallPhone` (
  `id` varchar(100) NOT NULL,
  `callRecordsID` varchar(50) DEFAULT NULL,
  `Phone` varchar(50) DEFAULT NULL,
  `State` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `crmCallRecords`
--

DROP TABLE IF EXISTS `crmCallRecords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crmCallRecords` (
  `id` varchar(100) NOT NULL,
  `CallInfoID` varchar(50) DEFAULT NULL,
  `CallState` int(11) DEFAULT NULL,
  `WorkTime` varchar(50) DEFAULT NULL,
  `ProjMoveID` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `crmDialResult`
--

DROP TABLE IF EXISTS `crmDialResult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crmDialResult` (
  `id` varchar(100) NOT NULL,
  `CallInfoID` varchar(50) DEFAULT NULL,
  `Result` int(11) DEFAULT NULL,
  `State` int(11) DEFAULT NULL,
  `WorkTime` varchar(50) DEFAULT NULL,
  `UnixTime` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `crmUserKeysRecord`
--

DROP TABLE IF EXISTS `crmUserKeysRecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crmUserKeysRecord` (
  `id` varchar(100) NOT NULL,
  `callLogID` varchar(50) DEFAULT NULL,
  `Key` varchar(50) DEFAULT NULL,
  `WorkTime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `crmVoiceContent`
--

DROP TABLE IF EXISTS `crmVoiceContent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `crmVoiceContent` (
  `id` varchar(100) NOT NULL,
  `State` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `manageDepartments`
--

DROP TABLE IF EXISTS `manageDepartments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `manageDepartments` (
  `id` varchar(100) NOT NULL,
  `depName` varchar(50) DEFAULT NULL,
  `crtTime` varchar(50) DEFAULT NULL,
  `lastModify` varchar(50) DEFAULT NULL,
  `memo` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `manageMenmuGroup`
--

DROP TABLE IF EXISTS `manageMenmuGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `manageMenmuGroup` (
  `id` varchar(100) NOT NULL,
  `groupName` varchar(50) DEFAULT NULL,
  `crtTime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `crtTime` (`crtTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `manageMenmuRoleRelations`
--

DROP TABLE IF EXISTS `manageMenmuRoleRelations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `manageMenmuRoleRelations` (
  `id` varchar(100) NOT NULL,
  `roleId` varchar(100) DEFAULT NULL,
  `menmuID` varchar(100) DEFAULT NULL,
  `crtTime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `manageMenmus`
--

DROP TABLE IF EXISTS `manageMenmus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `manageMenmus` (
  `id` varchar(100) NOT NULL,
  `menName` varchar(50) DEFAULT NULL,
  `menURL` varchar(150) DEFAULT NULL,
  `iconName` varchar(150) DEFAULT NULL,
  `mgID` varchar(100) DEFAULT NULL,
  `crtTime` varchar(50) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `ordernum` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `manageUserInfo`
--

DROP TABLE IF EXISTS `manageUserInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `manageUserInfo` (
  `id` varchar(100) NOT NULL,
  `uName` varchar(50) DEFAULT NULL,
  `uCard` varchar(100) DEFAULT NULL,
  `uSex` varchar(10) DEFAULT NULL,
  `uLogin` varchar(50) DEFAULT NULL,
  `uPass` varchar(100) DEFAULT NULL,
  `uPhone` varchar(50) DEFAULT NULL,
  `uWorkNum` varchar(50) DEFAULT NULL,
  `uExten` varchar(10) DEFAULT NULL,
  `uAddr` varchar(200) DEFAULT NULL,
  `readOnly` varchar(10) DEFAULT NULL,
  `roleId` varchar(100) DEFAULT NULL,
  `depId` varchar(100) DEFAULT NULL,
  `uMemo` varchar(50) DEFAULT NULL,
  `crtTime` varchar(50) DEFAULT NULL,
  `lastChangeTime` varchar(50) DEFAULT NULL,
  `lastLoginTime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `manageUserRole`
--

DROP TABLE IF EXISTS `manageUserRole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `manageUserRole` (
  `id` varchar(100) NOT NULL,
  `roleName` varchar(50) DEFAULT NULL,
  `isAgent` varchar(10) DEFAULT NULL,
  `hasPtions` int(11) DEFAULT NULL,
  `crtTime` varchar(50) DEFAULT NULL,
  `lastModify` varchar(50) DEFAULT NULL,
  `memo` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxAutoMonitorWays`
--

DROP TABLE IF EXISTS `pbxAutoMonitorWays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxAutoMonitorWays` (
  `id` int(11) NOT NULL,
  `wayName` varchar(50) DEFAULT NULL,
  `recordout` varchar(10) DEFAULT NULL,
  `recordin` varchar(10) DEFAULT NULL,
  `recordqueue` varchar(10) DEFAULT NULL,
  `keepfortype` varchar(10) DEFAULT NULL,
  `keepforargs` int(11) DEFAULT NULL,
  `members` varchar(50) DEFAULT NULL,
  `cretime` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxBlacList`
--

DROP TABLE IF EXISTS `pbxBlacList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxBlacList` (
  `id` varchar(100) NOT NULL,
  `memo` varchar(50) DEFAULT NULL,
  `cretime` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxBlackList`
--

DROP TABLE IF EXISTS `pbxBlackList`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxBlackList` (
  `id` varchar(100) NOT NULL,
  `memo` varchar(50) DEFAULT NULL,
  `cretime` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxCallProcees`
--

DROP TABLE IF EXISTS `pbxCallProcees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxCallProcees` (
  `id` varchar(100) NOT NULL,
  `callsession` varchar(100) DEFAULT NULL,
  `callernumber` varchar(50) DEFAULT NULL,
  `callednumber` varchar(50) DEFAULT NULL,
  `processname` varchar(50) DEFAULT NULL,
  `passargs` varchar(100) DEFAULT NULL,
  `doneresults` varchar(50) DEFAULT NULL,
  `routerline` varchar(10) DEFAULT NULL,
  `cretime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxCard`
--

DROP TABLE IF EXISTS `pbxCard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxCard` (
  `id` varchar(100) NOT NULL,
  `cardname` varchar(50) DEFAULT NULL,
  `driver` varchar(50) DEFAULT NULL,
  `line` int(11) DEFAULT NULL,
  `group` varchar(10) DEFAULT NULL,
  `dataline` varchar(10) DEFAULT NULL,
  `trunkproto` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxCdr`
--

DROP TABLE IF EXISTS `pbxCdr`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxCdr` (
  `id` varchar(100) NOT NULL,
  `caller` varchar(50) DEFAULT NULL,
  `called` varchar(50) DEFAULT NULL,
  `accountcode` varchar(50) DEFAULT NULL,
  `srcchannel` varchar(100) DEFAULT NULL,
  `deschannel` varchar(100) DEFAULT NULL,
  `uniqueid` varchar(50) DEFAULT NULL,
  `threadid` varchar(50) DEFAULT NULL,
  `context` varchar(50) DEFAULT NULL,
  `agitype` varchar(20) DEFAULT NULL,
  `alive` varchar(10) DEFAULT NULL,
  `startime` varchar(100) DEFAULT NULL,
  `lastapptime` varchar(100) DEFAULT NULL,
  `endtime` varchar(100) DEFAULT NULL,
  `routerline` varchar(10) DEFAULT NULL,
  `lastapp` varchar(50) DEFAULT NULL,
  `answerstatus` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxConference`
--

DROP TABLE IF EXISTS `pbxConference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxConference` (
  `id` varchar(100) NOT NULL,
  `pincode` varchar(50) DEFAULT NULL,
  `playwhenevent` int(11) DEFAULT NULL,
  `mohwhenonlyone` int(11) DEFAULT NULL,
  `cretime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxExtenGroup`
--

DROP TABLE IF EXISTS `pbxExtenGroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxExtenGroup` (
  `id` varchar(100) NOT NULL,
  `groupname` varchar(50) DEFAULT NULL,
  `memo` varchar(100) DEFAULT NULL,
  `cretime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxExtenGroupRelations`
--

DROP TABLE IF EXISTS `pbxExtenGroupRelations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxExtenGroupRelations` (
  `id` varchar(100) NOT NULL,
  `groupid` int(11) DEFAULT NULL,
  `extenid` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxExtension`
--

DROP TABLE IF EXISTS `pbxExtension`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxExtension` (
  `id` varchar(100) NOT NULL,
  `accountcode` varchar(50) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `deviceproto` varchar(50) DEFAULT NULL,
  `devicenumber` varchar(50) DEFAULT NULL,
  `devicestring` varchar(100) DEFAULT NULL,
  `fristchecked` int(11) DEFAULT NULL,
  `transfernumber` varchar(50) DEFAULT NULL,
  `dndinfo` varchar(10) DEFAULT NULL,
  `failed` varchar(50) DEFAULT NULL,
  `cretime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxIvrActMode`
--

DROP TABLE IF EXISTS `pbxIvrActMode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxIvrActMode` (
  `id` varchar(100) NOT NULL,
  `modename` varchar(50) DEFAULT NULL,
  `iconame` varchar(50) DEFAULT NULL,
  `memo` varchar(200) DEFAULT NULL,
  `category` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxIvrActMode_copy`
--

DROP TABLE IF EXISTS `pbxIvrActMode_copy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxIvrActMode_copy` (
  `id` varchar(100) NOT NULL,
  `modename` varchar(50) DEFAULT NULL,
  `iconame` varchar(50) DEFAULT NULL,
  `memo` varchar(200) DEFAULT NULL,
  `category` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxIvrActions`
--

DROP TABLE IF EXISTS `pbxIvrActions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxIvrActions` (
  `id` varchar(100) NOT NULL,
  `ivrnumber` varchar(50) DEFAULT NULL,
  `ordinal` int(11) DEFAULT NULL,
  `actmode` varchar(50) DEFAULT NULL,
  `args` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxIvrInputs`
--

DROP TABLE IF EXISTS `pbxIvrInputs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxIvrInputs` (
  `id` varchar(100) NOT NULL,
  `ivrnumber` varchar(50) DEFAULT NULL,
  `general` int(11) DEFAULT NULL,
  `generaltype` varchar(50) DEFAULT NULL,
  `generalargs` varchar(150) DEFAULT NULL,
  `inputnum` varchar(10) DEFAULT NULL,
  `gotoivrnumber` varchar(50) DEFAULT NULL,
  `gotoivractid` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxIvrMenmu`
--

DROP TABLE IF EXISTS `pbxIvrMenmu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxIvrMenmu` (
  `id` varchar(100) NOT NULL,
  `ivrname` varchar(50) DEFAULT NULL,
  `description` varchar(150) DEFAULT NULL,
  `cretime` varchar(50) DEFAULT NULL,
  `isreadonly` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxLocalNumber`
--

DROP TABLE IF EXISTS `pbxLocalNumber`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxLocalNumber` (
  `id` varchar(100) NOT NULL,
  `localtype` varchar(50) DEFAULT NULL,
  `assign` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxLostCall`
--

DROP TABLE IF EXISTS `pbxLostCall`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxLostCall` (
  `id` varchar(100) NOT NULL,
  `extension` varchar(50) DEFAULT NULL,
  `lostnumber` varchar(50) DEFAULT NULL,
  `lostType` varchar(50) DEFAULT NULL,
  `reback` varchar(50) DEFAULT NULL,
  `certime` varchar(50) DEFAULT NULL,
  `backtime` varchar(50) DEFAULT NULL,
  `whoback` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxMobileCode`
--

DROP TABLE IF EXISTS `pbxMobileCode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxMobileCode` (
  `id` varchar(100) NOT NULL,
  `haoduan` varchar(10) DEFAULT NULL,
  `number7` varchar(20) DEFAULT NULL,
  `server` varchar(50) DEFAULT NULL,
  `sheng` varchar(50) DEFAULT NULL,
  `shi` varchar(50) DEFAULT NULL,
  `quhao` varchar(50) DEFAULT NULL,
  `youbian` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxQueue`
--

DROP TABLE IF EXISTS `pbxQueue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxQueue` (
  `id` varchar(100) NOT NULL,
  `queuename` varchar(50) DEFAULT NULL,
  `announce` varchar(50) DEFAULT NULL,
  `playring` int(11) DEFAULT NULL,
  `saymember` int(11) DEFAULT NULL,
  `queuetimeout` int(11) DEFAULT NULL,
  `failedon` varchar(50) DEFAULT NULL,
  `members` varchar(200) DEFAULT NULL,
  `strategy` varchar(50) DEFAULT NULL,
  `wrapuptime` int(11) DEFAULT NULL,
  `timeout` int(11) DEFAULT NULL,
  `musicclass` varchar(50) DEFAULT NULL,
  `retry` int(11) DEFAULT NULL,
  `joinempty` varchar(50) DEFAULT NULL,
  `frequency` int(11) DEFAULT NULL,
  `cretime` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxRcordFile`
--

DROP TABLE IF EXISTS `pbxRcordFile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxRcordFile` (
  `id` varchar(100) NOT NULL,
  `filename` varchar(50) DEFAULT NULL,
  `extname` varchar(50) DEFAULT NULL,
  `filesize` int(11) DEFAULT NULL,
  `calltype` varchar(50) DEFAULT NULL,
  `cretime` varchar(255) DEFAULT NULL,
  `extennum` varchar(50) DEFAULT NULL,
  `folder` varchar(50) DEFAULT NULL,
  `callnumber` varchar(50) DEFAULT NULL,
  `doymicac` varchar(50) DEFAULT NULL,
  `lable` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxRouter`
--

DROP TABLE IF EXISTS `pbxRouter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxRouter` (
  `id` varchar(100) NOT NULL,
  `proirety` int(11) DEFAULT NULL,
  `createmode` varchar(10) DEFAULT NULL,
  `routerline` varchar(10) DEFAULT NULL,
  `routername` varchar(100) DEFAULT NULL,
  `optextra` varchar(50) DEFAULT NULL,
  `lastwhendone` varchar(10) DEFAULT NULL,
  `callergroup` varchar(50) DEFAULT NULL,
  `callerid` varchar(200) DEFAULT NULL,
  `callerlen` int(11) DEFAULT NULL,
  `callednum` varchar(50) DEFAULT NULL,
  `calledlen` int(11) DEFAULT NULL,
  `replacecallerid` varchar(50) DEFAULT NULL,
  `replacecalledtrim` int(11) DEFAULT NULL,
  `replacecalledappend` varchar(50) DEFAULT NULL,
  `processmode` varchar(50) DEFAULT NULL,
  `processdefined` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxScreenPop`
--

DROP TABLE IF EXISTS `pbxScreenPop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxScreenPop` (
  `id` varchar(100) NOT NULL,
  `callernumber` varchar(50) DEFAULT NULL,
  `callednumber` varchar(50) DEFAULT NULL,
  `sessionnumber` varchar(50) DEFAULT NULL,
  `updatetime` varchar(255) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `routerdype` int(11) DEFAULT NULL,
  `parked` varchar(50) DEFAULT NULL,
  `poptype` varchar(50) DEFAULT NULL,
  `extensionnumber` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxSounds`
--

DROP TABLE IF EXISTS `pbxSounds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxSounds` (
  `id` varchar(100) NOT NULL,
  `filename` varchar(50) DEFAULT NULL,
  `extname` varchar(50) DEFAULT NULL,
  `folder` varchar(50) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  `label` varchar(50) DEFAULT NULL,
  `associate` varchar(50) DEFAULT NULL,
  `isreadonly` int(11) DEFAULT NULL,
  `cretime` varchar(50) DEFAULT NULL,
  `args` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pbxTrunk`
--

DROP TABLE IF EXISTS `pbxTrunk`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pbxTrunk` (
  `id` varchar(100) NOT NULL,
  `trunkname` varchar(50) DEFAULT NULL,
  `trunkproto` varchar(50) DEFAULT NULL,
  `trunkprototype` varchar(50) DEFAULT NULL,
  `trunkdevice` varchar(50) DEFAULT NULL,
  `memo` varchar(100) DEFAULT NULL,
  `cretime` varchar(50) DEFAULT NULL,
  `args` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(100) NOT NULL,
  `sid` varchar(255) DEFAULT NULL,
  `expires` datetime DEFAULT NULL,
  `session` text,
  PRIMARY KEY (`id`),
  KEY `sid` (`sid`(191)),
  KEY `expires` (`expires`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-09-03 10:43:04
