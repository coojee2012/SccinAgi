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
-- Dumping data for table `pbxAutoMonitorWays`
--

LOCK TABLES `pbxAutoMonitorWays` WRITE;
/*!40000 ALTER TABLE `pbxAutoMonitorWays` DISABLE KEYS */;
INSERT INTO `pbxAutoMonitorWays` VALUES (1,'queue','否','否','是','按条数',100,'8001,8002,8003,8004',NULL),(2,'dialout','是','否','否','按条数',100,'8001,8002,8003,8004',NULL),(3,'diallocal','是','是','是','按时间',100,'8001,8002,8003,8004,8801',NULL);
/*!40000 ALTER TABLE `pbxAutoMonitorWays` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-09-03 10:54:08
