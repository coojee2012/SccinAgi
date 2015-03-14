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
-- Dumping data for table `pbxExtension`
--

LOCK TABLES `pbxExtension` WRITE;
/*!40000 ALTER TABLE `pbxExtension` DISABLE KEYS */;
INSERT INTO `pbxExtension` VALUES ('8001','8001','8001','SIP','8001','=dynamic&=yes&=2000&=&=1&secret=8001',0,'','off','default','2014-04-23 10:34:49'),('8002','8002','8002','SIP','8002','=dynamic&=no&=2000&=&=1&secret=8002',0,'','off','default','2014-04-23 10:35:11'),('8003','8003','8003','SIP','8003','=dynamic&=no&=2000&=&=1&secret=8003',0,'','off','default','2014-04-24 10:00:57'),('8004','8004','8004','SIP','8004','=dynamic&=no&=2000&=&=1&secret=8004',0,'','off','default','2014-04-24 10:01:16'),('8005','8005','8005','SIP','8005','host=dynamic&nat=no&keepalive=2000&setvar=&call-limit=&secret=8005',0,'','off','default','2014-08-28 14:28:03'),('8801','8801','8801','IAX2','8801','=dynamic&=4569&=no&=&secret=8801',0,'','off','default','2014-04-29 10:28:28');
/*!40000 ALTER TABLE `pbxExtension` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-09-03 11:00:36
