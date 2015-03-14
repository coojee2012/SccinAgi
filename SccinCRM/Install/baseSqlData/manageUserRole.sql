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
-- Dumping data for table `manageUserRole`
--

LOCK TABLES `manageUserRole` WRITE;
/*!40000 ALTER TABLE `manageUserRole` DISABLE KEYS */;
INSERT INTO `manageUserRole` VALUES ('0','系统管理员','1',0,'2014-03-07 00:59:47','2014-03-07 00:59:47','拥有最大权限！'),('1','坐席员','1',0,'2014-03-07 00:59:47','2014-03-07 00:59:47','负责产品开发及系统维护！'),('2','销售员','1',0,'2014-03-07 00:59:47','2014-03-07 00:59:47','负责市场开拓及销售！'),('3','技术员','0',0,'2014-03-07 00:59:47','2014-03-07 00:59:47','负责客服服务！'),('4','产品经理','0',0,'2014-03-07 00:59:47','2014-03-07 00:59:47','负责客服服务！'),('5','销售经理','0',0,'2014-03-07 00:59:47','2014-03-07 00:59:47','负责客服服务！'),('551b04c2-a790-1294-d9bc-a20c59be46f4','11111','否',2,'2014-03-11 08:16:15','2014-03-11 08:25:54','111'),('b8927102-d64f-233a-d498-ed93a4603f8e','测试角色','是',6,'2014-03-11 08:08:43','2014-03-11 08:26:22','这是个测试的角色1');
/*!40000 ALTER TABLE `manageUserRole` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-09-03 10:48:31
