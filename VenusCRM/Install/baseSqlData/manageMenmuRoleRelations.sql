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
-- Dumping data for table `manageMenmuRoleRelations`
--

LOCK TABLES `manageMenmuRoleRelations` WRITE;
/*!40000 ALTER TABLE `manageMenmuRoleRelations` DISABLE KEYS */;
INSERT INTO `manageMenmuRoleRelations` VALUES ('104f865c-50d1-4c4c-566b-d5bf3ca0057a','0','73','2014-08-28 14:39:04'),('12255a15-60cb-c130-de30-ea6433b76b57','0','74','2014-08-28 14:39:04'),('16bdeb25-a88a-3169-427d-50ea4f5e250e','0','85','2014-08-28 14:39:04'),('243e0ab8-33ad-15a2-b1e0-1dc181d15647','0','84','2014-08-28 14:39:04'),('36f6c920-d5b2-3fc5-67a2-51b8708ef69e','0','70','2014-08-28 14:39:04'),('756c0636-b0ec-0554-1719-dad56e02f266','0','81','2014-08-28 14:39:04'),('a6023680-9080-2f1a-4f28-f523706d2636','0','87','2014-08-28 14:39:04'),('cd1dcad7-66e6-667d-aa9d-2c777ae74b3b','0','71','2014-08-28 14:39:04'),('e0ba69ef-833f-d794-0dd6-c88868a3fc8c','0','82','2014-08-28 14:39:04'),('e451f574-d67b-4573-378d-0543f06eb975','0','72','2014-08-28 14:39:04'),('e8f1c5ce-ae08-e65e-c07a-5c796ad5a336','0','80','2014-08-28 14:39:04'),('f6c2bb88-d8e4-61c6-0a87-8f9672eed59d','0','86','2014-08-28 14:39:04'),('fa40fb26-dff3-5b08-7ef0-82528ceee8d4','0','83','2014-08-28 14:39:04');
/*!40000 ALTER TABLE `manageMenmuRoleRelations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-09-03 10:49:14
