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
-- Dumping data for table `manageMenmuGroup`
--

LOCK TABLES `manageMenmuGroup` WRITE;
/*!40000 ALTER TABLE `manageMenmuGroup` DISABLE KEYS */;
INSERT INTO `manageMenmuGroup` VALUES ('1','客户服务','2014-08-28 14:35:27'),('2','客户管理','2014-08-28 14:35:35'),('3','协作办公','2014-08-28 14:35:43'),('4','市场活动','2014-08-28 14:35:52'),('5','文档中心','2014-08-28 14:35:59'),('6','个人管理','2014-08-28 14:36:06'),('7','系统管理','2014-08-28 14:35:03'),('8','PBX管理','2014-08-28 14:34:56');
/*!40000 ALTER TABLE `manageMenmuGroup` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-09-03 10:49:36
