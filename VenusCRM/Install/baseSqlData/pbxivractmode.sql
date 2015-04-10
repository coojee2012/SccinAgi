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
-- Dumping data for table `pbxIvrActMode`
--

LOCK TABLES `pbxIvrActMode` WRITE;
/*!40000 ALTER TABLE `pbxIvrActMode` DISABLE KEYS */;
INSERT INTO `pbxIvrActMode` VALUES ('1','播放语音','/images/ivr/pi206.png','','read'),('10','拨打号码','/images/ivr/11.png','','control'),('11','跳转到语音信箱','/images/ivr/pi447.png','','record'),('12','跳转到IVR菜单','/images/ivr/17.png','','control'),('13','WEB交互接口','/images/ivr/43.png','','control'),('14','AGI扩展接口','/images/ivr/91.png','','control'),('15','等待几秒','/images/ivr/pi237.png','','control'),('16','播放音调','/images/ivr/73.png','','read'),('17','读出数字字符','/images/ivr/19-2.png','','read'),('18','通道阀','/images/ivr/pi305.png','','check'),('19','黑名单','/images/ivr/16gray.png','','check'),('2','检查号码归属地','/images/ivr/newstyle-edit-find.png','','check'),('20','变量判断','/images/ivr/52.png',NULL,'control'),('3','发起录音','/images/ivr/pi401.png','','record'),('4','播放录音','/images/ivr/microphone.png','','read'),('5','录制数字字符','/images/ivr/media-record.png','','record'),('6','数字方式读出','/images/ivr/pi402.png','','read'),('7','读出日期时间','/images/ivr/pi125.png','','read'),('8','检测日期','/images/ivr/pi126.png','','check'),('9','主叫变换','/images/ivr/system-run.png','','control'),('99','挂机','/images/ivr/01.png',NULL,'control');
/*!40000 ALTER TABLE `pbxIvrActMode` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-09-03 10:53:42
