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
-- Dumping data for table `manageMenmus`
--

LOCK TABLES `manageMenmus` WRITE;
/*!40000 ALTER TABLE `manageMenmus` DISABLE KEYS */;
INSERT INTO `manageMenmus` VALUES ('70','菜单管理','/manage/Menmus','pc.png','7','2014-03-07 00:59:47',960,540,0),('71','菜单分组管理','/manage/MenmuGroup','pc.png','7','2014-03-07 00:59:47',960,540,0),('72','用户管理','/manage/UserInfo','pc.png','7','2014-03-07 00:59:47',960,540,0),('73','角色管理','/manage/UserRole','pc.png','7','2014-03-07 00:59:47',960,540,0),('74','部门管理','/manage/Departments','pc.png','7','2014-03-07 00:59:47',960,540,0),('80','分机管理','/pbx/Extension','pc.png','8','2014-03-07 00:59:47',960,540,0),('81','分机分组管理','/pbx/ExtenGroup','pc.png','8','2014-03-07 00:59:47',960,540,0),('82','队列管理','/pbx/Queue','pc.png','8','2014-03-07 00:59:47',960,540,0),('83','设备管理','/pbx/Card','pc.png','8','2014-03-07 00:59:47',960,540,0),('84','中继管理','/pbx/Trunk','pc.png','8','2014-03-07 00:59:47',960,540,0),('85','IVR管理','/pbx/ivrMenmu','pc.png','8','2014-03-07 00:59:47',NULL,NULL,0),('86','呼入规则','/pbx/routerCallIn','pc.png','8','2014-03-07 00:59:47',NULL,NULL,0),('87','呼出规则','/pbx/routerCallOut','pc.png','8','2014-03-07 00:59:47',NULL,NULL,0),('bf0d1f8c-923f-6bac-da33-7de721c4df4f','话务统计','/pbx/dycharts/agentCalls','tj4.png','1','2014-08-28 17:04:28',768,1024,0),('d144fed7-f85f-37c4-ec61-b5769d06296d','系统语音','/pbx/Sounds','dna.png','8','2014-08-28 16:52:50',768,1024,0),('fb8aee86-4ca0-9500-69c3-ca0f63bafe99','录音管理','/pbx/RecordFile','music.png','8','2014-08-28 16:54:19',768,1024,0),('fcbd7cc7-5b31-fbb0-636d-4ce0f8ebeb7f','线路监控','/pbx/LineMonitor','dna.png','1','2014-08-28 16:59:31',768,1024,0);
/*!40000 ALTER TABLE `manageMenmus` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-09-03 10:48:54
