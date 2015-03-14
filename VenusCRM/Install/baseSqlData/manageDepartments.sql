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
-- Dumping data for table `manageDepartments`
--

LOCK TABLES `manageDepartments` WRITE;
/*!40000 ALTER TABLE `manageDepartments` DISABLE KEYS */;
INSERT INTO `manageDepartments` VALUES ('1','技术部','2014-03-07 00:59:47','2014-03-07 00:59:47','负责产品开发及系统维护！'),('2','市场部','2014-03-07 00:59:47','2014-03-07 00:59:47','负责市场开拓及销售！'),('3','客服部','2014-03-07 00:59:47','2014-03-07 00:59:47','负责客服服务！'),('b43a189b-6479-b545-7454-408847afd1da','测试部门','2014-03-11 03:22:20','2014-03-11 03:38:59','测试4444');
/*!40000 ALTER TABLE `manageDepartments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-09-03 10:49:55
