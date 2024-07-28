-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 28 Lip 2024, 23:00
-- Wersja serwera: 10.4.22-MariaDB
-- Wersja PHP: 8.0.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `messenger`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `chats`
--

CREATE TABLE `chats` (
  `chatid` varchar(255) NOT NULL,
  `name` varchar(30) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `author` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Zrzut danych tabeli `chats`
--

INSERT INTO `chats` (`chatid`, `name`, `password`, `author`) VALUES
('27553312538240', 'sadas', '', 'lol12312'),
('27553313773376', 'deasfeaf', '', 'lol12312'),
('27553416846720', 'Chat 1', '$2b$10$ZbRmmAm3m3FGwWn64edKiOmnrBGU0DiNf9npmmgX6ZD8VGxZupRBO', 'lol12312');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `messages`
--

CREATE TABLE `messages` (
  `sender` varchar(18) NOT NULL,
  `message` varchar(999) NOT NULL,
  `messageid` varchar(100) NOT NULL,
  `chatid` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Zrzut danych tabeli `messages`
--

INSERT INTO `messages` (`sender`, `message`, `messageid`, `chatid`) VALUES
('repix', 'df', '1722075150804', '27552349243184'),
('repix', 'as', '1722075150965', '27552349243184'),
('repix', 'das', '1722075151111', '27552349243184'),
('repix', 'das', '1722075151273', '27552349243184'),
('repix', 'ads', '1722075151540', '27552349243184'),
('repix', 'okej lets go', '1722076318951', '27553221033424'),
('lol12312', 'Siema', '1722081716121', '27553307403456'),
('lol12312', 'sdaas', '1722081716727', '27553307403456'),
('lol12312', 'das', '1722081717109', '27553307403456'),
('lol12312', 'das', '1722081733837', '27553307702944'),
('lol12312', 'dasdas', '1722081884456', '27553310121856'),
('lol12312', 'swdfew', '1722081885575', '27553310121856'),
('lol12312', 'dsadas', '1722081911043', '27553310546272'),
('lol12312', 'ewefrg', '1722081911970', '27553310546272'),
('lol12312', 'dsa', '1722082036109', '27553312538240'),
('lol12312', 'sdsadas', '1722082112548', '27553313773376'),
('lol12312', 'rfgedg', '1722082113476', '27553313773376'),
('lol12312', 'ok', '1722088554953', '27553416846720'),
('lol12312', 'lollllllll', '1722088676263', '27553416846720'),
('repix', 'witam', '1722088808175', '27553312538240'),
('repix', 'a tutaj chyba cos dziala ????', '1722088831199', '27553416846720');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Zrzut danych tabeli `users`
--

INSERT INTO `users` (`id`, `login`, `password`) VALUES
(1, 'Sigma', '$2y$10$FISP.BrmVrMhvTUuNFc74O1G5540VZAuS//83BmJxyuy3r68cbuoK'),
(5, 'Repix', '$2y$10$9kTTsocObYoqIYiKTN6ih.TkKPtPurqdW5vXSxa8ishOqKHDBma7y'),
(6, 'Witek', '$2y$10$IQ366hjVykUbCyPp5G1hyerSprCZ3SpcMslfieuQIJUDhejGeVgR2'),
(7, 'siema', '$2y$10$R6bBpQsoKtbGAm6EO/sImOPvqiVPNuKbgGazhjSDGUjyZJR3q9pGa'),
(8, 'sigma123', '$2y$10$gEqQcfd7b/baVG2Swx2gSu5Jcinr2xH6SjkUR5HJg/DkBaVBiN8CC'),
(9, 'sigma1233', '$2y$10$sbtNpbuOd9c1tpWKQLVoyeWGbREedACSkqPUSj8bGAWy3Z9OV51F.'),
(10, 'rel', '$2y$10$hdeMckWaqf9LlPIQ6ns3J.RnSvcoFEhbAetboiFLCER22YsFYkFvW'),
(11, 'Pedal', '$2y$10$s0DkZvph3JS2f8ejcKsfVu7P6/jEbF93RmK.C9yNhP5ozKcSvLSY6'),
(12, 'oskar', '$2y$10$hgn6fhivQ10au6RXW0T3gevZKwqN6VsG0p679nVcsNlrYBwKcDNoK'),
(13, 'Repix12', '$2y$10$oXmEATh/E5P7D1686wLkr.btr9fhg3a4r1ySPVhjpWnVF3KDmQKPO'),
(14, 'Repix123', '$2y$10$Nh5359BcnLKf0LFJRFSrSObvzwQQ3SL1qMOxtqIr2Hq/o2YOmVZD6'),
(15, 'Skibidi', '$2y$10$AgitsA3OJAl63zIE6k93Ven0ROGoNjZddp5F19a14F8E9wwQzvv/e'),
(16, 'rrrrrrrrrrrrrrrr', '$2y$10$SXyo5W9X5k4Fj/0UaNjyb./YS1eI5wysdP2ozMSQqfFyuS0lB5pd6'),
(17, 'Kacper', '$2y$10$0xmpBc0DvMBraAAYz2Omiu2spsXms.kmEej3jJEE7l8.sENynVpiq'),
(18, 'lol', '$2y$10$7ZtCSgFiyOM/QzBDTgXNF.vcwUumC5lGqT97rmTu65aHJBdJEjaMW'),
(19, 'lol sigma', '$2y$10$glJsKQwML0EgkJs9JZFouuDiiINf0FmwkmoD6ROLq0ORa7Sz.GrgC'),
(20, 'repixv2', '$2y$10$c6nv/M5cCxraOZ1FE2Dud.223TKcKJgnvE8Tqdzih1hl8g9dVHhCK'),
(21, 'wierzbatocwel', '$2y$10$bGrgDKMQNhjbbRsgNGXFxOesuqG3RknTGP.oCmed6cFqXZZSKnTl2'),
(22, 'lol12312', '$2y$10$ektUFTfaG86hIkVWMb2gJefjBGVMIL2x0LE1H.g2l5SfTQdNwoQla');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`chatid`),
  ADD KEY `chatid` (`chatid`);

--
-- Indeksy dla tabeli `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageid`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT dla zrzuconych tabel
--

--
-- AUTO_INCREMENT dla tabeli `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
