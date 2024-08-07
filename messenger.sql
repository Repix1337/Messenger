-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 07 Sie 2024, 03:13
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
  `chatid` varchar(255) NOT NULL,
  `imagePath` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Zrzut danych tabeli `messages`
--

INSERT INTO `messages` (`sender`, `message`, `messageid`, `chatid`, `imagePath`) VALUES
('repix', 'xd', '1722993131814', '27553312538240', 'uploads/35f8da9f-5f3a-4a19-8c42-acc3654d839f_pobrane.jpg'),
('repix', 'Moja reakcja', '1722993139695', '27553312538240', NULL),
('repix', 'rel', '1722993140653', '27553312538240', NULL),
('repix', 'big', '1722993144771', '27553312538240', NULL);

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
